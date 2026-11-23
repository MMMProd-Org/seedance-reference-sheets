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

**RULE** (owner, 2026-11-19, a photo of the same fit woman: « elle est très large entre le dos et le ventre, du moins de profil »). « Épaisseur du torse (de profil) » after « Cage thoracique »: Auto (nothing said), Fin `a shallow torso in profile: the ribcage and the waist thin from back to front`, Épais `a deep torso in profile: the ribcage and the waist thick from back to front, the side views showing a solid, deep trunk, the waist in profile nearly as deep as the chest`, among the body details, both engines. **TO TEST**.

## 2026-11-19 · Seedream 5.0 · Person, body sheet: the pooch by a free retouch of the sheet

**WORKS**, a little too much (owner, 2026-11-19: « ça marche mais un peu trop sur le profil mais on y est »). « Retouche libre » on his best sheet with `in all four views, just below the navel, a small, soft, rounded pooch of lower-belly fat that pushes the lower belly slightly forward in profile, as on a fit woman whose upper abs stay sharp`: a clear pooch in both profiles, the upper abs, the arms and the rest kept. In the profiles it bulges more than his photo. **TO TEST**: the same retouch on that result, `in the side views, the lower-belly pooch about half as deep, the front view unchanged`.

## 2026-11-19 · Seedream 5.0 · Person, body sheet: sixth and seventh renders, the pooch, « 4 carreaux + ligne centrale »

**DOES NOT WORK** (owner, 2026-11-19: « toujours pas de petit bidon »; belly fat « Visible » tried too: « le ventre ne bouge plus mis à part les muscles qui disparaissent », the bust larger and the glutes with cellulite). Three texts (« Légère », « Légère » in the lead, « Visible ») drew no lower-belly pooch on a muscular body. **RULE**: no more words for it; the owner's own lesson (Seedream enlarges in an edit of a sheet already made what a description does not draw) points to the free retouch of the sheet. **RULE**: a new abs style « 4 carreaux + ligne centrale » (« cette fille a aussi une ligne centrale et 4 carreaux au-dessus mais le html ne permet pas de le faire »): `four segments above the navel, split by a vertical groove down the middle that runs on below the navel`, both engines. **TO TEST**.

## 2026-11-19 · Seedream 5.0 · Person, body sheet: fifth render, « Pleins et lisses » and the lead's pooch

