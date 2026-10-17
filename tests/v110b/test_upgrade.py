"""Acceptance checks for the owner's integrations, using the existing Playwright dependency.

    python tests/v110b/test_upgrade.py [path/to/built.html]
"""

import json
import pathlib
import re
import sys
import unittest

from playwright.sync_api import expect, sync_playwright

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
            expect(empty_edit.locator("xpath=../..").get_by_role("button", name="Copy for Seedream 5.0", exact=True)).to_be_disabled()
        texts = self.page.locator('pre:not([data-out="iter"]):visible, pre[data-out="iter"]:not(:empty):visible').all_text_contents()
        self.assertTrue(texts and all(t.strip() for t in texts), "missing prompt")
        return texts

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
        cards = self.page.locator("h3").all_text_contents()
        self.assertEqual(len([c for c in cards if re.match(r"^View \d:", c)]), 2)
        self.page.reload()
        self.page.locator("header").wait_for()
        self.assertEqual(self.state()["objViews"], [0, 5])

    def test_existing_seedream_photo_paths(self):
        self.load(mode="animal", photo=True)
        self.assertEqual(len(self.prompts()), 2)
        self.assertEqual(self.page.locator("h3").all_text_contents()[:2], ["Animal sheet", "Head close-ups (optional)"])
        self.load(mode="object", objCat="clothing", photo=True, photoOnly=True, objMannequin=True)
        self.assertIn("invisible mannequin", self.prompts()[0])
        expect(self.page.get_by_text("On an invisible mannequin", exact=True)).to_be_visible()

    def test_child_word_filter(self):
        source = (ROOT / "seedream_new.js").read_text()
        start = source.index("var SD_CHILD_BAN_TERMS")
        end = source.index("\n}\n", source.index("function sdChildOk")) + 3
        words = json.loads((ROOT / "tests/v110b/child_words.json").read_text())
        page = self.load(child=True)
        result = page.evaluate("words => {" + source[start:end] + "\nreturn words.map(sdChildOk); }", words["BLOCK"] + words["ALLOW"])
        self.assertEqual(result[:len(words["BLOCK"])], [False] * len(words["BLOCK"]))
        self.assertEqual(result[len(words["BLOCK"]):], [True] * len(words["ALLOW"]))

    def test_join_migration_preserves_personal_text(self):
        presets = json.loads((ROOT / "tests/v110b/join_presets.json").read_text())
        for text in presets:
            self.load(age=31, sdIterOp="join", sdIter=text, sdIterPre=text)
            self.assertIn("85% of the panel height", self.state()["sdIter"])
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
            self.assertIn("flat, plain mid-grey floor", texts[0])
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
                            self.assertNotIn("At night", self.page.locator("h3").all_text_contents()[-1])
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
                            reset = page.get_by_role("button", name="New object" if language == "en" else "Nouvel objet", exact=True)
                            for width in (390, 320):
                                page.set_viewport_size({"width": width, "height": 844})
                                reset.scroll_into_view_if_needed()
                                page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
                                self.assertLessEqual(reset.evaluate("e => e.getBoundingClientRect().bottom"),
                                                     fixed_bar.evaluate("e => e.getBoundingClientRect().top"))
                                reset.click(trial=True)
                            reset.click()
                            expect(page.get_by_role("button", name="Confirm: delete this object" if language == "en" else "Confirmer : effacer cet objet", exact=True)).to_be_visible()

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
        expect(page.locator("div.fixed").get_by_role("button", name="Dress", exact=True)).to_be_visible()
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
        self.assertIn("real male model", texts[0])
        self.assertIn("beard shadow", texts[0])
        self.assertIn("hem reaches the waistband", texts[1])
        self.assertNotIn("cropped top", texts[1])
        self.load(pres="f", looks=0)
        self.assertNotIn("real male model", self.prompts()[0])

    def test_canon_keeps_explicit_face_traits(self):
        self.load(pres="m", looks=0)
        self.assertIn("a clearly defined jaw, thick natural eyebrows", self.prompts()[0])
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
                    self.assertEqual("thick natural eyebrows" in head, brows == "auto")
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
        self.assertEqual(self.page.locator("h3").all_text_contents(), ["View 1: light"])
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
                    self.assertNotIn("Retouch (optional)", page.locator("h3").all_text_contents())

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


if __name__ == "__main__":
    unittest.main()
