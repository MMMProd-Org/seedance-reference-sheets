# Building the page

The app ships as one self-contained HTML file. This repository holds the chain that produces it.

## What this is, and what it is not

There is no React source project here: no `package.json`, no `src/`, no Parcel or Tailwind config.
The starting point is a compiled single-file build (`original/`, built with Parcel, React 19.3.0, Tailwind CSS already compiled).
Every change since then is applied as anchored text patches on top of that build.

| File | Role |
| --- | --- |
| `original/Planches_de_référence_pour_Seedance.html` | The original compiled build (input). Its header and CSS lines are reused as is. |
| `new/pretty.js` | The original script, reformatted with `prettier --parser babel`. Every patch anchors on this exact text: do not regenerate it with another Prettier version. |
| `seedream_new.js` | Added layer: Seedream 5.0 prompts, retouch flow, outfit moods, age-aware Auto, messages, tooltips. Injected as is. |
| `build_i18n.py`, `ui_fr2.json`, `i18n/` | Generate `sd_i18n.js`: the French-to-English interface dictionary, applied at render time. Prompts are never translated. |
| `patch_new.py` | Applies the anchored replacements to `new/pretty.js` (each anchor must match exactly once, or the build stops), injects `seedream_new.js` and `sd_i18n.js`, and reassembles the single HTML file. |
| `tests/smoke.py` | Renders the built page in headless Chromium and checks it opens in English, logs no JavaScript error, shows a prompt, and that no visible string stays French in the states it visits: every tab for each model and subject, the male presentation, the multi-character option and the reset confirmation. It also checks that deselecting a retouch preset clears its text, that the retouch prompt stops asking to keep a body part the change mentions, in English or French, and that of two overlapping head copies, the one finishing last cannot mark the latest head sheet as out of date, nor a head copy for another model, or an animal sheet copy for another subject, cancel a pending one. It checks as well that the retouch prompt calls a neutral subject under 21 an adult; that for a headless body, "Combine head and body" is filled in by a click while it is only the default; that the beauty level and corpulence of the last copied GPT head are kept across a reload, a switch to another subject and back, and a save made before they were recorded: the prompts still build on the copied head afterwards, and a later change of beauty level (after a reload or an older save) or of corpulence (after a subject switch) makes a new face; and that a person's beauty level does not change an animal's prompts after its animal sheet copy. Since v95 it also checks that objects and places get one image per view, views 2 and up made from view 1, with nothing left of the six-view sheet; that a garment's optional view 3 is laid flat, without the invisible mannequin of views 1 and 2; that with a source photo, "Day and night" still adds the night card, whose "Attach" row asks for the photo too, but not with "Sheet layout only"; that with a source photo, with or without "Sheet layout only", views 2 and up of an object or a place may use view 1, and a place's night card (only without "Sheet layout only") the day view, attached after the photo, as their "Attach" row numbers them, instead of being told never to use an earlier image; that an animal's whole-animal sheet comes first and carries the identity, its head close-ups are made from it, no head-tracking notice is shown for it, and each subject's mobile bar copies its own cards; that once an animal sheet is copied, changing the same animal makes an updated version of that sheet, while copying only the head close-ups tracks nothing; that with a source photo, an animal's head close-ups ask for the photo only, not the animal sheet; that on Seedream a build change after the head copy makes the head sheet out of date, while a head copy saved before the signature covered the build is reported as older, not as changed; that with a source photo the hidden Beauty slider does not change the head prompt; that Seedream's notice for a source photo sends to card 3, the retouch card, by the name it shows; that a retouch join rewritten without image 2 is flagged, "Free retouch" leaves the operation, and a precision added to "Add the heads" keeps its two images; that an "Ordinaire" face does not deny very angular features or a marked jaw on a heavy build, and that a Beauty 3 face lists no empty item when both of its opening traits are dropped; and that a saved GPT session from before the model choice was recorded keeps GPT. |
| `tests/golden_prompts.py`, `tests/golden/prompts.json` | Generates the prompts of the default state of each model and subject, with fixed randomness, and compares them with the reference. Run it with `--update` only after an intended prompt change. |

## Build

Requires Python 3 (CI uses 3.12). No other package is needed to build.

```sh
python build_i18n.py && python patch_new.py
```

Output: `new/merged.html`. Open it in a browser: that is the whole app.

## Test

```sh
pip install -r requirements.txt
python -m playwright install chromium
python tests/smoke.py
python tests/golden_prompts.py
```

## Continuous integration

`.github/workflows/ci.yml` builds and tests every pull request.
On `main`, it also publishes `new/merged.html` to GitHub Pages as `index.html`
(in a fork, set Settings → Pages → Source to "GitHub Actions" first).

## Making changes

- Interface text: add the French string and its English translation to `i18n/extra.json`. Placeholder patterns (`ex. …`, `autre : ex. …`) are translated by the rules in `build_i18n.py` (`SD_EN_RX`).
- Behaviour of the original app (React components, styles): add an anchored replacement to `patch_new.py`, not JSX.
- Only Tailwind classes already present in the compiled CSS have an effect. A new class produces no style.

## Limits

If the original React source project is ever recovered and rebuilt, none of this layer will be in it: `seedream_new.js` and the replacements in `patch_new.py` would have to be ported into the source.
