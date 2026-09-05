const chapters=[
  {k:'01 / BRIEF',title:'The business decides what the design must do.',body:'ARC House is for a high-value residential client. The goal is a project consultation, and the site must feel calm, established and image-led without becoming generic luxury minimalism.'},
  {k:'02 / DIRECTION',title:'Three routes change the actual system.',body:'Signal is direct, Current is expressive, Ledger is editorial. Pick one and the live sample changes composition and typography, not just its color.'},
  {k:'03 / BUILD',title:'The chosen idea has to survive real pages.',body:'Move through Home, Residences, Approach and Studio. A direction is only useful if it still feels coherent once the hero is no longer doing all the work.'},
  {k:'04 / MOBILE',title:'Mobile is recomposed, not cropped.',body:'The same website rearranges its hierarchy for a narrow viewport. Text, imagery and navigation move intentionally instead of disappearing behind a desktop crop.'},
  {k:'05 / REVISION',title:'Feedback changes the work you are looking at.',body:'Apply a real headline revision, inspect the result and reverse it. The customer should see exactly what a revision changes before the site is approved.'}
];
let chapter=0;
let direction='signal';
let view='home';
let mobile=false;
let revised=false;
const chapterButtons=[...document.querySelectorAll('[data-v16-chapter]')];
const browser=document.querySelector('.browser-shell');
const sample=document.querySelector('.arc-sample');
const kicker=document.getElementById('story-kicker');
const title=document.getElementById('story-title');
const body=document.getElementById('story-body');
const status=document.getElementById('lab-status-text');
const headline=document.getElementById('arc-headline');
const originalHeadline='Space for the life within.';
const revisedHeadline='A quieter way to live.';
function renderChapter(index){
  chapter=Math.max(0,Math.min(index,chapters.length-1));
  chapterButtons.forEach((button,i)=>{
    const active=i===chapter;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  const current=chapters[chapter];
  kicker.textContent=current.k;
  title.textContent=current.title;
  body.textContent=current.body;
  document.querySelectorAll('[data-chapter-control]').forEach(control=>{
    control.hidden=Number(control.dataset.chapterControl)!==chapter;
  });
  status.textContent=['Brief defined','Direction comparison','System building','Mobile proof','Revision review'][chapter];
  if(chapter===0){setView('home');setMobile(false)}
  if(chapter===1){setView('home');setMobile(false)}
  if(chapter===2){setMobile(false)}
  if(chapter===3){setView('home');setMobile(true)}
  if(chapter===4){setView('home');setMobile(false)}
  document.getElementById('next-chapter').textContent=chapter===chapters.length-1?'Back to the brief':'Next chapter →';
}
function setDirection(next){
  direction=next;
  sample.classList.remove('dir-signal','dir-current','dir-ledger');
  sample.classList.add(`dir-${next}`);
  document.querySelectorAll('[data-direction]').forEach(button=>{
    const active=button.dataset.direction===next;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  document.getElementById('direction-readout').textContent=next==='signal'?'Signal selected · direct / decisive':next==='current'?'Current selected · expressive / kinetic':'Ledger selected · editorial / assured';
}
function setView(next){
  view=next;
  document.querySelectorAll('[data-arc-view]').forEach(panel=>panel.classList.toggle('active',panel.dataset.arcView===next));
  document.querySelectorAll('[data-view]').forEach(button=>{
    const active=button.dataset.view===next;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
}
function setMobile(next){
  mobile=next;
  browser.classList.toggle('is-mobile',mobile);
  document.querySelectorAll('[data-device]').forEach(button=>{
    const active=(button.dataset.device==='mobile')===mobile;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  document.getElementById('viewport-readout').textContent=mobile?'390px · content reordered':'Desktop · full composition';
}
function setRevision(next){
  revised=next;
  headline.textContent=revised?revisedHeadline:originalHeadline;
  document.getElementById('revision-status').textContent=revised?'Applied · click again to restore original':'Original headline · no change applied';
  document.getElementById('apply-revision').textContent=revised?'Restore original headline':'Apply requested headline';
}
chapterButtons.forEach((button,i)=>button.addEventListener('click',()=>renderChapter(i)));
document.querySelectorAll('[data-direction]').forEach(button=>button.addEventListener('click',()=>setDirection(button.dataset.direction)));
document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.view)));
document.querySelectorAll('[data-device]').forEach(button=>button.addEventListener('click',()=>setMobile(button.dataset.device==='mobile')));
document.getElementById('apply-revision')?.addEventListener('click',()=>setRevision(!revised));
document.getElementById('next-chapter')?.addEventListener('click',()=>renderChapter(chapter===chapters.length-1?0:chapter+1));
setDirection('signal');
setView('home');
setMobile(false);
setRevision(false);
renderChapter(0);
