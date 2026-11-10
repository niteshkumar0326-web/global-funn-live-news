import AssignmentDesk from "@/components/AssignmentDesk";
export default function AssignmentsPage(){return <main className="shell">
<header className="topbar"><div className="brand"><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>LIVE ASSIGNMENT DESK</div><div className="muted" style={{fontSize:11}}>REPORTER TASKS • DEADLINES • FOLLOW-UPS</div></div></div><a className="pill" href="/">← Newsroom dashboard</a></header>
<section className="hero"><div className="eyebrow">KHABAR HAR PAL, NAZAR GLOBAL</div><h1>Every assignment.<br/><span className="gold">Clear ownership.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Coordinate reporting tasks, deadlines, evidence requests and desk follow-ups in one operational register.</p></section>
<AssignmentDesk/>
<footer className="footer"><span>GLOBAL FUNN LIVE NEWS • LIVE ASSIGNMENT DESK</span><span>Local prototype • Editorial review remains mandatory</span></footer>
</main>}
