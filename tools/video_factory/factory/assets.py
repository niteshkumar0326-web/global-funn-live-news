"""Topic visuals for stories: photos, short clips and clearly labelled AI illustrations.

A story in the spec may carry ``visuals``: a list of entries, tried in order::

    {"type": "stock",     "q": "stock market trading screen", "count": 2}   # Pexels, then Pixabay (free API keys)
    {"type": "video",     "q": "city traffic night",          "count": 1}   # short stock clip
    {"type": "wikimedia", "q": "Wankhede Stadium",           "count": 2}   # Commons, CC / public domain only, credit kept
    {"type": "ai",        "prompt": "abstract rising charts"}               # Pollinations (free, no key) - labelled AI
    {"type": "file",      "file": "inbox/rahul.jpg", "credit": "BCCI", "license": "licensed"}   # your own / licensed

Policy (AGENTS.md): AI images are *illustrations*. They are labelled on screen, never allowed when the story is
marked ``"real_event": true`` (real people / real incidents need real, credited photos), and prompts are always
wrapped so that they ask for "no identifiable people, no text, no logos".

Everything fetched is cached in ``work/visuals`` together with a json sidecar (origin, credit, licence), so a
bulletin can be prepared once on a machine with open internet (your PC / the VPS) and rendered anywhere offline.
If nothing can be found, a generated abstract backdrop is used so rendering never fails.
"""
from __future__ import annotations

import hashlib
import html
import io
import json
import os
import random
import re
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass, field
from pathlib import Path

from . import config

UA = "GlobalFunnVideoFactory/1.0 (+https://globalfunn.in)"
MIN_SIDE = 500
AI_SUFFIX = (", realistic photograph, natural light, high detail, no identifiable people, no faces, "
             "no text, no logos, no watermark")
FREE_LICENSES = ("cc0", "public domain", "pdm", "cc by", "cc-by", "cc by-sa", "cc-by-sa")
LABEL_AI = "AI-जनित प्रतीकात्मक चित्र"
LABEL_STOCK = "प्रतीकात्मक चित्र"
LABEL_GENERATED = "ग्राफ़िक पृष्ठभूमि"


