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

## 2026-11-24 · Blender agent and Seedream 5.0 · Person, "Agent 3D" (bust): the areola's tint, edge and outline

**RULE** (owner, 2026-11-24, a photo of a real bust: « est ce que le HTML peut prévoir ce genre d'areole ? », « l'aréole n'est pas parfaite elle est un peu tordu »; « oui envoie le html ensuite pas besoin d'envoyer sur github avant la validation »). Three settings in the « Agent 3D » card, Auto by default (the prompt unchanged): « Teinte de l'aréole » (Pâles, Rosées, Foncées), « Bord de l'aréole » (Fondu, Net), « Forme de l'aréole » (Ronde, Irrégulière). The context line, read by an image model, adds e.g. `pale areolas, almost skin-coloured; blended edge; not round: slightly oval, uneven edge, nipple off-centre, the two different`. The Blender agent draws the edge and the outline in the areola vertex groups (`mask areole_G, areole_D: ellipse 0.85, wavy edge, off-centre, L ≠ R, weight 1→0 from 0.85 to 1.15 r`), checks `outlines L ≠ R`; the tint stays texture work, out of its scope. No published data read on an areola's tint, edge or outline: design choices. The longest agent prompt stays under 10,000 characters (9,994 in French). **TO TEST** on a render, local build only (not pushed, owner's validation first).

## 2026-11-24 · GPT Image 2.5 and Seedream 5.0 · Animal sheet: the eyes asked only in the views that show them

**RULE** (GPT's audit of v1.14.1, F05, a framing note, no render; owner: « fait ce qu'il faut en mode dev senior lead architect »). The animal sheet asked `The head is clearly visible in every view, with its eyes, ears and markings readable`, with a rear view among the four: the eyes cannot show there unless the head turns to the camera. Now `The head is clearly visible in every view, with its ears and markings readable, and its eyes in the views that show them`. Nothing new on the head's direction. Golden prompts change by these words (Animal, both engines). **TO TEST** on a render: the rear view shows the back of the head.

## 2026-11-24 · GPT Image 2.5 and Seedream 5.0 · Object, vehicle: the stated state wins over the closed doors

**RULE** (GPT's audit of v1.14.1, F03, reproduced in Chromium; owner: « fait ce qu'il faut en mode dev senior lead architect »). With « État du moment » `left front door open`, a car's sheet said `Current state ...: left front door open.` and then `all doors, hood and trunk closed`. With a state written, the presentation's closed openings now read `... closed, except an opening the current state above names as open; every other one stays closed` (car, boat, aircraft, tracked and other vehicles); with none, unchanged. Both engines. **TO TEST** on a render: the named door open, the others closed.

## 2026-11-24 · GPT Image 2.5 and Seedream 5.0 · Object without a photo or a real model: lettering it asks for is allowed

**RULE** (GPT's audit of v1.14.1, F04, reproduced in Chromium; owner: « fait ce qu'il faut en mode dev senior lead architect »). An original object whose description or « Marques et détails » ask for lettering (`HELLO printed in large black letters on the front`) ended with `No text, labels, numbers, watermarks or logos anywhere in the image.`, forbidding it. With the lettering words the person's marks already use (v94: `reading`, `letters`, `text`, a quoted word...), it now ends `No captions, labels, panel numbers, watermarks or logos added to the image; the only lettering is the one described above.`; without them, or with them only negated (`no text`), it keeps `No text`. A photo or a real model keeps its own ending. Both engines. **TO TEST** on a render: the word drawn, no caption added.

## 2026-11-24 · Interface · Export and import: the values the app saves itself come back

**RULE** (GPT's audit of v1.14.1, F01, reproduced in Chromium; owner: « fait ce qu'il faut en mode dev senior lead architect »). No prompt change. A GPT head copy records the beauty level and the corpulence it was made with (`headLooks`, `headFat`: numbers, or `2/3` with the face fat) in fields whose default is `""`; the import checked them against that type, dropped them (« 2 values outside the possible choices »), and the load filled them from the current settings, so after a change of looks the next head prompt changed its strategy. They now pass as a number or a text, and a head copy saved before these fields existed gets each missing one on its own, never overwriting the other. Found on the way, on the owner's own exports (`planches_perso_2026-11-23_*.json`): the eye and nose sliders save `xsmall`, `medium`, `xnarrow`, `xwide`, absent from the old chip lists the import checked, so « Taille des yeux » and « Nez, largeur » came back as Auto (his three files: eyes « Moyens » lost, « 1 value outside the possible choices »). Both fixed; an export now imports with no value announced outside the choices.

## 2026-11-24 · GPT Image 2.5 and Seedream 5.0 · Person, headless body sheet: the marks typed by hand, kept unless they sit on the face

**RULE** (GPT's audit of v1.14.1, F02, reproduced in Chromium; owner: « fait ce qu'il faut en mode dev senior lead architect »). Since v134 (glasses typed in « Autres signes distinctifs » brought the head back) a headless body sheet left out every part of the marks with a face word, so `small eye tattoo on the left forearm` and the tattoo of `a scar on the left cheek and a dragon tattoo on the right forearm` were lost. Now a part is left out only when it sits on the face (a face word after a place word: `on the left cheek`, `around the eyes`), is worn on it (glasses, earrings, beard) or names a face part and no body part; a part with a face word is first split at "and" or "with" when one piece sits on the face or is a face trait of its own (`blue eyes`, not `a tattoo of an eye`), the pieces kept naming a body part, a bare place taking the face piece's mark (`a scar on the left cheek and right forearm` → `a scar on the right forearm`); a worn item as a tattoo's motif stays (`a tattoo of sunglasses on the right forearm`). Kept: both tattoos above, `a tattoo of an eye and a rose on the left forearm`; still left out: `wears prescription glasses`, `a mole under the left eye`, the `blue eyes` of `blue eyes and a scar on the right knee`. Both engines; the head sheet keeps the marks as typed. **TO TEST** on a render: the eye tattoo on the forearm of a headless sheet, no head drawn.

## 2026-11-24 · GPT Image 2.5 · Person, head sheet: the image comes out 16:9 although the prompt asks 2.7:1

**LEAD** (owner, 2026-11-24, his GPT head sheets: « pour F06 c 16:9 mais en terme de résolution je ne sais pas »). GPT's audit of v1.14.1 (F06) noted that the adult GPT head sheet asks `A wide panoramic landscape image, 2.7:1 aspect ratio` (v134) and that BytePlus limits Seedance 2.5 reference images to a width/height of [0.4, 2.5] (BytePlus, Seedance 2.5 tutorial, Image requirements). His files come out 16:9 (1.78:1), inside that range: no change. The card's Format line already says to check the image obtained. Resolution not known; whether the 2.7:1 words still change the panels is not measured.

## 2026-11-24 · Seedream 5.0 · Person, « Retouche ventre » card at « Très léger » on the target-B sheet (v1.14.1)

**LEAD** (owner's renders, 2026-11-24: his B2 body sheet, then the card three times with it as image 1; settings `planches_perso_2026-11-23_B2.json`: belly fat « Légère », the card's pooch « Très léger » `about half a finger's width`, no depth). Measured against the sheet, L = 284 px: below the navel the front line 15 to 19 px forward in the left profile on both renders (about 0.07 L, about 2 cm for about 1 cm asked); the right profile 2 to 5 px (render 1) and 11 to 15 px (render 2). It starts about halfway between the underband and the navel (3 to 11 px there, against `at and above the navel the belly line keeps its place`), is fullest at the waistband, then tapers smoothly into the tanga to 0 about 40 px lower: no step or fold at the waistband. The front and back views keep their width (±2 px). The third render (« elle fait partie du prompt … a tendance à rater d'un coup les choses ou à changer les choses ») kept nothing: wider panels with no gaps, a softer, less muscular body, so it cannot be measured against the sheet; one edit in three thrown away. The same amounts as the curve on his 63 kg sheet (entry below): the card is reproducible on a second body, still about twice the size asked, and the two profiles can disagree.

## 2026-11-23 · Seedream 5.0 · Person, « Retouche ventre » card: a red line when its pooch is « Aucun » with belly fat

**RULE** (owner, 2026-11-23: « du coup on corrige on fait quoi ? », after the review of the target-B settings: belly fat « Légère », the card's pooch on « Aucun », sharp abs, the configuration of the « DOES NOT WORK » entry below). Interface text only, no prompt changes: with « Graisse : ventre » from « Légère » and the card's « Bidon sous le nombril » on « Aucun », the card says in red `Sans bidon dans cette retouche, Seedream n'en dessine presque pas : « Graisse : ventre » seule a donné 0 à 3 px de profil (2 rendus mesurés), comme sans bidon. Pour un petit bidon, mets « Très léger ».` It goes as soon as a pooch is chosen.

## 2026-11-23 · Blender agent and Seedream 5.0 · Person, "Agent 3D : fesses": the opening line

**RULE** (owner, 2026-11-23, his edit of the start: « attends autre chose pour le bas, j'ai changé une partie juste le début, ça par ça, fais le changement »). The context line now breaks after the bottom (`Il porte un bas de maillot tanga ou un string.`) and the goal reads `Objectif : version enlever le bas, au repos, debout, …` instead of `Objectif : version nue des fesses, …`, his words as written; English `Goal: the version with the bottom removed, …`. **TO TEST**.

## 2026-11-23 · Seedream 5.0 · Person, body sheet: « Cuisses : Fines » says narrow thighs, only the thighs

**RULE** (owner's two renders, the same settings but « Cuisses » on « Fines » then « Moyennes »: « quand je mets jambe mince ça fait mincir tout le corps »). With « Fines », the shoulders, arms and bust came out smaller as well, while the only clause that changed was `average, proportionate thighs that taper clearly to the knees, not bulky` → `slim thighs, clearly narrower than the hips`. One pair of renders: the cause may also be the draw; the 2026-10-28 entry already saw `slim` said in one place slim the whole body. On Seedream, « Fines » and « Très fines » now say `narrow thighs` and `very narrow thighs`, never `slim` or `lean`, followed by `only the thighs are narrow: the shoulders, arms, bust and waist keep the size set above`. The « Key proportions » line says `narrow thighs` and `very narrow thighs` too. GPT unchanged. **TO TEST**: the same pair again.

## 2026-11-23 · Seedream 5.0 · Person, body sheet: the card's pooch as one curve, at « Très léger » (PR #87 build)

**LEAD** (owner's two renders on his sheet with « Graisse : ventre » on « Légère »: « un tout petit peu pendouillant »). Against that sheet, in profile: the front line 14 to 18 px forward below the navel (left, about 2 cm, for about 1 cm asked), 11 to 15 px and 5 to 8 px (right); it now rises from the navel and its top is spread, and the step back in at the waistband is 5 to 13 px over about 2 cm of height, against 19 to 23 px at once before. The shape is better and the fold over the waistband smaller, still there; the amount is still about twice the one asked. Agreed stop: no further wording; the last of the fold by hand on the better render.

## 2026-11-23 · Seedream 5.0 · Person, body sheet: the pooch drawn in the sheet, « Graisse : ventre » on « Légère » (v1.12.0)

**DOES NOT WORK** (owner's two renders, the card's pooch on « Aucun »). The prompt said `and a small, soft pooch of fat just below the navel` in its first sentence and `a small, smooth bulge of soft fat that rounds the lower belly slightly forward in profile`; the rest of the sheet asks for sharp abs (`clear shadow lines`, the outer grooves « Marquées »). Measured in profile, the lower belly past the line of the upper abs: 0 to 3 px (up to 0.01 L), as on his sheet without any pooch (0 to 1 px); the card at « Très léger » had given 14 to 19 px. « Visible » would trade the sharp upper abs for the pooch (`only as soft shapes under the belly fat`). **LEAD**: the card with the curve of the entry below, at « Très léger », on this sheet.

## 2026-11-23 · Seedream 5.0 · Person, body sheet: the pooch as one curve into the waistband, no sag

**RULE** (the owner's renders below). The card's pooch is now `one smooth, shallow curve of soft fat that starts at the navel and runs down into the bottom's waistband, its fullest point about a third of the way from the navel to the waistband`, and `the waistband sits on the curve without cutting into it: no fold, no crease, no overhang, nothing hanging over the waistband`. With a pooch, `natural flesh that settles with gravity like the rest of the body` becomes `the rounder lower belly is natural, firm flesh that holds its shape, no sag, and every other part keeps its own shape and drop from image 1`; depth alone keeps it. The depth's `, apart from the pooch` becomes `, apart from the rounder lower belly`. **TO TEST**. The owner is first trying the pooch in the body sheet itself (« Graisse : ventre » on « Légère », the card's pooch on « Aucun »).

## 2026-11-23 · Seedream 5.0 · Person, body sheet: the card at « Très léger » without depth (v1.12.0)

**DOES NOT WORK** (owner's two renders on his 63 kg sheet: « l'histoire du ventre c'est vraiment bizarre », « on dirait une langue qui pendouille »). Asked `about half a finger's width` (about 1 cm). Measured in L (281 px): render 1, the left profile's front line 0.09 to 0.11 L forward from the navel down (25 to 30 px, about 3.5 cm), the right 0.04 to 0.06 L; render 2, 0.05 to 0.09 L (left), up to 0.07 L (right). In all four profiles the fullest point sits just above the waistband, then the line steps 0.07 to 0.08 L back in at the waistband: a fold hanging over it. The amount is two to three times the one asked, so a smaller word does not give a smaller pooch.

## 2026-11-23 · Seedream 5.0 · Person, body sheet: the card at « Léger » and +33 % on the 63 kg sheet (test build)

**DOES NOT WORK** (owner's render: « le ventre plus gros ça fait ridicule pourtant j'ai mis léger »). On his 63 kg sheet (« Moyenne », biceps « Développés »), the card with `about a finger's width` and `about a third deeper`, measured in L (285 px): the front line 0.06 to 0.09 L forward around the navel in the left profile, up to 0.06 L in the right; the back 0.03 to 0.05 L out (left), 0.01 to 0.03 L (right). Fifth render where the depth goes mostly to the belly. **RULE** (owner: « mettre en rouge … au lieu de régler les problèmes par le delete »): the card's added depths are drawn in red with a warning (PR #86).

## 2026-11-23 · Seedream 5.0 · Person, body sheet: « Pleins et lisses » without « lean frame », at 52 kg (test build)

**DOES NOT WORK** at 52 kg (owner's two renders with the change: `Apart from the bust, a slim frame: slender legs, visible collarbones.`). The body came out drier still: eight abs where four are asked, striated deltoids, veins on the forearms and hands (no vein line). The rest of the sheet still asks for definition (`Slim and toned`, `clear shadow lines`, `thick, very muscular obliques`, `a clear V-line`). **TO TEST**: « Moyenne » at 64 kg, « Veines : Aucune », obliques and V on Auto.

## 2026-11-23 · Seedream 5.0 · Person, body sheet: « Pleins et lisses » never with a lean frame

**RULE** (the owner's body sheet below, « Pleins et lisses » at 52 kg). Smooth muscles need their layer of fat, so with « Pleins et lisses » a slim build (« Mince », « Très mince ») no longer says `lean`, the hip bones or the ribs. Before: `Apart from the bust, a lean frame: slender legs, visible collarbones and hip bones.`; after: `Apart from the bust, a slim frame: slender legs, visible collarbones.` Without « Pleins et lisses » nothing changes. **TO TEST**, with « Moyenne » at 60 to 64 kg, biceps and triceps « Développés », « Veines : Aucune »: large, smooth arms.

## 2026-11-23 · Seedream 5.0 · Person, body sheet: the « Ventre et torse » card at « Léger » and +33 % (v1.8.0)

**DOES NOT WORK** (owner's render, 2026-11-23: « le bidon léger on dirait marqué »). The card on the body sheet of the entry below, `about a finger's width` and `about a third deeper`, measured in L (284 px, underband to crotch): below the navel the front line 0.11 L forward in the left profile (31 px, about 4 cm), 0.08 L in the right; above the navel 0.06 to 0.08 L forward (left), 0.02 to 0.07 L (right), against `at and above the navel the belly line keeps its place`; the back 0.03 L further in at the ribs and 0.03 to 0.04 L further out at the waistband (left), unchanged (right). Depth at the navel +25 % (left), +17 % (right), mostly at the front: the depth added to the pooch, so « Léger » looks « Marqué ». Fourth render where the depth goes to the front. **LEAD**: the pooch alone, without depth.

## 2026-11-23 · Seedream 5.0 · Person, body sheet: « Pleins et lisses » at 52 kg (v1.8.0)

**DOES NOT WORK** (owner's render, 2026-11-23: « je trouve que ça ne marche pas du tout », « le muscle gros et lisse est pas présent »). The sheet: 163 cm, about 52 kg, « Mince » (`Slim and toned`, `Apart from the bust, a lean frame: slender legs, visible collarbones and hip bones`), « Pleins et lisses », biceps « Moyens », triceps « Développés », no vein line: a dry body, the abs, the back and the forearm tendons sharp, the arms not large.

## 2026-11-23 · Seedream 5.0 · Person, body sheet: « Avant-bras » at « Développés » and « Très développés » (test build)

**LEAD** (owner's two renders, 52 kg, « Mince », « Pleins et lisses »: « j'ai essayé avec développés je vois pas de différence notable »). Front view, screen-left arm: just below the elbow 71 to 75 px against 64 to 69 px on his earlier render without the setting (+8 to 10 %), the wrist 35 to 36 px in all; the two levels within 5 px of each other. Then at 63 kg, « Moyenne », biceps « Développés » (owner: « avant bras vide »): the forearms still thin next to the biceps. **RULE**: on Seedream, big forearms are now also said in the first sentence, after the muscular arms (`with strong, muscular arms and thick forearms`; « Très développés »: `very thick forearms`). **TO TEST**.

## 2026-11-23 · GPT Image 2.5 and Seedream 5.0 · Person, body sheet: « Avant-bras »

**RULE** (owner, 2026-11-23: « il y a pas de curseur pour le grossir ou pas », « juste avant le poignet, celui qui sert à serrer la main », « oui fais-le »). A chip row « Avant-bras » after « Triceps »: Auto says nothing (prompts unchanged), Fins `slim forearms`, Moyens `moderate forearms`, Développés `strong, full, smooth forearms: the muscles on the inner side and along the thumb side rounded just below the elbow, the wrists slim`, Très développés `very thick, smooth forearms: ... full and rounded from the elbow to past the middle of the forearm, the wrists slim`. Seedream: in the Muscles line, after the arms; GPT: a `Forearms:` item of its own. The grip muscles' bulk sits in the upper forearm, so the size is asked there, smooth, with slim wrists: on the owner's 2026-11-23 render (no vein line) the forearms showed tendons and veins. From « Développés » up the forearms count as big arms: no `not bulky`, `slender arms`, `Arm and shoulder muscles stay average-sized` or GPT's wiry phrases, and the body light treats them as big arms. **TO TEST** on Seedream 5.0, with « Veines : Aucune ».

## 2026-11-22 · Seedream 5.0 · Person, body sheet: the « Ventre et torse » card on Auto (v1.8.0)

**DOES NOT WORK** across both profiles (owner, 2026-11-22: « on y est pas du tout non ? »; one render, card on Auto, its text unchanged before and after this test (the v1.8.0 card as in the 2026-11-19 entries: `about a finger's width ... past the line of the upper abs`, `the torso about a quarter deeper from back to front than in image 1, all of the extra depth at the back`), on a body sheet from the v1.8.0 prompt with belly fat « Légère » and « Épais »). Measured in L against the legs, waist level: left profile depth +20% (0.51 to 0.62 L), the belly 0.06 L forward and the back 0.04 L out, the best back share so far (about 43%); right profile unchanged (front +0.01 L, back none). The belly fullest at the navel again. Front width unchanged, muscles kept. The two profiles now disagree, which a reference sheet cannot carry. **LEAD**: the edit worked on one profile only; the card's text was not changed. Owner's choice (« oui un bouton pour qu'on puisse l'enlever si besoin si je veux qu'elle ait une cicatrice sur la jambe gauche mais pas droite je dois le pouvoir »): a button in the card, used only by hand, that replaces one profile with the other flipped (PR #82); not for a mark on one side only.


## 2026-11-19 · Seedream 5.0 · Person, body sheet: the « Ventre et torse » card's own settings

**RULE** (owner, 2026-11-19: « on devrait pouvoir avoir plusieurs curseurs pour ça », then « fait ce qu'il faut »). Two chip rows in the card, Auto by default. « Bidon sous le nombril »: Aucun, Très léger `about half a finger's width` (new), Léger `about a finger's width`, Marqué `about two fingers' width`. « Épaisseur de profil »: Aucune, +10 % `about a tenth deeper`, +20 % `about a fifth deeper`, +33 % `about a third deeper`. Auto keeps the prompts as before: « Légère » a finger, « Visible » two fingers, « Épais » `about a quarter deeper`, « Fin » `about a fifth shallower`. Before, the pooch line read `about " + (2 === fatBelly ? "two fingers'" : "a finger's") + " width past the line of the upper abs` and the depth line `the torso about a quarter deeper`; after, `about " + SD_TORSO_POOCH[level] + " width ...` and `the torso about " + SD_TORSO_DEEP[percent] + " deeper`; belly fat from « Marquée » up now keeps `the upper abs kept exactly as soft as they are` too. The card stays once one of its own settings is set, even to none (its prompt box then asks for a choice). Also `as on a fit woman whose upper abs stay sharp` now names the person (man, woman or person). No setting for the back/front split: three wordings left it unchanged. **TO TEST**: « Très léger » for the owner's « un peu trop ».

## 2026-11-19 · Seedream 5.0 · Person, body sheet: the arms forward in profile, then the « Ventre et torse » card on it (v1.6.1-pre)

**WORKS**, the arms (owner's two new body sheets, 2026-11-19, `bras-profil` build, no comment on them). In both sheets and both profiles the arm hangs down the middle of the side, the hand beside the middle or front of the thigh, and the back line shows from the shoulder blade to the glute; before, the hand sat on the glute. The forearm does not hide the belly line. **LEAD**, the card on one of them (two renders, belly fat « Légère », « Épais »; owner: « pour le ventre ça peut marcher mais c un peu trop on devrait pouvoir avoir plusieurs curseurs pour ça »). Measured in L against the legs: the belly fullest below the navel now (`its fullest point halfway between the navel and the bottom's waistband` held), 0.05 to 0.07 L forward at that point in the left profile, 0.04 to 0.06 L in the right; with the back line free, the back gained 0.03 L in the left profile of both renders, about 0 in the right; waist depth +11 to +16% (left), +6 to +8% (right); front width +3 to +5%. A finger's width came out about as asked, which the owner finds a little too much.

## 2026-11-19 · GPT Image 2.5 and Seedream 5.0 · Person and child, body sheets: the arm of the side views

**RULE** (owner, 2026-11-19, « oui c une bonne idée »). On his renders the hanging arm sat over the back half of the torso in profile, the hand on the glute, so the back line hardly showed and the torso card could not deepen it. Every standing body sheet, adult and child, both engines, marked and light arms, now ends its arms text with `; in the side views the arms hang slightly forward, the back line clear` (twelve words: the Seedream sheet with a fitted top and a very generous bust went over its 600-word warning with a longer text). Before, nothing said where the arm hangs in profile: the Seedream adult line ran `... the hands well clear of the thighs. Neutral expression.`, GPT's `... the hands inside the panel, so the silhouette and both hands stay readable, neutral expression.`; after, the clause comes before the full stop or the semicolon (release: v1.6.1-pre). GPT's `, so the silhouette and both hands stay readable` becomes `; the silhouette ...` (no second « so »); the conical bust's `in the side views the arms hang straight down behind the bust` becomes `the arms stay behind the bust there`. **TO TEST**: the back line visible in both profiles, the belly line not hidden by the forearm.

## 2026-11-19 · Seedream 5.0 · Person, body sheet: the card with the front line held (v1.6.1-pre, `ventre-torse-3`)

**DOES NOT WORK**, the back/front split (owner's two renders, 2026-11-19, same image 1 and settings as the entry below, no comment). Measured against the legs in both profiles, in L, at the waist: the belly 0.07 L further forward in both renders and both profiles (0.08 L and 0.05 L with the previous card), so `the chest and the belly line in front stay where they are in image 1` did nothing; the back gained 0.07 L in one profile of one render only, nothing elsewhere. Waist depth +28% and +15%; front width +5% and +6%. The belly is now as far forward below the navel as at the navel (before: fullest at the navel), a small gain from `its fullest point halfway between the navel and the bottom's waistband`. **RULE**: three wordings of the split gave the same result, so text alone has reached its ceiling; the text stays as it is, since nothing in it measured worse.

## 2026-11-19 · Seedream 5.0 · Person, body sheet: the corrected « Ventre et torse » card (v1.6.1-pre)

**WORKS** in part (owner, 2026-11-19: « c déjà mieux »; the card of v1.6.1-pre on the same sheet as before, one render). Measured in profile, with L = bra underband to crotch in the front view: waist depth 0.54 L to 0.64 L (+19% for « a quarter »), front waist width +4% (the previous card +7%), muscles and framing as in image 1. Still off: about two thirds of the extra waist depth in front (belly 0.064 L ahead of the underbust line, back 0.035 L further out), as with the previous card, so `the extra depth mostly at the back` did nothing; the belly fullest at the navel, a round belly from under the ribs, not a lower pooch. **RULE**: the depth line now reads `all of the extra depth at the back: the back of the ribcage rounder and the lower back fuller, the back line further out above and below the hanging arm; the chest and the belly line in front stay where they are in image 1, apart from the pooch` (`the waist nearly as deep as the chest` dropped); the pooch gets `its fullest point halfway between the navel and the bottom's waistband` and `at and above the navel the belly line keeps its place from image 1` (`that brings the lower belly only slightly forward in the side views` dropped). **TO TEST**; if the front still takes most of the depth, the text has reached its ceiling for this split.

## 2026-11-19 · Seedream 5.0 · Person, body sheet: the « Ventre et torse » card on the third render

**DOES NOT WORK** (owner, 2026-11-19: « la largeur du torse de profil on peut mieux faire non ? »; the card with belly fat « Légère » and « Épais » on his third render). The pooch came out far past a finger's width: the depth line's `the back line and the belly line both further out` pushed the belly out a second time. The back line in profile sits mostly behind the hanging arm, so the depth hardly shows. The whole body came out softer: shoulders, arms, back and upper abs lost their definition despite the keep list. **RULE**: the depth goes mostly behind (`the extra depth mostly at the back: the ribcage and the lower back fuller behind, the back line further out above and below the hanging arm, the chest and the upper abs forward by only a little`), and `Every muscle keeps exactly its size and definition from image 1: the shoulders, arms, back and upper abs as large and as sharp as they are; no other part gains fat.` **TO TEST**.

## 2026-11-19 · Seedream 5.0 · Person, body sheet: eighth render (v1.6.0), the card's pooch from « Visible » too

**LEAD** (owner's eighth render, 2026-11-19, v1.6.0: belly fat « Visible », « 4 carreaux + ligne centrale », « Pleins et lisses », « Épais », deltoids at their top, no retouche). Muscles large and smooth, arms kept their volume, the four upper abs and the centre line soft under the fat, the trunk deeper in profile than before (one render); the lower back smooth. The pooch barely there; the deltoids larger than his reference photo, as `the widest part of the upper body` asks; the faint line above the tanga and the crotch at about 44% for 48% unchanged. **RULE**: the « Ventre et torse » card also adds the pooch with belly fat « Visible ». Before, « Légère » only: `a small, soft, rounded pooch of lower-belly fat that brings the lower belly only slightly forward in the side views, about a finger's width past the line of the upper abs, as on a fit woman whose upper abs stay sharp`. After, « Visible »: `... about two fingers' width past the line of the upper abs, the upper abs kept exactly as soft as they are` (its abs are soft shapes under the fat); « Légère » unchanged. **DOES NOT WORK**, the depth from the text alone (« pour le moment je ne vois pas beaucoup de différence »; `a deep torso in profile ...` among the body details). **RULE**: the card's depth is now relative to image 1: `in the side views, the torso about a quarter deeper from back to front than in image 1: the ribcage, the waist and the lower back all thicker, the back line and the belly line both further out, the waist nearly as deep as the chest; the front and back views keep their width` (before: `in the side views, a deeper torso: the ribcage and the waist thicker from back to front, the waist nearly as deep as the chest`). **TO TEST** with the card.

## 2026-11-19 · Seedream 5.0 · Person, body sheet: the « Ventre et torse » retouche card

**RULE** (owner, 2026-11-19: « il faut adapter le html pour savoir ce qui doit être fait après et ça doit être ui friendly »). As cards 2b to 2d for what Seedream draws from an edit and not from a description, a card « Retouche : ventre et torse » (button « Ventre ») shows with belly fat « Légère » or a torso depth set: its intro says why, then the order of the steps; its prompt edits the torso only, the pooch at about half the depth of the first retouche that worked (`brings the lower belly only slightly forward in the side views, about a finger's width past the line of the upper abs`), the depth as the setting says, everything else kept. The two settings' help names the card. **TO TEST** on Seedream 5.0.

## 2026-11-19 · GPT Image 2.5 and Seedream 5.0 · Person, body sheet: « Épaisseur du torse »

**RULE.** « Épaisseur du torse (de profil) »: Auto, Fin (a shallow torso in profile) or Épais (a deep trunk, the waist nearly as deep as the chest), both engines. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-11-19--gpt-image-25-and-seedream-50--person-body-sheet--épaisseur-du-torse-)

## 2026-11-19 · Seedream 5.0 · Person, body sheet: the pooch by a free retouch of the sheet

**WORKS**, a little too much: « Retouche libre » on his best sheet drew a clear pooch in both profiles, more than his photo; next, the same retouch at half depth. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-11-19--seedream-50--person-body-sheet-the-pooch-by-a-free-retouch-of-the-sheet)

## 2026-11-19 · Seedream 5.0 · Person, body sheet: sixth and seventh renders, the pooch, « 4 carreaux + ligne centrale »

**DOES NOT WORK / RULE.** Three belly-fat texts drew no pooch on a muscular body: no more words, the retouch of the sheet instead; new abs style « 4 carreaux + ligne centrale », both engines. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-11-19--seedream-50--person-body-sheet-sixth-and-seventh-renders-the-pooch--4-carreaux--ligne-centrale-)

## 2026-11-19 · Seedream 5.0 · Person, body sheet: fifth render, « Pleins et lisses » and the lead's pooch

**LEAD.** « Pleins et lisses »: smooth arms and back, no cuts, arms thinner; the lead's pooch a slight rounding above the tanga, weaker than his photo; back dimples on Auto drawn, to test with « Aucune ». [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-11-19--seedream-50--person-body-sheet-fifth-render--pleins-et-lisses--and-the-leads-pooch)

## 2026-11-19 · Seedream 5.0 and GPT Image 2.5 · Person, body sheet: large muscles without the cuts, « Aspect des muscles »

**DOES NOT WORK / RULE.** « Discrets » on every zone still drew cut shoulders and back; new « Aspect des muscles »: « Pleins et lisses » keeps the sizes and reads every zone as « Discrets » (abs apart), full rounded muscles under a thin layer of soft fat. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-11-19--seedream-50-and-gpt-image-25--person-body-sheet-large-muscles-without-the-cuts--aspect-des-muscles-)

## 2026-11-19 · Seedream 5.0 · Person, body sheet: third render, the lower-belly pooch not drawn, the line above the tanga

**DOES NOT WORK / RULE.** The lower-belly pooch not drawn on a muscular body; a faint line above the tanga on all three renders; with belly fat « Légère » the Seedream lead says `a small, soft pooch of fat just below the navel`. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-11-19--seedream-50--person-body-sheet-third-render-the-lower-belly-pooch-not-drawn-the-line-above-the-tanga)

## 2026-11-19 · Seedream 5.0 · Person, body sheet: the second render measured, and the self-review's fixes

**DOES NOT WORK / REJECTED / RULE.** Short legs still at about 44% for 48% asked: no more words for leg length, a proportion guide next; the taller slit navel rejected; belly fat « Légère » with « Plat, lisse » says a firm, smooth upper stomach. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-11-19--seedream-50--person-body-sheet-the-second-render-measured-and-the-self-reviews-fixes)

## 2026-11-19 · All · One final version, its number and date at the top

**RULE.** PR #64 and the untitled « Agent 3D » prompts merged into one release; the header shows `vX.Y.Z · YYYY-MM-DD` on every build. No prompt changes. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-11-19--all--one-final-version-its-number-and-date-at-the-top)

## 2026-11-19 · Seedream 5.0 and GPT Image 2.5 · Person, body sheet: second render, back dimples, serratus, belly fat, arms

**DOES NOT WORK / RULE.** « Aucune » back dimples and serratus drew them anyway: both now say a smooth surface; belly fat « Légère » asks a small bulge below the navel; « Triceps » set apart from « Biceps »; arms from « Développés » said in the first sentence. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-11-19--seedream-50-and-gpt-image-25--person-body-sheet-second-render-back-dimples-serratus-belly-fat-arms)

## 2026-11-19 · Seedream 5.0 · Person, headless body sheet: first render with the side settings, short legs

**LEAD / DOES NOT WORK.** Side lines, central groove and V show but soft; the crotch at about 44% for 48% asked; « Coureur » with short legs no longer says long legs. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-11-19--seedream-50--person-headless-body-sheet-first-render-with-the-side-settings-short-legs)

## 2026-11-19 · GPT Image 2.5 and Seedream 5.0 · Person, body sheet: side lines of the abs, obliques, lower-belly V, serratus

**TO TEST.** Four Auto-by-default settings after the abs (side lines, obliques, lower-belly V, serratus), one positive line in both engines, hidden on a soft or fat belly and under the outfit parts that cover them. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-11-19--gpt-image-25-and-seedream-50--person-body-sheet-side-lines-of-the-abs-obliques-lower-belly-v-serratus)

## 2026-10-29 · Blender agent and Seedream 5.0 · Person, both "Agent 3D" prompts without a title or a CONTEXT heading

**RULE.** The two "Agent 3D" prompts open with their context line, no title or CONTEXT heading. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-29--blender-agent-and-seedream-50--person-both-agent-3d-prompts-without-a-title-or-a-context-heading)

## 2026-10-29 · GPT Image 2.5 and Seedream 5.0 · Every sheet: a neutral 18% grey backdrop

**RULE.** Every backdrop says `neutral 18% grey` (about sRGB 118, 118, 118, no tint), both engines: the renders had a blue, dark backdrop. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-29--gpt-image-25-and-seedream-50--every-sheet-a-neutral-18-grey-backdrop)

## 2026-10-29 · Blender agent and Seedream 5.0 · Person, "Agent 3D : fesses": the bottom removed, the natural drop of the glutes

**RULE.** A second Agent 3D panel in "Hanches" writes the owner's Blender prompt from the sheet: the bottom removed, the glutes lowered only to a ptosis grade read from the glute settings (Gonzalez 2006, À VALIDER), never lifted. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-29--blender-agent-and-seedream-50--person-agent-3d--fesses-the-bottom-removed-the-natural-drop-of-the-glutes)

## 2026-10-29 · Seedream 5.0 · Person, step 4 "Final photo pass" on a bare body sheet

**DOES NOT WORK / WORKS for one view.** An edit asking only for a photographic finish changed almost nothing (luma correlation 0.987), and the whole sheet asked as a new photograph no better; the back view alone, centred in a 16:9 frame, worked in three renders of three; the front view and a profile were refused by the platform. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-29--seedream-50--person-step-4-final-photo-pass-on-a-bare-body-sheet)

## 2026-10-28 · Seedream 5.0 · Person, body sheet: fat zones at « Légère », and soft thighs never "lean"

**DOES NOT WORK / RULE.** Fat zones at « Légère » showed no difference on a slim build said `slim` seven times; the thighs no longer say `lean` once the legs are soft. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-28--seedream-50--person-body-sheet-fat-zones-at--légère--and-soft-thighs-never-lean)

## 2026-10-28 · Seedream 5.0 and Blender agent · Person, "Agent 3D": the bottom kept

**DOES NOT WORK / RULE.** The edit changed the bottom; the context line now says only the top is removed and the Blender agent hides the top only. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-28--seedream-50-and-blender-agent--person-agent-3d-the-bottom-kept)

