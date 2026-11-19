import "./style.css";
import { supabase, supabaseConfigured } from "./lib/supabase.js";

const sample = {
  retailers: [
    {name:"Shree Ganesh Stores", area:"Bank More", due:18400, status:"Active"},
    {name:"Maa Durga Traders", area:"Hirapur", due:9200, status:"Active"},
    {name:"City Mart", area:"Saraidhela", due:0, status:"Active"},
    {name:"New Bharat General", area:"Jharia", due:12600, status:"Follow up"},
    {name:"Om Retail Point", area:"Kusunda", due:5400, status:"Active"}
  ],
  orders: [
    {id:"RP-2048",retailer:"Shree Ganesh Stores",amount:24500,status:"Processing",time:"10:42 AM"},
    {id:"RP-2047",retailer:"Maa Durga Traders",amount:12800,status:"Packed",time:"10:18 AM"},
    {id:"RP-2046",retailer:"City Mart",amount:8750,status:"Delivered",time:"09:56 AM"},
    {id:"RP-2045",retailer:"New Bharat General",amount:16400,status:"Delivered",time:"Yesterday"}
  ],
  stock: [
    {name:"Unifresh Detergent 1kg",sku:"UF-1001",stock:84,unit:"pcs",tone:"good"},
    {name:"CarePlus Diaper M",sku:"CP-2204",stock:18,unit:"packs",tone:"low"},
    {name:"Shine Dishwash Bar",sku:"SD-3102",stock:126,unit:"pcs",tone:"good"},
    {name:"SoftCare Sanitary Pads",sku:"SC-4100",stock:9,unit:"boxes",tone:"critical"}
  ]
};
const saved = JSON.parse(localStorage.getItem("retailpulse-demo") || "{}");
const state = {tab:"Overview", hindi:false, orders:saved.orders || sample.orders, retailers:saved.retailers || sample.retailers, user:null, businessName:"", role:""};
const money = n => "₹" + Number(n).toLocaleString("en-IN");
const labels = {
  Overview:["Overview","अवलोकन"], Orders:["Orders","ऑर्डर"], Retailers:["Retailers","रिटेलर्स"], Inventory:["Inventory","स्टॉक"], Collections:["Collections","कलेक्शन"], Team:["Field team","फील्ड टीम"], Reports:["Reports","रिपोर्ट"]
};
function persist(){localStorage.setItem("retailpulse-demo",JSON.stringify({orders:state.orders,retailers:state.retailers}));}
function icon(name){
 const paths={grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',cart:'<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',box:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/>',wallet:'<rect x="2" y="5" width="20" height="15" rx="2"/><path d="M2 9h20M16 15h2"/>',users2:'<circle cx="9" cy="7" r="4"/><path d="M2 21a7 7 0 0 1 14 0M19 8v6m3-3h-6"/>',chart:'<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-5 5"/>',plus:'<path d="M12 5v14M5 12h14"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',arrow:'<path d="M5 12h14m-7-7 7 7-7 7"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>'};
 return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(paths[name]||paths.grid)+'</svg>';
}
function nav(){return Object.keys(labels).map((key,i)=>`<button class="nav-item ${state.tab===key?'active':''}" data-tab="${key}">${icon(["grid","cart","users","box","wallet","users2","chart"][i])}<span>${state.hindi?labels[key][1]:labels[key][0]}</span>${key==="Orders"?'<b class="nav-count">8</b>':""}</button>`).join("");}
function stat(label,value,change,sub,ico,up=true){return `<article class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon(ico)}</span></div><div class="stat-value">${value}</div><div class="stat-foot"><span class="${up?'positive':'negative'}">${change}</span><span>${sub}</span></div></article>`;}
function overview(){
 return `<div class="welcome-row"><div><div class="eyebrow">WEDNESDAY, 19 NOVEMBER 2026</div><h1>Good morning, Nitesh <span>✦</span></h1><p class="muted">Here’s what’s happening across your distribution business today.</p></div><button class="primary-btn" id="new-order">${icon("plus")} New order</button></div>
 <section class="stats-grid">${stat("Today's sales",money(68450),"+12.8%","vs yesterday","chart")}${stat("Orders received","28","+6 orders","today","cart")}${stat("Pending collections",money(45200),"₹8,400 due","in next 7 days","wallet",false)}${stat("Active retailers","186","+14","this month","users")}</section>
 <section class="main-grid"><article class="panel sales-panel"><div class="panel-head"><div><h3>Sales overview</h3><p class="muted">Your revenue performance</p></div><select id="period"><option>This week</option><option>This month</option><option>Last 7 days</option></select></div><div class="chart-total"><strong>₹4,82,650</strong><span class="positive">↗ 8.4%</span><small>vs previous period</small></div><div class="chart"><div class="y-labels"><span>₹1.5L</span><span>₹1.0L</span><span>₹50k</span><span>₹0</span></div><svg viewBox="0 0 620 190" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#5575ed" stop-opacity=".22"/><stop offset="1" stop-color="#5575ed" stop-opacity="0"/></linearGradient></defs><path d="M0 145 C35 135 48 102 88 112 S145 150 178 104 S235 85 266 96 S320 55 355 72 S412 120 444 66 S500 60 532 42 S584 58 620 18 L620 190 L0 190Z" fill="url(#fill)"/><path d="M0 145 C35 135 48 102 88 112 S145 150 178 104 S235 85 266 96 S320 55 355 72 S412 120 444 66 S500 60 532 42 S584 58 620 18" fill="none" stroke="#5876ee" stroke-width="3" vector-effect="non-scaling-stroke"/></svg><div class="x-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div></article>
 <article class="panel"><div class="panel-head"><div><h3>Collection health</h3><p class="muted">Outstanding payments</p></div><span class="soft-tag">This month</span></div><div class="donut-wrap"><div class="donut"><div><strong>72%</strong><small>Collected</small></div></div></div><div class="legend"><div><i class="dot blue"></i><span>Collected</span><b>₹1,16,400</b></div><div><i class="dot amber"></i><span>Pending</span><b>₹45,200</b></div><div><i class="dot red"></i><span>Overdue</span><b>₹18,600</b></div></div><button class="text-btn" data-tab="Collections">View collections ${icon("arrow")}</button></article></section>
 <section class="panel table-panel"><div class="panel-head"><div><h3>Recent orders</h3><p class="muted">Latest activity from your retailers</p></div><button class="text-btn" data-tab="Orders">View all ${icon("arrow")}</button></div>${orderTable(4)}</section>
 <section class="bottom-grid"><article class="panel"><div class="panel-head"><div><h3>Stock alerts</h3><p class="muted">Products that need attention</p></div><button class="text-btn" data-tab="Inventory">Manage stock</button></div>${sample.stock.filter(x=>x.stock<25).map(x=>`<div class="stock-alert"><div class="product-avatar">${x.name.slice(0,1)}</div><div class="stock-name"><b>${x.name}</b><small>${x.sku}</small></div><span class="stock-pill ${x.tone}">${x.stock} ${x.unit} left</span></div>`).join("")}</article>
 <article class="panel"><div class="panel-head"><div><h3>Field team today</h3><p class="muted">Live attendance snapshot</p></div><button class="text-btn" data-tab="Team">View team</button></div><div class="team-row"><div class="avatar-stack"><span>AK</span><span>RS</span><span>PM</span><span>+3</span></div><div><b>6 of 8 present</b><small>2 team members not checked in</small></div><span class="attendance">75%</span></div><div class="progress-track"><div style="width:75%"></div></div></article></section>`;
}
function orderTable(limit=20){return `<div class="table-scroll"><table><thead><tr><th>ORDER ID</th><th>RETAILER</th><th>TIME</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>${state.orders.slice(0,limit).map(o=>`<tr><td class="order-id">${o.id}</td><td>${o.retailer}</td><td class="muted">${o.time}</td><td class="amount">${money(o.amount)}</td><td><span class="status ${o.status.toLowerCase()}">${o.status}</span></td></tr>`).join("")}</tbody></table></div>`;}
function pageContent(){
 if(state.tab==="Overview")return overview();
 if(state.tab==="Orders")return `<div class="welcome-row"><div><div class="eyebrow">SALES OPERATIONS</div><h1>Orders</h1><p class="muted">Track every retailer order from booking to delivery.</p></div><button class="primary-btn" id="new-order">${icon("plus")} New order</button></div><section class="stats-grid">${stat("Total orders",state.orders.length,"+8.2%","this week","cart")}${stat("Processing","8","4 due today","to dispatch","box")}${stat("Delivered","16","+3","today","chart")}${stat("Order value",money(state.orders.reduce((a,b)=>a+b.amount,0)),"+11%","this week","wallet")}</section><section class="panel table-panel"><div class="panel-head"><div><h3>All orders</h3><p class="muted">Demo records stored on this device</p></div><input class="search" id="order-search" placeholder="Search orders..." /></div>${orderTable()}</section>`;
 if(state.tab==="Retailers")return `<div class="welcome-row"><div><div class="eyebrow">CUSTOMER RELATIONSHIPS</div><h1>Retailers</h1><p class="muted">Your retailer network and account health.</p></div><button class="primary-btn" id="new-retailer">${icon("plus")} Add retailer</button></div><section class="stats-grid">${stat("Total retailers","186","+14","this month","users")}${stat("Active accounts","172","92.5%","of total","chart")}${stat("Credit outstanding",money(89200),"12 accounts","need follow-up","wallet",false)}${stat("New this month","14","+4","vs last month","users2")}</section><section class="panel table-panel"><div class="panel-head"><h3>Retailer directory</h3><input class="search" id="retailer-search" placeholder="Search retailer..." /></div><div class="table-scroll"><table><thead><tr><th>RETAILER</th><th>AREA</th><th>OUTSTANDING</th><th>ACCOUNT</th></tr></thead><tbody>${state.retailers.map(r=>`<tr><td><b>${r.name}</b></td><td class="muted">${r.area}</td><td class="amount">${money(r.due)}</td><td><span class="status ${r.status==="Active"?"delivered":"processing"}">${r.status}</span></td></tr>`).join("")}</tbody></table></div></section>`;
 if(state.tab==="Inventory")return `<div class="welcome-row"><div><div class="eyebrow">WAREHOUSE CONTROL</div><h1>Inventory</h1><p class="muted">Keep your fast-moving products available.</p></div><button class="primary-btn" id="stock-action">${icon("plus")} Stock entry</button></div><section class="stats-grid">${stat("SKUs tracked","248","+12","new items","box")}${stat("Stock value",money(842500),"+5.2%","this month","wallet")}${stat("Low stock items","7","3 critical","need reorder","chart",false)}${stat("Out of stock","2","Action needed","today","box",false)}</section><section class="panel table-panel"><div class="panel-head"><h3>Product stock</h3><input class="search" placeholder="Search products..." /></div><div class="table-scroll"><table><thead><tr><th>PRODUCT</th><th>SKU</th><th>AVAILABLE</th><th>HEALTH</th></tr></thead><tbody>${sample.stock.map(s=>`<tr><td><b>${s.name}</b></td><td class="muted">${s.sku}</td><td>${s.stock} ${s.unit}</td><td><span class="status ${s.tone==="good"?"delivered":"processing"}">${s.tone==="good"?"Healthy":s.tone==="low"?"Low stock":"Critical"}</span></td></tr>`).join("")}</tbody></table></div></section>`;
 if(state.tab==="Collections")return `<div class="welcome-row"><div><div class="eyebrow">CASH FLOW</div><h1>Collections</h1><p class="muted">Know what is due, what is collected and what needs a follow-up.</p></div><button class="primary-btn" id="record-payment">${icon("plus")} Record payment</button></div><section class="stats-grid">${stat("Collected this month",money(116400),"+18%","vs last month","wallet")}${stat("Pending",money(45200),"₹8,400","due this week","chart",false)}${stat("Overdue",money(18600),"5 retailers","follow-up required","users",false)}${stat("Collection rate","72%","+4.5 pts","this month","chart")}</section><section class="panel"><div class="panel-head"><h3>Follow-up priority</h3><span class="soft-tag">Oldest due first</span></div>${state.retailers.filter(r=>r.due>0).sort((a,b)=>b.due-a.due).map(r=>`<div class="stock-alert"><div class="product-avatar">${r.name.slice(0,1)}</div><div class="stock-name"><b>${r.name}</b><small>${r.area}</small></div><strong class="amount">${money(r.due)}</strong><button class="small-btn" data-payment="${r.name}">Collect</button></div>`).join("")}</section>`;
 if(state.tab==="Team")return `<div class="welcome-row"><div><div class="eyebrow">FIELD OPERATIONS</div><h1>Field team</h1><p class="muted">Attendance and daily route activity.</p></div><button class="primary-btn" id="team-report">${icon("chart")} Daily report</button></div><section class="stats-grid">${stat("Team members","8","6 present","today","users")}${stat("Retail visits","34","+9","vs yesterday","chart")}${stat("Orders booked","28","₹68,450","field sales","cart")}${stat("Collections",money(32400),"+14%","today","wallet")}</section><section class="panel"><div class="panel-head"><h3>Today's attendance</h3><span class="soft-tag">19 Nov 2026</span></div><div class="team-row"><div class="avatar-stack"><span>AK</span><span>RS</span><span>PM</span><span>SK</span></div><div><b>6 team members present</b><small>2 pending check-in</small></div><span class="attendance">75%</span></div><div class="progress-track"><div style="width:75%"></div></div></section>`;
 return `<div class="welcome-row"><div><div class="eyebrow">BUSINESS INTELLIGENCE</div><h1>Reports</h1><p class="muted">A clearer view of sales, collections and team productivity.</p></div><button class="primary-btn" id="export-report">Export report</button></div><section class="stats-grid">${stat("Monthly sales",money(482650),"+8.4%","vs last period","chart")}${stat("Gross margin","18.6%","+1.2 pts","vs last period","chart")}${stat("Average order",money(2445),"+6.1%","vs last period","cart")}${stat("Repeat retailers","84%","+3.4 pts","vs last period","users")}</section><section class="panel"><h3>Business snapshot</h3><p class="muted">Reports will become live once your secure business database is connected. This preview uses illustrative sample figures.</p></section>`;
}
function render(){
 document.getElementById("app").innerHTML=`<div class="app-shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">R</div><div><b>retail<span>pulse</span></b><small>DISTRIBUTOR SUITE</small></div></div><div class="workspace"><div class="workspace-avatar">LE</div><div><b>My Business</b><small>Demo workspace</small></div><span>⌄</span></div><div class="nav-label">WORKSPACE</div><nav>${nav()}</nav><div class="sidebar-bottom"><div class="help-card"><div class="help-icon">✦</div><b>Need a hand?</b><p>Our team is here to help you grow.</p><button>Visit help centre ${icon("arrow")}</button></div><div class="profile"><div class="profile-avatar">NK</div><div><b>Nitesh Kumar</b><small>Business owner</small></div><span>•••</span></div></div></aside><main class="main"><header class="topbar"><button class="mobile-menu" id="mobile-menu">${icon("menu")}</button><div class="crumb">Workspace <span>/</span> <b>${state.tab}</b></div><div class="top-actions"><button class="icon-btn" id="language">${state.hindi?"EN":"हि"}</button><button class="icon-btn" aria-label="Search">${icon("search")}</button><button class="icon-btn notification" aria-label="Notifications">${icon("bell")}<i></i></button><div class="top-avatar">NK</div></div></header><div class="content">${pageContent()}<footer>© 2026 RetailPulse <span>•</span> Demo workspace — sample data only</footer></div></main></div>`;
 document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{state.tab=b.dataset.tab;render();}));
 document.getElementById("language")?.addEventListener("click",()=>{state.hindi=!state.hindi;render();});
 document.getElementById("new-order")?.addEventListener("click",newOrder);
 document.getElementById("new-retailer")?.addEventListener("click",newRetailer);
 document.getElementById("record-payment")?.addEventListener("click",()=>alert("Payment recording will be enabled after secure database setup."));
 document.querySelectorAll("[data-payment]").forEach(b=>b.addEventListener("click",()=>alert("Payment collection for "+b.dataset.payment+" will be enabled after secure database setup.")));
 document.getElementById("mobile-menu")?.addEventListener("click",()=>document.querySelector(".sidebar").classList.toggle("show"));
 document.getElementById("export-report")?.addEventListener("click",()=>{const csv="Order, Retailer, Amount, Status\n"+state.orders.map(o=>[o.id,o.retailer,o.amount,o.status].join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="retailpulse-demo-orders.csv";a.click();URL.revokeObjectURL(a.href);});
 document.getElementById("order-search")?.addEventListener("input",e=>{document.querySelectorAll("tbody tr").forEach(r=>r.hidden=!r.innerText.toLowerCase().includes(e.target.value.toLowerCase()));});
 document.getElementById("retailer-search")?.addEventListener("input",e=>{document.querySelectorAll("tbody tr").forEach(r=>r.hidden=!r.innerText.toLowerCase().includes(e.target.value.toLowerCase()));});
}
function newOrder(){
 const retailer=prompt("Retailer name (demo):","New Retailer");if(!retailer)return;
 const amount=Number(prompt("Order amount in ₹:","5000"));if(!Number.isFinite(amount)||amount<=0)return alert("Enter a valid amount.");
 state.orders.unshift({id:"RP-"+(2049+state.orders.length),retailer,amount,status:"Processing",time:"Just now"});persist();render();
}
function newRetailer(){
 const name=prompt("Retailer / shop name:");if(!name)return;const area=prompt("Area / locality:","Dhanbad")||"Dhanbad";
 state.retailers.unshift({name,area,due:0,status:"Active"});persist();render();
}

