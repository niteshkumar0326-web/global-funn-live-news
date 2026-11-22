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


def build_package(spec: dict, ch: dict, fmt: str, video: Path, gate, chapters: list[tuple[float, str]],
                  srt: Path | None) -> dict:
    kind = spec.get("kind", "bulletin")
    date_short = spec.get("date_label_short") or spec.get("date", "")
    if kind == "bulletin":
        first = spec["stories"][0]["headline"] if spec.get("stories") else ""
        default_title = f"{first} | {date_short} | {ch['name']} {ch.get('sub_name', '')}"
    else:
        default_title = f"{spec['title']} | {ch['name']} {ch.get('sub_name', '')}"
    title = fit_title(spec.get("youtube_title") or default_title)

    lines: list[str] = []
    if spec.get("summary"):
        lines += [spec["summary"], ""]
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
    lines += [DISCLOSURE, "", " ".join(ch.get("hashtags", []) + (["#Shorts"] if fmt == "short" else []))]
    description = "\n".join(lines).strip()
    tags = [h.lstrip("#") for h in ch.get("hashtags", [])] + ["Hindi", ch.get("sub_name", "News")]
    privacy = gate.privacy if gate else "private"
    return {
        "channel": ch["key"],
        "format": fmt,
        "video": str(video),
        "captions": str(srt) if srt else None,
        "thumbnail": None,
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
