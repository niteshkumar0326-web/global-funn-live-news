"use client";

import { useEffect, useMemo, useState } from "react";

type Sample = {
  id: string;
  date: string;
  task: string;
  model: string;
  workflow: string;
  baselineTokens: number;
  optimizedTokens: number;
  baselineBytes: number;
  optimizedBytes: number;
  baselineQuality: number;
  optimizedQuality: number;
  notes: string;
};

const KEY = "global-funn-token-benchmark-v1";
const inputStyle: React.CSSProperties = { width: "100%", background: "#0b1524", color: "#e5edf8", border: "1px solid #344b68", borderRadius: 9, padding: 11, font: "inherit", boxSizing: "border-box" };
const panelStyle: React.CSSProperties = { background: "#101d30", border: "1px solid #263c59", borderRadius: 14, padding: 16 };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, color: "#a9bad0", marginBottom: 6 };
const buttonStyle: React.CSSProperties = { background: "#d9ad62", color: "#101827", border: 0, borderRadius: 9, padding: "11px 15px", minHeight: 42, fontWeight: 800, cursor: "pointer" };

function csvCell(value: string | number) {
  return '"' + String(value).replace(/"/g, '""') + '"';
}

export default function TokenBenchmark() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [task, setTask] = useState("");
  const [model, setModel] = useState("ChatGPT");
  const [workflow, setWorkflow] = useState("Baseline vs compressed");
  const [baselineTokens, setBaselineTokens] = useState("");
  const [optimizedTokens, setOptimizedTokens] = useState("");
  const [baselineBytes, setBaselineBytes] = useState("");
  const [optimizedBytes, setOptimizedBytes] = useState("");
  const [baselineQuality, setBaselineQuality] = useState("5");
  const [optimizedQuality, setOptimizedQuality] = useState("5");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSamples(parsed);
      }
    } catch { /* Keep the tracker usable if stored data is malformed. */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(samples));
    } catch {
      setMessage("Browser storage is full or unavailable. Export your CSV backup.");
    }
  }, [samples, loaded]);

  const totals = useMemo(() => {
    const base = samples.reduce((n, s) => n + s.baselineTokens, 0);
    const after = samples.reduce((n, s) => n + s.optimizedTokens, 0);
    const baseBytes = samples.reduce((n, s) => n + s.baselineBytes, 0);
    const afterBytes = samples.reduce((n, s) => n + s.optimizedBytes, 0);
    const qualityDelta = samples.length ? samples.reduce((n, s) => n + s.optimizedQuality - s.baselineQuality, 0) / samples.length : 0;
    return { base, after, saved: base - after, percent: base > 0 ? ((base - after) / base) * 100 : 0, baseBytes, afterBytes, bytePercent: baseBytes > 0 ? ((baseBytes - afterBytes) / baseBytes) * 100 : 0, qualityDelta };
  }, [samples]);

  const visible = filter === "all" ? samples : samples.filter(s => s.model === filter);

  function addSample(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nums = [baselineTokens, optimizedTokens, baselineBytes, optimizedBytes, baselineQuality, optimizedQuality].map(Number);
    if (!task.trim() || nums.some(n => !Number.isFinite(n) || n < 0) || Number(baselineQuality) > 5 || Number(optimizedQuality) > 5) {
      setMessage("Enter a task and valid non-negative numbers. Quality scores must be between 0 and 5.");
      return;
    }
    const sample: Sample = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
      date: new Date().toISOString(),
      task: task.trim(),
      model,
      workflow,
      baselineTokens: nums[0],
      optimizedTokens: nums[1],
      baselineBytes: nums[2],
      optimizedBytes: nums[3],
      baselineQuality: nums[4],
      optimizedQuality: nums[5],
      notes: notes.trim(),
    };
    setSamples(current => [sample, ...current]);
    setTask(""); setBaselineTokens(""); setOptimizedTokens(""); setBaselineBytes(""); setOptimizedBytes(""); setNotes("");
    setMessage("Benchmark saved on this device.");
  }

  function exportCsv() {
    const header = ["Date", "Task", "Model", "Workflow", "Baseline tokens", "After tokens", "Token saving", "Saving percent", "Baseline output bytes", "After output bytes", "Baseline quality / 5", "After quality / 5", "Notes"];
    const rows = samples.map(s => [s.date, s.task, s.model, s.workflow, s.baselineTokens, s.optimizedTokens, s.baselineTokens - s.optimizedTokens, s.baselineTokens ? ((s.baselineTokens - s.optimizedTokens) / s.baselineTokens * 100).toFixed(1) : 0, s.baselineBytes, s.optimizedBytes, s.baselineQuality, s.optimizedQuality, s.notes].map(csvCell).join(","));
    const blob = new Blob([[header.map(csvCell).join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "global-funn-token-benchmark.csv"; a.click(); URL.revokeObjectURL(url);
    setMessage("CSV exported.");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ app: "GLOBAL FUNN Token Benchmark", exportedAt: new Date().toISOString(), samples }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "global-funn-token-benchmark.json"; a.click(); URL.revokeObjectURL(url);
    setMessage("JSON backup exported.");
  }

  return <main style={{ maxWidth: 1050, margin: "0 auto", padding: "24px 16px 60px", color: "#e5edf8" }}>
    <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
      <div><div style={{ color: "#d9ad62", fontSize: 12, fontWeight: 900, letterSpacing: 2 }}>GLOBAL FUNN • BUILD 33</div><h1 style={{ fontSize: "clamp(28px,5vw,42px)", margin: "8px 0" }}>Token Savings Benchmark</h1><p style={{ color: "#9fb0c5", lineHeight: 1.6, margin: 0 }}>Measure actual usage before and after context compression. No guessed savings claims.</p></div>
      <a href="/" style={{ color: "#d9ad62", textDecoration: "none", fontWeight: 700 }}>← Newsroom home</a>
    </header>

    <section style={{ ...panelStyle, marginTop: 18 }}>
      <div style={{ color: "#d9ad62", fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>MEASURED RESULTS • ALL SAVED SAMPLES</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 10, marginTop: 12 }}>
        {[["Samples", String(samples.length)], ["Tokens saved", totals.saved.toLocaleString()], ["Token reduction", totals.percent.toFixed(1) + "%"], ["Output bytes reduced", totals.bytePercent.toFixed(1) + "%"], ["Quality change", (totals.qualityDelta > 0 ? "+" : "") + totals.qualityDelta.toFixed(2) + " / 5"]].map(([k,v]) => <div key={k} style={{ background: "#0b1524", borderRadius: 10, padding: 13 }}><div style={{ color: "#9fb0c5", fontSize: 12 }}>{k}</div><div style={{ fontSize: 23, fontWeight: 900, marginTop: 5 }}>{v}</div></div>)}
      </div>
      <p style={{ color: "#9fb0c5", fontSize: 12, lineHeight: 1.6, marginBottom: 0 }}>Totals are based only on the measurements you enter. Compare similar tasks, same model and comparable quality ratings. Lower token count alone is not a win if answer quality falls.</p>
    </section>

    <section style={{ ...panelStyle, marginTop: 16 }}>
      <h2 style={{ marginTop: 0 }}>Record a benchmark</h2>
      <form onSubmit={addSample}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12 }}>
          <label style={labelStyle}>Task / test case<input required value={task} onChange={e => setTask(e.target.value)} placeholder="e.g. Fix a dashboard bug" style={{ ...inputStyle, marginTop: 6 }}/></label>
          <label style={labelStyle}>AI / model<input value={model} onChange={e => setModel(e.target.value)} placeholder="ChatGPT, Claude..." style={{ ...inputStyle, marginTop: 6 }}/></label>
          <label style={labelStyle}>Workflow<select value={workflow} onChange={e => setWorkflow(e.target.value)} style={{ ...inputStyle, marginTop: 6 }}><option>Baseline vs compressed</option><option>ChatGPT context pack</option><option>Claude + Headroom MCP</option><option>Claude + Headroom proxy</option><option>Code Review Graph targeted context</option><option>Other</option></select></label>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 14 }}>
          <label style={labelStyle}>Baseline input tokens<input required type="number" min="0" value={baselineTokens} onChange={e => setBaselineTokens(e.target.value)} style={{ ...inputStyle, marginTop: 6 }}/></label>
          <label style={labelStyle}>After-tool input tokens<input required type="number" min="0" value={optimizedTokens} onChange={e => setOptimizedTokens(e.target.value)} style={{ ...inputStyle, marginTop: 6 }}/></label>
          <label style={labelStyle}>Baseline tool-output bytes<input required type="number" min="0" value={baselineBytes} onChange={e => setBaselineBytes(e.target.value)} style={{ ...inputStyle, marginTop: 6 }}/></label>
          <label style={labelStyle}>After-tool output bytes<input required type="number" min="0" value={optimizedBytes} onChange={e => setOptimizedBytes(e.target.value)} style={{ ...inputStyle, marginTop: 6 }}/></label>
          <label style={labelStyle}>Baseline answer quality (0–5)<input required type="number" min="0" max="5" step="0.5" value={baselineQuality} onChange={e => setBaselineQuality(e.target.value)} style={{ ...inputStyle, marginTop: 6 }}/></label>
          <label style={labelStyle}>After-tool answer quality (0–5)<input required type="number" min="0" max="5" step="0.5" value={optimizedQuality} onChange={e => setOptimizedQuality(e.target.value)} style={{ ...inputStyle, marginTop: 6 }}/></label>
        </div>
        <label style={{ ...labelStyle, marginTop: 14 }}>Notes<textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Same task? What changed? Any missing evidence or errors?" style={{ ...inputStyle, marginTop: 6 }}/></label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 12 }}><button type="submit" style={buttonStyle}>Save benchmark</button><button type="button" onClick={exportCsv} style={{ ...buttonStyle, background: "#1a3049", color: "#e5edf8", border: "1px solid #35506e" }}>Export CSV</button><button type="button" onClick={exportJson} style={{ ...buttonStyle, background: "#1a3049", color: "#e5edf8", border: "1px solid #35506e" }}>Backup JSON</button></div>
        {message && <p role="status" aria-live="polite" style={{ color: "#8ee0b2", fontSize: 13 }}>{message}</p>}
      </form>
    </section>

    <section style={{ ...panelStyle, marginTop: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10, alignItems: "center" }}><h2 style={{ margin: 0 }}>Benchmark history</h2><select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 150 }}><option value="all">All models</option>{Array.from(new Set(samples.map(s => s.model))).map(m => <option key={m} value={m}>{m}</option>)}</select></div>
      {visible.length === 0 ? <p style={{ color: "#9fb0c5", fontSize: 13 }}>No benchmark samples yet. Enter the same task's before/after measurements to start a reliable comparison.</p> : <div style={{ overflowX: "auto", marginTop: 12 }}><table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 680 }}><thead><tr>{["Date / task", "Model", "Tokens before → after", "Saved", "Quality before → after", "Action"].map(h => <th key={h} style={{ textAlign: "left", padding: 9, borderBottom: "1px solid #344b68", color: "#a9bad0" }}>{h}</th>)}</tr></thead><tbody>{visible.map(s => <tr key={s.id}><td style={{ padding: 9, borderBottom: "1px solid #263c59" }}>{new Date(s.date).toLocaleDateString()}<br/><span style={{ color: "#9fb0c5" }}>{s.task}</span></td><td style={{ padding: 9, borderBottom: "1px solid #263c59" }}>{s.model}</td><td style={{ padding: 9, borderBottom: "1px solid #263c59", whiteSpace: "nowrap" }}>{s.baselineTokens.toLocaleString()} → {s.optimizedTokens.toLocaleString()}</td><td style={{ padding: 9, borderBottom: "1px solid #263c59" }}>{s.baselineTokens ? (((s.baselineTokens-s.optimizedTokens)/s.baselineTokens)*100).toFixed(1) : "—"}%</td><td style={{ padding: 9, borderBottom: "1px solid #263c59" }}>{s.baselineQuality} → {s.optimizedQuality}</td><td style={{ padding: 9, borderBottom: "1px solid #263c59" }}><button type="button" onClick={() => setSamples(current => current.filter(x => x.id !== s.id))} style={{ background: "transparent", color: "#f3a7a7", border: "1px solid #77434a", borderRadius: 7, padding: "6px 9px", cursor: "pointer" }}>Delete</button></td></tr>)}</tbody></table></div>}
    </section>
    <p style={{ color: "#9fb0c5", fontSize: 12, lineHeight: 1.7, marginTop: 16 }}>Privacy: records are stored in this browser's localStorage only. No account data is fetched, no API key is requested, and no data is sent to GLOBAL FUNN servers. Clear browser storage only after exporting a backup.</p>
  </main>;
}
