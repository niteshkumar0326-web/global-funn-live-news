import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools" / "news_desk"))

from rss_brief import parse_feed  # noqa: E402
from editorial_gate import review  # noqa: E402


class FeedParserTests(unittest.TestCase):
    def test_rss_item_is_marked_unverified(self):
        xml = b"""<?xml version="1.0"?>
        <rss version="2.0"><channel><item>
          <title>Test headline</title>
          <link>https://example.org/story</link>
          <description>Short summary</description>
          <pubDate>Sat, 21 Nov 2026 08:00:00 GMT</pubDate>
        </item></channel></rss>"""
        items = parse_feed(xml, {"name": "Example", "category": "Test"})
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["title"], "Test headline")
        self.assertEqual(items[0]["verification_status"], "UNVERIFIED LEAD")

    def test_atom_entry_parses_link_href(self):
        xml = b"""<?xml version="1.0"?>
        <feed xmlns="http://www.w3.org/2005/Atom"><entry>
          <title>Atom headline</title>
          <link href="https://example.org/atom-story" />
          <summary>Atom summary</summary>
        </entry></feed>"""
        items = parse_feed(xml, {"name": "Atom", "category": "World"})
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["url"], "https://example.org/atom-story")


class EditorialGateTests(unittest.TestCase):
    def approved_story(self):
        return {
            "headline": "Test story",
            "primary_source_urls": ["https://official.example/doc"],
            "independent_source_urls": ["https://news.example/report"],
            "verified_facts": ["A documented fact"],
            "claims_or_allegations": [],
            "uncertainties_and_context": "None identified",
            "editorial_notes": "Privacy and attribution reviewed",
            "editor_name": "Test Editor",
            "approval_timestamp_utc": "2026-11-21T08:00:00+00:00",
            "workflow_status": "approved",
            "approved_for_script": True,
        }

    def test_complete_record_passes_documentation_gate(self):
        self.assertEqual(review(self.approved_story()), [])

    def test_unapproved_story_is_held(self):
        story = self.approved_story()
        story["approved_for_script"] = False
        missing = review(story)
        self.assertIn("approved_for_script must be true", missing)

    def test_invalid_source_url_is_held(self):
        story = self.approved_story()
        story["primary_source_urls"] = ["javascript:alert(1)"]
        missing = review(story)
        self.assertIn("at least one valid primary_source_url", missing)


if __name__ == "__main__":
    unittest.main(verbosity=2)