## 2026-10-28 · Seedream 5.0 · Person, the "Agent 3D" text as an edit prompt: the domed areola, a guide image, then the puffy-areola wording

**LEAD.** A clay guide image gave the areola dome but its color and look; each realism pass flattened it again. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-28--seedream-50--person-the-agent-3d-text-as-an-edit-prompt-the-domed-areola-a-guide-image-then-the-puffy-areola-wording)

## 2026-10-28 · Seedream 5.0 · Person, the "Agent 3D" text as an edit prompt: the domed areola, third try

**DOES NOT WORK.** The third wording gave no distinct areola dome; at this sheet's scale the relief spans 2 or 3 px, so the text has reached its ceiling. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-28--seedream-50--person-the-agent-3d-text-as-an-edit-prompt-the-domed-areola-third-try)

## 2026-10-28 · Blender agent and Seedream 5.0 · Person, "Agent 3D": the prompt within 10,000 characters

**RULE / TO TEST.** The « Agent 3D » prompt cut under the 10,000-character limit; every step, check and stop rule kept. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-28--blender-agent-and-seedream-50--person-agent-3d-the-prompt-within-10000-characters)

## 2026-10-28 · Seedream 5.0 · Person, the "Agent 3D" text as an edit prompt: the domed areola, second try

**DOES NOT WORK / RULE.** Still no areola dome; « Bombée » is now said by what each view shows, the side views first. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-28--seedream-50--person-the-agent-3d-text-as-an-edit-prompt-the-domed-areola-second-try)

