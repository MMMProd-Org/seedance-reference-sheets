"""Release version from the Conventional Commits since the last vX.Y.Z tag. See docs/BUILD.md.

    python version.py           # prints version=X.Y.Z and release=true|false, for $GITHUB_OUTPUT
    python version.py --check   # runs its own checks
"""
import re
import subprocess
import sys


def bump(last, messages):
    """The next version after `last` ("X.Y.Z", or None before the first release), or None if no message calls for one."""
    if last is None:
        return "1.0.0"
    major, minor, patch = map(int, last.split("."))
    heads = [m.split("\n", 1)[0] for m in messages]
    if any(re.match(r"\w+(\([^)]*\))?!:", h) for h in heads) or any(re.search(r"^BREAKING[ -]CHANGE:", m, re.M) for m in messages):
        return f"{major + 1}.0.0"
    if any(re.match(r"feat(\([^)]*\))?:", h) for h in heads):
        return f"{major}.{minor + 1}.0"
    if any(re.match(r"(fix|perf)(\([^)]*\))?:", h) for h in heads):
        return f"{major}.{minor}.{patch + 1}"
    return None


def git(*args):
    return subprocess.run(["git", *args], capture_output=True, text=True)


def check():
    assert bump(None, []) == "1.0.0"
    assert bump("1.2.3", ["docs: x", "test(smoke): y", "ci: z", "chore: w"]) is None
    assert bump("1.2.3", ["fix(i18n): x", "docs: y"]) == "1.2.4"
    assert bump("1.2.3", ["perf: x"]) == "1.2.4"
    assert bump("1.2.3", ["fix: x", "feat(objects): y"]) == "1.3.0"
    assert bump("1.2.3", ["feat!: x"]) == "2.0.0"
    assert bump("1.2.3", ["refactor(core)!: x"]) == "2.0.0"
    assert bump("1.2.3", ["fix: x\n\nBREAKING CHANGE: y"]) == "2.0.0"
    assert bump("1.2.3", ["Merge pull request #1 from a/feat-x", "featured: x", "fixes: y"]) is None
    print("version checks passed")


def main():
    # every v tag is a release tag: a malformed one (v1.2, v1.1.0-rc1) stops the run instead of being skipped
    tag = git("describe", "--tags", "--abbrev=0", "--match", "v*")
    last = tag.stdout.strip()[1:] if tag.returncode == 0 else None
    assert last is None or re.fullmatch(r"[0-9]+\.[0-9]+\.[0-9]+", last), f"last tag is not vX.Y.Z: v{last}"
    log = git("log", "--no-merges", "--format=%B%x00", *([f"v{last}..HEAD"] if last else ["HEAD"]))
    assert log.returncode == 0, log.stderr
    nxt = bump(last, [m.strip() for m in log.stdout.split("\0") if m.strip()])
    print(f"version={nxt or last or ''}")
    print(f"release={'true' if nxt else 'false'}")


if __name__ == "__main__":
    check() if sys.argv[1:] == ["--check"] else main()
