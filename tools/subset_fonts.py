#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
subset_fonts.py — 把 MiSans 全量 woff2（单文件约 4.8MB）子集化为站点实际用到的字符。

用法：
    python tools/subset_fonts.py            # 生成 assets/fonts/*.woff2 + assets/css/fonts.css
    python tools/subset_fonts.py --check    # 只检查现有子集是否缺字，不写文件

策略：
    1. 扫描 index.html + assets/**/*.{html,css,js}，取出所有出现过的字符
    2. 并上 ASCII 可打印区 + 中文标点 + 数学符号，防止动态内容缺字
    3. 按 MiSans 的真实 usWeightClass 映射到 CSS 标准字重（MiSans 的权重值是自定义的）
    4. 输出 woff2（brotli 压缩），并覆写 OS/2.usWeightClass 让浏览器正确匹配
"""

import argparse
import glob
import os
import sys

from fontTools.ttLib import TTFont
from fontTools.subset import Subsetter, Options

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = r"D:\67262\Downloads\woff2"
OUT_DIR = os.path.join(ROOT, "assets", "fonts")
CSS_PATH = os.path.join(ROOT, "assets", "css", "fonts.css")

# MiSans 原始 usWeightClass -> 站点使用的 CSS 字重
WEIGHT_MAP = {
    200: ("MiSans-ExtraLight.woff2", 200),
    250: ("MiSans-Light.woff2", 300),
    330: ("MiSans-Regular.woff2", 400),
    380: ("MiSans-Medium.woff2", 500),
    520: ("MiSans-Semibold.woff2", 600),
    630: ("MiSans-Bold.woff2", 700),
}

EXTRA = (
    "".join(chr(c) for c in range(0x20, 0x7F))
    + "　、。〃〈〉《》「」『』【】〔〕〖〗〝〞–—‘’“”…※→←↑↓↔⇒⇔"
    + "±×÷≈≠≤≥∞°′″‰％‰¥€$¢£§¶©®™†‡•‥"
    + "①②③④⑤⑥⑦⑧⑨⑩ⅠⅡⅢⅣⅤ"
    + "─│┌┐└┘├┤┬┴┼"
    + "αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ"
    + "✓✔✕✗●○◆◇■□▲△▼▽★☆"
)


def collect_chars():
    chars = set(EXTRA)
    patterns = [
        os.path.join(ROOT, "*.html"),
        os.path.join(ROOT, "assets", "**", "*.js"),
        os.path.join(ROOT, "assets", "**", "*.css"),
        os.path.join(ROOT, "assets", "**", "*.html"),
    ]
    files = []
    for p in patterns:
        files.extend(glob.glob(p, recursive=True))
    for path in sorted(set(files)):
        if os.path.basename(path) == "fonts.css":
            continue
        try:
            with open(path, "r", encoding="utf-8") as fh:
                chars.update(fh.read())
        except UnicodeDecodeError:
            continue
    # 去掉控制字符
    return {c for c in chars if c.isprintable() or c == " "}


def build(chars):
    os.makedirs(OUT_DIR, exist_ok=True)
    text = "".join(sorted(chars))
    report = []
    faces = []

    for src_weight, (fname, css_weight) in sorted(WEIGHT_MAP.items()):
        src = os.path.join(SRC_DIR, fname)
        if not os.path.exists(src):
            print(f"[skip] 缺少源文件 {fname}")
            continue
        font = TTFont(src)
        actual = font["OS/2"].usWeightClass
        if actual != src_weight:
            print(f"[warn] {fname} 的 usWeightClass 是 {actual}，与预期 {src_weight} 不符")

        opts = Options()
        opts.flavor = "woff2"
        opts.layout_features = ["*"]
        opts.name_IDs = ["*"]
        opts.name_legacy = True
        opts.notdef_outline = True
        opts.recalc_bounds = True
        opts.drop_tables = ["DSIG"]
        opts.hinting = False

        sub = Subsetter(options=opts)
        sub.populate(text=text)
        sub.subset(font)

        # 让浏览器按 CSS 标准字重匹配，避免伪粗体
        font["OS/2"].usWeightClass = css_weight
        if "fvar" in font:
            del font["fvar"]

        out = os.path.join(OUT_DIR, f"MiSans-{css_weight}.woff2")
        font.save(out)
        size = os.path.getsize(out)
        report.append((css_weight, out, size))
        faces.append(
            '@font-face{font-family:"MiSans";font-style:normal;font-weight:%d;'
            'font-display:swap;src:url("../fonts/MiSans-%d.woff2") format("woff2")}'
            % (css_weight, css_weight)
        )
        font.close()
        print(f"[ok] {fname} -> MiSans-{css_weight}.woff2  {size/1024:.1f} KB")

    header = (
        "/* fonts.css — 由 tools/subset_fonts.py 自动生成，请勿手改 */\n"
        "/* 源字体：MiSans（本地全量 woff2 子集化，字符集取自站点实际内容） */\n"
    )
    with open(CSS_PATH, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(header + "\n".join(faces) + "\n")

    total = sum(r[2] for r in report)
    print(f"\n共 {len(report)} 个字重，合计 {total/1024:.1f} KB（字符集 {len(chars)} 个字符）")


def check(chars):
    ok = True
    # 以源字体的实际覆盖为准：源字体本身没有的符号（如 ↔ ✔）不算缺字
    src = TTFont(os.path.join(SRC_DIR, "MiSans-Regular.woff2"))
    src_cmap = set(src.getBestCmap().keys())
    src.close()
    expected = {c for c in chars if ord(c) in src_cmap}

    for css_weight in sorted(w for _, w in WEIGHT_MAP.values()):
        path = os.path.join(OUT_DIR, f"MiSans-{css_weight}.woff2")
        if not os.path.exists(path):
            print(f"[missing] {path}")
            ok = False
            continue
        font = TTFont(path)
        cmap = font.getBestCmap()
        missing = sorted(c for c in expected if c not in " \t\n\r" and ord(c) not in cmap)
        if missing:
            ok = False
            preview = "".join(missing[:40])
            print(f"[缺字] MiSans-{css_weight}.woff2 缺 {len(missing)} 个字符：{preview}")
        font.close()
    print("缺字检查通过" if ok else "缺字检查未通过，请重新运行子集化")
    return ok


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="只检查缺字，不写文件")
    args = ap.parse_args()

    chars = collect_chars()
    print(f"字符集：{len(chars)} 个字符")
    if args.check:
        sys.exit(0 if check(chars) else 1)
    build(chars)


if __name__ == "__main__":
    main()
