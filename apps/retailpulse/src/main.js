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
const state = {tab:"Overview", hindi:false, orders:sample.orders, retailers:sample.retailers, user:null, businessId:"", businessName:"", role:"", liveData:false, dataError:"", products:[], stockBalances:[], collections:[],visits:[],dailyReports:[]};
const money = n => "₹" + Number(n).toLocaleString("en-IN");
const localDate = () => {const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10);};
const labels = {
  Overview:["Overview","अवलोकन"], Orders:["Orders","ऑर्डर"], Retailers:["Retailers","रिटेलर्स"], Inventory:["Inventory","स्टॉक"], Collections:["Collections","कलेक्शन"], Team:["Field team","फील्ड टीम"], Reports:["Reports","रिपोर्ट"]
};
function persist(){/* Live workspace data is stored in Supabase. */}
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
 if(state.tab==="Inventory"){const products=state.products;const balances=state.stockBalances;const low=balances.filter(x=>Number(x.on_hand)<=Number(x.reorder_level));return `<div class="welcome-row"><div><div class="eyebrow">CATALOGUE & WAREHOUSE</div><h1>Inventory</h1><p class="muted">Live stock ledger and product catalogue.</p></div><div><button class="primary-btn" id="stock-receipt">${icon("plus")} Stock received</button> <button class="secondary-btn" id="new-product">${icon("plus")} Add product</button></div></div><section class="stats-grid">${stat("Active products",products.length,"Live catalogue","this workspace","box")}${stat("Units on hand",balances.reduce((n,p)=>n+Number(p.on_hand||0),0),"Ledger balance","all products","box")}${stat("Reorder alerts",low.length,"At or below reorder","check stock","chart",false)}${stat("Stock valuation","—","Cost valuation","not enabled","wallet",false)}</section><section class="panel table-panel"><div class="panel-head"><h3>Stock position</h3><input class="search" id="product-search" placeholder="Search name or SKU..." /></div><div class="table-scroll"><table><thead><tr><th>PRODUCT</th><th>SKU</th><th>ON HAND</th><th>REORDER LEVEL</th><th>STATUS</th><th>SELLING PRICE</th></tr></thead><tbody>${balances.map(p=>{const isLow=Number(p.on_hand)<=Number(p.reorder_level);return `<tr><td><b>${p.name}</b></td><td class="muted">${p.sku}</td><td>${p.on_hand} ${p.unit}</td><td>${p.reorder_level}</td><td><span class="status ${isLow?"processing":"delivered"}">${isLow?"Reorder":"Available"}</span></td><td class="amount">${money(products.find(x=>x.id===p.product_id)?.sale_price||0)}</td></tr>`}).join("")||'<tr><td colspan="6" class="muted">No stock records yet. Add products and record an opening stock receipt.</td></tr>'}</tbody></table></div></section>`;}
 if(state.tab==="Collections"){const due=state.retailers.reduce((n,r)=>n+Math.max(0,r.due),0),paid=state.collections.reduce((n,x)=>n+Number(x.amount||0),0);return `<div class="welcome-row"><div><div class="eyebrow">CASH FLOW · LIVE DATA</div><h1>Collections</h1><p class="muted">Record receipts and track retailer-wise outstanding.</p></div><button class="primary-btn" id="record-payment">${icon("plus")} Record payment</button></div><section class="stats-grid">${stat("Total outstanding",money(due),"Live ledger","retailer balances","wallet",false)}${stat("Receipts loaded",money(paid),"Latest 50","collection history","chart")}${stat("Retailers with dues",state.retailers.filter(r=>r.due>0).length,"Follow-up list","positive balances","users",false)}${stat("Recent receipts",state.collections.length,"Latest 50","records","wallet")}</section><section class="panel"><div class="panel-head"><h3>Retailer outstanding</h3><span class="soft-tag">Highest due first</span></div><div class="table-scroll"><table><thead><tr><th>RETAILER</th><th>AREA</th><th>SALES</th><th>COLLECTED</th><th>OUTSTANDING</th><th>ACTION</th></tr></thead><tbody>${[...state.retailers].sort((a,b)=>b.due-a.due).map(r=>`<tr><td><b>${r.name}</b></td><td>${r.area}</td><td class="amount">${money(r.sales)}</td><td class="amount">${money(r.collected)}</td><td class="amount"><b>${money(r.due)}</b></td><td><button class="small-btn" data-payment="${r.id}">Collect</button></td></tr>`).join("")||'<tr><td colspan="6" class="muted">No retailer balances yet.</td></tr>'}</tbody></table></div></section><section class="panel table-panel"><div class="panel-head"><h3>Recent receipts</h3></div><div class="table-scroll"><table><thead><tr><th>DATE</th><th>RETAILER</th><th>METHOD</th><th>REFERENCE</th><th>AMOUNT</th></tr></thead><tbody>${state.collections.map(x=>`<tr><td>${new Date(x.collected_at).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}</td><td>${x.retailers?.name||"Retailer"}</td><td>${x.method}</td><td>${x.reference||"—"}</td><td class="amount">${money(x.amount)}</td></tr>`).join("")||'<tr><td colspan="5" class="muted">No receipts recorded yet.</td></tr>'}</tbody></table></div></section>`}
 if(state.tab==="Team"){const today=localDate(),visits=state.visits.filter(v=>v.visited_at?.slice(0,10)===today),reports=state.dailyReports.filter(r=>r.report_date===today);return `<div class="welcome-row"><div><div class="eyebrow">FIELD OPERATIONS · LIVE</div><h1>Field team</h1><p class="muted">Retailer visits and daily salesperson reports.</p></div><div><button class="secondary-btn" id="team-report">${icon("chart")} Submit report</button> <button class="primary-btn" id="add-visit">${icon("plus")} Log visit</button></div></div><section class="stats-grid">${stat("Visits today",visits.length,"Live visit log","today","users")}${stat("Orders today",state.orders.filter(o=>o.time?.includes(new Date().toLocaleDateString("en-IN"))).length,"Order register","loaded orders","cart")}${stat("Reports submitted",reports.length,"Daily reports","today","chart")}${stat("Active retailers",state.retailers.length,"Workspace","directory","users")}</section><section class="panel"><div class="panel-head"><h3>Recent retailer visits</h3><span class="soft-tag">Latest 100</span></div><div class="table-scroll"><table><thead><tr><th>TIME</th><th>RETAILER</th><th>STATUS</th><th>NOTES</th></tr></thead><tbody>${state.visits.map(v=>`<tr><td>${new Date(v.visited_at).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}</td><td><b>${v.retailers?.name||"Retailer"}</b></td><td><span class="status ${v.visit_status==="not_available"?"processing":"delivered"}">${v.visit_status.replaceAll("_"," ")}</span></td><td>${v.notes||"—"}</td></tr>`).join("")||'<tr><td colspan="4" class="muted">No visits logged yet.</td></tr>'}</tbody></table></div></section><section class="panel"><div class="panel-head"><h3>Daily reports</h3><span class="soft-tag">Latest 30</span></div><div class="table-scroll"><table><thead><tr><th>DATE</th><th>SALESPERSON</th><th>VISITS</th><th>ORDERS</th><th>COLLECTIONS</th><th>NOTES</th></tr></thead><tbody>${state.dailyReports.map(r=>`<tr><td>${r.report_date}</td><td>${r.salesperson_id===state.user?.id?"You":r.salesperson_id.slice(0,8)}</td><td>${r.visits_count}</td><td>${r.orders_count}</td><td class="amount">${money(r.collection_total)}</td><td>${r.notes||"—"}</td></tr>`).join("")||'<tr><td colspan="6" class="muted">No daily reports submitted.</td></tr>'}</tbody></table></div></section>`}
 return `<div class="welcome-row"><div><div class="eyebrow">BUSINESS INTELLIGENCE</div><h1>Reports</h1><p class="muted">A clearer view of sales, collections and team productivity.</p></div><button class="primary-btn" id="export-report">Export report</button></div><section class="stats-grid">${stat("Monthly sales",money(482650),"+8.4%","vs last period","chart")}${stat("Gross margin","18.6%","+1.2 pts","vs last period","chart")}${stat("Average order",money(2445),"+6.1%","vs last period","cart")}${stat("Repeat retailers","84%","+3.4 pts","vs last period","users")}</section><section class="panel"><h3>Business snapshot</h3><p class="muted">Reports will become live once your secure business database is connected. This preview uses illustrative sample figures.</p></section>`;
}
function render(){
 document.getElementById("app").innerHTML=`<div class="app-shell"><aside class="sidebar"><div class="brand"><div class="brand-mark">R</div><div><b>retail<span>pulse</span></b><small>DISTRIBUTOR SUITE</small></div></div><div class="workspace"><div class="workspace-avatar">LE</div><div><b>My Business</b><small>Demo workspace</small></div><span>⌄</span></div><div class="nav-label">WORKSPACE</div><nav>${nav()}</nav><div class="sidebar-bottom"><div class="help-card"><div class="help-icon">✦</div><b>Need a hand?</b><p>Our team is here to help you grow.</p><button>Visit help centre ${icon("arrow")}</button></div><div class="profile"><div class="profile-avatar">NK</div><div><b>Nitesh Kumar</b><small>Business owner</small></div><span>•••</span></div></div></aside><main class="main"><header class="topbar"><button class="mobile-menu" id="mobile-menu">${icon("menu")}</button><div class="crumb">Workspace <span>/</span> <b>${state.tab}</b></div><div class="top-actions"><button class="icon-btn" id="language">${state.hindi?"EN":"हि"}</button><button class="icon-btn" aria-label="Search">${icon("search")}</button><button class="icon-btn notification" aria-label="Notifications">${icon("bell")}<i></i></button><div class="top-avatar">NK</div></div></header><div class="content">${pageContent()}<footer>© 2026 RetailPulse <span>•</span> ${state.liveData?"Connected business workspace":"Demo preview"}</footer></div></main></div>`;
 document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{state.tab=b.dataset.tab;render();}));
 document.getElementById("language")?.addEventListener("click",()=>{state.hindi=!state.hindi;render();});
 document.getElementById("new-order")?.addEventListener("click",newOrder);
 document.getElementById("new-retailer")?.addEventListener("click",newRetailer);
 document.getElementById("new-product")?.addEventListener("click",newProduct);
 document.getElementById("stock-receipt")?.addEventListener("click",recordStockReceipt);
 document.getElementById("record-payment")?.addEventListener("click",()=>recordCollection());
 document.querySelectorAll("[data-payment]").forEach(b=>b.addEventListener("click",()=>recordCollection(b.dataset.payment)));
 document.querySelectorAll("[data-payment]").forEach(b=>b.addEventListener("click",()=>alert("Payment collection for "+b.dataset.payment+" will be enabled after secure database setup.")));
 document.getElementById("mobile-menu")?.addEventListener("click",()=>document.querySelector(".sidebar").classList.toggle("show"));
 document.getElementById("export-report")?.addEventListener("click",()=>{const csv="Order, Retailer, Amount, Status\n"+state.orders.map(o=>[o.id,o.retailer,o.amount,o.status].join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="retailpulse-demo-orders.csv";a.click();URL.revokeObjectURL(a.href);});
 document.getElementById("order-search")?.addEventListener("input",e=>{document.querySelectorAll("tbody tr").forEach(r=>r.hidden=!r.innerText.toLowerCase().includes(e.target.value.toLowerCase()));});
 document.getElementById("retailer-search")?.addEventListener("input",e=>{document.querySelectorAll("tbody tr").forEach(r=>r.hidden=!r.innerText.toLowerCase().includes(e.target.value.toLowerCase()));});
 document.getElementById("product-search")?.addEventListener("input",e=>{document.querySelectorAll("tbody tr").forEach(r=>r.hidden=!r.innerText.toLowerCase().includes(e.target.value.toLowerCase()));});
}
async function newOrder(){
 if(!state.liveData)return alert("Sign in to a business workspace first.");
 if(!state.retailers.length)return alert("Add a retailer before creating an order.");
 if(!state.products.length)return alert("Add products to your catalogue before creating an order.");
 const retailerList=state.retailers.map((r,i)=>`${i+1}. ${r.name} — ${r.area}`).join("\n");
 const retailerChoice=Number(prompt("Select retailer by number:\n"+retailerList,"1"));
 if(!Number.isInteger(retailerChoice)||retailerChoice<1||retailerChoice>state.retailers.length)return;
 const retailer=state.retailers[retailerChoice-1];
 const productList=state.products.filter(p=>p.active).map((p,i)=>`${i+1}. ${p.name} [${p.sku}] — ${money(p.sale_price)}/${p.unit}`).join("\n");
 const activeProducts=state.products.filter(p=>p.active);
 if(!activeProducts.length)return alert("No active products found.");
 const selected=prompt("Enter product numbers separated by commas:\n"+productList,"1");
 if(!selected)return;
 const indexes=[...new Set(selected.split(",").map(x=>Number(x.trim())))];
 if(indexes.some(i=>!Number.isInteger(i)||i<1||i>activeProducts.length))return alert("One or more product numbers are invalid.");
 const items=[];
 for(const index of indexes){
  const product=activeProducts[index-1];
  const quantity=Number(prompt("Quantity for "+product.name+" ("+product.unit+"):","1"));
  if(!Number.isFinite(quantity)||quantity<=0)return alert("Every quantity must be a positive number.");
  items.push({product_id:product.id,quantity});
 }
 const subtotal=items.reduce((sum,item)=>{const p=activeProducts.find(x=>x.id===item.product_id);return sum+Number(p.sale_price)*item.quantity;},0);
 const discount=Number(prompt("Order discount in ₹ (enter 0 if none):","0"));
 if(!Number.isFinite(discount)||discount<0||discount>subtotal)return alert("Enter a valid discount not exceeding the subtotal.");
 const result=await supabase.rpc("create_order_with_items",{p_business_id:state.businessId,p_retailer_id:retailer.id,p_items:items,p_discount:discount});
 if(result.error)return alert("Order could not be saved: "+result.error.message);
 const saved=Array.isArray(result.data)?result.data[0]:result.data;
 await loadBusinessData();render();
 alert("Order "+saved.order_number+" saved. Total: "+money(saved.total));
}
async function logFieldVisit(){
 if(!state.liveData||!state.user)return alert("Sign in to a business workspace first.");
 const rs=state.retailers;if(!rs.length)return alert("Add a retailer first.");
 const list=rs.map((r,i)=>`${i+1}. ${r.name}`).join("\n"),n=Number(prompt("Select retailer:\n"+list,"1"));if(!Number.isInteger(n)||n<1||n>rs.length)return;
 const statuses=["visited","order_taken","payment_collected","not_available","planned"],status=prompt("Visit status: "+statuses.join(", "),"visited");if(!statuses.includes(status))return alert("Invalid visit status.");
 const notes=prompt("Visit notes (optional):","")||"";
 const result=await supabase.from("field_visits").insert({business_id:state.businessId,retailer_id:rs[n-1].id,salesperson_id:state.user.id,visit_status:status,notes:notes.slice(0,1000)});
 if(result.error)return alert("Visit could not be saved: "+result.error.message);
 await loadBusinessData();render();alert("Retailer visit recorded.");
}
async function submitDailyReport(){
 if(!state.liveData||!state.user)return alert("Sign in to a business workspace first.");
 const today=new Date().toISOString().slice(0,10),mine=state.dailyReports.find(r=>r.report_date===today&&r.salesperson_id===state.user.id);
 const visits=Number(prompt("Total visits today:",String(mine?.visits_count??state.visits.filter(v=>v.salesperson_id===state.user.id&&v.visited_at?.slice(0,10)===today).length)));
 const orders=Number(prompt("Orders booked today:",String(mine?.orders_count??0))),collections=Number(prompt("Collections today (₹):",String(mine?.collection_total??0))),notes=prompt("Day summary / follow-up notes:",mine?.notes||"")||"";
 if(!Number.isInteger(visits)||visits<0||!Number.isInteger(orders)||orders<0||!Number.isFinite(collections)||collections<0)return alert("Enter valid non-negative report figures.");
 const payload={business_id:state.businessId,salesperson_id:state.user.id,report_date:today,visits_count:visits,orders_count:orders,collection_total:collections,notes:notes.slice(0,2000)};
 const result=await supabase.from("daily_reports").upsert(payload,{onConflict:"business_id,salesperson_id,report_date"});
 if(result.error)return alert("Report could not be saved: "+result.error.message);
 await loadBusinessData();render();alert("Daily report submitted.");
}
async function recordCollection(retailerId){
 if(!state.liveData)return alert("Sign in to a business workspace first.");
 const retailers=state.retailers;if(!retailers.length)return alert("Add a retailer first.");
 let retailer=retailerId?retailers.find(r=>r.id===retailerId):null;
 if(!retailer){const list=retailers.map((r,i)=>`${i+1}. ${r.name} — due ${money(r.due)}`).join("\n");const choice=Number(prompt("Select retailer:\n"+list,"1"));if(!Number.isInteger(choice)||choice<1||choice>retailers.length)return;retailer=retailers[choice-1];}
 const amount=Number(prompt("Collection amount from "+retailer.name+" (₹):",String(Math.max(0,retailer.due)||"")));
 if(!Number.isFinite(amount)||amount<=0)return alert("Enter a valid positive amount.");
 const method=prompt("Payment method: cash / upi / bank_transfer / cheque / other","upi");if(!["cash","upi","bank_transfer","cheque","other"].includes(method))return alert("Choose a supported payment method.");
 const reference=prompt("Transaction reference (optional):","")||"";
 const result=await supabase.rpc("record_retailer_collection",{p_business_id:state.businessId,p_retailer_id:retailer.id,p_amount:amount,p_method:method,p_order_id:null,p_reference:reference});
 if(result.error)return alert("Collection failed: "+result.error.message);
 await loadBusinessData();render();alert("Payment receipt recorded for "+retailer.name+".");
}
async function recordStockReceipt(){
 if(!state.liveData)return alert("Sign in to a business workspace first.");
 if(!["owner","manager"].includes(state.role))return alert("Only owner or manager can record stock received.");
 const active=state.products.filter(p=>p.active);if(!active.length)return alert("Add an active product first.");
 const list=active.map((p,i)=>`${i+1}. ${p.name} [${p.sku}]`).join("\n");
 const choice=Number(prompt("Choose product:\n"+list,"1"));if(!Number.isInteger(choice)||choice<1||choice>active.length)return;
 const product=active[choice-1],quantity=Number(prompt("Quantity received ("+product.unit+"):", "1"));
 if(!Number.isFinite(quantity)||quantity<=0)return alert("Enter a positive quantity.");
 const note=prompt("Supplier / purchase reference (optional):","")||"";
 const result=await supabase.rpc("record_stock_receipt",{p_business_id:state.businessId,p_product_id:product.id,p_quantity:quantity,p_note:note});
 if(result.error)return alert("Stock receipt failed: "+result.error.message);
 await loadBusinessData();render();alert("Stock receipt recorded for "+product.name+".");
}
async function newProduct(){
 if(!state.liveData)return alert("Sign in to a business workspace first.");
 if(!["owner","manager"].includes(state.role))return alert("Only the business owner or manager can add products.");
 const name=prompt("Product name:");if(!name)return;
 const sku=prompt("Unique SKU / product code:");if(!sku)return;
 const unit=prompt("Unit (pcs, box, pack, kg, litre):","pcs")||"pcs";
 const price=Number(prompt("Selling price in ₹:","0"));
 if(!Number.isFinite(price)||price<0)return alert("Enter a valid selling price.");
 const purchase=Number(prompt("Purchase price in ₹ (optional):","0"));
 if(!Number.isFinite(purchase)||purchase<0)return alert("Enter a valid purchase price.");
 const reorder=Number(prompt("Reorder alert quantity:","0"));
 if(!Number.isFinite(reorder)||reorder<0)return alert("Enter a valid reorder quantity.");
 const result=await supabase.from("products").insert({business_id:state.businessId,name:name.trim(),sku:sku.trim(),unit:unit.trim(),sale_price:price,purchase_price:purchase,reorder_level:reorder}).select("id,sku,name,unit,sale_price,purchase_price,reorder_level,active").single();
 if(result.error)return alert("Product could not be saved: "+result.error.message);
 await loadBusinessData();render();
}
async function newRetailer(){
 if(!state.liveData)return alert("Sign in to a business workspace first.");
 if(!["owner","manager"].includes(state.role))return alert("Only the business owner or manager can add retailers.");
 const name=prompt("Retailer / shop name:");if(!name)return;
 const area=prompt("Area / locality:","")||null;const phone=prompt("Phone number (optional):","")||null;
 const result=await supabase.from("retailers").insert({business_id:state.businessId,name:name.trim(),area,phone}).select("id,name,area,opening_balance,active").single();
 if(result.error)return alert("Retailer could not be saved: "+result.error.message);
 await loadBusinessData();render();
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
async function loadBusinessData(){
 state.dataError="";
 const results=await Promise.all([
  supabase.from("retailers").select("id,name,area,opening_balance,active").eq("business_id",state.businessId).eq("active",true).order("name"),
  supabase.from("orders").select("id,order_number,status,total,placed_at,retailers(name)").eq("business_id",state.businessId).order("placed_at",{ascending:false}).limit(100),
  supabase.from("products").select("id,sku,name,unit,sale_price,purchase_price,reorder_level,active").eq("business_id",state.businessId).order("name"),
  supabase.from("product_stock_balances").select("product_id,sku,name,unit,reorder_level,on_hand").eq("business_id",state.businessId).order("name"),
  supabase.from("retailer_outstanding_balances").select("retailer_id,name,phone,area,credit_limit,outstanding,lifetime_orders,lifetime_collections").eq("business_id",state.businessId).order("name"),
  supabase.from("collections").select("id,amount,method,reference,collected_at,retailers(name)").eq("business_id",state.businessId).order("collected_at",{ascending:false}).limit(50),
  supabase.from("field_visits").select("id,retailer_id,salesperson_id,visit_status,notes,visited_at,retailers(name)").eq("business_id",state.businessId).order("visited_at",{ascending:false}).limit(100),
  supabase.from("daily_reports").select("id,salesperson_id,report_date,visits_count,orders_count,collection_total,notes").eq("business_id",state.businessId).order("report_date",{ascending:false}).limit(30)
 ]);
 const rr=results[0],or=results[1],pr=results[2],sr=results[3],br=results[4],cr=results[5],vr=results[6],dr=results[7];
 if(rr.error||or.error||pr.error||sr.error||br.error||cr.error||vr.error||dr.error){state.dataError=rr.error?.message||or.error?.message||pr.error?.message||sr.error?.message||br.error?.message||cr.error?.message||vr.error?.message||dr.error?.message||"Unable to load workspace records.";state.retailers=[];state.orders=[];state.products=[];state.stockBalances=[];state.collections=[];state.visits=[];state.dailyReports=[];return;}
 state.retailers=(br.data||[]).map(r=>({id:r.retailer_id,name:r.name,phone:r.phone,area:r.area||"—",due:Number(r.outstanding||0),creditLimit:Number(r.credit_limit||0),collected:Number(r.lifetime_collections||0),sales:Number(r.lifetime_orders||0),status:"Active"}));
 state.orders=(or.data||[]).map(o=>({id:o.order_number,retailer:o.retailers?.name||"Retailer",amount:Number(o.total||0),status:o.status,time:new Date(o.placed_at).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})}));
 state.products=pr.data||[];state.stockBalances=sr.data||[];state.collections=cr.data||[];state.visits=vr.data||[];state.dailyReports=dr.data||[];
}
async function loadBusiness(user){
 state.user=user;
 const result=await supabase.from("business_memberships").select("business_id,role,businesses(name)").eq("user_id",user.id).eq("active",true).limit(1).maybeSingle();
 if(result.error){authGate("Could not load your workspace: "+result.error.message,user.email);return;}
 if(!result.data){onboardingGate(user);return;}
 state.businessId=result.data.business_id;state.businessName=result.data.businesses?.name||"My Business";state.role=result.data.role||"member";state.liveData=true;await loadBusinessData();render();
 const ws=document.querySelector(".workspace b"),sub=document.querySelector(".workspace small"),profile=document.querySelector(".profile b"),role=document.querySelector(".profile small");
 if(ws)ws.textContent=state.businessName;if(sub)sub.textContent="Private workspace";if(profile)profile.textContent=user.email||"Account";if(role)role.textContent=state.role;
 const actions=document.querySelector(".top-actions");
 if(actions&&!document.getElementById("auth-signout")){const b=document.createElement("button");b.id="auth-signout";b.className="icon-btn";b.textContent="↪";b.title="Sign out";actions.appendChild(b);b.addEventListener("click",()=>supabase.auth.signOut());}
}
async function initRetailPulse(){
 if(!supabaseConfigured){authGate("Backend setup is incomplete.");return;}
 const result=await supabase.auth.getSession();const session=result.data?.session;
 if(session?.user)await loadBusiness(session.user);else authGate();
 supabase.auth.onAuthStateChange((_event,session)=>{if(session?.user)queueMicrotask(()=>loadBusiness(session.user));else{state.user=null;state.businessId="";state.businessName="";state.role="";state.liveData=false;state.orders=[];state.retailers=[];authGate();}});
}
initRetailPulse();
