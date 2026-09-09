import test from 'node:test';
import assert from 'node:assert/strict';
import {safePreviewURL,normalizeProject,createProjectMonitor,renderDraftPreviews,previewIdentity} from './live.mjs';
const project=(extra={})=>({ok:true,stage:'research',message:'Reviewing the existing website',...extra});
const response=(data,status=200)=>({ok:status<400,status,json:async()=>data});
function harness(fetcher,extra={}){
 const timers=new Map(),updates=[],errors=[];let id=0;
 const monitor=createProjectMonitor({token:'private-session',endpoint:'https://service.example/website-project',fetcher,schedule:(fn,ms)=>{timers.set(++id,{fn,ms});return id;},cancel:key=>timers.delete(key),onUpdate:p=>updates.push(p),onError:(message,meta)=>errors.push({message,...meta}),...extra});
 return {monitor,timers,updates,errors};
}
test('preview URLs require HTTPS without embedded credentials',()=>{
 for(const url of ['javascript:alert(1)','http://example.com','https://user:pass@example.com','data:text/html,bad','/relative'])assert.equal(safePreviewURL(url),'');
 assert.equal(safePreviewURL('https://preview.example/site'),'https://preview.example/site');
});
test('only real recognized service stages become project state',()=>{
 assert.throws(()=>normalizeProject({ok:true,stage:'invented'}));
 assert.equal(normalizeProject(project({stage:'scope_review'})).stage,'review_required');
 assert.deepEqual(normalizeProject(project()).choices,[]);
 assert.equal(normalizeProject(project({preview_url:'javascript:alert(1)'})).preview_url,'');
});

test('purchase is a resilient alias for the payment authorization stage',()=>{
 const value=normalizeProject(project({stage:'purchase',payment_required:true,purchase_url:'https://checkout.example/session'}));
 assert.equal(value.stage,'payment');assert.equal(value.payment_required,true);assert.equal(value.purchase_url,'https://checkout.example/session');
 assert.equal(normalizeProject(project({stage:'payment',purchase_url:'javascript:alert(1)'})).purchase_url,'');
});

test('preview identity changes when a new build is published at the same URL',()=>{
 const url='https://preview.example/project';
 assert.equal(previewIdentity({preview_url:url,current_build_sha256:'a'.repeat(64)}),`${url}|${'a'.repeat(64)}`);
 assert.notEqual(previewIdentity({preview_url:url,current_build_sha256:'a'.repeat(64)}),previewIdentity({preview_url:url,current_build_sha256:'b'.repeat(64)}));
 assert.equal(previewIdentity({preview_url:'',current_build_sha256:'a'.repeat(64)}),'');
});

test('customer milestones accept only bounded recognized status rows',()=>{
 const value=normalizeProject(project({milestones:[
  {id:'brief',label:'Brief received',status:'complete'},
  {id:'research',label:'Business researched',status:'active'},
  {id:'bad',label:'Bad',status:'invented'},null
 ],customer_decision_required:true,production_locked:true}));
 assert.deepEqual(value.milestones.map(row=>row.status),['complete','active']);
 assert.equal(value.customer_decision_required,true);
 assert.equal(value.production_locked,true);
});
test('session stays in authorization header and polling does not run in hidden tab',async()=>{
 let visible=false;const calls=[];
 const h=harness(async(url,options)=>{calls.push({url,options});return response(project());},{visible:()=>visible});
 await h.monitor.start();assert.equal(calls.length,0);
 visible=true;await h.monitor.refresh();
 assert.equal(calls.length,1);assert.equal(calls[0].options.headers.Authorization,'Bearer private-session');
 assert.equal(calls[0].options.redirect,'error');assert.equal(calls[0].options.credentials,'omit');assert.ok(!calls[0].url.includes('private-session'));
 assert.equal([...h.timers.values()][0].ms,5000);h.monitor.stop();assert.equal(h.timers.size,0);
});
test('network failure preserves the last real preview and continues polling',async()=>{
 let count=0;const h=harness(async()=>{if(count++)throw new Error('offline');return response(project({preview_url:'https://preview.example/'}));});
 await h.monitor.start();await h.monitor.refresh();
 assert.equal(h.updates.length,1);assert.equal(h.errors[0].last.preview_url,'https://preview.example/');assert.equal(h.errors[0].authFailed,false);assert.equal(h.timers.size,1);h.monitor.stop();
});
test('authorization failure stops retrying and requests a restored session',async()=>{
 let calls=0;const h=harness(async()=>{calls++;return response({},401);});
 await h.monitor.start();await h.monitor.refresh();assert.equal(calls,1);assert.equal(h.errors[0].authFailed,true);assert.equal(h.timers.size,0);h.monitor.stop();
});
test('selection requires an available real choice and sends only scoped action',async()=>{
 const calls=[];const h=harness(async(url,options)=>{calls.push(options);return response(project({stage:options.method==='POST'?'building':'directions',can_select:options.method!=='POST',choices:[{id:'direction-a',name:'Direction A'}]}));});
 assert.equal(await h.monitor.select('direction-a'),false);await h.monitor.start();assert.equal(await h.monitor.select('forged-choice'),false);
 assert.equal(await h.monitor.select('direction-a'),true);
 const post=calls.find(c=>c.method==='POST');assert.deepEqual(JSON.parse(post.body),{action:'select',direction_id:'direction-a'});assert.equal(post.headers.Authorization,'Bearer private-session');h.monitor.stop();
});
test('cleanup aborts pending transport and never publishes a late response',async()=>{
 let release,signal;const h=harness(async(url,options)=>{signal=options.signal;await new Promise(resolve=>release=resolve);return response(project());});
 const pending=h.monitor.start();h.monitor.stop();assert.equal(signal.aborted,true);release();await pending;assert.equal(h.updates.length,0);assert.equal(h.timers.size,0);
});
test('real draft screenshots are labeled pending and never become selectable choices',async()=>{
 const data=normalizeProject(project({draft_previews:[{direction_id:'draft-a',name:'<script>bad</script>',caption:'Not approved',featured_previews:[{viewport:'desktop',url:'https://preview.example/draft.png'}]},{direction_id:'unsafe',featured_previews:[{url:'javascript:alert(1)'}]}],can_select:true}));
 assert.equal(data.draft_previews.length,1);assert.deepEqual(data.choices,[]);
 const html=renderDraftPreviews(data.draft_previews);assert.match(html,/Work in progress — review pending/);assert.match(html,/&lt;script&gt;/);assert.doesNotMatch(html,/<script>|data-live-select|<button/);
 const h=harness(async()=>response(data));await h.monitor.start();assert.equal(await h.monitor.select('draft-a'),false);h.monitor.stop();
});
test('expired access instructions do not send the customer back to the same expired link',async()=>{
 const h=harness(async()=>response({},401));await h.monitor.start();assert.match(h.errors[0].message,/fresh project access link/);assert.doesNotMatch(h.errors[0].message,/Reopen your saved/);h.monitor.stop();
});

