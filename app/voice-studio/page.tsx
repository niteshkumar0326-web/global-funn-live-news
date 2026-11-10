import VoiceStudio from "@/components/VoiceStudio";
export default function VoiceStudioPage(){return <main className="shell">
<header className="topbar"><div className="brand"><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>AI VOICE & SUBTITLE DESK</div><div className="muted" style={{fontSize:11}}>VOICE-OVER • PRONUNCIATION • SCRIPT PREP</div></div></div><a className="pill" href="/">← Newsroom dashboard</a></header>
<section className="hero"><div className="eyebrow">BUILD 22 • PRESENTER AUDIO WORKFLOW</div><h1>Give every story<br/><span className="gold">a clear voice.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Prepare presenter voice-over scripts, preview device voices, standardise difficult names and export a recording-ready script.</p></section>
<VoiceStudio/>
<footer className="footer"><span>GLOBAL FUNN LIVE NEWS • VOICE STUDIO</span><span>Browser speech preview • Editorial review required</span></footer>
</main>}