## 2026-10-28 · Seedream 5.0 · Person, the "Agent 3D" text as an edit prompt: nipples and areolas

**DOES NOT WORK / RULE.** The « Agent 3D » text used as an edit prompt drew no areola dome; its context line now says each nipple and areola choice in plain words. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-28--seedream-50--person-the-agent-3d-text-as-an-edit-prompt-nipples-and-areolas)

## 2026-10-28 · Blender agent · Person, "Agent 3D": areola relief and tubercles

**RULE.** Two « Agent 3D » choices, Auto by default: « Relief de l'aréole » (Plate, En plateau, Bombée) and « Tubercules de Montgomery », geometry only, checked in V11. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-28--blender-agent--person-agent-3d-areola-relief-and-tubercles)

## 2026-10-28 · Blender agent · Person, "Agent 3D": nipples and areolas

**RULE.** "Mamelons" and "Aréoles" in the "Agent 3D" panel: Auto leaves the agent prompt unchanged; a type set adds published targets in millimetres (Lee 2008, Sanuki 2009, Demiröz 2021, Park 1999), À VALIDER. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-28--blender-agent--person-agent-3d-nipples-and-areolas)

## 2026-10-28 · GPT Image 2.5 / Seedream 5.0 · Person, body sheet: tuberous bust, low placement, bust veins

