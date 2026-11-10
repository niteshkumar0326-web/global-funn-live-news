import NewsGraphicsStudio from "@/components/NewsGraphicsStudio";
export default function GraphicsPage(){return <main className="shell">
 <header className="topbar"><div className="brand"><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>NEWS GRAPHICS STUDIO</div><div className="muted" style={{fontSize:11}}>EDITORIAL DESIGN WORKSPACE</div></div></div><a className="pill" href="/">← Newsroom dashboard</a></header>
 <section className="hero"><div className="eyebrow">BUILD 14 • VISUAL DESK</div><h1>Make every update <span className="gold">clear.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Create consistent headline graphics for square posts, landscape bulletins and vertical stories. Always check the evidence and secure editor sign-off before sharing.</p></section>
 <NewsGraphicsStudio/>
 <footer className="footer"><span>GLOBAL FUNN LIVE NEWS • GRAPHICS STUDIO</span><span>Preview only • No automatic publishing</span></footer>
 </main>}
