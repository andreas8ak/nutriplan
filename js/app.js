/* NutriPlan app: state, screens and actions. */
import { CUI, GOALS, GT, SLOTS, SL, RECIPES, PHOTOS, RB, TEAM, TB, DIRECTORY, WORKOUTS, HABITS, AUTO } from "./data.js";
/* ---------- icons ---------- */
const P={home:"M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5v-6h-5v6H4a1 1 0 0 1-1-1z",book:"M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3",cal:"M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",cart:"M3 4h2l2.2 10.3a1 1 0 0 0 1 .7h9.4a1 1 0 0 0 1-.7L20 8H6.2M9.5 20h.01M17 20h.01",team:"M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.5a6.5 6.5 0 0 1 3.5 5.5",user:"M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",chat:"M4 5h16v11H9l-5 4z",x:"M6 6l12 12M18 6 6 18",plus:"M12 5v14M5 12h14",check:"M5 12.5 10 17l9-10",clock:"M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",flame:"M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .3 1.6 1.2 2.6 2.5 3-1-2.6-.5-5.5 0-8z",search:"M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",leaf:"M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19l7-7",swap:"M7 7h12l-3-3M17 17H5l3 3",video:"M3 7h12v10H3zM15 10l6-3v10l-6-3"};
const ic=(n,s=20)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const art=r=>PHOTOS[r.id]?`<img src="${PHOTOS[r.id].src}" alt="${esc(r.name)}" loading="lazy">`:plate(r);
const credit=r=>{const p=PHOTOS[r.id];return p?`<p class="credit">Photo: <a href="${p.url}" target="_blank" rel="noopener">${esc(p.by)}</a>, ${esc(p.lic)}, via Wikimedia Commons</p>`:""};

/* ---------- dates ---------- */
const today=new Date();today.setHours(0,0,0,0);
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const TODAY=iso(today);
const TI=(today.getDay()+6)%7;
const monday=new Date(today);monday.setDate(today.getDate()-TI);
const WEEK=[...Array(7)].map((_,i)=>{const d=new Date(monday);d.setDate(monday.getDate()+i);return d});
const DOW=d=>d.toLocaleDateString("en-CA",{weekday:"short"});
const fmtWhen=ms=>new Date(ms).toLocaleString("en-CA",{weekday:"short",month:"short",day:"numeric",hour:"numeric",minute:"2-digit"});
function nextDow(dow,h,m){const d=new Date(today);d.setDate(d.getDate()+(((dow-d.getDay()+7)%7)||7));d.setHours(h,m,0,0);return d.getTime()}

/* ---------- state ---------- */
function defaults(){
  const plan={};plan[TODAY]={breakfast:"shakshuka",lunch:"fattoush",dinner:"teriyaki"};
  if(TI<6)plan[iso(WEEK[TI+1])]={breakfast:"yogurt",lunch:"miso",dinner:"fagioli"};
  const habits={};HABITS.forEach((h,i)=>{habits[h.id]=[...Array(7)].map((_,d)=>d<TI&&((d+i)%3!==2))});
  const ck=[];for(let i=4;i>=1;i--){const d=new Date(today);d.setDate(d.getDate()-7*i);ck.push({date:d.toLocaleDateString("en-CA",{month:"short",day:"numeric"}),w:[82.4,81.9,81.6,81.1][4-i],s:[6.5,7,7.2,6.8][4-i],e:[3,3,4,4][4-i],n:"",ex:true})}
  return{v:2,goals:["heart","lowgi"],kcal:1800,plan,eaten:{[TODAY+"|breakfast"]:true},sample:true,got:{},cui:"All",meal:"All",q:"",mine:false,day:TODAY,
    careTab:"messages",thread:"rd",work:{w1:TI>=1},habits,checkins:ck,
    threads:{rd:[{from:"rd",t:"Hi Andreas, I looked at your planner. Nice job getting protein in at breakfast this week.",time:"Mon 9:12 AM"},{from:"me",t:"Thanks! Is shakshuka OK most mornings?",time:"Mon 9:40 AM"},{from:"rd",t:"Yes, it fits your low-glycemic goal. Try the Greek yogurt bowl twice a week for variety.",time:"Mon 10:05 AM"}],pt:[{from:"pt",t:"Week 3 is uploaded. Full body A focuses on squats and rows. Log how the last set feels.",time:"Sun 6:20 PM"}],md:[{from:"md",t:"Your check-up results are ready. Happy to go over them at your next visit.",time:"Oct 14"}]},
    sessions:[{who:"rd",when:nextDow(4,16,30),type:"Video"},{who:"pt",when:nextDow(6,10,0),type:"In person"}],
    requests:{},share:{rd:["Meal plan","Check-ins","Shopping list"],pt:["Check-ins","Workout log"],md:["Check-ins"]},
    findRole:"All",bookWho:"rd",slot:null};
}
let S;
try{S=JSON.parse(localStorage.getItem("nutriplan-v2")||"null")}catch(e){S=null}
if(!S||S.v!==2)S=defaults();
if(!WEEK.some(d=>iso(d)===S.day))S.day=TODAY;
function save(){try{localStorage.setItem("nutriplan-v2",JSON.stringify(S))}catch(e){}}

/* ---------- helpers ---------- */
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function plate(r){let s=hash(r.id);const rnd=()=>{s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const[a,b,c]=r.col;let g="";
  for(let i=0;i<15;i++){const an=rnd()*6.283,rd=Math.sqrt(rnd())*33,x=100+Math.cos(an)*rd,y=70+Math.sin(an)*rd,rx=4+rnd()*8,ry=3+rnd()*5;g+=`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" transform="rotate(${(rnd()*180)|0} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${i%3?b:c}" opacity=".93"/>`}
  for(let i=0;i<10;i++){const an=rnd()*6.283,rd=Math.sqrt(rnd())*38;g+=`<circle cx="${(100+Math.cos(an)*rd).toFixed(1)}" cy="${(70+Math.sin(an)*rd).toFixed(1)}" r="1.6" fill="${c}"/>`}
  return`<svg viewBox="0 0 200 140" aria-hidden="true"><ellipse cx="104" cy="77" rx="61" ry="59" fill="rgba(0,0,0,.13)"/><circle cx="100" cy="70" r="60" fill="#fbfaf6"/><circle cx="100" cy="70" r="59.5" fill="none" stroke="rgba(0,0,0,.08)"/><circle cx="100" cy="70" r="47" fill="${a}"/>${g}</svg>`}
const cv=r=>`--c:${CUI[r.cui]}`;
function thumb(r){return`<button class="thumb" type="button" data-act="recipe" data-id="${r.id}" style="${cv(r)}" aria-label="Open ${esc(r.name)}">${art(r)}</button>`}
function targets(){const k=S.kcal;return{p:Math.round(k*.25/4),c:Math.round(k*.45/4),f:Math.round(k*.30/9)}}
function dayTotals(d,onlyEaten){const p=S.plan[d]||{};const t={k:0,p:0,c:0,f:0};SLOTS.forEach(s=>{const r=RB[p[s]];if(!r)return;if(onlyEaten&&!S.eaten[d+"|"+s])return;t.k+=r.kcal;t.p+=r.p;t.c+=r.c;t.f+=r.f});return t}
function recs(n){const pool=RECIPES.filter(r=>r.goals.some(g=>S.goals.includes(g)));const by={};pool.forEach(r=>(by[r.cui]=by[r.cui]||[]).push(r));const out=[];let i=0;const keys=Object.keys(by);while(out.length<n&&keys.some(k=>by[k][i])){keys.forEach(k=>{if(by[k][i]&&out.length<n)out.push(by[k][i])});i++}return out}
function bar(v,max,warm){return`<div class="bar ${warm?"warm":""}"><span style="width:${Math.min(100,max?v/max*100:0).toFixed(1)}%"></span></div>`}
function toast(t){const el=$("#toast");el.textContent=t;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,2400)}
function shortDay(d){return new Date(d+"T00:00").toLocaleDateString("en-CA",{weekday:"long",month:"short",day:"numeric"})}

