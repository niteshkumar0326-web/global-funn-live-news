import BroadcastRundown from "@/components/BroadcastRundown";
export default function BroadcastPage(){return <main className="shell">
  <header className="topbar"><a href="/" className="brand" style={{textDecoration:"none",color:"inherit"}}><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>LIVE NEWS</div><div className="muted" style={{fontSize:11}}>BROADCAST DESK</div></div></a><div className="rowline"><a href="/" className="pill">← Newsroom</a><span className="pill">PRESENTER WORKSPACE</span></div></header>
  <section className="hero"><div className="eyebrow">KHABAR HAR PAL, NAZAR GLOBAL</div><h1>Broadcast <span className="gold">control.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Arrange approved story drafts into a timed programme, prepare presenter scripts and export a readable rundown. Nothing is published automatically.</p></section>
  <BroadcastRundown/>
  <footer className="footer"><span>GLOBAL FUNN LIVE NEWS • BROADCAST DESK</span><span>Editorial approval required before transmission</span></footer>
</main>}
