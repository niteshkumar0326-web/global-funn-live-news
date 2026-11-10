"use client";
import {useEffect,useState} from "react";
type Entry={key:string,label:string,description:string};
const ENTRIES:Entry[]=[
 {key:"global-funn-newsroom-drafts-v1",label:"Story queue & corrections",description:"Story drafts, workflow history and correction records"},
 {key:"global-funn-broadcast-rundown-v1",label:"Broadcast rundown",description:"Programme segments, presenter notes and timing"},
 {key:"global-funn-verification-checklist-v1",label:"Verification checklist",description:"Saved local verification checklist state"},
 {key:"global-funn-script-studio-v1",label:"Bilingual scripts",description:"English/Hindi scripts, facts, attribution and subtitles"},
 {key:"global-funn-presenter-brand-v1",label:"Presenter identity",description:"Presenter name, role, channel and selected photo data"},
 {key:"global-funn-storyboard-v1",label:"Storyboard & shot plan",description:"Scenes, visuals, narration, durations and production notes"},
 {key:"global-funn-video-production-checklist-v1",label:"Production checklist",description:"Programme brief, production notes and checklist progress"},
 {key:"global-funn-voice-studio-v1",label:"Voice & pronunciation",description:"Voice-over text and pronunciation notes, if saved by this version"}
];
const BUNDLE="global-funn-newsroom-backup-v1";
type Backup={format:string,version:number,project:string,exportedAt:string,source:string,records:Record<string,{label:string,present:boolean,value:unknown}>};
function download(name:string,text:string){const url=URL.createObjectURL(new Blob([text],{type:"application/json;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
export default function DataBackupCentre(){
 const [includeEmpty,setIncludeEmpty]=useState(false),[notice,setNotice]=useState("Choose an action to create or restore a backup."),[summary,setSummary]=useState<string[]>([]),[busy,setBusy]=useState(false),[fileName,setFileName]=useState("");
 const [preview,setPreview]=useState<Backup|null>(null),[replace,setReplace]=useState(false);
 const [confirmText,setConfirmText]=useState("");
 const [status,setStatus]=useState(ENTRIES.map(e=>({...e,present:false})));
 useEffect(()=>{try{setStatus(ENTRIES.map(e=>({...e,present:localStorage.getItem(e.key)!==null})));}catch{/* Browser storage may be unavailable. */}},[notice]);
 function exportBackup(){
  setBusy(true);try{
   const records:Backup["records"]={};const lines:string[]=[];
   for(const entry of ENTRIES){const raw=localStorage.getItem(entry.key);if(raw===null&&!includeEmpty)continue;let value:unknown=null;if(raw!==null){try{value=JSON.parse(raw)}catch{value=raw;}}records[entry.key]={label:entry.label,present:raw!==null,value};lines.push(entry.label+(raw===null?" — empty":" — included"));}
   const backup:Backup={format:BUNDLE,version:1,project:"GLOBAL FUNN LIVE NEWS",exportedAt:new Date().toISOString(),source:"Browser-local data export",records};
   const json=JSON.stringify(backup,null,2);download("global-funn-newsroom-backup-"+new Date().toISOString().slice(0,10)+".json",json);setSummary(lines);setNotice("Backup file generated. Keep a second copy in a safe location; this download does not upload or sync it.");setConfirmText("");
  }catch{setNotice("Backup could not be created. Browser storage may be unavailable.");}finally{setBusy(false);}
 }
 function readBackup(e:React.ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];if(!file)return;setFileName(file.name);setPreview(null);setNotice("");
  if(file.size>15*1024*1024){setNotice("Backup file exceeds 15 MB. Choose a smaller JSON backup.");e.target.value="";return;}
  const reader=new FileReader();reader.onload=()=>{try{
   const data=JSON.parse(String(reader.result));if(data?.format!==BUNDLE||data?.version!==1||!data.records||typeof data.records!=="object"||Array.isArray(data.records))throw new Error("Unsupported backup format.");
   const allowed=new Set(ENTRIES.map(x=>x.key));const valid:Backup["records"]={};
   for(const [key,record] of Object.entries(data.records)){if(allowed.has(key)&&record&&typeof record==="object"&&"present"in record)valid[key]=record as Backup["records"][string];}
   if(!Object.keys(valid).length)throw new Error("No recognised newsroom records found in this backup.");
   setPreview({...data,records:valid});setNotice("Backup inspected. Review included records, then choose merge or replace and confirm before restoring.");
  }catch(err){setNotice(err instanceof Error?err.message:"Could not read this backup file.");} };reader.onerror=()=>setNotice("Could not read the selected file.");reader.readAsText(file);e.target.value="";
 }
 function restore(){
  if(!preview){setNotice("Select a valid backup first.");return;}
  if(confirmText!=="RESTORE GLOBAL FUNN"){setNotice("Type RESTORE GLOBAL FUNN exactly to confirm.");return;}
  setBusy(true);try{
   const changed:string[]=[];
   for(const entry of ENTRIES){const record=preview.records[entry.key];if(!record)continue;if(record.present){localStorage.setItem(entry.key,JSON.stringify(record.value));changed.push(entry.label);}else if(replace){localStorage.removeItem(entry.key);changed.push(entry.label+" (cleared)");}}
   setSummary(changed);setNotice((replace?"Restore completed in replace mode.":"Restore merged the records found in the backup.")+" Reload the relevant workspace to see restored data. Export your current data before replacing it.");setPreview(null);setConfirmText("");
  }catch{setNotice("Restore stopped because browser storage may be full or unavailable. Some earlier records may already have been restored; inspect and re-export before trying again.");}finally{setBusy(false);}
 }
 const field:React.CSSProperties={width:"100%",background:"#08182c",border:"1px solid #355071",borderRadius:8,padding:"9px 10px",color:"#f8fafc",fontSize:12};
 const btn:React.CSSProperties={border:"1px solid #d4af37",borderRadius:8,padding:"9px 12px",background:"#10233d",color:"#f5d98c",fontSize:12,fontWeight:800,cursor:"pointer"};
 return <div className="grid">
 <section className="wide panel" style={{display:"grid",gap:14}}>
  <div className="rowline"><h2 style={{margin:0}}>Create a newsroom backup</h2><span className="pill">BUILD 26</span></div>
  <div className="proof"><strong>Important storage boundary</strong><p style={{margin:"6px 0 0",fontSize:12,lineHeight:1.65}}>This tool exports recognised browser-local records into one JSON file. It does not upload anything to GitHub, Dropbox, OneDrive or a cloud server. Presenter photo data may be included in the JSON; keep the backup private.</p></div>
  <div style={{display:"grid",gap:9}}>{ENTRIES.map(e=>{const item=status.find(s=>s.key===e.key);return <div className="rowline" key={e.key} style={{borderBottom:"1px solid #243b56",paddingBottom:8,alignItems:"flex-start"}}><div><strong style={{fontSize:12}}>{e.label}</strong><div className="muted" style={{fontSize:10,marginTop:3}}>{e.description}</div></div><span className={item?.present?"status":"status warn"}>{item?.present?"SAVED HERE":"NOT FOUND"}</span></div>})}</div>
  <label className="rowline" style={{justifyContent:"flex-start",fontSize:12,color:"#cbd5e1"}}><input type="checkbox" checked={includeEmpty} onChange={e=>setIncludeEmpty(e.target.checked)}/> Include empty/missing records in export</label>
  <button type="button" disabled={busy} style={btn} onClick={exportBackup}>{busy?"Working…":"Download complete JSON backup"}</button>
  <div className="proof"><strong>Media Library files are separate</strong><p style={{fontSize:12,lineHeight:1.6,marginBottom:0}}>Original images, videos, audio and documents in the Media Library are not embedded in this backup. Download those originals separately from <a href="/media" style={{color:"#f5d98c"}}>Media Library</a>. Its JSON index is metadata only.</p></div>
 </section>
 <section className="wide panel" style={{display:"grid",gap:12}}>
  <div className="rowline"><h2 style={{margin:0}}>Restore a newsroom backup</h2><span className="pill">JSON • VERSION 1</span></div>
  <div className="proof">Restore only a backup you trust. First download a backup of the current browser. Merge updates keys present in the selected backup and leaves other keys unchanged. Replace also clears recognised keys marked absent in that backup.</div>
  <label style={{display:"grid",gap:6,fontSize:12,color:"#cbd5e1"}}>Select backup JSON<input type="file" accept="application/json,.json" style={{...field,padding:8}} onChange={readBackup}/></label>
  {fileName&&<div className="muted" style={{fontSize:11}}>Selected: {fileName}</div>}
  {preview&&<div className="proof" style={{display:"grid",gap:8}}><strong>Backup preview — {preview.project}</strong><span className="muted" style={{fontSize:11}}>Created: {new Date(preview.exportedAt).toLocaleString()} • {Object.keys(preview.records).length} recognised records</span>{Object.entries(preview.records).map(([key,r])=><div key={key} className="rowline"><span style={{fontSize:11}}>{r.label||key}</span><span className={r.present?"status":"status warn"}>{r.present?"IN BACKUP":"EMPTY"}</span></div>)}
   <label style={{display:"grid",gap:5,fontSize:12}}>Restore method<select style={field} value={replace?"replace":"merge"} onChange={e=>setReplace(e.target.value==="replace")}><option value="merge">Merge — leave unlisted browser records unchanged</option><option value="replace">Replace — clear recognised keys absent from backup</option></select></label>
   <label style={{display:"grid",gap:5,fontSize:12}}>Type RESTORE GLOBAL FUNN to confirm<input style={field} value={confirmText} onChange={e=>setConfirmText(e.target.value)} placeholder="RESTORE GLOBAL FUNN"/></label>
   <button type="button" style={btn} disabled={busy||confirmText!=="RESTORE GLOBAL FUNN"} onClick={restore}>{busy?"Restoring…":"Confirm and restore backup"}</button>
  </div>}
 </section>
 <section className="wide panel" style={{display:"grid",gap:8}}><h2 style={{margin:0}}>Activity & result</h2><div className="proof" role="status">{notice}</div>{summary.length>0&&<ul style={{margin:0,paddingLeft:20,fontSize:11,lineHeight:1.8}}>{summary.map((x,i)=><li key={i}>{x}</li>)}</ul>}</section>
 <aside className="side panel" style={{display:"grid",alignContent:"start",gap:10}}><h2 style={{margin:0}}>Backup safety rules</h2><ul className="muted" style={{fontSize:11,lineHeight:1.8,paddingLeft:18}}><li>Download a fresh backup before restore.</li><li>Keep two copies in separate safe places.</li><li>Never share a backup containing private presenter images.</li><li>Restore in the same browser origin where the app stores data.</li><li>Media Library originals must be downloaded separately.</li><li>Browser storage can be cleared by device/browser cleanup.</li></ul><div className="proof">This is a local export/import tool, not a cloud backup service, encrypted vault, user account or multi-device synchronisation.</div></aside>
 </div>;
}
