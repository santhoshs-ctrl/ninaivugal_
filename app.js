const $ = id => document.getElementById(id);
const STORE = {dates:"ninaivugal_dates_v1",tasks:"ninaivugal_tasks_v1",profile:"ninaivugal_profile_v1"};
let dates = read(STORE.dates, []), tasks = read(STORE.tasks, []), profile = read(STORE.profile, {name:"",email:"",about:""});
let notified = new Set();
function read(key, fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}}
function save(key, value){localStorage.setItem(key, JSON.stringify(value))}
function esc(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2600)}
function dateOnly(d){return new Date(d+"T12:00:00")}
function prettyDate(d, opts={day:"numeric",month:"long",year:"numeric"}){if(!d)return "";return dateOnly(d).toLocaleDateString(undefined,opts)}
function dayDistance(d){const now=new Date();now.setHours(0,0,0,0);const target=dateOnly(d);target.setHours(0,0,0,0);return Math.round((target-now)/86400000)}
function nextOccurrence(date){const now=new Date();let d=dateOnly(date);d.setFullYear(now.getFullYear());if(d<new Date(now.getFullYear(),now.getMonth(),now.getDate()))d.setFullYear(now.getFullYear()+1);return d}
function daysUntilAnnual(date){const now=new Date();const next=nextOccurrence(date);return Math.round((next-new Date(now.getFullYear(),now.getMonth(),now.getDate()))/86400000)}
function emoji(type){return ({Birthday:"🎂",Anniversary:"💐",Friendship:"🫶",Personal:"✨",Other:"💌"})[type]||"♡"}
function setPage(page){document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id==="page-"+page));document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.page===page));const titles={home:"Make every date meaningful.",dates:"Your special dates",schedule:"Your schedule",surprise:"A little help making magic.",profile:"Your profile"};$("pageTitle").textContent=titles[page]||titles.home;if(page==="profile")fillProfile();window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll("[data-page]").forEach(b=>b.addEventListener("click",()=>setPage(b.dataset.page)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>setPage(b.dataset.go)));
$("todayLabel").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
function renderDates(){
 const sorted=[...dates].sort((a,b)=>daysUntilAnnual(a.date)-daysUntilAnnual(b.date));
 $("statDates").textContent=dates.length;$("statUpcoming").textContent=sorted.filter(d=>daysUntilAnnual(d.date)<=30).length;
 $("upcomingList").innerHTML=sorted.slice(0,4).map(d=>`<div class="date-row"><div class="date-emoji">${emoji(d.type)}</div><div class="date-row-main"><b>${esc(d.title)}</b><small>${prettyDate(nextOccurrence(d.date).toISOString().slice(0,10))} · ${esc(d.type)}</small></div><span class="countdown">${daysUntilAnnual(d.date)===0?"Today!":daysUntilAnnual(d.date)===1?"Tomorrow":daysUntilAnnual(d.date)+" days"}</span></div>`).join("");
 $("emptyDates").classList.toggle("show",dates.length===0);$("upcomingList").style.display=dates.length?"flex":"none";
 $("allDates").innerHTML=sorted.map(d=>`<article class="date-card"><div class="date-card-top"><div class="date-emoji">${emoji(d.type)}</div><div><h3>${esc(d.title)}</h3><div class="date-sub">${esc(d.type)} · ${prettyDate(d.date)}</div></div></div><p>${esc(d.notes||"A moment worth remembering.")}</p><div class="date-card-actions"><span class="countdown">${daysUntilAnnual(d.date)===0?"Today!":daysUntilAnnual(d.date)+" days to go"}</span><div class="tiny-actions"><button data-edit-date="${d.id}">Edit</button><button class="delete" data-delete-date="${d.id}">Delete</button></div></div></article>`).join("");
 $("datesEmpty").classList.toggle("show",dates.length===0);
 save(STORE.dates,dates);
}
$("showDateForm").onclick=()=>{$("dateForm").classList.remove("hidden");$("dateFormTitle").textContent="Add a special date";$("dateForm").scrollIntoView({behavior:"smooth",block:"center"})};
$("cancelDate").onclick=()=>{$("dateForm").classList.add("hidden");$("dateForm").reset();$("dateId").value=""};
$("dateForm").onsubmit=e=>{e.preventDefault();const id=$("dateId").value;const item={id:id||crypto.randomUUID(),title:$("dateTitle").value.trim(),type:$("dateType").value,date:$("dateValue").value,reminder:Number($("dateReminder").value||1),notes:$("dateNotes").value.trim()};if(id)dates=dates.map(d=>d.id===id?item:d);else dates.push(item);save(STORE.dates,dates);$("dateForm").reset();$("dateReminder").value=1;$("dateId").value="";$("dateForm").classList.add("hidden");renderDates();toast(id?"Date updated ♡":"Special date saved ♡")};
$("allDates").addEventListener("click",e=>{const edit=e.target.closest("[data-edit-date]");const del=e.target.closest("[data-delete-date]");if(edit){const d=dates.find(x=>x.id===edit.dataset.editDate);if(!d)return;$("dateId").value=d.id;$("dateTitle").value=d.title;$("dateType").value=d.type;$("dateValue").value=d.date;$("dateReminder").value=d.reminder;$("dateNotes").value=d.notes||"";$("dateFormTitle").textContent="Edit special date";$("dateForm").classList.remove("hidden");$("dateForm").scrollIntoView({behavior:"smooth"})}if(del&&confirm("Delete this special date?")){dates=dates.filter(d=>d.id!==del.dataset.deleteDate);renderDates();toast("Date deleted")}});

