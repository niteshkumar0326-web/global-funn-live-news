"use client";
import { useEffect, useMemo, useState } from "react";
type Format = "square" | "landscape" | "story";
type Profile = { name?: string; channel?: string; photo?: string; role?: string };
const PROFILE_KEY = "global-funn-presenter-brand-v1";
const sizes:Record<Format,{label:string;width:number;height:number}> = {
 square:{label:"Instagram / Facebook square",width:1080,height:1080},
 landscape:{label:"YouTube / bulletin landscape",width:1920,height:1080},
 story:{label:"Reels / Story vertical",width:1080,height:1920}
};
function esc(value:string){return value.replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"}[ch]||ch));}
export default function NewsGraphicsStudio(){
 const [format,setFormat]=useState<Format>("square");
 const [label,setLabel]=useState("GLOBAL FUNN • NEWS UPDATE");
 const [headline,setHeadline]=useState("YOUR VERIFIED HEADLINE GOES HERE");
 const [summary,setSummary]=useState("Add a short, factual supporting line after editorial review.");
 const [desk,setDesk]=useState("INDIA");
 const [source,setSource]=useState("");
 const [notice,setNotice]=useState("");
 const [presenter,setPresenter]=useState<Profile>({});
 useEffect(()=>{try{const raw=localStorage.getItem(PROFILE_KEY);if(raw){const p=JSON.parse(raw) as Profile;setPresenter(p);if(p.channel)setLabel(current=>current==="GLOBAL FUNN • NEWS UPDATE"?p.channel!.toUpperCase()+" • NEWS UPDATE":current);}}catch{setNotice("Presenter profile could not be loaded.");}},[]);
 const size=sizes[format];
 const safeHeadline=useMemo(()=>headline.trim()||"HEADLINE PLACEHOLDER",[headline]);
 function download(){
  const words=safeHeadline.split(" ");const lines:string[]=[];let line="";
  for(const word of words){if((line+" "+word).trim().length>24&&line){lines.push(line);line=word;}else line=(line+" "+word).trim();}if(line)lines.push(line);
  const clip=presenter.photo?'<clipPath id="presenterCircle"><circle cx="'+(size.width*.88)+'" cy="'+(size.height*.20)+'" r="'+(Math.min(size.width,size.height)*.075)+'"/></clipPath>':"";
  const photo=presenter.photo?'<image href="'+esc(presenter.photo)+'" x="'+(size.width*.805)+'" y="'+(size.height*.125)+'" width="'+(Math.min(size.width,size.height)*.15)+'" height="'+(Math.min(size.width,size.height)*.15)+'" preserveAspectRatio="xMidYMid slice" clip-path="url(#presenterCircle)"/>':"";
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+size.width+'" height="'+size.height+'" viewBox="0 0 '+size.width+' '+size.height+'"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#071426"/><stop offset="1" stop-color="#17396c"/></linearGradient>'+clip+'</defs><rect width="100%" height="100%" fill="url(#bg)"/><path d="M0 '+size.height*.78+' L'+size.width+' '+size.height*.58+' L'+size.width+' '+size.height+' L0 '+size.height+'Z" fill="#0b1b31"/><rect x="7%" y="8%" width="86%" height="2" fill="#d4af37"/><text x="7%" y="15%" fill="#d4af37" font-family="Arial" font-size="'+Math.round(size.width*.025)+'" font-weight="700">'+esc(label.toUpperCase())+'</text>'+photo+'<text x="7%" y="24%" fill="#cbd5e1" font-family="Arial" font-size="'+Math.round(size.width*.018)+'" font-weight="700">'+esc(desk.toUpperCase())+' DESK</text>'+lines.slice(0,5).map((v,i)=>'<text x="7%" y="'+(Math.round(size.height*.46)+i*Math.round(size.height*.075))+'" fill="#fff" font-family="Arial" font-size="'+Math.round(size.width*.064)+'" font-weight="900">'+esc(v)+'</text>').join("")+'<text x="7%" y="'+size.height*.83+'" fill="#dbeafe" font-family="Arial" font-size="'+Math.round(size.width*.022)+'">'+esc(summary.slice(0,110))+'</text><text x="7%" y="'+size.height*.92+'" fill="#d4af37" font-family="Arial" font-size="'+Math.round(size.width*.016)+'" font-weight="700">EDITORIAL PREVIEW • VERIFY BEFORE USE</text><text x="7%" y="'+size.height*.955+'" fill="#9fb0c7" font-family="Arial" font-size="'+Math.round(size.width*.012)+'">'+esc(source?"SOURCE: "+source:"SOURCE REFERENCE NOT ADDED")+'</text></svg>';
  const blob=new Blob([svg],{type:"image/svg+xml;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="global-funn-news-graphic-"+format+".svg";a.click();URL.revokeObjectURL(url);setNotice("SVG graphic downloaded. Check source details and presenter photo rights before use.");
 }
 const field:React.CSSProperties={width:"100%",background:"#08182c",border:"1px solid #355071",borderRadius:9,padding:"10px 12px",color:"#f8fafc",fontSize:13};
 const btn:React.CSSProperties={border:"1px solid #d4af37",borderRadius:8,padding:"10px 13px",background:"#d4af37",color:"#071426",fontSize:12,fontWeight:900,cursor:"pointer"};
 return <div className="grid">
  <section className="wide panel" style={{display:"grid",gap:13}}>
   <div className="rowline"><h2 style={{margin:0}}>News Graphics Studio</h2><span className="pill">LOCAL DESIGN TOOL</span></div>
   {presenter.name&&<div className="proof">Presenter profile linked: <strong>{presenter.name}</strong>{presenter.role?" • "+presenter.role:""}. Your selected profile photo is included in SVG export.</div>}
   <label style={{fontSize:12}}>Graphic format<select style={{...field,display:"block",marginTop:5}} value={format} onChange={e=>setFormat(e.target.value as Format)}>{Object.entries(sizes).map(([key,v])=><option key={key} value={key}>{v.label} — {v.width}×{v.height}</option>)}</select></label>
   <label style={{fontSize:12}}>Top label<input style={field} value={label} onChange={e=>setLabel(e.target.value)}/></label>
   <label style={{fontSize:12}}>Headline<textarea rows={3} maxLength={150} style={{...field,display:"block"}} value={headline} onChange={e=>setHeadline(e.target.value)}/></label>
   <label style={{fontSize:12}}>Supporting line<textarea rows={2} maxLength={180} style={{...field,display:"block"}} value={summary} onChange={e=>setSummary(e.target.value)}/></label>
   <div className="grid" style={{gridTemplateColumns:"1fr 1fr",gap:10}}><label style={{fontSize:12}}>News desk<input style={field} value={desk} onChange={e=>setDesk(e.target.value)}/></label><label style={{fontSize:12}}>Source reference<input style={field} value={source} onChange={e=>setSource(e.target.value)} placeholder="Paste source URL or document reference"/></label></div>
   <button type="button" style={btn} onClick={download}>Download SVG graphic</button>
   {notice&&<div className="proof" role="status">{notice}</div>}
   <div className="proof">This is a design preview, not a verified news card. The source field is a reference label only; the tool does not open or validate the source. Nothing is published automatically.</div>
  </section>
  <aside className="side panel" style={{display:"grid",alignContent:"start",gap:12}}>
   <h2>Live preview</h2>
   <div style={{aspectRatio:size.width+"/"+size.height,background:"linear-gradient(145deg,#071426,#17396c)",border:"1px solid #d4af37",borderRadius:15,padding:"8%",display:"flex",flexDirection:"column",justifyContent:"space-between",overflow:"hidden",minHeight:format==="story"?400:260}}>
    <div><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}><div style={{height:2,background:"#d4af37",marginBottom:14,flex:1}}/>{presenter.photo&&<img src={presenter.photo} alt="Presenter profile" style={{width:format==="story"?68:54,height:format==="story"?68:54,objectFit:"cover",borderRadius:"50%",border:"2px solid #d4af37"}}/>}</div><div style={{color:"#d4af37",fontSize:10,fontWeight:900,letterSpacing:2}}>{label||"GLOBAL FUNN • NEWS UPDATE"}</div><div style={{fontSize:10,color:"#cbd5e1",marginTop:10,fontWeight:800}}>{desk.toUpperCase()} DESK</div></div>
    <div><div style={{fontSize:format==="story"?27:format==="landscape"?24:21,fontWeight:900,lineHeight:1.13,overflowWrap:"anywhere"}}>{safeHeadline}</div><p style={{fontSize:11,lineHeight:1.5,color:"#dbeafe"}}>{summary}</p></div>
    <div><div style={{fontSize:9,color:"#d4af37",fontWeight:900}}>EDITORIAL PREVIEW • VERIFY BEFORE USE</div><div style={{fontSize:8,color:"#9fb0c7",marginTop:5,overflowWrap:"anywhere"}}>{source||"SOURCE REFERENCE NOT ADDED"}</div></div>
   </div>
   <p className="muted" style={{fontSize:11}}>Canvas size: {size.width} × {size.height} px. SVG can be opened and converted by design software.</p>
  </aside>
 </div>;
}