const build='a'.repeat(64);
test('delivery URL requires safe HTTPS and explicit server capability',()=>{
 assert.equal(normalizeProject(project({download_url:'javascript:alert(1)',can_download:true})).download_url,'');
 assert.equal(normalizeProject(project({download_url:'https://user:pass@files.example/website.zip'})).download_url,'');
 assert.equal(normalizeProject(project({stage:'complete',download_url:'https://files.example/website.zip'})).can_download,false);
 assert.equal(normalizeProject(project({download_url:'https://files.example/website.zip',can_download:true})).can_download,true);
});
test('review actions require explicit server permission and an exact build',async()=>{
 const calls=[];let data=project({stage:'review',current_build_sha256:build});
 const h=harness(async(u,o)=>{calls.push(o);return response(data);});
 await h.monitor.start();assert.equal(await h.monitor.review('revise','Please make this header taller'),false);
 assert.equal(await h.monitor.review('approve'),false);
 data=project({can_revise:true,can_approve:true,current_build_sha256:'bad'});await h.monitor.refresh();
 assert.equal(await h.monitor.review('approve'),false);assert.equal(calls.filter(c=>c.method==='POST').length,0);h.monitor.stop();
});

test('revision retry preserves request identity and original build binding',async()=>{
 const posts=[];let reject=true;
 const h=harness(async(u,o)=>{if(o.method==='POST'){posts.push(JSON.parse(o.body));return reject?response({ok:false,error:'This preview changed. Review the newest version.'},409):response({ok:true});}return response(project({can_revise:true,current_build_sha256:build}));});
 await h.monitor.start();assert.equal(await h.monitor.review('revise','short'),false);assert.equal(posts.length,0);
 assert.equal(await h.monitor.review('revise','  Make the heading larger please.  '),false);
 await new Promise(resolve=>setImmediate(resolve));reject=false;
 assert.equal(await h.monitor.review('revise','Make the heading larger please.'),true);
 assert.deepEqual(posts[0],posts[1]);assert.match(posts[0].request_id,/^[A-Za-z0-9_-]{16,80}$/);
 assert.equal(posts[0].expected_build_sha256,build);assert.equal(posts[0].feedback,'Make the heading larger please.');
 assert.equal(h.errors.at(-1).operation,'revise');assert.match(h.errors.at(-1).message,/newest version/);h.monitor.stop();
});

test('approval has no feedback and changed submissions have distinct identity',async()=>{
 const posts=[];const h=harness(async(u,o)=>{if(o.method==='POST'){posts.push(JSON.parse(o.body));return response({ok:true});}return response(project({can_revise:true,can_approve:true,current_build_sha256:build}));});
 await h.monitor.start();assert.equal(await h.monitor.review('approve'),true);
 await new Promise(resolve=>setImmediate(resolve));assert.equal(await h.monitor.review('revise','Please change the footer color.'),true);
 assert.equal(posts[0].action,'approve');assert.equal('feedback' in posts[0],false);
 assert.notEqual(posts[0].request_id,posts[1].request_id);h.monitor.stop();
});
