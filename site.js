/* Shared interactions: native navigation, explicit states, no animation dependency. */
const siteHeader = document.querySelector('.site-header');
const menuButton = document.querySelector('.mobile-menu-button');
const navGroups = [...document.querySelectorAll('.nav-group')];
function closeGroups(except) {
  navGroups.forEach(group => { if (group !== except) group.open = false; });
}
navGroups.forEach(group => group.addEventListener('toggle', () => {
  if (group.open) closeGroups(group);
}));
menuButton?.addEventListener('click', () => {
  const open = siteHeader.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
  if (!open) closeGroups();
});
document.addEventListener('click', event => {
  if (!siteHeader?.contains(event.target)) {
    closeGroups();
    siteHeader?.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const openGroup = navGroups.find(group => group.open);
  if (openGroup) {
    closeGroups();
    openGroup.querySelector('summary').focus();
  } else if (siteHeader?.classList.contains('menu-open')) {
    siteHeader.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.focus();
  }
});
const planNeeds = document.querySelector('#plan-needs');
const planMessages = {
  launch: 'Launch fits this scope — $500',
  business: 'Business fits this scope — $1,000',
  premium: 'Premium fits this scope — $1,500'
};
planNeeds?.addEventListener('change', () => {
  document.querySelectorAll('.plan').forEach(plan => {
    plan.classList.toggle('selected-plan', plan.id === `plan-${planNeeds.value}`);
  });
  document.querySelector('#plan-match').textContent = planMessages[planNeeds.value] || 'Compare the scope below';
});

/* Purposeful progressive motion for the customer-facing product. */
const premiumReduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!premiumReduceMotion&&document.body.classList.contains('premium-site')){
  import('https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm').then(({animate,inView,stagger,scroll})=>{
    const intro=document.querySelector('.home-intro');
    if(intro)animate(intro.children,{opacity:[0,1],y:[18,0]},{delay:stagger(.08),duration:.65,ease:[.22,1,.36,1]});
    const specimens=[...document.querySelectorAll('.specimen')];
    if(specimens.length)inView('.specimen-grid',()=>{animate(specimens,{opacity:[0,1],y:[30,0]},{delay:stagger(.1),duration:.7,ease:[.22,1,.36,1]})},{amount:.18});
    const aboutImage=document.querySelector('.brand-story-image');
    if(aboutImage)scroll(animate(aboutImage,{scale:[.985,1.025]},{ease:'linear'}),{target:aboutImage,offset:['start end','end start']});
    const plans=[...document.querySelectorAll('.plan')];
    if(plans.length)inView('.plans',()=>{animate(plans,{opacity:[0,1],y:[24,0]},{delay:stagger(.08),duration:.6,ease:[.22,1,.36,1]})},{amount:.2});
    document.querySelectorAll('.work-visual>img').forEach(image=>scroll(animate(image,{scale:[1.015,1.085]},{ease:'linear'}),{target:image.closest('.work-stage'),offset:['start end','end start']}));
    document.querySelectorAll('.case-image img').forEach(image=>scroll(animate(image,{scale:[1.01,1.075]},{ease:'linear'}),{target:image.closest('.case-image'),offset:['start end','end start']}));
    document.querySelectorAll('.case-decisions').forEach(section=>inView(section,()=>{animate([...section.children],{opacity:[0,1],y:[28,0]},{delay:stagger(.11),duration:.7,ease:[.22,1,.36,1]})},{amount:.18}));
  }).catch(()=>{});
}

const directionPulse=document.querySelector('.direction-pulse');
if(directionPulse){
  const routeButtons=[...directionPulse.querySelectorAll('[data-live-route]')];
  const routeStates=[
    {name:'Editorial authority',copy:'Cinematic imagery, measured typography and quiet pacing make the work itself feel valuable.',link:'examples.html#architecture',label:'Open the architecture study →'},
    {name:'Kinetic energy',copy:'Bold type, controlled color and responsive movement turn atmosphere into a reason to participate.',link:'examples.html#wellness',label:'Open the wellness study →'},
    {name:'Operational confidence',copy:'Inspectable states, technical hierarchy and visible evidence make an unfamiliar product understandable.',link:'examples.html#industrial',label:'Open the industrial study →'}
  ];
  let activeRoute=0;
  let routeTimer;
  const selectRoute=index=>{
    activeRoute=index;
    const state=routeStates[index];
    directionPulse.dataset.route=String(index);
    routeButtons.forEach((button,buttonIndex)=>{const active=buttonIndex===index;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});
    document.querySelector('#direction-count').textContent=`${String(index+1).padStart(2,'0')} / 03`;
    document.querySelector('#direction-name').textContent=state.name;
    document.querySelector('#direction-copy').textContent=state.copy;
    const link=document.querySelector('#direction-link');link.href=state.link;link.textContent=state.label;
  };
  const stopCycle=()=>window.clearTimeout(routeTimer);
  const startCycle=()=>{if(premiumReduceMotion||activeRoute===routeStates.length-1)return;stopCycle();routeTimer=window.setTimeout(()=>{selectRoute(activeRoute+1);startCycle()},3200)};
  routeButtons.forEach((button,index)=>button.addEventListener('click',()=>{selectRoute(index);startCycle()}));
  directionPulse.addEventListener('mouseenter',stopCycle);
  directionPulse.addEventListener('mouseleave',startCycle);
  directionPulse.addEventListener('focusin',stopCycle);
  directionPulse.addEventListener('focusout',event=>{if(!directionPulse.contains(event.relatedTarget))startCycle()});
  selectRoute(0);
  startCycle();
}

