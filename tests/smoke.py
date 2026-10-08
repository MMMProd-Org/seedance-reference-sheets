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


def clipboard_page(browser, errors):
    """Open a fresh page whose clipboard writes wait until the test finishes them, in the order it chooses."""
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    page.route(re.compile(r"^https://fonts\.(googleapis|gstatic)\.com/"), lambda route: route.fulfill(body=""))
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    page.on("console", lambda m: m.type == "error" and errors.append(f"console: {m.text}"))
    page.goto(page_path.resolve().as_uri())
    page.evaluate(HOLD_CLIPBOARD)
    return page


HOLD_CLIPBOARD = "() => { window.writes = []; navigator.clipboard.writeText = () => new Promise((done) => window.writes.push(done)); }"
SAVED = "JSON.parse(localStorage.getItem('fiche-perso-seedance-v1') || '{}')"


def open_folds(page):
    page.evaluate("document.querySelectorAll('details').forEach((d) => (d.open = true))")


def prompts(page):
    """Open every fold and every prompt, then return the text of each prompt box."""
    open_folds(page)
    for _ in range(8):
        show = page.get_by_text("Show the prompt", exact=True)
        if not show.count():
            break
        show.first.click()
    return page.locator("pre").all_text_contents()


def set_slider(page, name, value):
    slider = page.get_by_role("slider", name=name, exact=True)
    slider.press("Home")
    for _ in range(value):
        slider.press("ArrowRight")


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

    page.get_by_text("Details and prompt", exact=True).first.click()
    prompt = page.locator("pre").first.inner_text()
    assert len(prompt) > 200 and "16:9" in prompt, f"no prompt shown: {prompt[:120]!r}"

    # Deselecting a retouch preset clears its text, so the Retouch card is disabled again.
    preset = page.get_by_role("button", name="Dress", exact=True)
    change = page.locator("#sd-iter")
    hint = page.get_by_text("Open “Other retouches” and pick or write a retouch.", exact=True)

    def open_retouches():  # picking a preset folds "Other retouches"
        if not page.locator("#sd-iter").is_visible():
            page.get_by_text("Other retouches", exact=True).click()

    open_retouches()
    expect(hint).to_be_visible()
    preset.click()
    expect(change).not_to_have_value("")
    expect(hint).to_be_hidden()
    open_retouches()
    expect(preset).to_have_attribute("aria-pressed", "true")
    preset.click()
    expect(change).to_have_value("")
    expect(hint).to_be_visible()
    open_retouches()
    expect(preset).to_have_attribute("aria-pressed", "false")

    # The retouch prompt no longer asks to keep a part the change touches, in English or French.
    retouch = page.locator('pre[data-out="iter"]')
    for text, kept, dropped in [
        ("sharper biceps and triceps", "the hips and legs", "the muscles"),
        ("élargir les hanches", "the muscles", "the hips and legs"),
        ("make her heavier", "the hips and legs", "the body's size, weight and proportions"),
        ("épaules plus larges", "the hips and legs", "the muscles"),
        ("musculature plus marquée", "the skin", "the muscles"),
        ("abdos plus marqués", "the skin", "the muscles"),
        ("effacer les marques", "the muscles", "the skin"),
        ("a bigger belly", "the hips and legs", "the muscles"),
        ("a flatter tummy", "the skin", "the muscles"),
        ("bigger breasts", "the glutes", "the body's size, weight and proportions"),
        ("make her curvier", "the muscles", "the body's size, weight and proportions"),
        ("a broader torso", "the glutes", "the bust's size, shape and hang"),
        # clothing words that share a stem with a body word must keep the body
        ("put her in skinny jeans", "the body's size, weight and proportions", "the outfit"),
        ("a bulky winter jacket", "the body's size, weight and proportions", "the outfit"),
        ("a curved neckline on the top", "the body's size, weight and proportions", "the outfit"),
        ("the skinniest jeans", "the body's size, weight and proportions", "the outfit"),
    ]:
        change.fill(text)
        expect(retouch).to_contain_text(kept)
        expect(retouch).not_to_contain_text(dropped)
    change.fill("")

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

    # Under 21, the retouch prompt calls a neutral subject an adult, as it does a woman or a man.
    young = browser.new_page(viewport={"width": 1440, "height": 1000})
    young.route(re.compile(r"^https://fonts\.(googleapis|gstatic)\.com/"), lambda route: route.fulfill(body=""))
    young.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    young.on("console", lambda m: m.type == "error" and errors.append(f"console: {m.text}"))
    young.add_init_script("localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({age: 18, pres: 'x'}))")
    young.goto(page_path.resolve().as_uri())
    young.locator("#sd-iter").fill("sharper biceps and triceps")
    expect(young.locator('pre[data-out="iter"]')).to_contain_text("sheet of this adult person")
    young.close()
    assert not errors, errors

    head_ok = re.compile(r"^Copied\. In Seedream, add the head sheet")

    # Two overlapping head copies: the one that finishes last must not store an older head signature.
    race = clipboard_page(browser, errors)
    copy = race.get_by_role("button", name="Copy for Seedream 5.0")
    head, body = copy.nth(0).element_handle(), copy.nth(1).element_handle()  # labels change to "Copied"
    head.click()
    race.get_by_text("Man", exact=True).click()
    head.click()
    race.wait_for_function("window.writes.length === 2")
    race.evaluate("() => window.writes[1]()")  # the newer copy finishes first
    race.evaluate("() => window.writes[0]()")
    body.click()
    race.wait_for_function("window.writes.length === 3")
    race.evaluate("() => window.writes[2]()")
    expect(race.get_by_text(head_ok)).to_be_visible()

    # A GPT head copy started meanwhile must not cancel a pending Seedream one: each model has its own head sheet.
    cross = clipboard_page(browser, errors)
    seedream = cross.get_by_role("button", name="Copy for Seedream 5.0")
    seedream.first.click()
    cross.get_by_role("radio", name="GPT Image 2.5", exact=True).click()
    cross.get_by_role("button", name="Copy for GPT Image 2.5").first.click()
    cross.wait_for_function("window.writes.length === 2")
    cross.evaluate("() => window.writes[0]()")
    cross.evaluate("() => window.writes[1]()")
    cross.get_by_role("radio", name="Seedream 5.0", exact=True).click()
    expect(seedream).to_have_count(3)  # the "Copied" labels are back
    seedream.nth(1).click()
    cross.wait_for_function("window.writes.length === 3")
    cross.evaluate("() => window.writes[2]()")
    expect(cross.get_by_text(head_ok)).to_be_visible()

    # For a headless body, "Combine head and body" is the default while the change is empty: a click fills it in.
    headless = clipboard_page(browser, errors)
    headless.get_by_role("tab", name=re.compile(r"^Body")).click()
    headless.get_by_text(re.compile(r"^Headless body sheet")).first.click()
    join = headless.get_by_role("button", name="Combine head and body", exact=True)
    if not headless.locator("#sd-iter").is_visible():  # a default preset folds "Other retouches"
        headless.get_by_text("Other retouches", exact=True).click()
    expect(join).to_have_attribute("aria-pressed", "true")
    join.click()
    expect(headless.locator("#sd-iter")).not_to_have_value("")

    # A head copy for another subject must not cancel a pending one: each subject keeps its own head sheet.
    subject = clipboard_page(browser, errors)
    subject.get_by_role("radio", name="GPT Image 2.5", exact=True).click()
    gpt = subject.get_by_role("button", name="Copy for GPT Image 2.5")
    gpt.first.click()
    subject.get_by_role("radio", name="Animal", exact=True).click()
    gpt.first.click()  # the animal sheet: the copy an animal's prompts build on
    subject.get_by_role("radio", name="Person", exact=True).click()
    subject.wait_for_function("window.writes.length === 2")
    subject.evaluate("() => window.writes[0]()")  # the Person copy finishes once back on Person
    subject.evaluate("() => window.writes[1]()")
    subject.get_by_text("Man", exact=True).click()  # after a head change, the prompts build on the copied head sheet
    expect(subject.get_by_text(re.compile(r"^Variant: the prompts reuse"))).to_be_visible()
    assert not errors, errors

    # The beauty level of the last copied GPT head survives a reload: changing it afterwards makes a new face.
    looks = clipboard_page(browser, errors)
    looks.get_by_role("radio", name="GPT Image 2.5", exact=True).click()
    looks.get_by_role("button", name="Copy for GPT Image 2.5").first.click()
    looks.wait_for_function("window.writes.length === 1")
    looks.evaluate("() => window.writes[0]()")
    looks.wait_for_function("JSON.parse(localStorage.getItem('fiche-perso-seedance-v1') || '{}').headSig")
    looks.reload()
    expect(looks.get_by_role("radio", name="GPT Image 2.5", exact=True)).to_be_checked()
    variant = looks.get_by_text(re.compile(r"^Variant: the prompts reuse"))
    looks.get_by_text("Man", exact=True).click()
    expect(variant).to_be_visible()  # a head change alone still builds on the copied head sheet
    looks.get_by_role("tab", name="Face").click()
    looks.get_by_role("slider", name="Beauty").press("ArrowRight")
    expect(variant).to_be_hidden()
    assert not errors, errors

    # Its corpulence survives a switch to another subject and back: changing it afterwards makes a new face.
    fat = clipboard_page(browser, errors)
    fat.get_by_role("radio", name="GPT Image 2.5", exact=True).click()
    fat.get_by_role("button", name="Copy for GPT Image 2.5").first.click()
    fat.wait_for_function("window.writes.length === 1")
    fat.evaluate("() => window.writes[0]()")
    fat.wait_for_function("JSON.parse(localStorage.getItem('fiche-perso-seedance-v1') || '{}').headSig")
    fat.get_by_role("radio", name="Animal", exact=True).click()
    fat.get_by_role("radio", name="Person", exact=True).click()
    variant = fat.get_by_text(re.compile(r"^Variant: the prompts reuse"))
    fat.get_by_text("Man", exact=True).click()
    expect(variant).to_be_visible()
    fat.get_by_role("tab", name=re.compile(r"^Body")).click()
    fat.get_by_role("slider", name="Build", exact=True).press("ArrowRight")
    expect(variant).to_be_hidden()
    assert not errors, errors

    # A head copy saved before its beauty level and corpulence were recorded takes the current ones on load,
    # whether it belongs to the current subject or is kept for another one.
    for away in (False, True):
        old = clipboard_page(browser, errors)
        old.get_by_role("radio", name="GPT Image 2.5", exact=True).click()
        old.get_by_role("button", name="Copy for GPT Image 2.5").first.click()
        old.wait_for_function("window.writes.length === 1")
        old.evaluate("() => window.writes[0]()")
        old.wait_for_function("JSON.parse(localStorage.getItem('fiche-perso-seedance-v1') || '{}').headSig")
        if away:
            old.get_by_role("radio", name="Animal", exact=True).click()
            old.wait_for_function("(JSON.parse(localStorage.getItem('fiche-perso-seedance-v1')).modeCfg || {}).person")
        old.evaluate("""() => { const s = JSON.parse(localStorage.getItem('fiche-perso-seedance-v1'));
          [s, (s.modeCfg || {}).person].forEach((o) => o && (delete o.headLooks, delete o.headFat));
          localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify(s)); }""")
        old.reload()
        if away:
            old.get_by_role("radio", name="Person", exact=True).click()
        variant = old.get_by_text(re.compile(r"^Variant: the prompts reuse"))
        old.get_by_text("Man", exact=True).click()
        expect(variant).to_be_visible()
        old.get_by_role("tab", name="Face").click()
        old.get_by_role("slider", name="Beauty").press("ArrowRight")
        expect(variant).to_be_hidden()
        old.close()
    assert not errors, errors

    # A person's beauty level does not make a new animal of an animal's copied GPT sheet.
    pet = clipboard_page(browser, errors)
    pet.get_by_role("radio", name="GPT Image 2.5", exact=True).click()
    pet.get_by_role("radio", name="Animal", exact=True).click()
    pet.get_by_role("button", name="Copy for GPT Image 2.5").first.click()  # the animal sheet
    pet.wait_for_function("window.writes.length === 1")
    pet.evaluate("() => window.writes[0]()")
    pet.wait_for_function(f"{SAVED}.headSig")
    pet.get_by_role("tab", name="Coat").click()
    pet.get_by_text("Long coat", exact=True).click()  # the same animal, changed after its head copy
    before = prompts(pet)
    pet.get_by_role("radio", name="Person", exact=True).click()
    pet.get_by_role("tab", name="Face").click()
    pet.get_by_role("slider", name="Beauty").press("ArrowRight")
    pet.get_by_role("radio", name="Animal", exact=True).click()
    assert prompts(pet) == before
    assert not errors, errors

    # Copying only the head close-ups tracks nothing: the animal sheet never builds on them.
    close = clipboard_page(browser, errors)
    close.get_by_role("radio", name="GPT Image 2.5", exact=True).click()
    close.get_by_role("radio", name="Animal", exact=True).click()
    close.get_by_role("button", name="Copy for GPT Image 2.5").nth(1).click()  # the head close-ups
    close.wait_for_function("window.writes.length === 1")
    close.evaluate("() => window.writes[0]()")
    expect(close.get_by_role("button", name="Copy for GPT Image 2.5")).to_have_count(1)  # "Copied": the copy is done
    close.get_by_role("tab", name="Coat").click()
    close.get_by_text("Long coat", exact=True).click()
    assert "most recent" not in prompts(close)[0]
    close.close()
    assert not errors, errors

    # Objects and places: one image per view, views 2 and up made from view 1, nothing left of the six-view sheet.
    leftover = re.compile(r"\bsix\b|six-view|panels?\b|3 by 2|top row|bottom row|aerial view|high-angle view from a top corner")
    obj = clipboard_page(browser, errors)
    obj.get_by_role("radio", name="GPT Image 2.5", exact=True).click()
    obj.get_by_role("radio", name="Object", exact=True).click()
    for cat in ("Vehicle", "Weapon (film prop)", "Clothing", "Accessory", "Object", "House (exterior)", "Interior"):
        obj.get_by_role("tab", name="Object", exact=True).click()
        obj.get_by_role("tabpanel").get_by_text(cat, exact=True).click()
        for light in ("Day", "Night", "Day and night") if cat in ("House (exterior)", "Interior") else ("",):
            if light:
                obj.get_by_role("tab", name="Light and mood", exact=True).click()
                obj.get_by_role("tabpanel").get_by_text(light, exact=True).click()
            texts = prompts(obj)
            cards = [h for h in obj.locator("h3").all_inner_texts() if h != "Rules for your sheets"]
            same = [bool(re.search(r"The same (single object|place)", t)) for t in texts]
            assert len(texts) == len(cards) >= 2 and not same[0] and all(same[1:]), (cat, light, cards, same)
            assert not [t for t in texts if leftover.search(t)], (cat, light)
            if cat == "Clothing":  # views 1 and 2 on the invisible mannequin, view 3 laid flat without it
                assert all("invisible mannequin" in t for t in texts[:2]), cat
                assert "laid flat" in texts[2] and "invisible mannequin" not in texts[2], texts[2]
    # With a source photo, "Day and night" still adds the night card; like views 2 and 3, it asks for the photo too.
    # "Sheet layout only" keeps the photo's own light and hides the light controls: no night card there.
    for place in ("house", "interior"):
        for only in (False, True):
            lit = clipboard_page(browser, errors)
            lit.evaluate(f"""localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({{model: 'gpt', modelPick: 1,
                mode: 'object', objCat: '{place}', objTime: 'both', photo: true, photoOnly: {str(only).lower()}}}))""")
            lit.reload()
            texts = prompts(lit)
            cards = [h for h in lit.locator("h3").all_inner_texts() if h != "Rules for your sheets"]
            if only:
                assert len(texts) == len(cards) == 3, (place, cards)
            else:
                assert len(texts) == len(cards) == 4 and cards[3].startswith("At night"), (place, cards)
                assert "\nNight: " in texts[3] and "Daytime" not in texts[3], place
                assert "Your photo. The day view to redo at night" in lit.locator("body").inner_text(), place
            lit.close()
    # With a source photo, views 2 and up (and the night card) are made from an earlier image of the same subject:
    # the photo's "never ... from earlier images" lets that image through instead of forbidding it.
    for cat, only in (("object", False), ("object", True), ("house", False), ("house", True)):
        src = clipboard_page(browser, errors)
        src.evaluate(f"""localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({{model: 'gpt', modelPick: 1,
            mode: 'object', objCat: '{cat}', objTime: 'both', photo: true, photoOnly: {str(only).lower()}}}))""")
        src.reload()
        texts = prompts(src)
        assert re.search(r"never an? (object|place) from earlier images", texts[0]), (cat, only)
        for t in texts[1:]:
            assert not re.search(r"never an? (object|place) from earlier images", t), (cat, only, t[:300])
            assert re.search(r"and (view 1|the day view)\b", t), (cat, only)
        src.close()
    assert not errors, errors

    # Animals: the whole-animal sheet comes first and carries the identity; head close-ups are optional and made
    # from it; no head-tracking notice; each subject's mobile bar copies its own cards.
    ani = clipboard_page(browser, errors)
    ani.get_by_role("radio", name="GPT Image 2.5", exact=True).click()
    ani.get_by_role("radio", name="Animal", exact=True).click()
    for step in ("default", "after a head copy and another animal"):
        if step != "default":
            ani.get_by_role("button", name="Copy for GPT Image 2.5").first.click()  # the animal sheet
            ani.wait_for_function("window.writes.length === 1")
            ani.evaluate("() => window.writes[0]()")
            ani.wait_for_function(f"{SAVED}.headSig")
            ani.get_by_role("tab", name="Coat").click()
            ani.get_by_text("Long coat", exact=True).click()  # a person would now get the "Variant" notice
            text = ani.locator("body").inner_text()
            assert "The face has changed" not in text and "Variant: the prompts reuse" not in text
            changed = prompts(ani)[0]  # the same animal, changed: its sheet builds on the copied animal sheet
            assert "the most recent animal sheet" in changed and "head sheet" not in changed
            ani.get_by_role("button", name="Random animal").click()
        body, head = prompts(ani)[:2]
        cards = ani.locator("h3").all_inner_texts()[:2]
        assert cards == ["Animal sheet", "Head close-ups (optional)"], (step, cards)
        assert "head sheet" not in body and "identity reference" in body and "SUBJECT:" in body, step
        assert "The same animal as on its four-view sheet" in head and "of your own choice" not in head, step
    assert "The animal sheet: nothing if it is just above" in " ".join(ani.locator("aside").all_inner_texts())
    bar = browser.new_page(viewport={"width": 390, "height": 844})
    bar.route(re.compile(r"^https://fonts\.(googleapis|gstatic)\.com/"), lambda route: route.fulfill(body=""))
    bar.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    bar.on("console", lambda m: m.type == "error" and errors.append(f"console: {m.text}"))
    bar.goto(page_path.resolve().as_uri())
    bar.get_by_role("radio", name="GPT Image 2.5", exact=True).click()
    for mode, want in (("Person", ["Copy head", "Copy body"]), ("Animal", ["Copy the animal"]), ("Object", ["Copy view 1", "Copy view 2"])):
        bar.get_by_role("radio", name=mode, exact=True).click()
        expect(bar.locator("div.fixed button")).to_have_text(want)
    assert not errors, errors

    # Seedream: the head signature covers the build, so a build change after the head copy is reported.
    sig = clipboard_page(browser, errors)
    copy = sig.get_by_role("button", name="Copy for Seedream 5.0")
    head, body = copy.nth(0).element_handle(), copy.nth(1).element_handle()  # labels change to "Copied"
    sig.get_by_role("tab", name="Face").click()
    set_slider(sig, "Beauty", 2)
    sig.get_by_role("tab", name=re.compile(r"^Body")).click()
    set_slider(sig, "Build", 0)
    head.click()
    sig.wait_for_function("window.writes.length === 1")
    sig.evaluate("() => window.writes[0]()")
    sig.wait_for_function(f"{SAVED}.sdHeadSig")
    set_slider(sig, "Build", 4)
    body.click()
    sig.wait_for_function("window.writes.length === 2")
    sig.evaluate("() => window.writes[1]()")
    expect(sig.get_by_text(re.compile(r"^Copied\. Your head sheet is out of date"))).to_be_visible()
    assert not errors, errors

    # A head copy saved before the signature covered the build is not reported as changed, only as older; a real
    # change after loading still is.
    for model in ("GPT Image 2.5", "Seedream 5.0"):
        old = clipboard_page(browser, errors)
        old.get_by_role("radio", name=model, exact=True).click()
        copy = old.get_by_role("button", name=f"Copy for {model}")
        old.get_by_role("tab", name="Face").click()
        set_slider(old, "Beauty", 2)
        copy.first.click()
        old.wait_for_function("window.writes.length === 1")
        old.evaluate("() => window.writes[0]()")
        key = "headSig" if model.startswith("GPT") else "sdHeadSig"
        old.wait_for_function(f"{SAVED}.{key}.includes('#face-fat:')")
        old.evaluate(f"""() => {{ const s = {SAVED}; s.{key} = s.{key}.split('\\n#face-fat:')[0];
          localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify(s)); }}""")
        old.reload()
        old.evaluate(HOLD_CLIPBOARD)
        if model.startswith("GPT"):
            changed = old.get_by_text(re.compile(r"^The face has changed"))
            expect(old.get_by_text(re.compile(r"copied with an earlier version of the tool"))).to_be_visible()
            expect(changed).to_be_hidden()
            old.get_by_role("tab", name="Face").click()
            set_slider(old, "Beauty", 3)
            expect(changed).to_be_visible()
        else:
            copy.nth(1).click()
            old.wait_for_function("window.writes.length === 1")
            old.evaluate("() => window.writes[0]()")
            expect(old.get_by_text(re.compile(r"^Copied\. Your head sheet comes from an earlier version"))).to_be_visible()
        old.close()
    assert not errors, errors

    # GPT, start from a photo: the hidden Beauty slider no longer changes the head prompt.
    heads = []
    for level in (0, 4):
        photo = clipboard_page(browser, errors)
        photo.get_by_role("radio", name="GPT Image 2.5", exact=True).click()
        photo.get_by_role("tab", name="Face").click()
        set_slider(photo, "Beauty", level)
        photo.get_by_text("Start from a photo", exact=True).click()
        layout = photo.get_by_text("Sheet layout only", exact=True)
        if layout.count():
            layout.first.click()
        heads.append(prompts(photo)[0])
        photo.close()
    assert heads[0] == heads[1]
    assert not errors, errors

    # Seedream retouch: the operation is explicit. A join rewritten without image 2 is flagged and "Free retouch"
    # leaves it; a precision added to "Add the heads" keeps its two images.
    op = clipboard_page(browser, errors)
    open_folds(op)
    op.get_by_role("button", name="Combine head and body", exact=True).click()
    open_folds(op)  # picking a preset folds "Other retouches"
    change = op.locator("#sd-iter")
    change.fill("make the backdrop darker")
    expect(op.get_by_text(re.compile(r"^Your text no longer mentions image 2"))).to_be_visible()
    op.get_by_role("button", name="Free retouch", exact=True).click()
    retouch = [t for t in prompts(op) if "make the backdrop darker" in t]
    assert retouch and retouch[0].startswith("Edit image 1"), retouch
    assert "1: the sheet to retouch" in op.locator("body").inner_text()
    op.get_by_role("button", name="Add the heads (extended canvas)", exact=True).click()
    open_folds(op)
    change.fill(change.input_value().replace("copied from the head reference sheet", "copied from the approved head reference sheet") + ", the hair a little longer")
    prompts(op)
    text = op.locator("body").inner_text()
    assert "2. the head sheet" in text and "no longer mentions image 2" not in text
    assert not errors, errors

    # "Ordinaire" face: very angular features are not denied, nor a marked jaw on a heavy build.
    for model in ("GPT Image 2.5", "Seedream 5.0"):
        face = clipboard_page(browser, errors)
        face.get_by_role("radio", name=model, exact=True).click()
        face.get_by_role("tab", name="Face").click()
        set_slider(face, "Beauty", 2)
        set_slider(face, "Angularity", 4)
        head = prompts(face)[0]
        assert not ("sculpted" in head and re.search(r"nothing chiselled|no sculpted cheekbones", head)), model
        face.close()
        jaw = clipboard_page(browser, errors)
        jaw.get_by_role("radio", name=model, exact=True).click()
        jaw.get_by_role("tab", name=re.compile(r"^Body")).click()
        set_slider(jaw, "Build", 4)
        jaw.get_by_role("tab", name="Face").click()
        set_slider(jaw, "Beauty", 2)
        jaw.get_by_text("Marked", exact=True).first.click()
        head = prompts(jaw)[0]
        assert "strong, defined jawline" in head and not re.search(r"no sculpted cheekbones or jawline|nothing chiselled", head), model
        jaw.close()
        # Beauty 3 with both opening traits dropped (angular face on a slim build, delicate features, nose on Auto):
        # no empty item before "rather small eyes".
        bare = clipboard_page(browser, errors)
        bare.evaluate("""localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({mode: 'person', style: 'photo',
            photo: false, looks: 3, fat: 0, faceAngle: 4, featFine: 4, noseW: 'auto', noseP: 'auto', eyeSize: 'auto'}))""")
        bare.reload()
        bare.get_by_role("radio", name=model, exact=True).click()
        plain = [t for t in prompts(bare) if re.search(r"(?i)plain, everyday face", t)]
        assert plain and not any(re.search(r":\s*,", t) for t in plain), (model, [t[:200] for t in plain])
        bare.close()
    assert not errors, errors

    # A saved GPT session from before the model choice was recorded keeps GPT; a first visit opens on Seedream.
    kept = clipboard_page(browser, errors)
    kept.evaluate("localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({mode: 'person', style: 'photo', photo: false, model: 'gpt'}))")
    kept.reload()
    expect(kept.get_by_role("radio", name="GPT Image 2.5", exact=True)).to_be_checked()
    kept.evaluate("localStorage.clear()")
    kept.reload()
    expect(kept.get_by_role("radio", name="Seedream 5.0", exact=True)).to_be_checked()
    assert not errors, errors

    browser.close()

print("smoke test passed")
