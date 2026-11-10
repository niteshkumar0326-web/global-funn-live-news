"use client";

import { useEffect, useMemo, useState } from "react";

const checks = [
  "Open every source link and confirm it resolves to the cited material",
  "Check the publication date, event date, location and original context",
  "Compare the claim against an independent credible source where appropriate",
  "Separate confirmed facts from allegations, official claims and analysis",
  "Check images and video for original date, location and manipulation",
  "Record editor name, decision, timestamp and any unresolved uncertainty",
];

const STORAGE_KEY = "global-funn-verification-checklist-v1";

export default function VerificationChecklist() {
  const [done, setDone] = useState<boolean[]>(checks.map(() => false));
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === checks.length) {
          setDone(parsed.map((value) => value === true));
        }
      }
    } catch {
      // Keep the safe, unchecked defaults if local browser data is unreadable.
    }
    setLoaded(true);
  }, []);

  const completed = useMemo(() => done.filter(Boolean).length, [done]);

  function toggle(index: number) {
    const next = done.map((value, i) => (i === index ? !value : value));
    setDone(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // The checklist remains usable for this session if storage is unavailable.
    }
  }

  function reset() {
    const next = checks.map(() => false);
    setDone(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // No-op: state is still reset in this session.
    }
  }

  return (
    <section className="wide panel">
      <div className="rowline">
        <h2>Editor verification checklist</h2>
        <span className="tag">{completed}/{checks.length} checks completed</span>
      </div>
      <div aria-label="Checklist progress" style={{height:8,background:"#17263b",borderRadius:99,overflow:"hidden",marginTop:12}}>
        <div style={{height:"100%",width:`${(completed / checks.length) * 100}%`,background:"#d4af37",transition:"width .2s"}} />
      </div>
      <p className="muted" style={{fontSize:12,lineHeight:1.7}}>
        {loaded ? "Checklist progress is saved in this browser only." : "Loading saved checklist…"} Completing these checks does not automatically verify or approve a story.
      </p>
      <div style={{display:"grid",gap:12,marginTop:18}}>
        {checks.map((item,index)=>(
          <label key={item} className="proof" style={{display:"flex",gap:12,alignItems:"flex-start",cursor:"pointer",opacity:done[index]?0.82:1}}>
            <input type="checkbox" checked={done[index]} onChange={()=>toggle(index)} style={{marginTop:3,accentColor:"#d4af37",width:18,height:18}} />
            <span>
              <strong style={{color:"#dce7f5"}}>{String(index+1).padStart(2,"0")}</strong>
              <span style={{display:"block",marginTop:4,textDecoration:done[index]?"line-through":"none"}}>{item}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="rowline" style={{marginTop:18}}>
        <span className="muted" style={{fontSize:12}}>Checklist only • no automatic fact-checking or publishing</span>
        <button type="button" onClick={reset} style={{border:"1px solid #52647a",borderRadius:8,padding:"8px 11px",background:"transparent",color:"#dce7f5"}}>Reset checklist</button>
      </div>
      {completed === checks.length && (
        <div className="proof" role="status" style={{marginTop:14}}>
          <strong>Review checklist complete.</strong>
          <p style={{marginBottom:0}}>A human editor must still independently decide the story status and approve publication. Keep it Not Verified until that decision is recorded in the newsroom workflow.</p>
        </div>
      )}
    </section>
  );
}
