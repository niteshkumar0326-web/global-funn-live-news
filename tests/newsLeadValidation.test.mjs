import test from "node:test";
import assert from "node:assert/strict";
import { normalizeLead, parseNewsBrief } from "../lib/newsLeadValidation.mjs";

test("normalizes a valid RSS item and preserves its editorial metadata", () => {
  const lead = normalizeLead({
    title: "  India update  ",
    url: "https://example.com/story",
    description: "A source summary that remains unverified.",
    category: "India",
    source: "Example Feed",
    published: "2026-11-21T08:00:00Z",
    verification_status: "UNVERIFIED LEAD",
  }, 0);
  assert.equal(lead.title, "India update");
  assert.equal(lead.url, "https://example.com/story");
  assert.equal(lead.category, "India");
  assert.equal(lead.source, "Example Feed");
  assert.equal(lead.published, "2026-11-21T08:00:00Z");
});

test("rejects missing headlines and non-web source URLs", () => {
  assert.equal(normalizeLead({ url: "https://example.com" }, 0), null);
  assert.equal(normalizeLead({ title: "Unsafe", url: "javascript:alert(1)" }, 0), null);
  assert.equal(normalizeLead({ title: "Local file", url: "file:///etc/passwd" }, 0), null);
});

test("rejects URLs containing embedded credentials", () => {
  assert.equal(normalizeLead({ title: "Credential URL", url: "https://user:secret@example.com/news" }, 0), null);
});

test("strips markup and bounds untrusted feed text", () => {
  const lead = normalizeLead({
    title: "<b>Headline</b>",
    url: "https://example.com/news",
    description: "<script>alert(1)</script> " + "x".repeat(1500),
    source: "S".repeat(300),
  }, 0);
  assert.equal(lead.title, "Headline");
  assert.equal(lead.description.length <= 1000, true);
  assert.equal(lead.source.length <= 120, true);
  assert.equal(lead.description.includes("<script>"), false);
});

test("parses the collector's envelope and retains feed failures", () => {
  const result = parseNewsBrief({
    brand: "GLOBAL FUNN",
    generated_at_utc: "2026-11-21T08:00:00Z",
    items: [{ title: "Story", url: "https://example.com/story" }],
    feed_failures: [{ source: "Feed A", error: "Timeout" }],
  });
  assert.equal(result.items.length, 1);
  assert.equal(result.feedFailures.length, 1);
  assert.equal(result.generatedAtUtc, "2026-11-21T08:00:00Z");
});

test("rejects oversized lead collections rather than rendering unbounded input", () => {
  const items = Array.from({ length: 301 }, (_, i) => ({
    title: `Story ${i}`,
    url: `https://example.com/${i}`,
  }));
  assert.throws(() => parseNewsBrief({ items }), /300/);
});
