"use client";

import { useEffect, useState } from "react";

type Story = { id?: string; status?: string; corrections?: unknown[] };
type Rundown = { segments?: unknown[] };

const STORY_KEY = "global-funn-newsroom-drafts-v1";
const RUNDOWN_KEY = "global-funn-broadcast-rundown-v1";

export default function NewsroomControlCentre() {
  const [stats, setStats] = useState({ drafts: 0, corrections: 0, segments: 0, loaded: false });

  useEffect(() => {
    try {
      const rawStories = localStorage.getItem(STORY_KEY);
      const stories: Story[] = rawStories ? JSON.parse(rawStories) : [];
      const safeStories = Array.isArray(stories) ? stories : [];
      const corrections = safeStories.reduce((sum, story) =>
        sum + (Array.isArray(story?.corrections) ? story.corrections.length : 0), 0);
      const rawRundown = localStorage.getItem(RUNDOWN_KEY);
      const rundown: Rundown = rawRundown ? JSON.parse(rawRundown) : {};
      setStats({
        drafts: safeStories.length,
        corrections,
        segments: Array.isArray(rundown?.segments) ? rundown.segments.length : 0,
        loaded: true,
      });
    } catch {
      setStats({ drafts: 0, corrections: 0, segments: 0, loaded: true });
    }
  }, []);

  const metrics = [
    { value: stats.loaded ? String(stats.drafts).padStart(2, "0") : "…", label: "Local story drafts" },
    { value: stats.loaded ? String(stats.corrections).padStart(2, "0") : "…", label: "Correction records" },
    { value: stats.loaded ? String(stats.segments).padStart(2, "0") : "…", label: "Broadcast segments" },
  ];

  return (
    <section className="panel" style={{ marginBottom: 16 }}>
      <div className="rowline">
        <div><div className="eyebrow">NEWSROOM CONTROL CENTRE</div><h2 style={{ margin: "7px 0 0" }}>Your local workspace</h2></div>
        <span className="status warn">BROWSER DATA ONLY</span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12, marginTop: 16 }}>
        {metrics.map((metric) => (
          <div className="proof" key={metric.label} style={{ margin: 0 }}>
            <div className="stat">{metric.value}</div><div className="statlabel">{metric.label}</div>
          </div>
        ))}
      </div>
      <p className="muted" style={{ fontSize: 11, lineHeight: 1.6, marginBottom: 0 }}>
        Counts are read from this browser only. They are not live server totals. A draft or correction count does not indicate verification or publication approval.
      </p>
      <div className="nav" style={{ marginBottom: 0 }}>
        <a href="/story-intake">+ New story</a>
        <a href="/stories">Review queue</a>
        <a href="/verification">Verification checks</a>
        <a href="/archive">Correction register</a>
        <a href="/broadcast">Prepare bulletin</a>
      </div>
    </section>
  );
}
