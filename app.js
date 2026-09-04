const motionBehavior=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
const panels={brief:document.querySelector('#brief-panel'),directions:document.querySelector('#directions-panel'),build:document.querySelector('#build-panel'),delivery:document.querySelector('#delivery-panel')};
const stepButtons=[...document.querySelectorAll('[data-step-target]')];let furthest=1;
function show(step){if(!panels.brief)return;const order=['brief','directions','build','delivery'];const index=order.indexOf(step)+1;if(index>furthest)return;Object.entries(panels).forEach(([key,panel])=>panel?.classList.toggle('active',key===step));stepButtons.forEach((button,i)=>{button.classList.toggle('active',i===index-1);button.disabled=i+1>furthest;button.setAttribute('aria-pressed',String(i===index-1))});document.querySelector('.studio-shell')?.scrollIntoView({behavior:motionBehavior,block:'start'})}
document.querySelectorAll('[data-scroll]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.scroll)?.scrollIntoView({behavior:motionBehavior})));stepButtons.forEach(button=>button.addEventListener('click',()=>show(button.dataset.stepTarget)));
document.getElementById('brief-form')?.addEventListener('submit',event=>{event.preventDefault();const business=document.getElementById('business').value.trim()||'your business';document.getElementById('company-label').textContent=business;furthest=Math.max(furthest,2);show('directions')});
document.querySelectorAll('.direction-card').forEach(card=>card.querySelector('.choose')?.addEventListener('click',()=>{document.querySelectorAll('.direction-card').forEach(item=>{item.classList.remove('selected');item.querySelector('.choose').textContent='Choose'});card.classList.add('selected');card.querySelector('.choose').textContent='Selected ✓';document.getElementById('chosen-name').textContent=card.dataset.direction;window.setTimeout(()=>{furthest=Math.max(furthest,3);show('build')},450)}));
document.getElementById('simulate-build')?.addEventListener('click',()=>{furthest=4;show('delivery')});document.getElementById('restart')?.addEventListener('click',()=>{furthest=1;document.getElementById('brief-form')?.reset();document.querySelectorAll('.direction-card').forEach(card=>{card.classList.remove('selected');card.querySelector('.choose').textContent='Choose'});show('brief')});
document.querySelectorAll('.faq-question').forEach(button=>button.addEventListener('click',()=>{const item=button.closest('.faq-item');const open=item.classList.toggle('open');button.setAttribute('aria-expanded',String(open))}));
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduceMotion&&!document.body.classList.contains('premium-site')){
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
  walkButtons.forEach((button,i)=>{button.classList.toggle('active',i===walkIndex);button.setAttribute('aria-pressed',String(i===walkIndex))});
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
let previewMode='desktop';
function renderPreviewFrames(){
  if(!previewButtons.length)return;
  const viewportWidth=previewMode==='mobile'?390:1440;
  const viewportHeight=previewMode==='mobile'?760:720;
  document.querySelector('.live-showcases')?.classList.toggle('mobile-mode',previewMode==='mobile');
  previewButtons.forEach(button=>{const active=button.dataset.previewMode===previewMode;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});
  const description=document.getElementById('preview-description');
  if(description)description.textContent=previewMode==='mobile'?'Mobile view: true 390px layout, copy and conversion path.':'Desktop view: full navigation, composition and motion.';
  document.querySelectorAll('.device-note').forEach(note=>{note.textContent=note.dataset[previewMode]});
  document.querySelectorAll('.demo-browser').forEach(frame=>{
    const chromeHeight=frame.querySelector('.demo-browser-bar').getBoundingClientRect().height;
    const available=Math.max(1,frame.clientWidth);
    const scale=Math.min(1,available/viewportWidth);
    const iframe=frame.querySelector('iframe');
    const applyFrameMode=()=>{
      try{
        iframe.contentDocument?.body?.classList.toggle('preview-force-desktop',previewMode==='desktop');
      }catch(error){/* Same-origin previews are expected; the visual remains usable if unavailable. */}
    };
    iframe.style.width=`${viewportWidth}px`;
    iframe.style.height=`${viewportHeight}px`;
    iframe.style.transform=`scale(${scale})`;
    frame.style.height=`${chromeHeight+(viewportHeight*scale)}px`;
    applyFrameMode();
    iframe.onload=applyFrameMode;
  });
}
previewButtons.forEach(button=>button.addEventListener('click',()=>{previewMode=button.dataset.previewMode;renderPreviewFrames()}));
window.addEventListener('resize',renderPreviewFrames);
window.addEventListener('load',renderPreviewFrames);
renderPreviewFrames();
stepButtons.forEach((button,i)=>{button.disabled=i>0;button.setAttribute('aria-pressed',String(i===0))});
