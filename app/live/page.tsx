export default function LivePage() {
  return <main className="shell">
    <header className="topbar">
      <a href="/" className="brand" style={{textDecoration:"none",color:"inherit"}}>
        <div className="mark">GF</div>
        <div>
          <div className="eyebrow">GLOBAL FUNN</div>
          <div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>LIVE NEWS</div>
          <div className="muted" style={{fontSize:11}}>OFFICIAL CHANNEL • LIVE DESK</div>
        </div>
      </a>
      <a href="https://www.youtube.com/@niteshkumar0326/live" target="_blank" rel="noreferrer" className="pill">Open YouTube Live ↗</a>
    </header>

    <section className="hero">
      <div className="eyebrow">CHANNEL BROADCAST</div>
      <h1>Watch <span className="gold">GLOBAL FUNN</span> live.</h1>
      <p className="muted" style={{maxWidth:700,lineHeight:1.7}}>
        This page will not replay an old archived broadcast as if it were live.
        Start a new broadcast in YouTube Studio, then open the official channel Live page.
      </p>
    </section>

    <section className="panel">
      <div className="rowline" style={{marginBottom:12,flexWrap:"wrap"}}>
        <h2 style={{margin:0}}>GLOBAL FUNN • Live News</h2>
        <span className="status warn">WAITING FOR A NEW LIVE BROADCAST</span>
      </div>
      <div style={{position:"relative",width:"100%",aspectRatio:"16 / 9",background:"#05070b",borderRadius:14,overflow:"hidden",display:"grid",placeItems:"center",padding:24,textAlign:"center"}}>
        <div>
          <div className="eyebrow" style={{marginBottom:12}}>LIVE PLAYER STANDBY</div>
          <h2 style={{margin:"0 0 10px"}}>No replay is being shown.</h2>
          <p className="muted" style={{maxWidth:560,lineHeight:1.7,margin:"0 auto 18px"}}>
            The previous archived video has intentionally been removed from this player.
            When a new live event is started, watch it on the official YouTube Live page.
          </p>
          <a href="https://www.youtube.com/@niteshkumar0326/live" target="_blank" rel="noreferrer" className="pill">Check current channel live ↗</a>
        </div>
      </div>
      <div className="rowline" style={{marginTop:14,flexWrap:"wrap"}}>
        <p className="muted" style={{fontSize:12,lineHeight:1.6,margin:0}}>
          For the latest uploaded videos, visit the channel Videos tab. This page does not claim a broadcast is live until YouTube shows an active event.
        </p>
        <a href="https://www.youtube.com/@niteshkumar0326/videos" target="_blank" rel="noreferrer" className="pill">Latest channel videos ↗</a>
      </div>
    </section>

    <footer className="footer">
      <span>GLOBAL FUNN LIVE NEWS</span>
      <span>Official channel links • Archived replays are not presented as live</span>
    </footer>
  </main>;
}
