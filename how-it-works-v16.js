const chapters=[
  {k:'01 / BRIEF',title:'Start with the business, not a template.',body:'The sample begins with a clear goal, buyer and constraints before any visual direction is selected.'},
  {k:'02 / DIRECTIONS',title:'Compare three real creative routes.',body:'Each direction changes layout, typography and visual behavior, not just the accent color.'},
  {k:'03 / BUILD',title:'Expand the chosen route into real pages.',body:'Move through multiple content views to see how one system holds together beyond the hero.'},
  {k:'04 / MOBILE',title:'Responsive means rearranged, not cropped.',body:'Switch to a true mobile composition. Content changes order and density instead of disappearing behind a crop.'},
  {k:'05 / REVISION',title:'Change something meaningful, then change it back.',body:'A revision updates the actual sample website so the customer sees exactly what feedback changes before delivery.'}
];
let chapter=0;let direction='signal';let mobile=false;let revised=false;
const chapterButtons=[...document.querySelectorAll('[data-v16-chapter]')];
const sideButtons=[...document.querySelectorAll('[data-v16-side]')];
const frame=document.querySelector('.browser');
const site=document.querySelector('.sample-site');
const kicker=document.getElementById('chapter-kicker');
const title=document.getElementById('chapter-title');
const body=document.getElementById('chapter-body');
const instruction=document.getElementById('chapter-instruction');
const headline=document.getElementById('sample-headline');
const originalHeadline='Space for the life within.';
const revisedHeadline='A quieter kind of home.';
function renderChapter(index){
  chapter=Math.max(0,Math.min(index,chapters.length-1));
  chapterButtons.forEach((b,i)=>{b.classList.toggle('active',i===chapter);b.setAttribute('aria-pressed',String(i===chapter))});
  sideButtons.forEach((b,i)=>b.classList.toggle('active',i===chapter));
  const c=chapters[chapter];kicker.textContent=c.k;title.textContent=c.title;body.textContent=c.body;
  document.querySelectorAll('[data-chapter-only]').forEach(el=>el.hidden=Number(el.dataset.chapterOnly)!==chapter);
  const messages=[
    '<b>Brief locked.</b> ARC House needs to feel established, calm and architectural without falling into generic luxury minimalism.',
    '<b>Choose a route.</b> Signal is direct, Current is expressive, Ledger is editorial. The sample below actually restructures.',
    '<b>Inspect depth.</b> Switch between Home, Residences, Practice and Contact to see whether the chosen system survives interior content.',
    '<b>Test mobile.</b> The mobile mode changes order, scale and density instead of masking desktop content.',
    '<b>Revise the work.</b> Apply the requested headline change, compare it, then revert it before final approval.'
  ];instruction.innerHTML=messages[chapter];
  if(chapter===3&&!mobile)setMobile(true);
}
function setDirection(next){direction=next;site.classList.remove('direction-signal','direction-current','direction-ledger');site.classList.add(`direction-${direction}`);document.querySelectorAll('[data-direction]').forEach(b=>{const active=b.dataset.direction===direction;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))})}
function setMobile(next){mobile=next;frame.classList.toggle('mobile',mobile);document.querySelectorAll('[data-device]').forEach(b=>{const active=(b.dataset.device==='mobile')===mobile;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});document.getElementById('device-label').textContent=mobile?'390px mobile composition':'Desktop composition'}
function setView(next){document.querySelectorAll('[data-content-view]').forEach(p=>p.classList.toggle('active',p.dataset.contentView===next));document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===next;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))})}
function setRevision(next){revised=next;headline.textContent=revised?revisedHeadline:originalHeadline;document.getElementById('revision-note').classList.toggle('show',revised);document.getElementById('apply-revision').textContent=revised?'Revert headline':'Apply headline revision';document.getElementById('revision-status').textContent=revised?'Revision applied · reversible':'Original copy'}
chapterButtons.forEach((b,i)=>b.addEventListener('click',()=>renderChapter(i)));sideButtons.forEach((b,i)=>b.addEventListener('click',()=>renderChapter(i)));
document.querySelectorAll('[data-direction]').forEach(b=>b.addEventListener('click',()=>setDirection(b.dataset.direction)));
document.querySelectorAll('[data-device]').forEach(b=>b.addEventListener('click',()=>setMobile(b.dataset.device==='mobile')));
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
document.getElementById('apply-revision')?.addEventListener('click',()=>setRevision(!revised));
document.getElementById('next-chapter')?.addEventListener('click',()=>renderChapter((chapter+1)%chapters.length));
document.querySelector('.mobile-menu-button')?.addEventListener('click',()=>{const nav=document.getElementById('main-navigation');const open=nav.classList.toggle('open');nav.style.display=open?'flex':''});
setDirection('signal');setMobile(false);setView('home');setRevision(false);renderChapter(0);