/* Website Builder brief: support both fresh builds and redesigns without
   changing the backend contract while the current Sol proof is running.
   Existing-site context is carried into reference_notes, which already
   persists into the customer website job. */
const websiteBrief=document.querySelector('#brief-form');
if(websiteBrief&&!document.querySelector('#project-type')){
  const firstGrid=websiteBrief.querySelector('.field-grid');
  firstGrid?.insertAdjacentHTML('afterend',`
    <fieldset id="project-type-fieldset">
      <legend>Are we starting fresh or redesigning an existing site?</legend>
      <div class="chips" id="project-type">
        <label><input type="radio" name="project_type" value="new" checked><span>New website</span></label>
        <label><input type="radio" name="project_type" value="redesign"><span>Redesign existing site</span></label>
      </div>
    </fieldset>
    <fieldset id="existing-site-fields" hidden>
      <label>Current website
        <input id="current-site" name="existing_site_url" inputmode="url" autocomplete="url" placeholder="https://yourwebsite.com">
      </label>
      <small class="project-help">We use this as context for what exists today. Nothing on that site is changed from this form.</small>
    </fieldset>`);

  const style=document.createElement('style');
  style.dataset.intakeEnhancement='redesign';
  style.textContent=`
    .premium-site .stepper{grid-template-columns:repeat(5,minmax(0,1fr))}
    .premium-site .project-help{display:block;margin-top:8px;color:var(--muted);font-size:12px;font-weight:400}
    @media(max-width:620px){.premium-site .stepper{grid-template-columns:repeat(5,minmax(0,1fr))}}`;
  document.head.append(style);

  const projectInputs=[...document.querySelectorAll('input[name="project_type"]')];
  const existingFields=document.querySelector('#existing-site-fields');
  const currentSite=document.querySelector('#current-site');
  const projectType=()=>projectInputs.find(input=>input.checked)?.value||'new';
  const syncProjectType=()=>{
    const redesign=projectType()==='redesign';
    existingFields.hidden=!redesign;
    currentSite.required=redesign;
    currentSite.setAttribute('aria-required',String(redesign));
  };
  projectInputs.forEach(input=>input.addEventListener('change',syncProjectType));
  syncProjectType();

  const replaceLabel=(inputId,text,placeholder)=>{
    const input=document.getElementById(inputId);
    const label=input?.closest('label');
    if(label?.firstChild?.nodeType===Node.TEXT_NODE)label.firstChild.textContent=text;
    if(input&&placeholder)input.placeholder=placeholder;
  };
  replaceLabel('avoid','Anything we should keep, change, or avoid?','Example: keep our logo, improve mobile, avoid stock photos...');
  replaceLabel('order-domain','Domain for the finished site');
  replaceLabel('order-notes','References, what to keep/change, and anything to avoid');

  const normaliseHostname=value=>{
    const raw=String(value||'').trim();
    if(!raw)return '';
    try{
      const url=new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)?raw:`https://${raw}`);
      return url.hostname.replace(/^www\./i,'');
    }catch(error){return '';}
  };
  const contextMarker='--- Existing site context ---';
  const stripContext=value=>{
    const text=String(value||'');
    const marker=`\n\n${contextMarker}`;
    const index=text.indexOf(marker);
    if(index>=0)return text.slice(0,index).trim();
    if(text.startsWith(contextMarker))return '';
    return text.trim();
  };
  const syncOrderContext=()=>{
    const notes=document.getElementById('order-notes');
    if(!notes)return;
    const base=stripContext(notes.value);
    if(projectType()==='redesign'){
      const current=currentSite.value.trim();
      const context=`${contextMarker}\nProject type: Redesign existing website\nCurrent website: ${current}`;
      notes.value=[base,context].filter(Boolean).join('\n\n');
    }else{
      notes.value=base;
    }
  };

  document.getElementById('start-order')?.addEventListener('click',()=>{
    if(projectType()==='redesign'){
      const orderDomain=document.getElementById('order-domain');
      if(orderDomain&&!orderDomain.value.trim())orderDomain.value=normaliseHostname(currentSite.value);
    }
    syncOrderContext();
  });
  document.getElementById('order-form')?.addEventListener('submit',syncOrderContext,true);
  websiteBrief.addEventListener('reset',()=>window.setTimeout(syncProjectType,0));
}
