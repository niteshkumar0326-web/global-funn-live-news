"use client";

import { ChangeEvent, useMemo, useState } from "react";

type Lead = {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  source: string;
  published: string;
};
type LocalStory = {
  id: string;
  headline: string;
  desk: string;
  location: string;
  summary: string;
  source1: string;
  source2: string;
  status: string;
  editor: string;
  createdAt: string;
  workflowState: "Draft";
};

const STORY_QUEUE_KEY = "global-funn-newsroom-drafts-v1";
const safeText = (value: unknown, max = 1200) =>
  typeof value === "string" ? value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";
function safeHttpUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "";
  } catch {
    return "";
  }
}
function normalizeLead(value: unknown, index: number): Lead | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  const title = safeText(item.title, 240);
  const url = safeHttpUrl(item.url);
  if (!title || !url) return null;
  return {
    id: `rss-${index}-${url}`,
    title,
    url,
    description: safeText(item.description, 1000),
    category: safeText(item.category, 80) || "Uncategorised",
    source: safeText(item.source, 120) || "RSS feed",
    published: safeText(item.published, 80),
  };
}

export default function NewsLeadImporter() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("Choose the news_brief.json file created by the free RSS collector.");
  const [addedUrls, setAddedUrls] = useState<string[]>([]);
  const [queueCount, setQueueCount] = useState<number | null>(null);

  const remaining = useMemo(() => leads.filter((lead) => !addedUrls.includes(lead.url)), [leads, addedUrls]);

  async function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setLeads([]);
    setAddedUrls([]);
    setQueueCount(null);
    setFileName(file.name);
    try {
      if (file.size > 5_000_000) throw new Error("File is larger than 5 MB. Export a smaller RSS brief.");
      const parsed: unknown = JSON.parse(await file.text());
      const rawItems = Array.isArray(parsed)
        ? parsed
        : parsed && typeof parsed === "object" && Array.isArray((parsed as Record<string, unknown>).items)
          ? (parsed as { items: unknown[] }).items
          : [];
      if (!rawItems.length) throw new Error("No RSS items found. Select news_brief.json, not the Markdown brief.");
      const valid = rawItems.map(normalizeLead).filter((item): item is Lead => item !== null);
      setLeads(valid);
      setMessage(`Loaded ${valid.length} valid leads; ${rawItems.length - valid.length} invalid or incomplete items skipped. Every lead remains UNVERIFIED.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not read this JSON file.");
    } finally {
      event.target.value = "";
    }
  }

  function addLead(lead: Lead) {
    try {
      const raw = localStorage.getItem(STORY_QUEUE_KEY);
      const current: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(current)) throw new Error("The existing local story queue is not a valid list. Export a backup before changing it.");
      const stories = current as LocalStory[];
      const duplicate = stories.some((story) =>
        story.headline?.trim().toLocaleLowerCase() === lead.title.toLocaleLowerCase() ||
        (story.source1 && safeHttpUrl(story.source1) === lead.url)
      );
      if (duplicate) {
        setAddedUrls((items) => [...items, lead.url]);
        setMessage(`Skipped duplicate: “${lead.title}”.`);
        return;
      }
      const summary = lead.description.length >= 21
        ? lead.description
        : `RSS lead imported from ${lead.source}. The feed summary is missing or too short. Open the original source and independently verify all claims before drafting.`;
      const story: LocalStory = {
        id: crypto.randomUUID(),
        headline: lead.title,
        desk: lead.category,
        location: "",
        summary,
        source1: lead.url,
        source2: "",
        status: "Not Verified",
        editor: "",
        createdAt: new Date().toISOString(),
        workflowState: "Draft",
      };
      const next = [story, ...stories];
      localStorage.setItem(STORY_QUEUE_KEY, JSON.stringify(next));
      setAddedUrls((items) => [...items, lead.url]);
      setQueueCount(next.length);
      setMessage(`Added as an unverified draft: “${lead.title}”. Open Story Queue to add corroboration and complete editor review.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save this lead to the local story queue.");
    }
  }

  function addAll() {
    for (const lead of remaining) addLead(lead);
  }

  const inputStyle: React.CSSProperties = {
    display: "block", width: "100%", marginTop: 12, padding: 13,
    border: "1px solid #49617e", borderRadius: 10, background: "#08182c", color: "#e2e8f0",
  };

  return (
    <section className="panel" style={{ marginTop: 18 }}>
      <div className="eyebrow">NEW • RSS TO EDITORIAL QUEUE</div>
      <h2 style={{ margin: "8px 0" }}>Import collected news leads</h2>
      <p className="muted" style={{ fontSize: 12, lineHeight: 1.7 }}>
        Import the JSON brief produced on your Windows PC. Valid leads can be copied into this browser’s existing story queue as Draft / Not Verified. Nothing is published or sent to a server.
      </p>
      <label style={{ display: "block", fontSize: 12, fontWeight: 800, color: "#dbeafe" }}>
        Select news_brief.json
        <input type="file" accept=".json,application/json" onChange={loadFile} style={inputStyle} />
      </label>
      {fileName && <p className="muted" style={{ fontSize: 11 }}>Selected file: {fileName}</p>}
      <div className="proof" role="status" style={{ marginTop: 12 }}>{message}</div>
      {leads.length > 0 && (
        <>
          <div className="rowline" style={{ marginTop: 16, flexWrap: "wrap" }}>
            <strong>{remaining.length} lead(s) not yet imported</strong>
            <button type="button" onClick={addAll} disabled={!remaining.length} style={{ border: 0, borderRadius: 9, padding: "10px 13px", background: remaining.length ? "#d4af37" : "#43536a", color: "#071426", fontWeight: 900 }}>
              Import remaining leads
            </button>
          </div>
          {queueCount !== null && <p className="muted" style={{ fontSize: 11 }}>Current local story queue: {queueCount} record(s).</p>}
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {leads.map((lead) => {
              const imported = addedUrls.includes(lead.url);
              return (
                <article key={lead.id} className="proof" style={{ margin: 0 }}>
                  <div className="rowline" style={{ alignItems: "flex-start" }}>
                    <div style={{ minWidth: 0 }}>
                      <div className="eyebrow">{lead.category} • {lead.source}</div>
                      <h3 style={{ fontSize: 14, lineHeight: 1.5, margin: "7px 0" }}>{lead.title}</h3>
                    </div>
                    <span className={imported ? "status" : "status warn"}>{imported ? "IMPORTED / DUPLICATE" : "UNVERIFIED"}</span>
                  </div>
                  {lead.description && <p className="muted" style={{ fontSize: 12, lineHeight: 1.6 }}>{lead.description}</p>}
                  <div className="rowline" style={{ flexWrap: "wrap" }}>
                    <a href={lead.url} target="_blank" rel="noopener noreferrer" style={{ color: "#d4af37", fontSize: 11 }}>Open original source ↗</a>
                    <button type="button" disabled={imported} onClick={() => addLead(lead)} style={{ border: "1px solid #d4af37", borderRadius: 8, padding: "7px 10px", background: "transparent", color: imported ? "#94a3b8" : "#f5d98c" }}>
                      {imported ? "Already handled" : "Add to story queue"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
      <div className="nav" style={{ marginBottom: 0 }}>
        <a href="/stories">Open editorial story queue →</a>
        <a href="/story-intake">Manual story intake</a>
      </div>
      <p className="muted" style={{ fontSize: 10, lineHeight: 1.6, marginBottom: 0 }}>
        Storage is local to this browser and device. Importing only creates a draft; a human editor must independently verify the original reporting, add corroborating sources and submit it for review. Browser storage is not an authenticated audit trail.
      </p>
    </section>
  );
}
