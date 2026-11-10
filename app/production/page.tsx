import VideoProductionWorkspace from "@/components/VideoProductionWorkspace";
export default function ProductionPage(){return <main className="shell">
<header className="topbar"><div className="brand"><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>VIDEO PRODUCTION WORKSPACE</div><div className="muted" style={{fontSize:11}}>PLAN • PREPARE • REVIEW</div></div></div><a className="pill" href="/">← Newsroom dashboard</a></header>
<section className="hero"><div className="eyebrow">BUILD 20 • PRODUCTION CONTROL</div><h1>One production flow.<br/><span className="gold">Every desk connected.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Coordinate story evidence, editorial sign-off, scripts, presenter identity, graphics and media rights from one production checklist. Open each existing desk as you work.</p></section>
<VideoProductionWorkspace/>
<footer className="footer"><span>GLOBAL FUNN LIVE NEWS • VIDEO PRODUCTION</span><span>Human editorial approval remains mandatory</span></footer>
</main>}
