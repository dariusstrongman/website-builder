const motionBehavior=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
const panels={brief:document.querySelector('#brief-panel'),directions:document.querySelector('#directions-panel'),order:document.querySelector('#order-panel')};
const stepButtons=[...document.querySelectorAll('[data-step-target]')];let furthest=1;
function show(step){if(!panels.brief)return;const order=['brief','directions','order'];const index=order.indexOf(step)+1;if(index>furthest)return;Object.entries(panels).forEach(([key,panel])=>panel?.classList.toggle('active',key===step));stepButtons.forEach((button,i)=>{button.classList.toggle('active',i===index-1);button.disabled=i+1>furthest;button.setAttribute('aria-pressed',String(i===index-1))});document.querySelector('.studio-shell')?.scrollIntoView({behavior:motionBehavior,block:'start'})}
document.querySelectorAll('[data-scroll]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.scroll)?.scrollIntoView({behavior:motionBehavior})));stepButtons.forEach(button=>button.addEventListener('click',()=>show(button.dataset.stepTarget)));
document.getElementById('brief-form')?.addEventListener('submit',async event=>{event.preventDefault();await renderFreeVision()});
document.querySelectorAll('.direction-card').forEach(card=>card.querySelector('.choose')?.addEventListener('click',()=>{document.querySelectorAll('.direction-card').forEach(item=>{item.classList.remove('selected');item.querySelector('.choose').textContent='Choose'});card.classList.add('selected');card.querySelector('.choose').textContent='Selected ✓';document.getElementById('chosen-name').textContent=card.dataset.direction;window.setTimeout(()=>{furthest=Math.max(furthest,3);show('build')},450)}));
document.getElementById('restart')?.addEventListener('click',()=>{furthest=1;document.getElementById('brief-form')?.reset();show('brief')});
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

const workButtons=[...document.querySelectorAll('[data-work-route]')];
const workPanels=[...document.querySelectorAll('[data-work-panel]')];
function showWork(route,moveFocus=false){
  workButtons.forEach(button=>{const active=button.dataset.workRoute===route;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});
  workPanels.forEach(panel=>{const active=panel.dataset.workPanel===route;panel.hidden=!active;if(active&&moveFocus)panel.focus({preventScroll:true})});
}
workButtons.forEach(button=>button.addEventListener('click',()=>showWork(button.dataset.workRoute,true)));
workButtons.forEach((button,index)=>button.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const next=(index+(event.key==='ArrowRight'?1:-1)+workButtons.length)%workButtons.length;workButtons[next].focus();showWork(workButtons[next].dataset.workRoute)}));
if(workButtons.length){const requested=location.hash.replace('#','');showWork(workButtons.some(button=>button.dataset.workRoute===requested)?requested:'architecture')}

