import { CHANNEL_URL, getChannelVideo } from "./channel-feed";

// Re-check the channel every 2 minutes, so a new broadcast or upload appears without a redeploy.
export const revalidate = 120;

function formatPublished(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) + " IST";
}

export default async function LivePage() {
  const video = await getChannelVideo();
  const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
  const published = formatPublished(video.published);
  const autoplay = video.isLive ? "&autoplay=1&mute=1" : "";

  return (
    <main style={{minHeight:"100vh",background:"#07111f",color:"#f8fafc",fontFamily:"Arial, sans-serif",padding:"24px 16px"}}>
      <div style={{maxWidth:1040,margin:"0 auto"}}>
        <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:24}}>
          <a href="/" style={{color:"#f5d28a",textDecoration:"none",fontWeight:800}}>← GLOBAL FUNN NEWSROOM</a>
          <a href={CHANNEL_URL} target="_blank" rel="noreferrer" style={{color:"#dbeafe",textDecoration:"none",border:"1px solid #334155",borderRadius:999,padding:"9px 14px"}}>Visit YouTube Channel ↗</a>
        </header>
        <section style={{border:"1px solid #26374e",borderRadius:20,background:"#0d1b2d",padding:"clamp(18px,4vw,32px)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:14}}>
            {video.isLive ? (
              <span style={{background:"#b91c1c",color:"#fff",fontSize:12,fontWeight:900,letterSpacing:1,borderRadius:999,padding:"7px 11px"}}>● LIVE NOW</span>
            ) : (
              <span style={{background:"#854d0e",color:"#fef3c7",fontSize:12,fontWeight:900,letterSpacing:1,borderRadius:999,padding:"7px 11px"}}>LATEST VIDEO</span>
            )}
            <span style={{color:"#94a3b8",fontSize:12}}>GLOBAL FUNN • INDIA • WORLD • BEYOND</span>
          </div>
          <h1 style={{fontSize:"clamp(28px,5vw,46px)",lineHeight:1.1,margin:"0 0 12px",fontWeight:900}}>
            {video.isLive ? "GLOBAL FUNN Live" : "Watch GLOBAL FUNN"}
          </h1>
          {video.title && <p style={{color:"#f8fafc",fontWeight:700,lineHeight:1.5,margin:"0 0 6px"}}>{video.title}</p>}
          <p style={{color:"#cbd5e1",lineHeight:1.7,margin:"0 0 22px"}}>
            {video.isLive
              ? "The channel is broadcasting now. If playback does not start here, open it on YouTube."
              : `No broadcast is on air right now, so this is the channel's newest upload${published ? ` (published ${published})` : ""}. This page switches to the live stream automatically when one starts.`}
          </p>
          <div style={{position:"relative",width:"100%",aspectRatio:"16 / 9",background:"#020617",borderRadius:14,overflow:"hidden",border:"1px solid #334155"}}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0&modestbranding=1${autoplay}`}
              title={video.title ?? "GLOBAL FUNN channel video"}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{position:"absolute",inset:0,width:"100%",height:"100%",border:0}}
            />
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:20}}>
            <a href={videoUrl} target="_blank" rel="noreferrer" style={{background:"#d6a84f",color:"#111827",fontWeight:900,textDecoration:"none",borderRadius:10,padding:"12px 18px"}}>▶ Open on YouTube</a>
            <a href={CHANNEL_URL} target="_blank" rel="noreferrer" style={{border:"1px solid #64748b",color:"#f8fafc",textDecoration:"none",borderRadius:10,padding:"12px 18px"}}>Open channel</a>
          </div>
          <p style={{fontSize:12,color:"#94a3b8",lineHeight:1.6,marginTop:18}}>
            {video.source === "fallback"
              ? "Broadcast status: YouTube could not be reached, so a saved channel video is shown and live status is unknown."
              : "Broadcast status is checked against YouTube every 2 minutes."}
          </p>
        </section>
        <footer style={{color:"#94a3b8",fontSize:12,textAlign:"center",marginTop:24}}>GLOBAL FUNN • KHABAR HAR PAL, NAZAR GLOBAL</footer>
      </div>
    </main>
  );
}
