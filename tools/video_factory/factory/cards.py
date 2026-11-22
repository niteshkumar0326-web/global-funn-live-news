"""Frame renderer (PIL + RAQM) for vertical 1080x1920 and landscape 1920x1080.

Everything auto-fits: headlines shrink and balance their line breaks, tile text shrinks to
its box. That is what makes bulk production safe without a human fixing each card.
"""
from __future__ import annotations

import math
import urllib.request
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

from . import config

WHITE = (255, 255, 255)
SOFT = (200, 212, 240)


def ensure_font() -> Path:
    p = config.FONT_PATH
    if not p.exists():
        p.parent.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(config.FONT_URL, p)
    return p


_font_cache: dict[tuple, ImageFont.FreeTypeFont] = {}


def font(size: int, wght: int = 700, wdth: int = 100) -> ImageFont.FreeTypeFont:
    key = (size, wght, wdth)
    if key not in _font_cache:
        f = ImageFont.truetype(str(ensure_font()), size, layout_engine=ImageFont.Layout.RAQM)
        f.set_variation_by_axes([wght, wdth])  # axis order: weight, width
        _font_cache[key] = f
    return _font_cache[key]


def _tlen(d: ImageDraw.ImageDraw, text: str, f) -> float:
    return d.textlength(text, font=f)


def wrap(d, text: str, f, maxw: float) -> list[str]:
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = f"{cur} {w}".strip()
        if _tlen(d, t, f) <= maxw or not cur:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def balanced_wrap(d, text: str, f, maxw: float) -> list[str]:
    """Greedy wrap, then narrow the width while the line count stays the same (no orphan words)."""
    base = wrap(d, text, f, maxw)
    n = len(base)
    if n <= 1:
        return base
    lo, hi = maxw * 0.45, maxw
    best = base
    for _ in range(14):
        mid = (lo + hi) / 2
        cand = wrap(d, text, f, mid)
        if len(cand) <= n and max(_tlen(d, c, f) for c in cand) <= maxw:
            best, hi = cand, mid
        else:
            lo = mid
    return best


def fit_text(d, text, maxw, maxh, start, minimum, wght=800, gap_ratio=0.22, balanced=True):
    """Largest font size (start..minimum) whose wrapped text fits maxw x maxh. Returns (font, lines)."""
    size = start
    while True:
        f = font(size, wght)
        lines = (balanced_wrap if balanced else wrap)(d, text, f, maxw)
        h = len(lines) * size + (len(lines) - 1) * size * gap_ratio
        if h <= maxh or size <= minimum:
            return f, lines
        size -= 4


def one_line(d, text, maxw, start, minimum, wght=600):
    size = start
    while size > minimum and _tlen(d, text, font(size, wght)) > maxw:
        size -= 2
    return font(size, wght)


