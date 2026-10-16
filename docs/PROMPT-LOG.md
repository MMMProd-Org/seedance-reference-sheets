# Prompt log

What was changed in the prompts, and what the real renders showed: what works, what does not, what is still to test.
Read it before any change (`AGENTS.md`).

## How to add an entry

- One entry per change or per test, newest first. Never delete an entry: a result that turns out wrong gets a new entry that says so.
- Status: **WORKS**, **DOES NOT WORK**, **TO TEST**, **REJECTED** (dropped before a test, with why), **LEAD** (one conclusive try, not a rule) or **RULE** (a design decision, not an image result).
- Give the model (GPT Image 2.5, Seedream 5.0), the subject and card, the settings that matter, the prompt lines before and after, and the evidence: the user's own words, the render in one line, the release.
- Only the user's test judges a render: the tests of this repository check the prompt text, never the image.
- Do not try again what is marked **DOES NOT WORK** or **REJECTED** without a new reason, written in a new entry.
- Keep this file under 50,000 bytes and 2,000 lines, each line under 2,000 characters, so that one Read returns it whole (`tests/test_prompt_log_gate.py` checks it). Past that, move the oldest entries, whole, to `docs/PROMPT-LOG-ARCHIVE.md`, and leave one line for each here: its title, its status and its lesson.

## 2026-10-16 · GPT Image 2.5 and Seedream 5.0 · v110b integration from the owner's second line

**RULE.** Source: the owner's `planches-seedance-pipeline_v110b_v52.zip`, its companion HTML and [unaltered French lessons](sources/lecons_prompts_planches_seedance-v110b.md). Rebuilding that ZIP reproduced the supplied HTML byte for byte. Its source chain continues the second v95 line imported in commit `42646b1`; this integration starts from repository main `e85632f`. The standalone HTML is a comparison witness, not a replacement for the maintained build chain. The source's statuses below are reported user results, not new image tests.

**RULE.** Keep this repository's recalibrated ordinary faces and muscle/vein lighting, English default, object and animal photo sources on Seedream, body-first animal workflow, separate views, triptych and optional invisible mannequin. The source's older claims that Seedream has no animal mode or cannot use animal/object photos do not describe this repository. No calibrated face/light wording is replaced by the second line's older wording.

- **TO TEST**, both models, adult body: Forte now starts with “obese, fat and heavy”; middle waist becomes very wide, middle hips/glutes/thighs one step fuller in the prompt only; explicit other settings stay. Belly cues apply only with Auto abs and without a narrow waist; slim biceps omit thick upper arms and “all over”. Slim random body details are replaced. The source's v97 weight estimate is imported. **DOES NOT WORK**, reported v96–v99 Seedream renders: successive weight and belly wording changes did not produce the requested belly projection. The v99 wording keeps the garment fully visible; the v98 wording hiding it stays out. **RULE:** do not promise a larger rendered belly or keep tuning this text without a new experiment; a silhouette guide remains **TO TEST**.
- **REJECTED**, v100 conical-bust triangle wording: the source reports repeated refusals and withdrew it. It is not reintroduced. The source reports incomplete coverage by the triangle on conical forms as a remaining defect; another reference outfit is the documented alternative. This session did not test an image or establish a filter cause.
- **TO TEST**, both models, head: explicit forehead height replaces random forehead cues; hair thickness, care and frizzy texture extend the hair controls. Auto keeps the previous text. Receding hair does not get contradictory random hairline traits. **TO TEST**, Seedream male Canon only: male face traits, clear skin and beard-shadow wording replace the shared random beauty traits; the repository's ordinary-face levels remain intact.
- **TO TEST**, Seedream retouch/body: “Dress in my outfit” reads the Outfit tab live while preserving the approved body. A man's with-head body and “Dress” share a training top reaching the waistband and running tights; the woman's outfit stays. Edited retouch text is kept. Empty Free retouch still copies nothing.
- **TO TEST**, Seedream “Combine head and body”: source v102 framing asks for 85% panel height, equal panels and a head one eighth of the figure. It replaces the older right-profile/skin-seam preset in this repository. **DOES NOT WORK** for head-size correction in the source's measured v102/v103 renders: roughly 6.5–6.8 heads, no gain over v101, despite the requested eight. This is the supplied framing wording, not a claim of fixed proportions. Expanding the body canvas upward by 25% is still **TO TEST**. Only three recognized unedited historical presets migrate; personal additions remain byte-for-byte. Their preset marker migrates too, preserving Free retouch behavior.
- **TO TEST**, both models, animal: seeded individual head shapes are carried by the whole-animal reference and its optional head close-ups. A source photo keeps control of identity. The source's favorable comparison of GPT animal prompts used in Seedream is **LEAD**, since its tested sheets were not specified; it does not validate every current animal configuration.
- **TO TEST**, both models, places/animals: fantasy elements become explicit defining features. A house may stand on a plain grey floor/backdrop with contact shadows. Photo-only prompts ignore stored fantasy settings. **RULE:** view selection applies to one-image-per-view cards, 1–4 selections; the triptych keeps its established three views. With Day and night, a separate night card uses the day view the user attaches. The source's single-image grids and two-view day/night cap are not imported, since the repository uses separate images. Saves without selections keep the old three-view flow. The extra rear-three-quarter tile preserves the old object viewpoint.
- **TO TEST**, both models, Child/Baby: child ages 3–12 have separate face/body prompts and optional dressed headless body; the baby's single six-panel sheet is always a dressed nine-month-old. Adult body, beauty, makeup, reference outfit and photo controls do not enter these prompts. The source's English/French field filters and ordinary-word exceptions stay. Mode changes clear incompatible copied-head records; delayed copies cannot write a different kind of person's record. The source's v108 child head framing avoids importing the top's outfit into the body reference; no new render was made here.
- **TO TEST**, both models, Image integration: the supplied still-image compositing prompt uses a base photo plus an asset and optional extra views, with position, orientation, scale and emitted light. The asset appears once; shadows match length relative to height, and grain/blur follow the base photo. Meaningful asset and placement are required to copy. Long fields can exceed the existing Seedream length recommendation; that counter remains visible.

