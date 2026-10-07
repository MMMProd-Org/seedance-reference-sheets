# Agent instructions

Rules for any coding agent (Claude Code, Codex, others) working in this repository.
How to build, test and make changes is in `docs/BUILD.md`: read it first.

## Source of truth

This repository is the only source of the app. Do not import a new HTML build made elsewhere: change the build chain and rebuild.

## Before opening or updating a pull request

Build, then run `tests/smoke.py` and `tests/golden_prompts.py`. Both must pass. CI runs the same commands.

## Invariants

- **Prompts are the product.** `tests/golden_prompts.py` checks the prompts of the default state of each model and subject. Change a prompt only on purpose, then run it with `--update` and explain the prompt change in the pull request.
- **Never regenerate `new/pretty.js`.** The patches in `patch_new.py` anchor on its exact text.
- **Every visible French string needs English** (`i18n/extra.json`, or a rule in `SD_EN_RX`). The smoke test checks visible text outside prompt boxes; text you put in a prompt box must be translated where it is produced (see `sdMsg` in `seedream_new.js`).
- **English is the default language** (`LANG` in `patch_new.py`).
- **The app stays one self-contained file.** Its only outside request is Google Fonts.

## Pull requests and reviews

- Conventional Commits, written in English. One pull request per change.
- Copilot (automatic, through a repository ruleset) and Sourcery review every pull request. Both skip drafts: mark the pull request Ready for review.
- Triage every bot thread before editing (bug, nitpick, false positive, out of scope). Fix the bugs. For anything else, reply with evidence from a run, then resolve the thread. Do not change correct code just to silence a bot.
- Do not merge with unresolved threads or a failing check. Branch protection enforces both.

## Never

- Force-push, `--no-verify`, or skipping hooks or checks.
- Weakening or deleting a test to make it pass.