function renderTasks(){tasks.sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));$("statTasks").textContent=tasks.filter(t=>!t.done).length;$("taskList").innerHTML=tasks.map(t=>`<div class="task-row ${t.done?"done":""}"><input class="task-check" type="checkbox" data-task-check="${t.id}" ${t.done?"checked":""} aria-label="Mark complete"><div class="task-info"><b>${esc(t.title)}</b><p>${prettyDate(t.date)} · ${esc(t.note||"A little thing to remember")}</p></div><span class="task-time">${esc(t.time)}</span><button class="icon-button" data-task-delete="${t.id}" title="Delete">×</button></div>`).join("");$("tasksEmpty").classList.toggle("show",tasks.length===0);save(STORE.tasks,tasks)}
$("showTaskForm").onclick=()=>{$("taskForm").classList.remove("hidden");$("taskDate").value=new Date().toISOString().slice(0,10);$("taskForm").scrollIntoView({behavior:"smooth",block:"center"})};
$("cancelTask").onclick=()=>{$("taskForm").classList.add("hidden");$("taskForm").reset()};
$("taskForm").onsubmit=e=>{e.preventDefault();tasks.push({id:crypto.randomUUID(),title:$("taskTitle").value.trim(),date:$("taskDate").value,time:$("taskTime").value,note:$("taskNote").value.trim(),done:false,notified:false});renderTasks();$("taskForm").reset();$("taskForm").classList.add("hidden");toast("Plan saved. We'll remind you while this page is open.");};
$("taskList").addEventListener("change",e=>{const cb=e.target.closest("[data-task-check]");if(cb){const t=tasks.find(t=>t.id===cb.dataset.taskCheck);if(t)t.done=cb.checked;renderTasks()}});
$("taskList").addEventListener("click",e=>{const b=e.target.closest("[data-task-delete]");if(b){tasks=tasks.filter(t=>t.id!==b.dataset.taskDelete);renderTasks();toast("Plan deleted")}});
$("enableNotifications").onclick=async()=>{if(!("Notification"in window)){toast("This browser does not support notifications.");return}const p=await Notification.requestPermission();toast(p==="granted"?"Notifications enabled ♡":"Notifications were not enabled")};
function checkReminders(){
 if(!("Notification" in window) || Notification.permission!=="granted") return;
 const now=new Date(); let changed=false;
 tasks.forEach(t=>{
  if(t.done || t.notified) return;
  const at=new Date(`${t.date}T${t.time}`);
  // Fire if due and no more than 10 minutes late, covering short tab/browser pauses.
  if(at<=now && now-at<10*60*1000){
   try { new Notification("Ninaivugal reminder ♡",{body:t.title,tag:"ninaivugal-"+t.id}); } catch(e) {}
   t.notified=true; changed=true;
  }
 });
 if(changed) save(STORE.tasks,tasks);
}
function fillProfile(){ $("profileName").value=profile.name||"";$("profileEmail").value=profile.email||"";$("profileAbout").value=profile.about||"";$("profileAvatar").textContent=(profile.name||"S").trim().charAt(0).toUpperCase() }
function renderProfile(){const name=profile.name||"Your profile";$("sideName").textContent=name;$("topName").textContent=name;$("sideEmail").textContent=profile.email||"Make it personal";$("sideAvatar").textContent=(profile.name||"S").trim().charAt(0).toUpperCase();$("topAvatar").textContent=$("sideAvatar").textContent}
$("profileForm").onsubmit=e=>{e.preventDefault();profile={name:$("profileName").value.trim(),email:$("profileEmail").value.trim(),about:$("profileAbout").value.trim()};save(STORE.profile,profile);renderProfile();toast("Profile saved ♡")};
$("editProfile").onclick=$("profileButton").onclick=()=>setPage("profile");
const chatHistory=[{role:"bot",text:"Hey there! ♡ Who are we making smile today? Tell me the occasion, their interests, and your budget — let's dream up something lovely."}];
function addMessage(role,text){const el=document.createElement("div");el.className="message "+role;el.textContent=text;$("chatMessages").appendChild(el);$("chatMessages").scrollTop=$("chatMessages").scrollHeight}
function suggestionReply(prompt){ 
 const p=prompt.toLowerCase();
 const budget=(prompt.match(/(?:₹|rs\.?\s*)(\d+)/i)||[])[1];
 const who=p.includes("friend")?"your friend":p.includes("mom")||p.includes("mother")?"your mum":p.includes("partner")||p.includes("anniversary")?"your partner":"someone special";
 const ideas=[
  `A thoughtful idea for ${who} ♡\n\n🎁 Make a small memory kit: a printed photo, their favourite snack, and a handwritten note about a moment you both remember.\n\n✨ Make it feel personal by adding an inside joke or a tiny detail only you would know.`,
  `Let's make it memorable! 💌\n\n1. Plan a mini surprise around something they genuinely enjoy.\n2. Add a personal touch — a voice note, a letter, or a playlist.\n3. Keep one little reveal for the end, like a favourite dessert or a memory photo.\n\nTell me their hobbies and I can tailor this more.`,
  `Here's a sweet, low-pressure surprise idea 🌷\n\nCreate a “choose your moment” envelope with 3 options: a movie night, a favourite-food date, or a walk somewhere meaningful. Add a short note explaining why you chose each one.\n\nIt feels personal without needing a big budget.`
 ];
 let idx=0; for(let i=0;i<prompt.length;i++)idx=(idx+prompt.charCodeAt(i)*(i+1))%ideas.length;
 if(budget && Number(budget)<500) return `Let's keep it under ₹${budget} ♡\n\n🎁 Make a mini memory box with a photo and handwritten notes.\n🍫 Add their favourite snack or homemade treat.\n🎧 Create a playlist connected to your memories together.\n💌 Write a small “open when you need a smile” note.\n\nMy pick: combine the note + snack + one photo. It feels personal and is usually inexpensive.`;
 return ideas[idx];
}
async function getAIReply(prompt){
 try{
  const response=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:prompt})});
  const data=await response.json();
  if(!response.ok) throw new Error(data.error||"AI service unavailable");
  if(data.reply) return data.reply;
  throw new Error("No reply returned");
 }catch(err){
  return suggestionReply(prompt)+"\n\n— Quick idea mode is active. Add your GEMINI_API_KEY in Vercel Environment Variables and redeploy to enable live AI.";
 }
}
$("chatForm").onsubmit=async e=>{e.preventDefault();const value=$("chatInput").value.trim();if(!value)return;addMessage("user",value);$("chatInput").value="";const loading=document.createElement("div");loading.className="message bot";loading.textContent="Thinking of something thoughtful… ✧";loading.id="aiLoading";$("chatMessages").appendChild(loading);$("chatMessages").scrollTop=$("chatMessages").scrollHeight;const reply=await getAIReply(value);$("aiLoading")?.remove();addMessage("bot",reply)};
document.querySelectorAll("[data-prompt]").forEach(b=>b.onclick=()=>{$("chatInput").value=b.dataset.prompt;$("chatForm").requestSubmit()});
$("clearChat").onclick=()=>{$("chatMessages").innerHTML="";addMessage("bot","Fresh ideas, fresh start! ♡ What are we planning?")};
renderDates();renderTasks();renderProfile();setInterval(checkReminders,15000);