/* ---------- navigation ---------- */
const NAV=[["today","Today","home"],["recipes","Recipes","book"],["planner","Planner","cal"],["shop","Shop","cart"],["care","Care Team","team"],["profile","Profile","user"]];
let cur="today";
$("#logo2").innerHTML=ic("leaf",22);
$("#chatx").innerHTML=ic("x",18);
function go(v){if(location.hash!=="#"+v)location.hash=v;else show(v)}
function show(v){cur=NAV.some(n=>n[0]===v)?v:"today";document.querySelectorAll("[data-act=go][data-v]").forEach(b=>{if(b.closest(".nav,.tabbar"))b.toggleAttribute("aria-current",b.dataset.v===cur),b.dataset.v===cur&&b.setAttribute("aria-current","page")});render();window.scrollTo(0,0);$("#screen").scrollTop=0}
function render(){$("#view").innerHTML=VIEWS[cur]();after[cur]&&after[cur]();save()}
window.addEventListener("hashchange",()=>show(location.hash.slice(1)));

/* ---------- views ---------- */
const VIEWS={},after={};
after.today=()=>{$("#studioform").onsubmit=e=>{e.preventDefault();studio($("#studioIn").value)}};
function studio(text){const words=text.toLowerCase().split(/[,;\n]+|\band\b/).map(w=>w.trim()).filter(w=>w.length>1);const out=$("#studioOut");
  if(!words.length){out.hidden=true;return}
  const scored=RECIPES.map(r=>({r,n:words.filter(w=>r.ings.some(i=>i.item.toLowerCase().includes(w)||w.includes(i.item.toLowerCase().split(" ").pop()))).length})).filter(x=>x.n).sort((a,b)=>b.n-a.n||a.r.min-b.r.min).slice(0,6);
  out.hidden=false;out.innerHTML=`<div class="between"><h2>Uses what you have</h2><button class="link" type="button" data-act="studioclear">Clear</button></div>`+(scored.length?`<div class="grid">${scored.map(x=>card(x.r).replace('<span class="rname">',`<span class="pill">Uses ${x.n} of your ${words.length}</span><span class="rname">`)).join("")}</div>`:`<div class="empty">No recipes use ${esc(words.join(", "))} yet. Try a broader ingredient like chicken, eggs or beans.</div>`);
  out.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})}

function filtered(){const q=S.q.trim().toLowerCase();return RECIPES.filter(r=>(S.cui==="All"||r.cui===S.cui)&&(S.meal==="All"||r.meal===S.meal)&&(!S.mine||r.goals.some(g=>S.goals.includes(g)))&&(!q||r.name.toLowerCase().includes(q)||r.cui.toLowerCase().includes(q)||r.ings.some(i=>i.item.toLowerCase().includes(q))))}

let clearArm=0;
function shopList(){const m={};let meals=0;WEEK.forEach(w=>{const p=S.plan[iso(w)]||{};SLOTS.forEach(s=>{const r=RB[p[s]];if(!r)return;meals++;r.ings.forEach(i=>{const k=i.item.toLowerCase();(m[k]=m[k]||{item:i.item,aisle:i.aisle,q:[],from:new Set()}).q.push(i.q);m[k].from.add(r.name)})})});return{items:Object.values(m),meals}}
const AISLES=["Produce","Meat & Fish","Dairy & Eggs","Bakery","Pantry","Spices","Frozen"];
/* care */
const CTABS=[["messages","Messages"],["program","Program"],["checkins","Check-ins"],["sessions","Sessions"],["sharing","Sharing"],["find","Find a provider"]];
VIEWS.care=()=>`<header class="titlebar top"><div><h1>Care Team 🩺</h1><p class="sub">Your dietitian, trainer and doctor in one place.</p></div><button class="btn primary sm" type="button" data-act="ctab" data-v="find">+ Add provider</button></header>
  <div class="note">Prototype: provider profiles, messages and replies are examples. NutriPlan doesn't replace medical advice. In an emergency, call 911.</div>
  <div class="team">${TEAM.map(t=>`<div class="panel stack"><div class="person"><div class="av">${t.ini}</div><div class="t"><b>${t.name}, ${t.cred}</b><div class="muted">${t.role}</div></div><span class="pill" style="margin-left:auto">Connected</span></div><div class="muted" style="font-size:13px">Sees: ${S.share[t.id].length?S.share[t.id].join(", "):"nothing yet"}</div><div class="row"><button class="btn sm" type="button" data-act="thread" data-v="${t.id}">${ic("chat",16)}Message</button><button class="btn sm" type="button" data-act="bookwith" data-v="${t.id}">${ic("video",16)}Book</button></div></div>`).join("")}</div>
  <div class="seg" role="tablist">${CTABS.map(([v,l])=>`<button type="button" role="tab" data-act="ctab" data-v="${v}" aria-selected="${S.careTab===v}">${l}</button>`).join("")}</div>
  <section id="carepanel">${CARE[S.careTab]()}</section>`;
const CARE={};
function convoHTML(){return S.threads[S.thread].map(m=>`<div class="bub ${m.from==="me"?"me":""}">${esc(m.t)}<small>${m.from==="me"?"You":TB[m.from].name}${m.demo?" · auto-reply (demo)":""} · ${m.time}</small></div>`).join("")}
CARE.messages=()=>`<div class="msgs"><div class="threads">${TEAM.map(t=>{const L=S.threads[t.id];return`<button class="thread" type="button" data-act="thread" data-v="${t.id}" aria-pressed="${S.thread===t.id}"><div class="av">${t.ini}</div><div style="min-width:0"><b>${t.name}</b><div class="muted" style="font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px">${esc(L[L.length-1].t)}</div></div></button>`}).join("")}</div>
  <div class="panel"><div class="person" style="margin-bottom:10px"><div class="av">${TB[S.thread].ini}</div><div class="t"><b>${TB[S.thread].name}, ${TB[S.thread].cred}</b><div class="muted">${TB[S.thread].role} · usually replies within a day</div></div></div>
  <div class="convo" id="convo">${convoHTML()}</div>
  <form class="compose" id="msgform"><input class="input" id="msgin" placeholder="Write a message" autocomplete="off" aria-label="Message"><button class="btn primary" type="submit">Send</button></form>
  <div class="chiprow" style="margin-top:8px">${["Can you review my meal plan?","My knee hurts during lunges","Can we move our session?"].map(q=>`<button class="chip" type="button" data-act="quickmsg" data-v="${q}">${q}</button>`).join("")}</div></div></div>`;
