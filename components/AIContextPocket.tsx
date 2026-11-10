"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "global-funn-ai-context-pocket-v1";
const PROJECT_CONTEXT = `GLOBAL FUNN LIVE NEWS
Purpose: source-led newsroom workspace. Stack: Next.js App Router, React, TypeScript, Tailwind.
Rules: never invent facts/sources/quotes; keep evidence visible; human editorial approval before publication. Do not add paid APIs, cloud DB/auth, public publishing, social posting or messaging without explicit approval. Never commit secrets, private photos or user media.
Data: most modules use browser localStorage; Media Library uses IndexedDB. Not automatically synced across devices.
Workflow: read docs/AI_CONTEXT_INDEX.md first; then AGENTS.md; inspect only files relevant to this task. Use Code Review Graph minimal context and impact tools when connected. Do not dump the whole repository or full build history. Make small changes and verify with npm run build.
Current stack: Code Review Graph + compact AI context + PR review workflow. Detailed history: docs/PROJECT_STATUS.md (only relevant entry).`;

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 980, margin: "0 auto", padding: "24px 16px 64px", color: "#e5edf8" },
  panel: { background: "#101d30", border: "1px solid #263c59", borderRadius: 16, padding: 18, marginTop: 16 },
  button: { background: "#d9ad62", color: "#101827", border: 0, borderRadius: 10, padding: "12px 15px", fontWeight: 800, cursor: "pointer", minHeight: 44 },
  secondary: { background: "#182b43", color: "#dbe7f5", border: "1px solid #35506e", borderRadius: 10, padding: "11px 14px", fontWeight: 700, cursor: "pointer", minHeight: 44 },
  field: { width: "100%", background: "#0b1524", color: "#e5edf8", border: "1px solid #344b68", borderRadius: 10, padding: 12, font: "inherit", lineHeight: 1.55, boxSizing: "border-box" as const },
  muted: { color: "#9fb0c5", fontSize: 13, lineHeight: 1.65 },
};

