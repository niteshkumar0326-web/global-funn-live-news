import VideoAudioStudio from "@/components/VideoAudioStudio";
export default function VideoStudioPage(){return <main className="shell">
<header className="topbar"><div className="brand"><div className="mark">GF</div><div><div className="eyebrow">GLOBAL FUNN</div><div style={{fontSize:18,fontWeight:900,letterSpacing:1}}>VIDEO & AUDIO STUDIO</div><div className="muted" style={{fontSize:11}}>CLIPS • VOICE-OVER • SUBTITLES</div></div></div><a className="pill" href="/">← Newsroom dashboard</a></header>
<section className="hero"><div className="eyebrow">BUILD 21 • MEDIA PRODUCTION</div><h1>Shape the story.<br/><span className="gold">Prepare every frame.</span></h1><p className="muted" style={{maxWidth:700,lineHeight:1.7}}>Organise local video and audio clips, note trim points, draft time-coded subtitles and export an edit list for your video editor.</p></section>
<VideoAudioStudio/>
<footer className="footer"><span>GLOBAL FUNN LIVE NEWS • VIDEO & AUDIO STUDIO</span><span>Local media workspace • No automatic publishing</span></footer>
</main>}