after.care=()=>{const c=$("#convo");if(c)c.scrollTop=c.scrollHeight;const f=$("#msgform");if(f)f.onsubmit=e=>{e.preventDefault();sendMsg($("#msgin").value)};const ci=$("#ciform");if(ci)ci.onsubmit=e=>{e.preventDefault();submitCheckin()}};
function sendMsg(t){t=t.trim();if(!t)return;const th=S.thread;S.threads[th].push({from:"me",t,time:"Just now"});$("#msgin").value="";renderConvo();save();
  setTimeout(()=>{S.threads[th].push({from:th,t:AUTO[th],time:"Just now",demo:true});save();if(cur==="care"&&S.careTab==="messages"&&S.thread===th)renderConvo()},1400)}
function renderConvo(){const c=$("#convo");if(!c)return;c.innerHTML=convoHTML();c.scrollTop=c.scrollHeight}
CARE.program=()=>{const done=WORKOUTS.filter(w=>S.work[w.id]).length;return`<div class="hero"><div class="panel stack"><div class="between"><div><div class="eyebrow">From ${TB.pt.name}</div><h2>Week 3 of 8 · Strength & mobility</h2></div><span class="pill">${done} of ${WORKOUTS.length} done</span></div>${bar(done,WORKOUTS.length)}
  <div>${WORKOUTS.map(w=>`<div class="wk"><span class="d">${w.day}</span><div class="mtxt"><b>${w.name}</b> <span class="muted">· ${w.min} min</span><div class="muted" style="font-size:13.5px">${w.detail}</div></div><button class="tick" type="button" data-act="work" data-v="${w.id}" aria-pressed="${!!S.work[w.id]}" aria-label="Mark ${w.name} done">${ic("check",16)}</button></div>`).join("")}</div></div>
  <div class="panel stack"><div><div class="eyebrow">Daily habits</div><h2>This week</h2></div><div>${HABITS.map(h=>`<div class="habit"><div><b>${h.name}</b><div class="muted" style="font-size:12.5px">Set by ${TB[h.by].name}</div></div><div class="dots">${S.habits[h.id].map((on,i)=>i===TI?`<button class="dot today ${on?"on":""}" type="button" data-act="habit" data-v="${h.id}" aria-pressed="${on}" aria-label="${h.name} today">${"MTWTFSS"[i]}</button>`:`<span class="dot ${on?"on":""}" aria-hidden="true">${"MTWTFSS"[i]}</span>`).join("")}</div></div>`).join("")}</div><p class="muted" style="font-size:12.5px">Tap today's square to log a habit.</p></div></div>`};
function spark(L){if(L.length<2)return"";const W=320,H=90,pad=24,ws=L.map(x=>x.w),mn=Math.min(...ws)-.3,mx=Math.max(...ws)+.3;const X=i=>pad+i*(W-pad*2)/(L.length-1),Y=v=>10+(mx-v)/(mx-mn)*(H-30);
  const pts=L.map((x,i)=>`${X(i).toFixed(1)},${Y(x.w).toFixed(1)}`).join(" ");
  return`<svg class="spark" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Weight trend from ${ws[0]} to ${ws[ws.length-1]} kg"><line class="grid" x1="${pad}" x2="${W-pad}" y1="${H-20}" y2="${H-20}"/><polygon class="area" points="${X(0)},${H-20} ${pts} ${X(L.length-1)},${H-20}"/><polyline class="lineal" points="${pts}"/><circle class="end" cx="${X(L.length-1)}" cy="${Y(ws[ws.length-1])}" r="4"/>${L.map((x,i)=>`<text x="${X(i)}" y="${H-5}" text-anchor="middle">${esc(x.date)}</text>`).join("")}<text x="${X(L.length-1)-8}" y="${Y(ws[ws.length-1])-8}" text-anchor="end">${ws[ws.length-1]} kg</text></svg>`}
CARE.checkins=()=>{const L=S.checkins;return`<div class="hero"><form class="panel stack" id="ciform"><div><div class="eyebrow">Weekly check-in</div><h2>How was this week?</h2></div>
  <div class="formgrid"><label class="field">Weight (kg)<input class="input" id="ciW" type="number" step="0.1" min="30" max="300" required value="${L.length?L[L.length-1].w:""}"></label><label class="field">Average sleep (hours)<input class="input" id="ciS" type="number" step="0.5" min="0" max="14" required></label><label class="field">Energy<select class="input" id="ciE">${["1 · Very low","2 · Low","3 · OK","4 · Good","5 · Great"].map((t,i)=>`<option value="${i+1}" ${i===3?"selected":""}>${t}</option>`).join("")}</select></label></div>
  <label class="field">Notes for your team<textarea class="input" id="ciN" rows="3" placeholder="Wins, struggles, anything that hurt"></textarea></label>
  <div class="row"><button class="btn primary" type="submit">Send check-in</button><span class="muted" style="font-size:13px">Shared with: ${TEAM.filter(t=>S.share[t.id].includes("Check-ins")).map(t=>t.name).join(", ")||"nobody"}</span></div></form>
  <div class="panel stack"><div class="between"><h2>Weight trend</h2>${L.some(x=>x.ex)?`<span class="pill warm">Includes example data</span>`:""}</div>${spark(L.slice(-8))}
  <div class="hist">${L.slice().reverse().map(x=>`<div><b>${esc(x.date)}</b><span class="muted num">${x.w} kg · ${x.s} h sleep · energy ${x.e}/5${x.ex?" · example":""}</span>${x.n?`<span style="flex-basis:100%;font-size:13px">${esc(x.n)}</span>`:""}</div>`).join("")}</div></div></div>`};
function submitCheckin(){const w=parseFloat($("#ciW").value),s=parseFloat($("#ciS").value);if(!(w>0)||!(s>=0)){toast("Add your weight and sleep to send the check-in");return}
  S.checkins.push({date:today.toLocaleDateString("en-CA",{month:"short",day:"numeric"}),w,s,e:+$("#ciE").value,n:$("#ciN").value.trim()});toast("Check-in sent to your care team");render()}