**LEAD** (owner's fifth render, 2026-11-19: « je suis pas totalement convaincu », « ces fossettes dans le dos toujours présentes », « ce petit bas du ventre arrondi malgré les muscles pas facile à avoir »). « Pleins et lisses »: arms and back smooth, no cuts, the soft light kept; the arms read thinner than on the fourth render. The pooch in the lead: a slight forward rounding just above the tanga in the left profile, weaker than his photo. Back dimples drawn: his prompt has no `the lower back smooth ...` line, the setting is Auto (the old « Aucune », as the 2026-11-19 entry warns): **TO TEST** with « Aucune ». Abs still cut: they keep their own level (`with clear shadow lines`), by design.

## 2026-11-19 · Seedream 5.0 and GPT Image 2.5 · Person, body sheet: large muscles without the cuts, « Aspect des muscles »

**DOES NOT WORK** (owner's fourth render, 2026-11-19: « j'ai muscles apparents discrets et pourtant il explose au visage », « je n'arrive pas à avoir un bras large musclé mais sans avoir les muscles qui explosent »; his two photos: women with large, round deltoids and arms, smooth). « Muscles apparents : toutes les zones » at « Discrets » left the shoulders and back at their own setting (`sharply defined shoulders and back`, `defined shoulders, visible shoulder blades and spine groove`): every muscle drawn cut. **RULE**: « Aspect des muscles », Auto (nothing changes) or « Pleins et lisses »: the sizes stay; every zone at « Présents » or « Marqués » reads « Discrets » (abs apart), so no `sharply defined` and the soft light; the zones' shared phrase becomes `full, rounded muscles under a thin, even layer of soft fat that smooths their outlines into soft, continuous curves, the skin over them smooth and even, their size read by volume and soft shading` (GPT: a `Muscle surface:` line). `no muscle bulk` is no longer written next to deltoids at « Développés » or more. **TO TEST** on Seedream 5.0.

## 2026-11-19 · Seedream 5.0 · Person, body sheet: third render, the lower-belly pooch not drawn, the line above the tanga

**DOES NOT WORK** (owner's third render, 2026-11-19: « j'ai pas le petit bidon dont on a parlé », « j'ai toujours cette ligne en bas du nombril »; « Ligne centrale » at « Discrets », belly fat « Légère », deltoids and triceps at their top, obliques « Très marqués »). In profile the lower belly is flat; the body reads athletic all over (very large deltoids and triceps), the bulge said only in the fat line. A faint horizontal line just above the tanga shows on all three renders, under three different belly texts (loose skin, `a thin layer of soft fat below the navel`, `a small, smooth bulge ... the skin over it smooth and even`): not the word « Légère ». Common to the three: the low tanga and the V « Marqué». **TO TEST**, one render: the same settings, V on Auto. **RULE**: with belly fat « Légère », the Seedream lead also says `a small, soft pooch of fat just below the navel` (`with strong, muscular arms and glutes, and a small, soft pooch of fat just below the navel.`), as the muscular arms and legs. **TO TEST** with the same settings.

## 2026-11-19 · Seedream 5.0 · Person, body sheet: the second render measured, and the self-review's fixes

**DOES NOT WORK**, the short legs (second render, made with `tapered runner's legs: lean thigh muscles`): the crotch about 44% down from the collarbones to the soles, for 48% asked, as on the first render (44%) and on 2026-10-28 (40%). Dropping "long" and "elongated" changed nothing measurable; the dropped words stay dropped (they contradicted the length). **RULE**: no more words for the leg length; the next step is a proportion guide image, as for the drop of the bust (v89).

**REJECTED**, the slit navel said taller than wide: the second render drew it slit-like without it; the default prompts are back to the golden set before it. **RULE**: belly fat « Légère » with « Plat, lisse » says `a firm, smooth upper stomach`, no longer `a flat, smooth stomach` next to the bulge, both engines. A local build shows `vX.Y.Z-pre`: its number is the one its merge would release, not a tag yet.

## 2026-11-19 · All · One final version, its number and date at the top

**RULE** (owner, 2026-11-19: « unifie, corrige tout pour une version finale et affiche moi en haut de la planche la version et la date »). Two pieces of his work had stayed out of the chain this release builds on: PR #64 (« Tubéreuse », « Basse », « Veines du buste », entry of 2026-10-28) and the 2026-10-29 « Agent 3D » prompts without a title (branch `feat/agent3d-no-headings`, no PR). Both are merged here with PRs #61 to #75 and the render audit. The header shows `vX.Y.Z · YYYY-MM-DD` on every build: CI's release version, or the one `version.py` gives a local build, and the last commit's date. No prompt changes.

## 2026-11-19 · Seedream 5.0 and GPT Image 2.5 · Person, body sheet: second render, back dimples, serratus, belly fat, arms

Owner's second render, 2026-11-19, Seedream 5.0 (same body, 64 kg, « Moyenne », belly fat « Légère », arms « Développés », back dimples « Aucune », serratus left on Auto). **DOES NOT WORK**, seen on it: two dimples above the tanga (« quand on met aucune fossette au dos il y en a quand même »; « Aucune » wrote nothing); serratus ridges in the profiles (« quand on met aucun on en voit quand même »; the chip offered only Auto and Visibles); a faint horizontal crease above the tanga for `a thin layer of soft fat below the navel` (« ça ressemble à de la peau flasque ou une marque de cellulite, c'est pas du tout de la graisse »); thin arms. Owner's target, from a photo: « le haut du ventre est super musclé avec 4 carreaux ... juste en dessous du nombril on voit un petit renflement de graisse », obliques larger than « Marqués », « regarde la taille de ces triceps ils sont énormes, on devrait pouvoir choisir indépendamment les triceps ».

**RULE**, both engines unless said, **TO TEST** on Seedream 5.0, one setting at a time:
- « Fossettes du bas du dos »: Auto (the old « Aucune », nothing said), Aucune `the lower back smooth and evenly filled just above the glutes, on each side of the spine` (no word "dimple": a negated word is still a word), Visibles. A saved « Aucune » now reads Auto: pick « Aucune » again.
- « Dentelés »: Aucun `the sides of the ribcage below the armpits smooth and evenly covered, one soft surface from the armpit down to the waist`. « Obliques »: Très marqués `thick, very muscular obliques ..., each a rounded ridge of muscle bulging just above the hip bone`.
- Belly fat « Légère »: `just below the navel, a small, smooth bulge of soft fat that rounds the lower belly slightly forward in profile, the skin over it smooth and even`; the abs then keep their upper segments and stop calling the lower belly flat (`four segments above the navel, the lower belly softly rounded below the navel`, GPT `the lower abdomen softly rounded below them`, « Ligne centrale » `a firm upper stomach`). Not the v96 to v99 belly-projection wording (archive): a lower-belly bulge at « Légère », a new render.
- « Biceps et triceps » becomes « Biceps », and « Triceps » joins it: Auto follows « Biceps » (prompts unchanged); another size says each muscle apart (`moderate biceps, very large triceps, a thick horseshoe of muscle filling the back of the upper arms, ...`). Arms at « Développés » or more, either muscle, are said in the first sentence on Seedream (`with strong, muscular arms`), as the legs and glutes (v157); « Développés » says `well-developed, rounded biceps and triceps`.
- The lead says `soft, heavy` only for a « Forte » build, fat from « Marquée » up in that list, marked saddlebags, a low bust or low glutes; otherwise `soft hips, thighs and upper arms`. Light cellulite: `a few small, shallow dimples, clearly visible in a full-body view` (first render: none seen). A drawn slit navel says `a narrow opening clearly taller than wide` (first render: round; golden prompts change by these words only).
- Not changed: the arms out, about 14 degrees for 30 on both renders. The hands already reach within about 25 px of the front panel's edges: a wider angle needs a smaller figure.

## 2026-11-19 · Seedream 5.0 · Person, headless body sheet: first render with the side settings, short legs

Owner's render, 2026-11-19, Seedream 5.0 (woman, 27, 163 cm, 54 kg, « Courtes », « Coureur », glutes muscular, « Ligne centrale » at « Discrets », side lines « Marquées », obliques « Marqués », V « Marqué », halter triangle and tanga, headless; one render, measured on the 2048 × 1152 image). **LEAD**, the sides: central groove, side lines and a V all show, but soft, not « clear » nor « defined »; the abdomen's own words just before (`only faintly hinted, no deep shadows`) may soften them (not isolated). **DOES NOT WORK**, the legs: in the front view the crotch sits about 44% down from the collarbones to the soles, for 48% asked; the legs about 1.26 times the torso, for 1.1 (2026-10-28: 40%). **RULE**: the prompt asked for short legs and, with « Coureur », `long, tapered runner's legs: lean, elongated thigh muscles`; with « Très courtes » or « Courtes » the shape now says `tapered runner's legs: lean thigh muscles`, both engines (`sdLegShape`). **TO TEST**: the same settings, one render. Also seen, unchanged: arms about 14 degrees out for `about 30 degrees`, the hand's-width gap met (v157 measured 11); no visible cellulite; arms and thighs not soft, though the lead says `soft, heavy hips, thighs and upper arms` at hip and thigh fat « Légère » (not changed: the 2026-10-28 entry asked « Légère » to show more, not less).

## 2026-11-19 · GPT Image 2.5 and Seedream 5.0 · Person, body sheet: side lines of the abs, obliques, lower-belly V, serratus

**TO TEST.** Owner, 2026-11-19, from a photo of a lean, fit woman (defined upper abs, side lines, obliques, a V toward the lower belly): « ajoute les obliques, lignes latérales, V etc etc », « lumière on touche pas ». Four settings after "Muscles apparents : abdos", each Auto by default (nothing said: the 31 golden prompts are unchanged): "Lignes latérales des abdos" (Visibles, Marquées), "Obliques" (Visibles, Marqués), "V du bas-ventre" (Léger, Marqué), "Dentelés" (Visibles). Both engines get one line after the abdomen, in positive words, for example `Sides of the torso: a clear, slightly curved vertical groove along each outer edge of the abs, from the lower ribs down to the hip bones; the obliques softly visible at the sides of the waist, between the lower ribs and the hip bones; a shallow V-line running from each hip bone diagonally down toward the lower belly.`

They are not muscle-definition zones: the body light is unchanged (checked). Hidden and ignored where the prompt already says a soft or fat belly: "Ventre doux", "Plat, sillon au milieu", "Bas du ventre arrondi", "Dad bod", belly or flank fat from "Visible", build "Forte", a child, a body kept as in the photo. With a side-line setting, GPT's own texts no longer say the sides too (`and faint lines at the sides` of "Ligne centrale", `and a curved groove runs down each side ...` of "4 carreaux"); with every zone at "Non" and abs on Auto, Seedream no longer writes `No visible muscle definition.` next to them.

With the reference outfit, a part it covers is not asked for (Sourcery, PR #75): no V under the top with bike shorts or the one-piece, no side lines or obliques under the one-piece; it stays with the triangle and tanga, the GPT shorts and swim sets (their top leaves the lower abdomen visible), the men's shorts and trunks and the user's own outfit. The near-photo settings (Mince, Légère, Fin, 4 carreaux at Présents, side lines, obliques, V, tanga, headless) give a Seedream body of 575 words, near the 600 reported. "Nombril" and "Cage thoracique" (v140) already replace the drawn navel and ribcage on both engines and every build (checked): unchanged. **TO TEST** on Seedream 5.0, one setting at a time; the 2026-10-11 entry warns that abdominal cues pushed a slim body toward an athletic one.

## 2026-10-29 · Blender agent and Seedream 5.0 · Person, both "Agent 3D" prompts without a title or a CONTEXT heading

**RULE** (owner, 2026-10-29: « pas besoin de titre ni contexte », « titre et contexte ça sert à rien »). The bust and glutes prompts no longer open with `# Prompt agent : …` and `## CONTEXTE`: the first line is the context line itself, the plain-words goal an image model reads first; the other headings stay.

## 2026-10-29 · GPT Image 2.5 and Seedream 5.0 · Every sheet: a neutral 18% grey backdrop

**RULE** (owner, 2026-10-29: « si tu peux directement mettre les générations des images sur ce fond neutre gris 18% c mieux », « seedance à tendance à foutre la merde »). Measured on his renders: a blue backdrop (B - R +4 on the bikini sheets, +11 on the bare sheet, +20 after the step 4 pass, +23 on a rebuilt view), darker than 18% (luminance 0.07 to 0.15). Every "mid-grey" backdrop now says `neutral 18% grey` with `(about sRGB 118, 118, 118, with no blue, green or warm tint)`, the gaps `thin neutral grey gaps`, both engines, every subject; 22 of the 31 golden prompts change by these words only (15 words at most). In the view-by-view rebuild of step 4 the same words gave B - R +3 to +4 and a luminance of 0.13 to 0.19. **TO TEST**: a sheet generated from text with them. Whether Seedance itself does better on it: unknown.

## 2026-10-29 · Blender agent and Seedream 5.0 · Person, "Agent 3D : fesses": the bottom removed, the natural drop of the glutes

**RULE** (owner, 2026-10-28: his Blender prompt « enlève le bas bleu, personnage 3D » erased only the grooves left by the bottom's edges and forbade any global reshaping; then « pour éviter que les fesses restent en l'air », « si elles doivent descendre parce qu'elles sont grosses elles descendent, si elles ne bougent pas parce qu'elles sont musclées elles ne bougent pas … comme un anatomiste »). A second Agent 3D panel at the end of "Hanches", gated as the bust's, writes his prompt filled from the sheet: the bottom read from the outfit (GPT draws no tanga: swim shorts, compression shorts), the gluteal ptosis grade from the glute settings, the height. Grades: Gonzalez 2006, five degrees by the crease's length against the lines T and M and the tissue over the crease (definitions read in a secondary source, Blaya 2020: À VALIDER). Grade of each setting, a design choice: glute fat Visible 1, Marquée 2, Très marquée 4, build Forte 3, large glutes without tone 1; each step of glute muscles from Toniques takes one away; Bombés and Très bombés 0, Bas at least 2, Tombants 4. The glutes are only lowered to the grade, the smallest drop that meets it, never lifted (checked); his groove removal is kept, and so is his rule for compressing bottoms: their release is not modelled (no sourced value). An independent review of the generated text made every landmark measurable and the grades decided in one order. The context line says the goal in plain words first, and `Seul le bas est retiré : le haut garde exactement sa coupe, sa couleur et son tissu` as the bust's. Not cited: his "<0.5 cm" for a classic brief (not verified). **TO TEST** in Blender, and on Seedream 5.0 as an edit prompt on the sheet with its bottom.

## 2026-10-29 · Seedream 5.0 · Person, step 4 "Final photo pass" on a bare body sheet

**DOES NOT WORK** (owner, 2026-10-29, Seedream 5.0, a bare headless body sheet edited with the step 4 text): « la finition photo ça ne marche absolument pas … je suis sûr que tu vas être incapable de savoir quel est quel ». Measured on his two images (1920 × 1080): luma correlation 0.987, 2.2% of the pixels changed by more than 20 levels, the pubic hair the only area redrawn, the rest a white-balance shift from warm to neutral and 5% more fine detail (grain). The text asks for that: `Edit image 1 ... Change only the photographic rendering`, the same light and shadows, a contrast no stronger, a long keep list; and at this scale (four bodies about 1,000 px tall) a pore is under one pixel. **LEAD** (owner's renders, 2026-10-29, Seedream 5.0, a prompt asking for a new photograph rather than an edit and keeping only the geometry, sent to him, not in the app). One view (the back) cut from the sheet, three renders in 16:9 from a portrait crop: the third kept the silhouette (the crease at 470 px against 473, hips, thighs and knees within 1 to 5% of the leg length) and looks like a real photograph (grain, light falloff, backdrop), its fine detail unchanged at the same 1,060 px body height; the first two re-framed (cut at the upper back, at the waist) and widened the hips by 7 to 10%.

**DOES NOT WORK** on the whole sheet, the same prompt adapted, three renders: two near-identity (luma correlation 0.99, silhouettes 96 to 98% the same, fine detail +2 to 6%), one with the right profile changed (overlap 83%) and no gain.

Then the back view with `in the same portrait format` and an 18% neutral grey backdrop asked: the tool still gave 16:9; two renders rebuilt a sheet (four panels, three backs: the crop's edges kept the sheet's thin gaps and the text named the sheet), one re-framed; the backdrop unchanged (B - R +10 to +12, luminance 0.10, as image 1).

**WORKS** (three renders out of three): the same view centred in a 16:9 frame, its backdrop extended on both sides and the gap lines trimmed, and a text naming one woman and one view, no sheet: the same place (centre within 1 px, crease and heels within 5 px), silhouette overlap 0.94 to 0.96, hips +1 to +2%, knees and shoulders within 1%, thighs +3 to +13%; a neutral backdrop (B - R +3 to +4, luminance 0.13 to 0.19 against 0.105); fine detail +3 to +8%.

**TO TEST**: the front view and a profile (each "real skin" pass so far brought the bust back to an average one); then a view-by-view finish in the app.

**DOES NOT WORK**, refused by the platform (owner, 2026-10-29): the bare front view and left profile, same text, « ça passe pas la génération NSFW activée ». **RULE** (already in the lessons of v76 to v95): the prompt or the image is never reworked to get past the filter. Each "real skin" pass so far brought the bust back to an average one (entry of the domed areola).

## 2026-10-28 · Seedream 5.0 · Person, body sheet: fat zones at « Légère », and soft thighs never "lean"

**DOES NOT WORK / RULE.** Fat zones at « Légère » showed no difference on a slim build said `slim` seven times; the thighs no longer say `lean` once the legs are soft. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-28--seedream-50--person-body-sheet-fat-zones-at--légère--and-soft-thighs-never-lean)

## 2026-10-28 · Seedream 5.0 and Blender agent · Person, "Agent 3D": the bottom kept

**DOES NOT WORK** (owner, 2026-10-28, Seedream 5.0, the edits of the entries below): « il ne faut pas que le prompt change le tanga il faut qu'il le garde c important » (already seen in the entry of v158: a regular brief instead of the Brazilian cut). **RULE.** With any top but a one-piece, the context line now says `Seul le haut est retiré : le bas garde exactement sa coupe, sa couleur et son tissu, et tout le reste reste tel quel.`, and the Blender agent's step 1 hides the top only (`haut masqué ..., pas supprimé ; bas inchangé`), no longer the whole swimsuit. To fit, the light-top sentence no longer repeats the top's description, the name check and the P/W reference are shorter, and the nipple sentence no longer says `(réglés à la main)`. The longest prompt stays under 10,000 characters with each line break counted twice. **TO TEST** on Seedream 5.0: the same edit.

## 2026-10-28 · Seedream 5.0 · Person, the "Agent 3D" text as an edit prompt: the domed areola, a guide image, then the puffy-areola wording

**LEAD.** A clay guide image gave the areola dome but its color and look; each realism pass flattened it again. [Full entry, unchanged](PROMPT-LOG-ARCHIVE.md#2026-10-28--seedream-50--person-the-agent-3d-text-as-an-edit-prompt-the-domed-areola-a-guide-image-then-the-puffy-areola-wording)

## 2026-10-28 · Seedream 5.0 · Person, the "Agent 3D" text as an edit prompt: the domed areola, third try

**DOES NOT WORK** for the dome, a small change (owner's renders, 2026-10-28, Seedream 5.0, the sheet and settings of the entries below, edited after the 10,000-character test build, whose "Bombée" phrase says the dome view by view). Owner: « voilà le résultat je ne sais pas quoi penser ». Two renders, the same pixels as the earlier ones except the bust: on the second, the areola in the right-hand profile panel looks slightly swollen, with a shaded ring; no distinct dome and no crease at its base in any view; the nipples projecting and the areola size as asked. As the second try's entry says, the text has reached its ceiling for this detail; at this sheet's scale a relief of a few millimetres spans 2 or 3 px. **TO TEST**: a guide image, or a render where the bust fills more of the frame.

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
