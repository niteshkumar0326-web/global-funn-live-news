import ShiftHandover from "@/components/ShiftHandover";
export default function HandoverPage(){return <main className="shell">
<header className="topbar"><div className="brand"><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>SHIFT HANDOVER</div><div className="muted" style={{fontSize:11}}>EDITORIAL CONTINUITY • INDIA • WORLD</div></div></div><a className="pill" href="/">← Newsroom dashboard</a></header>
<section className="hero"><div className="eyebrow">KHABAR HAR PAL, NAZAR GLOBAL</div><h1>One shift ends.<br/><span className="gold">The next stays informed.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Record developing stories, unresolved questions, desk assignments and next actions in one clear handover.</p></section>
<ShiftHandover/>
<footer className="footer"><span>GLOBAL FUNN LIVE NEWS • SHIFT HANDOVER</span><span>Local editorial workflow • Human review required</span></footer>
</main>}
