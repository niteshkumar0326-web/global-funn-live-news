"use client";

import { useEffect, useState } from "react";

type Correction = {
  id: string;
  previousHeadline: string;
  correctedHeadline: string;
  reason: string;
  editor: string;
  sourceUrl: string;
  correctedAt: string;
};
type Story = {
  id: string;
  headline: string;
  desk?: string;
  location?: string;
  summary?: string;
  source1?: string;
  source2?: string;
  status?: string;
  editor?: string;
  createdAt?: string;
  corrections?: Correction[];
};

const KEY = "global-funn-newsroom-drafts-v1";

export default function CorrectionHistory() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setStories(parsed.filter((item): item is Story =>
            !!item && typeof item === "object" &&
            typeof (item as Story).id === "string" &&
            typeof (item as Story).headline === "string"
          ));
        }
      }
    } catch {
      // Keep the empty state if local browser data cannot be read.
    }
    setLoaded(true);
  }, []);

  const records = stories.flatMap((story) =>
    (Array.isArray(story.corrections) ? story.corrections : []).map((correction) => ({
      story,
      correction,
    }))
  ).sort((a, b) => Date.parse(b.correction.correctedAt) - Date.parse(a.correction.correctedAt));

  return (
    <section className="panel">
      <div className="rowline">
        <h2>Correction register</h2>
        <span className="tag">{records.length} recorded corrections</span>
      </div>
      <p className="muted" style={{fontSize:12,lineHeight:1.7}}>
        {loaded ? "Reading this browser's local story records." : "Loading local correction records…"}
        {" "}This register is not public and is not synced to other devices.
      </p>
      {!loaded ? <p className="muted">Loading…</p> : records.length === 0 ? (
        <div className="proof">
          No correction records found in this browser. Corrections can be added from the Story Queue. The sample below is not a real correction.
        </div>
      ) : records.map(({story, correction}) => (
        <article className="story" key={correction.id}>
          <div className="rowline">
            <span className="tag">{story.desk || "DESK NOT SET"} • {story.location || "LOCATION NOT SET"}</span>
            <span className="status warn">CORRECTION RECORDED</span>
          </div>
          <h3>{correction.correctedHeadline}</h3>
          <p className="muted" style={{fontSize:12}}>Story ID: {story.id} • {new Date(correction.correctedAt).toLocaleString()}</p>
          <div className="proof">
            <strong>Original headline</strong>
            <p>{correction.previousHeadline}</p>
            <strong>Reason for correction</strong>
            <p>{correction.reason}</p>
            <strong>Editor</strong>
            <p>{correction.editor || "Not recorded"}</p>
            {correction.sourceUrl && <p><a href={correction.sourceUrl} target="_blank" rel="noreferrer" style={{color:"#d4af37"}}>Correction evidence reference</a></p>}
          </div>
        </article>
      ))}
      <p className="muted" style={{fontSize:11}}>A browser-local transparency aid only. Export backups regularly. This is not a tamper-proof audit log.</p>
    </section>
  );
}
