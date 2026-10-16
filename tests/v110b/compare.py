"""Compare the owner's five fixed-state grids against two built pages.

Usage: python tests/v110b/compare.py baseline.html candidate.html /tmp/report-directory
Results are review evidence, never automatically accepted golden fixtures.
"""

import asyncio
import difflib
import json
import pathlib
import sys

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).parent
KEY = "fiche-perso-seedance-v1"
SEED = """(() => { let s = 12345; Math.random = () => {
  s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648;
}; })();"""


async def capture(browser, html, states):
    results = [None] * len(states)

    async def worker(offset):
        context = await browser.new_context(viewport={"width": 1440, "height": 1000})
        page = await context.new_page()
        page.set_default_timeout(10000)
        await page.route("**/*", lambda r: r.continue_() if r.request.url.startswith("file:") else r.fulfill(body=""))
        await page.add_init_script(SEED)
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        await page.goto(html.as_uri())
        for index in range(offset, len(states), 6):
            await page.evaluate("([k,s]) => localStorage.setItem(k, JSON.stringify(s))", [KEY, states[index]])
            await page.reload()
            await page.locator("header").wait_for()
            buttons = page.get_by_role("button", name="Show the prompt", exact=True)
            for _ in range(await buttons.count()):
                await buttons.first.click()
            texts = await page.locator("pre").all_text_contents()
            assert texts, (index, "no prompt")
            for i, text in enumerate(texts):
                if not text.strip():
                    pre = page.locator("pre").nth(i)
                    assert await pre.get_attribute("data-out") == "iter", (index, i, "empty prompt")
                    assert await pre.locator("xpath=../..").get_by_role("button", name="Copy for Seedream 5.0", exact=True).is_disabled(), (index, "empty active edit")
            assert not errors, (index, errors)
            results[index] = texts
        await context.close()

    await asyncio.gather(*(worker(i) for i in range(6)))
    return results


async def main():
    before, after, output = (pathlib.Path(a).resolve() for a in sys.argv[1:])
    states = []
    counts = {}
    for path in sorted((ROOT / "grids").glob("*.json")):
        group = json.loads(path.read_text())
        counts[path.stem] = len(group)
        states.extend(dict(s, mode="person", modelPick=1, uiLang="en") for s in group)
    assert len(states) == 894, counts
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        old = await capture(browser, before, states)
        print("baseline: 894 states, no page errors, no empty active prompts", flush=True)
        new = await capture(browser, after, states)
        await browser.close()
    output.mkdir(parents=True, exist_ok=True)
    (output / "captures.json").write_text(json.dumps({"states": states, "before": old, "after": new}, ensure_ascii=False))
    diffs = []
    for i, (a, b) in enumerate(zip(old, new)):
        if a != b:
            diffs.append({"index": i, "state": states[i], "diff": list(difflib.unified_diff("\n\n".join(a).splitlines(), "\n\n".join(b).splitlines(), lineterm="", n=1))})
    (output / "differences.json").write_text(json.dumps(diffs, ensure_ascii=False, indent=2))
    print(json.dumps({"states": len(states), "grids": counts, "changed": len(diffs), "unchanged": len(states) - len(diffs), "page_errors": 0, "empty_active_prompts": 0}))


if __name__ == "__main__":
    asyncio.run(main())