const siteViewer=document.querySelector('#site-viewer');
if(siteViewer){
  const viewerFrame=siteViewer.querySelector('#site-viewer-frame');
  const viewerTitle=siteViewer.querySelector('#site-viewer-title');
  const viewerLink=siteViewer.querySelector('#site-viewer-new-tab');
  const viewerPages=[...siteViewer.querySelectorAll('[data-viewer-page]')];
  const viewerDevices=[...siteViewer.querySelectorAll('[data-viewer-device]')];
  const previewSites={
    architecture:{title:'ARC House',labels:['Home','Residences','Practice','Inquiry'],urls:['demo-architecture.html','demo-arc-residences.html','demo-arc-practice.html','demo-arc-inquiry.html']},
    wellness:{title:'FORM/01',labels:['Home','Method','Classes','Join'],urls:['demo-wellness.html','demo-form-method.html','demo-form-classes.html','demo-form-join.html']},
    industrial:{title:'Forge Systems',labels:['Home','Platform','Decision record','Request study'],urls:['demo-industrial.html','demo-forge-platform.html','demo-forge-record.html','demo-forge-study.html']}
  };
  let activeSite='architecture';
  let activePage=0;
  let viewerOpener;
  const renderViewer=()=>{
    const site=previewSites[activeSite];
    const url=site.urls[activePage];
    viewerTitle.textContent=site.title;
    viewerFrame.title=`${site.title}, ${site.labels[activePage]} page preview`;
    viewerFrame.src=url;
    viewerLink.href=url;
    viewerPages.forEach((button,index)=>{button.textContent=site.labels[index];button.classList.toggle('active',index===activePage);button.setAttribute('aria-pressed',String(index===activePage))});
  };
  document.querySelectorAll('[data-preview-site]').forEach(button=>button.addEventListener('click',()=>{
    activeSite=button.dataset.previewSite;
    activePage=0;
    viewerOpener=button;
    renderViewer();
    document.body.classList.add('viewer-open');
    siteViewer.showModal();
  }));
  viewerPages.forEach((button,index)=>button.addEventListener('click',()=>{activePage=index;renderViewer()}));
  viewerDevices.forEach(button=>button.addEventListener('click',()=>{
    const mobile=button.dataset.viewerDevice==='mobile';
    siteViewer.classList.toggle('mobile-preview',mobile);
    viewerDevices.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active))});
  }));
  const closeViewer=()=>siteViewer.close();
  siteViewer.querySelector('.viewer-close').addEventListener('click',closeViewer);
  siteViewer.addEventListener('click',event=>{if(event.target===siteViewer)closeViewer()});
  siteViewer.addEventListener('close',()=>{document.body.classList.remove('viewer-open');viewerFrame.src='about:blank';viewerOpener?.focus()});
}

async function renderFreeVision(){
  const existing=document.getElementById('project-mode')?.value==='existing';
  let website=document.getElementById('current-website-url')?.value||'';
  const changeNotes=document.getElementById('change-notes')?.value||'';
  if(existing){
    try{
      const {validateBrief}=await import('./workspace/intake.mjs?v=free-vision-1');
      const brief=validateBrief({project_mode:'existing',current_website_url:website,change_notes:changeNotes,keep_notes:document.getElementById('keep-notes')?.value||''});
      website=brief.current_website_url;document.getElementById('current-website-url').value=website;
    }catch(error){
      const field=!website.trim()?document.getElementById('current-website-url'):document.getElementById('change-notes');
      field.setCustomValidity(error.message||'Review this field.');field.reportValidity();return;
    }
  }
  const {createFreeVision}=await import('./workspace/free-vision.mjs?v=1');
  const vision=createFreeVision({
    projectMode:existing?'existing':'new',website,
    changeNotes,business:document.getElementById('business')?.value||'',
    industry:document.getElementById('industry')?.value||'',goal:document.getElementById('goal')?.value||'',
    feelings:[...document.querySelectorAll('#feelings input:checked')].map(input=>input.value)
  });
  document.getElementById('company-label').textContent=vision.brand;
  document.getElementById('vision-brand').textContent=vision.brand.toUpperCase();
  document.getElementById('vision-domain').textContent=vision.domain;
  document.getElementById('vision-headline').textContent=vision.headline;
  document.getElementById('vision-summary').textContent=vision.summary;
  document.getElementById('vision-request').textContent=vision.requested;
  document.getElementById('vision-signals').replaceChildren(...vision.signals.map(signal=>{const li=document.createElement('li');li.textContent=signal;return li;}));
  document.querySelector('.vision-browser').dataset.visionTheme=vision.theme;
  furthest=Math.max(furthest,2);show('directions');
}

