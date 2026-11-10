import VerificationChecklist from "@/components/VerificationChecklist";

export default function Verification(){
 return <main className="shell">
  <header className="topbar"><a href="/" style={{color:"#d4af37",textDecoration:"none",fontWeight:800}}>← GLOBAL FUNN NEWSROOM</a><span className="pill">EDITORIAL QUALITY CONTROL</span></header>
  <section className="hero"><div className="eyebrow">SOURCE PROOF • HUMAN REVIEW</div><h1>Verify before <span className="gold">you publish.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>A structured review guide for editors. A submitted URL is a lead to inspect, not proof by itself. This page is a checklist, not an automated fact-checking service.</p></section>
  <div className="grid">
   <VerificationChecklist/>
   <aside className="side panel"><h2>On-screen proof card</h2><div className="eyebrow">GLOBAL FUNN • SAMPLE ONLY</div><h3>Story headline</h3><p className="muted">Location • event date • publication time with timezone</p><div className="story"><strong>Source 1</strong><p className="muted">Publisher / document title / URL / accessed time</p></div><div className="story"><strong>Source 2</strong><p className="muted">Independent corroboration or explanation why unavailable</p></div><span className="status warn">NOT VERIFIED — SAMPLE CARD</span><p className="muted" style={{fontSize:12,lineHeight:1.7}}>Do not use this sample as a real report. Replace every field with checked evidence.</p></aside>
  </div>
  <footer className="footer">GLOBAL FUNN LIVE NEWS • NO PROOF, NO VERIFIED-NEWS PUBLICATION</footer>
 </main>;
}
