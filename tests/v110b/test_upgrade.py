"""Acceptance checks for the owner's integrations, using the existing Playwright dependency.

    python tests/v110b/test_upgrade.py [path/to/built.html]
"""

import json
import pathlib
import re
import sys
import unittest

from playwright.sync_api import expect, sync_playwright

# card titles: the h3 headings outside the named sections of the Body tab (v144)
CARD_H3 = "h3:not([id^='sd-sec-'] h3)"

ROOT = pathlib.Path(__file__).resolve().parents[2]
HTML = pathlib.Path(sys.argv.pop(1)).resolve() if len(sys.argv) > 1 else ROOT / "new/merged.html"
KEY = "fiche-perso-seedance-v1"
SEED = """(() => { let s = 12345; Math.random = () => {
  s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648;
}; })();"""


class Upgrade(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch()

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()

    def setUp(self):
        self.context = None
        self.errors = []

    def tearDown(self):
        if self.context:
            self.context.close()
        self.assertEqual(self.errors, [], "browser errors")

    def load(self, **state):
        if self.context:
            self.context.close()
        self.context = self.browser.new_context(viewport={"width": 1440, "height": 1000})
        self.page = self.context.new_page()
        self.page.set_default_timeout(5000)
        self.page.route("**/*", lambda route: route.continue_() if route.request.url.startswith("file:") else route.abort())
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))
        self.page.add_init_script(SEED)
        self.page.goto(HTML.as_uri())
        self.page.evaluate("([k,s]) => localStorage.setItem(k, JSON.stringify(s))", [KEY, {
            "model": "seedream", "modelPick": 1, "mode": "person", "uiLang": "en",
            "faceSeed": 4242, "faceGen": 2, **state,
        }])
        self.page.reload()
        self.page.locator("header").wait_for()
        return self.page

    def state(self):
        return self.page.evaluate("k => JSON.parse(localStorage.getItem(k))", KEY)

    def prompts(self):
        self.page.evaluate("document.querySelectorAll('details').forEach(d => d.open = true)")
        buttons = self.page.get_by_role("button", name=re.compile(r"^(Show the prompt|Voir le prompt)$"))
        for _ in range(buttons.count()):
            buttons.first.click()
        empty_edit = self.page.locator('pre[data-out="iter"]')
        if empty_edit.count() and not empty_edit.text_content().strip():
            expect(empty_edit.locator("xpath=../..").get_by_role("button", name=re.compile(r"^(Copy for|Copier pour) Seedream 5\.0$"))).to_be_disabled()
        texts = self.page.locator('pre:not([data-out="iter"]):visible, pre[data-out="iter"]:not(:empty):visible').all_text_contents()
        self.assertTrue(texts and all(t.strip() for t in texts), "missing prompt")
        return texts

    def iter_prompt(self):
        """Card 3's prompt (the final photo pass, v155, now comes after it)."""
        return self.page.locator('pre[data-out="iter"]').text_content()

    def test_forte_respects_explicit_limbs_and_waist(self):
        for model in ("gpt", "seedream"):
            with self.subTest(model=model):
                self.load(model=model, fat=4, muscle=0, bodyRef=True, headless=True, refCover="tanga")
                body = self.prompts()[1]
                self.assertIn("obese, fat and heavy", body.lower())
                self.assertIn("a big, heavy, round belly", body)
                self.load(model=model, fat=4, muscle=0, biceps="slim", waist=0, bodyRef=True, headless=True)
                body = self.prompts()[1]
                self.assertNotIn("thick, soft upper arms", body)
                self.assertNotIn("large and soft all over", body)
                self.assertNotIn("a big, heavy, round belly", body)

    def test_forehead_and_hair(self):
        for model in ("gpt", "seedream"):
            with self.subTest(model=model):
                self.load(model=model, forehead="high", hairCare="greasy", hairThick="thick", hairTex="frizzy")
                head = self.prompts()[0]
                self.assertIn("a high forehead, the hairline set well above the eyebrows", head)
                self.assertIn("greasy", head)
                self.assertIn("frizzy", head)
                self.assertNotIn("a low hairline", head)

    def test_dress_with_own_outfit(self):
        self.load(bodyRef=True, headless=True, sdIterOp="dressMine", top="a green winter coat")
        prompt = next(t for t in self.prompts() if t.startswith("Edit image 1"))
        self.assertIn("the outfit is replaced by this outfit", prompt)
        self.assertIn("a green winter coat", prompt.lower())
        self.assertIn("the same build, proportions and posture", prompt)

    def test_child_keeps_adult_settings_out(self):
        for model in ("gpt", "seedream"):
            with self.subTest(model=model):
                page = self.load(model=model, child=True, childAge=8, childSex="m", chest=4, looks=0,
                                 makeup="glam", fat=4, bodyRef=True, headless=True, refCover="tanga",
                                 top="bikini top", marks="a tattoo on the arm", eState="shirtless")
                self.assertEqual(page.get_by_role("radio", name="Child", exact=True).count(), 1)
                texts = self.prompts()
                self.assertEqual(len(texts), 2)
                self.assertIn("An 8-year-old boy", texts[0])
                self.assertIn("a T-shirt, jeans and sneakers in plain solid colors", texts[1])
                self.assertNotRegex("\n".join(texts), r"(?i)bikini|tattoo|shirtless|tanga|cleavage")
                self.assertEqual(self.state()["chest"], 4, "adult settings must stay available after leaving Child")

    def test_baby_single_dressed_sheet(self):
        for model in ("gpt", "seedream"):
            with self.subTest(model=model):
                page = self.load(model=model, child=True, baby=True, top="a red coat", chest=4, childAge=12)
                self.assertEqual(page.get_by_role("radio", name="Baby", exact=True).count(), 1)
                texts = self.prompts()
                self.assertEqual(len(texts), 1)
                self.assertIn("9-month-old", texts[0])
                self.assertIn("full-length cotton sleepsuit", texts[0])
                self.assertNotIn("a red coat", texts[0])

    def test_child_nose_slider_endpoints(self):
        for model in ("gpt", "seedream"):
            for key, position, description in (("xnarrow", "Home", "very narrow nose"),
                                               ("xwide", "End", "very wide nose")):
                with self.subTest(model=model, width=key):
                    page = self.load(model=model, child=True, looks=1)
                    page.get_by_role("tab", name=re.compile("^Face")).click()
                    page.get_by_role("slider", name="Nose width", exact=True).press(position)
                    self.assertEqual(self.state()["noseW"], key)
                    self.assertIn(description, self.prompts()[0])
                    page.reload()
                    self.assertIn(description, self.prompts()[0])

    def test_child_nose_ignores_saved_adult_beauty(self):
        for model in ("gpt", "seedream"):
            for looks in (3, 4):
                with self.subTest(model=model, looks=looks):
                    page = self.load(model=model, looks=looks, noseW="narrow")
                    self.assertIn("wide nose", self.prompts()[0])
                    types = page.get_by_role("radiogroup", name="Type", exact=True)
                    types.get_by_role("radio", name="Child", exact=True).click()
                    self.assertIn("narrow nose", self.prompts()[0])
                    page.get_by_role("tab", name=re.compile("^Face")).click()
                    expect(page.get_by_text(re.compile(r"^(Plain|Homely) →"))).to_have_count(0)
                    self.assertEqual(self.state()["looks"], looks)
                    self.assertEqual(self.state()["noseW"], "narrow")
                    page.reload()
                    self.assertIn("narrow nose", self.prompts()[0])
                    types.get_by_role("radio", name="Person", exact=True).click()
                    self.assertEqual(self.state()["looks"], looks)
                    self.assertIn("wide nose", self.prompts()[0])

    def test_integration_requires_meaningful_fields(self):
        page = self.load(view="integ")
        self.assertEqual(page.locator("#integ-integAsset").count(), 1)
        copy = page.get_by_role("button", name="Copy for Seedream 5.0", exact=True)
        expect(copy).to_be_disabled()
        page.locator("#integ-integAsset").fill("...")
        page.locator("#integ-integPlace").fill("on the pavement")
        expect(copy).to_be_disabled()
        page.locator("#integ-integAsset").fill("a red motorcycle")
        expect(copy).to_be_enabled()
        prompt = page.locator("pre:not([data-out])").text_content()
        self.assertIn("the red motorcycle from Image 2 into Image 1", prompt)
        self.assertIn("the same length relative to height", prompt)

    def test_selected_views_and_legacy_default(self):
        self.load(mode="object", objCat="object")
        self.assertEqual(len(self.prompts()), 4, "keep the triptych and three separate default views")
        self.load(mode="object", objCat="object", objViews=[0, 5])
        self.assertEqual(self.page.locator('g[data-view][aria-pressed="true"]:visible').count(), 2)
        cards = self.page.locator(CARD_H3).all_text_contents()
        self.assertEqual(len([c for c in cards if re.match(r"^View \d:", c)]), 2)
        self.page.reload()
        self.page.locator("header").wait_for()
        self.assertEqual(self.state()["objViews"], [0, 5])

    def test_existing_seedream_photo_paths(self):
        self.load(mode="animal", photo=True)
        self.assertEqual(len(self.prompts()), 2)
        self.assertEqual(self.page.locator(CARD_H3).all_text_contents()[:2], ["Animal sheet", "Head close-ups (optional)"])
        self.load(mode="object", objCat="clothing", photo=True, photoOnly=True, objMannequin=True)
        self.assertIn("invisible mannequin", self.prompts()[0])
        expect(self.page.get_by_text("On an invisible mannequin", exact=True)).to_be_visible()

    def test_child_word_filter(self):
        source = (ROOT / "seedream_new.js").read_text()
        start = source.index("var SD_CHILD_BAN_TERMS")
        end = source.index("\n}\n", source.index("function sdChildOk")) + 3
        words = json.loads((ROOT / "tests/v110b/child_words.json").read_text())
        # v117 (independent child-safety reviews): wet hair or clothes, a bathrobe and heels are refused for a child too
        later = ["wet hair", "heeled boots", "bathrobe"]
        block = words["BLOCK"] + later
        allow = [w for w in words["ALLOW"] if w not in later]
        self.assertEqual(len(allow), len(words["ALLOW"]) - len(later))
        page = self.load(child=True)
        result = page.evaluate("words => {" + source[start:end] + "\nreturn words.map(sdChildOk); }", block + allow)
        self.assertEqual(result[:len(block)], [False] * len(block))
        self.assertEqual(result[len(block):], [True] * len(allow))

    def test_join_migration_preserves_personal_text(self):
        presets = json.loads((ROOT / "tests/v110b/join_presets.json").read_text())
        for text in presets:
            self.load(age=31, sdIterOp="join", sdIter=text, sdIterPre=text)
            # v126: the current text draws the head in an empty grey band above each body (the v102 text said "85% of the panel height")
            self.assertIn("in the empty grey band above each body", self.state()["sdIter"])
            self.assertEqual(self.state()["sdIterPre"], self.state()["sdIter"])
            edited = text + " Keep the red shoes."
            self.load(age=31, sdIterOp="join", sdIter=edited, sdIterPre=text)
            self.assertEqual(self.state()["sdIter"], edited)

    def test_late_copy_does_not_cross_child_identity(self):
        for model, source, target in [(m, a, b) for m in ("gpt", "seedream")
                                      for a, b in (("Person", "Child"), ("Child", "Baby"), ("Baby", "Person"))]:
            with self.subTest(model=model, source=source, target=target):
                page = self.load(model=model, child=source != "Person", baby=source == "Baby")
                page.evaluate("() => { window.writes = []; navigator.clipboard.writeText = () => new Promise(done => window.writes.push(done)); }")
                page.get_by_role("button", name="Copy for " + ("GPT Image 2.5" if model == "gpt" else "Seedream 5.0"), exact=True).first.click()
                page.wait_for_function("window.writes.length === 1")
                page.get_by_role("radiogroup", name="Type", exact=True).get_by_role("radio", name=target, exact=True).click()
                page.evaluate("async () => { window.writes[0](); await Promise.resolve(); }")
                page.wait_for_function("document.querySelector('[role=status]')?.textContent.includes('Copied')")
                for key in ("headSig", "headFull", "headLooks", "headFat", "sdHeadSig"):
                    self.assertFalse(self.state().get(key), key)

    def test_child_photo_restore_and_headless_outfit(self):
        for model in ("gpt", "seedream"):
            page = self.load(model=model, photo=True, photoOnly=True, forehead="high", hairCare="greasy")
            types = page.get_by_role("radiogroup", name="Type", exact=True)
            types.get_by_role("radio", name="Child", exact=True).click()
            self.assertFalse(self.state()["photo"])
            types.get_by_role("radio", name="Animal", exact=True).click()
            types.get_by_role("radio", name="Person", exact=True).click()
            self.assertTrue(self.state()["photo"])
            self.assertTrue(self.state()["photoOnly"])
            self.assertEqual(self.state()["forehead"], "high")
            self.assertEqual(self.state()["hairCare"], "greasy")
            self.load(model=model, child=True, childHeadless=True, accSel=["glasses", "cap"], topSel=["hoodie"])
            body = self.prompts()[1]
            self.assertNotRegex(body, r"baseball cap|glasses")
            self.assertIn("hoodie", body)

    def test_fantasy_and_grey_house(self):
        for model in ("gpt", "seedream"):
            self.load(model=model, mode="animal", afantasy="large crystal wings")
            self.assertIn("Fantastic elements, the defining feature", self.prompts()[0])
            self.load(model=model, mode="object", objCat="house", objBg="grey", objFantasy="a floating stone roof", objTime="day")
            texts = self.prompts()
            self.assertEqual(len(texts), 3)
            self.assertIn("flat, plain neutral 18% grey floor", texts[0])
            self.assertIn("a floating stone roof", texts[0])
            self.load(model=model, mode="object", objCat="house", objBg="grey", objFantasy="a floating stone roof", photo=True, photoOnly=True)
            self.assertNotIn("floating stone roof", "\n".join(self.prompts()))

    def test_selected_views_categories_and_day_night(self):
        for model in ("gpt", "seedream"):
            for category in ("object", "vehicle", "weapon", "clothing", "accessory", "house", "interior"):
                for photo in (False, True):
                    with self.subTest(model=model, category=category, photo=photo):
                        place = category in ("house", "interior")
                        self.load(model=model, mode="object", objCat=category, photo=photo,
                                  objTime="both", **{"placeViews" if place else "objViews": [0, 2, 4, 5]})
                        texts = self.prompts()
                        self.assertEqual(len(texts), 5)
                        self.assertNotRegex("\n".join(texts), r"six-view|six equal panels|all six")
                        if place:
                            self.assertIn("night", texts[-1].lower())
                            self.assertIn("Aerial view" if category == "house" else "High-angle view", texts[3])
                        else:
                            self.assertIn("three equal panels side by side", texts[0])
                            self.assertIn("directly above", texts[-1])
                            self.assertNotIn("At night", self.page.locator(CARD_H3).all_text_contents()[-1])
                        if model == "seedream":
                            self.assertNotIn("conversation", "\n".join(texts))

    def test_mobile_copy_bar_includes_all_selected_views(self):
        for model in ("gpt", "seedream"):
            for language in ("en", "fr"):
                for category in ("object", "house"):
                    for count in (3, 4):
                        with self.subTest(model=model, language=language, category=category, count=count):
                            page = self.load(model=model, uiLang=language, mode="object", objCat=category,
                                             objTime="day", **{"objViews" if category == "object" else "placeViews": [0, 2, 4, 5][:count]})
                            page.set_viewport_size({"width": 390, "height": 844})
                            labels = [("Copy view " if language == "en" else "Copier vue ") + str(i + 1) for i in range(count)]
                            fixed_bar = page.locator("#sd-mobile-copy-bar")
                            bar = fixed_bar.get_by_role("button")
                            self.assertEqual(bar.all_text_contents(), labels)
                            self.assertLessEqual(page.evaluate("document.documentElement.scrollWidth"), 391)
                            for bounds in bar.evaluate_all("buttons => buttons.map(b => b.getBoundingClientRect().toJSON())"):
                                self.assertGreaterEqual(bounds["left"], 0)
                                self.assertGreaterEqual(bounds["top"], 0)
                                self.assertLessEqual(bounds["right"], 390)
                                self.assertLessEqual(bounds["bottom"], 844)
                            texts = self.prompts()
                            expected = texts[1:] if category == "object" else texts
                            page.evaluate("() => { window.copied = []; navigator.clipboard.writeText = async text => { window.copied.push(text); }; }")
                            for i in range(count):
                                page.set_viewport_size({"width": 320 if i % 2 else 390, "height": 844})
                                bar.nth(i).click()
                                self.assertEqual(page.evaluate("window.copied"), expected[:i + 1])
                                status = page.get_by_role("status")
                                expect(status).to_contain_text(re.compile("Copied|Copié"))
                                self.assertLessEqual(status.evaluate("e => e.getBoundingClientRect().bottom"),
                                                     fixed_bar.evaluate("e => e.getBoundingClientRect().top"))
                            page.set_viewport_size({"width": 1440, "height": 1000})
                            self.assertAlmostEqual(status.evaluate("e => e.getBoundingClientRect().bottom"), 976, delta=1)
                            self.assertEqual(fixed_bar.evaluate("e => getComputedStyle(e.parentElement).paddingBottom"), "64px")
                            # v137: a house is a place, with its own reset button
                            place = category == "house"
                            reset = page.get_by_role("button", name=("New place" if place else "New object") if language == "en" else ("Nouveau lieu" if place else "Nouvel objet"), exact=True)
                            for width in (390, 320):
                                page.set_viewport_size({"width": width, "height": 844})
                                reset.scroll_into_view_if_needed()
                                page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
                                self.assertLessEqual(reset.evaluate("e => e.getBoundingClientRect().bottom"),
                                                     fixed_bar.evaluate("e => e.getBoundingClientRect().top"))
                                reset.click(trial=True)
                            reset.click()
                            confirm = ("Confirm: delete this place" if place else "Confirm: delete this object") if language == "en" else ("Confirmer : effacer ce lieu" if place else "Confirmer : effacer cet objet")
                            expect(page.get_by_role("button", name=confirm, exact=True)).to_be_visible()

    def test_view_selection_keyboard_mobile_and_reload(self):
        page = self.load(mode="object", objCat="object", objViews=[0])
        page.set_viewport_size({"width": 390, "height": 844})
        first = page.locator('g[data-view="0"]:visible')
        first.press("Enter")
        expect(first).to_have_attribute("aria-pressed", "true")
        for value in (1, 2, 3):
            page.locator(f'g[data-view="{value}"]:visible').press("Space")
        page.locator('g[data-view="4"]:visible').press("Enter")
        self.assertEqual(self.state()["objViews"], [0, 1, 2, 3])
        page.reload()
        expect(page.locator('g[data-view="3"]:visible')).to_have_attribute("aria-pressed", "true")
        self.assertLessEqual(page.evaluate("document.documentElement.scrollWidth"), 391)

    def test_own_outfit_toggle_mobile_and_live_text(self):
        page = self.load(bodyRef=True, headless=True, top="a green coat", sdIterOp="dressMine")
        page.set_viewport_size({"width": 390, "height": 844})
        expect(page.locator("div.fixed").get_by_role("button", name="My outfit", exact=True)).to_be_visible()
        self.prompts()
        own = page.get_by_role("button", name="Dress in my outfit", exact=True)
        expect(own).to_have_attribute("aria-pressed", "true")
        own.click()
        expect(own).to_have_attribute("aria-pressed", "false")
        own.click()
        page.get_by_role("tab", name=re.compile("^Outfit")).click()
        field = page.get_by_placeholder(re.compile("grey wool turtleneck"))
        expect(field).to_have_value("a green coat")
        field.fill("a red wool jacket")
        expect(page.locator('pre[data-out="iter"]')).to_contain_text("red wool jacket")
        expect(page.locator('pre[data-out="iter"]')).not_to_contain_text("green coat")

    def test_canon_male_is_targeted_and_male_outfit_reaches_waist(self):
        self.load(pres="m", looks=0, bodyRef=True, headless=False)
        texts = self.prompts()
        self.assertIn("top male model", texts[0])  # v128: "Canon" stronger ("real male model" before)
        self.assertIn("beard shadow", texts[0])
        self.assertIn("hem reaches the waistband", texts[1])
        self.assertNotIn("cropped top", texts[1])
        self.load(pres="f", looks=0)
        self.assertNotIn("male model", self.prompts()[0])

    def test_canon_keeps_explicit_face_traits(self):
        self.load(pres="m", looks=0)
        # v128: shorter, no "thick natural eyebrows" at all (the eyebrows are the face's); the jaw cue stays while the jaw is on Auto
        head = self.prompts()[0]
        self.assertIn("a clearly defined jaw", head)
        self.assertNotIn("thick natural eyebrows", head)
        for generation in (1, 2):
            for brows, jaw in (("thin", "auto"), ("auto", "soft"), ("thin", "soft")):
                with self.subTest(generation=generation, brows=brows, jaw=jaw):
                    self.load(pres="m", looks=0, faceGen=generation, face="heart", forehead="low",
                              eyeShape="up", brows=brows, noseW="narrow", noseP="upturned",
                              lips="full", jaw=jaw)
                    head = self.prompts()[0]
                    for trait in ("heart-shaped face", "a low forehead, the hairline close to the eyebrows",
                                  "upturned eyes", "narrow, upturned nose", "full lips"):
                        self.assertIn(trait, head)
                    if brows != "auto":
                        self.assertIn("thin eyebrows", head)
                    if jaw != "auto":
                        self.assertIn("soft jawline", head)
                    self.assertNotIn("thick natural eyebrows", head)
                    self.assertEqual("a clearly defined jaw" in head, jaw == "auto")

    def test_animal_individuality_respects_source_photo(self):
        for model in ("gpt", "seedream"):
            self.load(model=model, mode="animal", faceSeed=4242)
            body = self.prompts()[0]
            self.assertIn("Head shape, this animal's own", body)
            self.load(model=model, mode="animal", faceSeed=1717)
            self.assertNotEqual(self.prompts()[0], body)
            self.load(model=model, mode="animal", photo=True, faceSeed=4242)
            self.assertNotIn("Head shape, this animal's own", "\n".join(self.prompts()))

    def test_selected_interior_light_matches_its_card(self):
        self.load(mode="object", objCat="interior", objLightSel=["lamps"], placeViews=[2], objTime="day")
        self.assertEqual(self.page.locator(CARD_H3).all_text_contents(), ["View 1: light"])
        self.assertIn("view toward the main light source", self.prompts()[0])
        self.assertNotIn("main windows", self.prompts()[0])

    def test_v112_photo_clothes_switch(self):
        for model in ("gpt", "seedream"):
            with self.subTest(model=model):
                page = self.load(model=model, photo=True, photoClothes=True, topSel=["hoodie"],
                                 bottomSel=["jeans"], accSel=["cap"], acc="red bandana")
                switch = page.get_by_role("switch", name="Use the clothes in the photo", exact=True)
                expect(switch).to_be_checked()
                head, body = self.prompts()
                self.assertIn("the top from the attached photo", head)
                self.assertNotRegex(head + body, r"hoodie|jeans|baseball cap|bandana")
                page.get_by_role("button", name="Random character", exact=True).click()
                self.assertEqual(self.state()["topSel"], ["hoodie"])
                self.assertTrue(self.state()["photoClothes"])
                page.get_by_role("tab", name=re.compile(r"^Outfit")).click()
                expect(page.get_by_text(re.compile("The clothes in your photo are kept"))).to_be_visible()
                expect(page.get_by_role("button", name="Random outfit", exact=True)).to_have_count(0)
                switch.click()
                self.assertFalse(self.state()["photoClothes"])
                head, body = self.prompts()
                self.assertIn("hoodie", head.lower())
                self.assertIn("hoodie, jeans", body.lower())
                self.assertIn("baseball cap", head)
                self.assertIn("Its clothing is not used", head)
                self.assertNotIn("taken from the photo", head + body)
                page.reload()
                expect(switch).not_to_be_checked()
                self.assertEqual(self.state()["topSel"], ["hoodie"])

    def test_v112_photo_outfit_keeps_head_copy_current(self):
        for model, key in (("gpt", "headSig"), ("seedream", "sdHeadSig")):
            for marks in ("", "a tattoo reading HELLO on the left cheek"):
                for photo_clothes in (True, False):
                    with self.subTest(model=model, marks=marks, photo_clothes=photo_clothes):
                        page = self.load(model=model, photo=True, photoClothes=photo_clothes,
                                         topSel=["hoodie"], marks=marks)
                        self.prompts()
                        page.evaluate("navigator.clipboard.writeText = async () => {}")
                        # Keep the card indexes stable while a button temporarily reads "Copied".
                        copy_label = "Copy for " + ("GPT Image 2.5" if model == "gpt" else "Seedream 5.0")
                        copies = page.get_by_role("button", name=re.compile(r"^(" + re.escape(copy_label) + r"|Copied)$"))
                        copies.first.click()
                        expect(page.get_by_role("status")).to_contain_text("Copied")
                        saved = self.state()[key]
                        self.assertTrue(saved)
                        page.get_by_role("switch", name="Use the clothes in the photo", exact=True).click()
                        self.assertIs(self.state()["photoClothes"], not photo_clothes)
                        if photo_clothes:
                            self.assertIn("Its clothing is not used", self.prompts()[0])
                        else:
                            self.assertNotIn("Its clothing is not used", self.prompts()[0])
                        copies.nth(1).click()
                        expect(page.get_by_text(re.compile(r"^(Copied\. )?The face has changed"))).to_have_count(0)
                        copies.first.click()
                        expect(page.get_by_role("status")).to_contain_text("Copied")
                        self.assertEqual(self.state()[key], saved, "an outfit change is not a new face")
                        page.reload()
                        self.prompts()
                        self.assertEqual(self.state()[key], saved)
                        if marks:
                            changed = self.state()
                            changed["marks"] = "a tattoo reading WORLD on the left cheek"
                            page.evaluate("([k,s]) => localStorage.setItem(k, JSON.stringify(s))", [KEY, changed])
                            page.reload()
                            self.prompts()
                            page.evaluate("navigator.clipboard.writeText = async () => {}")
                            copies.nth(1).click()
                            expect(page.get_by_text(re.compile(r"^(Copied\. )?The face has changed"))).to_be_visible()
                            copies.first.click()
                            expect(page.get_by_role("status")).to_contain_text("Copied")
                            copies.nth(1).click()
                            expect(page.get_by_text(re.compile(r"^(Copied\. )?The face has changed"))).to_have_count(0)
                        # Changing the identity source must still invalidate the copied face.
                        page.get_by_role("switch", name="Start from a photo", exact=True).click()
                        copies.nth(1).click()
                        expect(page.get_by_text(re.compile(r"^(Copied\. )?The face has changed"))).to_be_visible()

    def test_v112_photo_outfit_saved_head_compatibility(self):
        # Recorded on main 7f817d1: person from a photo, hoodie, default head settings.
        legacy = """Create a real photograph to be used as an identity reference for AI video: four close-up studio views of the same person, side by side in one image.

CHARACTER:
Use only the attached photo for this person's identity, never a person from earlier images in this conversation.
The attached photo is the only source for the face and hair: reproduce exactly the face, bone structure, eyes, eyebrows, nose, lips, jawline, skin tone and texture, hairline, hairstyle and hair color, with natural asymmetry. Do not beautify, age, de-age or restyle them.
Never flip the subject horizontally and never swap details between its left and right sides.

LAYOUT:
A 16:9 landscape image split into four equal vertical panels of the same size, separated by narrow gaps of the same grey as the backdrop.
Each panel is a tight close-up of the head and neck, framed from just above the top of the hair down to the base of the neck and cropped at the collarbones, so the head, from the top of the hair to the chin, fills about two thirds of the panel height. Nothing below the collarbones is visible: no chest and no torso.
First panel (left): front view, facing the camera, eyes looking into the lens.
Second panel: three-quarter view, head turned 45 degrees toward the right edge of the panel, showing more of the right side of the face.
Third panel: exact profile of the subject's left side, the face pointing toward the left edge of the panel.
Fourth panel (right): back view, the back of the head seen straight from behind, no face visible, showing how the hair falls at the back, its length and parting, worn down with no tie or clip.
The head is the same size and at the same height in all four panels. Long hair may be cropped by the panel edges.

EXPRESSION:
Neutral and relaxed, mouth closed.

LIGHT, BACKGROUND, CAMERA:
Seamless plain mid-grey studio backdrop, identical in all panels. Soft, even studio lighting from a large softbox slightly above the camera, neutral daylight white balance, the same light in every panel. 85mm lens, camera at the subject's eye level, same distance in every panel, deep focus so the whole head is sharp.

RENDERING:
Real photograph with natural skin, hair and fabric texture, natural color, fine film grain, no retouching."""
        note = "Its clothing is not used: the person wears only the clothing described below.\n"
        v112 = legacy.replace("Never flip", note + "Never flip", 1)
        # Lettering signatures recorded on main 7f817d1 and v112 1ebc146, in both outfit states.
        marks = "a tattoo reading HELLO on the left cheek"
        mark_line = "Distinctive marks, each exactly where described and on the stated side: " + marks + ".\n"
        lettering = "No captions, labels, panel numbers, watermarks or logos added to the image; the only lettering is the one the marks above describe."
        photo_lettering = lettering[:-1] + ", besides any logo or print on the clothing taken from the photo."
        marked_legacy = legacy.replace("Never flip", mark_line + "Never flip", 1)
        marked_v112 = v112.replace("Never flip", mark_line + "Never flip", 1)
        for model, key in (("gpt", "headSig"), ("seedream", "sdHeadSig")):
            cases = [("v112", v112, {"photoClothes": False}),
                     ("v112-outfit-changed", v112, {"photoClothes": True})]
            lettering_saves = [("v112-outfit", marked_v112 + "\n" + lettering, False),
                               ("v112-photo", marked_legacy + "\n" + photo_lettering, True)]
            if model == "gpt":
                cases.insert(0, ("main", legacy, {}))
                lettering_saves += [("main-outfit", marked_legacy + "\n" + lettering, False),
                                    ("main-photo", marked_legacy + "\n" + photo_lettering, True)]
            for version, signature, photo_clothes in lettering_saves:
                for changed in (False, True):
                    cases.append((version + ("-changed" if changed else "-same"), signature,
                                  {"marks": marks, "photoClothes": not photo_clothes if changed else photo_clothes,
                                   "topSel": [] if version == "main-photo" else ["hoodie"]}))
            for version, signature, extra in cases:
                with self.subTest(model=model, version=version):
                    page = self.load(model=model, photo=True,
                                     **{"topSel": ["hoodie"], key: signature, **extra})
                    before = self.prompts()
                    self.assertEqual(self.state()[key], signature, "keep the saved reference")
                    page.evaluate("navigator.clipboard.writeText = async () => {}")
                    copies = page.get_by_role("button", name="Copy for " + ("GPT Image 2.5" if model == "gpt" else "Seedream 5.0"), exact=True)
                    copies.nth(1).click()
                    expect(page.get_by_text(re.compile(r"^(Copied\. )?The face has changed"))).to_have_count(0)
                    copies.first.click()
                    expect(page.get_by_role("status")).to_contain_text("Copied")
                    expected = marked_legacy + "\n" + lettering if extra.get("marks") else legacy
                    self.assertEqual(self.state()[key], expected)
                    self.assertEqual(self.prompts(), before, "tracking must not change the prompts")

    def test_v112_photo_clothes_migration(self):
        cases = [({}, True), ({"topSel": ["hoodie"]}, False), ({"bottom": "green trousers"}, False),
                 ({"shoesSel": ["sneakers"]}, False), ({"accSel": ["cap"]}, True),
                 ({"photo": False, "topSel": ["hoodie"]}, True)]
        for extra, expected in cases:
            with self.subTest(extra=extra):
                self.load(model="gpt", **{"photo": True, **extra})
                self.assertIs(self.state().get("photoClothes"), expected)
                for key, value in extra.items():
                    self.assertEqual(self.state()[key], value)
                self.page.reload()
                self.page.locator("header").wait_for()
                self.assertIs(self.state()["photoClothes"], expected)
        page = self.load(photo=True, photoClothes=False, top="my green coat", sdIter="Keep my red shoes.")
        types = page.get_by_role("radiogroup", name="Type", exact=True)
        types.get_by_role("radio", name="Animal", exact=True).click()
        types.get_by_role("radio", name="Person", exact=True).click()
        self.assertIn("photoClothes", self.state())
        self.assertFalse(self.state()["photoClothes"])
        self.assertEqual(self.state()["top"], "my green coat")
        self.assertEqual(self.state()["sdIter"], "Keep my red shoes.")
        page.get_by_role("button", name="New character", exact=True).click()
        page.get_by_role("button", name="Confirm: delete this character", exact=True).click()
        self.assertTrue(self.state()["photoClothes"])

    def test_v112_inactive_photo_save_migration(self):
        for extra, expected in [({"mode": "animal", "photo": False, "modeCfg": {"person": {"photo": True}}}, False),
                                ({"mode": "animal", "photo": True, "modeCfg": {"person": {"photo": False}}}, True),
                                ({"child": True, "childPhotoBak": 1}, False)]:
            with self.subTest(extra=extra):
                page = self.load(topSel=["hoodie"], **extra)
                self.assertIs(self.state()["photoClothes"], expected)
                page.get_by_role("radiogroup", name="Type", exact=True).get_by_role("radio", name="Person", exact=True).click()
                self.assertIs(self.state()["photoClothes"], expected)
                self.assertEqual(self.state()["topSel"], ["hoodie"])

    def test_v112_photo_clothes_defaults_and_overrides(self):
        for model in ("gpt", "seedream"):
            for extra in ({}, {"topSel": ["hoodie"]}):
                with self.subTest(model=model, extra=extra):
                    self.load(model=model, photo=True, photoClothes=False, **extra)
                    head, body = self.prompts()
                    self.assertIn("Its clothing is not used", head)
                    self.assertIn("plain straight trousers" if extra else "simple realistic everyday outfit", body.lower())
                    self.assertNotIn("taken from the photo", head + body)
            self.load(model=model, photo=True, photoClothes=True, bodyRef=True)
            self.assertNotIn("its clothes will come from it", self.page.locator("header").inner_text())
            self.assertNotIn("Exactly as in the attached photo", self.prompts()[1])
            self.load(model=model, photo=True, photoClothes=False, bodyAsIs=True, topSel=["hoodie"])
            self.assertIn("Only the body comes from", self.prompts()[1])

    def test_v112_seedream_new_cases(self):
        cases = [{"style": style, **kind} for style in ("3d", "2d")
                 for kind in ({}, {"child": True}, {"child": True, "baby": True})]
        cases += [{"photo": True}, {"photo": True, "photoOnly": True},
                  {"style": "3d", "headless": True, "bodyRef": True, "sdShapeRef": True}]
        for extra in cases:
            with self.subTest(extra=extra):
                page = self.load(multiChar=True, name="Lena", **extra)
                expect(page.get_by_text("Not available with Seedream yet", exact=True)).to_have_count(0)
                texts = self.prompts()
                self.assertEqual(len(texts), 1 if extra.get("baby") else 2)
                self.assertNotRegex("\n".join(texts), r"conversation|this message|GENERATION LIMIT|regenerate|Lena|undefined|NaN")
                for button in page.get_by_role("button", name="Copy for Seedream 5.0", exact=True).all():
                    expect(button).to_be_enabled()
                if extra.get("child"):
                    lead = "3D animated feature film character image" if extra["style"] == "3d" else "2D animation character model sheet illustration"
                    self.assertTrue(all(t.startswith(lead) for t in texts))
                    self.assertNotRegex("\n".join(texts), r"photograph|film grain|not a 3D render|tanga|cleavage")
                    if extra.get("baby"):
                        self.assertIn("full-length cotton sleepsuit", texts[0])
                else:
                    self.assertNotIn("Retouch (optional)", page.locator(CARD_H3).all_text_contents())

    def test_v112_person_photo_references_and_copies(self):
        cases = [({}, True), ({"photoClothes": False}, False),
                 ({"photoClothes": False, "bodyAsIs": True}, True),
                 ({"photoClothes": True, "bodyRef": True}, False),
                 ({"photoOnly": True, "bodyRef": True}, None)]
        for extra, photo2 in cases:
            with self.subTest(extra=extra):
                page = self.load(photo=True, **extra)
                head, body = self.prompts()
                body_card = page.locator('pre[data-out="body"]').locator("xpath=ancestor::div[contains(@class, 'bg-card')][1]")
                if photo2 is None:
                    self.assertNotIn("head sheet", body)
                    expect(body_card).to_contain_text("Your photo or photos")
                else:
                    self.assertIn("Image 1 is this character's head sheet", body)
                    self.assertEqual("Image 2 is a photo" in body, photo2)
                    self.assertEqual("; 2. your photo." in body_card.inner_text(), photo2)
                page.evaluate("() => { window.copied = []; navigator.clipboard.writeText = async text => { window.copied.push(text); }; }")
                buttons = page.get_by_role("button", name="Copy for Seedream 5.0", exact=True).element_handles()
                buttons[0].click()
                expect(page.get_by_role("status")).to_contain_text("your photo or photos" if photo2 is None else "your photo as image 1")
                buttons[1].click()
                expect(page.get_by_role("status")).to_contain_text("your photo or photos" if photo2 is None else "head sheet")
                self.assertEqual(page.evaluate("window.copied"), [head, body])
                if photo2 is not None:
                    self.assertEqual("your photo as image 2" in page.get_by_role("status").inner_text(), photo2)

    def test_v112_photo_only_gpt_card_and_neutral_wording(self):
        page = self.load(model="gpt", photo=True, photoOnly=True, bodyRef=True)
        self.prompts()
        card = page.locator('pre[data-out="body"]').locator("xpath=ancestor::div[contains(@class, 'bg-card')][1]")
        text = card.inner_text().split("Hide the prompt")[0]
        self.assertIn("Your photo", text)
        self.assertNotIn("head sheet", text)
        for model in ("gpt", "seedream"):
            self.load(model=model, style="3d", pres="x")
            texts = "\n".join(self.prompts())
            self.assertIn("typical adult person", texts)
            self.assertNotIn("adult adult", texts)
        for sex in ("f", "m"):
            self.load(style="3d", pres=sex, age=18)
            self.assertTrue(all("18-year-old adult" in t for t in self.prompts()))

    def test_v112_existing_automatic_engines(self):
        for extra, model in [({"mode": "object"}, "seedream"),
                             ({"mode": "animal", "photo": True}, "seedream"),
                             ({"style": "photo"}, "seedream"),
                             ({"style": "3d"}, "gpt"), ({"photo": True}, "gpt"),
                             ({"child": True, "style": "2d"}, "gpt")]:
            with self.subTest(extra=extra):
                self.load(modelPick=0, **extra)
                self.assertEqual(self.state()["model"], model)
                self.page.reload()
                self.page.locator("header").wait_for()
                self.assertEqual(self.state()["model"], model)

    def test_v112_photo_controls_languages_keyboard_mobile(self):
        for language in ("en", "fr"):
            for extra in ({}, {"mode": "animal"}, {"mode": "object", "objCat": "house"},
                          {"mode": "object", "objCat": "interior"}, {"mode": "object", "objCat": "vehicle"}):
                with self.subTest(language=language, extra=extra):
                    page = self.load(uiLang=language, photo=True, **extra)
                    page.set_viewport_size({"width": 390, "height": 844})
                    label = "Sheet layout only" if language == "en" else "Mise en planche seulement"
                    if extra.get("mode") == "object":
                        place = extra["objCat"] in ("house", "interior")
                        label = (("Keep the place in the photo as is" if place else "Keep the object in the photo as is")
                                 if language == "en" else ("Garder le lieu de la photo tel quel" if place else "Garder l'objet de la photo tel quel"))
                    control = page.get_by_role("switch", name=label, exact=True)
                    tip = page.locator("#sd-tip-photoonly")
                    expect(tip).to_have_css("visibility", "hidden")
                    control.focus()
                    expect(tip).to_have_css("visibility", "visible")
                    expect(tip).to_contain_text("Ticked:" if language == "en" else "Coché :")
                    self.assertNotRegex(tip.text_content(), r"GPT|conversation")
                    control.press("Space")
                    self.assertTrue(self.state()["photoOnly"])
                    clothes = page.get_by_role("switch", name="Use the clothes in the photo" if language == "en" else "Utiliser les habits de la photo", exact=True)
                    expect(clothes).to_have_count(0)
                    control.press("Space")
                    self.assertFalse(self.state()["photoOnly"])
                    if extra.get("mode", "person") == "person":
                        expect(clothes).to_be_checked()
                        clothes.focus()
                        clothes.press("Space")
                        self.assertFalse(self.state()["photoClothes"])
                    else:
                        expect(clothes).to_have_count(0)

    def test_v112_mobile_person_copies(self):
        for extra in ({"style": "3d", "headless": True}, {"photo": True},
                      {"photo": True, "photoOnly": True, "bodyRef": True}):
            with self.subTest(extra=extra):
                page = self.load(**extra)
                page.set_viewport_size({"width": 320, "height": 844})
                texts = self.prompts()
                bar = page.locator("div.fixed.inset-x-0.bottom-0")
                buttons = bar.get_by_role("button")
                expect(buttons).to_have_count(2)
                self.assertNotIn("Your three steps", bar.inner_text())
                page.evaluate("() => { window.copied = []; navigator.clipboard.writeText = async text => { window.copied.push(text); }; }")
                for i in range(2):
                    buttons.nth(i).click()
                    self.assertEqual(page.evaluate("window.copied"), texts[:i + 1])


    def test_v114_free_outfit_replaces_hidden_choices(self):
        outfit = "emerald velvet jacket, silver necklace"
        for model in ("gpt", "seedream"):
            for style in ("photo", "3d", "2d"):
                with self.subTest(model=model, style=style):
                    page = self.load(model=model, style=style, outfitFree=True, outfitText=outfit,
                                     topSel=["hoodie"], accSel=["cap"], colorSel=["red"], wear=3)
                    head, body = self.prompts()[:2]
                    self.assertIn(outfit, head.lower())
                    self.assertIn(outfit, body.lower())
                    self.assertNotRegex(head + body, r"hoodie|baseball cap|outfit condition")
                    self.assertNotIn("Fully clothed", body)
                    page.get_by_role("tab", name="Outfit", exact=True).click()
                    switch = page.get_by_role("switch", name="Outfit in a single text", exact=True)
                    expect(switch).to_be_checked()
                    expect(page.locator("#c-outfitText")).to_have_value(outfit)
                    switch.click()
                    self.assertIn("hoodie", self.prompts()[1].lower())
                    self.assertEqual(self.state()["outfitText"], outfit)

    def test_v114_vehicle_reaches_triptych_and_separate_views(self):
        for model in ("gpt", "seedream"):
            with self.subTest(model=model):
                self.load(model=model, mode="object", objCat="vehicle",
                          objDesc="wooden sailing yacht", objViews=[0, 2])
                prompts = self.prompts()
                self.assertEqual(len(prompts), 3, "triptych and two separate images")
                for prompt in prompts:
                    self.assertIn("plain grey cradle", prompt)
                    self.assertNotIn("on its wheels", prompt)

    def test_v114_face_character_has_scope_and_manual_priority(self):
        for model in ("gpt", "seedream"):
            for character, phrase in (("gueule", "a rugged, weathered face"),
                                      ("mechant", "a menacing, cold face"),
                                      ("gentil", "a kind, warm, trustworthy face"),
                                      ("ange", "an angelic, innocent face")):
                with self.subTest(model=model, character=character):
                    self.load(model=model, faceChar=character, jaw="strong", faceSeed=5)
                    head, body = self.prompts()[:2]
                    self.assertIn("Character of the face, readable at rest: " + phrase, head)
                    self.assertIn("strong, defined jawline", head)
                    self.assertNotIn("Character of the face", body)

    def test_v114_empty_mobile_retouch_guides_without_copy(self):
        page = self.load(headless=True, sdIterOp="free", sdIter="")
        page.set_viewport_size({"width": 320, "height": 844})
        self.prompts()
        expect(page.get_by_role("button", name="Copy for Seedream 5.0", exact=True).nth(2)).to_be_disabled()
        page.evaluate("() => { window.copied = []; navigator.clipboard.writeText = async text => { window.copied.push(text); }; }")
        button = page.locator("div.fixed.inset-x-0.bottom-0").get_by_role("button", name="Retouch", exact=True)
        expect(button).to_be_enabled()
        button.click()
        expect(page.get_by_role("status")).to_contain_text("Choose or write a retouch in card 3.")
        menu = page.locator("#sd-card-iter details").filter(has=page.locator("summary", has_text="Choose the retouch"))
        expect(menu).to_have_count(1)
        self.assertTrue(menu.evaluate("element => element.open"))
        self.assertEqual(page.evaluate("window.copied"), [])

    def test_v114_free_outfit_changes_preserve_copied_face(self):
        for model, key in (("gpt", "headSig"), ("seedream", "sdHeadSig")):
            with self.subTest(model=model):
                page = self.load(model=model, photo=True, photoClothes=False, outfitFree=True,
                                 outfitText="emerald velvet jacket, silver necklace",
                                 marks="a tattoo reading HELLO on the left cheek")
                self.assertIn("emerald velvet jacket", self.prompts()[0].lower())
                page.evaluate("() => { navigator.clipboard.writeText = async text => {}; }")
                label = "Copy for " + ("GPT Image 2.5" if model == "gpt" else "Seedream 5.0")
                copies = page.get_by_role("button", name=re.compile("^(" + re.escape(label) + "|Copied)$"))
                copies.first.click()
                expect(page.get_by_role("status")).to_contain_text("Copied")
                signature = self.state()[key]
                page.get_by_role("tab", name="Outfit", exact=True).click()
                page.locator("#c-outfitText").fill("purple silk shirt, gold necklace")
                copies.nth(1).click()
                expect(page.get_by_text(re.compile(r"^(Copied\. )?The face has changed"))).to_have_count(0)
                copies.first.click()
                expect(page.get_by_role("status")).to_contain_text("Copied")
                self.assertEqual(self.state()[key], signature)
                changed = self.state()
                changed["marks"] = "a tattoo reading WORLD on the left cheek"
                page.evaluate("([k,s]) => localStorage.setItem(k, JSON.stringify(s))", [KEY, changed])
                page.reload()
                self.prompts()
                page.evaluate("() => { navigator.clipboard.writeText = async text => {}; }")
                copies.nth(1).click()
                expect(page.get_by_text(re.compile(r"^(Copied\. )?The face has changed"))).to_be_visible()


    def test_v114_free_outfit_normalization_and_logo_wording(self):
        for model in ("gpt", "seedream"):
            for text in ("", "  ", "random", "au hasard", "aléatoire"):
                with self.subTest(model=model, text=text):
                    self.load(model=model, outfitFree=True, outfitText=text,
                              topSel=["hoodie"], colorSel=["red"], accSel=["cap"])
                    head, body = self.prompts()[:2]
                    # v157 (owner: no placeholder top on an adult's head sheet, so Seedance never reuses it): a bare neck instead
                    self.assertRegex(head, r"(?m)^Bare neck")
                    self.assertNotIn("crew-neck top", head)
                    self.assertIn("simple realistic everyday outfit in plain solid colors", body)
                    self.assertNotRegex(head + body, r"hoodie|baseball cap|except any logo")
            self.load(model=model, outfitFree=True,
                      outfitText="  white Nike t-shirt,\nblue jeans\n\nsilver necklace.  ",
                      marks="a tattoo reading HELLO on the left cheek")
            for prompt in self.prompts()[:2]:
                self.assertIn("white nike t-shirt; blue jeans; silver necklace", prompt.lower())
                self.assertIn("except any logo or print this outfit description names", prompt)
                self.assertIn("the only lettering is the one the marks above describe", prompt)

    def test_v114_free_outfit_exclusions_and_reference_retouch(self):
        for model in ("gpt", "seedream"):
            for extra in ({"child": True}, {"child": True, "baby": True},
                          {"photo": True, "photoClothes": True}, {"bodyRef": True}):
                with self.subTest(model=model, extra=extra):
                    self.load(model=model, outfitFree=True, outfitText="orange velvet coat", **extra)
                    self.assertNotIn("orange velvet coat", "\n".join(self.prompts()[:2]).lower())
                    self.assertEqual(self.state()["outfitText"], "orange velvet coat")
        page = self.load(bodyRef=True, headless=True, sdIterOp="dressMine", outfitFree=True,
                         outfitText="green cotton shirt, blue jeans, red hat and sunglasses")
        head, body, edit = self.prompts()[:3]  # then the final photo pass (v155)
        self.assertNotIn("green cotton shirt", head + body)
        self.assertIn("green cotton shirt", edit.lower())
        self.assertIn("anything worn on the head or the face stays outside the frame", edit)
        self.assertIn("except any logo or print this outfit description names", edit)
        page.get_by_role("tab", name="Outfit", exact=True).click()
        # v153: with the reference outfit on, the switch says which retouch uses the text
        expect(page.get_by_role("switch", name=re.compile(r"^Outfit in a single text(, for “Dress in my outfit”)?$"))).to_be_checked()
        page.reload()
        self.prompts()
        self.assertIn("green cotton shirt", self.iter_prompt().lower())

    def test_v114_saved_free_outfit_signature_and_real_character_change(self):
        for model, key in (("gpt", "headSig"), ("seedream", "sdHeadSig")):
            with self.subTest(model=model):
                page = self.load(model=model, photo=True, photoClothes=False, outfitFree=True,
                                 outfitText="green cotton shirt", marks="a tattoo reading HELLO on the cheek")
                self.prompts()
                label = "Copy for " + ("GPT Image 2.5" if model == "gpt" else "Seedream 5.0")
                copies = page.get_by_role("button", name=re.compile("^(" + re.escape(label) + "|Copied)$"))
                page.evaluate("() => { navigator.clipboard.writeText = async text => {}; }")
                copies.first.click()
                expect(page.get_by_role("status")).to_contain_text("Copied")
                state = self.state()
                clean = state[key]
                # v114b's saved GPT-derived signature retained both clothing-only clauses.
                clothing = next(line for line in clean.splitlines() if line.startswith("No captions"))
                legacy = clean.replace(clothing, clothing[:-1] + ", except any logo or print this outfit description names.")
                legacy = legacy.replace("Never flip", "Clothing and accessories of this outfit, identical in every panel, only the parts a head close-up shows (the neckline at the bottom edge, and anything worn at the neck, on the head or on the face): green cotton shirt.\nNever flip")
                state[key] = legacy
                state["outfitFree"] = False
                state["photoClothes"] = True
                page.evaluate("([k,s]) => localStorage.setItem(k, JSON.stringify(s))", [KEY, state])
                page.reload()
                self.prompts()
                page.evaluate("() => { navigator.clipboard.writeText = async text => {}; }")
                copies.nth(1).click()
                expect(page.get_by_text(re.compile(r"^(Copied\. )?The face has changed"))).to_have_count(0)
                copies.first.click()
                expect(page.get_by_role("status")).to_contain_text("Copied")
                self.assertEqual(self.state()[key], clean)
                page = self.load(model=model, faceChar="gentil")
                self.prompts()
                page.evaluate("() => { navigator.clipboard.writeText = async text => {}; }")
                copies = page.get_by_role("button", name=re.compile("^(" + re.escape(label) + "|Copied)$"))
                copies.first.click()
                expect(page.get_by_role("status")).to_contain_text("Copied")
                page.get_by_role("tab", name="Face", exact=True).click()
                page.get_by_role("radio", name="Menacing", exact=True).click()
                copies.nth(1).click()
                expect(page.get_by_text(re.compile(r"^(Copied\. )?The face has changed"))).to_be_visible()

    def test_v114_vehicle_word_cases(self):
        cases = json.loads((ROOT / "tests/v110b/vehicle_words.json").read_text())
        source = (ROOT / "seedream_new.js").read_text()
        start, end = source.index("var SD_VEH = ["), source.index("function sdVehicle()")
        original = (ROOT / "new/pretty.js").read_text()
        clean_start = original.index("function t5(")
        clean_end = original.index("\nfunction ", clean_start + 1)
        page = self.load(mode="object", objCat="vehicle")
        result = page.evaluate("cases => { let e; " + original[clean_start:clean_end] + source[start:end] +
                               "\nreturn cases.map(c => { e = Object.assign({objDesc:c[0]}, c[2] || {}); return sdVehKind(); }); }", cases)
        self.assertEqual(len(cases), 74)
        self.assertEqual(result, [case[1] for case in cases])

    def test_v114_vehicle_categories_and_photo_only(self):
        cases = [("1930s biplane", "The aircraft stands level"), ("vélo de course", "front wheel pointing straight ahead"),
                 ("char d’assaut", "on its tracks"), ("horse-drawn carriage", "normal parked position"),
                 ("jet-black sports car", "all doors, hood and trunk closed")]
        for model in ("gpt", "seedream"):
            for description, text in cases:
                with self.subTest(model=model, description=description):
                    self.load(model=model, mode="object", objCat="vehicle", objDesc=description, objViews=[0, 2])
                    self.assertTrue(all(text in prompt for prompt in self.prompts()))
            self.load(model=model, mode="object", objCat="vehicle", photo=True, objViews=[0, 2])
            self.assertTrue(all("normal parked position" in prompt for prompt in self.prompts()))
            self.load(model=model, mode="object", objCat="vehicle", photo=True, photoOnly=True,
                      objDesc="wooden sailing yacht", objViews=[0, 2])
            prompts = self.prompts()
            self.assertEqual(len(prompts), 3)
            self.assertNotIn("cradle", "\n".join(prompts))

    def test_v114_character_auto_exclusions_and_styles(self):
        for model in ("gpt", "seedream"):
            self.load(model=model)
            default = self.prompts()
            self.load(model=model, faceChar="auto")
            self.assertEqual(self.prompts(), default)
            for extra in ({"photo": True}, {"child": True}, {"child": True, "baby": True}, {"mode": "animal"}):
                self.load(model=model, faceChar="mechant", **extra)
                self.assertNotIn("Character of the face", "\n".join(self.prompts()))
            for style in ("3d", "2d"):
                self.load(model=model, faceChar="mechant", style=style)
                self.assertIn("a menacing, cold face", self.prompts()[0])
            self.load(model=model, faceChar="toString")
            self.assertNotIn("Character of the face", "\n".join(self.prompts()))
        page = self.load(faceChar="gentil")
        page.get_by_role("tab", name="Face", exact=True).click()
        page.get_by_role("button", name="Other face", exact=True).first.click()
        self.assertEqual(self.state()["faceChar"], "gentil")

    def test_v114_character_seeded_traits_and_beauty_priority(self):
        hard = {"ange": ["a strong, well-projected chin", "a cleft chin", "a strong, square chin", "a prominent, forward chin", "a softly square face"],
                "gentil": ["a strong, well-projected chin", "a strong, square chin", "a prominent, forward chin"]}
        for model in ("gpt", "seedream"):
            for character, excluded in hard.items():
                for seed in range(1, 13):
                    with self.subTest(model=model, character=character, seed=seed):
                        self.load(model=model, pres="m", age=35, looks=2, faceChar=character, faceSeed=seed)
                        structure = next(line for line in self.prompts()[0].splitlines() if line.startswith("Face structure"))
                        for text in excluded:
                            self.assertNotIn(text, structure)
            for looks in (0, 2, 4):
                self.load(model=model, faceChar="ange", looks=looks, pres="m")
                head = self.prompts()[0]
                self.assertIn("Character of the face", head)
                if looks == 4:
                    self.assertIn("homely", head)
                    self.assertLess(head.index("Character of the face"), head.index("homely"))
        for character, seed in (("ange", 1), ("gentil", 1), ("ange", 23757)):
            self.load(faceChar=character, faceSeed=seed, pres="m", looks=0, age=35)
            head = self.prompts()[0]
            self.assertIn("a clearly defined jaw with softly rounded corners", head)
            self.assertNotIn("a strong, projected chin, a clean jaw-to-neck line", head)
        for model, sex, looks, seed in (("gpt", "f", 0, 14), ("seedream", "f", 4, 40), ("gpt", "f", 4, 40), ("seedream", "m", 0, 7)):
            self.load(model=model, pres=sex, looks=looks, faceSeed=seed, faceChar="mechant")
            line = next(x for x in self.prompts()[0].splitlines() if x.startswith("Face structure"))
            self.assertEqual(len(re.findall(r"a narrow face|a face of medium width|a broad face", line)), 1)
            self.assertNotRegex(line, r"(small eyes|round eyes|deep-set eyes), .*\1")

    def test_v114_retouch_menu_applicability_and_saved_operations(self):
        for headless, expected in ((False, ["Dress in my outfit", "Free retouch"]),
                                   (True, ["Combine head and body", "Dress for assembly", "Dress in my outfit", "Add the heads", "Free retouch"])):
            page = self.load(headless=headless)
            self.prompts()
            card = page.locator("#sd-card-iter")
            self.assertEqual(card.locator("button[aria-pressed]").all_text_contents(), expected)
        for operation, text, expected_title, active in (("bogus", "Keep the shoes.", "Free retouch", True),
                                                       ("dress", "Make the jacket blue.", "Free retouch", True),
                                                       ("join", "Combine image 1 with image 2.", "Retouch (optional)", False),
                                                       ("heads", "Add the head from image 2.", "Retouch (optional)", False)):
            with self.subTest(operation=operation):
                page = self.load(sdIterOp=operation, sdIter=text)
                prompts = self.prompts()
                expect(page.locator("#sd-card-iter h3")).to_have_text(expected_title)
                self.assertEqual(len(prompts), 4 if active else 3)  # the final photo pass (v155) comes last
                if active:
                    self.assertIn(text.rstrip("."), self.iter_prompt())
                else:
                    self.assertEqual(self.state()["sdIter"], text, "hidden saved text stays available")
                    self.assertEqual(page.locator("#sd-iter").input_value(), "")
                    page.get_by_role("tab", name="Body", exact=True).click()
                    page.get_by_role("switch", name="Headless body sheet", exact=True).click()
                    self.prompts()
                    self.assertIn(text.rstrip("."), self.iter_prompt())
        page = self.load(sdIterOp="dressMine")
        self.prompts()
        page.locator("#sd-iter").fill("x")
        page.locator("#sd-iter").fill("")
        self.assertEqual(self.state()["sdIterOp"], "dressMine")
        self.prompts()
        self.assertIn("Edit image 1", self.iter_prompt())

    def test_v114_mobile_retouch_label_follows_headless_toggle(self):
        text = "Make the jacket blue, keeping its silver buttons."
        for language in ("en", "fr"):
            with self.subTest(language=language):
                page = self.load(uiLang=language, headless=True, sdIterOp="dress",
                                 sdIter=text, sdIterPre="Original clothing preset.")
                page.set_viewport_size({"width": 390, "height": 844})
                bar = page.locator("#sd-mobile-copy-bar")
                dress = "Dress" if language == "en" else "Habiller"
                retouch = "Retouch" if language == "en" else "Retouche"
                expect(bar.get_by_role("button", name=dress, exact=True)).to_be_visible()
                page.get_by_role("tab", name="Body" if language == "en" else "Corps", exact=True).click()
                headless = page.get_by_role("switch", name="Headless body sheet" if language == "en" else "Planche corps sans tête", exact=True)
                headless.click()
                self.prompts()
                prompt = self.iter_prompt()
                expect(page.locator("#sd-card-iter h3")).to_have_text("Free retouch" if language == "en" else "Retouche libre")
                expect(bar.get_by_role("button", name=retouch, exact=True)).to_be_visible()
                expect(bar.get_by_role("button", name=dress, exact=True)).to_have_count(0)
                page.evaluate("() => { window.copied = []; navigator.clipboard.writeText = async text => { window.copied.push(text); }; }")
                bar.get_by_role("button", name=retouch, exact=True).click()
                page.wait_for_function("window.copied.length === 1")
                self.assertEqual(page.evaluate("window.copied"), [prompt])
                self.assertEqual(self.state()["sdIter"], text)
                self.assertEqual(self.state()["sdIterOp"], "dress")
                self.assertEqual(self.state()["sdIterPre"], "Original clothing preset.")
                headless.click()
                # v153: the card names the preset in full, the bar keeps its short label
                expect(page.locator("#sd-card-iter h3")).to_have_text("Dress for assembly" if language == "en" else "Habiller pour l'assemblage")
                expect(bar.get_by_role("button", name=dress, exact=True)).to_be_visible()
                self.prompts()
                self.assertIn(text.rstrip("."), self.iter_prompt())
                self.assertEqual(self.state()["sdIter"], text)

    def test_v114_mobile_layout_and_tabs(self):
        for language in ("en", "fr"):
            for width in (320, 340, 390):
                for extra in ({"headless": True}, {"sdIterOp": "dressMine"}, {"model": "gpt"},
                              {"mode": "object", "objViews": [0, 2, 4, 5]}):
                    with self.subTest(language=language, width=width, extra=extra):
                        page = self.load(uiLang=language, **extra)
                        page.set_viewport_size({"width": width, "height": 844})
                        boxes = page.locator("#sd-mobile-copy-bar button").evaluate_all("items => items.map(x => { const b=x.getBoundingClientRect(); return [x.textContent,b.left,b.right,b.height]; })")
                        self.assertTrue(boxes)
                        self.assertTrue(all(left >= 0 and right <= width and height <= 50 for _, left, right, height in boxes), boxes)
                        # v152 design: the tab row never wraps, it scrolls sideways; the row stays inside the page and every tab can be
                        # scrolled fully into it
                        tabs = page.get_by_role("tablist").evaluate("""list => { const r = list.getBoundingClientRect();
                          return [r.left >= -1 && r.right <= innerWidth + 1].concat([...list.querySelectorAll('[role=tab]')].map(t => {
                            t.scrollIntoView({ block: "nearest", inline: "nearest" }); const a = list.getBoundingClientRect(), b = t.getBoundingClientRect();
                            return b.left >= a.left - 1 && b.right <= a.right + 1; })); }""")
                        self.assertTrue(len(tabs) > 1 and all(tabs), tabs)
                        self.assertLessEqual(page.evaluate("document.documentElement.scrollWidth"), width)

    def test_v114_child_options_preserve_adult_save(self):
        for model in ("gpt", "seedream"):
            for color in ("saltpepper", "grey", "white"):
                page = self.load(model=model, child=True, hairColor=color, hairStyleSel="receding", shoesSel=["heels"])
                self.assertNotRegex("\n".join(self.prompts()), r"salt-and-pepper|white hair|grey hair|receding|heeled")
                self.assertEqual(self.state()["hairColor"], color)
                self.assertEqual(self.state()["hairStyleSel"], "receding")
                self.assertEqual(self.state()["shoesSel"], ["heels"])
                page.get_by_role("tab", name="Hair", exact=True).click()
                panel = page.locator("#ctl-panel")
                self.assertNotRegex(panel.inner_text(), r"Salt-and-pepper|\bGrey\b|\bWhite\b|Receding")
                expect(panel.get_by_role("radio", name="Bald", exact=True)).to_have_count(1)
                page.get_by_role("tab", name="Outfit", exact=True).click()
                expect(panel.get_by_role("button", name="Heels", exact=True)).to_have_count(0)

    def test_v114_contextual_help_and_hidden_values(self):
        for language in ("en", "fr"):
            for model in ("gpt", "seedream"):
                for extra, phrase in (({}, "head and body in four views" if language == "en" else "tête et corps en quatre vues"),
                                      ({"mode": "animal"}, "whole animal in four views, optional head close-ups" if language == "en" else "l'animal entier en quatre vues, gros plans de tête en option"),
                                      ({"mode": "object", "objCat": "clothing"}, "the category, the selected views" if language == "en" else "la catégorie, les vues choisies"),
                                      ({"mode": "object", "objCat": "house"}, "the house stands on a grey floor" if language == "en" else "la maison est posée sur un sol gris")):
                    with self.subTest(language=language, model=model, extra=extra):
                        page = self.load(model=model, uiLang=language, photo=True, photoOnly=True, **extra)
                        expect(page.get_by_text(phrase, exact=False)).to_be_visible()
                        expect(page.get_by_role("button", name="Random character" if language == "en" else "Personnage au hasard", exact=True)).to_have_count(0)
                        if extra.get("objCat") == "house":
                            grey = page.get_by_role("radio", name="Neutral grey floor and backdrop" if language == "en" else "Sol et fond gris neutre", exact=True)
                            grey.click()
                            self.assertIn("flat, plain neutral 18% grey floor", "\n".join(self.prompts()))
            page = self.load(uiLang=language, photo=True, bodyRef=True, photoClothes=True)
            expect(page.get_by_role("switch", name="Use the clothes in the photo" if language == "en" else "Utiliser les habits de la photo", exact=True)).to_have_count(0)
            self.assertTrue(self.state()["photoClothes"])
            page = self.load(uiLang=language, bodyRef=True, headless=False, sdShapeRef=True,
                             sdBodyImg=True, chest=4, refCover="fitted")
            page.get_by_role("tab", name="Outfit" if language == "en" else "Tenue", exact=True).click()
            expect(page.get_by_text(re.compile("^With the head, Seedream does not use this choice" if language == "en" else "^Avec la tête, Seedream n'utilise pas ce choix"))).to_be_visible()
            expect(page.get_by_text(re.compile("^Option: bust shape" if language == "en" else "^Option : forme de poitrine"))).to_have_count(0)
            self.assertTrue(self.state()["sdShapeRef"])
            self.assertNotIn("Fitted top with a Very generous bust" if language == "en" else "Haut ajusté avec une poitrine Très généreuse", page.locator("#ctl-panel").inner_text())
            page.get_by_role("radio", name="My settings" if language == "en" else "Mes réglages", exact=True).click()
            expect(page.get_by_text(re.compile("^Option: bust shape" if language == "en" else "^Option : forme de poitrine"))).to_be_visible()

    def test_v114_names_auto_help_and_word_warning(self):
        for mode, name, field, reset in (("person", "Rose", "Character name", "New character"),
                                         ("animal", "Neige", "Animal's name", "New animal")):
            page = self.load(mode=mode, name=name, modelPick=0)
            expect(page.get_by_label(field, exact=True)).to_have_value(name)
            hint = page.get_by_text(re.compile("^Automatically chosen model:"))
            expect(hint).to_contain_text("animals, objects and places")
            page.get_by_role("radio", name="GPT Image 2.5", exact=True).click()
            expect(hint).to_have_count(0)
            expect(page.get_by_label(field, exact=True)).to_have_value(name)
            page.get_by_role("button", name=reset, exact=True).click()
            page.get_by_role("button", name="Confirm: delete this " + ("animal" if mode == "animal" else "character"), exact=True).click()
            expect(page.get_by_role("status")).to_have_text("New animal." if mode == "animal" else "New character: settings reset and a new face.")
            expect(page.get_by_label(field, exact=True)).to_have_value("")
        for language in ("en", "fr"):
            page = self.load(uiLang=language, outfitFree=True, outfitText=" ".join(["silver"] * 610))
            prompts = self.prompts()
            for key, prompt in zip(("head", "body"), prompts):
                count = len(prompt.split())
                self.assertGreater(count, 600)
                warning = page.locator(f"#sd-card-{key} > p.text-destructive")
                expect(warning).to_be_visible()
                self.assertEqual(int(re.sub(r"[^0-9]", "", re.match(r"[0-9,\s]+", warning.inner_text())[0])), count)
                self.assertTrue(warning.evaluate("p => p.previousElementSibling.tagName === 'BUTTON'"))


if __name__ == "__main__":
    unittest.main()
