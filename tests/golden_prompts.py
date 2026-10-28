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

# Fixed randomness, so the default random face is the same on every run.
SEED = """(() => {
  let a = 123456789;
  Math.random = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})()"""

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.route(re.compile(r"^https://fonts\.(googleapis|gstatic)\.com/"), lambda route: route.fulfill(body=""))
    page.add_init_script(SEED)
    page.goto(page_path.resolve().as_uri())

    prompts, unsupported = {}, set()
    for model in ["GPT Image 2.5", "Seedream 5.0"]:
        page.get_by_role("radio", name=model, exact=True).click()
        for subject in ["Person", "Animal", "Object"]:
            radio = page.get_by_role("radiogroup", name="Type").get_by_role("radio", name=subject, exact=True)
            radio.click()
            expect(radio).to_be_checked()
            show = page.get_by_role("button", name="Show the prompt")
            for _ in range(show.count()):  # each click turns one button into "Hide the prompt"
                show.first.click()
            texts = page.locator("pre").all_inner_texts()
            if not texts:  # a case Seedream cannot do yet shows one card that says so, and no prompt
                expect(page.get_by_text("Not available with Seedream yet", exact=True)).to_be_visible()
                unsupported.add(f"{model} / {subject}")
            prompts[f"{model} / {subject}"] = texts
    # Fresh contexts keep the established adult/animal/object sequence unchanged.
    for model, code in [("GPT Image 2.5", "gpt"), ("Seedream 5.0", "seedream")]:
        for subject in ("Child", "Baby"):
            page = browser.new_page(viewport={"width": 1440, "height": 1000})
            page.route(re.compile(r"^https://fonts\.(googleapis|gstatic)\.com/"), lambda route: route.fulfill(body=""))
            page.add_init_script(SEED)
            state = {"model": code, "modelPick": 1, "mode": "person", "child": True, "baby": subject == "Baby", "uiLang": "en"}
            page.add_init_script("localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify(" + json.dumps(state) + "));")
            page.goto(page_path.resolve().as_uri())
            page.locator("header").wait_for()
            show = page.get_by_role("button", name="Show the prompt", exact=True)
            for _ in range(show.count()):
                show.first.click()
            texts = page.locator("pre").all_text_contents()
            assert len(texts) == (1 if subject == "Baby" else 2) and all(texts), (model, subject)
            prompts[f"{model} / {subject}"] = texts
            page.close()
    # A place (v137: its own type, a house, an interior or an outdoor location), from a fresh page: its default prompts.
    for model, code in [("GPT Image 2.5", "gpt"), ("Seedream 5.0", "seedream")]:
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        page.route(re.compile(r"^https://fonts\.(googleapis|gstatic)\.com/"), lambda route: route.fulfill(body=""))
        page.add_init_script(SEED)
        state = {"model": code, "modelPick": 1, "uiLang": "en"}
        page.add_init_script("localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify(" + json.dumps(state) + "));")
        page.goto(page_path.resolve().as_uri())
        radio = page.get_by_role("radiogroup", name="Type").get_by_role("radio", name="Place", exact=True)
        radio.click()
        expect(radio).to_be_checked()
        show = page.get_by_role("button", name="Show the prompt", exact=True)
        for _ in range(show.count()):
            show.first.click()
        texts = page.locator("pre").all_text_contents()
        assert texts and all(texts), (model, "Place")
        prompts[f"{model} / Place"] = texts
        page.close()
    browser.close()

empty = [state for state, texts in prompts.items() if not texts and state not in unsupported]
assert not empty, f"no prompt collected for: {empty}"

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
            k = next((k for k, (a, b) in enumerate(zip(w, g)) if a != b), min(len(w), len(g)))
            diffs.append(f"{state}, prompt {i + 1}, char {k}: expected {w[k:k + 80]!r}, got {g[k:k + 80]!r}")
assert not diffs, "prompts changed (run with --update only if intended):\n" + "\n".join(diffs)
print(f"golden prompts match: {sum(map(len, prompts.values()))} prompts")