document.getElementById('vision-adjust')?.addEventListener('click',()=>show('brief'));
document.getElementById('vision-continue')?.addEventListener('click',async()=>{
  if(document.getElementById('project-mode')?.value==='existing'){await openRedesignIntake();return;}
  const notes=document.getElementById('order-notes');
  if(notes&&!notes.value.trim())notes.value=[document.getElementById('goal')?.value.trim(),document.getElementById('avoid')?.value.trim()&&('Avoid: '+document.getElementById('avoid').value.trim())].filter(Boolean).join('\n\n');
  furthest=3;show('order');
});
document.querySelectorAll('[data-vision-device]').forEach(button=>button.addEventListener('click',()=>{
  const mobile=button.dataset.visionDevice==='mobile';
  document.querySelector('.free-vision-layout')?.classList.toggle('vision-mobile',mobile);
  document.querySelector('.vision-canvas footer span:first-child').textContent=mobile?'MOBILE CONCEPT':'DESKTOP CONCEPT';
  document.querySelectorAll('[data-vision-device]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
}));

/* ---- Real project intake -------------------------------------------------
   The sample journey above stays a sample. This is the only part that leaves
   the browser, and it sends exactly what the visitor typed: no claim, no
   metric and no business fact is inferred here or added on the way out.
   There is no credential in this file. An internal test order cannot be
   requested from a browser at all — it needs an operator token that is only
   ever held server-side. -------------------------------------------------- */
const STROMATION_INTAKE='https://stromation-production.up.railway.app/website-order';
const orderStatus=document.getElementById('order-status');
const orderForm=document.getElementById('order-form');
document.getElementById('start-order')?.addEventListener('click',()=>{
  const notes=document.getElementById('order-notes');
  if(notes&&!notes.value.trim()){
    /* Carry the visitor's OWN words forward rather than asking twice. These
       are the goal and avoid fields they already filled in; nothing is
       written for them, and the field stays editable. */
    const goal=document.getElementById('goal')?.value.trim()||'';
    const avoid=document.getElementById('avoid')?.value.trim()||'';
    notes.value=[goal,avoid&&('Avoid: '+avoid)].filter(Boolean).join('\n\n');
  }
  furthest=Math.max(furthest,5);show('order');
});
orderForm?.addEventListener('submit',async event=>{
  event.preventDefault();
  const button=document.getElementById('order-submit');
  const business=document.getElementById('business')?.value.trim()||'';
  if(!business&&document.getElementById('project-mode')?.value!=='existing'){orderStatus.textContent='Add your business name in step 1 first.';show('brief');return;}
  let payload={
    mode:'paid',
    business_name:business,
    domain:document.getElementById('order-domain').value.trim(),
    contact_email:document.getElementById('order-email').value.trim(),
    buyer:document.getElementById('order-buyer').value.trim(),
    offer:document.getElementById('order-offer').value.trim(),
    primary_action:document.getElementById('order-action').value.trim(),
    reference_notes:document.getElementById('order-notes').value.trim(),
    source:'website-builder/index.html'
  };
  try{
    const {briefPayload}=await import('./workspace/intake.mjs?v=existing-site-1');
    payload=briefPayload({...payload,project_mode:document.getElementById('project-mode')?.value||'new',
      current_website_url:document.getElementById('current-website-url')?.value||'',
      keep_notes:document.getElementById('keep-notes')?.value||'',
      change_notes:document.getElementById('change-notes')?.value||''},{source:'website-builder/index.html'});
  }catch(error){orderStatus.textContent=error.message||'Please review your brief.';return;}
  button.disabled=true;orderStatus.textContent='Sending the brief…';
  try{
    const response=await fetch(STROMATION_INTAKE,{method:'POST',
      headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const body=await response.json().catch(()=>({}));
    if(response.ok&&body.ok){
      if(body.project_token){
        const {saveSession}=await import('./workspace/session.mjs');
        const session=saveSession(body);
        if(session)await openLiveWorkspace(session);
      }else{
        orderStatus.textContent=body.duplicate
          ?'An open project already exists. Open it in the browser where you started it; this submission has not created another project.'
          :'Your brief is saved, but its live workspace could not be opened. Keep reference '+String(body.id||'').slice(0,8)+'.';
        button.textContent='Brief saved ✓';
      }
    }else{
      orderStatus.textContent=(body.error||'That did not go through.')+
        ' Nothing was sent — please adjust and try again.';
      button.disabled=false;
    }
  }catch(error){
    orderStatus.textContent='We could not confirm receipt. Your request may have arrived; retrying will not create a second open brief for this website.';
    button.disabled=false;
  }
});

// Existing websites enter real intake directly; prepared concepts remain a sample.
function setProjectMode(){
  const existing=document.getElementById('project-mode')?.value==='existing';
  const fields=document.getElementById('existing-site-fields');
  if(!fields)return;fields.hidden=!existing;fields.disabled=!existing;
  const toggleField=(id,container)=>{const input=document.getElementById(id);if(!input)return;const group=container?input.closest(container):input.closest('label');group.hidden=existing;group.querySelectorAll('input,textarea,select').forEach(item=>item.disabled=existing);};
  toggleField('business','.field-grid');toggleField('goal');toggleField('avoid');
  const feelings=document.getElementById('feelings').closest('fieldset');feelings.hidden=existing;feelings.disabled=existing;
  toggleField('order-buyer','.field-grid');toggleField('order-action');toggleField('order-notes');
  const domain=document.getElementById('order-domain');domain.closest('label').hidden=existing;domain.disabled=existing;
  const summary=document.getElementById('redesign-summary');if(summary)summary.hidden=!existing;
  document.querySelector('#order-form h3').textContent='Open your private project.';
  document.querySelector('#order-form .form-heading + p').textContent=existing?'Add your email to save the redesign brief. Research and design work begin only after project authorization.':'Confirm the business facts the final website cannot safely guess. Research and design work begin only after project authorization.';

  document.getElementById('brief-continue').textContent='See my free vision →';
  document.getElementById('brief-mode-help').textContent='Your free vision is created instantly in this browser. No AI credits are used.';
  const business=document.getElementById('business');
  if(existing&&business.value==='Northline Studio'){business.value='';business.placeholder='Your business name';}
}
async function openRedesignIntake(){
  const field=document.getElementById('current-website-url');
  try{
    const {normalizeWebsiteURL}=await import('./workspace/intake.mjs?v=existing-site-1');
    const current=normalizeWebsiteURL(field.value);field.setCustomValidity('');field.value=current.url;
    document.getElementById('order-domain').value=current.domain;
    let summary=document.getElementById('redesign-summary');
    if(!summary){summary=document.createElement('p');summary.id='redesign-summary';document.getElementById('order-form').prepend(summary);}
    summary.hidden=false;summary.textContent='Improve '+current.url+' — Change: '+document.getElementById('change-notes').value.trim()+(document.getElementById('keep-notes').value.trim()?' — Keep: '+document.getElementById('keep-notes').value.trim():'');
    const goal=document.getElementById('goal').value.trim(),avoid=document.getElementById('avoid').value.trim();
    document.getElementById('order-notes').value='';
    furthest=3;show('order');
  }catch(error){field.setCustomValidity(error.message||'Enter a valid public website URL.');field.reportValidity();}
}
document.getElementById('project-mode')?.addEventListener('change',setProjectMode);
document.getElementById('current-website-url')?.addEventListener('input',event=>event.target.setCustomValidity(''));
document.getElementById('change-notes')?.addEventListener('input',event=>event.target.setCustomValidity(''));
document.getElementById('restart')?.addEventListener('click',setProjectMode);
setProjectMode();

let liveWorkspaceCleanup;
document.addEventListener('project-access-expired-reset',async()=>{
  const {clearSession}=await import('./workspace/session.mjs');
  liveWorkspaceCleanup?.();clearSession();location.reload();
});
async function openLiveWorkspace(session){
  const panel=document.getElementById('order-panel');if(!panel)return;
  const {mountLiveProject}=await import('./workspace/live.mjs');
  liveWorkspaceCleanup?.();
  furthest=5;show('order');
  document.querySelector('.studio-shell .stepper').hidden=true;
  orderForm.hidden=true;
  let surface=document.getElementById('live-project');
  if(!surface){surface=document.createElement('div');surface.id='live-project';panel.appendChild(surface);}
  liveWorkspaceCleanup=mountLiveProject(surface,session);
}
