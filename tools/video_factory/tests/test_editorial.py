from factory import config
from factory.editorial import check

CH = config.channel("live_news")


def story(**kw):
    d = {"headline": "h", "narration": "खबर।", "sources": ["A", "B"]}
    d.update(kw)
    return d


def spec(**kw):
    d = {"kind": "bulletin", "channel": "live_news", "stories": [story()],
         "review": {"status": "approved", "by": "Nitesh"}}
    d.update(kw)
    return d


def test_unapproved_is_private():
    r = check(spec(review={"status": "draft"}), CH)
    assert r.ok and not r.may_publish and r.privacy == "private"


def test_one_source_blocks_publish():
    r = check(spec(stories=[story(sources=["A"])]), CH)
    assert not r.may_publish and any("2 sources" in w for w in r.warnings)
    r = check(spec(stories=[story(sources=["A"], source_waiver="official release")]), CH)
    assert r.may_publish


def test_approved_two_sources_follows_channel_mode():
    r = check(spec(), CH)
    assert r.may_publish and r.privacy == "private"          # channel default is private
    r = check(spec(), {**CH, "publish_mode": "scheduled"})
    assert r.privacy == "scheduled"


def test_missing_narration_is_a_problem():
    r = check(spec(stories=[story(narration="")]), CH)
    assert not r.ok


def test_advice_wording_warns():
    r = check(spec(stories=[story(narration="यह शेयर खरीदें।")]), CH)
    assert any("advice" in w for w in r.warnings)
