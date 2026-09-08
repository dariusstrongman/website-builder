import test from 'node:test';
import assert from 'node:assert/strict';
import {composition,progressFor} from './timeline.mjs';

test('progress follows actual sticky travel including offset and stable viewport',()=>{
 assert.equal(progressFor(258,58,2200,800),1/7);
 assert.equal(progressFor(1458,58,2200,800),1);
 assert.equal(progressFor(-20,58,2200,800),0);
 assert.equal(progressFor(9000,58,2200,800),1);
});
for(const mobile of [false,true]){
 test(`continuous bounded image at every frame (${mobile?'phone':'desktop'})`,()=>{
  let previous=composition(0,mobile);
  for(let i=1;i<=10000;i++){
   const s=composition(i/10000,mobile),[x,y,w,h]=s.rect;
   assert.ok([x,y,w,h,s.photoHeight,s.shade,s.imageScale,...s.copies].every(Number.isFinite));
   assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=1.00001&&y+h<=1.00001);
   assert.ok(s.rect.every((v,j)=>Math.abs(v-previous.rect[j])<.002),'no boundary teleport');
   assert.ok(s.copies.every(a=>a>=0&&a<=1));
   previous=s;
  }
 });
 test(`readable holds and reversible scrub (${mobile?'phone':'desktop'})`,()=>{
  for(const [a,b,chapter] of [[.21,.28,1],[.53,.60,2],[.95,1,3]]){
   const first=composition(a,mobile),last=composition(b,mobile);
   assert.deepEqual(first.rect,last.rect);
   assert.equal(first.copies[chapter],1);assert.equal(last.copies[chapter],1);
  }
  const positions=[0,.1,.19,.3,.46,.64,.8,.9,1];
  const forward=positions.map(p=>composition(p,mobile));
  const backward=positions.toReversed().map(p=>composition(p,mobile)).toReversed();
  assert.deepEqual(forward,backward);
 });
}
