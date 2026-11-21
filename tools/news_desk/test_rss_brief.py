from __future__ import annotations

import unittest

from rss_brief import parse_date, parse_feed


class RssBriefParserTests(unittest.TestCase):
    def test_parses_rss_item_and_marks_it_unverified(self):
        payload = b"""<?xml version="1.0"?>
        <rss version="2.0"><channel><item>
          <title>  Market &amp; Economy  </title>
          <link>https://example.test/story</link>
          <description><![CDATA[<p>Summary &amp; details</p>]]></description>
          <pubDate>Sat, 21 Nov 2026 08:00:00 +0000</pubDate>
        </item></channel></rss>"""
        result = parse_feed(payload, {"name": "Example", "category": "Business"})
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["title"], "Market & Economy")
        self.assertEqual(result[0]["url"], "https://example.test/story")
        self.assertEqual(result[0]["description"], "Summary & details")
        self.assertEqual(result[0]["verification_status"], "UNVERIFIED LEAD")
        self.assertEqual(result[0]["source"], "Example")

    def test_parses_atom_link_href_and_updated_timestamp(self):
        payload = b"""<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom"><entry>
          <title>Regional update</title>
          <link rel="alternate" href="https://example.test/atom-story"/>
          <updated>2026-11-21T08:30:00Z</updated>
          <summary>Short update</summary>
        </entry></feed>"""
        result = parse_feed(payload, {"name": "Atom Source"})
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["url"], "https://example.test/atom-story")
        self.assertEqual(result[0]["published"], "2026-11-21T08:30:00+00:00")
        self.assertEqual(result[0]["description"], "Short update")

    def test_skips_entries_without_title_or_link(self):
        payload = b"""<rss><channel>
          <item><title>Missing URL</title></item>
          <item><link>https://example.test/no-title</link></item>
        </channel></rss>"""
        self.assertEqual(parse_feed(payload, {}), [])

    def test_uses_id_when_atom_link_is_missing(self):
        payload = b"""<feed xmlns="http://www.w3.org/2005/Atom"><entry>
          <title>Identifier fallback</title><id>https://example.test/id</id>
        </entry></feed>"""
        result = parse_feed(payload, {})
        self.assertEqual(result[0]["url"], "https://example.test/id")

    def test_normalizes_rfc822_dates_to_utc(self):
        self.assertEqual(
            parse_date("Sat, 21 Nov 2026 13:30:00 +0530"),
            "2026-11-21T08:00:00+00:00",
        )

    def test_preserves_unparseable_date_for_editor_review(self):
        self.assertEqual(parse_date("date unknown"), "date unknown")


if __name__ == "__main__":
    unittest.main()
