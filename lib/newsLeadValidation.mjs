const MAX_LEADS = 300;

function safeText(value, max = 1200) {
  if (typeof value !== "string") return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

function safeHttpUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return "";
  try {
    const parsed = new URL(value.trim());
    if (!["https:", "http:"].includes(parsed.protocol) || !parsed.hostname) return "";
    if (parsed.username || parsed.password) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

export function normalizeLead(value, index) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const title = safeText(value.title, 240);
  const url = safeHttpUrl(value.url);
  if (!title || !url) return null;
  return {
    id: `rss-${index}-${url}`,
    title,
    url,
    description: safeText(value.description, 1000),
    category: safeText(value.category, 80) || "Uncategorised",
    source: safeText(value.source, 120) || "RSS feed",
    published: safeText(value.published, 80),
  };
}

export function parseNewsBrief(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The JSON file must contain a news brief object.");
  }
  if (!Array.isArray(value.items)) {
    throw new Error("No RSS items found. Select news_brief.json, not the Markdown brief.");
  }
  if (value.items.length > MAX_LEADS) {
    throw new Error(`This brief contains more than ${MAX_LEADS} leads. Split it into smaller files.`);
  }
  const items = value.items.map(normalizeLead).filter(Boolean);
  const feedFailures = Array.isArray(value.feed_failures)
    ? value.feed_failures.slice(0, 20).map((failure) => ({
        source: safeText(failure?.source, 120) || "Unknown feed",
        error: safeText(failure?.error, 240) || "Feed failed without details",
      }))
    : [];
  return {
    items,
    feedFailures,
    generatedAtUtc: safeText(value.generated_at_utc, 80),
    sourceItemCount: value.items.length,
  };
}
