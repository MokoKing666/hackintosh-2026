# -*- coding: utf-8 -*-
"""shot_el.py — 按选择器截取元素，用于细看排版。用法：python tools/shot_el.py page.html "sel1" "sel2" """
import sys
import os
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, ".shots")
BASE = "http://localhost:8765/"

page_name = sys.argv[1]
selectors = sys.argv[2:]


def main():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=2)
        page.goto(BASE + page_name, wait_until="networkidle")
        page.evaluate("document.fonts.ready")
        page.evaluate(
            "document.querySelectorAll('.reveal').forEach(function(e){e.classList.add('is-in')})"
        )
        page.wait_for_timeout(400)
        for i, sel in enumerate(selectors):
            el = page.query_selector(sel)
            if not el:
                print(f"[miss] {sel}")
                continue
            path = os.path.join(OUT, f"{page_name.replace('.html','')}-el{i}.png")
            el.screenshot(path=path)
            box = el.bounding_box()
            print(f"{sel}: {int(box['width'])}x{int(box['height'])} -> {path}")
        browser.close()


if __name__ == "__main__":
    main()
