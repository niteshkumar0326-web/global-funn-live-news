"use client";
import {useEffect,useState} from "react";
type Profile={name?:string;role?:string;channel?:string;tagline?:string;location?:string;photo?:string};
type Scene={id:string;title:string;layout:string;duration:number;lowerThird:string;ticker:string;notes:string};
const PROFILE="global-funn-presenter-brand-v1",SCRIPT="global-funn-script-studio-v1",KEY="global-funn-presenter-scenes-v1";
const layouts=[{id:"studio",label:"Studio anchor",ratio:"16:9"},{id:"portrait",label:"Vertical presenter",ratio:"9:16"},{id:"square",label:"Square update",ratio:"1:1"},{id:"headline",label:"Headline only",ratio:"16:9"}];
const backgrounds=[{id:"navy",label:"Midnight newsroom",a:"#061426",b:"#18395c"},{id:"blue",label:"Royal blue",a:"#092c60",b:"#1764a5"},{id:"gold",label:"Gold editorial",a:"#252016",b:"#6b4d19"},{id:"red",label:"Breaking bulletin",a:"#260d18",b:"#81233a"}];
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[c]||c));
function save(name:string,content:string,type:string){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
export default function PresenterSceneStudio(){
 const [profile,setProfile]=useState<Profile>({name:"Presenter Name",role:"News Presenter",channel:"GLOBAL FUNN",tagline:"Khabar Har Pal, Nazar Global",location:"India",photo:""});
 const [headline,setHeadline]=useState("Your verified headline goes here"),[subhead,setSubhead]=useState("Add a concise supporting line and source context.");
 const [layout,setLayout]=useState("studio"),[background,setBackground]=useState("navy"),[showPhoto,setShowPhoto]=useState(true);
 const [scenes,setScenes]=useState<Scene[]>([]),[selected,setSelected]=useState(""),[notice,setNotice]=useState("Select a scene format and prepare your presenter shot."),[script,setScript]=useState("");
 useEffect(()=>{try{const raw=localStorage.getItem(PROFILE);if(raw)setProfile(p=>({...p,...JSON.parse(raw)}));const saved=localStorage.getItem(KEY);if(saved){const data=JSON.parse(saved);setScenes(Array.isArray(data.scenes)?data.scenes:[]);setHeadline(data.headline||"Your verified headline goes here");setSubhead(data.subhead||"Add a concise supporting line and source context.");}const sr=localStorage.getItem(SCRIPT);if(sr){const d=JSON.parse(sr);setScript([d.introEn,d.bodyEn,d.outroEn].filter(Boolean).join("\n\n"));}}catch{setNotice("Some saved browser data could not be loaded.");}},[]);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify({headline,subhead,scenes,updatedAt:new Date().toISOString()}));}catch{setNotice("Browser storage is full. Export your scene plan as a backup.");}},[headline,subhead,scenes]);
 const bg=backgrounds.find(b=>b.id===background)||backgrounds[0],ratio=layouts.find(x=>x.id===layout)?.ratio||"16:9",aspect=ratio==="9:16"?"9 / 16":ratio==="1:1"?"1 / 1":"16 / 9";
 const name=profile.name||"Presenter Name",role=profile.role||"News Presenter",channel=profile.channel||"GLOBAL FUNN",tagline=profile.tagline||"",photo=profile.photo||"";
 function addScene(){const s:Scene={id:crypto.randomUUID(),title:headline||"New scene",layout,duration:15,lowerThird:name,ticker:"GLOBAL FUNN • KHABAR HAR PAL, NAZAR GLOBAL",notes:"Check source attribution, presenter image rights and final script."};setScenes(v=>[...v,s]);setSelected(s.id);setNotice("Scene added to the local rundown.");}
 function updateScene(id:string,patch:Partial<Scene>){setScenes(v=>v.map(s=>s.id===id?{...s,...patch}:s));}
 function move(i:number,step:number){const n=i+step;if(n<0||n>=scenes.length)return;const a=[...scenes];[a[i],a[n]]=[a[n],a[i]];setScenes(a);}
 function exportPlan(){const rows=[["Order","Scene","Layout","Duration sec","Lower third","Ticker","Notes"],...scenes.map((s,i)=>[String(i+1),s.title,s.layout,String(s.duration),s.lowerThird,s.ticker,s.notes])];save("global-funn-presenter-scene-plan.csv",rows.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(",")).join("\n"),"text/csv;charset=utf-8");}
 function exportSvg(){const portrait=ratio==="9:16",square=ratio==="1:1",w=square?1080:1920,h=portrait?1920:1080;const px=portrait?260:80,py=portrait?180:120,pw=portrait?560:600,ph=portrait?720:760;const image=showPhoto&&photo?'<image href="'+photo+'" x="'+px+'" y="'+py+'" width="'+pw+'" height="'+ph+'" preserveAspectRatio="xMidYMid slice" clip-path="url(#clip)"/>':"";const x=portrait?540:720,y=portrait?1080:570;const svg='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="'+bg.a+'"/><stop offset="1" stop-color="'+bg.b+'"/></linearGradient><clipPath id="clip"><rect x="'+px+'" y="'+py+'" width="'+pw+'" height="'+ph+'" rx="30"/></clipPath></defs><rect width="100%" height="100%" fill="url(#bg)"/>'+image+'<rect x="0" y="'+(h-250)+'" width="'+w+'" height="250" fill="#050d18" opacity=".94"/><text x="'+x+'" y="'+y+'" fill="#f6d98b" font-family="Arial" font-size="44" font-weight="bold">'+esc(channel.toUpperCase())+'</text><text x="'+x+'" y="'+(y+90)+'" fill="white" font-family="Arial" font-size="66" font-weight="bold">'+esc(headline.slice(0,75))+'</text><text x="'+x+'" y="'+(y+150)+'" fill="#d5deea" font-family="Arial" font-size="32">'+esc(subhead.slice(0,100))+'</text><text x="70" y="'+(h-150)+'" fill="#f7d98a" font-family="Arial" font-size="38" font-weight="bold">'+esc(name)+'</text><text x="70" y="'+(h-95)+'" fill="#cbd5e1" font-family="Arial" font-size="26">'+esc(role)+' • '+esc(profile.location||"")+'</text><text x="'+(w-70)+'" y="'+(h-95)+'" text-anchor="end" fill="#f7d98a" font-family="Arial" font-size="24">'+esc(tagline)+'</text></svg>';save("global-funn-presenter-scene.svg",svg,"image/svg+xml;charset=utf-8");setNotice("SVG scene exported. Review image rights, text and cropping before use.");}
 const field:React.CSSProperties={width:"100%",background:"#08182c",border:"1px solid #355071",borderRadius:9,padding:"10px 12px",color:"#f8fafc",fontSize:13};
 const label:React.CSSProperties={display:"grid",gap:5,fontSize:12,color:"#c5d3e5"};
 const btn:React.CSSProperties={border:"1px solid #d4af37",borderRadius:8,padding:"9px 12px",background:"#10233d",color:"#f5d98c",fontSize:12,fontWeight:800,cursor:"pointer"};
 return <div className="grid">
 <section className="wide panel" style={{display:"grid",gap:13}}>
  <div className="rowline"><h2 style={{margin:0}}>Presenter scene preview</h2><span className="pill">BUILD 23</span></div>
  <div className="proof">Your Presenter Studio profile is reused here, including your selected photo. This creates broadcast layouts and production notes; it does not generate a talking avatar or alter your face. Profile photo remains browser-local.</div>
  <div className="grid" style={{gridTemplateColumns:"1fr 1fr",gap:10}}>
   <label style={label}>Scene layout<select style={field} value={layout} onChange={e=>setLayout(e.target.value)}>{layouts.map(l=><option key={l.id} value={l.id}>{l.label} ({l.ratio})</option>)}</select></label>
   <label style={label}>Background theme<select style={field} value={background} onChange={e=>setBackground(e.target.value)}>{backgrounds.map(b=><option key={b.id} value={b.id}>{b.label}</option>)}</select></label>
  </div>
  <label style={label}>Main headline<input style={field} value={headline} maxLength={150} onChange={e=>setHeadline(e.target.value)}/></label>
  <label style={label}>Supporting line<input style={field} value={subhead} maxLength={180} onChange={e=>setSubhead(e.target.value)}/></label>
  <label style={{display:"flex",gap:8,alignItems:"center",fontSize:12}}><input type="checkbox" checked={showPhoto} onChange={e=>setShowPhoto(e.target.checked)}/> Include my saved presenter photo</label>
  <div style={{width:"100%",maxWidth:ratio==="9:16"?360:720,margin:"0 auto",aspectRatio:aspect,background:"linear-gradient(135deg,"+bg.a+","+bg.b+")",border:"1px solid #d4af37",borderRadius:14,overflow:"hidden",position:"relative",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:ratio==="9:16"?16:24}}>
   <div style={{display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:900,color:"#f5d98c",letterSpacing:2}}><span>{channel.toUpperCase()}</span><span>EDITORIAL PREVIEW</span></div>
   <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:18,flex:1,minHeight:0,flexDirection:ratio==="9:16"?"column":"row"}}>
    {showPhoto&&photo?<img src={photo} alt="Selected presenter profile" style={{width:ratio==="9:16"?"54%":"35%",height:ratio==="9:16"?"52%":"75%",objectFit:"cover",borderRadius:12,border:"2px solid #d4af37"}}/>:<div style={{width:ratio==="9:16"?"54%":"35%",height:"70%",border:"1px dashed #d4af37",borderRadius:12,display:"grid",placeItems:"center",color:"#cbd5e1",fontSize:12,textAlign:"center"}}>Add your photo in Presenter Studio</div>}
    <div style={{flex:1,textAlign:ratio==="9:16"?"center":"left",minWidth:0}}><div style={{fontSize:11,color:"#f5d98c",fontWeight:900,letterSpacing:2}}>{channel}</div><div style={{fontSize:ratio==="9:16"?22:26,fontWeight:900,color:"white",lineHeight:1.1,margin:"8px 0"}}>{headline}</div><div style={{fontSize:12,color:"#d5deea"}}>{subhead}</div></div>
   </div>
   <div style={{background:"#050d18",margin:ratio==="9:16"?"0 -16px -16px":"0 -24px -24px",padding:"12px 16px",display:"flex",justifyContent:"space-between",gap:8,alignItems:"center"}}><div><strong style={{color:"#f5d98c",fontSize:12}}>{name}</strong><div style={{fontSize:10,color:"#cbd5e1"}}>{role} • {profile.location}</div></div><span style={{fontSize:9,color:"#f5d98c",textAlign:"right"}}>{tagline}</span></div>
  </div>
  <div className="rowline" style={{flexWrap:"wrap"}}><button type="button" style={btn} onClick={exportSvg}>Export scene SVG</button><button type="button" style={btn} onClick={addScene}>Add to scene rundown</button><a href="/presenter" className="pill">Edit presenter photo/profile ↗</a></div>
  {script&&<div className="proof"><strong>Script Studio hand-off detected</strong><p style={{whiteSpace:"pre-wrap",fontSize:12,maxHeight:130,overflow:"auto",marginBottom:0}}>{script.slice(0,1500)}{script.length>1500?"…":""}</p><span className="muted">Script preview is read-only here. Edit the full script in Script Studio.</span></div>}
  <div className="proof" role="status">{notice}</div>
 </section>
 <aside className="side panel" style={{display:"grid",alignContent:"start",gap:12}}>
  <div className="rowline"><h2 style={{margin:0}}>Scene rundown</h2><span className="pill">{scenes.length} SCENES</span></div>
  {scenes.length===0?<div className="proof">No scenes added. Configure the preview and select “Add to scene rundown”.</div>:scenes.map((s,i)=><article key={s.id} className="story" style={{display:"grid",gap:8}}>
   <div className="rowline"><strong>{i+1}. {s.title}</strong><span className="tag">{s.layout}</span></div><div className="muted" style={{fontSize:11}}>Duration: {s.duration}s • Lower third: {s.lowerThird}</div>
   <div className="rowline"><button type="button" style={btn} onClick={()=>move(i,-1)} disabled={i===0}>↑</button><button type="button" style={btn} onClick={()=>move(i,1)} disabled={i===scenes.length-1}>↓</button><button type="button" style={btn} onClick={()=>setSelected(s.id)}>Edit</button><button type="button" style={btn} onClick={()=>setScenes(v=>v.filter(x=>x.id!==s.id))}>Delete</button></div>
   {selected===s.id&&<div style={{display:"grid",gap:7}}>
    <label style={label}>Scene title<input style={field} value={s.title} onChange={e=>updateScene(s.id,{title:e.target.value})}/></label>
    <label style={label}>Duration (seconds)<input style={field} type="number" min="1" max="600" value={s.duration} onChange={e=>updateScene(s.id,{duration:Math.max(1,Math.min(600,Number(e.target.value)||1))})}/></label>
    <label style={label}>Lower third<input style={field} value={s.lowerThird} onChange={e=>updateScene(s.id,{lowerThird:e.target.value})}/></label>
    <label style={label}>Ticker / strapline<input style={field} value={s.ticker} onChange={e=>updateScene(s.id,{ticker:e.target.value})}/></label>
    <label style={label}>Production notes<textarea style={field} rows={2} value={s.notes} onChange={e=>updateScene(s.id,{notes:e.target.value})}/></label>
   </div>}
  </article>)}
  <button type="button" style={btn} onClick={exportPlan} disabled={!scenes.length}>Export scene rundown CSV</button>
  <div className="proof"><strong>Editorial reminder</strong><p style={{marginBottom:0}}>Use a real, permissioned presenter photo. Verify every headline, source label and lower third. This workspace does not approve or publish content.</p></div>
 </aside>
 </div>;
}
