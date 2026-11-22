import json
from datetime import datetime, timezone

import pytest

from factory import uploader
from factory.uploader import Ledger, QuotaExceeded, next_slots


def make_pkg(tmp_path, name="v1", may_publish=True, privacy="scheduled"):
    video = tmp_path / f"{name}.mp4"
    video.write_bytes(name.encode() * 100)
    pkg = {"channel": "live_news", "format": "wide", "video": str(video), "title": name, "description": "d",
           "tags": ["a"], "category_id": "25", "language": "hi", "contains_synthetic_media": True,
           "made_for_kids": False, "privacy": privacy, "publish_at": None, "thumbnail": None,
           "gate": {"may_publish": may_publish, "problems": [], "warnings": []}}
    (tmp_path / f"{name}.upload.json").write_text(json.dumps(pkg), encoding="utf-8")
    return pkg


def test_next_slots_are_future_ist_and_unique():
    now = datetime(2026, 11, 22, 4, 0, tzinfo=timezone.utc)  # 09:30 IST
    s = next_slots(now, ["07:30", "12:30", "18:30"], 4)
    assert s[0].strftime("%H:%M") == "07:00"                  # 12:30 IST == 07:00 UTC
    assert len(set(s)) == 4 and all(x > now for x in s)
    taken = {uploader.iso_utc(s[0])}
    assert next_slots(now, ["07:30", "12:30", "18:30"], 1, taken)[0] == s[1]


def test_ledger_quota_day_is_pacific():
    now = datetime(2026, 11, 22, 7, 30, tzinfo=timezone.utc)  # 23:30 PST on the 21st
    assert Ledger.quota_day(now) == "2026-11-21"


def test_dry_run_and_gate_guarantee(tmp_path):
    make_pkg(tmp_path, "a", may_publish=False, privacy="public")
    led = Ledger(tmp_path / "led.json")
    res = uploader.run_queue(tmp_path, dry_run=True, ledger=led, schedule=True)
    assert res[0]["status"] == "dry-run" and res[0]["privacy"]["privacyStatus"] == "private"
    assert "publishAt" not in res[0]["privacy"]


def test_body_flags_synthetic_and_schedule(tmp_path):
    p = make_pkg(tmp_path)
    p["publish_at"] = "2026-11-23T02:00:00Z"
    b = uploader._body(p)
    assert b["status"]["privacyStatus"] == "private" and b["status"]["publishAt"] == "2026-11-23T02:00:00Z"
    assert b["status"]["containsSyntheticMedia"] is True


def test_quota_budget_stops_before_calling_api(tmp_path):
    p = make_pkg(tmp_path)
    led = Ledger(tmp_path / "led.json")
    now = datetime(2026, 11, 22, 12, 0, tzinfo=timezone.utc)
    for _ in range(6):
        led.add_quota(uploader.UPLOAD_COST, now)
    with pytest.raises(QuotaExceeded):
        uploader.upload_one(object(), p, led, daily_budget=6, now=now)


def test_already_uploaded_is_skipped(tmp_path):
    p = make_pkg(tmp_path)
    led = Ledger(tmp_path / "led.json")
    led.record(Ledger.file_key(tmp_path / "v1.mp4"), {"video_id": "XYZ"})
    r = uploader.upload_one(object(), p, led)
    assert r["status"] == "skipped" and r["video_id"] == "XYZ"


class _Req:
    def __init__(self, fail=0):
        self.fail, self.calls = fail, 0

    def next_chunk(self):
        self.calls += 1
        return None, {"id": "VID123"}


class _Videos:
    def __init__(self):
        self.last = None

    def insert(self, part, body, media_body):
        self.last = {"part": part, "body": body}
        return _Req()


class _Svc:
    def __init__(self):
        self.v = _Videos()

    def videos(self):
        return self.v


def test_real_upload_path_with_fake_service(tmp_path):
    pytest.importorskip("googleapiclient")
    p = make_pkg(tmp_path)
    led = Ledger(tmp_path / "led.json")
    svc = _Svc()
    now = datetime(2026, 11, 22, 12, 0, tzinfo=timezone.utc)
    r = uploader.upload_one(svc, p, led, now=now)
    assert r == {"status": "uploaded", "video_id": "VID123", "privacy": "private"}
    assert svc.v.last["body"]["status"]["containsSyntheticMedia"] is True
    assert led.used(now) == uploader.UPLOAD_COST
    assert uploader.upload_one(svc, p, Ledger(tmp_path / "led.json"), now=now)["status"] == "skipped"
