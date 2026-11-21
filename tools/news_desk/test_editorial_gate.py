from __future__ import annotations

import unittest

from editorial_gate import review


class EditorialGateTests(unittest.TestCase):
    def valid_item(self):
        return {
            "headline": "Verified public update",
            "primary_source_urls": ["https://primary.test/report"],
            "independent_source_urls": ["https://independent.test/report"],
            "verified_facts": ["The agency published the notice."],
            "claims_or_allegations": [],
            "uncertainties_and_context": "None identified",
            "editorial_notes": "Dates and original document checked.",
            "editor_name": "Editor",
            "approval_timestamp_utc": "2026-11-21T09:00:00+00:00",
            "workflow_status": "approved",
            "approved_for_script": True,
        }

    def test_empty_generated_lead_is_held_with_required_fields(self):
        missing = review({
            "headline": "A generated headline",
            "primary_source_urls": [],
            "independent_source_urls": [],
            "verified_facts": [],
            "claims_or_allegations": [],
            "uncertainties_and_context": "",
            "editorial_notes": "",
            "editor_name": "",
            "approval_timestamp_utc": "",
            "workflow_status": "needs_review",
            "approved_for_script": False,
        })
        self.assertIn("at least one valid primary_source_url", missing)
        self.assertIn("at least one valid independent_source_url", missing)
        self.assertIn("workflow_status must be 'approved'", missing)
        self.assertIn("approved_for_script must be true", missing)

    def test_non_string_editor_fields_are_held_not_crashed(self):
        item = self.valid_item()
        item.update({
            "headline": None,
            "primary_source_urls": ["javascript:alert(1)", "https://primary.test/report"],
            "uncertainties_and_context": None,
            "editorial_notes": 42,
            "editor_name": None,
            "approval_timestamp_utc": None,
        })
        missing = review(item)
        self.assertIn("headline", missing)
        self.assertIn("uncertainties_and_context (write 'None identified' if applicable)", missing)
        self.assertIn("editorial_notes", missing)
        self.assertIn("editor_name", missing)
        self.assertIn("approval_timestamp_utc must be a valid timezone-aware UTC timestamp", missing)

    def test_complete_documentation_passes_completeness_gate(self):
        self.assertEqual(review(self.valid_item()), [])

    def test_same_url_cannot_count_as_independent_corroboration(self):
        item = self.valid_item()
        item["independent_source_urls"] = ["https://primary.test/report"]
        self.assertIn("independent_source_url must differ from primary source URLs", review(item))

    def test_non_utc_or_malformed_timestamp_is_held(self):
        for timestamp in ("not-a-date", "2026-11-21T09:00:00", "2026-11-21T10:00:00+01:00"):
            with self.subTest(timestamp=timestamp):
                item = self.valid_item()
                item["approval_timestamp_utc"] = timestamp
                self.assertIn(
                    "approval_timestamp_utc must be a valid timezone-aware UTC timestamp",
                    review(item),
                )


if __name__ == "__main__":
    unittest.main()
