import test from 'node:test';
import assert from 'node:assert/strict';
import {safePreviewURL,normalizeProject,createProjectMonitor} from './live.mjs';
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
