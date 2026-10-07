"""Golden test for the generated prompts. See docs/BUILD.md.

    python tests/golden_prompts.py             # compare with tests/golden/prompts.json
    python tests/golden_prompts.py --update    # rewrite it after an intended prompt change

Optional argument: path to another built page.
"""

import json
import pathlib
import re
import sys

from playwright.sync_api import expect, sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
GOLDEN = ROOT / "tests" / "golden" / "prompts.json"
update = "--update" in sys.argv[1:]
paths = [a for a in sys.argv[1:] if a != "--update"]
page_path = pathlib.Path(paths[0]) if paths else ROOT / "new" / "merged.html"

# Fixed randomness and clock, so the default random face is the same on every run.
SEED = """(() => {
  let a = 123456789;
  Math.random = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  Date.now = () => 1790000000000;
})()"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.route(re.compile(r"^https://fonts\.(googleapis|gstatic)\.com/"), lambda route: route.fulfill(body=""))
    page.add_init_script(SEED)
    page.goto(page_path.resolve().as_uri())

    prompts = {}
    for model in ["GPT Image 2.5", "Seedream 5.0"]:
        page.get_by_role("radio", name=model, exact=True).click()
        for subject in ["Person", "Animal", "Object"]:
            radio = page.get_by_role("radiogroup", name="Type").get_by_role("radio", name=subject, exact=True)
            radio.click()
            expect(radio).to_be_checked()
            show = page.get_by_role("button", name="Show the prompt")
            for _ in range(show.count()):  # each click turns one button into "Hide the prompt"
                show.first.click()
            prompts[f"{model} / {subject}"] = page.locator("pre").all_inner_texts()
    browser.close()

if update:
    GOLDEN.parent.mkdir(parents=True, exist_ok=True)
    GOLDEN.write_text(json.dumps(prompts, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"golden prompts updated: {sum(map(len, prompts.values()))} prompts")
    sys.exit(0)

golden = json.loads(GOLDEN.read_text(encoding="utf-8"))
diffs = []
for state in sorted(set(golden) | set(prompts)):
    want, got = golden.get(state, []), prompts.get(state, [])
    if len(want) != len(got):
        diffs.append(f"{state}: {len(got)} prompts, expected {len(want)}")
        continue
    for i, (w, g) in enumerate(zip(want, got)):
        if w != g:
            line = next(n for n, (a, b) in enumerate(zip(w.splitlines() + [""], g.splitlines() + [""])) if a != b)
            diffs.append(f"{state}, prompt {i + 1}, line {line + 1}: {g.splitlines()[line][:120] if line < len(g.splitlines()) else '<end>'!r}")
assert not diffs, "prompts changed (run with --update only if intended):\n" + "\n".join(diffs)
print(f"golden prompts match: {sum(map(len, prompts.values()))} prompts")
