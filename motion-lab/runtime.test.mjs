import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {composition,progressFor,clamp,cue} from './timeline.mjs';

// Run the actual entry module against a minimal layout/event fixture. This catches
// mode gating and resize regressions that pure interpolation tests cannot see.
const source=(process.env.MOTION_TEST_BASELINE
 ?execFileSync('git',['show','7cbc2ea125b8879f98000b1cc2d3d056a264db5d:motion-lab/main.mjs'],{encoding:'utf8'})
 :readFileSync(new URL('./main.mjs',import.meta.url),'utf8')).replace(/^import[^\n]+\n/,'');
function page(width,height,osReduced=false){
 const events={},queries={},queue=new Map();let id=0;
 class Element{
  constructor(){this.style={};this.attrs={};this.events={};this.inert=false;this.classes=new Set();this.classList={toggle:(c,on)=>on?this.classes.add(c):this.classes.delete(c),remove:c=>this.classes.delete(c),contains:c=>this.classes.has(c)};this.dataset={};this.disabled=false}
  addEventListener(n,fn){this.events[n]=fn}setAttribute(k,v){this.attrs[k]=v}removeAttribute(k){delete this.attrs[k];if(k==='style')this.style={}}querySelectorAll(){return []}
  getBoundingClientRect(){return {top:-ctx.scrollY}}get offsetHeight(){return ctx.innerHeight*5.5}get clientHeight(){return ctx.innerHeight}get clientWidth(){return ctx.innerWidth}
 }
 const el=s=>queries[s]??(queries[s]=new Element());const copies=Array.from({length:4},()=>new Element());
 const reduced={matches:osReduced,addEventListener:(n,fn)=>events.os=fn};
 const ctx=vm.createContext({composition,progressFor,clamp,cue,innerWidth:width,innerHeight:height,scrollY:0,
 document:{body:el('body'),querySelector:el,querySelectorAll:s=>s==='[data-copy]'?copies:[],addEventListener:(n,fn)=>events[n]=fn,hidden:false},
 matchMedia:q=>q.includes('prefers-reduced')?reduced:{get matches(){return ctx.innerWidth<=700}},
 addEventListener:(n,fn)=>events[n]=fn,requestAnimationFrame:fn=>{queue.set(++id,fn);return id},cancelAnimationFrame:i=>queue.delete(i),scrollTo:arg=>{ctx.scrollY=arg.top}
 });
 function flush(){const f=[...queue.values()];queue.clear();f.forEach(fn=>fn())}
 vm.runInContext(source,ctx);flush();
 return {ctx,events,el,copies,reduced,flush,scroll(y){ctx.scrollY=y;events.scroll();flush()},click(){el('.motion-toggle').events.click();flush()}};
}
for(const [w,h] of [[390,580],[844,390],[320,568],[390,844]]){
 test(`motion renders on scroll at ${w}x${h}`,()=>{
  const p=page(w,h);assert.ok(p.el('body').classList.contains('animated'));
  const before=p.el('.media').style.transform;
  p.scroll(h);assert.notEqual(p.el('.media').style.transform,before);
  assert.ok(Number(p.el('.stage').dataset.progress)>0);assert.equal(p.el('.motion-toggle').disabled,false);
 });
}
test('browser chrome resizing across 620px does not switch to reading mode or reset scroll',()=>{
 const p=page(390,650);p.scroll(800);p.ctx.innerHeight=580;p.events.resize();p.flush();
 assert.ok(p.el('body').classList.contains('animated'));assert.equal(p.ctx.scrollY,800);
 p.ctx.innerHeight=660;p.events.resize();p.flush();assert.equal(p.ctx.scrollY,800);
});
test('OS reduction is the default, but the visitor can explicitly preview motion',()=>{
 const p=page(390,580,true);assert.equal(p.el('body').classList.contains('animated'),false);
 assert.equal(p.el('.motion-toggle').textContent,'Enable motion');assert.equal(p.el('.motion-toggle').disabled,false);
 p.click();assert.ok(p.el('body').classList.contains('animated'));p.scroll(700);
 assert.ok(Number(p.el('.stage').dataset.progress)>0);
 p.click();assert.equal(p.el('body').classList.contains('animated'),false);
 assert.ok(p.copies.every(e=>!e.inert&&!e.attrs['aria-hidden']));
});
