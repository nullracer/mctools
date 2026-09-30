const grid=document.querySelector('#grid');
const title=document.querySelector('#month-title');
const classList=document.querySelector('#classes');
const assignmentList=document.querySelector('#assignments');
const today=new Date();today.setHours(0,0,0,0);
let cursor=new Date(today.getFullYear(),today.getMonth(),1),events=[];
const fmt=(d,o)=>new Intl.DateTimeFormat(undefined,o).format(d);
const dval=v=>{if(!v)return null;const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v);return m?new Date(+m[1],+m[2]-1,+m[3]):new Date(v)};
const same=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
function details(e){
 const full=e.title||'Untitled event',block=full.match(/\s-\s([A-G])\s\(\1\)$/i);
 if(block)return{type:'class',name:full.replace(/\s-\s[A-G]\s\([A-G]\)$/i,''),block:block[1].toUpperCase()};
 const split=full.indexOf(' - ');
 return split>0&&split<full.length-3?{type:'assignment',course:full.slice(0,split).trim(),name:full.slice(split+3).trim()}:{type:'assignment',course:'',name:full};
}
function timeRange(e){
 const start=dval(e.start),end=dval(e.end);
 if(!start||e.all_day)return e.all_day?'All day':'';
 const options={hour:'numeric',minute:'2-digit'};
 return end&&end>start?`${fmt(start,options)}–${fmt(end,options)}`:fmt(start,options);
}
function render(){
 title.textContent=fmt(cursor,{month:'long',year:'numeric'});grid.replaceChildren();
 const offset=new Date(cursor.getFullYear(),cursor.getMonth(),1).getDay(),days=new Date(cursor.getFullYear(),cursor.getMonth()+1,0).getDate(),total=Math.ceil((offset+days)/7)*7;
 for(let i=0;i<total;i++){
  const day=new Date(cursor.getFullYear(),cursor.getMonth(),i-offset+1),cell=document.createElement('div');
  cell.className='day'+(day.getMonth()!==cursor.getMonth()?' outside':'')+(same(day,today)?' today':'');
  const number=document.createElement('div');number.className='day-num';number.textContent=day.getDate();cell.append(number);
  const on=events.filter(e=>{
   const info=details(e),start=dval(e.start),end=dval(e.end)||start;if(!start)return false;
   if(info.type!=='class')return false;
   return day>=new Date(start.getFullYear(),start.getMonth(),start.getDate())&&day<=new Date(end.getFullYear(),end.getMonth(),end.getDate());
  }).sort((a,b)=>(details(a).type==='class'?-1:1)-(details(b).type==='class'?-1:1)||dval(a.start)-dval(b.start));
  on.slice(0,3).forEach(e=>{
   const info=details(e),button=document.createElement('button');button.className='chip class';
   const start=dval(e.start);
   button.textContent=`${info.name} · ${timeRange(e)}`;
   button.title=[e.title,e.location].filter(Boolean).join(' · ');
   button.onclick=()=>document.getElementById('event-'+encodeURIComponent(e.id))?.scrollIntoView({behavior:'smooth',block:'center'});cell.append(button);
  });
  if(on.length>3){const more=document.createElement('div');more.className='more';more.textContent=`+${on.length-3} more`;cell.append(more)}grid.append(cell);
 }
 renderUpcoming();
}
function renderUpcoming(){
 const assignments=events.filter(e=>details(e).type==='assignment'&&dval(e.start)>=today).sort((a,b)=>dval(a.start)-dval(b.start));
 const classes=events.filter(e=>{if(details(e).type!=='class'||!dval(e.start))return false;const start=dval(e.start),end=dval(e.end)||start;return today>=new Date(start.getFullYear(),start.getMonth(),start.getDate())&&today<=new Date(end.getFullYear(),end.getMonth(),end.getDate())}).sort((a,b)=>dval(a.start)-dval(b.start));
 document.querySelector('#class-count').textContent=classes.length?`${classes.length} today`:'';
 document.querySelector('#assignment-count').textContent=assignments.length?`${assignments.length} upcoming`:'';
 document.querySelector('#classes-heading').textContent=`Classes · ${fmt(today,{weekday:'long'})}`;
 fillList(classList,classes,'class');fillList(assignmentList,assignments,'assignment');
}
function fillList(container,list,type){
 container.replaceChildren();
 if(!list.length){const empty=document.createElement('p');empty.className='empty';empty.textContent=type==='class'?'No upcoming classes.':'No upcoming assignments.';container.append(empty);return}
 for(const event of list){
  const start=dval(event.start),infoData=details(event),card=document.createElement('article');card.className=`event ${type}-event`;card.id='event-'+encodeURIComponent(event.id);
  const date=document.createElement('div');date.className='date-box';date.innerHTML=`<b>${fmt(start,{day:'numeric'})}</b><small>${fmt(start,{month:'short'})}</small>`;
  const info=document.createElement('div'),heading=document.createElement('h3'),meta=document.createElement('p');
  heading.textContent=type==='class'?infoData.name:infoData.name;
  meta.textContent=type==='class'?[`Block ${infoData.block}`,timeRange(event),event.location].filter(Boolean).join(' · '):[`Due ${fmt(start,{weekday:'long',month:'short',day:'numeric'})}`,infoData.course].filter(Boolean).join(' · ');
  info.append(heading,meta);card.append(date,info);container.append(card);
 }
}
document.querySelector('#prev').onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1);render()};
document.querySelector('#next').onclick=()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1);render()};
document.querySelector('#today').onclick=()=>{cursor=new Date(today.getFullYear(),today.getMonth(),1);render()};
fetch('./events.json',{cache:'no-store'}).then(response=>{if(!response.ok)throw Error();return response.json()}).then(data=>{
 events=data.events||[];document.querySelector('#updated').textContent=data.updated?`Updated ${fmt(new Date(data.updated),{dateStyle:'medium',timeStyle:'short'})}`:'Calendar feed';render();
}).catch(()=>{render();const empty=document.createElement('p');empty.className='empty';empty.textContent='Calendar data is not published yet. Configure the CALENDAR_FEED secret and run the GitHub Actions workflow.';classList.replaceChildren(empty)});
