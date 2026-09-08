const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function safePreviewURL(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
const titles = {received:'Your project is here.',review_required:'Your brief is being reviewed.',research:'Getting to know your business.',directions:'Choose your design direction.',building:'Your website is taking shape.',review:'Take a look around.',complete:'Your website is ready.',blocked:'Your project needs attention.'};
const safeImages = value => (Array.isArray(value)?value:[]).filter(p=>p&&typeof p==='object').map(p=>({...p,url:safePreviewURL(p.url)})).filter(p=>p.url);
export function renderDraftPreviews(drafts) {
  if(!drafts.length)return '';
  return `<section class="live-drafts"><h3>Work in progress — review pending</h3><div class="live-choices">${drafts.map(draft=>`<article class="live-choice">${draft.featured_previews[0]?`<img src="${escape(draft.featured_previews[0].url)}" alt="${escape(draft.name||'Design draft')} work in progress" loading="lazy" referrerpolicy="no-referrer">`:''}<div class="live-choice-copy"><h3>${escape(draft.name||'Design draft')}</h3><p>${escape(draft.caption||'This draft is still being checked. It is not ready for selection.')}</p></div></article>`).join('')}</div></section>`;
}
export function normalizeProject(data) {
  if(data?.stage==='scope_review')data={...data,stage:'review_required'};
  if (!data?.ok || !Object.hasOwn(titles, data.stage)) throw new Error('Project update was not recognized.');
  return {...data, message: String(data.message || ''), choices: (Array.isArray(data.choices)?data.choices:[]).filter(c=>c && typeof c.id==='string').map(c=>({...c,featured_previews:safeImages(c.featured_previews)})),draft_previews:(Array.isArray(data.draft_previews)?data.draft_previews:[]).filter(d=>d&&typeof d.direction_id==='string').map(d=>({...d,featured_previews:safeImages(d.featured_previews)})).filter(d=>d.featured_previews.length),events:(Array.isArray(data.events)?data.events:[]).filter(e=>e && typeof e.label==='string'),preview_url:safePreviewURL(data.preview_url),can_select:data.can_select===true};
}
// The monitor owns transport only. All milestones come from the project service.
export function createProjectMonitor({token,endpoint,fetcher=globalThis.fetch,visible=()=>true,schedule=setTimeout,cancel=clearTimeout,onUpdate=()=>{},onError=()=>{}}) {
  let stopped=false,timer=null,controller=null,busy=false,last=null,authFailed=false;
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
  return {start:refresh,refresh,select,stop(){stopped=true;cancel(timer);controller?.abort();}};
}

export function mountLiveProject(container,{token,endpoint,onChange=()=>{}}) {
  if(!container||!token||!safePreviewURL(endpoint))throw new Error('A secure project connection is required.');
  container.classList.add('live-project');
  container.innerHTML='<header class="live-heading"><p class="live-eyebrow">YOUR WEBSITE / LIVE PROJECT</p><h2>Opening your project.</h2><p class="live-message" role="status">Connecting to your saved brief…</p></header><p class="live-connection" role="status"></p><div class="live-content"></div>';
  const content=container.querySelector('.live-content'),connection=container.querySelector('.live-connection');
  let signature='',selecting=false,device='desktop';
  const monitor=createProjectMonitor({token,endpoint,visible:()=>!document.hidden,onUpdate(data){
    connection.textContent='';
    container.querySelector('h2').textContent=data.stage==='directions'&&!data.can_select?'Your design directions are taking shape.':titles[data.stage];
    container.querySelector('.live-message').textContent=data.message;
    const next=JSON.stringify([data.stage,data.choices,data.draft_previews,data.preview_url,data.events,data.can_select]);
    if(next!==signature){signature=next;render(data);}
    onChange(data);
  },onError(message,{authFailed}){connection.textContent=authFailed?message:`Connection interrupted. Your last update is still here. Reconnecting… ${message}`;if(authFailed){const reset=document.createElement('button');reset.type='button';reset.dataset.liveReset='';reset.textContent='Close this expired session';connection.appendChild(reset);}}});
  function render(data){
    const choices=data.choices.map(choice=>`<article class="live-choice">${choice.featured_previews[0]?`<img src="${escape(choice.featured_previews[0].url)}" alt="${escape(choice.name||'Design direction')} preview" loading="lazy" referrerpolicy="no-referrer">`:''}<div class="live-choice-copy"><h3>${escape(choice.name||'Design direction')}</h3><p>${escape(choice.description)}</p>${data.can_select?`<button type="button" data-live-select="${escape(choice.id)}">Choose this direction <span aria-hidden="true">↗</span></button>`:''}</div></article>`).join('');
    const preview=data.preview_url?`<section class="live-preview"><div class="live-preview-bar"><span>Your website preview</span><div><button type="button" data-live-device="desktop" aria-pressed="${device==='desktop'}">Desktop</button><button type="button" data-live-device="mobile" aria-pressed="${device==='mobile'}">Mobile</button><a href="${escape(data.preview_url)}" target="_blank" rel="noopener noreferrer">Open preview ↗</a></div></div><div class="live-preview-frame ${device}"><iframe src="${escape(data.preview_url)}" title="Your website in progress" sandbox="allow-scripts" referrerpolicy="no-referrer"></iframe></div></section>`:'';
    const events=data.events.map(event=>`<li><span>${escape(event.label)}</span>${event.at&&Number.isFinite(Date.parse(event.at))?`<time datetime="${escape(event.at)}">${escape(new Date(event.at).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'}))}</time>`:''}</li>`).join('');
    const drafts=renderDraftPreviews(data.draft_previews);
    content.innerHTML=`${drafts}${choices?`<div class="live-choices">${choices}</div>`:''}${preview}${!drafts&&!choices&&!preview?'<div class="live-wait"><span class="live-presence" aria-hidden="true"></span><h3>This is your project workspace.</h3><p>Research, design choices and previews will appear here as they become available. You can leave this tab and return to your saved project.</p></div>':''}${events?`<aside class="live-activity"><h3>Project activity</h3><ol>${events}</ol></aside>`:''}`;
  }
  async function click(event){
    const reset=event.target.closest('[data-live-reset]');
    if(reset&&container.contains(reset)){monitor.stop();container.dispatchEvent(new CustomEvent('project-access-expired-reset',{bubbles:true}));return;}
    const choice=event.target.closest('[data-live-select]');
    if(choice&&container.contains(choice)&&!selecting){selecting=true;signature='';const buttons=[...container.querySelectorAll('[data-live-select]')];buttons.forEach(b=>b.disabled=true);choice.textContent='Saving your choice…';const ok=await monitor.select(choice.dataset.liveSelect);selecting=false;if(!ok){buttons.forEach(b=>b.disabled=false);choice.textContent='Choose this direction ↗';}}
    const toggle=event.target.closest('[data-live-device]');
    if(toggle&&container.contains(toggle)){device=toggle.dataset.liveDevice;container.querySelector('.live-preview-frame').className=`live-preview-frame ${device}`;container.querySelectorAll('[data-live-device]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.liveDevice===device)));}
  }
  const visibility=()=>{if(!document.hidden)void monitor.refresh();};
  container.addEventListener('click',click);document.addEventListener('visibilitychange',visibility);void monitor.start();
  return ()=>{monitor.stop();container.removeEventListener('click',click);document.removeEventListener('visibilitychange',visibility);};
}