@dataclass
class Asset:
    path: str
    kind: str = "photo"          # photo | video
    origin: str = "local"        # pexels | pixabay | wikimedia | pollinations | local | generated
    credit: str = ""
    license: str = ""
    source_url: str = ""
    ai: bool = False

    @property
    def file(self) -> Path:
        return Path(self.path)

    def label(self) -> str:
        """Short on-screen caption (Hindi) shown over the picture."""
        if self.ai:
            return LABEL_AI
        if self.origin == "generated":
            return LABEL_GENERATED
        if self.origin in ("pexels", "pixabay"):
            who = f"{self.origin.title()}: {self.credit}" if self.credit else self.origin.title()
            return f"{LABEL_STOCK}  •  {who}"
        if self.credit:
            return f"चित्र: {self.credit}" + (f" ({self.license})" if self.license else "")
        return LABEL_STOCK

    def credit_line(self) -> str:
        if self.ai:
            return f"{LABEL_AI} ({self.origin})"
        if self.origin == "generated":
            return ""
        bits = [self.credit or self.origin, self.license]
        return " • ".join(b for b in bits if b) + (f" — {self.source_url}" if self.source_url else "")

    def to_json(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------- HTTP (monkeypatched in tests)
def http_get(url: str, headers: dict | None = None, timeout: int = 30) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:  # noqa: S310 (https URLs from known providers)
        return r.read()


def _get_json(url: str, headers: dict | None = None) -> dict:
    return json.loads(http_get(url, headers).decode("utf-8"))


def offline() -> bool:
    return os.environ.get("GF_OFFLINE", "") not in ("", "0", "false")


# ---------------------------------------------------------------- cache
def cache_dir() -> Path:
    d = config.WORK / "visuals"
    d.mkdir(parents=True, exist_ok=True)
    return d


def _key(*parts) -> str:
    return hashlib.sha1("|".join(str(p) for p in parts).encode("utf-8")).hexdigest()[:16]


def _load_set(key: str) -> list[Asset] | None:
    p = cache_dir() / f"{key}.set.json"
    if not p.exists():
        return None
    items = [Asset(**d) for d in json.loads(p.read_text(encoding="utf-8"))]
    return [a for a in items if a.file.exists()] or None


def _save_set(key: str, items: list[Asset]) -> None:
    (cache_dir() / f"{key}.set.json").write_text(
        json.dumps([a.to_json() for a in items], ensure_ascii=False, indent=1), encoding="utf-8")


def _valid_image(data: bytes) -> tuple[int, int] | None:
    from PIL import Image

    try:
        im = Image.open(io.BytesIO(data))
        im.verify()
        w, h = Image.open(io.BytesIO(data)).size
    except Exception:
        return None
    return (w, h) if min(w, h) >= MIN_SIDE else None


def _store_image(data: bytes, name: str) -> Path | None:
    if not _valid_image(data):
        return None
    from PIL import Image

    p = cache_dir() / f"{name}.jpg"
    Image.open(io.BytesIO(data)).convert("RGB").save(p, quality=93)
    return p


def _store_video(data: bytes, name: str) -> Path | None:
    if len(data) < 20_000:
        return None
    p = cache_dir() / f"{name}.mp4"
    p.write_bytes(data)
    return p


def _orient(fmt: str) -> str:
    return "portrait" if fmt == "short" else "landscape"


def _strip_html(s: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", s or ""))).strip()


# ---------------------------------------------------------------- providers
def fetch_pexels(q: str, fmt: str, count: int, video: bool = False) -> list[Asset]:
    key = os.environ.get("PEXELS_API_KEY")
    if not key:
        return []
    qs = urllib.parse.urlencode({"query": q, "per_page": max(count * 2, 4), "orientation": _orient(fmt)})
    hdr = {"Authorization": key}
    out: list[Asset] = []
    if video:
        data = _get_json(f"https://api.pexels.com/videos/search?{qs}", hdr)
        for v in data.get("videos", []):
            if not 3 <= v.get("duration", 0) <= 40:
                continue
            files = [f for f in v.get("video_files", []) if f.get("file_type") == "video/mp4" and f.get("width")]
            if not files:
                continue
            tgt = 1080 if fmt == "short" else 1920
            f = min(files, key=lambda f: abs(f["width"] - tgt) + (0 if f["width"] <= 2000 else 5000))
            p = _store_video(http_get(f["link"], timeout=120), _key("pexels-v", v["id"], fmt))
            if p:
                out.append(Asset(str(p), "video", "pexels", v.get("user", {}).get("name", ""), "Pexels License",
                                 v.get("url", "")))
            if len(out) >= count:
                break
        return out
    data = _get_json(f"https://api.pexels.com/v1/search?{qs}", hdr)
    for ph in data.get("photos", []):
        src = ph.get("src", {})
        url = src.get("large2x") or src.get("large") or src.get("original")
        if not url:
            continue
        p = _store_image(http_get(url), _key("pexels", ph["id"]))
        if p:
            out.append(Asset(str(p), "photo", "pexels", ph.get("photographer", ""), "Pexels License", ph.get("url", "")))
        if len(out) >= count:
            break
    return out


def fetch_pixabay(q: str, fmt: str, count: int, video: bool = False) -> list[Asset]:
    key = os.environ.get("PIXABAY_API_KEY")
    if not key:
        return []
    qs = urllib.parse.urlencode({"key": key, "q": q, "per_page": max(count * 2, 5), "safesearch": "true",
                                 "orientation": "vertical" if fmt == "short" else "horizontal"})
    out: list[Asset] = []
    if video:
        data = _get_json(f"https://pixabay.com/api/videos/?{qs}")
        for h in data.get("hits", []):
            v = (h.get("videos", {}).get("large") or h.get("videos", {}).get("medium") or {}).get("url")
            if not v or not 3 <= h.get("duration", 0) <= 40:
                continue
            p = _store_video(http_get(v, timeout=120), _key("pixabay-v", h["id"]))
            if p:
                out.append(Asset(str(p), "video", "pixabay", h.get("user", ""), "Pixabay Content License",
                                 h.get("pageURL", "")))
            if len(out) >= count:
                break
        return out
    data = _get_json(f"https://pixabay.com/api/?{qs}&image_type=photo")
    for h in data.get("hits", []):
        url = h.get("largeImageURL") or h.get("webformatURL")
        if not url:
            continue
        p = _store_image(http_get(url), _key("pixabay", h["id"]))
        if p:
            out.append(Asset(str(p), "photo", "pixabay", h.get("user", ""), "Pixabay Content License",
                             h.get("pageURL", "")))
        if len(out) >= count:
            break
    return out


def fetch_wikimedia(q: str, fmt: str, count: int) -> list[Asset]:
    """Wikimedia Commons: only public-domain / CC licences; author + licence are kept for the credit line."""
    qs = urllib.parse.urlencode({
        "action": "query", "format": "json", "generator": "search", "gsrsearch": f"{q} filetype:bitmap",
        "gsrnamespace": 6, "gsrlimit": max(count * 4, 8), "prop": "imageinfo",
        "iiprop": "url|extmetadata|size|mime", "iiurlwidth": 2000})
    data = _get_json(f"https://commons.wikimedia.org/w/api.php?{qs}")
    pages = sorted(data.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    out: list[Asset] = []
    for pg in pages:
        info = (pg.get("imageinfo") or [{}])[0]
        meta = info.get("extmetadata", {})
        lic = _strip_html(meta.get("LicenseShortName", {}).get("value", ""))
        if not any(lic.lower().startswith(f) or lic.lower() == f for f in FREE_LICENSES):
            continue
        if info.get("mime") not in ("image/jpeg", "image/png"):
            continue
        url = info.get("thumburl") or info.get("url")
        if not url:
            continue
        author = _strip_html(meta.get("Artist", {}).get("value", "")) or "Wikimedia Commons"
        p = _store_image(http_get(url), _key("wikimedia", pg.get("pageid")))
        if p:
            out.append(Asset(str(p), "photo", "wikimedia", author[:80], lic, info.get("descriptionurl", "")))
        if len(out) >= count:
            break
    return out


def safe_prompt(prompt: str) -> str:
    return prompt.strip().rstrip(".") + AI_SUFFIX


def fetch_pollinations(prompt: str, fmt: str, count: int, seed: int = 7) -> list[Asset]:
    W, H = (768, 1344) if fmt == "short" else (1344, 768)
    out: list[Asset] = []
    for i in range(count):
        qs = urllib.parse.urlencode({"width": W, "height": H, "seed": seed + i, "nologo": "true", "model": "flux"})
        url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(safe_prompt(prompt))}?{qs}"
        p = _store_image(http_get(url, timeout=120), _key("poll", prompt, fmt, seed + i))
        if p:
            out.append(Asset(str(p), "photo", "pollinations", "AI-generated", "illustration", "", ai=True))
    return out


def local_files(entry: dict, base: Path | None = None) -> list[Asset]:
    import glob

    base = base or config.ROOT
    pat = entry["file"]
    paths = sorted(glob.glob(str(pat if os.path.isabs(pat) else base / pat)))
    out = []
    for f in paths:
        kind = "video" if f.lower().endswith((".mp4", ".mov", ".webm", ".mkv")) else "photo"
        out.append(Asset(f, kind, "local", entry.get("credit", ""), entry.get("license", ""),
                         entry.get("source_url", ""), ai=bool(entry.get("ai"))))
    return out


# ---------------------------------------------------------------- generated fallback
def generated_backdrop(seed_text: str, fmt: str, ch: dict) -> Asset:
    """Abstract bokeh/light-streak backdrop in the channel colours. Always available, never realistic-looking."""
    import numpy as np
    from PIL import Image, ImageDraw, ImageFilter

    W, H = config.FORMATS[fmt]
    key = _key("gen", seed_text, fmt, tuple(ch.get("accent", [])))
    p = cache_dir() / f"{key}.jpg"
    if p.exists():
        return Asset(str(p), "photo", "generated")
    rnd = random.Random(int(key, 16))
    c1, c2 = (np.array(c, float) for c in ch.get("bg", [[8, 14, 40], [20, 40, 90]]))
    acc = np.array(ch.get("accent", [214, 40, 57]), float)
    t = np.linspace(0, 1, H)[:, None, None]
    img = Image.fromarray(np.repeat((c1 * (1 - t) + c2 * t).astype(np.uint8), W, axis=1), "RGB")
    lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    for _ in range(16):
        r = rnd.randint(int(min(W, H) * 0.06), int(min(W, H) * 0.28))
        x, y = rnd.randint(0, W), rnd.randint(0, H)
        col = tuple(int(v) for v in (acc * rnd.uniform(0.35, 1) + np.array([60, 90, 160]) * rnd.uniform(0, 0.6))[:3])
        d.ellipse((x - r, y - r, x + r, y + r), fill=col + (rnd.randint(28, 70),))
    for _ in range(7):
        x0 = rnd.randint(-W // 2, W)
        d.polygon([(x0, 0), (x0 + 120, 0), (x0 + 120 + H // 2, H), (x0 + H // 2, H)], fill=(255, 255, 255, rnd.randint(6, 16)))
    lay = lay.filter(ImageFilter.GaussianBlur(26))
    Image.alpha_composite(img.convert("RGBA"), lay).convert("RGB").save(p, quality=92)
    return Asset(str(p), "photo", "generated")


# ---------------------------------------------------------------- resolve
def _resolve_entry(e: dict, fmt: str, seed: int, no_net: bool) -> list[Asset]:
    t = e.get("type", "stock")
    count = int(e.get("count", 2 if t in ("stock", "wikimedia") else 1))
    if t == "file":
        return local_files(e)
    q = e.get("q") or e.get("prompt") or ""
    key = _key("set", t, q, fmt, count, seed if t == "ai" else "")
    cached = _load_set(key)
    if cached:
        return cached
    if no_net:
        return []
    got: list[Asset] = []
    try:
        if t == "stock":
            got = fetch_pexels(q, fmt, count) or fetch_pixabay(q, fmt, count)
        elif t == "video":
            got = fetch_pexels(q, fmt, count, video=True) or fetch_pixabay(q, fmt, count, video=True)
        elif t == "wikimedia":
            got = fetch_wikimedia(q, fmt, count)
        elif t == "ai":
            got = fetch_pollinations(q, fmt, count, seed)
    except Exception as exc:  # network / quota problems must never stop a bulletin
        print(f"[visuals] {t} '{q[:40]}' failed: {exc}")
    if got:
        _save_set(key, got)
    return got


def resolve_story(story: dict, fmt: str, ch: dict, seed_text: str = "", max_items: int | None = None,
                  no_net: bool | None = None) -> list[Asset]:
    """Assets for one story, in on-screen order. Never empty: falls back to a generated backdrop."""
    no_net = offline() if no_net is None else no_net
    limit = max_items or int(story.get("max_visuals", 4))
    seed = int(_key(seed_text or story.get("headline", ""))[:6], 16) % 10_000
    real = bool(story.get("real_event"))
    out: list[Asset] = []
    for e in story.get("visuals", []):
        if real and e.get("type") == "ai":
            continue  # gate reports this as a problem; never render AI for real events
        for a in _resolve_entry(e, fmt, seed, no_net):
            if a.file.exists() and all(a.path != x.path for x in out):
                out.append(a)
    out = out[:limit]
    if not out:
        out = [generated_backdrop(seed_text or story.get("headline", "x"), fmt, ch)]
    return out


def credits(assets: list[Asset]) -> list[str]:
    seen, lines = set(), []
    for a in assets:
        c = a.credit_line()
        if c and c not in seen:
            seen.add(c)
            lines.append(c)
    return lines


# ---------------------------------------------------------------- render helpers
def prepare_photo(a: Asset, W: int, H: int, out_dir: Path, scale: int = 2) -> Path:
    """Cover-crop to (scale*W, scale*H) so ffmpeg zoompan can run on a ready-made frame."""
    from PIL import Image, ImageOps

    out_dir.mkdir(parents=True, exist_ok=True)
    p = out_dir / f"{_key(a.path, W, H, scale)}.jpg"
    if not p.exists():
        im = ImageOps.exif_transpose(Image.open(a.file)).convert("RGB")
        ImageOps.fit(im, (W * scale, H * scale), method=Image.LANCZOS, centering=(0.5, 0.42)).save(p, quality=92)
    return p
