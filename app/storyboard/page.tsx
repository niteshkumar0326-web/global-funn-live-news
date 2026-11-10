import StoryboardPlanner from "@/components/StoryboardPlanner";
export default function StoryboardPage(){return <main className="shell">
<header className="topbar"><div className="brand"><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>NEWSROOM STORYBOARD</div><div className="muted" style={{fontSize:11}}>SHOT PLAN • NARRATION • EDIT HAND-OFF</div></div></div><a className="pill" href="/">← Newsroom dashboard</a></header>
<section className="hero"><div className="eyebrow">BUILD 24 • VIDEO PRODUCTION</div><h1>Plan every shot.<br/><span className="gold">Tell every story.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Turn your approved script and presenter scenes into an ordered visual plan for the editor and production team.</p></section>
<StoryboardPlanner/>
<footer className="footer"><span>GLOBAL FUNN LIVE NEWS • STORYBOARD PLANNER</span><span>Browser-local planning • Editorial approval required</span></footer>
</main>}
