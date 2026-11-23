"""Bulletin renderer: spec.json -> mp4 (vertical Short and/or landscape) + srt + upload.json."""
from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

from . import assets as visuals_mod
from . import config, editorial, media, meta, tts
from .cards import Cards
from .hindi import srt_time

TICKER_SPEED = {"short": 110, "wide": 140}
TICKER_Y = {"short": 1450, "wide": 1000}
CAPTION_Y = {"short": 1590, "wide": 270}   # burned-in Hindi captions (also uploaded as .srt)
DEFAULT_OUTRO = "ताज़ा खबरों के लिए चैनल को सब्सक्राइब करें। धन्यवाद।"


@dataclass
class Scene:
    name: str
    narration: str
    card_args: dict
    kind: str  # intro | story | outro
    story: dict | None = None


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
            note=s.get("note"), ai=ai, date=date_label), "story", s))
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



XFADE = 0.6
MIN_SLIDE = 3.2


def story_assets(sc: Scene, spec: dict, ch: dict, fmt: str):
    """Assets for a story scene (None for intro/outro or when the story opts out with visuals=false)."""
    if sc.kind != "story" or sc.story is None or sc.story.get("visuals") is False:
        return None
    return visuals_mod.resolve_story(sc.story, fmt, ch, seed_text=f"{spec.get('date','')}-{sc.name}-{sc.story.get('headline','')}")


def caption_inputs(cards, sentences, D: float, work: Path, name: str, first_idx: int, cur: str, fmt: str):
    """ffmpeg inputs + overlay chain that burn each spoken sentence on screen. Returns (inputs, chains, last_label)."""
    ins, chains = [], []
    for k, (text, a, b) in enumerate(sentences):
        p = work / f"{name}.cap{k}.png"
        cards.caption_png(text).save(p)
        ins += ["-loop", "1", "-framerate", "30", "-t", str(D), "-i", str(p)]
        end = sentences[k + 1][1] if k + 1 < len(sentences) else D + 1
        nxt = f"cap{k}"
        chains.append(f"[{cur}][{first_idx + k}:v]overlay=0:{CAPTION_Y[fmt]}:"
                      f"enable='between(t,{max(0.0, a - 0.05):.3f},{max(end, b):.3f})'[{nxt}]")
        cur = nxt
    return ins, chains, cur


