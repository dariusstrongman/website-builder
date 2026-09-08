import test from 'node:test';
import assert from 'node:assert/strict';
import {createSceneNavigator} from './navigation.mjs';
function rig(initial=0){
 let p=initial,time=0,id=0,enabled=true;const frames=new Map(),positions=[];
 const nav=createSceneNavigator({getProgress:()=>p,seek:value=>{p=value;positions.push(value)},isEnabled:()=>enabled,now:()=>time,requestFrame:fn=>{frames.set(++id,fn);return id},cancelFrame:id=>frames.delete(id)});
 function advance(ms){for(let t=0;t<ms;t+=16){time+=16;const batch=[...frames.values()];frames.clear();batch.forEach(fn=>fn())}}
 return {nav,advance,positions,get progress(){return p},disable(){enabled=false}};
}
test('a small gesture finishes the whole scene without further input',()=>{
 const r=rig();assert.equal(r.nav.wheel(25),true);r.advance(500);assert.ok(r.progress>0&&r.progress<.24);
 r.advance(1200);assert.equal(r.progress,.24);assert.equal(r.nav.running,false);
 assert.ok(r.positions.every((v,i,a)=>i===0||v>=a[i-1]));
});
test('momentum cannot advance a second scene; a fresh gesture can',()=>{
 const r=rig();r.nav.wheel(30);
 for(let i=0;i<120;i++){r.advance(16);r.nav.wheel(4)}
 assert.equal(r.progress,.24);r.advance(200);r.nav.wheel(30);r.advance(1800);assert.equal(r.progress,.56);
});
test('reverse gesture completes the previous composition',()=>{
 const r=rig(.56);r.nav.wheel(-30);r.advance(1800);assert.equal(r.progress,.24);
 assert.ok(r.positions.every((v,i,a)=>i===0||v<=a[i-1]));
});
test('page scrolling is released at both ends and when motion is off',()=>{
 assert.equal(rig().nav.wheel(-30),false);assert.equal(rig(1).nav.wheel(30),false);
 const r=rig();r.disable();assert.equal(r.nav.wheel(30),false);assert.equal(r.nav.step(1),false);
});
test('cancel stops the transition immediately',()=>{
 const r=rig();r.nav.step(1);r.advance(400);r.nav.cancel();const p=r.progress;r.advance(2000);assert.equal(r.progress,p);
});
test('one sequence traverses all three scenes in both directions',()=>{
 const r=rig();for(const stop of [.24,.56,1]){r.nav.step(1);r.advance(1800);assert.equal(r.progress,stop)}
 assert.equal(r.nav.step(1),false);
 for(const stop of [.56,.24,0]){r.nav.step(-1);r.advance(1800);assert.equal(r.progress,stop)}
 assert.equal(r.nav.step(-1),false);
});
