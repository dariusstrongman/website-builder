const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const arcProjects = [
  {src:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=88',alt:'Warm modern living space opening onto a garden',place:'West Lake Hills',type:'Courtyard residence · 2026',number:'01'},
  {src:'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=88',alt:'Minimal home with a sheltered outdoor living area',place:'Dripping Springs',type:'Juniper House · 2025',number:'02'},
  {src:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=88',alt:'Contemporary home set against a quiet landscape',place:'Marfa',type:'Quiet Ridge · 2024',number:'03'}
];
document.querySelectorAll('[data-arc-project]').forEach(button=>button.addEventListener('click',()=>{
  const project=arcProjects[Number(button.dataset.arcProject)];
  const image=document.getElementById('arc-image');
  if(!project||!image)return;
  document.querySelectorAll('[data-arc-project]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active))});
  const apply=()=>{image.src=project.src;image.alt=project.alt;document.getElementById('arc-place').textContent=project.place;document.getElementById('arc-type').textContent=project.type;document.getElementById('arc-number').textContent=project.number};
  if(document.startViewTransition&&!reducedMotion)document.startViewTransition(apply);else apply();
}));

document.querySelectorAll('[data-class-filter]').forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.classFilter;
  document.querySelectorAll('[data-class-filter]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active))});
  document.querySelectorAll('[data-class]').forEach(card=>{card.hidden=!(filter==='all'||card.dataset.class===filter)});
}));

const forgeStates=[
  {label:'01 · DETECT',kicker:'VIBRATION / SPINDLE B',value:'+18.4%',copy:'Threshold crossed for 42 seconds. The raw event is retained before interpretation.',progress:0},
  {label:'02 · CLASSIFY',kicker:'PATTERN / BEARING WEAR',value:'84%',copy:'The signal matches a known wear signature. Competing explanations remain attached.',progress:33},
  {label:'03 · RECOMMEND',kicker:'WINDOW / PLANNED STOP',value:'14:30',copy:'Inspect during the existing maintenance window. No automatic stop is issued.',progress:66},
  {label:'04 · APPROVE',kicker:'AUTHORITY / MAINTENANCE LEAD',value:'PENDING',copy:'A named owner sees the evidence, accepts or rejects the action and closes the record.',progress:100}
];
document.querySelectorAll('[data-forge-step]').forEach(button=>button.addEventListener('click',()=>{
  const state=forgeStates[Number(button.dataset.forgeStep)];if(!state)return;
  document.querySelectorAll('[data-forge-step]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active))});
  document.getElementById('forge-state-label').textContent=state.label;
  document.getElementById('forge-reading-kicker').textContent=state.kicker;
  document.getElementById('forge-reading-value').textContent=state.value;
  document.getElementById('forge-reading-copy').textContent=state.copy;
  document.getElementById('forge-progress').style.strokeDashoffset=String(660-(660*state.progress/100));
}));

if(!reducedMotion){
  import('https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm').then(({animate,inView})=>{
    document.querySelectorAll('[data-motion-item]').forEach(item=>animate(item,{opacity:[0,1],y:[24,0]},{duration:.8,ease:[.22,1,.36,1]}));
    document.querySelectorAll('[data-motion-image]').forEach(item=>animate(item,{opacity:[0,1],scale:[1.025,1]},{duration:1.1,ease:[.22,1,.36,1]}));
    inView('main > section:not(:first-child)',element=>{animate(element,{opacity:[.55,1],y:[18,0]},{duration:.65,ease:[.22,1,.36,1]})},{margin:'0px 0px -10% 0px'});
  }).catch(()=>{});
}
