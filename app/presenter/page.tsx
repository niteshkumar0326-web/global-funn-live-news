import PresenterBrandStudio from "@/components/PresenterBrandStudio";

export default function PresenterBrandPage() {
  return <main className="shell">
    <header className="topbar">
      <div className="brand"><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>PRESENTER & BRAND IDENTITY</div><div className="muted" style={{fontSize:11}}>PRESENTER • CHANNEL • BROADCAST LOOKS</div></div></div>
      <a className="pill" href="/">← Newsroom dashboard</a>
    </header>
    <section className="hero"><div className="eyebrow">BUILD 18 • PRESENTER STUDIO</div><h1>Your identity.<br/><span className="gold">Your channel.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Create a consistent presenter identity and reusable GLOBAL FUNN layouts for broadcast, vertical video and channel profiles. Add your own approved photo for an authentic preview.</p></section>
    <PresenterBrandStudio/>
    <footer className="footer"><span>GLOBAL FUNN LIVE NEWS • PRESENTER STUDIO</span><span>Photo rights and editor approval required</span></footer>
  </main>;
}