class Cards:
    def __init__(self, ch: dict, fmt: str):
        self.ch, self.fmt = ch, fmt
        self.W, self.H = config.FORMATS[fmt]
        self.accent = tuple(ch["accent"])
        self.gold = tuple(ch["gold"])
        c1, c2 = (tuple(c) for c in ch["bg"])
        t = np.linspace(0, 1, self.H)[:, None, None]
        grad = (np.array(c1) * (1 - t) + np.array(c2) * t).astype(np.uint8)
        self.bg = Image.fromarray(np.repeat(grad, self.W, axis=1), "RGB")
        self.vertical = fmt == "short"

    # ---- shared pieces -------------------------------------------------
    def _pill(self, img, xy, text, f, fill, txt=WHITE, pad=26):
        d = ImageDraw.Draw(img)
        w = _tlen(d, text, f)
        x, y = xy
        h = f.size + 22
        d.rounded_rectangle((x, y, x + w + 2 * pad, y + h), radius=h // 2, fill=fill)
        d.text((x + pad, y + 8), text, font=f, fill=txt)
        return x + w + 2 * pad

    def _header(self, img, tag: str, date_label: str):
        d = ImageDraw.Draw(img)
        W = self.W
        m = 54 if self.vertical else 80
        d.rectangle((0, 0, W, 8), fill=self.accent)
        name = f"{self.ch['name']}"
        sub = self.ch.get("sub_name", "")
        f1 = font(60 if self.vertical else 56, 900)
        d.text((m, 56), name, font=f1, fill=WHITE)
        nw = _tlen(d, name + "  ", f1)
        d.text((m + nw, 56), sub, font=f1, fill=self.gold) if not self.vertical else None
        strap = self.ch.get("strap", "")
        d.text((m, 126 if self.vertical else 124), strap if self.vertical else self.ch.get("tagline", ""),
               font=font(32, 500), fill=SOFT)
        if tag:
            f = font(34, 700)
            pw = _tlen(d, tag, f) + 48
            self._pill(img, (W - m - pw, 66), tag, f, self.accent, pad=24)
        if date_label:
            f = font(30, 500)
            d.text((W - m - _tlen(d, date_label, f), 142), date_label, font=f, fill=SOFT)
        d.line((m, 196, W - m, 196), fill=(255, 255, 255, 60), width=2)

    def _footer(self, img, source: str, ai_label: str):
        d = ImageDraw.Draw(img)
        m = 54 if self.vertical else 80
        if self.vertical:
            ys, ya = 1290, 1352
        else:
            ys, ya = 880, 934
        if source:
            f = one_line(d, source, self.W - 2 * m, 40, 26, 600)
            d.text((m, ys), source, font=f, fill=self.gold)
        f = one_line(d, ai_label, self.W - 2 * m, 30, 20, 500)
        d.text((m, ya), ai_label, font=f, fill=SOFT)

    def _tile(self, img, box, label, value, sub, vcolor=WHITE):
        ov = Image.new("RGBA", img.size, (0, 0, 0, 0))
        od = ImageDraw.Draw(ov)
        od.rounded_rectangle(box, radius=34, fill=(255, 255, 255, 30), outline=(255, 255, 255, 70), width=2)
        img.paste(Image.alpha_composite(img.convert("RGBA"), ov).convert("RGB"))
        d = ImageDraw.Draw(img)
        x0, y0, x1, y1 = box
        inner = x1 - x0 - 36
        bh = y1 - y0
        big = bh > 250
        fl = one_line(d, label, inner, 40 if big else 30, 20, 600)
        fv = one_line(d, value, inner, 88 if big else 62, 34, 800)
        fs = one_line(d, sub, inner, 38 if big else 30, 18, 500)
        rows = ((label, fl, SOFT, 24), (value, fv, vcolor, 76), (sub, fs, self.gold, 200)) if big else \
               ((label, fl, SOFT, 14), (value, fv, vcolor, 46), (sub, fs, self.gold, 142))
        for txt, f, col, dy in rows:
            w = _tlen(d, txt, f)
            d.text((x0 + (x1 - x0 - w) / 2, y0 + dy), txt, font=f, fill=col)

    def _centered(self, d, y, lines, f, fill, gap=14, x0=0, x1=None):
        x1 = x1 or self.W
        for ln in lines:
            w = _tlen(d, ln, f)
            d.text((x0 + (x1 - x0 - w) / 2, y), ln, font=f, fill=fill)
            y += f.size + gap
        return y

    # ---- cards ----------------------------------------------------------
    def title_card(self, line_big1, line_big2, line1, line2, ai_label, tag="समाचार बुलेटिन", date_label=""):
        img = self.bg.copy()
        self._header(img, tag, date_label)
        d = ImageDraw.Draw(img)
        W, H = self.W, self.H
        if self.vertical:
            f1 = fit_text(d, line_big1, W - 120, 140, 118, 64, 900, 0, False)[0]
            y = self._centered(d, 430, [line_big1], f1, WHITE, gap=0)
            f2 = fit_text(d, line_big2, W - 120, 120, 96, 48, 900, 0, False)[0]
            y = self._centered(d, y + 12, [line_big2], f2, self.gold, gap=0)
            d.rounded_rectangle((300, y + 50, W - 300, y + 58), radius=4, fill=self.accent)
            fl, lines = fit_text(d, line1, W - 160, 220, 80, 44, 800)
            y = self._centered(d, y + 130, lines, fl, WHITE, gap=18)
            fl2, lines2 = fit_text(d, line2, W - 160, 130, 52, 30, 500)
            self._centered(d, y + 30, lines2, fl2, SOFT, gap=12)
            d.text((54, 1352), ai_label, font=one_line(d, ai_label, W - 108, 30, 20, 500), fill=SOFT)
        else:
            f1 = fit_text(d, line_big1, W - 200, 170, 150, 70, 900, 0, False)[0]
            y = self._centered(d, 290, [line_big1], f1, WHITE, gap=0)
            f2 = fit_text(d, line_big2, W - 200, 130, 110, 56, 900, 0, False)[0]
            y = self._centered(d, y + 6, [line_big2], f2, self.gold, gap=0)
            d.rounded_rectangle((W // 2 - 220, y + 36, W // 2 + 220, y + 44), radius=4, fill=self.accent)
            fl, lines = fit_text(d, line1, W - 300, 200, 72, 40, 800)
            y = self._centered(d, y + 90, lines, fl, WHITE, gap=16)
            fl2, lines2 = fit_text(d, line2, W - 300, 110, 46, 28, 500)
            self._centered(d, y + 20, lines2, fl2, SOFT, gap=10)
            d.text((80, 934), ai_label, font=one_line(d, ai_label, W - 160, 30, 20, 500), fill=SOFT)
        return img

    def story_card(self, tag, chip, headline, sub, tiles, source, note, ai_label, date_label=""):
        img = self.bg.copy()
        self._header(img, tag, date_label)
        d = ImageDraw.Draw(img)
        W = self.W
        tiles = tiles[:3]
        if self.vertical:
            self._pill(img, (54, 260), chip, font(44, 700), (36, 70, 160))
            f, lines = fit_text(d, headline, 960, 520, 92, 52, 800)
            y = self._centered(d, 390, lines, f, WHITE, gap=int(f.size * 0.24), x0=40, x1=W - 40) + 10
            if sub:
                fs, sl = fit_text(d, sub, 940, 130, 50, 30, 500)
                y = self._centered(d, y, sl, fs, SOFT, gap=12, x0=40, x1=W - 40)
            y = max(y + 40, 800)
            n = len(tiles)
            if n == 2:
                for i, t in enumerate(tiles):
                    x0 = 54 + i * 502
                    self._tile(img, (x0, y, x0 + 470, y + 290), *t)
                y += 330
            elif n == 3:
                for i, t in enumerate(tiles):
                    x0 = 54 + i * 333
                    self._tile(img, (x0, y, x0 + 300, y + 290), *t)
                y += 330
            elif n == 1:
                self._tile(img, (54, y, W - 54, y + 290), *tiles[0])
                y += 330
            if note:
                d = ImageDraw.Draw(img)
                fn, nl = fit_text(d, note, 940, 110, 40, 26, 500)
                self._centered(d, y + 10, nl, fn, SOFT, gap=10, x0=40, x1=W - 40)
        else:
            m = 80
            self._pill(img, (m, 224), chip, font(40, 700), (36, 70, 160))
            colw = 1020 if tiles else W - 2 * m
            f, lines = fit_text(d, headline, colw, 360, 84, 48, 800)
            y = 310
            for ln in lines:
                d.text((m, y), ln, font=f, fill=WHITE)
                y += int(f.size * 1.24)
            if sub:
                fs, sl = fit_text(d, sub, colw, 100, 46, 28, 500)
                y += 14
                for ln in sl:
                    d.text((m, y), ln, font=fs, fill=SOFT)
                    y += int(fs.size * 1.25)
            if note:
                fn, nl = fit_text(d, note, colw, 80, 38, 24, 500)
                y += 10
                for ln in nl:
                    d.text((m, y), ln, font=fn, fill=self.gold)
                    y += int(fn.size * 1.25)
            for i, t in enumerate(tiles):
                self._tile(img, (1180, 224 + i * 212, W - m, 224 + i * 212 + 196), *t)
        self._footer(img, source, ai_label)
        return img

    def caption_png(self, text: str, maxlines: int = 2) -> Image.Image:
        """Transparent caption bar for burning sentence captions."""
        W = self.W
        probe = ImageDraw.Draw(Image.new("RGB", (10, 10)))
        maxw = W - 240 if not self.vertical else W - 140
        f, lines = fit_text(probe, text, maxw, 130 if not self.vertical else 220, 54, 30, 700, 0.18)
        lines = lines[: max(maxlines, len(lines))]
        lh = int(f.size * 1.2)
        bh = lh * len(lines) + 36
        img = Image.new("RGBA", (W, bh), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.rounded_rectangle((60, 0, W - 60, bh), radius=26, fill=(0, 0, 0, 165))
        y = 18
        for ln in lines:
            w = _tlen(d, ln, f)
            d.text(((W - w) / 2, y), ln, font=f, fill=WHITE)
            y += lh
        return img

    def ticker_strip(self, text: str) -> tuple[Image.Image, int]:
        """Strip of width P+W that scrolls seamlessly with overlay x=-mod(speed*t, P)."""
        tf = font(46, 700)
        probe = ImageDraw.Draw(Image.new("RGB", (10, 10)))
        text = text.strip() + "   •   "
        P = int(_tlen(probe, text, tf))
        h = 110 if self.vertical else 80
        strip = Image.new("RGB", (P + self.W, h), (255, 255, 255))
        sd = ImageDraw.Draw(strip)
        x = 0
        ty = 22 if self.vertical else 12
        while x < P + self.W:
            sd.text((x, ty), text, font=tf, fill=(10, 20, 60))
            x += P
        return strip, P

    def podcast_frame(self, title, hosts, active, caption, date_label="", ai_label=""):
        """Landscape podcast scene: two host avatars (active one ringed) + title + caption."""
        img = self.bg.copy()
        self._header(img, "AI PODCAST", date_label)
        d = ImageDraw.Draw(img)
        W = self.W
        ft, tl = fit_text(d, title, W - 200, 200, 70, 40, 800)
        y = 226
        for ln in tl:
            d.text((100, y), ln, font=ft, fill=WHITE)
            y += int(ft.size * 1.22)
        cy, r = 560, 130
        xs = [W // 2 - 420, W // 2 + 420]
        for i, h in enumerate(hosts[:2]):
            cx = xs[i]
            on = h["id"] == active
            if on:
                for k in (22, 14, 6):
                    d.ellipse((cx - r - k, cy - r - k, cx + r + k, cy + r + k),
                              outline=self.gold, width=4 if k != 6 else 6)
            col = self.accent if i == 0 else (36, 70, 160)
            d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=col if on else tuple(int(c * 0.55) for c in col))
            ini = h.get("initial") or h["name"][0]
            fi = font(150, 900)
            iw = _tlen(d, ini, fi)
            d.text((cx - iw / 2, cy - 105), ini, font=fi, fill=WHITE)
            fn = font(44, 800)
            nw = _tlen(d, h["name"], fn)
            d.text((cx - nw / 2, cy + r + 24), h["name"], font=fn, fill=WHITE if on else SOFT)
            fr = font(28, 500)
            role = "AI आवाज़"
            d.text((cx - _tlen(d, role, fr) / 2, cy + r + 80), role, font=fr, fill=self.gold if on else SOFT)
        if ai_label:
            d.text((80, 1022), ai_label, font=one_line(d, ai_label, W - 160, 26, 18, 500), fill=SOFT)
        base = img.convert("RGBA")
        if caption:
            cap = self.caption_png(caption)
            base.alpha_composite(cap, (0, 800))
        return base.convert("RGB")
