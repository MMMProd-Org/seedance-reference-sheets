# Prompt log

What was changed in the prompts, and what the real renders showed: what works, what does not, what is still to test.
Read it before any change (`AGENTS.md`). In Claude Code the project hooks enforce it: the log is loaded at session start, and once it changes every tool call is blocked until it is read again (`.claude/hooks/prompt_log_gate.py`).

## How to add an entry

- One entry per change or per test, newest first. Never delete an entry: a result that turns out wrong gets a new entry that says so.
- Status: **WORKS**, **DOES NOT WORK**, **REJECTED** (dropped before a test, with why) or **TO TEST**.
- Give the model (GPT Image 2.5, Seedream 5.0), the subject and card, the settings that matter, the prompt lines before and after, and the evidence: the user's own words, the render in one line, the release.
- Only the user's test judges a render: the tests of this repository check the prompt text, never the image.
- Do not try again what is marked **DOES NOT WORK** or **REJECTED** without a new reason, written in a new entry.

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

**REJECTED**, before any test: give marked veins the soft light instead of the hard one. It would have weakened the veins the user wants.

## 2026-10-10 · Seedream 5.0 · Person, retouch card · help of "Autres retouches" (v1.1.1)

**WORKS.** Interface text only, no prompt change: the help above the box says what its text is for (your own retouch, in English or French; a preset's text, already in the prompt; nothing to write while "Combine head and body" is only the default), with a French example. User: « ok c tout bon là ».

## 2026-10-10 · GPT Image 2.5 and Seedream 5.0 · Object, clothing kept as in the photo · "On an invisible mannequin" (v1.1.0)

**WORKS.** Optional, unticked by default. Ticked: SOURCE also allows "the presentation described below", and a PRESENTATION section asks for the invisible mannequin (ghost mannequin) in views 1 and 2 and the triptych's left and middle panels; view 3 and the right panel stay laid flat. User, after the release: « ok c bien » (the render was not described).
