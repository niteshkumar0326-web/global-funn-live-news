import PresenterSceneStudio from "@/components/PresenterSceneStudio";
export default function PresenterScenesPage(){return <main className="shell">
<header className="topbar"><div className="brand"><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>PRESENTER SCENE STUDIO</div><div className="muted" style={{fontSize:11}}>PRESENTER • LOWER THIRDS • SCENE RUNDOWN</div></div></div><a className="pill" href="/">← Newsroom dashboard</a></header>
<section className="hero"><div className="eyebrow">BUILD 23 • PRESENTER PRODUCTION</div><h1>Your identity.<br/><span className="gold">Every scene.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Create presenter-led scene layouts using the photo and identity already saved in Presenter Studio. Prepare headlines, supporting lines, lower thirds and a production scene list.</p></section>
<PresenterSceneStudio/>
<footer className="footer"><span>GLOBAL FUNN LIVE NEWS • PRESENTER SCENE STUDIO</span><span>Profile photo remains local • Editorial approval required</span></footer>
</main>}
