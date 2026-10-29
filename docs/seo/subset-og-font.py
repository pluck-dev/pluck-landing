"""Build the static Korean font subsets used by the OG image routes.

Source: Noto Sans KR variable font (SIL OFL 1.1). Satori (next/og) cannot read
variable fonts, so we pin two weights and keep only:
  - ASCII + common punctuation
  - the 2,350 KS X 1001 Hangul syllables (covers almost all modern Korean)
  - every character used in lib/portfolio.ts and the OG/page copy
Run from the repo root:  python docs/seo/subset-og-font.py [path/to/NotoSansKR-VF.ttf]
Requires: pip install fonttools
"""
import io
import pathlib
import sys

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "C:/Windows/Fonts/NotoSansKR-VF.ttf")
OUT = ROOT / "assets" / "fonts"

chars = set(chr(c) for c in range(0x20, 0x7F))
chars |= set("·—–…‘’“”•→←↗×®©°※「」『』《》〈〉·、。")
for hi in range(0xB0, 0xC9):
    for lo in range(0xA1, 0xFF):
        try:
            chars |= set(bytes([hi, lo]).decode("euc-kr"))
        except UnicodeDecodeError:
            pass
for rel in ["lib/portfolio.ts", "lib/site.ts", "app/opengraph-image.tsx", "app/work/[slug]/opengraph-image.tsx"]:
    path = ROOT / rel
    if path.exists():
        chars |= {ch for ch in path.read_text(encoding="utf-8") if ord(ch) >= 0x20}

text = "".join(sorted(chars))
OUT.mkdir(parents=True, exist_ok=True)
for weight, name in [(800, "ExtraBold"), (500, "Medium")]:
    font = TTFont(SRC)
    static = instancer.instantiateVariableFont(font, {"wght": weight})
    options = subset.Options()
    options.layout_features = ["kern", "liga", "ccmp", "locl"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    sub = subset.Subsetter(options)
    sub.populate(text=text)
    sub.subset(static)
    target = OUT / f"NotoSansKR-OG-{name}.ttf"
    static.save(target)
    print(target.relative_to(ROOT), target.stat().st_size // 1024, "KB", len(text), "chars")
