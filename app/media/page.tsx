import MediaLibrary from "@/components/MediaLibrary";
export default function MediaPage(){return <main className="shell">
<header className="topbar"><div className="brand"><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>NEWSROOM MEDIA LIBRARY</div><div className="muted" style={{fontSize:11}}>BRAND • PRESENTER • EDITORIAL ASSETS</div></div></div><a className="pill" href="/">← Newsroom dashboard</a></header>
<section className="hero"><div className="eyebrow">BUILD 17 • MEDIA DESK</div><h1>One library.<br/><span className="gold">Clear permissions.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Organise approved logos, presenter photos, graphics, source documents and reusable newsroom files. Rights and editorial status stay visible beside every asset.</p></section>
<MediaLibrary/>
<footer className="footer"><span>GLOBAL FUNN LIVE NEWS • MEDIA LIBRARY</span><span>Local browser storage • No cloud upload</span></footer></main>}
