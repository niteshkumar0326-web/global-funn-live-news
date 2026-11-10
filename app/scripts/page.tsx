import ScriptStudio from "@/components/ScriptStudio";
export default function ScriptsPage(){return <main className="shell">
<header className="topbar"><div className="brand"><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>BILINGUAL SCRIPT STUDIO</div><div className="muted" style={{fontSize:11}}>HINDI • ENGLISH • PRESENTER DESK</div></div></div><a className="pill" href="/">← Newsroom dashboard</a></header>
<section className="hero"><div className="eyebrow">BUILD 16 • PRESENTER WORKFLOW</div><h1>One story.<br/><span className="gold">Two languages.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Prepare English and Hindi presenter scripts, YouTube copy and subtitle lines from editor-entered facts. Review every name, number and attribution before recording.</p></section>
<ScriptStudio/>
<footer className="footer"><span>GLOBAL FUNN LIVE NEWS • SCRIPT STUDIO</span><span>Draft only • Human editorial approval required</span></footer></main>}