**RULE / TO TEST.** Bust options « Tubéreuse », « Basse » and « Veines du buste » for adults; an Auto that set every large bust low was rejected. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-28--gpt-image-25--seedream-50--person-body-sheet-tuberous-bust-low-placement-bust-veins)

## 2026-10-28 · GPT Image 2.5 / Seedream 5.0 · v115 to v158 integration

**RULE / TO TEST / DOES NOT WORK.** The owner's v158 merged three ways, this repository's places, faces, light and flows kept; the v128 "Discrets" abs on his very slim body to test; his edited render: crotch at 40% for 48%. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-28--gpt-image-25--seedream-50--v115-to-v158-integration)

## 2026-10-19 · Seedream 5.0 · Person, body reference · README example

**LEAD.** An owner-selected four-view Seedream body sheet kept for the README; no prompt change. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-19--seedream-50--person-body-reference--readme-example)

## 2026-10-17 · GPT Image 2.5 / Seedream 5.0 · v114b integration

**RULE / DOES NOT WORK / TO TEST.** The owner's v114b merged: free outfit text, vehicle staging, Face Character on Auto traits; a free-outfit change no longer breaks the copied-face signature. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-17--gpt-image-25--seedream-50--v114b-integration)

## 2026-10-17 · GPT Image 2.5 / Seedream 5.0 · Photo head tracking

