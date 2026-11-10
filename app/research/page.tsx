import EvidenceWorkbench from "@/components/EvidenceWorkbench";
export default function ResearchPage(){return <main className="shell">
<header className="topbar"><div className="brand"><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>AI NEWSROOM RESEARCH DESK</div><div className="muted" style={{fontSize:11}}>CLAIM & EVIDENCE WORKSPACE</div></div></div><a className="pill" href="/">← Newsroom dashboard</a></header>
<section className="hero"><div className="eyebrow">BUILD 15 • EDITORIAL RESEARCH</div><h1>Every claim needs <span className="gold">evidence.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Break a developing story into individual factual claims. Record who published each source, what it supports or contradicts and what still needs checking.</p></section>
<EvidenceWorkbench/>
<footer className="footer"><span>GLOBAL FUNN LIVE NEWS • RESEARCH DESK</span><span>Human verification required • No automatic fact-checking</span></footer></main>}
