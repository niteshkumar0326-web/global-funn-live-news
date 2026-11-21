from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import prepare_review_queue


class PrepareReviewQueueTests(unittest.TestCase):
    def test_converts_feed_items_to_unverified_editorial_records(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "brief.json"
            output = root / "review_queue.json"
            source.write_text(json.dumps({
                "brand": "GLOBAL FUNN",
                "items": [{
                    "title": "Example headline",
                    "category": "World",
                    "source": "Example Feed",
                    "published": "2026-11-21T08:00:00+00:00",
                    "url": "https://example.test/story",
                    "description": "Unverified feed summary",
                }]
            }), encoding="utf-8")

            with patch.object(sys, "argv", [
                "prepare_review_queue.py", "--input", str(source), "--out", str(output)
            ]):
                self.assertEqual(prepare_review_queue.main(), 0)

            payload = json.loads(output.read_text(encoding="utf-8"))
            self.assertEqual(payload["brand"], "GLOBAL FUNN")
            self.assertEqual(len(payload["items"]), 1)
            lead = payload["items"][0]
            self.assertEqual(lead["headline"], "Example headline")
            self.assertEqual(lead["lead_url"], "https://example.test/story")
            self.assertEqual(lead["feed_source"], "Example Feed")
            self.assertEqual(lead["workflow_status"], "needs_review")
            self.assertFalse(lead["approved_for_script"])
            self.assertEqual(lead["primary_source_urls"], [])
            self.assertEqual(lead["independent_source_urls"], [])

    def test_empty_brief_creates_empty_queue(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "brief.json"
            output = root / "review_queue.json"
            source.write_text(json.dumps({"items": []}), encoding="utf-8")

            with patch.object(sys, "argv", [
                "prepare_review_queue.py", "--input", str(source), "--out", str(output)
            ]):
                self.assertEqual(prepare_review_queue.main(), 0)

            self.assertEqual(json.loads(output.read_text(encoding="utf-8"))["items"], [])


if __name__ == "__main__":
    unittest.main()