def slideshow_filter(items: list, D: float, W: int, H: int, work: Path, scrim_idx: int):
    """Build ffmpeg inputs + filter graph (label [bg]) for N photos/clips with Ken-Burns and cross-fades."""
    n = len(items)
    d = (D + (n - 1) * XFADE) / n
    inputs, chains = [], []
    for i, a in enumerate(items):
        if a.kind == "video":
            inputs += ["-stream_loop", "-1", "-t", f"{d:.3f}", "-i", str(a.file)]
            chains.append(f"[{i}:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},setsar=1,fps=30,"
                          f"format=yuv420p[v{i}]")
        else:
            png = visuals_mod.prepare_photo(a, W, H, work / "frames")
            inputs += ["-loop", "1", "-framerate", "30", "-t", f"{d:.3f}", "-i", str(png)]
            z = (f"1+0.0035*on/30" if i % 2 == 0 else f"1.12-0.0035*on/30")
            xs = ("iw/2-(iw/zoom/2)+" + str((i % 3 - 1) * 14)) if n > 1 else "iw/2-(iw/zoom/2)"
            chains.append(f"[{i}:v]zoompan=z='{z}':x='{xs}':y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps=30,"
                          f"setsar=1,format=yuv420p[v{i}]")
    last = "v0"
    for i in range(1, n):
        off = i * (d - XFADE)
        chains.append(f"[{last}][v{i}]xfade=transition=fade:duration={XFADE}:offset={off:.3f}[x{i}]")
        last = f"x{i}"
    chains.append(f"[{last}]null[bg]")
    return inputs, chains


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

    clips, t0, srt_lines, chapters, timeline, all_credits = [], 0.0, [], [], [], []
    for i, sc in enumerate(scenes):
        seg = tts.synth_segment(sc.narration, voice, speed)
        wav = work / f"{sc.name}.wav"
        tts.write_wav(wav, seg.samples, seg.sr)
        png = work / f"{sc.name}.png"
        D = round(seg.duration + 0.15, 3)
        first, last = i == 0, i == len(scenes) - 1
        vfade = ",".join(x for x in ("fade=t=in:st=0:d=0.3" if first else "",
                                      f"fade=t=out:st={D-0.6:.2f}:d=0.6" if last else "") if x)
        afade = ",".join(x for x in ("afade=t=in:st=0:d=0.2" if first else "",
                                      f"afade=t=out:st={D-0.6:.2f}:d=0.6" if last else "") if x)
        clip = work / f"{sc.name}.mp4"
        tick = (f"overlay=x='-mod({TICKER_SPEED[fmt]}*(t+{t0:.3f}),{P})':y={TICKER_Y[fmt]},"
                f"format=yuv420p{','+vfade if vfade else ''}")
        items = story_assets(sc, spec, ch, fmt)
        if items:
            items = items[: max(1, int((D + XFADE) // MIN_SLIDE))]
            a = sc.card_args
            card_png = work / f"{sc.name}.photo.png"
            cards.story_photo_card(a["tag"], a["chip"], a["headline"], a["sub"], a["tiles"], a["source"], a["note"],
                                   a["ai"], date_label=a["date"]).save(card_png)
            ins, chains = slideshow_filter(items, D, W, H, work, 0)
            n = len(items)
            per = (D + (n - 1) * XFADE) / n
            ins += ["-loop", "1", "-framerate", "30", "-t", str(D), "-i", str(card_png)]
            label_ins, cur = [], "bg"
            for k, it in enumerate(items):
                lp = work / f"{sc.name}.label{k}.png"
                cards.photo_label_overlay(it.label()).save(lp)
                label_ins += ["-loop", "1", "-framerate", "30", "-t", str(D), "-i", str(lp)]
            ins += label_ins
            ci = n  # index of card input
            chains.append(f"[bg][{ci}:v]overlay=0:0[c0]")
            cur = "c0"
            for k in range(n):
                s0 = max(0.0, k * (per - XFADE))
                s1 = D + 1 if k == n - 1 else s0 + per - XFADE / 2
                chains.append(f"[{cur}][{ci + 1 + k}:v]overlay=0:0:enable='between(t,{s0:.3f},{s1:.3f})'[c{k+1}]")
                cur = f"c{k+1}"
            ti, ai_ = ci + 1 + n, ci + 2 + n
            cap_ins, cap_chains, cur = caption_inputs(cards, seg.sentences, D, work, sc.name, ai_ + 1, cur, fmt)
            chains += cap_chains
            chains.append(f"[{cur}][{ti}:v]{tick}[v]")
            chains.append(f"[{ai_}:a]{media.AUDIO_FILTER}{','+afade if afade else ''}[a]")
            media.ffmpeg(*ins, "-loop", "1", "-framerate", "30", "-t", str(D), "-i", str(work / "ticker.png"),
                         "-i", str(wav), *cap_ins, "-filter_complex", ";".join(chains), "-map", "[v]", "-map", "[a]",
                         *media.VIDEO_ARGS, *media.AUDIO_ARGS, "-shortest", str(clip))
            all_credits.extend(visuals_mod.credits(items))
        else:
            card_for(cards, sc).save(png)
            cap_ins, cap_chains, cur = caption_inputs(cards, seg.sentences, D, work, sc.name, 3, "bg", fmt)
            vf = (f"[0:v]scale={W*2}:{H*2}:flags=lanczos,zoompan=z='1+0.003*on/30':x='iw/2-(iw/zoom/2)':"
                  f"y='ih/2-(ih/zoom/2)':d=1:s={W}x{H}:fps=30[bg];" + "".join(c + ";" for c in cap_chains) +
                  f"[{cur}][1:v]{tick}[v];"
                  f"[2:a]{media.AUDIO_FILTER}{','+afade if afade else ''}[a]")
            media.ffmpeg("-loop", "1", "-framerate", "30", "-t", str(D), "-i", str(png),
                         "-loop", "1", "-framerate", "30", "-t", str(D), "-i", str(work / "ticker.png"),
                         "-i", str(wav), *cap_ins, "-filter_complex", vf, "-map", "[v]", "-map", "[a]",
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

    thumb = out_dir / f"{slug}_{fmt}.thumb.jpg"
    try:  # first story card as the thumbnail (readable headline + numbers)
        at = timeline[1]["start"] + 2.0 if len(timeline) > 1 else 1.0
        tw, th = (1280, 720) if fmt == "wide" else (720, 1280)
        media.ffmpeg("-ss", f"{at:.2f}", "-i", str(video), "-frames:v", "1", "-vf", f"scale={tw}:{th}", "-q:v", "3", str(thumb))
    except Exception:
        thumb = None
    srt = out_dir / f"{slug}_{fmt}.hi.srt"
    srt.write_text("".join(f"{i}\n{srt_time(a)} --> {srt_time(b)}\n{t}\n\n"
                           for i, (a, b, t) in enumerate(srt_lines, 1)), encoding="utf-8")
    pkg = meta.build_package(spec, ch, fmt, video, gate, chapters, srt, credits=sorted(set(all_credits)), thumbnail=thumb)
    pkg_path = out_dir / f"{slug}_{fmt}.upload.json"
    pkg_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2), encoding="utf-8")
    dur = media.duration(video)
    limit = 180 if fmt == "short" else 3600 * 3
    warn = [f"duration {dur:.0f}s exceeds Shorts limit {limit}s"] if dur > limit else []
    return {"video": video, "srt": srt, "package": pkg_path, "duration": dur, "timeline": timeline,
            "gate": gate, "warnings": warn}
