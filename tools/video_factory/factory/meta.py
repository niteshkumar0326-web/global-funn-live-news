"""Titles, descriptions, tags and the upload.json that the uploader consumes."""
from __future__ import annotations

import re
from pathlib import Path

DISCLOSURE = ("यह वीडियो AI-जनित आवाज़ और ग्राफ़िक्स से बना है (AI-generated voice and visuals). "
              "तथ्य प्रकाशित समाचार स्रोतों से लिए गए हैं।")


def fit_title(title: str, limit: int = 95) -> str:
    title = re.sub(r"\s+", " ", title).strip()
    if len(title) <= limit:
        return title
    cut = title[:limit].rsplit(" ", 1)[0]
    return cut.rstrip("|•-– ")


def mmss(t: float) -> str:
    t = int(round(t))
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


def _hashtag(word: str) -> str:
    w = re.sub(r"[^\w\u0900-\u097F]+", "", word, flags=re.UNICODE)  # keep Devanagari vowel signs
    return f"#{w}" if w else ""


def seo_keywords(spec: dict, ch: dict, date_short: str) -> list[str]:
    """Search terms: explicit spec['seo']['keywords'] first, then story topics, then generic Hindi-news phrases."""
    kws = list((spec.get("seo") or {}).get("keywords", []))
    for s in spec.get("stories", []):
        for part in re.split(r"[•|]", s.get("chip", "")):
            if part.strip():
                kws.append(part.strip())
        kws.append(s["headline"])
    sub = ch.get("sub_name", "News").title()
    kws += [f"{date_short} की खबर", f"आज की ताज़ा खबर {date_short}", "आज की ताज़ा खबर", "हिंदी समाचार", "Hindi news today",
            "breaking news hindi", f"{ch['name']} {sub}", "India news today", "ताज़ा खबरें"]
    seen, out = set(), []
    for k in kws:
        k = re.sub(r"\s+", " ", k).strip()
        if k and k.lower() not in seen:
            seen.add(k.lower())
            out.append(k)
    return out


def fit_tags(keywords: list[str], base: list[str], budget: int = 450) -> list[str]:
    """YouTube allows ~500 characters of tags in total; keep whole tags only."""
    out, used = [], 0
    for t in base + keywords:
        t = t.strip()
        cost = len(t) + (2 if " " in t else 0) + 1
        if not t or t in out or used + cost > budget:
            continue
        out.append(t)
        used += cost
    return out


def build_package(spec: dict, ch: dict, fmt: str, video: Path, gate, chapters: list[tuple[float, str]],
                  srt: Path | None, credits: list[str] | None = None, thumbnail: Path | None = None) -> dict:
    kind = spec.get("kind", "bulletin")
    date_short = spec.get("date_label_short") or spec.get("date", "")
    if kind == "bulletin":
        first = spec["stories"][0]["headline"] if spec.get("stories") else ""
        default_title = f"{first} | {date_short} आज की ताज़ा खबर | {ch['name']} {ch.get('sub_name', '')}"
    else:
        default_title = f"{spec['title']} | {ch['name']} {ch.get('sub_name', '')}"
    title = fit_title(spec.get("youtube_title") or default_title)

    kws = seo_keywords(spec, ch, date_short) if kind == "bulletin" else list((spec.get("seo") or {}).get("keywords", []))
    lines: list[str] = []
    if spec.get("summary"):
        lines += [spec["summary"], ""]
    elif kind == "bulletin" and spec.get("stories"):
        # The first ~150 characters are what search results show: put the date and every headline there.
        heads = "; ".join(s["headline"] for s in spec["stories"])
        lines += [f"{spec.get('date_label', date_short)} की ताज़ा खबरें: {heads}. {ch['name']} {ch.get('sub_name', '')} पर हिंदी समाचार.", ""]
    if kind == "bulletin":
        lines.append("आज की खबरें:")
        for i, s in enumerate(spec["stories"], 1):
            srcs = ", ".join(s.get("sources", []))
            lines.append(f"{i}. {s['headline']}" + (f"  (स्रोत: {srcs})" if srcs else ""))
        lines.append("")
    if fmt == "wide" and len(chapters) >= 3:
        lines.append("समय-सारणी:")
        for t, name in chapters:
            lines.append(f"{mmss(t)} {name}")
        lines.append("")
    if credits:
        lines += ["चित्र / क्लिप क्रेडिट:"] + [f"• {c}" for c in credits] + [""]
    if ch.get("handle"):
        lines += [f"चैनल: {ch['handle']} — रोज़ की ताज़ा खबरों के लिए सब्सक्राइब करें और 🔔 दबाएँ।", ""]
    if kws:
        lines += ["खोजें: " + ", ".join(kws[:12]), ""]
    topic_tags = [t for t in (_hashtag(re.split(r"[•|]", s.get("chip", ""))[0]) for s in spec.get("stories", [])) if t]
    hashtags = list(dict.fromkeys(ch.get("hashtags", []) + topic_tags))[:8] + (["#Shorts"] if fmt == "short" else [])
    lines += [DISCLOSURE, "", " ".join(hashtags)]
    description = "\n".join(lines).strip()
    tags = fit_tags(kws, [h.lstrip("#") for h in ch.get("hashtags", [])] + ["Hindi", ch.get("sub_name", "News")])
    privacy = gate.privacy if gate else "private"
    return {
        "channel": ch["key"],
        "format": fmt,
        "video": str(video),
        "captions": str(srt) if srt else None,
        "thumbnail": str(thumbnail) if thumbnail else None,
        "pinned_comment": (f"आज की खबरों पर आपकी राय? कमेंट में बताइए। रोज़ की ताज़ा खबरों के लिए {ch['name']} {ch.get('sub_name', '')} को सब्सक्राइब करें।"),
        "title": title,
        "description": description[:4900],
        "tags": tags,
        "category_id": str(ch.get("category_id", "25")),
        "language": ch.get("language", "hi"),
        "contains_synthetic_media": True,
        "made_for_kids": False,
        "privacy": privacy,
        "publish_at": None,
        "gate": {"may_publish": bool(gate and gate.may_publish), "problems": gate.problems if gate else [],
                 "warnings": gate.warnings if gate else []},
    }
