"""Bulletin renderer: spec.json -> mp4 (vertical Short and/or landscape) + srt + upload.json."""
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

from . import config, editorial, media, meta, tts
from .cards import Cards
from .hindi import srt_time

TICKER_SPEED = {"short": 110, "wide": 140}
TICKER_Y = {"short": 1450, "wide": 1000}
DEFAULT_OUTRO = "ताज़ा खबरों के लिए चैनल को सब्सक्राइब करें। धन्यवाद।"


@dataclass
class Scene:
    name: str
    narration: str
    card_args: dict
    kind: str  # intro | story | outro


def slugify(s: str) -> str:
    """ASCII-safe folder/file name. Hindi text is kept unique through a short hash."""
    import hashlib

    ascii_part = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()[:36]
    if s.isascii():
        return ascii_part or "item"
    return (ascii_part + "-" if ascii_part else "") + hashlib.sha1(s.encode("utf-8")).hexdigest()[:8]


def build_scenes(spec: dict, ch: dict) -> list[Scene]:
    ai = ch.get("ai_label", "")
    date_label = spec.get("date_label", "")
    n = len(spec["stories"])
    intro = spec.get("intro", {})
    scenes = [Scene("intro", intro.get("narration") or f"नमस्कार, {ch['name']} {ch.get('sub_name','')} में स्वागत है।",
                    dict(big1=ch["name"], big2=ch.get("sub_name", ""),
                         line1=intro.get("headline", f"आज की {n} बड़ी खबरें"),
                         line2=intro.get("sub", ch.get("tagline", "")), ai=ai, date=date_label), "intro")]
    for i, s in enumerate(spec["stories"], 1):
        scenes.append(Scene(f"s{i}", s["narration"], dict(
            tag=f"खबर {i}", chip=s.get("chip", ""), headline=s["headline"], sub=s.get("sub", ""),
            tiles=[tuple(t) for t in s.get("tiles", [])],
            source=("स्रोत: " + "  •  ".join(s.get("sources", []))) if s.get("sources") else "",
            note=s.get("note"), ai=ai, date=date_label), "story"))
    outro = spec.get("outro", {})
    srcs = sorted({x for s in spec["stories"] for x in s.get("sources", [])})
    scenes.append(Scene("outro", outro.get("narration") or DEFAULT_OUTRO,
                        dict(big1="सब्सक्राइब करें", big2=ch["name"], line1=outro.get("headline", "ताज़ा खबरों के लिए"),
                             line2=outro.get("sub", f"{ch.get('sub_name','')}  •  {ch.get('tagline','')}"),
                             ai=ai + ("  •  स्रोत: " + ", ".join(srcs) if srcs else ""), date=date_label), "outro"))
    return scenes


def card_for(cards: Cards, sc: Scene):
    a = sc.card_args
    if sc.kind in ("intro", "outro"):
        return cards.title_card(a["big1"], a["big2"], a["line1"], a["line2"], a["ai"], date_label=a["date"])
    return cards.story_card(a["tag"], a["chip"], a["headline"], a["sub"], a["tiles"], a["source"],
                            a["note"], a["ai"], date_label=a["date"])


def ticker_text(spec: dict, ch: dict) -> str:
    items = spec.get("ticker") or [s["headline"] for s in spec["stories"]]
    return f"{ch['name']} {ch.get('sub_name','')}   •   " + "   •   ".join(items)


