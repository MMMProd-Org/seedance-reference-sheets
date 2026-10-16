"""Acceptance checks for the v110b integration, using the existing Playwright dependency.

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
                            fixed_bar = page.locator("div.fixed").filter(has=page.get_by_role("button"))
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


if __name__ == "__main__":
    unittest.main()
