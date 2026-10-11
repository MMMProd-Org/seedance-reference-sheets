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
