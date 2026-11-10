import DataBackupCentre from "@/components/DataBackupCentre";
export default function BackupPage(){return <main className="shell">
<header className="topbar"><div className="brand"><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>DATA & BACKUP CENTRE</div><div className="muted" style={{fontSize:11}}>EXPORT • RESTORE • PROTECT YOUR WORK</div></div></div><a className="pill" href="/">← Newsroom dashboard</a></header>
<section className="hero"><div className="eyebrow">BUILD 26 • DATA SAFETY</div><h1>Protect your newsroom.<br/><span className="gold">Keep a safe copy.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Export and restore the newsroom records stored in this browser. Media originals are handled separately.</p></section>
<DataBackupCentre/>
<footer className="footer"><span>GLOBAL FUNN LIVE NEWS • DATA & BACKUP CENTRE</span><span>Local export/import • Keep your own secure copies</span></footer>
</main>}
