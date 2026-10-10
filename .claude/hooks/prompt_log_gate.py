"""Claude Code hook: docs/PROMPT-LOG.md is read before anything else, and again whenever it changes.

SessionStart  loads the log into the context and records its fingerprint; a log too long to load whole is not
              recorded, so the first tool call asks for a Read.
PreToolUse    lets a whole Read of the log through and records its fingerprint; blocks any other tool (exit 2)
              while the log differs from the recorded fingerprint: never read in this session, or changed since.
PostToolUse   after an Edit or Write of the log, records the new fingerprint: the session wrote it, so it knows it.
An internal error lets the call through with a warning, so a bug in this hook cannot lock the session.
Wired in .claude/settings.json; checked by tests/test_prompt_log_gate.py."""
import hashlib
import json
import os
import re
import sys
import tempfile
from pathlib import Path

LOG = "docs/PROMPT-LOG.md"
MAX_INLINE = 9000  # larger SessionStart output is replaced by a preview, so the log must then be read with Read
BLOCK = (
    LOG + " has changed or has not been read in this session. Read the whole file with the Read tool"
    " (no offset or limit) before anything else, and follow it."
)


def fingerprint(log):
    try:
        return hashlib.sha256(log.read_bytes()).hexdigest()
    except FileNotFoundError:
        return ""


def main():
    data = json.load(sys.stdin)
    root = Path(os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or ".")
    log = root / LOG
    # ponytail: one tiny file per session, never cleaned; the system temp directory is
    state = Path(tempfile.gettempdir()) / "claude-prompt-log" / (re.sub(r"[^A-Za-z0-9_-]", "_", str(data.get("session_id") or "none")) + ".sha")
    event = data.get("hook_event_name")
    tool = data.get("tool_name") or ""
    args = data.get("tool_input") or {}

    def is_log():
        p = args.get("file_path")
        return bool(p) and (root / p).resolve() == log.resolve()

    def record():
        state.parent.mkdir(parents=True, exist_ok=True)
        state.write_text(fingerprint(log))

    now = fingerprint(log)
    if not now:  # no log in this checkout: nothing to read
        return 0
    if event == "SessionStart":
        text = log.read_text(encoding="utf-8")
        if len(text.encode("utf-8")) <= MAX_INLINE:
            record()
            context = "Prompt log (" + LOG + "), loaded before anything else. Follow it and add to it as it says.\n\n" + text
        else:
            state.unlink(missing_ok=True)
            context = BLOCK
        print(json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": context}}))
        return 0
    if event == "PostToolUse":
        if tool in ("Edit", "Write", "MultiEdit") and is_log():
            record()
        return 0
    if tool == "Read" and is_log() and not args.get("offset") and not args.get("limit"):
        record()
        return 0
    if state.is_file() and state.read_text() == now:
        return 0
    print(BLOCK, file=sys.stderr)
    return 2


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as err:  # a broken hook must not lock the session: let the call through, visibly
        print(json.dumps({"systemMessage": "prompt_log_gate.py failed (" + repr(err) + "): " + LOG + " was not checked."}))
        sys.exit(0)
