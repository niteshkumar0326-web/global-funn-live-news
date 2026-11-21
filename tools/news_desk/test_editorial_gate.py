from __future__ import annotations

import unittest

from editorial_gate import review


class EditorialGateTests(unittest.TestCase):
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
        missing = review({
            "headline": None,
            "primary_source_urls": ["javascript:alert(1)", "https://primary.test/report"],
            "independent_source_urls": ["https://independent.test/report"],
            "verified_facts": ["Fact checked against source"],
            "claims_or_allegations": [],
            "uncertainties_and_context": None,
            "editorial_notes": 42,
            "editor_name": None,
            "approval_timestamp_utc": None,
            "workflow_status": "approved",
            "approved_for_script": True,
        })
        self.assertIn("headline", missing)
        self.assertIn("uncertainties_and_context (write 'None identified' if applicable)", missing)
        self.assertIn("editorial_notes", missing)
        self.assertIn("editor_name", missing)
        self.assertIn("approval_timestamp_utc", missing)

    def test_complete_documentation_passes_completeness_gate(self):
        missing = review({
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
        })
        self.assertEqual(missing, [])


if __name__ == "__main__":
    unittest.main()