**RULE.** PR #56: the clothing-only line stays in the head prompt, out of the face signatures. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-17--gpt-image-25--seedream-50--photo-head-tracking)

## 2026-10-17 · GPT Image 2.5 and Seedream 5.0 · v111/v112 integration

**RULE / TO TEST.** The owner's v112 merged: a photo can supply the clothes, Seedream people from photos and in 3D/2D, photo-only keeps the photos unchanged. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-17--gpt-image-25-and-seedream-50--v111v112-integration)

## 2026-10-16 · Seedream 5.0 · Person, male Canon head · explicit brows and jaw

**RULE.** Canon's jaw and brow cues only with those controls on Auto. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-16--seedream-50--person-male-canon-head--explicit-brows-and-jaw)

## 2026-10-16 · GPT Image 2.5 and Seedream 5.0 · Child head · nose width and hidden adult Beauty

**RULE.** The child nose takes the full width scale; the adult Beauty never widens a child's nose. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-16--gpt-image-25-and-seedream-50--child-head--nose-width-and-hidden-adult-beauty)

## 2026-10-16 · GPT Image 2.5 and Seedream 5.0 · v110b integration from the owner's second line

**RULE / DOES NOT WORK / TO TEST.** The owner's v110b merged: this repository's calibrated faces, light and flows kept; reported v96 to v99 belly-projection wordings and the v102 head-size framing did not work; do not tune the belly text again without a new experiment. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-16--gpt-image-25-and-seedream-50--v110b-integration-from-the-owners-second-line)