export default function AIContextPocket() {
  const [task, setTask] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setTask(typeof parsed.task === "string" ? parsed.task : "");
        setNotes(typeof parsed.notes === "string" ? parsed.notes : "");
      }
    } catch { /* Ignore malformed local-only draft. */ }
  }, []);

  const pack = useMemo(() => [
    PROJECT_CONTEXT,
    notes.trim() ? "USER'S PROJECT NOTES (local to this device):\n" + notes.trim() : "",
    task.trim() ? "CURRENT TASK:\n" + task.trim() : "",
  ].filter(Boolean).join("\n\n"), [notes, task]);

  const prompt = useMemo(() => `Work on GLOBAL FUNN LIVE NEWS. Use this compact context pack; do not reread the whole repository. First inspect only the files required for my task. If Code Review Graph is connected, request minimal task context and change-impact results. Verify graph findings against source. Make the smallest safe change, preserve existing local data formats, and run npm run build. Report changed files, tests, risks and anything that still needs my approval.

${pack}`, [pack]);

  async function copy(value: string, label: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const el = document.createElement("textarea");
        el.value = value;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        const ok = document.execCommand("copy");
        el.remove();
        if (!ok) throw new Error("Copy not available");
      }
      setMessage(label + " copied. Paste it into ChatGPT or Claude.");
    } catch {
      setMessage("Copy unavailable in this browser. Use Download pack or select the text manually.");
    }
  }

  function saveDraft() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ task, notes, savedAt: new Date().toISOString() }));
      setSaved(true);
      setMessage("Draft saved on this device only.");
    } catch {
      setMessage("This browser could not save local storage. You can still download the pack.");
    }
  }

  function downloadPack() {
    const blob = new Blob([JSON.stringify({ app: "GLOBAL FUNN AI Context Pocket", createdAt: new Date().toISOString(), context: PROJECT_CONTEXT, notes, task, prompt }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "global-funn-ai-context-pack.json";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Context pack downloaded.");
  }

  return <main style={styles.page}>
    <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div><div style={{ color: "#d9ad62", fontSize: 12, fontWeight: 900, letterSpacing: 2 }}>GLOBAL FUNN • BUILD 32</div><h1 style={{ fontSize: "clamp(27px,5vw,42px)", lineHeight: 1.1, margin: "9px 0" }}>AI Context Pocket</h1><p style={styles.muted}>Your compact project memory — ready to copy from mobile or desktop into ChatGPT and Claude.</p></div>
      <a href="/" style={{ color: "#d9ad62", textDecoration: "none", fontWeight: 700 }}>← Newsroom home</a>
    </header>

    <section style={styles.panel}>
      <div style={{ color: "#d9ad62", fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>STEP 1 • TASK</div>
      <h2 style={{ margin: "8px 0" }}>What should the AI work on?</h2>
      <textarea value={task} onChange={e => { setTask(e.target.value); setSaved(false); }} rows={4} placeholder="Example: Fix mobile navigation overflow on the newsroom dashboard. Do not change other modules." style={styles.field}/>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        <button style={styles.secondary} onClick={() => setTask("Review the latest changes, identify the real build or type errors, fix only confirmed problems, and verify the production build.")}>Review & fix build</button>
        <button style={styles.secondary} onClick={() => setTask("Improve the mobile experience of the requested screen. Preserve desktop layout, existing data and all editorial safeguards. Test responsive behavior.")}>Mobile improvement</button>
        <button style={styles.secondary} onClick={() => setTask("Continue the next logical GLOBAL FUNN build. Inspect the compact context index and only relevant files. Implement, document and verify the feature.")}>Continue the build</button>
      </div>
    </section>

    <section style={styles.panel}>
      <div style={{ color: "#d9ad62", fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>STEP 2 • OPTIONAL MEMORY</div>
      <h2 style={{ margin: "8px 0" }}>Add only the details AI must remember</h2>
      <textarea value={notes} onChange={e => { setNotes(e.target.value); setSaved(false); }} rows={3} placeholder="Decisions, constraints, current bug, or a short handover. Avoid passwords and API keys." style={styles.field}/>
      <p style={styles.muted}>Notes and task draft are stored only in this browser on this device. They are not uploaded to GitHub or synced automatically.</p>
      <button style={styles.secondary} onClick={saveDraft}>Save on this device</button>
      {saved && <span style={{ marginLeft: 10, color: "#8ee0b2", fontSize: 12 }}>Saved locally</span>}
    </section>

    <section style={styles.panel}>
      <div style={{ color: "#d9ad62", fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>STEP 3 • USE ON ANY DEVICE</div>
      <h2 style={{ margin: "8px 0" }}>Compact AI handover</h2>
      <p style={styles.muted}>Copy this prompt and paste it into ChatGPT mobile, ChatGPT desktop, or Claude. No local MCP connection is needed for this handover.</p>
      <div style={{ background: "#0b1524", border: "1px solid #344b68", borderRadius: 10, padding: 12, maxHeight: 220, overflow: "auto", whiteSpace: "pre-wrap", fontSize: 12, lineHeight: 1.6 }}>{prompt}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 12 }}>
        <button style={styles.button} onClick={() => copy(prompt, "AI task prompt")}>Copy AI task prompt</button>
        <button style={styles.secondary} onClick={() => copy(pack, "Context pack")}>Copy context only</button>
        <button style={styles.secondary} onClick={downloadPack}>Download JSON pack</button>
      </div>
      {message && <p role="status" aria-live="polite" style={{ color: "#8ee0b2", fontSize: 13, marginBottom: 0 }}>{message}</p>}
    </section>

    <section style={styles.panel}>
      <div style={{ color: "#d9ad62", fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>WHAT THIS DOES / DOES NOT DO</div>
      <ul style={{ ...styles.muted, paddingLeft: 20 }}>
        <li>Reduces repeated project explanations by sharing one compact, reusable context pack.</li>
        <li>Works in a mobile browser and desktop browser using copy, local save and JSON download.</li>
        <li>Does not read mobile ChatGPT/Claude usage meters or alter subscription limits.</li>
        <li>Does not connect the phone to your desktop's local MCP, terminal, private files or graph database.</li>
        <li>For true cross-device persistence, a user-approved cloud sync or private hosted endpoint would be needed; not enabled here.</li>
      </ul>
    </section>
  </main>;
}
