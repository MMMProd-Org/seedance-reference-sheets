"""Smoke test for the built page. See docs/BUILD.md for how to build and run it.

Optional argument: path to another built page (used to check the test fails on a bad build).
"""

import pathlib
import re
import sys

from playwright.sync_api import expect, sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
page_path = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "new" / "merged.html"

# Visible strings that are the same in French and English.
SAME_IN_BOTH = {
    "Afro", "Aluminium", "Auburn", "Bandana", "Beige", "Blazer", "Blond", "Cargo", "Cellulite", "Dad bod",
    "Dark", "Denim", "Description", "Dreadlocks", "Format", "Imperfections", "Long", "Moustache",
    "Musculature", "Musculature (volume)", "Nude", "Parka", "Smoky", "Style", "T-shirt", "Texture",
    "Twists", "Type", "Undercut", "Visible",
}
NEUTRAL = re.compile(r"^(GPT Image 2\.5|Seedream 5\.0|Seedance 2\.5|Auto|Photo|3D|2D|Animal|Français|English|Sources|\?|[\d\s.,:/%×+\-–—()·]+)$")
TEXTS = """() => {
  const out = new Set(), skip = new Set(["PRE", "CODE", "TEXTAREA", "SCRIPT", "STYLE"]);
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = w.nextNode()); ) {
    let p = n.parentElement;
    while (p && !skip.has(p.tagName)) p = p.parentElement;
    if (!p && n.nodeValue.trim()) out.add(n.nodeValue.trim());
  }
  document.querySelectorAll("[placeholder],[aria-label],[title]").forEach((e) =>
    ["placeholder", "aria-label", "title"].forEach((a) => e.getAttribute(a) && out.add(e.getAttribute(a).trim())));
  return [...out];
}"""


def set_lang(page, label, code):
    page.get_by_role("radio", name=label, exact=True).click()
    page.wait_for_function(f"document.documentElement.lang === '{code}'")


def untranslated(page, where, found):
    """Record visible strings left identical after switching the interface to French."""
    en = set(page.evaluate(TEXTS))
    set_lang(page, "Français", "fr")
    fr = set(page.evaluate(TEXTS))
    set_lang(page, "English", "en")
    for text in en & fr:
        if re.search(r"[A-Za-zÀ-ÿ]{3,}", text) and text not in SAME_IN_BOTH and not NEUTRAL.match(text):
            found.setdefault(text, where)


with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    # Serve fonts empty so the test does not depend on Google Fonts being reachable.
    page.route(re.compile(r"^https://fonts\.(googleapis|gstatic)\.com/"), lambda route: route.fulfill(body=""))
    errors = []
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    page.on("console", lambda m: m.type == "error" and errors.append(f"console: {m.text}"))
    page.goto(page_path.resolve().as_uri())
    page.wait_for_timeout(1000)  # window for asynchronous page errors

    assert not errors, errors
    assert page.evaluate("document.documentElement.lang") == "en", "page must open in English"
    assert page.title() == "Seedance Reference Sheets", page.title()

    page.get_by_role("button", name="Show the prompt").first.click()
    prompt = page.locator("pre").first.inner_text()
    assert len(prompt) > 200 and "16:9" in prompt, f"no prompt shown: {prompt[:120]!r}"

    found = {}
    for model in ["GPT Image 2.5", "Seedream 5.0"]:
        page.get_by_role("radio", name=model, exact=True).click()
        for subject in ["Person", "Animal", "Object"]:
            page.get_by_role("radio", name=subject, exact=True).click()
            tabs = page.get_by_role("tab")
            for i in range(tabs.count()):
                tabs.nth(i).click()
                expect(tabs.nth(i)).to_have_attribute("aria-selected", "true")
                untranslated(page, f"{model} / {subject} / {tabs.nth(i).inner_text()}", found)
            if subject == "Person":
                tabs.first.click()
                page.get_by_text("Man", exact=True).click()
                untranslated(page, f"{model} / Person / Man", found)
                page.get_by_text("Woman", exact=True).click()
            if model == "GPT Image 2.5" and subject != "Object":
                tabs.first.click()
                several = page.get_by_text(re.compile(r"^Several (characters|animals) in the same GPT conversation"))
                several.click()
                untranslated(page, f"{model} / {subject} / several, no name", found)
                name = page.get_by_label("Character name")
                name.fill("Q7")  # one letter: never reported as untranslated
                untranslated(page, f"{model} / {subject} / several, named", found)
                name.fill("")
                several.click()
            page.get_by_role("button", name=re.compile(r"^New (character|animal|object)$")).click()
            untranslated(page, f"{model} / {subject} / reset confirmation", found)
    assert not found, "untranslated: " + "; ".join(f"{t!r} ({w})" for t, w in sorted(found.items()))
    assert not errors, errors

    browser.close()

print("smoke test passed")
