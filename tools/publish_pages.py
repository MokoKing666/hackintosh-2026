# -*- coding: utf-8 -*-
"""
publish_pages.py — 把 dist/ 发布到 gh-pages 分支（GitHub Pages 分支部署模式）

用法：
    GITHUB_TOKEN=xxx python tools/publish_pages.py <owner/repo> [branch]

为什么需要它：当前 token 只有 repo 权限，无法写入 .github/workflows/*，
因此先用分支部署保证站点可访问；等 token 补上 workflow 权限后，
再推送 Actions 工作流并把 Pages Source 切到 "GitHub Actions"。
"""
import base64
import json
import os
import sys
import urllib.error
import urllib.request

API = "https://api.github.com"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")


def token() -> str:
    t = os.environ.get("GITHUB_TOKEN")
    if not t:
        sys.exit("缺少 GITHUB_TOKEN 环境变量")
    return t


def call(method: str, path: str, payload=None):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(API + path, data=data, method=method)
    req.add_header("Authorization", "token " + token())
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("User-Agent", "hackintosh-2026-publisher")
    if data:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=90) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, (json.loads(body) if body else {})
    except urllib.error.HTTPError as e:
        print(f"[{e.code}] {method} {path}\n{e.read().decode('utf-8', 'replace')[:300]}")
        raise


def walk(base: str):
    for entry in sorted(os.listdir(base)):
        full = os.path.join(base, entry)
        if os.path.isdir(full):
            yield from walk(full)
        else:
            yield full


def main():
    if len(sys.argv) < 2:
        sys.exit("用法：GITHUB_TOKEN=xxx python tools/publish_pages.py owner/repo [branch]")
    repo = sys.argv[1]
    branch = sys.argv[2] if len(sys.argv) > 2 else "gh-pages"

    files = list(walk(DIST))
    print(f"dist 产物 {len(files)} 个，发布到 {branch}")

    tree = []
    for i, path in enumerate(files, 1):
        rel = os.path.relpath(path, DIST).replace("\\", "/")
        with open(path, "rb") as fh:
            content = base64.b64encode(fh.read()).decode("ascii")
        _, blob = call(
            "POST", f"/repos/{repo}/git/blobs", {"content": content, "encoding": "base64"}
        )
        tree.append({"path": rel, "mode": "100644", "type": "blob", "sha": blob["sha"]})
        if i % 10 == 0 or i == len(files):
            print(f"  blobs {i}/{len(files)}")

    _, t = call("POST", f"/repos/{repo}/git/trees", {"tree": tree})
    print("tree:", t["sha"])

    # 若分支已存在，取当前 head 作为父提交，保留历史
    parent = None
    try:
        _, ref = call("GET", f"/repos/{repo}/git/ref/heads/{branch}")
        parent = ref["object"]["sha"]
    except urllib.error.HTTPError:
        pass

    _, commit = call(
        "POST",
        f"/repos/{repo}/git/commits",
        {
            "message": "deploy: 发布构建产物",
            "tree": t["sha"],
            "parents": [parent] if parent else [],
        },
    )
    print("commit:", commit["sha"])

    if parent:
        call("PATCH", f"/repos/{repo}/git/refs/heads/{branch}", {"sha": commit["sha"], "force": True})
    else:
        call("POST", f"/repos/{repo}/git/refs", {"ref": f"refs/heads/{branch}", "sha": commit["sha"]})
    print("已更新分支", branch)


if __name__ == "__main__":
    main()