## 2026-10-12 · GPT Image 2.5 and Seedream 5.0 · Person · the owner's second v95 line in the app (v1.2.0)

**RULE** (v1.2.0). The owner's second v95 line merged into the app: this repository's recalibrated faces, the v1.1.2 Seedream body light, its "Retouche libre" (empty copies nothing), the four-close-up GPT head sheet, an engine nobody picked follows the subject. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-12--gpt-image-25-and-seedream-50--person--the-owners-second-v95-line-in-the-app-v120)

## 2026-10-11 · Seedream 5.0 · Person, headless body sheet · the test's three changes in the app (v1.1.2)

**WORKS** (v1.1.2, the user's test). On a lean Seedream body, zones at "Discrets" share one phrase (`barely visible muscles, no muscle bulk`), the pear bust loses `as often on lean athletic women`, marked veins get a light that brings them out with the muscles smooth; other settings **TO TEST**. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-11--seedream-50--person-headless-body-sheet--the-tests-three-changes-in-the-app-v112)

## 2026-10-11 · Seedream 5.0 · Person, headless body sheet · too muscular, not slim

**TO TEST**, then works as the entry above. About ten athletic cues outweighed five slim ones; a negated word is still a word; giving marked veins the soft light was **REJECTED**. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-11--seedream-50--person-headless-body-sheet--too-muscular-not-slim)