**RULE.** Local checks judge construction, text, controls and saved-state behavior only. The five supplied grids contain 894 fixed-randomness adult states; current main, not the archive's v106 captures, is the comparison baseline. New Child/Baby golden cases and acceptance tests run from the existing smoke command. Image quality, platform filters and video consistency remain **TO TEST**.

## 2026-10-12 · GPT Image 2.5 and Seedream 5.0 · Person · the owner's second v95 line in the app (v1.2.0)

**RULE.** The owner kept a second line of the tool outside this repository. It split from the first around v75 (both start from the v1 to v75 lessons at the bottom of this file) and reached its own v95 (`planches-seedance-pipeline_v95_v52.zip`, 2026-10-12). Its lessons are the section "Owner's second line" below. This release brings its changes into the app: where only that line changed a prompt, its text is now live. Where both lines changed the same thing, the merge kept:

- Face, Beauty levels "Ordinaire" to "Ingrat": this repository's scale, recalibrated on renders (Seedream v80 and GPT v82 of the first line). The second line kept the v75 wording: the whole "Quelconque" sentence `A plain, forgettable face, the kind nobody notices in a crowd: features slightly out of proportion with each other, ...`, `A homely, unconventional face: ...` for "Ingrat", and `Flat, even frontal light like an ID or casting photo`. Those stay out; this repository's "Ordinaire" still opens with `A plain, forgettable face, the kind nobody notices in a crowd:`, then names its own features. The second line's v94 lettering fix (below) is added to the head and body prompts.
- Seedream body light: the v1.1.2 rule (entry of 2026-10-11). The second line's v84 rule gives the hard light only from "Athlétique" or with a zone at "Marqués". On Seedream the two differ only when the veins show ("Visibles" or "Très marquées") and no zone is at "Marqués", in two cases:
  - musculature "Faible" or "Légère": v84 writes the soft light; v1.1.2 writes "crisp shadows that bring out the veins; the muscles stay smooth" on a lean body whose zones at "Discrets" share one phrase, otherwise "crisp shadows on the muscles and veins";
  - a lean "Athlétique" body (biceps and trapezius at neither "Développés" nor "Massifs") whose zones at "Discrets" share one phrase: v84 writes "crisp shadows on the muscles and veins", v1.1.2 the light for the veins alone.

  With the veins showing, from "Athlétique" up in every other case, both write the same hard light.

  The evidence conflicts: both were judged on nearly the same body (very slim, zones at "Discrets", visible veins), and both **WORK** (v84: shoulders, traps and arms clearly softer, two images; v1.1.2: « c bon ça marche avant »). Kept: v1.1.2, the one this repository tested, which keeps the veins the user wants. **TO TEST**: that body with each light. v84 now drives GPT's body light, which this repository had not changed; the lessons do not say its two images were GPT renders: **TO TEST** on GPT.
- "Retouche libre": both lines added it. This repository's version stays (leaving a preset keeps a text the user wrote). From the second line: it is an operation of its own, so, empty, it copies nothing (its Copy buttons are off, on the card and in the mobile bar) instead of the default join. The second line cleared the text on every switch to it; here it clears only the text a preset put in the box (even after a setting changed that preset's wording), and keeps a text the user wrote or edited.
- GPT body prompt, the head sheet: this repository's `four head close-ups: front, three-quarter, profile and back of the head`.
- An engine nobody picked: the second line's v94 rule (it follows the subject live, so a reload never switches it). A saved GPT session that rule would never have saved counts as picked by hand and stays on GPT, as before: one from before the choice was recorded, or one an earlier build saved for a subject Seedream can do.
- Seedream copy messages for a missing or changed head sheet: the second line's wording, which speaks of the copied head prompt.

Default prompts: the only change is the default Seedream body (build "Moyenne"), which now gets `A normal, healthy layer of soft body fat: ...` (v78 below). The delivered page is not copied: the import commit rebuilds it byte for byte.

Found in review, GPT with a source photo whose clothing is kept: the second line's v94 lettering fix did not reach this ending, so a tattoo reading a word was still followed by `No text, labels, numbers, watermarks or logos anywhere in the image, except any logo or print on the clothing taken from the photo.` on the head and body sheets. It now gets the lettering ending, followed by `, besides any logo or print on the clothing taken from the photo.` **TO TEST** in a render, like the v94 fix itself.

## 2026-10-11 · Seedream 5.0 · Person, headless body sheet · the test's three changes in the app (v1.1.2)

**WORKS**, by the user's test of the prompt in the entry below, with its three changes: « c bon ça marche avant » (the render was not described). Now in the app, on Seedream only, in a person's body prompt:

A lean body, below: musculature at "Athlétique" or less, and biceps and trapezius at neither "Développés" nor "Massifs".

