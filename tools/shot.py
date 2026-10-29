# -*- coding: utf-8 -*-
"""shot.py — 用 Playwright 截取页面，检查排版。用法：python tools/shot.py [页面...]"""
import sys
import os
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, ".shots")
BASE = "http://localhost:8765/"

PAGES = sys.argv[1:] or ["index.html"]


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 960}, device_scale_factor=1)
        for name in PAGES:
            page.goto(BASE + name, wait_until="networkidle")
            page.evaluate("document.fonts.ready")
            page.wait_for_timeout(500)
            # 触发所有 reveal 元素显示，避免截图空白
            page.evaluate(
                "document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('is-in')})"
            )
            page.wait_for_timeout(250)
            path = os.path.join(OUT, name.replace(".html", "") + ".png")
            page.screenshot(path=path, full_page=True)
            h = page.evaluate("document.documentElement.scrollHeight")
            w = page.evaluate("document.documentElement.scrollWidth")
            print(f"{name}: {w}x{h} -> {path}")
        # 移动端
        mob = browser.new_page(viewport={"width": 375, "height": 812}, device_scale_factor=1)
        for name in PAGES[:1]:
            mob.goto(BASE + name, wait_until="networkidle")
            mob.evaluate("document.fonts.ready")
            mob.wait_for_timeout(400)
            mob.evaluate(
                "document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('is-in')})"
            )
            path = os.path.join(OUT, name.replace(".html", "") + "-mobile.png")
            mob.screenshot(path=path, full_page=True)
            w = mob.evaluate("document.documentElement.scrollWidth")
            print(f"{name} @375: scrollWidth={w} -> {path}")
        browser.close()


if __name__ == "__main__":
    main()
