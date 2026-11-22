"""Visuals: providers are mocked (no network); checks licences, cache, policy and fallbacks."""
import io
import json

import pytest
from PIL import Image

from factory import assets, config, editorial


def jpg(w=900, h=1200, c=(120, 80, 40)):
    b = io.BytesIO()
    Image.new("RGB", (w, h), c).save(b, "JPEG")
    return b.getvalue()


@pytest.fixture(autouse=True)
def sandbox(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "WORK", tmp_path / "work")
    for k in ("PEXELS_API_KEY", "PIXABAY_API_KEY", "GF_OFFLINE"):
        monkeypatch.delenv(k, raising=False)


CH = config.channel("live_news")


def test_pexels_photo_and_credit(monkeypatch):
    monkeypatch.setenv("PEXELS_API_KEY", "k")
    calls = []

    def fake(url, headers=None, timeout=30):
        calls.append(url)
        if "api.pexels.com" in url:
            return json.dumps({"photos": [{"id": 1, "photographer": "Asha", "url": "https://pexels/1",
                                           "src": {"large2x": "https://img/1.jpg"}}]}).encode()
        return jpg()

    monkeypatch.setattr(assets, "http_get", fake)
    story = {"headline": "x", "visuals": [{"type": "stock", "q": "market", "count": 1}]}
    got = assets.resolve_story(story, "short", CH)
    assert got[0].origin == "pexels" and got[0].credit == "Asha" and got[0].file.exists()
    assert "Pexels: Asha" in got[0].label() and "orientation=portrait" in calls[0]
    n = len(calls)
    again = assets.resolve_story(story, "short", CH, no_net=True)      # served from cache, offline
    assert again[0].path == got[0].path and len(calls) == n


def test_wikimedia_keeps_only_free_licences(monkeypatch):
    def page(i, lic):
        return {"pageid": i, "index": i, "imageinfo": [{
            "thumburl": f"https://img/{i}.jpg", "mime": "image/jpeg", "descriptionurl": f"https://c/{i}",
            "extmetadata": {"LicenseShortName": {"value": lic}, "Artist": {"value": "<a>Ravi K</a>"}}}]}

    data = {"query": {"pages": {"1": page(1, "All rights reserved"), "2": page(2, "CC BY-SA 4.0")}}}
    monkeypatch.setattr(assets, "http_get", lambda url, headers=None, timeout=30:
                        json.dumps(data).encode() if "w/api.php" in url else jpg(1200, 800))
    got = assets.fetch_wikimedia("stadium", "wide", 2)
    assert len(got) == 1 and got[0].credit == "Ravi K" and got[0].license == "CC BY-SA 4.0"
    assert got[0].label() == "चित्र: Ravi K (CC BY-SA 4.0)"


def test_ai_is_labelled_wrapped_and_blocked_for_real_events(monkeypatch):
    urls = []
    monkeypatch.setattr(assets, "http_get", lambda url, headers=None, timeout=30: (urls.append(url), jpg())[1])
    story = {"headline": "h", "visuals": [{"type": "ai", "prompt": "rising charts"}]}
    got = assets.resolve_story(story, "short", CH)
    assert got[0].ai and got[0].label() == assets.LABEL_AI
    assert "no%20identifiable%20people" in urls[0] and "no%20text" in urls[0]
    urls.clear()
    real = dict(story, real_event=True)
    out = assets.resolve_story(real, "short", CH)
    assert not urls and out[0].origin == "generated"                   # AI never used for real events


def test_failure_falls_back_to_generated_backdrop(monkeypatch):
    monkeypatch.setenv("PIXABAY_API_KEY", "k")

    def boom(url, headers=None, timeout=30):
        raise OSError("blocked")

    monkeypatch.setattr(assets, "http_get", boom)
    got = assets.resolve_story({"headline": "z", "visuals": [{"type": "stock", "q": "q"}]}, "wide", CH)
    assert len(got) == 1 and got[0].origin == "generated" and got[0].file.exists()
    assert Image.open(got[0].file).size == (1920, 1080) and assets.credits(got) == []


def test_local_file_entry_and_prepare(tmp_path):
    f = tmp_path / "a.jpg"
    f.write_bytes(jpg(2000, 1000))
    got = assets.resolve_story({"headline": "h", "visuals": [{"type": "file", "file": str(f), "credit": "BCCI"}]},
                               "short", CH, no_net=True)
    assert got[0].origin == "local" and got[0].credit == "BCCI"
    p = assets.prepare_photo(got[0], 1080, 1920, tmp_path / "fr")
    assert Image.open(p).size == (2160, 3840)


def test_gate_blocks_ai_for_real_event_and_warns_unlicensed_file():
    spec = {"kind": "bulletin", "channel": "live_news", "review": {},
            "stories": [{"headline": "h", "narration": "n", "sources": ["A", "B"], "real_event": True,
                         "visuals": [{"type": "ai", "prompt": "x"}, {"type": "file", "file": "p.jpg"}]}]}
    g = editorial.check(spec, CH)
    assert any("real event" in p for p in g.problems)
    assert any("no credit" in w for w in g.warnings)
