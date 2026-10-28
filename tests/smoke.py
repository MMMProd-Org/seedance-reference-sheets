"""Smoke test for the built page. See docs/BUILD.md for how to build and run it.

Optional argument: path to another built page (used to check the test fails on a bad build).
"""

import os
import pathlib
import re
import subprocess
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
    # v140 silhouette types, v158 ptosis grades (Regnault, Roman numerals)
    "III", "Pseudo", "Rectangle", "Triangle",
    # v137 and v156 place helpers and moods ("Place" is the French chip for a town square and the English for "Lieu")
    "Cyberpunk", "Docks", "Festive", "Jungle", "Place", "Renaissance", "Tunnel", "Village",
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


# card titles: the h3 headings outside the named sections of the Body tab (v144)
CARD_H3 = "h3:not([id^='sd-sec-'] h3)"


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
    # CI builds the page with the release version (version.py) and runs this test with it: the header shows it.
    if os.environ.get("SD_VERSION"):
        expect(page.locator("header").get_by_text("v" + os.environ["SD_VERSION"], exact=True)).to_be_visible()

    page.get_by_text("Details and prompt", exact=True).first.click()
    prompt = page.locator("pre").first.inner_text()
    assert len(prompt) > 200 and "16:9" in prompt, f"no prompt shown: {prompt[:120]!r}"

    # Dress applies to a headless body. Deselecting it clears its text; Free retouch then disables the card.
    page.get_by_role("switch", name="Headless body sheet", exact=True).click()
    open_folds(page)
    page.get_by_role("button", name="Free retouch", exact=True).click()
    preset = page.get_by_role("button", name="Dress for assembly", exact=True)
    change = page.locator("#sd-iter")
    hint = page.get_by_text("Pick or write a retouch below.", exact=True)

    def open_retouches():
        if not page.locator("#sd-iter").is_visible():
            page.get_by_text("Choose the retouch", exact=True).click()

    open_retouches()
    expect(hint).to_be_visible()
    # The help above the change says what its text is for: the user's own retouch, or a preset's text, already in the prompt.
    expect(page.get_by_text(re.compile(r"^Write what to change on your sheet \(image 1\), in English or French\. "))).to_be_visible()
    expect(change).to_have_attribute("placeholder", "e.g. sharper biceps and triceps")
    preset.click()
    expect(change).not_to_have_value("")
    expect(hint).to_be_hidden()
    open_retouches()
    expect(preset).to_have_attribute("aria-pressed", "true")
    expect(page.get_by_text(re.compile(r"^Same body, in a fitted cobalt-blue sleeveless cropped top and leggings, to combine the head and the body next\. The Outfit tab is not used\. The text below is ready and already in the prompt: "))).to_be_visible()
    assert change.input_value().rstrip(". ") in page.locator('pre[data-out="iter"]').text_content()
    preset.click()
    expect(change).to_have_value("")
    expect(page.get_by_role("button", name="Combine head and body", exact=True)).to_have_attribute("aria-pressed", "true")
    page.get_by_role("button", name="Free retouch", exact=True).click()
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
        # the list of what is kept; anywhere in the prompt too, except for a clothing change, whose fit paragraph (v124) may
        # name the outfit
        keep_line = next(x for x in retouch.text_content().splitlines() if x.startswith("Keep everything this change does not touch"))
        assert kept in keep_line and dropped not in keep_line, (text, keep_line)
        if dropped != "the outfit":
            expect(retouch).not_to_contain_text(dropped)
    change.fill("")
    page.get_by_role("switch", name="Headless body sheet", exact=True).click()

    found = {}
    for model in ["GPT Image 2.5", "Seedream 5.0"]:
        page.get_by_role("radio", name=model, exact=True).click()
        for subject in ["Person", "Animal", "Object", "Place"]:  # "Place" since v137
            page.get_by_role("radio", name=subject, exact=True).first.click()  # the type row, above the "Object" category chip
            tabs = page.get_by_role("tab")
            for i in range(tabs.count()):
                tabs.nth(i).click()
                expect(tabs.nth(i)).to_have_attribute("aria-selected", "true")
                untranslated(page, f"{model} / {subject} / {tabs.nth(i).inner_text()}", found)
            if subject == "Person":
                tabs.first.click()
                # the presentation chip of the tab (the header also shows the sex, as a radio button)
                page.locator("label").filter(has_text=re.compile(r"^Man$")).click()
                untranslated(page, f"{model} / Person / Man", found)
                page.locator("label").filter(has_text=re.compile(r"^Woman$")).click()
            if model == "GPT Image 2.5" and subject in ("Person", "Animal"):
                tabs.first.click()
                several = page.get_by_text(re.compile(r"^Several (characters|animals) in the same GPT conversation"))
                several.click()
                untranslated(page, f"{model} / {subject} / several, no name", found)
                name = page.get_by_label("Animal's name" if subject == "Animal" else "Character name")
                name.fill("Q7")  # one letter: never reported as untranslated
                untranslated(page, f"{model} / {subject} / several, named", found)
                name.fill("")
                several.click()
            page.get_by_role("button", name=re.compile(r"^New (character|animal|object|place)$")).click()
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
    race.locator("label").filter(has_text=re.compile(r"^Man$")).click()
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
    expect(seedream).to_have_count(4)  # the "Copied" labels are back (head, body, retouch, final photo pass)
    seedream.nth(1).click()
    cross.wait_for_function("window.writes.length === 3")
    cross.evaluate("() => window.writes[2]()")
    expect(cross.get_by_text(head_ok)).to_be_visible()

    # For a headless body, "Combine head and body" is the default while the change is empty: a click fills it in.
    headless = clipboard_page(browser, errors)
    headless.get_by_role("tab", name=re.compile(r"^Body")).click()
    headless.get_by_text(re.compile(r"^Headless body sheet")).first.click()
    join = headless.get_by_role("button", name="Combine head and body", exact=True)
    if not headless.locator("#sd-iter").is_visible():  # the default preset starts folded
        headless.get_by_text("Choose the retouch", exact=True).click()
    expect(join).to_have_attribute("aria-pressed", "true")
    # its prompt is built while the change is empty, and the help says so
    expect(headless.get_by_text("The body is kept and the head is added. Switching the model (Seedream, Nano Banana or GPT Image) puts that model's text back. The prompt is already complete: the box can stay empty.", exact=True)).to_be_visible()
    join.click()
    expect(headless.locator("#sd-iter")).not_to_have_value("")
    expect(headless.get_by_text(re.compile(r"^The body is kept and the head is added\. Switching the model \(Seedream, Nano Banana or GPT Image\) puts that model's text back\. The text below is ready "))).to_be_visible()
    # in French too; "Free retouch" asks for the user's own text, with a French example
    set_lang(headless, "Français", "fr")
    expect(headless.get_by_text(re.compile(r"^Le corps est gardé, la tête est ajoutée\. Changer de modèle \(Seedream, Nano Banana ou GPT Image\) remet le texte de ce modèle\. Le texte ci-dessous est prêt "))).to_be_visible()
    headless.get_by_role("button", name="Retouche libre", exact=True).click()
    expect(headless.get_by_text(re.compile(r"^Écris ce qu'il faut changer sur ta planche \(image 1\), en français ou en anglais\. "))).to_be_visible()
    expect(headless.locator("#sd-iter")).to_have_attribute("placeholder", "ex. biceps et triceps plus dessinés")

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
    subject.locator("label").filter(has_text=re.compile(r"^Man$")).click()  # after a head change, the prompts build on the copied head sheet
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
    looks.locator("label").filter(has_text=re.compile(r"^Man$")).click()
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
    fat.locator("label").filter(has_text=re.compile(r"^Man$")).click()
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
        old.locator("label").filter(has_text=re.compile(r"^Man$")).click()
        expect(variant).to_be_visible()
        old.get_by_role("tab", name="Face").click()
        old.get_by_role("slider", name="Beauty").press("ArrowRight")
        expect(variant).to_be_hidden()
        old.close()
    assert not errors, errors

    # A head copied before the port (v115 to v158) is still the same face: the long-hair back view of v118 and the
    # contradictory random pairs v131 resolves ("a high, broad forehead" with "a low hairline") change no setting.
    # A change of "Fat: face" (v156), the face's own fat, makes a new GPT face, as the build does.
    old = clipboard_page(browser, errors)
    old.evaluate("localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({model: 'gpt', modelPick: 1, mode: 'person',"
                 " pres: 'f', age: 30, faceSeed: 7, hairLen: 'long'}))")
    old.reload()
    old.evaluate(HOLD_CLIPBOARD)
    old.get_by_role("button", name="Copy for GPT Image 2.5").first.click()
    old.wait_for_function("window.writes.length === 1")
    old.evaluate("() => window.writes[0]()")
    old.wait_for_function(f"{SAVED}.headSig")
    sig = old.evaluate(f"{SAVED}.headSig")
    assert "showing how the hair falls at the back, its length and parting, worn down with no tie or clip" in sig, sig
    assert "runs on past its bottom edge" not in sig and "a high, broad forehead" in sig and "a rounded hairline" in sig, sig
    old.evaluate(f"""() => {{ const s = {SAVED}; s.headSig = s.headSig.replace('a rounded hairline', 'a low hairline');
      localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify(s)); }}""")
    old.reload()
    open_folds(old)
    expect(old.get_by_text(re.compile(r"^The face has changed"))).to_be_hidden()
    variant = old.get_by_text(re.compile(r"^Variant: the prompts reuse"))
    old.locator("label").filter(has_text=re.compile(r"^Man$")).click()
    expect(variant).to_be_visible()
    old.get_by_role("tab", name="Face").click()
    old.get_by_role("slider", name="Fat: face", exact=True).press("ArrowRight")
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
    # Objects, not places, open with a triptych card: their three views side by side in one 16:9 image; without a source
    # photo it says it is the triptych or the views, since each makes up its own object.
    leftover = re.compile(r"\bsix\b|six-view|panels?\b|3 by 2|top row|bottom row|aerial view|high-angle view from a top corner")
    obj = clipboard_page(browser, errors)
    obj.get_by_role("radio", name="GPT Image 2.5", exact=True).click()
    # places are their own type since v137 ("Place": a house, an interior or an outdoor location), with their own tab
    for cat in ("Vehicle", "Weapon (film prop)", "Clothing", "Accessory", "Object", "House", "Interior", "Outdoor"):
        kind = "Place" if cat in ("House", "Interior", "Outdoor") else "Object"
        obj.get_by_role("radio", name=kind, exact=True).first.click()  # the type row, above the "Object" category chip
        obj.get_by_role("tab", name=kind, exact=True).click()
        obj.get_by_role("tabpanel").get_by_text(cat, exact=True).click()
        for light in ("Day", "Night", "Day and night") if kind == "Place" else ("",):
            if light:
                obj.get_by_role("tab", name="Light and mood", exact=True).click()
                obj.get_by_role("tabpanel").get_by_text(light, exact=True).click()
            texts = prompts(obj)
            cards = [h for h in obj.locator(CARD_H3).all_inner_texts() if h != "Rules for your sheets"]
            if light:
                assert not [c for c in cards if c.startswith("Triptych")], (cat, light, cards)
            else:
                assert cards[0] == "Triptych: the 3 views in one image", (cat, cards)
                tri, texts, cards = texts[0], texts[1:], cards[1:]
                assert "three-view studio turnaround" in tri and "three equal panels side by side" in tri, (cat, tri[:400])
                assert tri.count(" panel: ") == 3 and not re.search(r"\bsix\b|3 by 2|top row|bottom row", tri), (cat, tri)
                assert "The triptych or the separate views, not both" in obj.locator("body").inner_text(), cat
                if cat == "Clothing":
                    assert "invisible mannequin (ghost mannequin) in the left and middle panels" in tri and "laid flat" in tri, tri
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
            cards = [h for h in lit.locator(CARD_H3).all_inner_texts() if h != "Rules for your sheets"]
            if only:
                assert len(texts) == len(cards) == 3, (place, cards)
            else:
                assert len(texts) == len(cards) == 4 and cards[3].startswith("At night"), (place, cards)
                assert "\nNight: " in texts[3] and "Daytime" not in texts[3], place
                assert "Your photo, then the day view to redo at night" in lit.locator("body").inner_text(), place
            lit.close()
    # With a source photo, views 2 and up (and the night card) are made from an earlier image of the same subject:
    # the photo's "never ... from earlier images" lets that image through instead of forbidding it, and both the
    # "Attach" row and the prompt say which attached image is which: the photo first, then the earlier image.
    for cat, only in (("object", False), ("object", True), ("house", False), ("house", True)):
        src = clipboard_page(browser, errors)
        src.evaluate(f"""localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({{model: 'gpt', modelPick: 1,
            mode: 'object', objCat: '{cat}', objTime: 'both', photo: true, photoOnly: {str(only).lower()}}}))""")
        src.reload()
        texts = prompts(src)
        if cat == "object":  # the triptych is made from the photo alone, like view 1, and both follow the photo
            assert re.search(r"never an object from earlier images", texts[0]) and "three equal panels" in texts[0], (only, texts[0][:300])
            assert "The triptych or the separate views" not in src.locator("body").inner_text(), only
            texts = texts[1:]
        assert re.search(r"never an? (object|place) from earlier images", texts[0]), (cat, only)
        for t in texts[1:]:
            assert not re.search(r"never an? (object|place) from earlier images", t), (cat, only, t[:300])
            assert re.search(r"and (view 1|the day view) \(attached after the photo(\(s\))?, or the image just above", t), (cat, only)
        assert "Your photo, then view 1: nothing if it is just above" in src.locator("body").inner_text(), (cat, only)
        src.close()
    # On an object or a place, "Sheet layout only" is named for what it keeps, and its help speaks of no face or outfit.
    for cat, name in (("object", "Keep the object in the photo as is"), ("house", "Keep the place in the photo as is")):
        keep = clipboard_page(browser, errors)
        keep.evaluate(f"""localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({{model: 'gpt', modelPick: 1,
            mode: 'object', objCat: '{cat}', photo: true, photoOnly: true}}))""")
        keep.reload()
        expect(keep.get_by_text(name, exact=True)).to_be_visible()
        help_text = keep.get_by_text(re.compile("^" + name + r"\. The prompts take the")).inner_text()
        assert not re.search(r"face|hair|makeup|outfit|sheet", help_text), help_text
        assert "Sheet layout only" not in keep.locator("body").inner_text(), cat
        keep.close()
    # A garment kept as in the photo keeps the photo's presentation unless "On an invisible mannequin", shown only there
    # and explained by its "?", is ticked: then views 1 and 2 and the triptych's left and middle panels put it on the
    # mannequin, view 3 and the right panel lay it flat. "New object" unticks "On an invisible mannequin". Elsewhere the
    # saved choice shows nothing and changes nothing.
    for model in ("gpt", "seedream"):
        gm = clipboard_page(browser, errors)
        gm.evaluate(f"""localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({{model: '{model}', modelPick: 1,
            mode: 'object', objCat: 'clothing', photo: true, photoOnly: true}}))""")
        gm.reload()
        box = gm.get_by_role("switch", name="On an invisible mannequin", exact=True)
        expect(box).to_have_attribute("aria-checked", "false")
        assert not [t for t in prompts(gm) if "invisible mannequin" in t], model
        tip = gm.locator("#sd-tip-mannequin")
        expect(tip).to_be_hidden()
        gm.locator(".sd-tip", has=tip).locator(".sd-tip-btn").hover()
        expect(tip).to_be_visible()
        expect(tip).to_contain_text("on an invisible mannequin")
        expect(tip).to_contain_text("View 3 stays laid flat")
        box.click()
        texts = prompts(gm)
        assert len(texts) == 4 and all("the presentation described below" in t for t in texts), model
        assert "invisible mannequin (ghost mannequin) in the left and middle panels" in texts[0], (model, texts[0])
        assert all("invisible mannequin" in t for t in texts[1:3]), model
        assert "laid flat on the seamless grey backdrop" in texts[3] and "invisible mannequin" not in texts[3], (model, texts[3])
        assert "On an invisible mannequin" in gm.get_by_text(re.compile(r"^Keep the object in the photo as is\. ")).inner_text(), model
        assert gm.evaluate(f"{SAVED}.objMannequin") is True, model
        set_lang(gm, "Français", "fr")
        expect(gm.get_by_role("switch", name="Sur mannequin invisible", exact=True)).to_have_attribute("aria-checked", "true")
        expect(gm.locator("#sd-tip-mannequin")).to_contain_text("sur un mannequin invisible")
        gm.get_by_role("button", name="Nouvel objet", exact=True).click()
        gm.get_by_role("button", name="Confirmer : effacer cet objet", exact=True).click()
        gm.wait_for_function(f"{SAVED}.objMannequin === false")
        gm.close()
    for state in ("objCat: 'object', photo: true, photoOnly: true", "objCat: 'clothing', photo: true, photoOnly: false"):
        off = clipboard_page(browser, errors)
        off.evaluate(f"""localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({{model: 'gpt', modelPick: 1,
            mode: 'object', {state}, objMannequin: true}}))""")
        off.reload()
        expect(off.get_by_text("On an invisible mannequin", exact=True)).to_have_count(0)
        texts = prompts(off)
        assert not [t for t in texts if "presentation described below" in t or t.count("PRESENTATION:") > 1], state
        if "'object'" in state:
            assert not [t for t in texts if "mannequin" in t], state
        off.close()
    assert not errors, errors
    # An animal's head close-ups with a source photo are made from the photo alone: they do not ask for the animal sheet.
    for only in (False, True):
        ani = clipboard_page(browser, errors)
        ani.evaluate(f"""localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({{model: 'gpt', modelPick: 1,
            mode: 'animal', photo: true, photoOnly: {str(only).lower()}}}))""")
        ani.reload()
        body = ani.locator("body").inner_text()
        card = body[body.index("Head close-ups (optional)"):]
        card = card[: card.index("Copy for GPT Image 2.5")]
        assert re.search(r"\nAttach\nYour photo\n", card) and "animal sheet" not in card, (only, card)
        ani.close()
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
        cards = ani.locator(CARD_H3).all_inner_texts()[:2]
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
    expect(sig.get_by_text(re.compile(r"^Copied\. The face has changed since the last copied head prompt"))).to_be_visible()
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

    # Seedream can start from a photo; returning to the dedicated builder restores its retouch card.
    msg = clipboard_page(browser, errors)
    msg.get_by_role("radio", name="Seedream 5.0", exact=True).click()
    msg.get_by_text("Start from a photo", exact=True).click()
    assert msg.locator(CARD_H3).all_inner_texts() == ["Head sheet", "Body sheet"]
    assert len(prompts(msg)) == 2
    for button in msg.get_by_role("button", name="Copy for Seedream 5.0", exact=True).all():
        expect(button).to_be_enabled()
    msg.get_by_text("Start from a photo", exact=True).click()
    cards = [h for h in msg.locator(CARD_H3).all_inner_texts() if h != "Rules for your sheets"]
    assert cards[2].startswith("Retouch"), cards
    msg.close()
    assert not errors, errors

    # Seedream retouch: the operation is explicit. A join rewritten without image 2 is flagged and "Free retouch"
    # leaves it; a precision added to "Add the heads" keeps its two images.
    op = clipboard_page(browser, errors)
    op.get_by_role("switch", name="Headless body sheet", exact=True).click()
    open_folds(op)
    op.get_by_role("button", name="Combine head and body", exact=True).click()
    open_folds(op)
    change = op.locator("#sd-iter")
    change.fill("make the backdrop darker")
    expect(op.get_by_text(re.compile(r"^Your text no longer mentions image 2"))).to_be_visible()
    op.get_by_role("button", name="Free retouch", exact=True).click()
    retouch = [t for t in prompts(op) if "make the backdrop darker" in t]
    assert retouch and retouch[0].startswith("Edit image 1"), retouch
    assert "1. the sheet to retouch" in op.locator("body").inner_text()
    op.get_by_role("button", name="Add the heads", exact=True).click()
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

    # Seedream, the very slim body the owner tested (docs/PROMPT-LOG.md, 2026-10-11), with the settings that shape the
    # lines checked here: muscles at "Discrets" except the arms, very marked veins, abs with a centre line at "Discrets";
    # height and proportions stay at their defaults, as they change none of these lines. The zones at "Discrets" share
    # one phrase, the pear bust says nothing athletic, and the hard light brings out the veins, not the muscles. Three
    # separate conditions keep the light on the muscles:
    # - a body that is not lean (musculature over "Athlétique", biceps or trapezius at "Développés" or "Massifs"): the
    #   shared phrase also drops "no muscle bulk";
    # - a zone at "Marqués": on a lean body, the shared phrase keeps "no muscle bulk";
    # - fewer zones at "Discrets" than at "Présents" or "Marqués" in the Muscles line: no shared phrase, each zone keeps
    #   its own.
    on_muscles = "weak fill: crisp shadows on the muscles and veins."
    tested = ("Muscles: barely visible muscles, no muscle bulk, a visible groove between biceps and triceps, slim upper arms,"
              " a flat trapezius line, a smooth upper chest.")
    for extra, wanted in (
        ("", (tested,
              # v128 (owner: "Discrets" and "Présents" abs looked the same): "Discrets" no longer reads "softly visible"
              "Abdomen: a flat stomach with a single vertical groove down the middle and no horizontal lines, only faintly hinted, no deep shadows.",
              "weak fill: crisp shadows that bring out the veins; the muscles stay smooth.",
              "the upper part slightly deflated; the lowest point")),
        ("absStyle: 'auto'", (tested,)),  # abs at "Discrets" with no style: in the shared phrase, not one of their own
        ("absStyle: 'six', defAbs: 'auto'", ("Abdomen: six segments in three rows, with clear shadow lines.",)),
        ("pres: 'm'", ("Muscles: barely visible muscles, no muscle bulk, a visible groove between biceps and triceps, slim"
                       " upper arms, a flat trapezius line.",)),  # a man's chest at "Discrets" in the shared phrase
        # a tie that the man's chest makes: two zones at "Discrets" (legs, chest) against two at "Présents" share the phrase
        ("pres: 'm', def: 'clear', defLegs: 'subtle', defChest: 'subtle', defBack: 'none'", (
            "Muscles: barely visible muscles, no muscle bulk, defined shoulders, a visible groove between biceps and triceps,"
            " slim upper arms, a flat trapezius line.",)),
        ("biceps: 'big'", ("Muscles: barely visible muscles, a visible groove", on_muscles)),
        ("traps: 'huge'", ("Muscles: barely visible muscles, a visible groove", on_muscles)),
        ("muscle: 3", ("Muscles: barely visible muscles, a visible groove", on_muscles)),  # "Forte", the first level over "Athlétique"
        ("defArms: 'strong'", ("Muscles: barely visible muscles, no muscle bulk, very marked arms", on_muscles)),
        ("def: 'clear'", ("Muscles: defined shoulders", on_muscles)),
        # one zone at "Discrets" against two at "Présents": each keeps its own phrase; the abs at "Discrets" have their
        # own line and do not count
        ("def: 'clear', defLegs: 'subtle', defBack: 'none'", (
            "Muscles: defined shoulders, a visible groove between biceps and triceps, lean, softly toned legs, slim upper"
            " arms, a flat trapezius line, a smooth upper chest.", on_muscles)),
    ):
        slim = clipboard_page(browser, errors)
        slim.evaluate(f"""localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({{model: 'seedream', modelPick: 1,
            mode: 'person', style: 'photo', pres: 'f', age: 27, fat: 0, muscle: 1, chest: 3, bustShape: 'pear',
            headless: true, thighs: 1, absStyle: 'line', defAbs: 'subtle', biceps: 'slim', traps: 'flat', def: 'subtle', defArms: 'clear',
            veins: 'strong', {extra}}}))""")
        slim.reload()
        body = next(t for t in prompts(slim) if "Muscles:" in t)
        assert all(w in body for w in wanted), (extra, [w for w in wanted if w not in body], body)
        assert "lean athletic" not in body, (extra, body)
        slim.close()
    assert not errors, errors

    # A saved GPT session from before the model choice was recorded keeps GPT, and so does one saved by an earlier build
    # without a hand pick for a subject Seedream can do; a first visit opens on Seedream.
    kept = clipboard_page(browser, errors)
    for pick in ("", ", modelPick: 0"):
        kept.evaluate(f"localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({{mode: 'person', style: 'photo', photo: false, model: 'gpt'{pick}}}))")
        kept.reload()
        kept.wait_for_timeout(300)  # the live engine rule (P53) would switch it right after the first render
        expect(kept.get_by_role("radio", name="GPT Image 2.5", exact=True)).to_be_checked()
    kept.evaluate("localStorage.clear()")
    kept.reload()
    expect(kept.get_by_role("radio", name="Seedream 5.0", exact=True)).to_be_checked()
    assert not errors, errors

    # Seedream makes objects, places and animals from their GPT prompts, minus what only ChatGPT acts on: an earlier
    # image of the conversation, the regenerate loop, "several in the same GPT conversation" left on. Each card names
    # the file to attach, and no help text speaks of GPT or of a conversation. In every style: Photo, 3D and 2D.
    chat_only = re.compile(r"conversation|just above|earlier image|GENERATION LIMIT|regenerate|attempt")
    for state, tab in (
        ("mode: 'object', objCat: 'object'", "Look"),
        ("mode: 'object', objCat: 'object', style: '2d'", None),
        ("mode: 'object', objCat: 'house', objTime: 'both', style: '3d'", None),
        ("mode: 'animal', style: '2d'", None),
        ("mode: 'object', objCat: 'clothing', photo: true", None),
        ("mode: 'object', objCat: 'vehicle', photo: true, photoOnly: true", None),
        ("mode: 'object', objCat: 'house', objTime: 'both'", None),
        ("mode: 'object', objCat: 'interior', objTime: 'both', photo: true", None),
        ("mode: 'animal', style: '3d'", "Marks"),
        ("mode: 'animal', photo: true", None),
        ("mode: 'animal', multiChar: true, name: 'Rex'", None),
        ("mode: 'person', style: 'photo', photo: false", "Marks"),
    ):
        sd = clipboard_page(browser, errors)
        sd.evaluate(f"localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({{model: 'seedream', modelPick: 1, {state}}}))")
        sd.reload()
        texts = prompts(sd)
        if "person" not in state:
            assert len(texts) >= 2 and not any(chat_only.search(t) for t in texts), (state, [chat_only.search(t) for t in texts])
            body = sd.locator("body").inner_text()
            assert not re.search(r"(?i)conversation|GPT picks", body), (state, re.search(r"(?i).{60}(conversation|GPT picks).{20}", body))
            assert not sd.locator("[placeholder*='GPT']").count(), state
            if "photo: true" not in state and "objCat: 'object'" in state:
                assert "View 1: obj_" in body, state
            if "mode: 'object'" in state and not re.search(r"objCat: '(house|interior)'", state):
                assert "Triptych: the 3 views in one image" in body, state
        if tab:
            sd.get_by_role("tab", name=tab, exact=True).click()
            assert "conversation" not in sd.locator("body").inner_text().lower(), (state, tab)
        sd.close()
    # A GPT copy of the same animal, changed since, makes GPT build on it; Seedream names no earlier sheet.
    seen = clipboard_page(browser, errors)
    seen.get_by_role("radio", name="GPT Image 2.5", exact=True).click()
    seen.get_by_role("radio", name="Animal", exact=True).click()
    seen.get_by_role("button", name="Copy for GPT Image 2.5").first.click()  # the animal sheet
    seen.wait_for_function("window.writes.length === 1")
    seen.evaluate("() => window.writes[0]()")
    seen.wait_for_function(f"{SAVED}.headSig")
    seen.get_by_role("tab", name="Coat").click()
    seen.get_by_text("Long coat", exact=True).click()
    assert "the most recent animal sheet" in prompts(seen)[0]
    seen.get_by_role("radio", name="Seedream 5.0", exact=True).click()
    texts = prompts(seen)
    assert len(texts) == 2 and not any(chat_only.search(t) or "most recent" in t for t in texts), [t[:300] for t in texts]
    # A person's parts stay a person's, even after a person with a headless body and a shape guide: no retouch card, no
    # shape option, no three-step layout; copying the animal sheet names no head sheet, and its close-ups mark none as copied.
    pet = clipboard_page(browser, errors)
    pet.evaluate("""localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({model: 'seedream', modelPick: 1,
        mode: 'person', headless: true, sdShapeRef: true}))""")
    pet.reload()
    pet.evaluate(HOLD_CLIPBOARD)  # the reload dropped it
    expect(pet.get_by_text("Choose the retouch", exact=True)).to_be_attached()  # the person's cards were drawn
    pet.get_by_role("radio", name="Animal", exact=True).click()
    open_folds(pet)
    text = pet.locator("body").inner_text()
    assert pet.locator(CARD_H3).all_inner_texts()[:2] == ["Animal sheet", "Head close-ups (optional)"], pet.locator(CARD_H3).all_inner_texts()
    for word in ("Choose the retouch", "shape guide", "bust shape", "Your three steps", "Combine head and body"):
        assert word not in text, word
    assert "The animal sheet: char_" in text
    copy = pet.get_by_role("button", name="Copy for Seedream 5.0")
    sheet, close = copy.nth(0).element_handle(), copy.nth(1).element_handle()  # labels change to "Copied"
    sheet.click()
    pet.wait_for_function("window.writes.length === 1")
    pet.evaluate("() => window.writes[0]()")
    expect(pet.get_by_text("Copied. Paste it into Seedream 5.0.")).to_be_visible()
    close.click()
    pet.wait_for_function("window.writes.length === 2")
    pet.evaluate("() => window.writes[1]()")
    pet.wait_for_function("(b) => b.innerText.startsWith('Copied')", arg=close)  # the copy has been handled
    assert not pet.evaluate(f"{SAVED}.sdHeadSig"), pet.evaluate(f"{SAVED}.sdHeadSig")
    # People in 3D and 2D now have usable Seedream sheets.
    flat = clipboard_page(browser, errors)
    for style in ("3d", "2d"):
        flat.evaluate("style => localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({model: 'seedream', modelPick: 1, mode: 'person', style}))", style)
        flat.reload()
        assert flat.locator(CARD_H3).all_inner_texts() == ["Head sheet", "Body sheet"]
        texts = prompts(flat)
        assert len(texts) == 2 and all(texts)
        assert not re.search(r"conversation|GENERATION LIMIT|this message", "\n".join(texts))
    assert not errors, errors

    # Checks from the owner's second v95 line (the tests/ui_*.py scripts of its build chain), in English.
    def saved_page(state, viewport=None, scheme=None):
        """A Seedream person page opened on a saved state, its clipboard held as in clipboard_page."""
        if scheme:
            pg = browser.new_context(viewport={"width": 1440, "height": 1000}, color_scheme=scheme).new_page()
            pg.route(re.compile(r"^https://fonts\.(googleapis|gstatic)\.com/"), lambda route: route.fulfill(body=""))
            pg.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
            pg.goto(page_path.resolve().as_uri())
        else:
            pg = clipboard_page(browser, errors)
        if viewport:
            pg.set_viewport_size(viewport)
        pg.evaluate(f"localStorage.setItem('fiche-perso-seedance-v1', JSON.stringify({{model: 'seedream', modelPick: 1, mode: 'person', {state}}}))")
        pg.reload()
        pg.evaluate(HOLD_CLIPBOARD)
        return pg

    # Bust: six steps, "Fairly generous" (stored as 2.5) between "Medium" and "Generous"; a man's chest reads 2.5 as one
    # step below "Developed".
    bust = saved_page("pres: 'f', chest: 2")
    bust.get_by_role("tab", name=re.compile(r"^Body")).click()
    slider = bust.get_by_role("slider", name="Bust", exact=True)
    stored = []
    for key in ["ArrowRight"] * 3 + ["ArrowLeft"] * 5:
        slider.press(key)
        stored.append(bust.evaluate(f"{SAVED}.chest"))
        if stored == [2.5]:
            row = bust.locator("span#l-chest").locator("xpath=ancestor::div[contains(@class,'py-4')][1]").inner_text()
            assert "Fairly generous" in row and "≈ cup C to D" in row and "then H for Very generous" in row, row
    assert stored == [2.5, 3, 4, 3, 2.5, 2, 1, 0], stored
    pecs = saved_page("pres: 'm', chest: 2.5")
    pecs.get_by_role("tab", name=re.compile(r"^Body")).click()
    pecs.get_by_role("slider", name="Chest", exact=True).press("ArrowRight")
    assert pecs.evaluate(f"{SAVED}.chest") == 3
    bust.close()
    pecs.close()

    # "Very generous" bust on Seedream: the loose top replaces the triangle and comes with bike shorts; the fitted top stays
    # an option, drawn in red, with a warning once picked; at "Generous" it is the plain option again; GPT gets its shorts.
    outfit = "age: 27, bodyRef: true, headless: true"
    warn = "Fitted top with a Very generous bust: Seedream often removes the image"
    loose = saved_page(f"pres: 'f', chest: 4, refCover: 'sport', {outfit}")
    loose.get_by_role("tab", name="Outfit").click()
    text = loose.locator("body").inner_text()
    assert "Loose sleeveless top and bike shorts, barefoot" in text and warn not in text
    assert "Seedream: loose sleeveless top and Brazilian-cut tanga, barefoot (replaces the triangle at Very generous)" in text
    fitted = loose.locator("label", has_text="Fitted top and bike shorts, barefoot")
    assert "border-destructive" in fitted.get_attribute("class")
    assert "a loose cobalt-blue" in next(t for t in prompts(loose) if "Outfit, the same" in t)
    fitted.click()
    assert loose.evaluate(f"{SAVED}.refCover") == "fitted" and warn in loose.locator("body").inner_text()
    body = next(t for t in prompts(loose) if "Outfit, the same" in t)
    assert "a fitted cobalt-blue sleeveless cropped top" in body and "a loose cobalt-blue" not in body, body
    loose.close()
    for state, want in ((f"pres: 'f', chest: 3, refCover: 'fitted', {outfit}", "a fitted cobalt-blue sleeveless cropped top"),
                        (f"pres: 'f', chest: 4, refCover: 'fitted', {outfit}, model: 'gpt'", "compression shorts")):
        other = saved_page(state)
        other.get_by_role("tab", name="Outfit").click()
        assert warn not in other.locator("body").inner_text(), state
        if "gpt" not in state:
            assert "destructive" not in other.locator("label", has_text="Fitted top and bike shorts, barefoot").get_attribute("class")
        assert want in next(t for t in prompts(other) if "utfit" in t), state
        other.close()
    # the red warning and the red option keep a 4.5:1 contrast on their background, in both themes
    for scheme in ("dark", "light"):
        red = saved_page(f"pres: 'f', chest: 4, refCover: 'fitted', {outfit}", scheme=scheme)
        red.get_by_role("tab", name="Outfit").click()
        ratios = red.evaluate("""() => {
          const rgb = (s) => s.match(/[\\d.]+/g).map(Number).slice(0, 3);
          const lum = (c) => { c = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
            return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
          const bg = (el) => { for (; el; el = el.parentElement) { const b = getComputedStyle(el).backgroundColor;
            if (b && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(b)) return b; } return "rgb(255, 255, 255)"; };
          const cr = (el) => { const x = lum(rgb(getComputedStyle(el).color)), y = lum(rgb(bg(el)));
            return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
          const out = [...document.querySelectorAll("p.text-destructive")].map(cr);
          document.querySelectorAll("label").forEach((l) => /Fitted top and bike shorts/.test(l.textContent) && out.push(cr(l)));
          return out;
        }""")
        assert len(ratios) == 2 and min(ratios) >= 4.5, (scheme, ratios)
        red.context.close()

    # "Dress for assembly" writes the outfit of the with-head body sheet word for word (the dressed sheet becomes its image 2): a man's top
    # lies over his chest, a very slim woman's has the lower neckline; at "Very generous" both cards carry the red warning.
    head_outfit = re.compile(r"Outfit, the same in every view: (.*?)\. Opaque, plain, no logos\.")
    dress_outfit = re.compile(r"Change only this: the outfit is replaced by (.*?); opaque, plain, no logos; ")
    dress_warn = "make the headless body sheet in the loose top"
    for state, warned in (("pres: 'f', chest: 4, fat: 0, bustShape: 'low'", True), ("pres: 'f', chest: 3, fat: 2", False),
                          ("pres: 'm', chest: 2, fat: 2", False)):
        dressed = saved_page(f"age: 27, bodyRef: true, headless: true, refCover: 'sport', {state}")
        open_folds(dressed)
        dressed.get_by_role("button", name="Dress for assembly", exact=True).click()
        prompts(dressed)
        edit = dressed.locator('pre[data-out="iter"]').text_content()  # card 3 (since v147 a bust retouch card can come before it)
        assert (dress_warn in dressed.locator("body").inner_text()) == warned, state
        whole = saved_page(f"age: 27, bodyRef: true, headless: false, refCover: 'sport', {state}")
        outfit_text = next(t for t in prompts(whole) if "Outfit, the same in every view" in t)
        assert (dress_warn in whole.locator("body").inner_text()) == warned, state
        dress_match, head_match = dress_outfit.search(edit), head_outfit.search(outfit_text)
        assert dress_match and head_match and dress_match.group(1) == head_match.group(1), (state, edit, outfit_text)
        assert "second skin" not in edit and "thin, stretchy" not in edit, state
        assert "pres: 'm'" not in state or ("bust" not in edit and "over the chest" in edit), edit
        assert "fat: 0" not in state or "a lower, wider scoop neckline" in edit, edit
        dressed.close()
        whole.close()

    # "Free retouch" is an operation of its own: it clears a preset's text left as it is (a text the user wrote stays, as
    # checked above) and, empty, copies nothing: the card is disabled and the mobile button opens help.
    free = saved_page("headless: true, bodyRef: true", viewport={"width": 390, "height": 844})
    open_folds(free)
    free.get_by_role("button", name="Combine head and body", exact=True).click()
    open_folds(free)
    free.get_by_role("button", name="Free retouch", exact=True).click()
    saved = free.evaluate(SAVED)
    assert saved.get("sdIterOp") == "free" and not saved.get("sdIter"), saved
    assert not any("Combine these two reference sheets" in t for t in prompts(free))
    expect(free.get_by_role("button", name="Copy for Seedream 5.0").nth(2)).to_be_disabled()
    mobile_retouch = free.locator("div.fixed button", has_text=re.compile(r"^Retouch$"))
    expect(mobile_retouch).to_be_enabled()
    mobile_retouch.click()
    expect(free.get_by_role("status")).to_contain_text("Choose or write a retouch in card 3.")
    assert free.evaluate("window.writes.length") == 0
    assert free.locator("#sd-card-iter details").filter(has=free.locator("summary", has_text="Choose the retouch")).evaluate("d => d.open")
    free.locator("#sd-iter").fill("make the backdrop darker")
    free.locator("#sd-iter").fill("")
    assert free.evaluate(f"{SAVED}.sdIterOp") == "free"
    free.close()
    # the text a preset put in the box is cleared even after a setting has changed that preset's wording
    stale = saved_page("headless: true, bodyRef: true, pres: 'f', chest: 2.5")
    open_folds(stale)
    stale.get_by_role("button", name="Dress for assembly", exact=True).click()
    picked = stale.evaluate(f"{SAVED}.sdIter")
    stale.get_by_role("tab", name=re.compile(r"^Body")).click()
    stale.get_by_role("slider", name="Bust", exact=True).press("ArrowRight")
    open_folds(stale)
    stale.get_by_role("button", name="Free retouch", exact=True).click()
    saved = stale.evaluate(SAVED)
    assert saved.get("sdIterOp") == "free" and not saved.get("sdIter"), saved
    open_folds(stale)
    stale.get_by_role("button", name="Dress for assembly", exact=True).click()
    assert stale.evaluate(f"{SAVED}.sdIter") != picked, "the bust change must change the Dress text"
    stale.close()

    # A body copy before any head copy says that the head prompt was not copied yet.
    first = saved_page("headless: false, bodyRef: true")
    first.get_by_role("button", name="Copy for Seedream 5.0").nth(1).click()
    first.wait_for_function("window.writes.length === 1")
    first.evaluate("() => window.writes[0]()")
    expect(first.get_by_text(re.compile(r"^Copied\. You have not copied the head prompt yet"))).to_be_visible()
    first.close()

    # Arms at "Marqués" are "not bulky" only up to "Athlétique"; lettering asked in the marks field (English, or French
    # "écrit") is allowed on both models while captions stay forbidden; marks without lettering keep "No text".
    for muscle, lean in ((4, False), (2, True)):
        arms = saved_page(f"pres: 'm', fat: 0, muscle: {muscle}, defArms: 'strong', biceps: 'auto'")
        body = next(t for t in prompts(arms) if "tendon visible" in t)
        assert ("tendon visible, not bulky" in body) == lean, (muscle, body)
        arms.close()
    for model in ("seedream", "gpt"):
        for marks, lettering in (("a tattoo reading HELLO on the left forearm", True), ("tatouage écrit HELLO sur l'avant-bras", True),
                                 ("freckles on the nose", False)):
            mark = saved_page(f"model: '{model}', pres: 'f', age: 30, marks: \"{marks}\"")
            head, body = prompts(mark)[:2]
            for text in (head, body):
                assert ("the only lettering is the one the marks above describe" in text) == lettering, (model, marks, text[-300:])
                assert ("No text" in text) != lettering, (model, marks, text[-300:])
                assert not lettering or "HELLO" in text, (model, marks, text[-300:])
            mark.close()
    # on GPT with a source photo whose clothing is kept, the clothing's own logos and prints stay allowed too
    photo = saved_page("model: 'gpt', pres: 'f', age: 30, photo: true, marks: 'a tattoo reading HELLO on the left forearm'")
    for text in prompts(photo)[:2]:
        assert "HELLO" in text and "No text" not in text, text[-300:]
        assert ("the only lettering is the one the marks above describe, besides any logo or print on the clothing taken from"
                " the photo.") in text, text[-300:]
    photo.close()

    # "Large" and "Very large" glutes keep their size but lose their profile words with a "Flat" or "Low" glute shape, which the
    # shape's hint says is independent of the volume (both engines).
    profile = re.compile(r"round glutes|projecting far behind|a hand's width behind the line of the shoulder blades|a deep shelf")
    for model in ("gpt", "seedream"):
        for size, shape, shown in ((3, "flat", False), (4, "low", False), (3, "round", True), (4, "auto", True)):
            gl = saved_page(f"model: '{model}', pres: 'f', age: 30, glutes: {size}, glutesShape: '{shape}'")
            body = next(t for t in prompts(gl) if "standing" in t)
            assert bool(profile.search(body)) == shown, (model, size, shape, profile.findall(body))
            assert ("very large" if 3 == size else "extremely large") in body, (model, size, shape)
            gl.close()
    assert not errors, errors

    # "3D agent" (v158): its prompt follows the interface language, the French one as v158 wrote it.
    agent = saved_page("pres: 'f', age: 26, chest: 2.5, bustShape: 'round', bodyRef: true, refCover: 'tanga', headless: true")
    agent.get_by_role("tab", name=re.compile(r"^Body")).click()
    a3d = "() => (document.querySelector('#sd-a3d textarea') || {}).value || ''"
    text = agent.evaluate(a3d)
    assert text.startswith("# Agent prompt: bust without a top, 3D character\n"), text[:120]
    for want in ("## INPUTS", "- TOP_TYPE = SOFT_TRIANGLE (", "- PTOSIS_GRADE = NONE (", "Shape key \"bare_rest\" on the body; at 1.0, V1 to V10 OK"):
        assert want in text, (want, text[:400])
    assert not re.search(r"[àâçéèêëîïôùûüœ«»]|\b(TYPE_DE_HAUT|COQUES_|AUCUNE|nu_relache|À VALIDER)\b", text), re.findall(r"[àâçéèêëîïôùûüœ«»]", text)[:5]
    set_lang(agent, "Français", "fr")
    text = agent.evaluate(a3d)
    assert text.startswith("# Prompt agent : poitrine sans haut, personnage 3D\n") and "- TYPE_DE_HAUT = TRIANGLE_SOUPLE (" in text, text[:200]
    set_lang(agent, "English", "en")
    agent.close()
    assert not errors, errors

    # "3D agent" (v158) for an adult woman with a bust, never a man or a woman under 21. Its "Nipples" and "Areolas" choices: on
    # Auto the prompt keeps both out of scope; a type set by hand gives its sourced target, its own shape key and check V11.
    A3D = "() => (document.querySelector('#sd-a3d textarea') || {}).value || ''"
    agent_state = "pres: 'f', age: 26, chest: 2.5, bustShape: 'round', bodyRef: true, refCover: 'tanga', headless: true, height: 160"
    for state, shown in ((agent_state, True), ("pres: 'm', age: 26, chest: 2", False), ("pres: 'f', age: 20, chest: 2.5", False)):
        pg = saved_page(state)
        pg.get_by_role("tab", name=re.compile(r"^Body")).click()
        assert (pg.locator("#sd-a3d").count() == 1) == shown, state
        pg.close()
    agent = saved_page(agent_state)
    agent.get_by_role("tab", name=re.compile(r"^Body")).click()
    agent.locator("#sd-a3d summary").click()
    text = agent.evaluate(A3D)
    assert "6. Out of scope: textures and UVs, areolas and nipples, jiggle, rig" in text and "- NIPPLE =" not in text, text[-600:]
    assert "V1 to V10 OK" in text and "V11" not in text
    # every choice of the panel has its tooltip; the grades say where the nipple sits against the fold under the breast
    assert agent.evaluate("() => [...document.querySelectorAll('#sd-a3d [data-a3d]')].every((b) => b.title)")
    assert agent.get_by_role("button", name="II", exact=True).get_attribute("title") == (
        "Moderate sag: the nipple below the fold, but not the lowest point of the breast.")
    assert "Zhong 2023" in agent.get_by_role("button", name="Thick cups", exact=True).get_attribute("title")
    assert agent.get_by_text("Ptosis grade (how far the bust sags)", exact=True).count() == 1
    projecting = agent.get_by_role("button", name="Projecting", exact=True)
    assert projecting.get_attribute("title") == "About 9 mm high above the areola."
    assert agent.get_by_role("button", name="Big", exact=True).get_attribute("title") == (
        "About 41 mm across: the area is marked for the texture, the mesh does not move for it.")
    projecting.click()
    agent.get_by_role("button", name="Big", exact=True).click()
    assert agent.evaluate(f"[{SAVED}.a3dNip, {SAVED}.a3dAre]") == ["SAILLANT", "GRANDE"]
    text = agent.evaluate(A3D)
    for want in ("- NIPPLE = PROJECTING (", "- AREOLA = LARGE (", "- CHARACTER_HEIGHT = 160 cm", "areola LARGE: D_ar = 41 mm",
                 "nipple PROJECTING: p = 9 mm", "d = 10 mm", "multiply them by H / 1600.", "Shape keys \"bare_rest\" and \"nipples\"",
                 "   - V11: ", "V1 to V11 OK or FAILED", "Lee et al., Arch Plast Surg 2008", "Demiröz et al., J Plast Surg Hand Surg 2021",
                 "(the areola's color and grain included)",
                 "A shape key or vertex group already named \"nipples\", \"areola_L\" or \"areola_R\": stop and ask, rename nothing."):
        assert want in text, (want, text[-800:])
    assert not re.search(r"[àâçéèêëîïôùûüœ«»]|\b(MAMELON|AREOLE|SAILLANT|GRANDE|mamelons|À VALIDER)\b", text), text[-800:]
    set_lang(agent, "Français", "fr")
    text = agent.evaluate(A3D)
    for want in ("- MAMELON = SAILLANT (", "- AREOLE = GRANDE (", "- TAILLE_PERSONNAGE = 160 cm", "aréole GRANDE : D_ar = 41 mm",
                 "mamelon SAILLANT : p = 9 mm", "d = 10 mm", "multiplie-les par H / 1600.", "Shape keys \"nu_relache\" et \"mamelons\"",
                 "   - V11 : ", "V1 à V11 OK ou KO", "Lee et al., Arch Plast Surg 2008", "Demiröz et al., J Plast Surg Hand Surg 2021",
                 "(couleur et grain de l'aréole compris)",
                 "Une shape key ou un vertex group déjà nommé \"mamelons\", \"areole_G\" ou \"areole_D\" : arrête-toi et demande, ne renomme rien."):
        assert want in text, (want, text[-800:])
    set_lang(agent, "English", "en")
    agent.get_by_role("button", name="Umbilicated", exact=True).click()
    areola_auto = agent.locator("[data-a3d='a3dAre:auto']")
    assert areola_auto.inner_text() == "Auto (mesh)"
    areola_auto.click()
    text = agent.evaluate(A3D)
    assert "nipple UMBILICATED: p < 0" in text and "- AREOLA = AUTO (" in text and "d = 10 mm" not in text and "D_ar = 41 mm" not in text and "D_ar = its diameter" in text, text[-800:]
    # every label and tooltip of the panel in both languages (the rest of the page is swept elsewhere)
    panel = "() => [...document.querySelectorAll('#sd-a3d summary, #sd-a3d p, #sd-a3d button')].map((n) => [n.textContent.trim(), n.title])"
    en = agent.evaluate(panel)
    set_lang(agent, "Français", "fr")
    fr = agent.evaluate(panel)
    set_lang(agent, "English", "en")
    same = [a for pair in zip(en, fr) for a, b in zip(*pair) if a == b and re.search(r"[A-Za-zÀ-ÿ]{3,}", a)
            and a not in SAME_IN_BOTH and not NEUTRAL.match(a)]
    assert len(en) == len(fr) and not same, same
    agent.close()
    assert not errors, errors

    # An engine nobody picked follows the subject live, and a reload keeps it: GPT for a person in 3D, Seedream again in Photo.
    auto = clipboard_page(browser, errors)
    for style, model in (("3D", "gpt"), ("Photo", "seedream")):
        auto.get_by_role("radio", name=style, exact=True).click()
        auto.wait_for_function(f"{SAVED}.model === '{model}'")
        auto.reload()
        assert auto.evaluate(f"{SAVED}.model") == model and not auto.evaluate(f"{SAVED}.modelPick"), style
    assert not errors, errors

    # v110b modes: reuse the same bilingual check for every visible tab and the new tool.
    new_found = {}
    for model in ("gpt", "seedream"):
        for baby in (False, True):
            child = saved_page(f"model: '{model}', child: true, baby: {str(baby).lower()}")
            tabs = child.get_by_role("tab")
            for i in range(tabs.count()):
                tabs.nth(i).click()
                untranslated(child, f"{model} / {'Baby' if baby else 'Child'} / {i}", new_found)
            child.close()
        integ = saved_page(f"model: '{model}', view: 'integ', integLit: true")
        untranslated(integ, f"{model} / Image integration", new_found)
        integ.close()
    assert not new_found, "untranslated: " + repr(new_found)
    assert not errors, errors
    browser.close()

subprocess.run([sys.executable, str(ROOT / "tests/v110b/test_upgrade.py"), str(page_path.resolve())], check=True)
print("smoke test passed")
