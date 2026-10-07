# Agent instructions

Rules for any coding agent (Claude Code, Codex, others) working in this repository.

## Source of truth

- This repository is the only source of the app. Do not import a new HTML build made elsewhere: change the build chain and rebuild.
- See `docs/BUILD.md` for what each file does.

## Build and test

```sh
python build_i18n.py && python patch_new.py      # builds new/merged.html
pip install -r requirements.txt && python -m playwright install chromium   # once
python tests/smoke.py                             # renders the page, checks English UI
python tests/golden_prompts.py                    # checks the generated prompts did not change
```

Both tests must pass before you open or update a pull request. CI runs the same commands.

## Invariants

- **Prompts are the product.** `tests/golden_prompts.py` must pass. Change a prompt only on purpose, then run `python tests/golden_prompts.py --update` and explain the prompt change in the pull request.
- **Never regenerate `new/pretty.js`.** Every patch in `patch_new.py` anchors on its exact text, and `rep()` stops the build if an anchor does not match exactly once.
- **Every visible French string needs English.** Add it to `i18n/extra.json`, or extend `SD_EN_RX` in `build_i18n.py` for a pattern. The smoke test fails on visible French text.
- **English is the default language** (`LANG` in `patch_new.py`).
- **The app stays one self-contained file.** Its only outside request is Google Fonts.

## Pull requests and reviews

- Conventional Commits, written in English. One pull request per change.
- Copilot and Sourcery review every pull request. Sourcery skips drafts: mark the pull request Ready for review.
- Triage every bot thread before editing (bug, nitpick, false positive, out of scope). Fix the bugs. For anything else, reply with evidence from a run, then resolve the thread. Do not change correct code just to silence a bot.
- Do not merge with unresolved threads or a failing check. Branch protection enforces both.

## Never

- Force-push, `--no-verify`, or skipping hooks or checks.
- Weakening or deleting a test to make it pass.
