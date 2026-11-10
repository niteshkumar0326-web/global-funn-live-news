import CorrectionHistory from "@/components/CorrectionHistory";

export default function Archive(){
 return <main className="shell">
  <header className="topbar"><a href="/" style={{color:"#d4af37",textDecoration:"none",fontWeight:800}}>← GLOBAL FUNN NEWSROOM</a><span className="pill">TRANSPARENCY REGISTER</span></header>
  <section className="hero"><div className="eyebrow">CORRECTIONS • UPDATES • VERSION HISTORY</div><h1>Keep the record <span className="gold">visible.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Correction records saved from the Story Queue are displayed here on this browser. This is a local prototype, not a public or tamper-proof audit log.</p></section>
  <CorrectionHistory/>
  <section className="panel" style={{marginTop:18}}><h2>Correction standard</h2><p className="muted" style={{lineHeight:1.7}}>Every correction should preserve the original headline, corrected headline, reason, editor, timestamp and evidence reference. Material changes must not be silently erased. Human editor review remains mandatory.</p></section>
  <footer className="footer">GLOBAL FUNN LIVE NEWS • CORRECTIONS STAY VISIBLE</footer>
 </main>;
}
