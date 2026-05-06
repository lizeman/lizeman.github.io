#!/usr/bin/env python3
"""Generate optimized 600×600 WebP and JPG variants from the source profile photo.

The original `zemanli_picture.jpg` is 1181×1181 (~230 KB) and is kept as
the high-res source for og:image / apple-touch-icon. The homepage
displays at 120px (240px @ 2x DPI), so a 600×600 variant is sharp at
5x DPI and ~80% smaller.

Run: python scripts/build_image_variants.py
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "img" / "zemanli_picture.jpg"
OUT_WEBP = ROOT / "assets" / "img" / "zemanli_picture_600.webp"
OUT_JPG = ROOT / "assets" / "img" / "zemanli_picture_600.jpg"

TARGET_SIZE = (600, 600)


def main() -> int:
    if not SRC.exists():
        print(f"missing source: {SRC}")
        return 1

    im = Image.open(SRC).convert("RGB")
    print(f"source: {im.size}, {im.mode}")

    # Pillow's thumbnail mutates in place, preserves aspect ratio
    im.thumbnail(TARGET_SIZE, Image.LANCZOS)

    im.save(OUT_WEBP, "WEBP", quality=85, method=6)
    print(f"wrote {OUT_WEBP.relative_to(ROOT)}: {OUT_WEBP.stat().st_size:,} bytes")

    im.save(OUT_JPG, "JPEG", quality=85, optimize=True, progressive=True)
    print(f"wrote {OUT_JPG.relative_to(ROOT)}: {OUT_JPG.stat().st_size:,} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
