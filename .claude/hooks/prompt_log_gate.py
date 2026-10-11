"""Claude Code hook: docs/PROMPT-LOG.md is read before anything else, and again whenever it changes.

SessionStart  loads the log into the context and records its fingerprint; a log too long to load whole is not
              recorded, so the first tool call asks for a Read.
PreToolUse    lets a Read of the log through; blocks any other tool (exit 2) while the log differs from the
              recorded fingerprint: never read in this session, or changed since.
PostToolUse   once the session has read the log whole (no offset or limit), records the fingerprint of what the
              Read returned, so a log changed meanwhile stays unread; after the session's own edit, the log's.
              A Read cut short by Claude Code's size cap is counted, with a warning, rather than lock the session.
The fingerprint is kept per session in ~/.claude/prompt-log-gate/, written without following a symlink.
An internal error lets the call through with a warning, so a bug in this hook cannot lock the session.
Wired in .claude/settings.json, which runs it only while it exists: a checkout switched mid-session to a commit
without it is not locked either. Checked by tests/test_prompt_log_gate.py."""
import hashlib
import json
import os
import sys
from pathlib import Path

LOG = "docs/PROMPT-LOG.md"
MAX_INLINE = 9000  # bytes of SessionStart output as printed; larger is replaced by a preview, so the log must be Read
BLOCK = (  # with the absolute path, which the Read tool takes
    "{} has changed or has not been read in this session. Read the whole file with the Read tool"
    " (no offset or limit) before anything else, and follow it."
)


def main():
    data = json.load(sys.stdin)
    root = Path(os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or ".")
    log = root / LOG
    if not log.is_file():  # no log in this checkout: nothing to read
        return 0
    raw = log.read_bytes()
    now = hashlib.sha256(raw).hexdigest()
    # in the user's home, not the shared temp directory, where another account could plant a symlink;
    # ponytail: one 64-byte file per session, never cleaned
    state = Path.home() / ".claude" / "prompt-log-gate" / (hashlib.sha256(str(data.get("session_id")).encode()).hexdigest() + ".sha")
    event = data.get("hook_event_name")
    args = data.get("tool_input") or {}
    path = args.get("file_path")
    is_log = bool(path) and (root / path).resolve() == log.resolve()

    def record(digest=now):
        state.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
        fd = os.open(state, os.O_WRONLY | os.O_CREAT | os.O_TRUNC | getattr(os, "O_NOFOLLOW", 0), 0o600)
        with os.fdopen(fd, "w") as f:
            f.write(digest)

    def start(context):
        return json.dumps({"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": context}})

    if event == "SessionStart":
        out = start("Prompt log (" + LOG + "), loaded before anything else. Follow it and add to it as it says.\n\n" + raw.decode("utf-8"))
        if len(out.encode()) <= MAX_INLINE:
            record()  # after the decode: a log that fails to load is not counted as read
        else:
            state.unlink(missing_ok=True)
            out = start(BLOCK.format(log.absolute()))
        print(out)
        return 0
    if event == "PostToolUse":  # the matcher limits it to Read, Edit, Write and MultiEdit, after they succeed
        if not is_log or args.get("offset") or args.get("limit"):
            return 0
        response = data.get("tool_response")
        got = response.get("file") if isinstance(response, dict) else None  # what a Read returned
        got = got if isinstance(got, dict) else {}
        if got.get("truncatedByTokenCap") or got.get("numLines", 0) < got.get("totalLines", 0):
            record()  # ponytail: a log over the cap passes, loudly; tests/test_prompt_log_gate.py keeps it under
            print(json.dumps({"systemMessage": "{} was too long for one Read: only {} of its {} lines were read. Archive"
                " its oldest entries as its 'How to add an entry' says.".format(LOG, got.get("numLines"), got.get("totalLines"))}))
        elif isinstance(got.get("content"), str):
            record(hashlib.sha256(got["content"].encode()).hexdigest())
        else:  # an edit, or a Read reported in another shape
            record()
        return 0
    if (data.get("tool_name") == "Read" and is_log) or (state.is_file() and state.read_text() == now):
        return 0
    print(BLOCK.format(log.absolute()), file=sys.stderr)
    return 2


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as err:  # a broken hook must not lock the session: let the call through, visibly
        print(json.dumps({"systemMessage": "prompt_log_gate.py failed (" + repr(err) + "): " + LOG + " was not checked."}))
        sys.exit(0)
