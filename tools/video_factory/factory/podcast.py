"""Two-host AI podcast renderer (landscape 1920x1080, audio-reactive waveform, burned captions).

Spec:
  {"kind":"podcast","channel":"podcast","title":"...","hosts":[{"id":"A","name":"अनन्या","voice":"hf_alpha"},
   {"id":"B","name":"रोहन","voice":"hm_omega"}],
   "turns":[{"host":"A","text":"...","chapter":"शुरुआत"}, ...], "review":{...}}
Hosts are clearly labelled "AI आवाज़": no human likeness is faked.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np

from . import config, editorial, media, meta, tts
from .bulletin import slugify
from .cards import Cards
from .hindi import split_sentences, srt_time

TURN_GAP = 0.35


def _hosts(spec: dict, ch: dict) -> list[dict]:
    hosts = spec.get("hosts") or [
        {"id": "A", "name": "अनन्या", "voice": ch.get("voice", "hf_alpha")},
        {"id": "B", "name": "रोहन", "voice": ch.get("voice_b", "hm_omega")},
    ]
    return hosts


def render_podcast(spec: dict, out_root: Path | None = None, channels_path: str | None = None) -> dict:
    ch = config.channel(spec.get("channel", "podcast"), channels_path)
    gate = editorial.check(spec, ch)
    if not gate.ok:
        raise ValueError("editorial gate failed: " + "; ".join(gate.problems))
    hosts = _hosts(spec, ch)
    by_id = {h["id"]: h for h in hosts}
    speed = float(spec.get("speed", ch.get("speed", 1.1)))
    slug = slugify(spec.get("slug") or f"{spec.get('date','')}-{spec['title']}")
    out_dir = (out_root or config.OUT) / ch["key"] / slug
    work = config.WORK / ch["key"] / slug / "podcast"
    work.mkdir(parents=True, exist_ok=True)
    out_dir.mkdir(parents=True, exist_ok=True)

    cards = Cards(ch, "wide")
    ai = ch.get("ai_label", "")
    audio_parts: list[np.ndarray] = []
    frames: list[tuple[Path, float]] = []
    srt, chapters, t = [], [], 0.0
    n_frame = 0
    for turn in spec["turns"]:
        h = by_id[turn["host"]]
        seg = tts.synth_segment(turn.get("say") or turn["text"], h["voice"], speed)
        shown = split_sentences(turn["text"])  # optional "say" = spoken form of an awkward on-screen text
        if turn.get("say") and len(shown) != len(seg.sentences):
            raise ValueError(f"turn 'say' must have the same number of sentences as 'text': {turn['text'][:40]}")
        if turn.get("chapter"):
            chapters.append((t, turn["chapter"]))
        for k, (spoken, a, b) in enumerate(seg.sentences):
            text = shown[k] if turn.get("say") else spoken
            last_in_turn = k == len(seg.sentences) - 1
            i0, i1 = int(a * seg.sr), int(b * seg.sr)
            if last_in_turn:
                i1 = len(seg.samples)
            chunk = seg.samples[i0:i1]
            gap = np.zeros(int(TURN_GAP * seg.sr), dtype=np.float32) if last_in_turn else np.zeros(0, np.float32)
            piece = np.concatenate([chunk, gap])
            dur = len(piece) / seg.sr
            png = work / f"f{n_frame:04d}.png"
            cards.podcast_frame(spec["title"], hosts, h["id"], text, spec.get("date_label", ""), ai).save(png)
            frames.append((png, dur))
            srt.append((t, t + len(chunk) / seg.sr, text))
            audio_parts.append(piece)
            t += dur
            n_frame += 1
    audio = np.concatenate(audio_parts)
    wav = work / "podcast.wav"
    tts.write_wav(wav, audio, tts.SR)

    lst = work / "frames.txt"
    body = "".join(f"file '{p.name}'\nduration {d:.3f}\n" for p, d in frames)
    body += f"file '{frames[-1][0].name}'\n"
    lst.write_text(body, encoding="utf-8")

    fc = ("[1:a]asplit[a1][a2];"
          "[a2]volume=3,showwaves=s=520x130:mode=cline:rate=30:colors=0xFFC43D:scale=sqrt,format=rgba,"
          "colorkey=0x000000:0.15:0.05[w];"
          "[0:v]fps=30,format=yuv420p[v0];[v0][w]overlay=(W-w)/2:495[v];"
          f"[a1]{media.AUDIO_FILTER}[a]")
    video = out_dir / f"{slug}_wide.mp4"
    media.ffmpeg("-f", "concat", "-safe", "0", "-i", str(lst), "-i", str(wav), "-filter_complex", fc,
                 "-map", "[v]", "-map", "[a]", *media.VIDEO_ARGS, *media.AUDIO_ARGS, "-shortest",
                 "-movflags", "+faststart", str(video))
    srt_path = out_dir / f"{slug}_wide.hi.srt"
    srt_path.write_text("".join(f"{i}\n{srt_time(a)} --> {srt_time(b)}\n{x}\n\n"
                                for i, (a, b, x) in enumerate(srt, 1)), encoding="utf-8")
    if chapters and chapters[0][0] != 0:
        chapters.insert(0, (0.0, "शुरुआत"))
    pkg = meta.build_package(spec, ch, "wide", video, gate, chapters, srt_path)
    pkg_path = out_dir / f"{slug}_wide.upload.json"
    pkg_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"video": video, "srt": srt_path, "package": pkg_path, "duration": media.duration(video),
            "gate": gate, "warnings": [], "chapters": chapters}