function slotOptions(){const out=[];const d=new Date(today);while(out.length<15){d.setDate(d.getDate()+1);if(d.getDay()===0||d.getDay()===6)continue;[[9,0],[12,30],[17,0]].forEach(([h,m])=>{const x=new Date(d);x.setHours(h,m,0,0);out.push(x.getTime())})}return out}
CARE.sessions=()=>{const up=S.sessions.slice().sort((a,b)=>a.when-b.when);return`<div class="hero"><div class="panel stack"><h2>Upcoming</h2>${up.length?up.map((x,i)=>`<div class="mrow"><div class="av">${TB[x.who].ini}</div><div class="mtxt"><b>${fmtWhen(x.when)}</b><div class="muted">${TB[x.who].name} · ${x.type}</div></div><button class="btn sm danger" type="button" data-act="cancelsess" data-v="${x.when}">Cancel</button></div>`).join(""):`<p class="muted">No sessions booked.</p>`}</div>
  <div class="panel stack"><h2>Book a session</h2><label class="field">With<select class="input" id="bkWho">${TEAM.map(t=>`<option value="${t.id}" ${S.bookWho===t.id?"selected":""}>${t.name}, ${t.role}</option>`).join("")}</select></label>
  <div class="field">Pick a time<div class="slots">${slotOptions().map(ms=>`<button class="chip" type="button" data-act="slot" data-v="${ms}" aria-pressed="${S.slot==ms}">${fmtWhen(ms)}</button>`).join("")}</div></div>
  <label class="field">Format<select class="input" id="bkType"><option>Video</option><option>In person</option><option>Phone</option></select></label>
  <button class="btn primary" type="button" data-act="book" ${S.slot?"":"disabled"}>${S.slot?"Book "+fmtWhen(S.slot):"Choose a time first"}</button></div></div>`};
CARE.sharing=()=>`<div class="team">${TEAM.map(t=>`<div class="panel stack"><div class="person"><div class="av">${t.ini}</div><div class="t"><b>${t.name}</b><div class="muted">${t.role}</div></div></div><div class="share">${["Meal plan","Check-ins","Workout log","Shopping list"].map(x=>`<label><input type="checkbox" id="sh-${t.id}-${hash(x)}" data-chg="share" data-p="${t.id}" data-k="${x}" ${S.share[t.id].includes(x)?"checked":""}>${x}</label>`).join("")}</div></div>`).join("")}</div><p class="muted" style="font-size:13px;margin-top:12px">You can change this any time. Providers only see what's ticked.</p>`;
CARE.find=()=>{const roles=["All","Dietitian","Personal trainer","Physician","Physiotherapist"];const L=DIRECTORY.filter(d=>S.findRole==="All"||d.role===S.findRole);
  return`<div class="stack"><div class="chiprow">${roles.map(r=>`<button class="chip" type="button" data-act="findrole" data-v="${r}" aria-pressed="${S.findRole===r}">${r}</button>`).join("")}</div>
  <div class="team">${L.map(d=>`<div class="panel stack"><div class="person"><div class="av">${d.name.replace("Dr. ","").split(" ").map(x=>x[0]).join("")}</div><div class="t"><b>${d.name}, ${d.cred}</b><div class="muted">${d.role}</div></div></div><div style="font-size:14px">${d.spec}</div><div class="muted" style="font-size:13px">${d.lang} · ${d.mode}</div><button class="btn sm ${S.requests[d.id]?"":"primary"}" type="button" data-act="request" data-v="${d.id}" ${S.requests[d.id]?"disabled":""}>${S.requests[d.id]?"Request sent":"Request to connect"}</button></div>`).join("")}</div></div>`};

after.profile=()=>{$("#kcalIn").onchange=e=>{const v=Math.round(+e.target.value);if(v>=1200&&v<=4000){S.kcal=v;render();toast("Daily goal set to "+v+" kcal")}else{toast("Choose a goal between 1200 and 4000 kcal");e.target.value=S.kcal}}};
let resetArm=0;