## 2026-10-10 · Seedream 5.0 · Person, retouch card · help of "Autres retouches" (v1.1.1)

**WORKS** (v1.1.1). Interface text only: the help above "Autres retouches" says what its text is for. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-10--seedream-50--person-retouch-card--help-of-autres-retouches-v111)

## 2026-10-10 · GPT Image 2.5 and Seedream 5.0 · Object, clothing kept as in the photo · "On an invisible mannequin" (v1.1.0)

**WORKS** (v1.1.0). Optional "On an invisible mannequin" for clothing kept as in the photo: views 1 and 2 on a ghost mannequin, view 3 laid flat. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-10--gpt-image-25-and-seedream-50--object-clothing-kept-as-in-the-photo--on-an-invisible-mannequin-v110)

## Owner's second line · lessons from tool versions v76 to v95

**RULE / WORKS / DOES NOT WORK / TO TEST.** [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#owners-second-line--lessons-from-tool-versions-v76-to-v95): content filters (the Tombante wording blocked, not the size; never rework a prompt to get past Seedream's filter), reference outfits at Very generous, bust size and drop (the text reached its ceiling for the drop: use a shape guide image), builds, face fixes, and the working method (fixed-randomness grids, hashed files, no `\b` next to an accented letter). Read it before changing those prompts.

## Before v1.0.0 · lessons from tool versions v1 to v75

**RULE / WORKS / DOES NOT WORK / TO TEST.** [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#before-v100--lessons-from-tool-versions-v1-to-v75): model-specific references, framing, adult/child limits, calibrated bodies and faces, photo identity, short concrete wording, and known limits of image models. Read its rules before changing those prompts.
