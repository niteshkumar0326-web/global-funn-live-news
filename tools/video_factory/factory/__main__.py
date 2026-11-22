"""Command line:  python -m factory <command> ...   (run from tools/video_factory)"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
import traceback
from datetime import datetime, timezone
from pathlib import Path

from . import config, editorial


def _load(path: str) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def cmd_doctor(a) -> int:
    import importlib

    ok = True

    def line(name, good, hint=""):
        nonlocal ok
        print(f"[{'OK' if good else '!!'}] {name}" + ("" if good else f"  -> {hint}"))
        ok &= bool(good)

    line("ffmpeg", shutil.which("ffmpeg"), "install ffmpeg")
    line("ffprobe", shutil.which("ffprobe"), "install ffmpeg")
    line("Devanagari font", config.FONT_PATH.exists(), "python -m factory fetch-font")
    line("Kokoro model files", config.kokoro_paths(), "python -m factory fetch-models")
    for mod in ("numpy", "PIL", "soundfile", "kokoro_onnx"):
        try:
            importlib.import_module(mod)
            line(f"python: {mod}", True)
        except Exception:
            line(f"python: {mod}", False, "pip install -r requirements.txt")
    try:
        importlib.import_module("googleapiclient")
        line("python: googleapiclient (uploads)", True)
    except Exception:
        line("python: googleapiclient (uploads)", False, "pip install -r requirements.txt")
    line("client_secret.json (uploads)", (config.SECRETS / "client_secret.json").exists(),
         "Google Cloud console -> OAuth client (Desktop) -> save as secrets/client_secret.json")
    for k, c in config.load_channels()["channels"].items():
        tok = (config.SECRETS / f"{k}.token.json").exists()
        print(f"     channel {k:10s} token={'yes' if tok else 'no ':3s} live={'on' if c.get('live', {}).get('enabled') else 'off'}")
    return 0 if ok else 1


def cmd_fetch_models(a) -> int:
    from . import tts

    print(tts.fetch_models())
    return 0


def cmd_fetch_font(a) -> int:
    from .cards import ensure_font

    print(ensure_font())
    return 0


def cmd_gate(a) -> int:
    spec = _load(a.spec)
    ch = config.channel(spec.get("channel", "podcast"))
    g = editorial.check(spec, ch)
    print(json.dumps({"ok": g.ok, "may_publish": g.may_publish, "privacy": g.privacy,
                      "problems": g.problems, "warnings": g.warnings}, ensure_ascii=False, indent=2))
    return 0 if g.ok else 2


def render_spec(spec: dict, formats: list[str], out: Path | None) -> list[dict]:
    kind = spec.get("kind", "bulletin")
    results = []
    if kind == "podcast":
        from .podcast import render_podcast

        results.append(render_podcast(spec, out))
    else:
        from .bulletin import render_bulletin

        ch = config.channel(spec["channel"])
        for fmt in formats or ch.get("formats", ["short"]):
            results.append(render_bulletin(spec, fmt, out))
    return results


def cmd_render(a) -> int:
    spec = _load(a.spec)
    formats = a.formats.split(",") if a.formats else []
    for r in render_spec(spec, formats, Path(a.out) if a.out else None):
        print(f"{r['video']}  {r['duration']:.1f}s  privacy={r['gate'].privacy}")
        for w in r["warnings"] + r["gate"].warnings:
            print("  warning:", w)
    return 0


def cmd_batch(a) -> int:
    """Render every spec in a queue folder (bulk). Done -> queue/done, errors -> queue/failed."""
    q = Path(a.queue)
    (q / "done").mkdir(exist_ok=True)
    (q / "failed").mkdir(exist_ok=True)
    n_ok = n_bad = 0
    for p in sorted(q.glob("*.json")):
        try:
            spec = _load(p)
            results = render_spec(spec, a.formats.split(",") if a.formats else [], Path(a.out) if a.out else None)
            ch = config.channel(spec.get("channel", "podcast"))
            live = ch.get("live", {})
            for r in results:
                print(f"OK  {p.name} -> {r['video'].name} {r['duration']:.0f}s privacy={r['gate'].privacy}")
                # only human-approved wide videos may go on the 24x7 stream
                if a.feed_live and live.get("enabled") and r["gate"].may_publish and r["video"].name.endswith("_wide.mp4"):
                    dst = config.ROOT / "live" / ch["key"] / "inbox"
                    dst.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(r["video"], dst / r["video"].name)
            shutil.move(str(p), q / "done" / p.name)
            n_ok += 1
        except Exception as e:
            n_bad += 1
            print(f"FAIL {p.name}: {e}", file=sys.stderr)
            (q / "failed" / (p.name + ".error.txt")).write_text(traceback.format_exc(), encoding="utf-8")
            shutil.move(str(p), q / "failed" / p.name)
    print(f"batch finished: {n_ok} ok, {n_bad} failed")
    return 0 if n_bad == 0 else 1


def cmd_upload(a) -> int:
    from . import uploader

    res = uploader.run_queue(Path(a.root), channel=a.channel, fmt=a.format, schedule=a.schedule,
                             dry_run=a.dry_run, limit=a.limit)
    for r in res:
        print(json.dumps(r, ensure_ascii=False))
    if not res:
        print("nothing to upload")
    return 0


def cmd_auth(a) -> int:
    from . import uploader

    print("saved", uploader.authorize(a.channel, Path(a.client_secret) if a.client_secret else None))
    return 0


def cmd_ledger(a) -> int:
    from .uploader import Ledger

    led = Ledger()
    print(f"uploads recorded: {len(led.data['uploads'])}  quota today (Pacific day): {led.used()} / 10000 units")
    for k, v in list(led.data["uploads"].items())[-10:]:
        print(" ", v.get("uploaded_at", "")[:19], v["channel"], v["privacy"], v["video_id"], v["title"][:50])
    return 0


def cmd_live(a) -> int:
    from .live import LiveRunner

    r = LiveRunner(a.channel, max_age_hours=a.max_age_hours)
    if a.prepare_only:
        parts = r.collect()
        r.write_playlist(parts)
        print("playlist:", *[p.name for p in parts], sep="\n  ")
        print("test command:", " ".join(r.command("OUT.ts", realtime=False, seconds=20)))
        return 0
    r.run_forever(a.target)
    return 0


def main(argv=None) -> int:
    ap = argparse.ArgumentParser(prog="factory", description=__doc__)
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("doctor").set_defaults(fn=cmd_doctor)
    sub.add_parser("fetch-models").set_defaults(fn=cmd_fetch_models)
    sub.add_parser("fetch-font").set_defaults(fn=cmd_fetch_font)
    p = sub.add_parser("gate"); p.add_argument("spec"); p.set_defaults(fn=cmd_gate)
    p = sub.add_parser("render"); p.add_argument("spec"); p.add_argument("--formats", help="short,wide")
    p.add_argument("--out"); p.set_defaults(fn=cmd_render)
    p = sub.add_parser("batch"); p.add_argument("queue"); p.add_argument("--formats"); p.add_argument("--out")
    p.add_argument("--feed-live", action="store_true", help="copy approved wide videos to the live inbox")
    p.set_defaults(fn=cmd_batch)
    p = sub.add_parser("upload"); p.add_argument("--root", default=str(config.OUT)); p.add_argument("--channel")
    p.add_argument("--format"); p.add_argument("--schedule", action="store_true"); p.add_argument("--dry-run", action="store_true")
    p.add_argument("--limit", type=int); p.set_defaults(fn=cmd_upload)
    p = sub.add_parser("auth"); p.add_argument("--channel", required=True); p.add_argument("--client-secret")
    p.set_defaults(fn=cmd_auth)
    sub.add_parser("ledger").set_defaults(fn=cmd_ledger)
    p = sub.add_parser("live"); p.add_argument("--channel", default="live_news"); p.add_argument("--target")
    p.add_argument("--max-age-hours", type=float, default=12.0); p.add_argument("--prepare-only", action="store_true")
    p.set_defaults(fn=cmd_live)
    a = ap.parse_args(argv)
    return a.fn(a)


if __name__ == "__main__":
    sys.exit(main())
