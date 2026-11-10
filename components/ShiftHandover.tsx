"use client";
import {useEffect,useMemo,useState} from "react";
type Task={id:string,title:string,desk:string,owner:string,priority:"High"|"Normal"|"Low",status:"Open"|"In progress"|"Done",due:string,note:string};
type Handover={date:string,shift:string,editor:string,headline:string,notes:string,tasks:Task[],updatedAt:string};
const KEY="global-funn-shift-handover-v1";
const blank=():Handover=>({date:new Date().toISOString().slice(0,10),shift:"Morning",editor:"",headline:"",notes:"",tasks:[],updatedAt:new Date().toISOString()});
const field:React.CSSProperties={width:"100%",background:"#08182c",border:"1px solid #355071",borderRadius:9,padding:"10px 12px",color:"#f8fafc",fontSize:13};
const btn:React.CSSProperties={border:"1px solid #d4af37",borderRadius:8,padding:"9px 12px",background:"#10233d",color:"#f5d98c",fontSize:12,fontWeight:800,cursor:"pointer"};
export default function ShiftHandover(){
 const [data,setData]=useState<Handover>(blank),[ready,setReady]=useState(false),[notice,setNotice]=useState("Create a shift handover and save it in this browser."),[draft,setDraft]=useState({title:"",desk:"India",owner:"",priority:"Normal" as Task["priority"],due:"",note:""});
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const parsed=JSON.parse(raw);if(parsed&&Array.isArray(parsed.tasks))setData({...blank(),...parsed});}}catch{setNotice("Saved handover could not be read.");}setReady(true);},[]);
 const open=data.tasks.filter(t=>t.status!=="Done"),done=data.tasks.filter(t=>t.status==="Done");
 const progress=useMemo(()=>data.tasks.length?Math.round(done.length/data.tasks.length*100):0,[data.tasks.length,done.length]);
 function update<K extends keyof Handover>(key:K,value:Handover[K]){setData(old=>({...old,[key]:value}));}
 function save(){try{const next={...data,updatedAt:new Date().toISOString()};localStorage.setItem(KEY,JSON.stringify(next));setData(next);setNotice("Shift handover saved in this browser only.");}catch{setNotice("Could not save. Browser storage may be unavailable.");}}
 function addTask(){if(draft.title.trim().length<3){setNotice("Add a task title of at least 3 characters.");return;}const task:Task={...draft,id:crypto.randomUUID(),title:draft.title.trim(),owner:draft.owner.trim(),note:draft.note.trim(),status:"Open"};update("tasks",[...data.tasks,task]);setDraft({title:"",desk:"India",owner:"",priority:"Normal",due:"",note:""});setNotice("Task added. Save the handover to keep it.");}
 function patchTask(id:string,patch:Partial<Task>){update("tasks",data.tasks.map(t=>t.id===id?{...t,...patch}:t));}
 function removeTask(id:string){if(!window.confirm("Remove this handover task?"))return;update("tasks",data.tasks.filter(t=>t.id!==id));}
 function exportFile(){const payload={project:"GLOBAL FUNN LIVE NEWS",type:"shift-handover",version:1,...data};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="global-funn-shift-handover-"+data.date+".json";a.click();URL.revokeObjectURL(url);}
 function exportText(){const lines=["GLOBAL FUNN LIVE NEWS — SHIFT HANDOVER", "Date: "+data.date,"Shift: "+data.shift,"Editor: "+data.editor,"Top priority: "+data.headline,"","HANDOVER NOTES",data.notes,"","OPEN TASKS",...data.tasks.map(t=>"- ["+t.status+"] "+t.title+" | "+t.desk+" | "+t.owner+" | "+t.priority+" | "+t.due+" | "+t.note),"","Reminder: browser-local handover; verify current status with the responsible desk."];const url=URL.createObjectURL(new Blob([lines.join("\n")],{type:"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="global-funn-shift-handover-"+data.date+".txt";a.click();URL.revokeObjectURL(url);}
 return <div className="grid"><section className="wide panel" style={{display:"grid",gap:13}}>
 <div className="rowline"><h2 style={{margin:0}}>Shift handover brief</h2><span className="pill">BUILD 27</span></div>
 <div className="proof">A browser-local editorial handover sheet. Use it to record what the next shift needs to know; it does not assign staff automatically or send alerts.</div>
 <div className="grid" style={{gridTemplateColumns:"1fr 1fr",gap:10}}>
 <label style={{fontSize:12}}>Date<input type="date" style={field} value={data.date} onChange={e=>update("date",e.target.value)}/></label>
 <label style={{fontSize:12}}>Shift<select style={field} value={data.shift} onChange={e=>update("shift",e.target.value)}>{["Morning","Afternoon","Evening","Night","Special bulletin"].map(x=><option key={x}>{x}</option>)}</select></label>
 <label style={{fontSize:12}}>Outgoing editor / producer<input style={field} value={data.editor} onChange={e=>update("editor",e.target.value)} placeholder="Responsible person"/></label>
 <label style={{fontSize:12}}>Top priority<input style={field} value={data.headline} onChange={e=>update("headline",e.target.value)} placeholder="Most important developing item"/></label>
 </div>
 <label style={{fontSize:12}}>Handover notes<textarea rows={5} style={field} value={data.notes} onChange={e=>update("notes",e.target.value)} placeholder="What happened, what is confirmed, what remains unknown, next update time, contact and source links..."/></label>
 <div className="rowline"><h2 style={{margin:0}}>Tasks for incoming shift</h2><span className="pill">{open.length} OPEN • {done.length} DONE</span></div>
 <div className="grid" style={{gridTemplateColumns:"1fr 1fr",gap:10}}>
 <label style={{fontSize:12}}>Task title<input style={field} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="e.g. Confirm district administration update"/></label>
 <label style={{fontSize:12}}>Desk<select style={field} value={draft.desk} onChange={e=>setDraft({...draft,desk:e.target.value})}>{["India","World","Regional","Politics","Business","Sports","Weather","Editorial","Broadcast","Digital","Other"].map(x=><option key={x}>{x}</option>)}</select></label>
 <label style={{fontSize:12}}>Responsible person<input style={field} value={draft.owner} onChange={e=>setDraft({...draft,owner:e.target.value})} placeholder="Name / unassigned"/></label>
 <label style={{fontSize:12}}>Priority<select style={field} value={draft.priority} onChange={e=>setDraft({...draft,priority:e.target.value as Task["priority"]})}><option>High</option><option>Normal</option><option>Low</option></select></label>
 <label style={{fontSize:12}}>Due date / time<input style={field} value={draft.due} onChange={e=>setDraft({...draft,due:e.target.value})} placeholder="e.g. 6:30 PM"/></label>
 <label style={{fontSize:12}}>Task note<input style={field} value={draft.note} onChange={e=>setDraft({...draft,note:e.target.value})} placeholder="Evidence / contact / next action"/></label>
 </div><button type="button" style={btn} onClick={addTask}>+ Add handover task</button>
 {data.tasks.length===0?<div className="proof">No handover tasks yet.</div>:data.tasks.map(t=><article className="story" key={t.id} style={{display:"grid",gap:8}}>
 <div className="rowline"><strong>{t.title}</strong><span className={t.priority==="High"?"status warn":"tag"}>{t.priority}</span></div>
 <div className="muted" style={{fontSize:11}}>{t.desk} desk • {t.owner||"Unassigned"} • Due: {t.due||"Not set"}</div>
 {t.note&&<p className="muted" style={{fontSize:12,margin:0}}>{t.note}</p>}
 <div className="rowline" style={{justifyContent:"flex-start",flexWrap:"wrap"}}><select aria-label={"Task status: "+t.title} style={{...field,width:"auto"}} value={t.status} onChange={e=>patchTask(t.id,{status:e.target.value as Task["status"]})}><option>Open</option><option>In progress</option><option>Done</option></select><button type="button" style={btn} onClick={()=>removeTask(t.id)}>Remove</button></div>
 </article>)}
 <div className="rowline" style={{flexWrap:"wrap"}}><button type="button" style={btn} onClick={save} disabled={!ready}>Save handover</button><button type="button" style={btn} onClick={exportFile}>Export JSON</button><button type="button" style={btn} onClick={exportText}>Export TXT</button></div>
 <div className="proof" role="status">{notice}</div>
 </section><aside className="side panel" style={{display:"grid",alignContent:"start",gap:12}}>
 <h2 style={{margin:0}}>Shift snapshot</h2><div className="proof"><div className="stat">{open.length}</div><div className="statlabel">Open / in-progress tasks</div></div><div className="proof"><div className="stat">{progress}%</div><div className="statlabel">Tasks marked done</div><div style={{height:7,background:"#1b2b41",borderRadius:20,overflow:"hidden",marginTop:10}}><div style={{height:"100%",width:progress+"%",background:"#d4af37"}}/></div></div>
 <div className="proof"><strong>Incoming editor checklist</strong><ul style={{paddingLeft:18,lineHeight:1.9,fontSize:12,marginBottom:0}}><li>Recheck developing stories and timestamps</li><li>Open source links and confirm latest update</li><li>Review disputed / unverified claims</li><li>Check correction requests and legal concerns</li><li>Confirm assignments with desk owners</li><li>Get editor sign-off before publication</li></ul></div>
 <div className="proof"><strong>Storage note</strong><p style={{fontSize:12,lineHeight:1.6,margin:0}}>Saved in this browser only. Export a copy to share with the incoming shift. It does not sync to another device or send reminders.</p></div>
 </aside></div>;
}
