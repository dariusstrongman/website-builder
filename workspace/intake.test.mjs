import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeWebsiteURL,validateBrief,briefPayload,encodedReferenceNotes} from './intake.mjs';
import {fresh,transition,sampleBrief} from './model.mjs';
import {loadProjects,saveProject} from './storage.mjs';
const base={business_name:'Acme',buyer:'Local families',offer:'Garden design',primary_action:'Request a quote',reference_notes:'Warm editorial design',domain:'acme.com',contact_email:'owner@acme.com'};
test('normalizes the exact existing URL and derives its domain without fetching',()=>{
 assert.deepEqual(normalizeWebsiteURL('WWW.Example.com/services?ref=old#work'),{url:'https://www.example.com/services?ref=old#work',domain:'www.example.com'});
 const b=validateBrief({...base,project_mode:'existing',current_website_url:'https://example.com/old',domain:'wrong.com',change_notes:'Improve mobile booking'});
 assert.equal(b.domain,'example.com');assert.equal(b.current_website_url,'https://example.com/old');
});
test('rejects absent, private-style and nonwebsite URL inputs',()=>{
 for(const url of ['', 'javascript:alert(1)', 'file:///tmp/a', 'https://user:pass@example.com', 'localhost', 'http://127.0.0.1', 'http://example.invalid','https://example.com:8080','https://bad..com','https://exam ple.com'])assert.throws(()=>normalizeWebsiteURL(url),undefined,url);
});
test('new and sample briefs do not accidentally require redesign fields',()=>{
 assert.equal(validateBrief(base).project_mode,'new');
 assert.equal(transition(fresh(true),{type:'brief',brief:validateBrief(sampleBrief)}).stage,1);
 const payload=briefPayload({...base,project_mode:'new',current_website_url:'bad',keep_notes:'stale',change_notes:'stale'});
 assert.equal(payload.reference_notes,base.reference_notes);
 assert.deepEqual(Object.keys(payload).sort(),['business_name','buyer','offer','primary_action','domain','contact_email','reference_notes','mode','source'].sort());
 assert.equal(payload.mode,'paid');
});
test('existing payload carries exact keep/change instructions inside canonical reference_notes',()=>{
 const b={...base,project_mode:'existing',current_website_url:'example.com/work',keep_notes:'Keep the blue logo.\nKeep all projects.',change_notes:'Replace navigation and improve mobile.'};
 const original=structuredClone(b),p=briefPayload(b,{source:'homepage'});
 assert.equal(p.source,'homepage');assert.equal(p.domain,'example.com');
 assert.ok(p.reference_notes.includes('https://example.com/work'));
 assert.ok(p.reference_notes.includes(b.keep_notes));assert.ok(p.reference_notes.includes(b.change_notes));
 assert.equal(p.project_mode,undefined);assert.deepEqual(b,original);
 assert.ok(briefPayload({...b,keep_notes:''}).reference_notes.includes('Not specified'));
});
test('combined 4000 character boundary rejects rather than truncates',()=>{
 const b={...base,project_mode:'existing',current_website_url:'example.com',keep_notes:'Keep identity',change_notes:'Improve mobile',reference_notes:''};
 const overhead=encodedReferenceNotes({...b,reference_notes:'x'}).length-1;
 assert.equal(encodedReferenceNotes({...b,reference_notes:'x'.repeat(4000-overhead)}).length,4000);
 assert.throws(()=>briefPayload({...b,reference_notes:'x'.repeat(4001-overhead)}),/4,000/);
 assert.throws(()=>briefPayload({...base,reference_notes:'x'.repeat(4001)}),/4,000/);
});
test('fresh real briefs default to improve existing while sample and saved new choices stay new',()=>{
 assert.equal(fresh().brief.project_mode,'existing');assert.equal(fresh(true).brief.project_mode,'new');
 const saved={schema:2,active:'real',real:{...fresh(),brief:{project_mode:'new'}},sample:fresh(true)};
 assert.equal(loadProjects({getItem:()=>JSON.stringify(saved)},'test').real.brief.project_mode,'new');
});
test('existing intake needs only URL and improvement goal without fabricating customer facts',()=>{
 const input={project_mode:'existing',current_website_url:'example.com',change_notes:'Make booking easier on mobile'};
 const validated=validateBrief(input);assert.equal(validated.business_name,undefined);
 const payload=briefPayload(input);assert.equal(payload.business_name,'Website redesign: example.com');
 assert.match(payload.offer,/Not provided/);assert.match(payload.buyer,/Not provided/);assert.match(payload.primary_action,/Not specified/);
 assert.match(payload.reference_notes,/not verified customer facts/);assert.match(payload.reference_notes,/Make booking easier on mobile/);
 assert.throws(()=>validateBrief({...input,change_notes:''}),/what should work better/);
 assert.throws(()=>validateBrief({...input,change_notes:'better'}),/at least 10/);
 assert.throws(()=>validateBrief({project_mode:'new'}),/business/);
});
test('existing draft and review fields survive reload and sample switching',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};
 let projects=loadProjects(storage,'test'),draft=fresh();
 draft.brief={...base,project_mode:'existing',current_website_url:'example.com/old',keep_notes:'Keep logo',change_notes:'Change mobile'};
 saveProject(storage,'test',projects,draft);projects=loadProjects(storage,'test');
 assert.deepEqual(projects.real.brief,draft.brief);
 const reviewed=transition(projects.real,{type:'brief',brief:validateBrief(projects.real.brief)});
 saveProject(storage,'test',projects,reviewed);saveProject(storage,'test',projects,projects.sample);
 projects=loadProjects(storage,'test');assert.equal(projects.real.stage,1);
 assert.equal(projects.real.brief.current_website_url,'https://example.com/old');
 assert.equal(projects.real.brief.keep_notes,'Keep logo');assert.equal(projects.real.brief.change_notes,'Change mobile');
});
