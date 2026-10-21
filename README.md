# OpenVTON-Bench · Project Page

Project homepage for **OpenVTON-Bench: A Large-Scale High-Resolution Benchmark for Controllable Virtual Try-On Evaluation** (NeurIPS 2026, Track on Evaluations and Datasets).

- Paper: <https://openreview.net/forum?id=hkbyKxmccF> · arXiv: <https://arxiv.org/abs/2601.22725>
- Code: <https://github.com/RenxingIntelligence/OpenVTON-Bench>
- Dataset: <https://huggingface.co/datasets/RenxingIntelligence/OpenVTON>

## Structure

```
index.html            single-page site (no build step; served as-is by GitHub Pages)
static/css/style.css  styles
static/js/main.js     results tables, charts, qualitative explorer, erosion slider (numbers from the paper)
static/img/           figures, qualitative crops, logos, social preview (og.jpg)
static/fonts/         Inter / Inter Display (SIL OFL 1.1), self-hosted
static/katex/         KaTeX (MIT), self-hosted — no external CDN, so the page also loads well in mainland China
tools/build_assets.py regenerates static/img, fonts and KaTeX from the paper figures and the poster project
```

## Editing

- **Poster button** is marked "soon" in `index.html` (search for `class="btn soon"`): set the `href` and remove `soon` (and the `<small>` tag) once the poster PDF is public.
- **BibTeX** lives in the `<pre class="bib">` block of `index.html`.
- **Results** are rendered from the data objects at the top of `static/js/main.js`.

## Local preview

```sh
python3 -m http.server 8765
# open http://localhost:8765
```

## Deploying with GitHub Pages

Repository **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick the branch that holds this site and the `/ (root)` folder. The site is served at <https://rivflyyy.github.io/OpenVTON-Bench-Pages/>. `.nojekyll` disables Jekyll processing.
