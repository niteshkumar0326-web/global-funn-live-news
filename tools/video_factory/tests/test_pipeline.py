"""End-to-end smoke tests with the tone stand-in for TTS (needs ffmpeg + the font)."""
import json
import shutil
from pathlib import Path

import pytest

from factory import config, live, media

pytestmark = pytest.mark.skipif(not shutil.which("ffmpeg"), reason="ffmpeg missing")
EX = Path(__file__).resolve().parent.parent / "examples"


@pytest.fixture(autouse=True)
def sandbox(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "WORK", tmp_path / "work")
    monkeypatch.setattr(config, "OUT", tmp_path / "out")
    monkeypatch.setattr(config, "FONT_PATH", Path(__file__).resolve().parent.parent / "assets/fonts/NotoSansDevanagari.ttf")


def test_short_and_wide_bulletin(tmp_path):
    from factory.bulletin import render_bulletin

    spec = json.loads((EX / "bulletin_live_news.json").read_text(encoding="utf-8"))
    spec["stories"] = spec["stories"][:1]
    r = render_bulletin(spec, "short", tmp_path / "out")
    sig = media.stream_signature(r["video"])
    assert sig[1:3] == (1080, 1920) and r["duration"] > 4
    assert r["srt"].read_text(encoding="utf-8").startswith("1\n00:00:00,000")
    pkg = json.loads(r["package"].read_text(encoding="utf-8"))
    assert pkg["privacy"] == "private" and pkg["contains_synthetic_media"] is True and "#Shorts" in pkg["description"]
    w = render_bulletin(spec, "wide", tmp_path / "out")
    assert media.stream_signature(w["video"]) == live.TARGET_SIG   # wide output is live-stream ready


def test_live_playlist_loops_and_prefers_fresh(tmp_path):
    from factory.bulletin import render_bulletin

    spec = json.loads((EX / "bulletin_live_news.json").read_text(encoding="utf-8"))
    spec["stories"] = spec["stories"][:1]
    w = render_bulletin(spec, "wide", tmp_path / "out")
    runner = live.LiveRunner("live_news", root=tmp_path / "live")
    parts = runner.collect()
    assert [p.name for p in parts] == ["standby.ts"]            # nothing yet: standby card keeps it on air
    shutil.copy2(w["video"], runner.p.inbox / w["video"].name)
    parts = runner.collect()
    assert parts[0].name.endswith("wide.ts") and (runner.p.library / w["video"].name).exists()
    runner.write_playlist(parts)
    out = tmp_path / "loop.ts"
    media.run(runner.command(str(out), realtime=False, seconds=3 * media.duration(parts[0])), nice=False)
    assert media.duration(out) > 2 * media.duration(parts[0])    # playlist re-opens itself => endless loop


def test_podcast(tmp_path):
    from factory.podcast import render_podcast

    spec = json.loads((EX / "podcast_demo.json").read_text(encoding="utf-8"))
    spec["turns"] = spec["turns"][:3]
    r = render_podcast(spec, tmp_path / "out")
    assert media.stream_signature(r["video"]) == live.TARGET_SIG
    assert r["chapters"][0][0] == 0


def test_story_with_photos_renders_slideshow(tmp_path, monkeypatch):
    import io
    from PIL import Image
    from factory.bulletin import render_bulletin

    monkeypatch.setenv("GF_OFFLINE", "1")
    paths = []
    for i, c in enumerate([(200, 60, 60), (60, 120, 200), (60, 160, 90)]):
        p = tmp_path / f"p{i}.jpg"
        Image.new("RGB", (1600, 1200), c).save(p)
        paths.append(p)
    spec = json.loads((EX / "bulletin_live_news.json").read_text(encoding="utf-8"))
    spec["stories"] = spec["stories"][:1]
    spec["stories"][0]["visuals"] = [{"type": "file", "file": str(p), "credit": f"c{i}", "license": "own"}
                                     for i, p in enumerate(paths)]
    r = render_bulletin(spec, "short", tmp_path / "out")
    assert media.stream_signature(r["video"])[1:3] == (1080, 1920)
    pkg = json.loads(r["package"].read_text(encoding="utf-8"))
    assert "चित्र / क्लिप क्रेडिट" in pkg["description"]
