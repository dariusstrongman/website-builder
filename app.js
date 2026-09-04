const panels={brief:document.querySelector('#brief-panel'),directions:document.querySelector('#directions-panel'),build:document.querySelector('#build-panel'),delivery:document.querySelector('#delivery-panel')};
const stepButtons=[...document.querySelectorAll('[data-step-target]')];let furthest=1;
function show(step){if(!panels.brief)return;const order=['brief','directions','build','delivery'];const index=order.indexOf(step)+1;if(index>furthest)return;Object.entries(panels).forEach(([key,panel])=>panel?.classList.toggle('active',key===step));stepButtons.forEach((button,i)=>button.classList.toggle('active',i===index-1));document.querySelector('.studio-shell')?.scrollIntoView({behavior:'smooth',block:'start'})}
document.querySelectorAll('[data-scroll]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.scroll)?.scrollIntoView({behavior:'smooth'})));stepButtons.forEach(button=>button.addEventListener('click',()=>show(button.dataset.stepTarget)));
document.getElementById('brief-form')?.addEventListener('submit',event=>{event.preventDefault();const business=document.getElementById('business').value.trim()||'your business';document.getElementById('company-label').textContent=business;furthest=Math.max(furthest,2);show('directions')});
document.querySelectorAll('.direction-card').forEach(card=>card.querySelector('.choose')?.addEventListener('click',()=>{document.querySelectorAll('.direction-card').forEach(item=>{item.classList.remove('selected');item.querySelector('.choose').textContent='Choose'});card.classList.add('selected');card.querySelector('.choose').textContent='Selected ✓';document.getElementById('chosen-name').textContent=card.dataset.direction;window.setTimeout(()=>{furthest=Math.max(furthest,3);show('build')},450)}));
document.getElementById('simulate-build')?.addEventListener('click',()=>{furthest=4;show('delivery')});document.getElementById('restart')?.addEventListener('click',()=>{furthest=1;document.getElementById('brief-form')?.reset();document.querySelectorAll('.direction-card').forEach(card=>card.classList.remove('selected'));show('brief')});
document.querySelectorAll('.faq-question').forEach(button=>button.addEventListener('click',()=>{const item=button.closest('.faq-item');const open=item.classList.toggle('open');button.setAttribute('aria-expanded',String(open))}));
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduceMotion){
  document.body.classList.add('motion-ready');
  const targets=document.querySelectorAll('main > section:not(.hero), .why-grid article, .stages article, .case, .gates article, .price-grid article');
  targets.forEach(target=>target.classList.add('reveal'));
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('seen');observer.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -40px'});
  targets.forEach(target=>observer.observe(target));
  const stage=document.querySelector('[data-parallax]');
  stage?.addEventListener('pointermove',event=>{const box=stage.getBoundingClientRect();stage.style.setProperty('--px',`${(event.clientX-box.left)/box.width-.5}`);stage.style.setProperty('--py',`${(event.clientY-box.top)/box.height-.5}`)});
  stage?.addEventListener('pointerleave',()=>{stage.style.setProperty('--px','0');stage.style.setProperty('--py','0')});
}

const walkButtons=[...document.querySelectorAll('[data-walk]')];
const walkPanels=[...document.querySelectorAll('[data-walk-panel]')];
let walkIndex=0;
const walkStates=['Brief received','Research complete','Structure mapped','Direction ready','Production active','Ready for approval'];
function renderWalk(index){
  if(!walkButtons.length)return;
  walkIndex=Math.max(0,Math.min(index,walkButtons.length-1));
  walkButtons.forEach((button,i)=>button.classList.toggle('active',i===walkIndex));
  walkPanels.forEach((panel,i)=>panel.classList.toggle('active',i===walkIndex));
  document.getElementById('walk-number').textContent=String(walkIndex+1).padStart(2,'0');
  document.getElementById('walk-count').textContent=`${walkIndex+1} of ${walkButtons.length}`;
  document.getElementById('walk-status').textContent=walkStates[walkIndex];
  document.getElementById('walk-bar').style.width=`${((walkIndex+1)/walkButtons.length)*100}%`;
  document.getElementById('walk-back').disabled=walkIndex===0;
  document.getElementById('walk-next').textContent=walkIndex===walkButtons.length-1?'Start my brief →':'Next stage →';
}
walkButtons.forEach((button,i)=>button.addEventListener('click',()=>renderWalk(i)));
document.getElementById('walk-back')?.addEventListener('click',()=>renderWalk(walkIndex-1));
document.getElementById('walk-next')?.addEventListener('click',()=>{if(walkIndex===walkButtons.length-1)location.href='index.html#studio';else renderWalk(walkIndex+1)});
renderWalk(0);

const previewButtons=[...document.querySelectorAll('[data-preview-mode]')];
previewButtons.forEach(button=>button.addEventListener('click',()=>{previewButtons.forEach(item=>item.classList.toggle('active',item===button));document.querySelectorAll('.demo-browser').forEach(frame=>frame.classList.toggle('mobile',button.dataset.previewMode==='mobile'))}));
