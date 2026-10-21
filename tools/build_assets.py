"""Build the web assets for the OpenVTON-Bench project page.

Usage:
  python -I tools/build_assets.py <paper_figures_dir> <poster_dir> <site_static_dir>

<paper_figures_dir>  figures/ of the camera-ready LaTeX source
<poster_dir>         the poster project (assets/, node_modules/katex, output/)
<site_static_dir>    static/ of this repository (written)

Needs numpy, pillow and the `pdftoppm` command (poppler).
"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
FIG, POSTER, OUT = map(Path, sys.argv[1:4])
IMG = OUT / "img"
for d in (IMG / "qual", OUT / "fonts", OUT / "katex" / "fonts", OUT / "katex" / "contrib"):
    d.mkdir(parents=True, exist_ok=True)

METHODS = ["person", "garment", "ootd", "uno", "easycontrol", "flux1", "flux2",
           "nanobanana", "qwen", "huiwa", "yinghui"]


def flat(im):
    im = im.convert("RGBA")
    bg = Image.new("RGBA", im.size, "white")
    bg.alpha_composite(im)
    return bg.convert("RGB")


def webp(im, path, width=None, height=None, quality=82):
    im = flat(im)
    if width and im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    if height and im.height > height:
        im = im.resize((round(im.width * height / im.height), height), Image.LANCZOS)
    im.save(path, "WEBP", quality=quality, method=6)


def trim(cell, thr=246, pad=4):
    a = np.asarray(cell.convert("RGB")).astype(int)
    nz = np.argwhere(a.min(axis=2) < thr)
    if len(nz) == 0:
        return cell
    (y0, x0), (y1, x1) = nz.min(0), nz.max(0)
    return cell.crop((max(0, x0 - pad), max(0, y0 - pad), min(cell.width, x1 + pad), min(cell.height, y1 + pad)))


# ---- qualitative explorer: 2 rows from the main-paper figure + 10 rows from the appendix figure ----
main = Image.open(FIG / "comparision_paper.png")
examples = []
for r, (y0, y1) in enumerate([(60, 416), (432, 788)]):
    examples.append([main.crop((max(0, 163 + 377 * c - 188), y0, min(main.width, 163 + 377 * c + 188), y1)) for c in range(11)])
big = Image.open(FIG / "comparison_figure_seed1234.png")
rows = [(116, 783), (817, 1484), (1518, 2185), (2219, 2886), (2919, 3587),
        (3620, 4288), (4321, 4988), (5022, 5689), (5723, 6390), (6424, 7091)]
for y0, y1 in rows:
    examples.append([big.crop((int(max(0, 364 + 723.1 * c - 361)), y0, int(min(big.width, 364 + 723.1 * c + 361)), y1)) for c in range(11)])
for e, cells in enumerate(examples):
    for c, cell in enumerate(cells):
        webp(trim(cell), IMG / "qual" / f"ex{e:02d}_{METHODS[c]}.webp", height=440, quality=80)
print("qualitative examples:", len(examples))

# ---- paper figures ----
webp(Image.open(FIG / "OpenVTON-Bench.png"), IMG / "framework.webp", width=2200, quality=86)
webp(Image.open(FIG / "Data_Construction_Pipeline.png"), IMG / "pipeline.webp", width=2200, quality=86)
webp(Image.open(FIG / "example_samples.png"), IMG / "samples.webp", width=2000, quality=84)
with tempfile.TemporaryDirectory() as td:
    subprocess.run(["pdftoppm", "-r", "200", "-png", "-singlefile", str(FIG / "category_grid.pdf"), f"{td}/grid"], check=True)
    webp(Image.open(f"{td}/grid.png"), IMG / "clusters.webp", width=2200, quality=84)

# ---- poster-derived assets ----
PA = POSTER / "assets"
for k in range(4):
    webp(Image.open(PA / f"erosion_k{k}.jpg"), IMG / f"erosion_k{k}.webp", quality=86)
webp(Image.open(PA / "logo_renxing.png"), IMG / "logo_renxing.webp", width=900, quality=90)
shutil.copyfile(PA / "logo_hdu.svg", IMG / "logo_hdu.svg")
shutil.copyfile(PA / "neurips-logo.svg", IMG / "logo_neurips.svg")
poster_png = Image.open(POSTER / "output" / "OpenVTON-Bench-poster.png").convert("RGB")
webp(poster_png, IMG / "poster_thumb.webp", width=1600, quality=82)
og = poster_png.crop((0, 0, poster_png.width, round(poster_png.width * 630 / 1200))).resize((1200, 630), Image.LANCZOS)
og.save(IMG / "og.jpg", quality=86, optimize=True)

# ---- fonts (Inter, SIL OFL) and KaTeX (MIT) for offline / mainland-friendly hosting ----
for f in ["Inter-Regular", "Inter-Italic", "Inter-Medium", "Inter-SemiBold", "Inter-Bold", "Inter-ExtraBold",
          "InterDisplay-Bold", "InterDisplay-ExtraBold", "InterDisplay-Black"]:
    shutil.copyfile(PA / "fonts" / f"{f}.woff2", OUT / "fonts" / f"{f}.woff2")
shutil.copyfile(PA / "fonts" / "LICENSE.txt", OUT / "fonts" / "LICENSE.txt")
KX = POSTER / "node_modules" / "katex" / "dist"
for f in ["katex.min.css", "katex.min.js"]:
    shutil.copyfile(KX / f, OUT / "katex" / f)
shutil.copyfile(KX / "contrib" / "auto-render.min.js", OUT / "katex" / "contrib" / "auto-render.min.js")
for f in (KX / "fonts").glob("*.woff2"):
    shutil.copyfile(f, OUT / "katex" / "fonts" / f.name)
shutil.copyfile(POSTER / "node_modules" / "katex" / "LICENSE", OUT / "katex" / "LICENSE")
print("done")