def render_bulletin(spec: dict, fmt: str, out_root: Path | None = None, chapters_out: list | None = None,
                    channels_path: str | None = None, voice: str | None = None) -> dict:
    """Render one format. Returns {'video','srt','package','duration','scenes'}."""
    ch = config.channel(spec["channel"], channels_path)
    gate = editorial.check(spec, ch)
    if not gate.ok:
        raise ValueError("editorial gate failed: " + "; ".join(gate.problems))
    slug = slugify(spec.get("slug") or f"{spec.get('date','')}-{spec['channel']}-{spec.get('edition','')}")
    out_dir = (out_root or config.OUT) / spec["channel"] / slug
    work = config.WORK / spec["channel"] / slug / fmt
    work.mkdir(parents=True, exist_ok=True)
    out_dir.mkdir(parents=True, exist_ok=True)

    W, H = config.FORMATS[fmt]
    cards = Cards(ch, fmt)
    scenes = build_scenes(spec, ch)
    voice = voice or spec.get("voice") or ch["voice"]
    speed = float(spec.get("speed", ch.get("speed", 1.12)))

    strip, P = cards.ticker_strip(ticker_text(spec, ch))
    strip.save(work / "ticker.png")

    clips, t0, srt_lines, chapters, timeline = [], 0.0, [], [], []
    for i, sc in enumerate(scenes):
        seg = tts.synth_segment(sc.narration, voice, speed)
        wav = work / f"{sc.name}.wav"
        tts.write_wav(wav, seg.samples, seg.sr)
        png = work / f"{sc.name}.png"
        card_for(cards, sc).save(png)
        D = round(seg.duration + 0.15, 3)
        first, last = i == 0, i == len(scenes) - 1
        vfade = ",".join(x for x in ("fade=t=in:st=0:d=0.3" if first else "",
                                      f"fade=t=out:st={D-0.6:.2f}:d=0.6" if last else "") if x)
        afade = ",".join(x for x in ("afade=t=in:st=0:d=0.2" if first else "",
                                      f"afade=t=out:st={D-0.6:.2f}:d=0.6" if last else "") if x)
        vf = (f"[0:v]scale={W*2}:{H*2}:flags=lanczos,zoompan=z='1+0.003*on/30':x='iw/2-(iw/zoom/2)':"
              f"y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps=30[bg];"
              f"[bg][1:v]overlay=x='-mod({TICKER_SPEED[fmt]}*(t+{t0:.3f}),{P})':y={TICKER_Y[fmt]},"
              f"format=yuv420p{','+vfade if vfade else ''}[v];"
              f"[2:a]{media.AUDIO_FILTER}{','+afade if afade else ''}[a]")
        clip = work / f"{sc.name}.mp4"
        media.ffmpeg("-loop", "1", "-framerate", "30", "-t", str(D), "-i", str(png),
                     "-loop", "1", "-framerate", "30", "-t", str(D), "-i", str(work / "ticker.png"),
                     "-i", str(wav), "-filter_complex", vf, "-map", "[v]", "-map", "[a]",
                     *media.VIDEO_ARGS, *media.AUDIO_ARGS, "-shortest", str(clip))
        clips.append(clip)
        title = {"intro": "शुरुआत", "outro": "समापन"}.get(sc.kind) or sc.card_args["headline"][:60]
        chapters.append((t0, title))
        for text, a, b in seg.sentences:
            srt_lines.append((t0 + a, t0 + b, text))
        timeline.append({"scene": sc.name, "start": round(t0, 2), "duration": D})
        t0 += D

    lst = work / "list.txt"
    lst.write_text("".join(f"file '{c.name}'\n" for c in clips), encoding="utf-8")
    video = out_dir / f"{slug}_{fmt}.mp4"
    media.ffmpeg("-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", "-movflags", "+faststart", str(video))

    srt = out_dir / f"{slug}_{fmt}.hi.srt"
    srt.write_text("".join(f"{i}\n{srt_time(a)} --> {srt_time(b)}\n{t}\n\n"
                           for i, (a, b, t) in enumerate(srt_lines, 1)), encoding="utf-8")
    pkg = meta.build_package(spec, ch, fmt, video, gate, chapters, srt)
    pkg_path = out_dir / f"{slug}_{fmt}.upload.json"
    pkg_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2), encoding="utf-8")
    dur = media.duration(video)
    limit = 180 if fmt == "short" else 3600 * 3
    warn = [f"duration {dur:.0f}s exceeds Shorts limit {limit}s"] if dur > limit else []
    return {"video": video, "srt": srt, "package": pkg_path, "duration": dur, "timeline": timeline,
            "gate": gate, "warnings": warn}