/* ---------- sheet ---------- */
function openSheet(html,label){$("#sheet").innerHTML=html;$("#sheet").setAttribute("aria-label",label);$("#scrim").hidden=false;$("#sheet").scrollTop=0;document.body.style.overflow="hidden";const f=$("#sheet").querySelector(".closer");f&&f.focus()}
function closeSheet(){$("#scrim").hidden=true;document.body.style.overflow=""}
function openRecipe(id){const r=RB[id],defDay=S.day;
  openSheet(`<button class="iconbtn closer float" type="button" data-act="close" aria-label="Close">${ic("x",18)}</button>
  <div class="tile bleed" style="${cv(r)}">${art(r)}</div>${credit(r)}
  <div class="stack" style="gap:8px"><span class="cuis" style="${cv(r)}"><i></i>${r.cui} · ${SL[r.meal]} · ${r.min} min</span><h1>${esc(r.name)}</h1><div class="tags">${r.goals.map(g=>`<span class="tag ${S.goals.includes(g)?"on":""}">${GT[g]}</span>`).join("")}</div></div>
  <div class="stats">${[[r.kcal,"kcal"],[r.p+" g","protein"],[r.c+" g","carbs"],[r.f+" g","fat"]].map(([v,l])=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`).join("")}</div>
  <p class="muted" style="font-size:12.5px;margin-top:-8px">Approximate values per serving. Recipe serves 4.</p>
  <div class="addbar"><label class="field">Day<select class="input" id="addDay">${WEEK.map(w=>`<option value="${iso(w)}" ${iso(w)===defDay?"selected":""}>${iso(w)===TODAY?"Today":DOW(w)+" "+w.getDate()}</option>`).join("")}</select></label><label class="field">Meal<select class="input" id="addSlot">${SLOTS.map(s=>`<option value="${s}" ${s===r.meal?"selected":""}>${SL[s]}</option>`).join("")}</select></label><button class="btn primary" type="button" data-act="addplan" data-id="${r.id}">${ic("plus",18)}Add to plan</button></div>
  <div class="twocol"><div><h3 style="margin-bottom:6px">Ingredients</h3><ul class="ings">${r.ings.map(i=>`<li><b>${esc(i.q)}</b><span>${esc(i.item)}</span></li>`).join("")}</ul></div><div><h3 style="margin-bottom:8px">Method</h3><ol class="steps">${r.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol></div></div>`,r.name)}
let pickCtx=null;
function openPicker(d,s,all){pickCtx={d,s,all:!!all};
  openSheet(`<div class="between" style="align-items:center"><div><div class="eyebrow">${shortDay(d)}</div><h2>Choose a ${SL[s].toLowerCase()}</h2></div><button class="iconbtn closer" type="button" data-act="close" aria-label="Close">${ic("x",18)}</button></div>
  <div class="row"><input class="input" id="pq" type="search" placeholder="Search recipes" style="flex:1;min-width:180px" aria-label="Search recipes"><button class="chip" type="button" data-act="pickall" aria-pressed="${!!all}">Show all meal types</button></div><div id="plist"></div>`,"Choose a meal");
  $("#pq").oninput=pickList;pickList()}
function pickList(){const q=($("#pq").value||"").toLowerCase();const L=RECIPES.filter(r=>(pickCtx.all||r.meal===pickCtx.s)&&(!q||r.name.toLowerCase().includes(q)||r.cui.toLowerCase().includes(q)));
  $("#plist").innerHTML=L.length?L.map(r=>`<button class="pick" type="button" data-act="pick" data-id="${r.id}"><span class="thumb" style="${cv(r)}">${art(r)}</span><span class="mtxt"><b>${esc(r.name)}</b><span class="facts"><span>${r.cui}</span><span>${r.kcal} kcal</span><span>${r.min} min</span></span></span>${r.goals.some(g=>S.goals.includes(g))?`<span class="pill">Fits goals</span>`:""}</button>`).join(""):`<p class="muted">No matches. Try "Show all meal types".</p>`}

/* ---------- auto-fill ---------- */
function autofill(){let n=0,rot=0;WEEK.forEach(w=>{const k=iso(w);if(k<TODAY)return;const p=S.plan[k]=S.plan[k]||{};SLOTS.forEach(s=>{if(p[s])return;const used=Object.values(p);let pool=RECIPES.filter(r=>r.meal===s&&!used.includes(r.id));const fit=pool.filter(r=>r.goals.some(g=>S.goals.includes(g)));if(fit.length)pool=fit;if(!pool.length)return;p[s]=pool[(rot++ +w.getDate())%pool.length].id;n++})});return n}

/* ---------- chat ---------- */
const chatLog=[{me:false,t:"Hi Andreas! Tell me what you're in the mood for, like a cuisine, a meal, an ingredient or a goal such as high protein, and I'll pull matching recipes from the book."}];
function chatReply(q){const t=q.toLowerCase();let L=RECIPES.slice();const why=[];
  Object.keys(CUI).forEach(c=>{if(t.includes(c.toLowerCase())||(c==="Middle Eastern"&&/lebanese|arab|turkish|persian/.test(t))||(c==="Chinese"&&/sichuan|szechuan|cantonese|wok/.test(t))){L=L.filter(r=>r.cui===c);why.push(c)}});
  SLOTS.forEach(s=>{if(t.includes(s)){L=L.filter(r=>r.meal===s);why.push(s)}});
  if(/protein/.test(t)){L=L.filter(r=>r.p>=25);why.push("25 g+ protein")}
  if(/quick|fast|easy|20 min/.test(t)){L=L.filter(r=>r.min<=20);why.push("20 minutes or less")}
  if(/vegetarian|veggie|meatless/.test(t)){L=L.filter(r=>!r.ings.some(i=>i.aisle==="Meat & Fish"));why.push("vegetarian")}
  if(/light|low cal|lose weight/.test(t)){L=L.filter(r=>r.kcal<=400);why.push("400 kcal or less")}
  const ingHits=RECIPES.flatMap(r=>r.ings.map(i=>i.item.toLowerCase().split(" ").pop())).filter((w,i,a)=>w.length>3&&a.indexOf(w)===i&&t.includes(w));
  if(ingHits.length){L=L.filter(r=>ingHits.some(w=>r.ings.some(i=>i.item.toLowerCase().includes(w))));why.push("with "+ingHits.join(", "))}
  if(!why.length)return{t:"I search the recipe book by cuisine (Greek, Middle Eastern, Italian, Mexican, Japanese), meal, ingredient, or words like quick, high protein, light or vegetarian. Try \"quick Chinese dinner\"."};
  L.sort((a,b)=>(b.goals.some(g=>S.goals.includes(g)))-(a.goals.some(g=>S.goals.includes(g)))||a.min-b.min);
  return L.length?{t:`Here's what I found (${why.join(", ")}):`,ids:L.slice(0,3).map(r=>r.id)}:{t:`Nothing matches all of that (${why.join(", ")}). Try dropping one filter.`}}
function renderChat(){$("#chatlog").innerHTML=chatLog.map(m=>`<div class="bub ${m.me?"me":""}">${esc(m.t)}${(m.ids||[]).map(id=>`<button class="link" type="button" data-act="recipe" data-id="${id}">${esc(RB[id].name)} · ${RB[id].kcal} kcal</button>`).join("")}</div>`).join("");$("#chatlog").scrollTop=1e6}
$("#chatform").onsubmit=e=>{e.preventDefault();const q=$("#chatin").value.trim();if(!q)return;chatLog.push({me:true,t:q},Object.assign({me:false},chatReply(q)));$("#chatin").value="";renderChat()};

/* ---------- actions ---------- */
const ACT={
  go:b=>{closeSheet();go(b.dataset.v)},
  recipe:b=>openRecipe(b.dataset.id),
  close:closeSheet,
  eat:b=>{const k=b.dataset.d+"|"+b.dataset.s;S.eaten[k]=!S.eaten[k];render()},
  picker:b=>openPicker(b.dataset.d,b.dataset.s),
  pickall:()=>openPicker(pickCtx.d,pickCtx.s,!pickCtx.all),
  pick:b=>{const{d,s}=pickCtx;(S.plan[d]=S.plan[d]||{})[s]=b.dataset.id;delete S.eaten[d+"|"+s];closeSheet();render();toast(RB[b.dataset.id].name+" added to "+(d===TODAY?"today":DOW(new Date(d+"T00:00")))+"'s "+SL[s].toLowerCase())},
  addplan:b=>{const d=$("#addDay").value,s=$("#addSlot").value;(S.plan[d]=S.plan[d]||{})[s]=b.dataset.id;delete S.eaten[d+"|"+s];closeSheet();render();toast("Added to "+(d===TODAY?"today":DOW(new Date(d+"T00:00")))+"'s "+SL[s].toLowerCase())},
  unplan:b=>{const p=S.plan[b.dataset.d];if(p)delete p[b.dataset.s];delete S.eaten[b.dataset.d+"|"+b.dataset.s];render()},
  day:b=>{S.day=b.dataset.v;render()},
  autofill:()=>{const n=autofill();S.sample=false;render();toast(n?"Filled "+n+" empty slots for the rest of the week":"Every slot from today on is already planned")},
  clearweek:()=>{if(!clearArm){clearArm=1;render();setTimeout(()=>{if(clearArm){clearArm=0;cur==="planner"&&render()}},3000);return}clearArm=0;WEEK.forEach(w=>delete S.plan[iso(w)]);S.eaten={};S.sample=false;render();toast("Week cleared")},
  clearweek2:()=>{WEEK.forEach(w=>delete S.plan[iso(w)]);S.eaten={};S.sample=false;render()},
  cui:b=>{S.cui=b.dataset.v;render()},
  meal:b=>{S.meal=b.dataset.v;render()},
  mine:()=>{if(cur!=="recipes"){S.mine=true;S.cui="All";go("recipes")}else{S.mine=!S.mine;render()}},
  cuisine:b=>{S.cui=b.dataset.v;S.mine=false;S.meal="All";S.q="";go("recipes")},
  resetf:()=>{S.cui="All";S.meal="All";S.q="";S.mine=false;render()},
  studiofill:b=>{$("#studioIn").value=b.dataset.v;studio(b.dataset.v)},
  studioclear:()=>{$("#studioOut").hidden=true;$("#studioIn").value=""},
  copylist:()=>{const{items}=shopList();const txt=AISLES.map(a=>{const L=items.filter(i=>i.aisle===a&&!S.got[i.item.toLowerCase()]);return L.length?a+"\n"+L.map(i=>"- "+i.item+" ("+i.q.join(" + ")+")").join("\n"):""}).filter(Boolean).join("\n\n");
    const ok=()=>toast("Shopping list copied");if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(txt).then(ok,()=>toast("Copy isn't available here. Select the list instead."))}else toast("Copy isn't available here. Select the list instead.")},
  ungot:()=>{S.got={};render()},
  ctab:b=>{S.careTab=b.dataset.v;if(cur!=="care")go("care");else render()},
  thread:b=>{S.thread=b.dataset.v;S.careTab="messages";if(cur!=="care")go("care");else render();setTimeout(()=>{const i=$("#msgin");i&&i.focus()},50)},
  quickmsg:b=>sendMsg(b.dataset.v),
  bookwith:b=>{S.bookWho=b.dataset.v;S.careTab="sessions";render()},
  work:b=>{S.work[b.dataset.v]=!S.work[b.dataset.v];render()},
  habit:b=>{const h=S.habits[b.dataset.v];h[TI]=!h[TI];render()},
  slot:b=>{S.bookWho=$("#bkWho").value;S.slot=+b.dataset.v;render()},
  book:()=>{if(!S.slot)return;const who=$("#bkWho").value;S.sessions.push({who,when:S.slot,type:$("#bkType").value});toast("Booked with "+TB[who].name+" for "+fmtWhen(S.slot));S.slot=null;render()},
  cancelsess:b=>{S.sessions=S.sessions.filter(x=>x.when!=b.dataset.v);render();toast("Session cancelled")},
  findrole:b=>{S.findRole=b.dataset.v;render()},
  request:b=>{S.requests[b.dataset.v]=true;render();toast("Request sent. You'll see them here once they accept.")},
  goal:b=>{const g=b.dataset.v;S.goals=S.goals.includes(g)?S.goals.filter(x=>x!==g):[...S.goals,g];render()},
  reset:()=>{if(!resetArm){resetArm=1;render();setTimeout(()=>{if(resetArm){resetArm=0;cur==="profile"&&render()}},3000);return}resetArm=0;S=defaults();render();toast("Demo data reset")},
  az:b=>{const el=document.getElementById("az-"+b.dataset.v);el&&el.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})},
  chat:()=>{const c=$("#chat");c.hidden=!c.hidden;if(!c.hidden){renderChat();$("#chatin").focus()}}
};
document.addEventListener("click",e=>{const b=e.target.closest("[data-act]");if(!b)return;if(b.tagName==="A")e.preventDefault();ACT[b.dataset.act]&&ACT[b.dataset.act](b,e)});
document.addEventListener("change",e=>{const t=e.target;if(t.dataset.chg==="got"){S.got[t.dataset.k]=t.checked;render()}if(t.dataset.chg==="share"){const L=S.share[t.dataset.p];S.share[t.dataset.p]=t.checked?[...new Set([...L,t.dataset.k])]:L.filter(x=>x!==t.dataset.k);save();toast(t.checked?TB[t.dataset.p].name+" can now see your "+t.dataset.k.toLowerCase():"Stopped sharing "+t.dataset.k.toLowerCase())}if(t.id==="bkWho")S.bookWho=t.value});
$("#scrim").addEventListener("click",e=>{if(e.target.id==="scrim")closeSheet()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(!$("#scrim").hidden)closeSheet();else if(!$("#chat").hidden)$("#chat").hidden=true}});

