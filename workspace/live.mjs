const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safePreviewURL(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
const titles = {received:'Your project is here.',review_required:'Your brief is being reviewed.',payment:'Authorize your project.',research:'Getting to know your business.',directions:'Choose your design direction.',building:'Your website is taking shape.',review:'Take a look around.',complete:'Your website is ready.',blocked:'Your project needs attention.'};
const safeImages = value => (Array.isArray(value)?value:[]).filter(p=>p&&typeof p==='object').map(p=>({...p,url:safePreviewURL(p.url)})).filter(p=>p.url);
export function previewAssetIdentity(value) {
  const safe=safePreviewURL(value);
  if(!safe)return '';
  const url=new URL(safe);
  // A renewed signature or cache-busting query does not make the same capture
  // a different design direction. The service must publish a distinct path.
  return `${url.origin}${url.pathname}`;
}
function uniquePreviewArtifacts(items,idKey){
  const seen=new Set();
  return items.filter(item=>item&&typeof item[idKey]==='string').map(item=>({...item,featured_previews:safeImages(item.featured_previews)})).filter(item=>{
    const identity=previewAssetIdentity(item.featured_previews[0]?.url);
    if(!identity||seen.has(identity))return false;
    seen.add(identity);return true;
  });
}
export function renderDraftPreviews(drafts) {
  if(!drafts.length)return '';
  const current=drafts.at(-1),image=current.featured_previews[0];
  return `<section class="live-construction" data-artifact-count="${drafts.length}"><header class="live-construction-head"><div><span class="live-kicker">LIVE DESIGN CANVAS</span><h3>${escape(current.name||'Design direction')}</h3><p>${escape(current.caption||'A design direction is taking shape before selection.')}</p></div><span class="live-artifact-count">${String(drafts.length).padStart(2,'0')} / 03 ready</span></header><div class="live-canvas-shell"><div class="live-canvas-chrome"><span><i></i><i></i><i></i></span><b>Latest design preview</b><em>Desktop</em></div><div class="live-canvas-media">${image?`<img src="${escape(image.url)}" alt="${escape(current.name||'Design direction')} work in progress" loading="eager" referrerpolicy="no-referrer">`:''}<span class="live-canvas-scan" aria-hidden="true"></span></div></div><div class="live-artifact-rail" aria-label="Available design previews">${drafts.map((draft,index)=>`<article class="live-artifact ${index===drafts.length-1?'is-current':''}">${draft.featured_previews[0]?`<img src="${escape(draft.featured_previews[0].url)}" alt="" loading="lazy" referrerpolicy="no-referrer">`:''}<div><span>${String(index+1).padStart(2,'0')}</span><b>${escape(draft.name||'Design direction')}</b><small>${index===drafts.length-1?'On canvas':'Ready'}</small></div></article>`).join('')}</div></section>`;
}

export function primaryArtifact(data){
  if(data.preview_url)return {kind:'website',url:data.preview_url,name:'Your website'};
  const source=data.choices.length?data.choices:data.draft_previews;
  const item=source.at(-1),image=item?.featured_previews?.[0];
  return image?{kind:data.choices.length?'choice':'draft',url:image.url,name:item.name||'Design direction'}:null;
}
export function normalizeProject(data) {
  if(data?.stage==='scope_review')data={...data,stage:'review_required'};
  if(data?.stage==='purchase')data={...data,stage:'payment'};
  if (!data?.ok || !Object.hasOwn(titles, data.stage)) throw new Error('Project update was not recognized.');
  const milestones=(Array.isArray(data.milestones)?data.milestones:[]).filter(row=>row&&typeof row.id==='string'&&typeof row.label==='string'&&['complete','active','upcoming'].includes(row.status)).slice(0,8);
  const rawChoices=(Array.isArray(data.choices)?data.choices:[]).filter(c=>c&&typeof c.id==='string');
  const choices=uniquePreviewArtifacts(rawChoices,'id');
  const draftPreviews=uniquePreviewArtifacts(Array.isArray(data.draft_previews)?data.draft_previews:[],'direction_id');
  const choiceArtifactsReady=choices.length===3&&rawChoices.length===3;
  return {...data, message: String(data.message || ''),milestones,payment_required:data.payment_required===true,purchase_url:safePreviewURL(data.purchase_url),customer_decision_required:data.customer_decision_required===true,production_locked:data.production_locked!==false,choices,distinct_direction_count:choices.length,choice_artifacts_ready:choiceArtifactsReady,draft_previews:draftPreviews,events:(Array.isArray(data.events)?data.events:[]).filter(e=>e && typeof e.label==='string'),preview_url:safePreviewURL(data.preview_url),download_url:safePreviewURL(data.download_url),can_download:data.can_download===true,can_select:data.can_select===true&&choiceArtifactsReady,current_build_sha256:/^[a-f0-9]{64}$/i.test(data.current_build_sha256||'')?data.current_build_sha256:'',can_revise:data.can_revise===true,can_approve:data.can_approve===true,revisions_remaining:Number.isInteger(data.revisions_remaining)&&data.revisions_remaining>=0?data.revisions_remaining:null};
}
export function previewIdentity(data) {
  return data?.preview_url ? `${data.preview_url}|${data.current_build_sha256 || ''}` : '';
}
const roadmapChapters=[
  {id:'foundation',label:'Foundation',description:'Brief and authorization',steps:['brief','authorization']},
  {id:'direction',label:'Direction',description:'Research, concepts and choice',steps:['research','directions','previews','choice']},
  {id:'production',label:'Production',description:'Your selected website build',steps:['build']},
  {id:'delivery',label:'Delivery',description:'Review and handoff',steps:['delivery']}
];
export function projectRoadmap(milestones=[]){
  const byId=new Map(milestones.map(step=>[step.id,step]));
  const chapters=roadmapChapters.map(chapter=>{
    const steps=chapter.steps.map(id=>byId.get(id)).filter(Boolean);
    const status=steps.length&&steps.every(step=>step.status==='complete')?'complete':steps.some(step=>step.status==='active')||steps.some(step=>step.status==='complete')?'active':'upcoming';
    return {...chapter,status};
  });
  const complete=milestones.filter(step=>step.status==='complete').length;
  const current=Math.min(milestones.length,Math.max(1,milestones.findIndex(step=>step.status==='active')+1||complete+1));
  return {chapters,complete,total:milestones.length,current};
}
export function summarizeProjectActivity(events=[]){
  const groups=new Map();
  for(const event of events){
    const label=String(event?.label||'');
    const key=/research|brief/i.test(label)?'Discovery':/direction|preview/i.test(label)?'Design exploration':/website|build/i.test(label)?'Website production':/review|change|package|selected/i.test(label)?'Review and delivery':'Project setup';
    const row=groups.get(key)||{label:key,count:0,latest:''};row.count+=1;row.latest=label;groups.set(key,row);
  }
  return [...groups.values()].slice(0,4);
}
// The monitor owns transport only. All milestones come from the project service.
export function createProjectMonitor({token,endpoint,fetcher=globalThis.fetch,visible=()=>true,schedule=setTimeout,cancel=clearTimeout,onUpdate=()=>{},onError=()=>{}}) {
  let stopped=false,timer=null,controller=null,busy=false,last=null,authFailed=false;
  const submissionIds=new Map();
  const queue=()=>{if(!stopped&&!authFailed)timer=schedule(()=>refresh(),5000);};
  async function request(method='GET',body) {
    controller=new AbortController();
    const timeout=schedule(()=>controller?.abort(),20000);
    try {
      const response=await fetcher(endpoint,{method,headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:controller.signal,cache:'no-store',credentials:'omit',redirect:'error'});
      if(response.status===401||response.status===403){authFailed=true;throw new Error('This project session has expired or is no longer authorized. Close it to return to your draft. A fresh project access link is required to reconnect; your project will not be deleted.');}
      const data=await response.json();
      if(!response.ok||data.ok===false)throw new Error(data.message||data.error||'The project service could not update your project.');
      return data;
    } finally {cancel(timeout);controller=null;}
  }
  async function refresh() {
    if(stopped||busy||authFailed)return;
    if(timer!==null){cancel(timer);timer=null;}
    if(!visible()){queue();return;}
    busy=true;
    try{const data=normalizeProject(await request());if(!stopped){last=data;onUpdate(data);}}catch(error){if(!stopped)onError(error.message,{authFailed,last});}finally{busy=false;queue();}
  }
  async function select(directionId) {
    if(stopped||busy||authFailed||!last?.can_select||!last.choices.some(c=>c.id===directionId))return false;
    if(timer!==null){cancel(timer);timer=null;}
    busy=true;
    try{const data=await request('POST',{action:'select',direction_id:directionId});if(!stopped&&data.stage){last=normalizeProject(data);onUpdate(last);}return true;}catch(error){if(!stopped)onError(error.message,{authFailed,last});return false;}finally{busy=false;if(!stopped)void refresh();}
  }
  async function review(action, feedback='') {
    if(!['revise','approve'].includes(action)||stopped||busy||authFailed||!last?.current_build_sha256||!(action==='revise'?last.can_revise:last.can_approve))return false;
    feedback=String(feedback).trim();
    if(action==='revise'&&(feedback.length<10||feedback.length>2000)){onError('Describe the changes in 10–2,000 characters.',{authFailed:false,last,operation:action});return false;}
    const build=last.current_build_sha256;
    const key=JSON.stringify([action,build,action==='revise'?feedback:'']);
    if(!submissionIds.has(key))submissionIds.set(key,globalThis.crypto.randomUUID());
    const body={action,expected_build_sha256:build,request_id:submissionIds.get(key),...(action==='revise'?{feedback}:{})};
    if(timer!==null){cancel(timer);timer=null;}
    busy=true;
    try{
      const data=await request('POST',body);
      if(!stopped&&data.stage){last=normalizeProject(data);onUpdate(last);}
      return !stopped;
    }catch(error){if(!stopped)onError(error.message,{authFailed,last,operation:action});return false;}
    finally{busy=false;if(!stopped)void refresh();}
  }
  return {start:refresh,refresh,select,review,stop(){stopped=true;cancel(timer);controller?.abort();}};
}

export function mountLiveProject(container,{token,endpoint,onChange=()=>{}}) {
  if(!container||!token||!safePreviewURL(endpoint))throw new Error('A secure project connection is required.');
  container.classList.add('live-project');
  container.innerHTML='<header class="live-heading"><div class="live-heading-top"><p class="live-eyebrow">YOUR WEBSITE / PRIVATE WORKSPACE</p><span class="live-status"><i aria-hidden="true"></i> Connected</span></div><h2>Opening your project.</h2><p class="live-message" role="status">Connecting to your saved brief…</p></header><p class="live-connection" role="status"></p><section class="live-progress-shell" aria-label="Website creation progress"><div class="live-build-track"></div><div class="live-now" aria-live="polite"><div><span class="live-now-label">CURRENT ACTION</span><b>Connecting</b><small>Checking your latest project state</small></div><div class="live-progress-value"><strong>—</strong><span>of 8</span></div></div></section><div class="live-content"><div class="live-preview-slot"></div><div class="live-draft-slot"></div><div class="live-choice-slot"></div><div class="live-download-slot"></div><div class="live-wait-slot"></div><div class="live-activity-slot"></div></div><section class="live-review-controls" hidden><h3>Your feedback</h3><form class="live-revision-form" hidden><label for="live-revision-feedback">What would you like changed?</label><textarea id="live-revision-feedback" name="feedback" rows="4" minlength="10" maxlength="2000" required placeholder="Tell us which part to change and what you want instead."></textarea><p class="live-revisions-remaining"></p><button type="submit">Request changes</button></form><button type="button" data-live-approve hidden>Approve this website</button><p class="live-review-status" role="status" aria-live="polite"></p></section>';
  const content=container.querySelector('.live-content'),connection=container.querySelector('.live-connection');
  const reviewControls=container.querySelector('.live-review-controls'),revisionForm=container.querySelector('.live-revision-form'),feedbackInput=revisionForm.querySelector('textarea'),approveButton=container.querySelector('[data-live-approve]'),reviewStatus=container.querySelector('.live-review-status');
  let signature='',selecting=false,device='desktop',reviewBusy=false,latest=null,currentPreviewIdentity='';
  const now=container.querySelector('.live-now');
  const workingStages=new Set(['received','review_required','research','building']);
  const stagePulse={received:['Brief received','Preparing the project record'],review_required:['Reviewing your brief','Checking scope and available business facts'],payment:['Authorization needed','Waiting for project authorization'],research:['Research in progress','Studying your business before design begins'],directions:['Preparing your decision','Releasing each checked direction as it becomes ready'],building:['Building the selected direction','Publishing real page updates to the canvas'],review:['Your review is ready','Explore the responsive website and respond'],complete:['Project complete','Your approved website files are ready'],blocked:['Action needed','Check the project message below']};
  function updateReviewControls(data){
    latest=data;
    const valid=Boolean(data.current_build_sha256);
    revisionForm.hidden=!(valid&&data.can_revise);
    approveButton.hidden=!(valid&&data.can_approve);
    reviewControls.hidden=revisionForm.hidden&&approveButton.hidden&&!reviewStatus.textContent;
    revisionForm.querySelector('button').disabled=reviewBusy;
    approveButton.disabled=reviewBusy;
    revisionForm.querySelector('.live-revisions-remaining').textContent=data.revisions_remaining===null?'':`${data.revisions_remaining} revision${data.revisions_remaining===1?'':'s'} remaining`;
  }
  const monitor=createProjectMonitor({token,endpoint,visible:()=>!document.hidden,onUpdate(data){
    connection.textContent='';
    updateReviewControls(data);
    container.querySelector('h2').textContent=data.payment_required?'Authorize your project.':data.stage==='directions'&&!data.can_select?'Your design directions are taking shape.':titles[data.stage];
    container.querySelector('.live-message').textContent=data.message;
    const pulseCopy=[...(stagePulse[data.stage]||stagePulse.received)];
    if(data.stage==='directions'&&data.can_select){pulseCopy[0]='Choose a direction';pulseCopy[1]='Three distinct, checked directions are ready';}
    else if(data.stage==='directions'&&data.distinct_direction_count){pulseCopy[0]='Preparing your decision';pulseCopy[1]=`${data.distinct_direction_count} of 3 distinct directions checked`;}
    now.classList.toggle('is-working',workingStages.has(data.stage));
    now.querySelector('b').textContent=pulseCopy[0];
    now.querySelector('small').textContent=pulseCopy[1];
    const next=JSON.stringify([data.stage,data.milestones,data.payment_required,data.purchase_url,data.customer_decision_required,data.choices,data.draft_previews,data.preview_url,data.current_build_sha256,data.events,data.can_select,data.download_url,data.can_download]);
    if(next!==signature){signature=next;render(data);}
    onChange(data);
  },onError(message,{authFailed,operation}){if(operation&&!authFailed){reviewStatus.textContent=message;reviewControls.hidden=false;return;}connection.textContent=authFailed?message:`Connection interrupted. Your last update is still here. Reconnecting… ${message}`;if(authFailed){const reset=document.createElement('button');reset.type='button';reset.dataset.liveReset='';reset.textContent='Close this expired session';connection.appendChild(reset);}}});
  function render(data){
    const roadmap=projectRoadmap(data.milestones);
    container.querySelector('.live-build-track').innerHTML=roadmap.chapters.map((chapter,index)=>`<div class="live-build-step ${escape(chapter.status)}"><span>${chapter.status==='complete'?'✓':String(index+1).padStart(2,'0')}</span><div><b>${escape(chapter.label)}</b><small>${escape(chapter.description)}</small></div></div>`).join('');
    container.querySelector('.live-progress-value strong').textContent=String(roadmap.current).padStart(2,'0');
    container.querySelector('.live-progress-value span').textContent=`of ${roadmap.total||8}`;
    const choices=data.choices.map((choice,index)=>`<article class="live-choice">${choice.featured_previews[0]?`<button class="live-choice-image" type="button" data-live-artifact="${index}" aria-label="Preview ${escape(choice.name||'design direction')}"><img src="${escape(choice.featured_previews[0].url)}" alt="${escape(choice.name||'Design direction')} preview" loading="lazy" referrerpolicy="no-referrer"></button>`:''}<div class="live-choice-copy"><span class="live-choice-number">DIRECTION ${String(index+1).padStart(2,'0')}</span><h3>${escape(choice.name||'Design direction')}</h3><p>${escape(choice.description)}</p>${data.can_select?`<button type="button" data-live-select="${escape(choice.id)}">Choose this direction <span aria-hidden="true">↗</span></button>`:''}</div></article>`).join('');
    const preview=data.preview_url?`<section class="live-preview"><div class="live-preview-bar"><div><span class="live-kicker">LIVE BUILD</span><b>Your responsive website</b></div><div><button type="button" data-live-device="desktop" aria-pressed="${device==='desktop'}">Desktop</button><button type="button" data-live-device="mobile" aria-pressed="${device==='mobile'}">Mobile</button><a href="${escape(data.preview_url)}" target="_blank" rel="noopener noreferrer">Open full preview ↗</a></div></div><div class="live-preview-frame ${device}"><iframe src="${escape(data.preview_url)}" title="Your website in progress" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe></div></section>`:'';
    const activity=summarizeProjectActivity(data.events);
    const drafts=data.choices.length?'':renderDraftPreviews(data.draft_previews);
    content.querySelector('.live-draft-slot').innerHTML=drafts;
    content.querySelector('.live-choice-slot').innerHTML=choices?`<section class="live-decision"><header><span class="live-kicker">${data.can_select?'YOUR DECISION':'DIRECTION PROGRESS'}</span><h3>${data.can_select?'Three directions. One way forward.':`${data.distinct_direction_count} of 3 directions checked.`}</h3><p>${data.can_select?'Explore each real layout, then choose the starting point for the full build.':'Selection opens when three distinct directions are ready.'}</p></header>${data.choices[0]?.featured_previews[0]?`<div class="live-decision-stage" data-active-artifact="0"><div class="live-canvas-chrome"><span><i></i><i></i><i></i></span><b data-live-stage-name>${escape(data.choices[0].name||'Design direction')}</b><div class="live-stage-devices"><button type="button" data-live-direction-device="desktop" aria-pressed="true">Desktop</button><button type="button" data-live-direction-device="mobile" aria-pressed="false">Mobile</button></div></div><div class="live-study-canvas"><div class="live-decision-media desktop"><img data-live-stage-image src="${escape(data.choices[0].featured_previews[0].url)}" alt="${escape(data.choices[0].name||'Design direction')} preview" referrerpolicy="no-referrer"></div><aside class="live-study-guide"><span>DIRECTION STUDY</span><h4>A focused first impression.</h4><p>Use this opening-frame excerpt to judge the visual system and storytelling approach.</p><dl><div><dt>01</dt><dd>Visual hierarchy</dd></div><div><dt>02</dt><dd>Voice and pacing</dd></div><div><dt>03</dt><dd>Primary action</dd></div></dl><small>The complete responsive website is built after you choose.</small></aside></div></div>`:''}<div class="live-choices">${choices}</div></section>`:'';
    // Keep the actual browsing context (including its scroll position) alive
    // when only activity, choices or status change. Replace when either the
    // access URL is renewed or a newly published build arrives at that URL.
    const nextPreviewIdentity=previewIdentity(data);
    if(nextPreviewIdentity!==currentPreviewIdentity){
      currentPreviewIdentity=nextPreviewIdentity;
      content.querySelector('.live-preview-slot').innerHTML=preview;
    }
    content.querySelector('.live-download-slot').innerHTML=data.can_download&&data.download_url?`<section class="live-download"><h3>Your website files</h3><p>Download the completed source ZIP. Hosting is a separate step.</p><a href="${escape(data.download_url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">Download website files ↗</a></section>`:'';
    const waitingTitle=data.payment_required||data.stage==='payment'?'Authorize your project.':data.stage==='research'?'We’re learning what makes the business credible.':data.stage==='directions'?'Your first design direction will appear here.':data.stage==='building'?'The first working page will appear here.':'This is your project workspace.';
    const waitingCopy=data.payment_required||data.stage==='payment'?'Your brief is saved. Nothing has been charged and production has not started. Authorize the project when you are ready to begin.':data.stage==='research'?'Nothing visual has been produced yet. The canvas opens when the first design direction is ready.':data.stage==='directions'?'Each direction appears as soon as it is ready for you. You choose the direction for the full build.':data.stage==='building'?'The canvas opens with the first working preview and updates as new pages arrive.':'Research, design choices and previews will appear here as they become available.';
    const authorization=data.purchase_url?`<a class="live-authorize" href="${escape(data.purchase_url)}" rel="noopener noreferrer">Authorize your project <span aria-hidden="true">↗</span></a>`:'';
    content.querySelector('.live-wait-slot').innerHTML=!drafts&&!choices&&!preview&&!(data.can_download&&data.download_url)?`<div class="live-wait"><span class="live-presence" aria-hidden="true"></span><h3>${waitingTitle}</h3><p>${waitingCopy}</p>${data.payment_required||data.stage==='payment'?authorization:''}</div>`:'';
    content.querySelector('.live-activity-slot').innerHTML=activity.length?`<details class="live-activity"><summary><span><b>Project highlights</b><small>Verified work, grouped by phase</small></span><em>View details</em></summary><ol>${activity.map(group=>`<li><span><b>${escape(group.label)}</b><small>${escape(group.latest)}</small></span><strong>${group.count} ${group.count===1?'update':'updates'}</strong></li>`).join('')}</ol></details>`:'';
  }
  async function submitReview(action){
    if(reviewBusy)return;
    const submittedFeedback=feedbackInput.value;
    reviewBusy=true;reviewStatus.textContent=action==='revise'?'Sending your changes…':'Saving your approval…';
    if(latest)updateReviewControls(latest);
    const ok=await monitor.review(action,submittedFeedback);
    reviewBusy=false;
    if(ok){
      if(action==='revise'&&feedbackInput.value===submittedFeedback)feedbackInput.value='';
      reviewStatus.textContent=action==='revise'?'Your changes were received. Updates will appear here.':'Your approval was received.';
    }else if(reviewStatus.textContent.endsWith('…'))reviewStatus.textContent='This action is not available yet. Check the latest preview and try again.';
    if(latest)updateReviewControls(latest);
  }
  const submit=event=>{event.preventDefault();if(revisionForm.reportValidity())void submitReview('revise');};
  async function click(event){
    const record=event.target.closest('.live-activity summary');
    if(record&&container.contains(record))setTimeout(()=>{record.querySelector('em').textContent=record.parentElement.open?'Hide details':'View details';},0);
    if(event.target.closest('[data-live-approve]')&&container.contains(event.target)){void submitReview('approve');return;}
    const artifact=event.target.closest('[data-live-artifact]');
    if(artifact&&container.contains(artifact)&&latest){const item=latest.choices[Number(artifact.dataset.liveArtifact)],image=item?.featured_previews?.[0];if(image){const stageImage=container.querySelector('[data-live-stage-image]'),stageName=container.querySelector('[data-live-stage-name]');stageImage.classList.remove('is-entering');stageImage.src=image.url;stageImage.alt=`${item.name||'Design direction'} preview`;stageName.textContent=item.name||'Design direction';stageImage.closest('.live-decision-stage').dataset.activeArtifact=artifact.dataset.liveArtifact;requestAnimationFrame(()=>stageImage.classList.add('is-entering'));artifact.closest('.live-decision').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}return;}
    const reset=event.target.closest('[data-live-reset]');
    if(reset&&container.contains(reset)){monitor.stop();container.dispatchEvent(new CustomEvent('project-access-expired-reset',{bubbles:true}));return;}
    const directionDevice=event.target.closest('[data-live-direction-device]');
    if(directionDevice&&container.contains(directionDevice)&&latest){const stage=directionDevice.closest('.live-decision-stage'),item=latest.choices[Number(stage.dataset.activeArtifact||0)],image=item?.featured_previews?.find(p=>String(p.viewport||'').toLowerCase().includes(directionDevice.dataset.liveDirectionDevice))||item?.featured_previews?.[directionDevice.dataset.liveDirectionDevice==='mobile'?1:0]||item?.featured_previews?.[0];if(image){const stageImage=stage.querySelector('[data-live-stage-image]');stageImage.src=image.url;stageImage.alt=`${item.name||'Design direction'} ${directionDevice.dataset.liveDirectionDevice} preview`;stage.querySelector('.live-decision-media').className=`live-decision-media ${directionDevice.dataset.liveDirectionDevice}`;stage.querySelectorAll('[data-live-direction-device]').forEach(button=>button.setAttribute('aria-pressed',String(button===directionDevice)));}return;}
    const choice=event.target.closest('[data-live-select]');
    if(choice&&container.contains(choice)&&!selecting){selecting=true;signature='';const buttons=[...container.querySelectorAll('[data-live-select]')];buttons.forEach(b=>b.disabled=true);choice.textContent='Saving your choice…';const ok=await monitor.select(choice.dataset.liveSelect);selecting=false;if(!ok){buttons.forEach(b=>b.disabled=false);choice.textContent='Choose this direction ↗';}}
    const toggle=event.target.closest('[data-live-device]');
    if(toggle&&container.contains(toggle)){device=toggle.dataset.liveDevice;container.querySelector('.live-preview-frame').className=`live-preview-frame ${device}`;container.querySelectorAll('[data-live-device]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.liveDevice===device)));}
  }
  const visibility=()=>{if(!document.hidden)void monitor.refresh();};
  revisionForm.addEventListener('submit',submit);container.addEventListener('click',click);document.addEventListener('visibilitychange',visibility);void monitor.start();
  return ()=>{monitor.stop();revisionForm.removeEventListener('submit',submit);container.removeEventListener('click',click);document.removeEventListener('visibilitychange',visibility);};
}
