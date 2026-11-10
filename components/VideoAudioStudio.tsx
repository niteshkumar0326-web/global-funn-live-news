"use client";

import { useEffect, useMemo, useState } from "react";

type Clip={id:string;name:string;fileName:string;mime:string;size:number;duration:number;inPoint:number;outPoint:number;notes:string;blob:Blob};
type Cue={id:string;start:number;end:number;text:string};
const DB="global-funn-video-studio-v1",STORE="clips",PROJECT="global-funn-video-studio-project-v1";
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:"id"});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function readClips():Promise<Clip[]>{const db=await openDb();return new Promise((resolve,reject)=>{const req=db.transaction(STORE,"readonly").objectStore(STORE).getAll();req.onsuccess=()=>resolve((req.result as Clip[]).sort((a,b)=>a.id.localeCompare(b.id)));req.onerror=()=>reject(req.error);});}
async function writeClip(clip:Clip){const db=await openDb();return new Promise<void>((resolve,reject)=>{const req=db.transaction(STORE,"readwrite").objectStore(STORE).put(clip);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);});}
async function eraseClip(id:string){const db=await openDb();return new Promise<void>((resolve,reject)=>{const req=db.transaction(STORE,"readwrite").objectStore(STORE).delete(id);req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);});}
const stamp=(seconds:number)=>{const safe=Math.max(0,Number.isFinite(seconds)?seconds:0);const h=Math.floor(safe/3600),m=Math.floor((safe%3600)/60),s=Math.floor(safe%60);return [h,m,s].map(v=>String(v).padStart(2,"0")).join(":");};
const srtStamp=(seconds:number)=>{const ms=Math.round(Math.max(0,seconds)*1000),h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000),r=ms%1000;return stamp(h*3600+m*60+s)+","+String(r).padStart(3,"0");};
function saveText(filename:string,content:string,type="text/plain;charset=utf-8"){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);}
export default function VideoAudioStudio(){
 const [clips,setClips]=useState<Clip[]>([]),[selectedId,setSelectedId]=useState(""),[cues,setCues]=useState<Cue[]>([]),[cueText,setCueText]=useState(""),[cueStart,setCueStart]=useState("0"),[cueEnd,setCueEnd]=useState("3"),[project,setProject]=useState("GLOBAL FUNN — New video"),[notice,setNotice]=useState("Add approved video or audio files to begin."),[previewUrl,setPreviewUrl]=useState("");
 const selected=clips.find(c=>c.id===selectedId)||clips[0];
 const [inValue,setInValue]=useState("0"),[outValue,setOutValue]=useState("0"),[durationValue,setDurationValue]=useState("0"),[clipNotes,setClipNotes]=useState("");
 useEffect(()=>{void (async()=>{try{setClips(await readClips());const raw=localStorage.getItem(PROJECT);if(raw){const p=JSON.parse(raw);setProject(p.project||"GLOBAL FUNN — New video");setCues(Array.isArray(p.cues)?p.cues:[]);}}catch{setNotice("Local video storage is unavailable in this browser.");}})();},[]);
 useEffect(()=>{try{localStorage.setItem(PROJECT,JSON.stringify({project,cues,updatedAt:new Date().toISOString()}));}catch{setNotice("Project notes could not be saved. Export your subtitles and edit list as backup.");}},[project,cues]);
 useEffect(()=>{if(!selected){setPreviewUrl("");return;}setInValue(String(selected.inPoint));setOutValue(String(selected.outPoint));setDurationValue(String(selected.duration));setClipNotes(selected.notes);const url=URL.createObjectURL(selected.blob);setPreviewUrl(url);return()=>URL.revokeObjectURL(url);},[selectedId,clips.length]);
 const total=useMemo(()=>clips.reduce((sum,c)=>sum+Math.max(0,Math.min(c.duration||c.outPoint,c.outPoint||c.duration)-c.inPoint),0),[clips]);
 async function addFile(e:React.ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;if(!file.type.startsWith("video/")&&!file.type.startsWith("audio/")){setNotice("Choose a video or audio file.");e.target.value="";return;}if(file.size>100*1024*1024){setNotice("For browser stability, choose a file under 100 MB.");e.target.value="";return;}const id=crypto.randomUUID();const clip:Clip={id,name:file.name.replace(/\.[^.]+$/,""),fileName:file.name,mime:file.type,size:file.size,duration:0,inPoint:0,outPoint:0,notes:"",blob:file};try{await writeClip(clip);setClips(await readClips());setSelectedId(id);setNotice("Media saved in this browser. No upload or cloud sync occurred.");}catch{setNotice("Could not store this media. Browser storage may be full.");}e.target.value="";}
 async function updateSelected(patch:Partial<Clip>){if(!selected)return;const next={...selected,...patch};await writeClip(next);setClips(current=>current.map(c=>c.id===next.id?next:c));}
 async function removeClip(id:string){await eraseClip(id);const next=await readClips();setClips(next);setSelectedId(next[0]?.id||"");setNotice("Clip removed from this browser's video studio.");}
 function moveClip(index:number,delta:number){const target=index+delta;if(target<0||target>=clips.length)return;const next=[...clips];[next[index],next[target]]=[next[target],next[index]];setClips(next);setNotice("Sequence order changed for this edit list.");}
 function addCue(){const start=Number(cueStart),end=Number(cueEnd);if(!cueText.trim()||!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start){setNotice("Enter subtitle text and a valid end time greater than start time.");return;}setCues(v=>[...v,{id:crypto.randomUUID(),start,end,text:cueText.trim()}].sort((a,b)=>a.start-b.start));setCueText("");setNotice("Subtitle cue added. Review spelling and timing.");}
 function exportSrt(){const text=[...cues].sort((a,b)=>a.start-b.start).map((c,i)=>(i+1)+"\n"+srtStamp(c.start)+" --> "+srtStamp(c.end)+"\n"+c.text).join("\n\n");saveText("global-funn-subtitles.srt",text);}
 function exportEditList(){const lines=[["Sequence","Clip","File","Source In (sec)","Source Out (sec)","Selected Duration (sec)","Notes"],...clips.map((c,i)=>[String(i+1),c.name,c.fileName,String(c.inPoint),String(c.outPoint),String(Math.max(0,c.outPoint-c.inPoint)),c.notes])];const csv=lines.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\n");saveText("global-funn-edit-list.csv",csv,"text/csv;charset=utf-8");}
 const field:React.CSSProperties={width:"100%",background:"#08182c",border:"1px solid #355071",borderRadius:9,padding:"10px 12px",color:"#f8fafc",fontSize:13};
 const btn:React.CSSProperties={border:"1px solid #d4af37",borderRadius:8,padding:"9px 12px",background:"#10233d",color:"#f5d98c",fontSize:12,fontWeight:800,cursor:"pointer"};
 return <div className="grid">
 <section className="wide panel" style={{display:"grid",gap:13}}>
  <div className="rowline"><h2 style={{margin:0}}>Media sequence</h2><span className="pill">BUILD 21</span></div>
  <label style={{fontSize:12}}>Project / episode name<input style={field} value={project} onChange={e=>setProject(e.target.value)} maxLength={100}/></label>
  <div className="proof">Import video/audio up to 100 MB per file. Files stay in this browser's IndexedDB. This is a clip organiser and subtitle drafting tool — it does not render, combine, transcode or publish a finished video.</div>
  <label style={{fontSize:12}}>Add video or audio<input type="file" accept="video/*,audio/*" onChange={addFile} style={{...field,padding:8}}/><span className="muted">MP4, MOV, WebM, MP3, WAV and other browser-supported media formats.</span></label>
  <div className="rowline"><strong>Sequence ({clips.length} clips)</strong><span className="pill">EST. {stamp(total)}</span></div>
  {clips.length===0?<div className="proof">Your sequence is empty. Add a video or audio file above.</div>:clips.map((clip,i)=><article key={clip.id} className="story" style={{display:"grid",gridTemplateColumns:"1fr auto",gap:8,alignItems:"center"}}>
   <button type="button" onClick={()=>setSelectedId(clip.id)} style={{background:"transparent",border:0,color:"#f8fafc",textAlign:"left",cursor:"pointer",padding:0}}><strong>{i+1}. {clip.name}</strong><div className="muted" style={{fontSize:11}}>{clip.fileName} • {(clip.size/1024/1024).toFixed(1)} MB • {clip.mime||"media"}</div></button>
   <div className="rowline" style={{gap:5}}><button style={btn} onClick={()=>moveClip(i,-1)} disabled={i===0}>↑</button><button style={btn} onClick={()=>moveClip(i,1)} disabled={i===clips.length-1}>↓</button><button style={btn} onClick={()=>void removeClip(clip.id)}>Remove</button></div>
  </article>)}
  {selected&&<div className="proof" style={{display:"grid",gap:10}}>
   <strong>Selected clip: {selected.name}</strong>
   {previewUrl&& (selected.mime.startsWith("video/")?<video key={previewUrl} src={previewUrl} controls style={{width:"100%",maxHeight:320,background:"#000",borderRadius:10}} onLoadedMetadata={e=>{const d=e.currentTarget.duration;if(Number.isFinite(d)){setDurationValue(String(d));void updateSelected({duration:d,outPoint:selected.outPoint===0?d:selected.outPoint});}}}/>:<audio key={previewUrl} src={previewUrl} controls style={{width:"100%"}} onLoadedMetadata={e=>{const d=e.currentTarget.duration;if(Number.isFinite(d)){setDurationValue(String(d));void updateSelected({duration:d,outPoint:selected.outPoint===0?d:selected.outPoint});}}}/>)}
   <div className="grid" style={{gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}>
    <label style={{fontSize:11}}>Source in (sec)<input style={field} type="number" min="0" step=".1" value={inValue} onChange={e=>setInValue(e.target.value)}/></label>
    <label style={{fontSize:11}}>Source out (sec)<input style={field} type="number" min="0" step=".1" value={outValue} onChange={e=>setOutValue(e.target.value)}/></label>
    <label style={{fontSize:11}}>Media duration (sec)<input style={field} type="number" min="0" step=".1" value={durationValue} onChange={e=>setDurationValue(e.target.value)}/></label>
   </div>
   <label style={{fontSize:11}}>Clip / voice-over notes<input style={field} value={clipNotes} onChange={e=>setClipNotes(e.target.value)} maxLength={250}/></label>
   <button type="button" style={btn} onClick={()=>{const a=Number(inValue),b=Number(outValue),d=Number(durationValue);if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b<=a||(d>0&&b>d)){setNotice("Check trim values: out must be greater than in and within the media duration.");return;}void updateSelected({inPoint:a,outPoint:b,duration:d,notes:clipNotes});setNotice("Clip edit points saved to the local edit list.");}}>Save clip edit points</button>
  </div>}
  <div className="rowline" style={{flexWrap:"wrap"}}><button type="button" style={btn} onClick={exportEditList} disabled={!clips.length}>Export edit list CSV</button><span className="muted" style={{fontSize:11}}>The edit list records trim points; it is not a rendered video.</span></div>
  <div className="proof" role="status">{notice}</div>
 </section>
 <aside className="side panel" style={{display:"grid",alignContent:"start",gap:12}}>
  <h2 style={{margin:0}}>Subtitle & voice-over cues</h2>
  <p className="muted" style={{fontSize:12,lineHeight:1.6}}>Draft time-coded subtitles in any language. Review wording, names and timings before broadcast.</p>
  <label style={{fontSize:11}}>Start time (seconds)<input style={field} type="number" min="0" step=".1" value={cueStart} onChange={e=>setCueStart(e.target.value)}/></label>
  <label style={{fontSize:11}}>End time (seconds)<input style={field} type="number" min="0" step=".1" value={cueEnd} onChange={e=>setCueEnd(e.target.value)}/></label>
  <label style={{fontSize:11}}>Subtitle / voice-over text<textarea style={{...field,display:"block"}} rows={3} maxLength={500} value={cueText} onChange={e=>setCueText(e.target.value)} placeholder="Type the spoken line or subtitle"/></label>
  <button type="button" style={btn} onClick={addCue}>Add subtitle cue</button>
  <div className="rowline"><strong>Subtitle cues ({cues.length})</strong><button style={btn} type="button" onClick={exportSrt} disabled={!cues.length}>Export SRT</button></div>
  {cues.length===0?<div className="proof">No subtitle cues yet.</div>:cues.map((cue,i)=><article key={cue.id} className="story" style={{display:"grid",gap:6}}><div className="rowline"><span className="tag">{stamp(cue.start)}–{stamp(cue.end)}</span><button type="button" style={btn} onClick={()=>setCues(v=>v.filter(c=>c.id!==cue.id))}>Delete</button></div><div style={{fontSize:13,lineHeight:1.5}}>{i+1}. {cue.text}</div></article>)}
  <div className="proof">SRT and CSV are downloadable production files. No automatic speech recognition, translation, voice synthesis or final video rendering is included.</div>
 </aside>
 </div>;
}