/* ---------- screens ---------- */
const macroBars=(e,T)=>[["Protein",e.p,T.p],["Carbs",e.c,T.c],["Fat",e.f,T.f]].map(([n,v,t])=>`<div class="macro"><div class="between"><span>${n}</span><span class="muted num">${v} / ${t} g</span></div>${bar(v,t,false).replace('class="bar ','class="bar '+(n==="Protein"?"":"amber "))}</div>`).join("");

const TABI={today:"🏠",recipes:"🥗",planner:"📅",shop:"🛒",care:"🩺",profile:"👤"};
const TABL={today:"Home",recipes:"Recipes",planner:"Planner",shop:"Shop",care:"Care",profile:"Profile"};
$("#tabbar").innerHTML=NAV.map(([v])=>`<button class="tab" type="button" data-act="go" data-v="${v}"><span class="ti" aria-hidden="true">${TABI[v]}</span>${TABL[v]}</button>`).join("");
$("#fab").innerHTML='<span aria-hidden="true">👨‍🍳</span>';
const GE={heart:"❤️",lowgi:"🌾",protein:"💪",antiinf:"🌿",bone:"🦴",cognitive:"🧠",immune:"🛡️",weight:"⚖️",energy:"⚡",family:"🥦",growth:"📏"};
const GLONG=Object.fromEntries(GOALS.map(g=>[g[0],g[1].replace(" (Low-Glycemic)","")]));
const SE={breakfast:"🍳",lunch:"🥗",dinner:"🥘",snack:"🍎"};

function card(r){const tags=r.goals.slice().sort((x,y)=>S.goals.includes(y)-S.goals.includes(x)).slice(0,2);
  return`<button class="rcard" type="button" data-act="recipe" data-id="${r.id}" style="${cv(r)}"><div class="tile">${art(r)}</div><div class="meta"><span class="tags">${tags.map(g=>`<span class="tag">${GLONG[g]}</span>`).join("")}</span><span class="rname">${esc(r.name)}</span><span class="facts"><span>⏱️ ${r.min} min</span><span>🔥 ${r.kcal} kcal</span><span class="cuis"><i></i>${r.cui}</span></span></div></button>`};

function gridHTML(){const L=filtered();const by={};L.forEach(r=>{const k=r.name[0].toUpperCase();(by[k]=by[k]||[]).push(r)});const ks=Object.keys(by).sort();
  return L.length?`<div class="azbar" aria-label="Jump to letter">${ks.map(k=>`<button type="button" data-act="az" data-v="${k}">${k}</button>`).join("")}</div><p class="muted">${L.length} recipes, A to Z</p>${ks.map(k=>`<section class="azgroup" id="az-${k}"><h3 class="letter">${k}</h3><div class="list">${by[k].map(card).join("")}</div></section>`).join("")}`
  :`<div class="empty">No recipes match these filters.<button class="btn sm" type="button" data-act="resetf">Clear filters</button></div>`};