1. When the Muscles line has at least as many zones at "Discrets" as at "Présents" or "Marqués" (zones: shoulders, back, arms, legs, a man's chest, the abs when their style is Auto), its zones at "Discrets" no longer get one phrase each: one phrase opens the line, "barely visible muscles, no muscle bulk". Zones at "Présents" or "Marqués" keep their own. With fewer zones at "Discrets", the line is unchanged: one zone at "Discrets" among zones at "Présents" would otherwise read "barely visible muscles" next to defined muscles. On a body that is not lean, the phrase stops at "barely visible muscles", so as not to contradict the build.
2. Pear bust: ", as often on lean athletic women" is gone.
3. Light: on a lean body with at least one zone in the phrase of item 1, none at "Marqués", and veins at "Visibles" or "Très marquées", the hard light now reads "crisp shadows that bring out the veins; the muscles stay smooth". Otherwise unchanged: "crisp shadows on the muscles", and "and veins" when they show.

The user tested only the settings of the entry below, with a single vertical groove for the abs, set to "Discrets". Other settings follow the same rules but are **TO TEST**: a zone at "Marqués" among zones at "Discrets", as many zones at "Discrets" as at "Présents" (they share the phrase), a man, a heavier build, abs with segments on Auto (their own "with clear shadow lines") next to the light of item 3. "no muscle bulk" goes against rule 6 below (a negated word is still a word), but it is the tested wording: keep it while it works. GPT Image 2.5 is unchanged, as none of this was tested on it.

## 2026-10-11 · Seedream 5.0 · Person, headless body sheet · too muscular, not slim

**TO TEST.**

- Settings: woman, 27, 175 cm, Build "Très mince" (about 54 kg), lightly toned, muscle definition "Discrets" except the arms "Présents", veins "Très marquées", large pear-shaped bust, bikini.
- Render: an athletic body, not slim: sculpted shoulders, back and arms, abs with horizontal lines; the bust round and full on top (the prompt asks hollow on top); the shoulders wider than the hips (the prompt asks the same width); the chin visible in two panels. The leg-to-torso ratio is as asked (crotch at about 43% from the collarbones down).
- User: « les muscles trop présent, le corps trop musclé par rapport à ce que j'ai demandé ensuite j'ai dit mince c pas vraiment le cas ». The veins are wanted: « les veine j'en ai besoin si elles sont là c bien ».
- Reading of the prompt: about ten cues push toward an athletic body, against five for slimness: "lightly toned"; "as often on lean athletic women" in the pear bust; the Muscles line names every zone even at "Discrets"; the abdomen groove; "Definition from leanness, not from muscle size"; "This definition never slims the breasts"; "high calves with long lower tendons, sturdy ankles, short, strong fingers"; the hard light, chosen because the veins are marked: "crisp shadows on the muscles and veins".
- Test prompt given to the user, three changes:
  1. Muscles line, the zones at "Discrets" replaced by one phrase: "Muscles: softly visible shoulder muscles, a softly toned back, a visible groove between biceps and triceps, lean, softly toned legs, slim upper arms, a flat trapezius line, a smooth upper chest." → "Muscles: barely visible muscles, no muscle bulk, a visible groove between biceps and triceps, slim upper arms, a flat trapezius line, a smooth upper chest."
  2. Pear bust: ", as often on lean athletic women" removed.
  3. Light: "crisp shadows on the muscles and veins" → "crisp shadows that bring out the veins; the muscles stay smooth".
- Earlier lessons (section "Before v1.0.0" below) already record this failure: "a pear or bullet bust on a muscular body: very marked arms + 51 kg + a big bust → round bust and broad shoulders", with its workaround: lower the muscle definition, or a guide image; insisting in the text does not work. The hard light was validated only when the musculature is marked, not for veins alone. And "a negated word is still a word": change 1 says "no muscle bulk"; if the test fails, say it positively next (for example "slender, soft limbs with very little muscle"). The prompt has 586 words, under the 600 reported for Seedream.

**REJECTED**, before any test: give marked veins the soft light instead of the hard one. It would have weakened the veins the user wants.

## 2026-10-10 · Seedream 5.0 · Person, retouch card · help of "Autres retouches" (v1.1.1)

**WORKS.** Interface text only, no prompt change: the help above the box says what its text is for (your own retouch, in English or French; a preset's text, already in the prompt; nothing to write while "Combine head and body" is only the default), with a French example. User: « ok c tout bon là ».

## 2026-10-10 · GPT Image 2.5 and Seedream 5.0 · Object, clothing kept as in the photo · "On an invisible mannequin" (v1.1.0)

**WORKS.** Optional, unticked by default. Ticked: SOURCE also allows "the presentation described below", and a PRESENTATION section asks for the invisible mannequin (ghost mannequin) in views 1 and 2 and the triptych's left and middle panels; view 3 and the right panel stay laid flat. User, after the release: « ok c bien » (the render was not described).

## Owner's second line · lessons from tool versions v76 to v95

Source: the owner's file `lecons_prompts_planches_seedance.md` (2026-10-12), its parts dated v76 and later, translated; its v1 to v75 part is the section below. Its statuses come from the owner's working session. Each quoted phrase was checked against the v1.2.0 build (`new/patched.js`): a note in brackets says whether it is live.

### Content filters

- Very generous bust blocked on Seedream in every outfit (v75, woman, 27, 175 cm, 54 kg). v76 `a heavy bust much larger than average`, then v77: still blocked (**DOES NOT WORK**). Cause isolated by three user tries, one setting changed at a time (fitted top and bike shorts): Generous + Tombante blocks; Very generous + Auto passes; Very generous + Auto + build Moyenne passes. The trigger was the Tombante text, not the size. v78 describes the same drop without `saggy`, `breasts`, `nipples`, `hanging` or `deflated`: `a large, heavy natural bust ... with a pronounced natural drop: ...` **TO TEST** [live]. **WORKS** (v78): Very generous + Auto + fitted top passes with "very large" and a cup letter: those words do not block on their own.
- **RULE** (v85): never name underwear, even negated (`no cups, no padding, no underwire`): it pushes toward an unsupported or a supported look. Kept anyway: the loose top's `no padding, no underwire`, the text that passed 3 images out of 3 in v87; do not change it without a test (v92) [live].
- **WORKS**, as a fact (v85): Seedream also filters the image after making it (shown about 15 seconds, then replaced by "sensitive content").
- **RULE** (v86): at Very generous (cup H), a close-fitting top fails the image filter whatever the fabric (v84 to v86); the loose top passes most often (v80: 1 draw in 3; v84: 2 in 2).
- **RULE**: never rework a prompt to get past Seedream's filter an image it already removed. The environment blocked such an attempt (a ribbed-knit top, not delivered).

### Reference outfits

- At Very generous, triangle + tanga becomes a loose sleeveless top + tanga (v79), and "Haut ajusté et cycliste" a loose top + bike shorts (v87). **WORKS** (3 images, v87): the loose top + bike shorts passes, the bust very large and low, its side visible through the armhole. v90, at the owner's request: the fitted top + bike shorts comes back next to it, drawn in red, with a warning once picked (Seedream often removes the image: run it several times or take the loose top) [live]. Its prompt is not reworked for the filter.
- **RULE** (owner): the side of the bust seen through the loose top's armholes is wanted; do not tighten them. v89 `in the side views the wide armholes show the bare side of the bust and its full outline from the armpit down to its lowest point, so its size and its drop read clearly`: **WORKS** for the side (6 profile views in 6), not for the shape (see "Body") [live].
- Nipples visible through the fitted top (v77) with `double-layered at the front and lying smooth over the bust so no detail shows through`: **DOES NOT WORK** [still live below Generous]. v85, a built-in lining: 1 draw in 3 passes, the top looks transparent and the bust supported: **DOES NOT WORK** [gone]. v86, from Generous: `heavyweight, matte, opaque cotton jersey`, `follows the size, shape and position of the bust like a regular T-shirt with a little ease, close but not skin-tight`, `its smooth, thick front bridging over the bust so no detail shows through` **TO TEST** [live]; at Very generous the image was made, then replaced (**DOES NOT WORK**).
- v88, "Très mince": the women's Seedream tops (loose, fitted, with head) get `a lower, wider scoop neckline showing the collarbones, the breastbone and the first ribs under the thin skin, down to about a hand's width below the collarbones (never the bust itself)` [live]. 3 images passed, collarbones and breastbone visible on one; unknown whether the neckline did it or chance.
- **DOES NOT WORK** (code review, v91): "Habiller" described another top than the with-head body sheet (`thin, stretchy ... like a second skin`, then `medium-weight ... double-layered`). As the with-head prompt follows image 2 where they differ, the "Très mince" neckline and the heavy jersey were lost that way. v92: one outfit text for both; "Habiller" adds only `body stays exactly as in image 1, every visible outline in place` [live], not tested in a render. A man's with-head top lies `over the chest`, no longer `over the bust` [live]. At Very generous, the red warning also shows on "Habiller", "Ajouter les têtes" and the with-head body sheet, with a fallback: the headless body sheet in the loose top, then "Assembler tête et corps" [live].

### Body

- Very generous rendered as Generous (v76, with the GPT prompt by mistake). v77, landmarks on both engines: still Generous (**DOES NOT WORK**). v78 `about an F to G cup`: bigger, not enough. v79 `about a G to H cup`, with `in the front view the bust fills the whole width of the chest, its outer sides bulging past the ribcage against the inner arms` and `in profile it projects forward from the ribcage by about the length of her hand, far beyond the stomach`; the shape guide image copies the size too. « on y est presque ». v80 `about an H cup`, `by a little more than the length of her hand`: the size **WORKS** (owner), 1 draw in 3 passes the filter [live, both engines].
- Very generous + Tombante, a stronger drop (v80 to v89). v81 `with a strong natural drop ...` → a bullet shape (**DOES NOT WORK**: a pointing word gives a point). v82 `like a soft, half-filled pouch`, `fairly flat` → too small (**DOES NOT WORK**). **RULE**: never ask for less projection to get a drop; move the volume down. v83 `in profile the upper slope is long, flat and slightly hollow, and all the volume sits in a heavy, full lower part that projects well forward of the stomach`, `like a heavy, well-filled soft pouch` [live]. v89 result: round and full, the lowest point near the bottom of the ribs. **RULE**: the text has reached its ceiling for this shape on Seedream (v81 to v89 swing between too small and round): stop editing the text and use a shape guide image (a profile silhouette from a 3D model, for example MakeHuman).
- Medium rendered small and Generous big and round (v75). v76 adds the step "Assez généreuse" between them, stored as 2.5 so that saved characters keep theirs [live]. GPT: `a fairly full bust, a little larger than average, its base covering most of the width of the chest in the front view` [live]. Seedream `(about a C to D cup)` rendered B to C (3 images, v90) and `(about a D cup)` alone changed nothing (v92, 3 images, profile measurements within the variation between draws): **DOES NOT WORK**. **RULE**: half a cup letter is not enough at this level. v93: `a fairly full bust, larger than average (about a D cup), its base covering most of the width of the chest in the front view` **TO TEST** [live]. `clearly larger than average` is not used: it is Generous's wording.
- Moyenne and Très mince builds almost the same (v77). v78: Moyenne adds `A normal, healthy layer of soft body fat: no visible ribs or hip bones, a slight softness at the sides of the waist and on the upper arms.` (musculature up to Athlétique); Mince and Très mince no longer draw `soft, rounded knees`, Très mince no longer `sturdy ankles` **TO TEST** [live; the default Seedream body now has the Moyenne phrase].
- No visible ribs at "Très mince" (v75). v76, both engines: `the ribs showing clearly under the thin skin wherever the torso is uncovered, along the sides of the ribcage and below the bust in the front view and along the flanks in the side views` **TO TEST** [live]. Limit: the reference tops cover the ribs; they can show only in triangle + tanga (21 and over) or bare-chested (a man).
- "Légère" rendered too muscular (v83). Causes in the prompt: visible veins triggered the hard light; zones at "Discrets"; a very lean body; `square shoulders` drawn despite very narrow shoulders. v84: the hard light only from "Athlétique" or with a zone at "Marqués", otherwise `Soft key light from slightly above and in front, gentle fill: soft shadows on the muscles`; narrow shoulders no longer draw `square shoulders`. **WORKS** (2 images, both passed the filter): shoulders, traps and arms clearly softer, the bust size kept [shoulders live; the light live on GPT, while Seedream keeps the v1.1.2 rule: entry of 2026-10-12]. Under the loose top the Tombante drop stays unreadable: judge the shape with the fitted top.

### Face, GPT and Seedream

- **DOES NOT WORK** (GPT audits of v93, reproduced): with a photo source, a hidden Beauty level still changed GPT's head light and lens. v94: no effect with a photo. **RULE**: a hidden setting never acts on the prompt [live; this repository already had it].
- **DOES NOT WORK**: a lettering tattoo asked in "Signes" (`a tattoo reading HELLO`) was followed by "No text". v94: when the marks ask for lettering (quotes, reading, says, name, initials, date, number, écrit, inscription, lettres, mot, prénom…), the end becomes `No captions, labels, panel numbers or watermark added to the image; the only lettering is the one the marks above describe.` (GPT adds `watermarks or logos`) **TO TEST** in a render [live].
- **DOES NOT WORK**: Seedream, "Culturiste" with arms at "Marqués": `like a bodybuilder`, then `not bulky`. v94: `not bulky` on the arms only up to Athlétique [live].
- **DOES NOT WORK**: GPT's body prompt called a person's head sheet `three head close-ups`. v94: four for a person [this repository already wrote it, with the views named].

### Working method

- Compare the prompts before and after on a grid of settings, with `Math.random` fixed (`tests/grab.py` and `tests/diffit.py` of the owner's zip). A grid without a reference outfit does not test the outfit text (v76 shipped with that hole). Grids must cover each branch (engine, sex, with or without head, body source): `bust` for a man with a head stayed hidden until a grid had that case.
- An outside audit must compare files identified by their hash: the v93 audit compared with a "V90" that was not the delivered v90, so its "regressions" were old defects; the defects themselves were real.
- **DOES NOT WORK** (v94 self-check): the lettering detector never matched « écrit »: in JavaScript, `\b` sees no word boundary before an accented letter. **RULE**: no `\b` next to an accented letter; test the French.
- Two local HTML files open in the same Chromium share their storage (`file://`, tested): two builds of the tool overwrite each other's settings (key `fiche-perso-seedance-v1`).
- The archive stored the accented file name without the UTF-8 flag (command-line `zip`): Python and Windows Explorer then read it as CP437. Since v95 the archive is built with Python's `zipfile`.

## Before v1.0.0 · lessons from tool versions v1 to v75

Source: the owner's file `lecons_prompts_planches_seedance.md` (October 2026), translated; the owner's words stay in French. Its statuses come from a working session whose transcript is gone; that session checked the quoted phrases against the v75 code. On 2026-10-11 every quoted phrase was checked again against the v1.1.1 build (`new/merged.html`): a note in brackets says when a phrase is now different or gone, or when a phrase marked DOES NOT WORK is still live. A phrase built from parts (the cup range, "This definition never slims …", the leg landmark) is described by its rule.

The tool writes the prompts of a character's reference sheets (a head sheet and a body sheet, 4 views each) for Seedance 2.5, made with GPT Image 2.5 or Seedream 5.0.

### Rules first

1. In Seedance, attach the head sheet (close-ups, with a back view) and the headless body sheet. Never a body sheet with heads: Seedance then relies on those small heads instead of the close-ups (owner's finding).
2. Seedream has no memory: name Image 1, Image 2 in the prompt and attach the files. GPT reuses the last sheet of the conversation (owner's method: one ChatGPT window per important character).
3. Make the headless body first and add the head after: with a face in the image, Seedream refines and standardises the body.
4. Never swimwear or a revealing outfit together with a face; a clothed neckline on the head sheet.
5. Tanga and briefs only at 21 and over; below that, fitted sportswear. Never work around a legitimate block.
6. A negated word is still a word: "not a model" pulls toward "model", "no tie" can pull in a tie.
7. Describe concrete things (clothes, features, landmarks in the frame). An abstract instruction loses against contrary concrete features.
8. A short prompt when a filter blocks; never state the cause of a block without a test.
9. Fine proportions (legs, hips, glutes, measurements) do not come from text alone: a guide image or a 3D base.

### Content filters (Seedream and GPT)

Owner: Seedream 5.0 is more permissive than GPT Image 2.5 (tanga accepted on Seedream).

What triggers "sensitive content":

- **DOES NOT WORK**: an image in swimwear attached next to a face. Rule: never swimwear with a face.
- **DOES NOT WORK**: `Bare shoulders, no clothing visible` on a man's head sheet [gone]. **RULE**: always a clothed neckline. Man: `the crew neckline of a plain cobalt-blue t-shirt`. Woman: `the scoop neckline of a plain cobalt-blue sleeveless top` [both live]. Never bikini straps or a racer back.
- **DOES NOT WORK**: 18 + very slim body + small bust + Brazilian tanga. A legitimate block. **RULE**: tanga and briefs only at 21 and over; below that, fitted sportswear.
- **DOES NOT WORK**: piling up sensitive words (soft, saggy, nipple). "soft" repeated 11 times or more blocked every time.
- **DOES NOT WORK**: a long, very anatomical prompt with an 18-year-old character. A short prompt passed: « ajoute la tête au corps pour faire un ensemble avec cette adulte de 18 ans sur ces images ».
- **DOES NOT WORK** (diagnosis): the session claimed an input image was blocked; it was the text. **RULE**: never present a filter hypothesis as a fact; test first with a short prompt.

What helps:

- **WORKS**: a muscular context and hard light on the muscles, when the musculature is marked: `Key light from above and to the side, weak fill: crisp shadows on the muscles` [live; v1.1.1 also uses it when only the veins are Visible or Very marked, `n0()` in `new/pretty.js`, outside the condition it was validated for: see the 2026-10-11 entry].
- **WORKS**: `Purpose: a neutral anatomy and costume-fitting reference for a film's VFX team.` With the owner's own outfit: `Purpose: a neutral costume and character reference for a film's VFX team.` [both live, built from parts].
- **LEAD**: short prompts, and the word "adult" for ages 18 to 20 (`18-year-old adult woman`). The tool adds "adult" to Seedream prompts only (`sdAdult`).
- **WORKS**: "bust" rather than "breasts" in a retouch.
- **RULE**: never ask for visible genital detail.

### Reference outfits

- **DOES NOT WORK**: vague text in the outfit fields (« Random Grand mother clothes ») → the model puts underwear. **RULE**: concrete clothes, in English.
- **WORKS**: a random outfit drawn by the tool from age, sex, mood and face seed, the same on head and body. The word "random" alone in the field triggers the draw.
- **DOES NOT WORK**: own outfit + the word "anatomy" + cellulite → underwear. Fixes that **WORK**: Purpose `costume and character`; `Fully dressed in this outfit in every panel; the body shapes above read through the fit of the clothes.`; cellulite and marks limited to `only where the skin is uncovered` [all live].
- **DOES NOT WORK**: a `loose, boxy` top → hides the bust.
- **DOES NOT WORK**: `fitted swim shorts ending at the upper thigh` (woman) → briefs or mini-shorts.
- Both were fixed on Seedream only. GPT's woman reference outfit (`a swim set: a loose, boxy sleeveless cropped top ... and fitted swim shorts ending at the upper thigh`) still has them [still live in v1.1.1]. Not tested on GPT: unknown whether GPT reacts the same.
- **WORKS** (Seedream, women, headless body; "swimsuit" or "shorts" choices turned into sportswear): `a fitted cobalt-blue sleeveless cropped top in medium-weight, opaque cotton jersey, with a modest round neckline and armholes that hug the shoulder joints; it covers the whole chest` + with a medium bust or larger `and follows the natural size, shape and position of the bust like a fitted T-shirt, without flattening or lifting it` + `, double-layered at the front and lying smooth over the bust so no detail shows through, no padding, its plain hem ends just above the navel; seen from behind, the same top covers the upper back; fitted cobalt-blue bike shorts in thin stretch fabric, ending at mid-thigh, the stretch fabric following the shape of the hips and glutes without flattening them; barefoot` [live].
- **DOES NOT WORK**: `thin jersey` + `nothing structured underneath, not a sports bra` → visible nipples [gone]. Replaced by the thick, smooth, lined jersey above: **TO TEST**.
- **DOES NOT WORK**: no top in the back view. Fix that **WORKS**: `seen from behind, the same top covers the upper back`.
- **DOES NOT WORK** (man): `fitted competition swim shorts`, `flat front panel` → a flattened front, a childlike look [gone from the man's outfit; a woman's GPT track shorts keep `with a flat front panel`]. **WORKS** (Seedream): `shirtless; cobalt-blue square-cut swim trunks ending at the upper thigh, in thin stretch fabric that fits like an adult competitive swimmer's: the front naturally filled, in proportion to his adult build, neither flattened nor padded nor exaggerated; barefoot`. The same "front naturally filled" clause was carried over to GPT: **LEAD**, one try.
- **WORKS**: a one-piece swimsuit at 18 (limit: it hides the abs).
- **WORKS** (full body with head): a sleeveless cropped top and mid-rise leggings, bare arms and shoulders, belly and navel described: `mid-rise ankle-length cobalt-blue leggings whose waistband sits a few fingers below the navel, so the waist and navel show between them`.

### Body: shapes and proportions

- **WORKS**: a calibrated low-hanging bust ("tombante" shape, Seedream): `large, heavy, low-hanging saggy breasts` + a cup range from the set size (for example `(about a D to E cup)`) + `long, soft and slightly deflated, hanging from an empty, flat upper chest, the nipples pointing down, the lowest point only a hand's width above the navel, resting on the ribs; in profile they hang down rather than out; slightly uneven, the left one a little lower; never round, firm, high or balloon-like`. With a face: no nipples, "bust", singular.
- **WORKS**: glutes "Très bombés": `very high and very round, projecting strongly in profile`.
- **WORKS**: opposite profiles: `Left to right: front; left side, facing the left edge; back; right side, facing the right edge; the two profiles face opposite ways.`
- **WORKS**: the muscle definition must not slim: `This definition never slims the breasts, hips or thighs.` [built from parts: it names only the parts that apply, for example `This definition never slims the breasts.`].
- **WORKS**: long legs by a landmark in the frame rather than by a ratio alone. What the tool writes for a leg-to-torso ratio of 1.5: `From the collarbones at the top edge down to the soles, the crotch sits about 40% of the way down, so the legs fill the lower 60% of the figure; the crotch is clearly above the middle of the panel.` Measured on images: crotch at 45% and ratio 1.21 before, 41% and 1.43 after.
- **WORKS**: an Auto bust from age, height and build, never applied in photo mode. Basis: Rinker B, Veneracion M, Walsh CP, "The effect of breastfeeding on breast aesthetics", Aesthetic Surgery Journal, 2008, 28(5):534-537, doi:10.1016/j.asj.2008.07.004 (presented at the ASPS meeting, Baltimore, November 2007). Significant factors in the ASPS 2007 abstract: age, BMI, number of pregnancies, cup size before pregnancy, smoking; breastfeeding is not one.
- **DOES NOT WORK**: ratios in numbers alone (the legs stayed short, 42 to 43% for 48% asked, two tries).
- **DOES NOT WORK**: narrow hips asked by text alone.
- **DOES NOT WORK**: the most projecting point of the glutes: capped between 53 and 66% whatever the text.
- **DOES NOT WORK**: a pear or bullet bust on a muscular body. The model's fitness cliché: very marked arms + 51 kg + a big bust → a round bust and broad shoulders. Seen again on 2026-10-11 (entry above).
- **DOES NOT WORK**: `no extra padding` also slims the bust. Replaced by `Apart from the bust, a slim frame` [v1.1.1 writes both, scoped: `Apart from the bust, a slim frame: ..., no extra padding`].
- **DOES NOT WORK**: `A medium bust.` alone on a full body → ignored. Write the full description.
- **RULE**: with a face in the image, Seedream refines and standardises the body. Headless body first (`framed from the base of the neck down to the feet, with the head outside the frame in every panel`), the head after.

### Face and head

- **WORKS**: a 4-view head sheet (front, three-quarter, left profile, back) on both engines. The back view keeps the AI from inventing the back of the head. GPT had only 3 views until v73 although the owner had asked for 4: check every request on every engine.
- **DOES NOT WORK**: back view `its length, parting and any tie` → the model adds a tie [gone]. Wording by hairstyle: hair down `worn down with no tie or clip`; ponytail, bun, braid `the tie`; shaved or bald: nothing.
- **WORKS**: a hair reminder on every full body: `Hair exactly as in image 1: ..., the same in every panel.`, with `worn down, never tied up` for loose hair (without it: white hair at 80 even when the head says otherwise).
- Owner's goal: ordinary faces and natural, less smooth renders. The default beauty is too high on both engines.
- **DOES NOT WORK**: "Quelconque" written `plain ... clearly not a model` → a model without makeup, on GPT and Seedream [gone]. Likely causes, not isolated one by one: the word "model", soft light and 85mm, features drawn at random from the beauty register.
- v75 fixes, on both engines, **TO TEST** [the wording has changed since; v1.1.1 text in brackets]:
  - Concrete text without the word "model". "Plain" level: `A plain, forgettable face, the kind nobody notices in a crowd: features slightly out of proportion with each other, a little heavy or a little bland in places, no striking feature, with the asymmetry of a real face.` [now `A plain, forgettable face, the kind nobody notices in a crowd: ` followed by the features]. Higher level: `A homely, unconventional face: clearly irregular, uneven features that do not fit together harmoniously, nothing striking or glamorous, with the strong asymmetry of a real face.` [now GPT `a homely, unconventional face: clearly irregular, uneven features that do not fit together harmoniously, nothing striking or glamorous`; Seedream `A homely face that nobody looks at twice: ` followed by the features].
  - Flat light and 50mm instead of soft light and 85mm: `Flat, even frontal light like an ID or casting photo, with no flattering shadows and no glamour` [now `Flat, even frontal light like an ID photo, with no flattering shadows and no glamour`].
  - Features left on Auto swapped for their ordinary counterpart (for example `full lips` → `thin lips`, `high, prominent cheekbones` → `flat cheekbones and a smooth mid-face`, `a narrow nose` → `a broad nose`). Features set by the user are never touched.
  - A warning in the interface when a Beauty setting contradicts "Quelconque".
- Analysis of one image, not tested separately: light blue eyes on tanned skin are a striking feature, contrary to "plain".
- Imperfections "Marquées": `Clearly imperfect skin: enlarged pores on the nose and cheeks, several small spots and blemishes, redness around the nose and chin, dark under-eye circles, an oily shine on the forehead and nose, an uneven, slightly blotchy tone`. Better rendered by GPT than by Seedream: **TO TEST**.
- **DOES NOT WORK**: contradictory features (a narrow face with a wide jaw and cheekbones) → the model renders a neutral face.
- **DOES NOT WORK**: a dimple with `no smile` (incompatible); a widow's peak hidden by a middle parting.
- Normal: the face varies a little on the full body compared with the head sheet.

### Chaining images (Seedream)

- Seedream has no memory between two generations. Name Image 1 / Image 2 in the prompt and really attach the files. GPT reuses the last head sheet of the conversation.
- **DOES NOT WORK**: a prompt citing an image 2 that is not attached → a default body. Fix: an explicit choice in the tool between "my dressed sheet" and "my settings".
- **WORKS**: a retouch without drift: `Edit image 1, the approved body reference sheet of this ... Change only this: ... Keep everything this change does not touch exactly as in image 1: ...; nothing else grows, shrinks, lifts or slims. No text or watermark.`
- **WORKS**: head and body joined by a short two-image prompt; give the order of the views (front, left side, back, right side), otherwise the right profile disappears.
- Fallback if the join fails: dress the body, extend the canvas 25% upward, then "Add the heads".
- Shape guide image: `ignore everything else in it: its person, body size, face, skin, clothing, framing and style. Where the guide and this text differ on that shape, follow the guide.`

### GPT Image 2.5 vs Seedream 5.0

- **DOES NOT WORK**: a Seedream prompt pasted into GPT → the head came into the frame. Always use the prompt of the right engine.
- Seedream follows landmarks placed in the frame better; it gets a cup range, GPT does not.
- GPT's filter is stricter according to the owner (not measured).
- Known gap since v75, still live in v1.1.1: GPT's woman reference outfit keeps the wordings that failed on Seedream (see "Reference outfits").

### Length and wording

- Under 600 English words: the provider's recommendation as reported by Runware (Seedream 5.0 Pro prompt guide); the BytePlus documentation itself could not be read. The tool's full-body prompts often go over (up to about 735 words), with no failure put down to length.
- Character limits by host: the owner's platform cuts at 10,000; Runware gives 3,000 for Seedream 5.0 Pro; a HackerNoon article (AIModels.fyi) gives 4,000. A 735-word prompt is over 3,000 and probably over 4,000 characters: on those hosts it would be cut.
- Check agreement and articles (`an 18-year-old`, `the bust stays`), internal contradictions and repetitions.
- An abstract instruction ("plain", "long legs") loses against contrary concrete features elsewhere in the prompt.

### Known limits and workarounds

| Problem | What does not work | What to do |
| --- | --- | --- |
| Short legs | A ratio in numbers alone | A landmark in the frame (see "Body"), otherwise a guide image or a 3D base |
| Narrow hips | Text alone | A guide image or a 3D base |
| Exact measurements | Text, however detailed | Only a 3D base gives reliable measurements |
| Pear bust on a muscular body | Insisting in the text | Lower the muscle definition, or a guide image |
| Exact body with a face | Everything in one go | Headless body first, then a retouch or a join |

3D tools named during that session, not checked again: CLO 3D (an avatar with detailed measurements), Meshcapade Me (an avatar from measurements), Body Visualizer (simple sliders, no glutes setting).

### Working method (for the agent changing the tool)

- Test the real paths, not only the code. A fixed set of acceptance tests before each delivery (now `tests/smoke.py` and `tests/golden_prompts.py`).
- Check that the tests really read the prompts: a folded block returned empty prompts with `inner_text`, and the tests passed wrongly. Use `text_content()`.
- Measure the images (crotch, soles) rather than judging by eye.
- State nothing about a filter or a model's behaviour without a test.
- Apply each request on both engines and check each one separately.
- Interface: say where to act, one card per step, the action next to what to attach, long help folded.
- Compiled bundle (Parcel, React): only Tailwind classes already in the compiled CSS have an effect; otherwise inline styles. The original sources are unavailable; a build chain (archive `planches-seedance-pipeline_v75_v52.zip`) rebuilt each version identically. This repository is now that chain (`docs/BUILD.md`).

### Sources

- Rinker B, Veneracion M, Walsh CP. The effect of breastfeeding on breast aesthetics. Aesthetic Surgery Journal, 2008, 28(5):534-537. PMID 19083576. https://pubmed.ncbi.nlm.nih.gov/19083576
- ASPS 2007 abstract (Plastic Surgery 2007, paper 12587), significant ptosis factors. https://asps.confex.com/asps/2007am/techprogram/paper_12587.htm
- ScienceDaily, 5 November 2007, the study presented at the ASPS meeting. https://www.sciencedaily.com/releases/2007/11/071101170723.htm
- Runware, Seedream 5.0 Pro prompt guide (600 words, 3,000 characters). https://runware.ai/docs/models/bytedance-seedream-5-0-pro/guides/prompting
- AIModels.fyi on HackerNoon, Seedream 5 Pro guide (600 words, 4,000 characters). https://hackernoon.com/a-beginners-guide-to-the-seedream-5-pro-model-by-bytedance-what-you-need-to-know
