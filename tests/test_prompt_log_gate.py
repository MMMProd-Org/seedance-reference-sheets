"""Checks .claude/hooks/prompt_log_gate.py: the prompt log is read before anything else, and again once it changes;
and that the real log stays short enough for one Read.

    python tests/test_prompt_log_gate.py
"""
import hashlib
import json
import os
import pathlib
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
HOOK = ROOT / ".claude" / "hooks" / "prompt_log_gate.py"
LOG = "docs/PROMPT-LOG.md"

# A Read returns at most 25,000 tokens: a longer file comes back as its first page, without an error, and the hook
# would count it as read whole. Measured on plain English text: about 2.9 bytes per token, so about 70 KB.
size = (ROOT / LOG).stat().st_size
assert size < 50_000, f"{LOG} is {size} bytes: archive its oldest entries as its 'How to add an entry' says"
# The Read tool reads 2,000 lines by default, and some versions cut lines past 2,000 characters.
lines = (ROOT / LOG).read_text(encoding="utf-8").split("\n")
assert len(lines) < 2000 and max(map(len, lines)) < 2000, (len(lines), max(map(len, lines)))

with tempfile.TemporaryDirectory() as tmp:
    project, home, temp = (pathlib.Path(tmp, d) for d in ("project", "home", "temp"))
    (project / "docs").mkdir(parents=True)
    home.mkdir()
    temp.mkdir()
    log = project / LOG
    log.write_text("# Prompt log\n\nentry one\n", encoding="utf-8")
    env = {**os.environ, "CLAUDE_PROJECT_DIR": str(project), "HOME": str(home), "TMPDIR": str(temp)}

    def hook(event, name="", session="s1", raw=None, response=None, **args):
        payload = raw if raw is not None else json.dumps({
            "session_id": session, "hook_event_name": event, "tool_name": name, "tool_input": args,
            "tool_response": response, "cwd": str(project),
        })
        r = subprocess.run([sys.executable, str(HOOK)], input=payload, capture_output=True, text=True, env=env)
        return r.returncode, r.stdout, r.stderr

    def tool(name="Bash", session="s1", **args):
        return hook("PreToolUse", name, session, **args)[0]

    def done(name, session="s1", response=None, **args):  # the tool succeeded
        return hook("PostToolUse", name, session, response=response, **args)[0]

    def returned(content, **more):  # the tool_response of a Read, as Claude Code 2.1 sends it
        return {"type": "text", "file": {"filePath": str(log), "content": content, **more}}

    # nothing read yet: every tool is blocked with the reason and the log's absolute path, even an edit of the log,
    # but the Read of the log goes through
    code, _, err = hook("PreToolUse", "Bash", command="ls")
    assert code == 2 and str(log) in err, (code, err)
    assert tool("Read", file_path="README.md") == 2 and tool("Edit", file_path=LOG) == 2
    assert tool("Read", file_path=LOG, limit=5) == 0
    # a partial Read does not count
    assert done("Read", file_path=LOG, limit=5) == 0 and tool() == 2
    # the session start loads the log and counts as a read
    code, out, _ = hook("SessionStart")
    assert code == 0 and "entry one" in json.loads(out)["hookSpecificOutput"]["additionalContext"], out
    assert tool() == 0
    # another session has read nothing
    assert tool(session="s2") == 2
    # the log changes: blocked until a whole Read succeeds, by a relative or an absolute path
    log.write_text("# Prompt log\n\nentry two\n", encoding="utf-8")
    assert tool() == 2
    assert tool("Read", file_path=str(log)) == 0 and tool() == 2  # a Read that does not complete counts for nothing
    assert done("Read", file_path=LOG, offset=1) == 0 and tool() == 2
    assert done("Read", file_path=str(log)) == 0 and tool() == 0
    # the session's own edit of the log counts as a read, an edit of another file does not
    log.write_text("# Prompt log\n\nentry three\n", encoding="utf-8")
    assert done("Edit", file_path=LOG) == 0 and tool() == 0
    log.write_text("# Prompt log\n\nentry four\n", encoding="utf-8")
    assert done("Edit", file_path="README.md") == 0 and tool() == 2
    # what the Read returned counts, not the log when the hook runs: a log changed meanwhile stays unread
    seen = log.read_text(encoding="utf-8")
    log.write_text("# Prompt log\n\nentry four, changed\n", encoding="utf-8")
    assert done("Read", file_path=LOG, response=returned(seen, numLines=3, totalLines=3)) == 0 and tool() == 2
    now = log.read_text(encoding="utf-8")
    assert done("Read", file_path=LOG, response=returned(now, numLines=3, totalLines=3)) == 0 and tool() == 0
    # even when it is the version this session already read
    log.write_text("# Prompt log\n\nentry four, changed again\n", encoding="utf-8")
    assert done("Read", file_path=LOG, response=returned(now, numLines=3, totalLines=3)) == 0 and tool() == 2
    assert done("Read", file_path=LOG, response=returned(log.read_text(encoding="utf-8"))) == 0 and tool() == 0
    # a Read cut short by the size cap, or with lines missing, is counted with a warning rather than lock the session
    for cut in ({"truncatedByTokenCap": True}, {"numLines": 1, "totalLines": 3}):
        log.write_text("# Prompt log\n\n" + json.dumps(cut) + "\n", encoding="utf-8")
        code, out, _ = hook("PostToolUse", "Read", response=returned("# Prompt log\n", **cut), file_path=LOG)
        assert code == 0 and "too long for one Read" in json.loads(out)["systemMessage"], out
        assert tool() == 0

    def read_as(content, **more):  # a whole Read returning this text; stdout must stay empty: no hook failure
        code, out, _ = hook("PostToolUse", "Read", response=returned(content, **more), file_path=LOG)
        assert code == 0 and not out, out
        code, out, _ = hook("PreToolUse", "Bash")
        assert not out, out
        return code

    # the log as the Read tool returns it (Claude Code 2.1.296): without a BOM, CRLF as LF, a bad byte as U+FFFD
    log.write_bytes("\ufeff# Prompt log\r\n\r\nentry six\r\n".encode())
    assert read_as("# Prompt log\n\nentry six\n") == 0
    log.write_bytes(b"# Prompt log\n\ncaf\xe9\n")
    assert read_as("# Prompt log\n\ncaf\ufffd\n") == 0
    # text the fingerprint does not foresee costs one more Read, never a locked session
    log.write_text("# Prompt log\n\nentry seven\n", encoding="utf-8")
    assert read_as("entry seven, returned otherwise") == 2 and read_as("entry seven, returned otherwise") == 0
    # a line count that is not a number does not break the hook
    log.write_text("# Prompt log\n\nentry eight\n", encoding="utf-8")
    assert read_as(log.read_text(encoding="utf-8"), numLines=None, totalLines=3) == 0
    # a log too long to load whole: the session start asks for a Read and counts as none
    log.write_text("# Prompt log\n\n" + "x" * 9100 + "\n", encoding="utf-8")
    code, out, _ = hook("SessionStart")
    context = json.loads(out)["hookSpecificOutput"]["additionalContext"]
    assert code == 0 and "x" * 100 not in context and str(log) in context, context[:200]
    assert tool() == 2
    assert done("Read", file_path=LOG) == 0 and tool() == 0
    # the size that counts is the output as printed: its escaping can push a log of under 9,000 bytes over
    log.write_text("# Prompt log\n\n" + "é" * 4000 + "\n", encoding="utf-8")
    assert len(log.read_bytes()) <= 9000
    code, out, _ = hook("SessionStart", session="s6")
    assert code == 0 and str(log) in json.loads(out)["hookSpecificOutput"]["additionalContext"], out[:200]
    assert tool(session="s6") == 2
    # a log that fails to load at session start is not counted as read
    log.write_bytes(b"# Prompt log\n\n\xff\n")
    code, out, _ = hook("SessionStart", session="s5")
    assert code == 0 and "failed" in json.loads(out)["systemMessage"], out
    assert tool(session="s5") == 2
    # a symlink planted where the state goes is not followed: the file it points to stays as it was
    log.write_text("# Prompt log\n\nentry five\n", encoding="utf-8")
    victim = pathlib.Path(tmp, "victim.txt")
    victim.write_text("keep me")
    state_dir = home / ".claude" / "prompt-log-gate"
    (state_dir / (hashlib.sha256(b"s9").hexdigest() + ".sha")).symlink_to(victim)
    code, out, _ = hook("SessionStart", session="s9")
    assert code == 0 and "failed" in json.loads(out)["systemMessage"], out
    assert victim.read_text() == "keep me" and tool(session="s9") == 2
    # the state stays out of the shared temp directory
    assert not any(temp.iterdir()), list(temp.iterdir())
    # a broken input lets the call through, visibly
    code, out, _ = hook("PreToolUse", raw="not json")
    assert code == 0 and "failed" in json.loads(out)["systemMessage"], out
    # the commands of .claude/settings.json run the hook, and let everything through once it is gone
    settings = json.loads((ROOT / ".claude" / "settings.json").read_text(encoding="utf-8"))
    commands = [h["command"] for event in settings["hooks"].values() for group in event for h in group["hooks"]]
    assert len(commands) == 3, commands
    copy = project / ".claude" / "hooks" / HOOK.name
    copy.parent.mkdir(parents=True)
    shutil.copy(HOOK, copy)
    unread = json.dumps({"session_id": "s4", "hook_event_name": "PreToolUse", "tool_name": "Bash", "tool_input": {}})
    run = lambda command: subprocess.run(["sh", "-c", command], input=unread, capture_output=True, text=True, env=env).returncode
    assert [run(c) for c in commands] == [2, 2, 2]
    copy.unlink()
    assert [run(c) for c in commands] == [0, 0, 0]
    # no log in the checkout: nothing to read
    log.unlink()
    assert tool(session="s3") == 0
print("prompt log gate checks passed")
