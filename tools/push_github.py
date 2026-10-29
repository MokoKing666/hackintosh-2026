# -*- coding: utf-8 -*-
"""
push_github.py — 通过 GitHub REST API 提交整个仓库（git push 被网络策略挡住时的替代方案）

用法：
    GITHUB_TOKEN=xxx python tools/push_github.py <owner/repo> "<commit message>"

流程：blobs → tree → commit → refs，产生一个干净的单次提交。
"""
import base64
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request

API = "https://api.github.com"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def token():
    t = os.environ.get("GITHUB_TOKEN")
    if not t:
        sys.exit("缺少 GITHUB_TOKEN 环境变量")
    return t


def call(method, path, payload=None, tok=None):
    url = API + path
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", "token " + (tok or token()))
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("User-Agent", "hackintosh-2026-publisher")
    if data:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            body = r.read().decode("utf-8")
            return r.status, (json.loads(body) if body else {})
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")
        print(f"[{e.code}] {method} {path}\n{detail[:400]}")
        raise


def tracked_files():
    out = subprocess.check_output(["git", "ls-files"], cwd=ROOT).decode("utf-8")
    return [line.strip() for line in out.splitlines() if line.strip()]


def ensure_bootstrapped(repo):
    """GitHub 的 git data API 在空仓库上返回 409，先用 Contents API 建一个初始提交。
    返回 (是否新仓库, 当前 head sha 或 None)。"""
    try:
        status, ref = call("GET", f"/repos/{repo}/git/refs/heads/main")
        return False, ref.get("object", {}).get("sha")
    except urllib.error.HTTPError as e:
        if e.code != 409:
            raise
    call("PUT", f"/repos/{repo}/contents/.nojekyll", {
        "message": "chore: bootstrap repository",
        "content": "",
    })
    print("空仓库已初始化（bootstrap commit）")
    status, ref = call("GET", f"/repos/{repo}/git/refs/heads/main")
    return True, ref.get("object", {}).get("sha")


def main():
    if len(sys.argv) < 2:
        sys.exit("用法：GITHUB_TOKEN=xxx python tools/push_github.py owner/repo \"message\"")
    repo = sys.argv[1]
    message = sys.argv[2] if len(sys.argv) > 2 else "Initial commit"
    replace = "--replace" in sys.argv
    excludes = [a.split("=", 1)[1] for a in sys.argv if a.startswith("--exclude=")]

    _, head = ensure_bootstrapped(repo)

    files = [f for f in tracked_files() if f.replace("\\", "/") not in excludes]
    print(f"待上传 {len(files)} 个文件" + (f"（跳过 {len(excludes)} 个）" if excludes else ""))

    tree = []
    for i, rel in enumerate(files, 1):
        path = os.path.join(ROOT, rel)
        with open(path, "rb") as fh:
            content = base64.b64encode(fh.read()).decode("ascii")
        status, blob = call("POST", f"/repos/{repo}/git/blobs", {
            "content": content,
            "encoding": "base64",
        })
        tree.append({"path": rel.replace("\\", "/"), "mode": "100644",
                     "type": "blob", "sha": blob["sha"]})
        if i % 8 == 0 or i == len(files):
            print(f"  blobs {i}/{len(files)}")

    payload = {"tree": tree}
    if head and not replace:
        status, head_commit = call("GET", f"/repos/{repo}/git/commits/{head}")
        payload["base_tree"] = head_commit["tree"]["sha"]
    status, t = call("POST", f"/repos/{repo}/git/trees", payload)
    print("tree:", t["sha"])

    status, commit = call("POST", f"/repos/{repo}/git/commits", {
        "message": message,
        "tree": t["sha"],
        "parents": [head] if head else [],
    })
    print("commit:", commit["sha"])

    status, ref = call("PATCH", f"/repos/{repo}/git/refs/heads/main", {
        "sha": commit["sha"],
        "force": True,
    })
    print("ref:", ref.get("ref"), ref.get("object", {}).get("sha"))
    print("完成 →", "https://github.com/" + repo)


if __name__ == "__main__":
    main()
