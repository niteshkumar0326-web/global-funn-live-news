"use client";

import { useEffect, useMemo, useState } from "react";

type Script = {
  storyTitle: string; facts: string; attribution: string; caveats: string;
  introEn: string; bodyEn: string; outroEn: string; introHi: string; bodyHi: string; outroHi: string;
  youtube: string; subtitles: string; editor: string;
};
const KEY = "global-funn-script-studio-v1";
const initial: Script = { storyTitle:"",facts:"",attribution:"",caveats:"",introEn:"",bodyEn:"",outroEn:"",introHi:"",bodyHi:"",outroHi:"",youtube:"",subtitles:"",editor:"" };
export default function ScriptStudio(){
 const [data,setData]=useState<Script>(initial); const [notice,setNotice]=useState("");
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw)setData({...initial,...JSON.parse(raw)});}catch{setNotice("Saved script could not be loaded.");}},[]);
 const update=(key:keyof Script,value:string)=>setData(old=>({...old,[key]:value}));
 const fields: {key:keyof Script;label:string;hint:string;rows:number}[]=[
  {key:"facts",label:"Verified facts supplied by editor",hint:"Only facts already checked against evidence. Keep each fact specific.",rows:4},
  {key:"attribution",label:"Attribution and source wording",hint:"Who said or published what? Preserve attribution; do not turn allegations into facts.",rows:3},
  {key:"caveats",label:"What remains unknown / disputed",hint:"Context, limitations, unanswered questions and competing accounts.",rows:3},
  {key:"introEn",label:"English presenter introduction",hint:"Opening line and clear context.",rows:3},
  {key:"bodyEn",label:"English main bulletin",hint:"Use only the facts and attribution above.",rows:6},
  {key:"outroEn",label:"English sign-off",hint:"Neutral close and what viewers should watch for next.",rows:2},
  {key:"introHi",label:"Hindi presenter introduction",hint:"Hindi version; manually review names, places and figures.",rows:3},
  {key:"bodyHi",label:"Hindi main bulletin",hint:"Keep meaning and attribution consistent with the English version.",rows:6},
  {key:"outroHi",label:"Hindi sign-off",hint:"Neutral close.",rows:2},
  {key:"youtube",label:"YouTube description / social caption",hint:"Include context and visible source references in the published post.",rows:4},
  {key:"subtitles",label:"Subtitle / lower-third lines",hint:"One short line per subtitle or lower-third.",rows:4}
 ];
 const words=useMemo(()=>[data.introEn,data.bodyEn,data.outroEn,data.introHi,data.bodyHi,data.outroHi].join(" ").trim().split(/\s+/).filter(Boolean).length,[data]);
 const readTime=Math.max(1,Math.ceil(words/130));
 function save(){try{localStorage.setItem(KEY,JSON.stringify({...data,updatedAt:new Date().toISOString()}));setNotice("Saved in this browser only.");}catch{setNotice("Could not save. Export a backup.");}}
 function exportTxt(){const content=["GLOBAL FUNN LIVE NEWS — SCRIPT WORKSHEET", "EDITORIAL DRAFT • NOT APPROVED FOR PUBLICATION", "", "STORY: "+data.storyTitle, "EDITOR: "+data.editor, "", "VERIFIED FACTS (EDITOR-ENTERED)",data.facts,"", "ATTRIBUTION",data.attribution,"", "UNKNOWN / DISPUTED",data.caveats,"", "ENGLISH INTRO",data.introEn,"ENGLISH BULLETIN",data.bodyEn,"ENGLISH SIGN-OFF",data.outroEn,"", "HINDI INTRO",data.introHi,"HINDI BULLETIN",data.bodyHi,"HINDI SIGN-OFF",data.outroHi,"", "YOUTUBE / SOCIAL COPY",data.youtube,"", "SUBTITLES / LOWER THIRDS",data.subtitles,"", "Editorial warning: wording workspace only. It does not verify facts, translate automatically, generate AI content, or publish."].join("\n");
 const blob=new Blob([content],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="global-funn-bilingual-script.txt";a.click();URL.revokeObjectURL(url);}
 async function copyAll(){const content=[data.storyTitle,data.introEn,data.bodyEn,data.outroEn,data.introHi,data.bodyHi,data.outroHi,data.youtube,data.subtitles].join("\n\n");try{await navigator.clipboard.writeText(content);setNotice("Script text copied.");}catch{setNotice("Clipboard unavailable in this browser. Use Export TXT.");}}
 const input:React.CSSProperties={width:"100%",background:"#08182c",border:"1px solid #355071",borderRadius:9,padding:"10px 12px",color:"#f8fafc",fontSize:13};
 const label:React.CSSProperties={display:"grid",gap:6,fontSize:12,color:"#c5d3e5"};
 const btn:React.CSSProperties={border:"1px solid #d4af37",borderRadius:8,padding:"9px 12px",background:"#10233d",color:"#f5d98c",fontSize:12,fontWeight:800,cursor:"pointer"};
 return <div className="grid"><section className="wide panel" style={{display:"grid",gap:14}}>
  <div className="rowline"><h2 style={{margin:0}}>Bilingual script workspace</h2><span className="pill">EDITORIAL DRAFT</span></div>
  <label style={label}>Story / working headline<input style={input} value={data.storyTitle} onChange={e=>update("storyTitle",e.target.value)} placeholder="Enter the reviewed story headline"/></label>
  <label style={label}>Editor / presenter<input style={input} value={data.editor} onChange={e=>update("editor",e.target.value)} placeholder="Name"/></label>
  <div className="proof"><strong>Start with the evidence, not the script.</strong><p style={{marginBottom:0}}>Enter verified facts, attribution and unresolved points first. This tool does not fetch sources, independently verify facts, translate automatically or generate AI copy.</p></div>
  {fields.map(f=><label key={f.key} style={label}><strong>{f.label}</strong><span className="muted">{f.hint}</span><textarea rows={f.rows} style={input} value={data[f.key]} onChange={e=>update(f.key,e.target.value)} placeholder="Write and review this section..."/></label>)}
  <div className="rowline" style={{flexWrap:"wrap"}}><button style={btn} type="button" onClick={save}>Save draft</button><button style={btn} type="button" onClick={exportTxt}>Export script TXT</button><button style={btn} type="button" onClick={copyAll}>Copy all text</button></div>
  {notice&&<div className="proof" role="status">{notice}</div>}
 </section><aside className="side panel" style={{display:"grid",alignContent:"start",gap:12}}><h2>Studio snapshot</h2><div className="proof"><div className="stat">{words}</div><div className="statlabel">Words across presenter scripts</div></div><div className="proof"><div className="stat">{readTime} min</div><div className="statlabel">Approx. read time at 130 wpm</div></div><div className="proof"><strong>Before recording</strong><ul style={{paddingLeft:18,lineHeight:1.9,marginBottom:0}}><li>Check every name, date and number</li><li>Match Hindi and English meaning</li><li>Keep allegations attributed</li><li>State what is not yet known</li><li>Editor signs off sources and script</li></ul></div><div className="proof"><strong>Publication status</strong><p style={{marginBottom:0}}>Draft only. No recording, upload, social posting or auto-publishing is connected.</p></div></aside></div>;
}
