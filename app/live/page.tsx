const CHANNEL_ID = "UCLXPISTr2HJnusqycn4Wyog";
export default function LivePage() {
  const playerUrl = `https://www.youtube.com/embed/live_stream?channel=${CHANNEL_ID}&controls=1&playsinline=1&rel=0`;
  return <main className="shell">
    <header className="topbar">
      <a href="/" className="brand" style={{textDecoration:"none",color:"inherit"}}><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>LIVE NEWS</div><div className="muted" style={{fontSize:11}}>LIVE PLAYER • OFFICIAL CHANNEL</div></div></a>
      <a href="https://www.youtube.com/@niteshkumar0326/live" target="_blank" rel="noreferrer" className="pill">Open YouTube Live ↗</a>
    </header>
    <section className="hero"><div className="eyebrow">CHANNEL BROADCAST</div><h1>Watch <span className="gold">GLOBAL FUNN</span> live.</h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>This player loads the channel's current YouTube live broadcast. If no live event is running or scheduled, YouTube will show no active stream. Press play and unmute in the player to hear audio.</p></section>
    <section className="panel">
      <div className="rowline" style={{marginBottom:12,flexWrap:"wrap"}}><h2 style={{margin:0}}>GLOBAL FUNN • Live News</h2><span className="status warn">WAITING FOR CHANNEL LIVE</span></div>
      <div style={{position:"relative",width:"100%",aspectRatio:"16 / 9",background:"#05070b",borderRadius:14,overflow:"hidden"}}>
        <iframe title="GLOBAL FUNN live news stream" src={playerUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" style={{position:"absolute",inset:0,width:"100%",height:"100%",border:0}} />
      </div>
      <p className="muted" style={{fontSize:12,lineHeight:1.6,marginBottom:0}}>Audio is controlled by the YouTube player. Browser autoplay policies may require a tap to start playback. The newsroom website cannot start an encoder or create a YouTube broadcast by itself.</p>
    </section>
    <footer className="footer"><span>GLOBAL FUNN LIVE NEWS</span><span>Official channel player • No third-party TV feed embedded</span></footer>
  </main>;
}