VIEWS.today=()=>{const e=dayTotals(TODAY,true),T=targets(),plan=S.plan[TODAY]||{};
  const meals=SLOTS.map(s=>{const r=RB[plan[s]];return r?`<div class="mrow">${thumb(r)}<div class="mtxt"><div class="slotname">${SE[s]} ${SL[s]} · ${r.kcal} kcal</div><button class="t" type="button" data-act="recipe" data-id="${r.id}">${esc(r.name)}</button></div><button class="tick" type="button" data-act="eat" data-d="${TODAY}" data-s="${s}" aria-pressed="${!!S.eaten[TODAY+"|"+s]}" aria-label="Mark ${esc(r.name)} as eaten">✓</button></div>`:""}).join("");
  const next=S.sessions.slice().sort((a,b)=>a.when-b.when)[0],last=S.threads.rd[S.threads.rd.length-1];
  const counts=Object.keys(CUI).map(c=>({c,n:RECIPES.filter(r=>r.cui===c).length,ex:RECIPES.filter(r=>r.cui===c).slice(0,2).map(r=>r.name).join(", ")}));
  return`<header class="hello"><div><h1>Hello, Andreas! 👋</h1><p class="sub">Ready to cook something magic?</p></div><button class="avatar" type="button" data-act="go" data-v="profile" aria-label="Open profile">A</button></header>
  <section class="magic"><span class="wand" aria-hidden="true">✨</span><h2>Magic Chef Studio</h2><p>Turn ingredients into 5-star meals instantly.</p>
    <form id="studioform" class="magic-in"><input id="studioIn" placeholder="e.g. Salmon, Asparagus..." autocomplete="off" aria-label="Ingredients you have"><button type="submit" aria-label="Find recipes">→</button></form>
    <div class="magic-btns"><button type="button" data-act="fridge"><span aria-hidden="true">🧊</span>FRIDGE STAPLES</button><button type="button" data-act="surprise"><span aria-hidden="true">🎲</span>SURPRISE ME</button></div></section>
  <section id="studioOut" hidden class="stack"></section>
  <section class="stack"><h2>Today's Progress</h2><div class="card prog">
    <div class="progress"><div class="ringwrap"><svg viewBox="0 0 120 120" role="img" aria-label="${e.k} of ${S.kcal} kcal eaten"><circle class="ring-bg" cx="60" cy="60" r="52"/><circle class="ring-fg" cx="60" cy="60" r="52" stroke-dasharray="${(2*Math.PI*52).toFixed(1)}" stroke-dashoffset="${(2*Math.PI*52*(1-Math.min(1,e.k/S.kcal))).toFixed(1)}" transform="rotate(-90 60 60)"/></svg><div class="ringtxt"><b>${e.k}</b><span>of ${S.kcal} kcal</span></div></div>
    <div class="macros">${macroBars(e,T)}</div></div>
    ${meals?`<div class="meals">${meals}</div><p class="muted" style="font-size:13px">Tap ✓ once you've eaten a meal.</p>`:`<button class="slotempty" type="button" data-act="go" data-v="planner">+ Plan today's meals</button>`}</div></section>
  <section class="stack"><div class="sechead"><h2>Your Care Team</h2><button class="see" type="button" data-act="go" data-v="care">Open</button></div>
    <div class="card stack">${next?`<div class="person"><div class="av">${TB[next.who].ini}</div><div class="t"><div class="lab">Next session · ${next.type}</div><b>${fmtWhen(next.when)}</b><div class="muted">${TB[next.who].name}, ${TB[next.who].role}</div></div></div>`:`<p class="muted">No sessions booked.</p>`}
    <div class="note"><b>${last.from==="me"?"You":TB.rd.name}:</b> ${esc(last.t)}</div></div></section>
  <section class="stack"><div class="sechead"><h2>Recommended for You</h2><button class="see" type="button" data-act="mine">See all</button></div><div class="list">${recs(6).map(card).join("")}</div></section>
  <section class="stack"><h2>Explore by Cuisine</h2><div class="cgrid">${counts.map(x=>`<button class="ctile" type="button" data-act="cuisine" data-v="${x.c}" style="--c:${CUI[x.c]}"><span class="cstack">${RECIPES.filter(r=>r.cui===x.c&&PHOTOS[r.id]).slice(0,3).map(r=>`<img src="${PHOTOS[r.id].src}" alt="">`).join("")}</span><b>${x.c}</b><span>${x.n} recipes</span></button>`).join("")}</div></section>`};

