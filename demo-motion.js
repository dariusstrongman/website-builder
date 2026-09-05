const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const arcProjects = [
  {src:'assets/arc-house.webp',alt:'Wide view of a Texas Hill Country residence at sunset',place:'Hill Country',type:'Landscape view · design study',number:'01',position:'50% 50%'},
  {src:'assets/arc-house.webp',alt:'Close view of the stone and glass threshold of a Texas Hill Country residence',place:'Stone + glass',type:'Threshold view · design study',number:'02',position:'72% 50%'},
  {src:'assets/arc-house.webp',alt:'Interior gathering area inside a Texas Hill Country residence',place:'Living + dining',type:'Interior view · design study',number:'03',position:'92% 50%'}
];
document.querySelectorAll('[data-arc-project]').forEach(button=>button.addEventListener('click',()=>{
  const project=arcProjects[Number(button.dataset.arcProject)];
  const image=document.getElementById('arc-image');
  if(!project||!image)return;
  document.querySelectorAll('[data-arc-project]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active))});
  const apply=()=>{image.src=project.src;image.alt=project.alt;image.style.objectPosition=project.position;document.getElementById('arc-place').textContent=project.place;document.getElementById('arc-type').textContent=project.type;document.getElementById('arc-number').textContent=project.number};
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
  import('https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm').then(({animate,inView,scroll})=>{
    document.querySelectorAll('[data-motion-item]').forEach(item=>animate(item,{opacity:[0,1],y:[24,0]},{duration:.8,ease:[.22,1,.36,1]}));
    document.querySelectorAll('[data-motion-image]').forEach(item=>animate(item,{opacity:[0,1],scale:[1.025,1]},{duration:1.1,ease:[.22,1,.36,1]}));
    inView('.arc-selector-head, .form-method>header, .forge-system>header',element=>{animate(element,{opacity:[.45,1],y:[28,0]},{duration:.72,ease:[.22,1,.36,1]})},{margin:'0px 0px -12% 0px'});
    const arcImage=document.querySelector('.arc-feature img');
    const formWordmark=document.querySelector('.form-wordmark');
    const forgeImage=document.querySelector('.forge-photo img');
    if(arcImage)scroll(animate(arcImage,{scale:[1,1.07]},{ease:'linear'}),{target:arcImage,offset:['start end','end start']});
    if(formWordmark)scroll(animate(formWordmark,{x:['-2%','10%']},{ease:'linear'}),{target:document.querySelector('.form-stage'),offset:['start start','end start']});
    if(forgeImage)scroll(animate(forgeImage,{scale:[1.03,1.11],x:['0%','-2%']},{ease:'linear'}),{target:forgeImage,offset:['start end','end start']});
  }).catch(()=>{});
}