function authGate(message,email){
 const app=document.getElementById("app");
 app.innerHTML='<main class="auth-shell"><section class="auth-card"><div class="auth-brand"><div class="brand-mark">R</div><div><b>retail<span>pulse</span></b><small>DISTRIBUTOR SUITE</small></div></div><div class="auth-eyebrow">YOUR BUSINESS, IN CONTROL</div><h1>Welcome to RetailPulse</h1><p class="muted">Sign in securely to set up your distributor workspace.</p><form id="login-form"><label>Email address</label><input id="auth-email" type="email" autocomplete="email" required placeholder="you@business.com"/><button class="primary-btn auth-submit" type="submit">Send secure sign-in link</button></form><p class="auth-message" id="auth-message"></p><small class="auth-foot">A secure sign-in link will be sent to your email. No password required.</small></section></main>';
 const input=document.getElementById("auth-email");if(input&&email)input.value=email;
 const out=document.getElementById("auth-message");if(out&&message)out.textContent=message;
 document.getElementById("login-form").addEventListener("submit",async e=>{
  e.preventDefault();const button=e.currentTarget.querySelector("button");const address=input.value.trim();
  button.disabled=true;button.textContent="Sending link…";
  const result=await supabase.auth.signInWithOtp({email:address,options:{emailRedirectTo:window.location.origin}});
  const target=document.getElementById("auth-message");
  if(target)target.textContent=result.error?result.error.message:"Check your inbox for the secure sign-in link.";
  button.disabled=false;button.textContent="Send secure sign-in link";
 });
}
function onboardingGate(user){
 const app=document.getElementById("app");
 app.innerHTML='<main class="auth-shell"><section class="auth-card"><div class="auth-brand"><div class="brand-mark">R</div><div><b>retail<span>pulse</span></b><small>DISTRIBUTOR SUITE</small></div></div><div class="auth-eyebrow">FIRST-TIME SETUP</div><h1>Create your business workspace</h1><p class="muted">Your account is signed in. Add the business name to create its private workspace.</p><form id="business-form"><label>Business / distributor name</label><input id="business-name" maxlength="120" minlength="2" required placeholder="e.g. ABC Distributors"/><label>Preferred language</label><select id="business-language"><option value="en">English</option><option value="hi">हिन्दी</option></select><button class="primary-btn auth-submit" type="submit">Create my workspace</button></form><p class="auth-message" id="business-message"></p><button class="text-btn auth-signout" id="auth-signout">Sign out</button></section></main>';
 document.getElementById("business-form").addEventListener("submit",async e=>{
  e.preventDefault();const button=e.currentTarget.querySelector("button");const name=document.getElementById("business-name").value.trim();const language=document.getElementById("business-language").value;
  button.disabled=true;button.textContent="Creating workspace…";
  const result=await supabase.rpc("create_business_for_current_user",{p_name:name,p_language:language});
  if(result.error){document.getElementById("business-message").textContent=result.error.message;button.disabled=false;button.textContent="Create my workspace";return;}
  await loadBusiness(user);
 });
 document.getElementById("auth-signout").addEventListener("click",()=>supabase.auth.signOut());
}
async function loadBusiness(user){
 state.user=user;
 const result=await supabase.from("business_memberships").select("business_id,role,businesses(name)").eq("user_id",user.id).eq("active",true).limit(1).maybeSingle();
 if(result.error){authGate("Could not load your workspace: "+result.error.message,user.email);return;}
 if(!result.data){onboardingGate(user);return;}
 state.businessName=result.data.businesses?.name||"My Business";state.role=result.data.role||"member";render();
 const ws=document.querySelector(".workspace b"),sub=document.querySelector(".workspace small"),profile=document.querySelector(".profile b"),role=document.querySelector(".profile small");
 if(ws)ws.textContent=state.businessName;if(sub)sub.textContent="Private workspace";if(profile)profile.textContent=user.email||"Account";if(role)role.textContent=state.role;
 const actions=document.querySelector(".top-actions");
 if(actions&&!document.getElementById("auth-signout")){const b=document.createElement("button");b.id="auth-signout";b.className="icon-btn";b.textContent="↪";b.title="Sign out";actions.appendChild(b);b.addEventListener("click",()=>supabase.auth.signOut());}
}
async function initRetailPulse(){
 if(!supabaseConfigured){authGate("Backend setup is incomplete.");return;}
 const result=await supabase.auth.getSession();const session=result.data?.session;
 if(session?.user)await loadBusiness(session.user);else authGate();
 supabase.auth.onAuthStateChange((_event,session)=>{if(session?.user)queueMicrotask(()=>loadBusiness(session.user));else{state.user=null;state.businessName="";state.role="";authGate();}});
}
initRetailPulse();