VIEWS.recipes=()=>`<header class="titlebar"><h1>Recipes</h1><div class="segpill" role="group" aria-label="Show recipes"><button type="button" data-act="mineset" data-v="0" aria-pressed="${!S.mine}">All Recipes</button><button type="button" data-act="mineset" data-v="1" aria-pressed="${S.mine}">My Goals</button></div></header>
  <form class="searchrow" id="rsearch"><input class="input" id="rq" type="search" placeholder="Search by keyword..." value="${esc(S.q)}" aria-label="Search recipes"><button class="btn primary" type="submit">Search</button></form>
  <div class="chiprow" role="group" aria-label="Cuisine">${["All",...Object.keys(CUI)].map(c=>`<button class="chip" type="button" data-act="cui" data-v="${c}" aria-pressed="${S.cui===c}" style="--c:${CUI[c]||"#94a3b8"}">${c!=="All"?"<i></i>":""}${c}</button>`).join("")}</div>
  <div class="chiprow small" role="group" aria-label="Meal">${["All",...SLOTS].map(m=>`<button class="chip" type="button" data-act="meal" data-v="${m}" aria-pressed="${S.meal===m}">${m==="All"?"Any meal":SE[m]+" "+SL[m]}</button>`).join("")}</div>
  <div id="rgrid">${gridHTML()}</div>`;
after.recipes=()=>{$("#rq").oninput=e=>{S.q=e.target.value;$("#rgrid").innerHTML=gridHTML();save()};$("#rsearch").onsubmit=e=>{e.preventDefault();S.q=$("#rq").value;$("#rgrid").innerHTML=gridHTML();save()}};

VIEWS.planner=()=>{const d=S.day,plan=S.plan[d]||{},t=dayTotals(d),T=targets(),pct=t.k/S.kcal;
  const st=!t.k||pct<.85?["🟡","Fueling Up","warn"]:pct<=1.05?["🟢","On Target","ok"]:["🔴","Over Goal","bad"];
  return`<header class="titlebar top"><div><h1>Meal Planner</h1><p class="sub">This Week</p></div><div class="goalbox"><div class="lab">Daily Goal</div><div class="goalline"><span class="st ${st[2]}">${st[0]} ${st[1]}</span><b class="num">${t.k} / ${S.kcal}</b></div>${bar(t.k,S.kcal,pct>1.05)}</div></header>
  <div class="twobtn"><button class="btn grape" type="button" data-act="autofill">✨ Auto-Fill Week</button><button class="btn dark" type="button" data-act="shopweek">🛒 Shop This Week</button></div>
  ${S.sample?`<div class="note between"><span>We added a sample plan for today and tomorrow so you can see how it works.</span><button class="link" type="button" data-act="clearweek2" style="font-size:14px">Remove sample</button></div>`:""}
  <div class="days" role="group" aria-label="Day">${WEEK.map(w=>{const k=iso(w),tk=dayTotals(k).k;return`<button class="day ${k===TODAY?"today":""}" type="button" data-act="day" data-v="${k}" aria-pressed="${k===d}"><span class="dow">${DOW(w)}</span><span class="n">${w.getDate()}</span><span class="k">${tk?tk+" kcal":k===TODAY?"Today":"–"}</span></button>`}).join("")}</div>
  ${SLOTS.map(s=>{const r=RB[plan[s]];return`<section class="slot"><h3><span aria-hidden="true">${SE[s]}</span>${SL[s]}</h3>${r?`<div class="slotcard">${thumb(r)}<div class="mtxt"><button class="t" type="button" data-act="recipe" data-id="${r.id}">${esc(r.name)}</button><div class="facts"><span>🔥 ${r.kcal} kcal</span><span>${r.p} g protein</span></div></div><button class="tick" type="button" data-act="eat" data-d="${d}" data-s="${s}" aria-pressed="${!!S.eaten[d+"|"+s]}" aria-label="Mark as eaten">✓</button><button class="iconbtn" type="button" data-act="picker" data-d="${d}" data-s="${s}" aria-label="Swap meal">⇄</button><button class="iconbtn" type="button" data-act="unplan" data-d="${d}" data-s="${s}" aria-label="Remove meal">✕</button></div>`:`<button class="slotempty" type="button" data-act="picker" data-d="${d}" data-s="${s}">+ Add a meal</button>`}</section>`}).join("")}
  <div class="card daysum"><div class="between"><h3>${d===TODAY?"Today":shortDay(d)}</h3><button class="btn sm danger" type="button" data-act="clearweek">${clearArm?"Tap again to clear":"Clear week"}</button></div>
    <div class="macro"><div class="between"><span>Calories</span><span class="muted num">${t.k} / ${S.kcal} kcal</span></div>${bar(t.k,S.kcal,t.k>S.kcal)}</div><div class="macros">${macroBars(t,T)}</div></div>`};

VIEWS.shop=()=>{const{items,meals}=shopList();
  const head=`<header><h1>Smart Shopping List 🛒</h1><p class="sub">Smart consolidation of your weekly ingredients.</p></header>`;
  if(!S.listMade||!meals)return head+`<div class="card gen"><p>${meals?"Ready to shop? We'll combine all your ingredients for you.":"Plan a few meals first, then we'll combine all your ingredients for you."}</p>${meals?`<button class="btn primary big" type="button" data-act="gen">✨ Generate My List</button>`:`<button class="btn primary big" type="button" data-act="go" data-v="planner">📅 Go to Planner</button>`}</div>`;
  const got=items.filter(i=>S.got[i.item.toLowerCase()]).length;
  return head+`<div class="card stack"><div class="between"><b class="num">${got} of ${items.length} in the cart</b><span class="muted" style="font-size:13px">From ${meals} planned meals</span></div>${bar(got,items.length)}<div class="row"><button class="btn sm" type="button" data-act="copylist">Copy list</button><button class="btn sm" type="button" data-act="ungot">Untick all</button></div></div>
  <div class="shopcols">${AISLES.map(a=>{const L=items.filter(i=>i.aisle===a).sort((x,y)=>x.item.localeCompare(y.item));if(!L.length)return"";return`<section class="card aisle"><h3>${a}</h3>${L.map(i=>{const k=i.item.toLowerCase(),on=!!S.got[k];return`<label class="item ${on?"got":""}"><input type="checkbox" id="g-${hash(k)}" data-chg="got" data-k="${esc(k)}" ${on?"checked":""}><span><span class="nm">${esc(i.item)}</span><br><span class="q">${esc(i.q.join(" + "))} · ${i.from.size>1?i.from.size+" recipes":esc([...i.from][0])}</span></span></label>`}).join("")}</section>`}).join("")}</div>`};


VIEWS.profile=()=>`<header class="titlebar"><h1>My Profile</h1><button class="signout" type="button" data-act="signout">Sign Out</button></header>
  <div class="card usercard"><div class="avatar" aria-hidden="true">A</div><div style="min-width:0"><b>Andreas</b><div class="muted" style="font-size:17px;overflow-wrap:anywhere">andreaskounavis05@gmail.com</div><span class="badge">PREVENTION</span></div></div>
  <section class="stack"><h2>Daily Calorie Goal</h2><div class="card stack"><div class="row"><input class="input num" id="kcalIn" type="number" min="1200" max="4000" step="50" value="${S.kcal}" style="max-width:150px" aria-label="Daily calorie goal"><span class="muted">kcal per day</span></div><p class="muted" style="font-size:14px">Protein ${targets().p} g · Carbs ${targets().c} g · Fat ${targets().f} g. Ask your dietitian before big changes.</p></div></section>
  <section class="stack"><h2>Target Goals</h2><div class="goalgrid">${GOALS.map(([id,l,d])=>`<button class="goal" type="button" data-act="goal" data-v="${id}" aria-pressed="${S.goals.includes(id)}"><span class="ge" aria-hidden="true">${GE[id]}</span><b>${l}</b><span class="d">${d}</span><span class="ck" aria-hidden="true">✓</span></button>`).join("")}</div></section>
  ${Object.keys(PHOTOS).length?`<details class="card"><summary><b>Photo credits</b> <span class="muted">(${Object.keys(PHOTOS).length} photos from Wikimedia Commons)</span></summary><ul class="credits">${RECIPES.filter(r=>PHOTOS[r.id]).map(r=>`<li>${esc(r.name)}: <a href="${PHOTOS[r.id].url}" target="_blank" rel="noopener">${esc(PHOTOS[r.id].by)}</a>, ${esc(PHOTOS[r.id].lic)}</li>`).join("")}</ul></details>`:""}
  <div><button class="btn danger" type="button" data-act="reset">${resetArm?"Tap again to reset everything":"Reset demo data"}</button></div>`;

Object.assign(ACT,{
  fridge:()=>{const v="eggs, tomatoes, onion, garlic, rice";$("#studioIn").value=v;studio(v)},
  surprise:()=>{const pool=RECIPES.filter(r=>r.goals.some(g=>S.goals.includes(g)));openRecipe(pool[Math.floor(Math.random()*pool.length)].id)},
  mineset:b=>{S.mine=b.dataset.v==="1";render()},
  gen:()=>{S.listMade=true;render();toast("Shopping list ready")},
  shopweek:()=>{S.listMade=true;go("shop")},
  signout:()=>toast("Sign out isn't part of this prototype")
});

show(location.hash.slice(1));
