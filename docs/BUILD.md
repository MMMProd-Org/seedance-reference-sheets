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
| `tests/smoke.py` | Renders the built page in headless Chromium and checks it opens in English, logs no JavaScript error, shows a prompt, and that no visible string stays French in the states it visits: every tab for each model and subject, the male presentation, the multi-character option and the reset confirmation. |
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
