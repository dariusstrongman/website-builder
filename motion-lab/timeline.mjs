export const clamp = (v, lo=0, hi=1) => Math.max(lo, Math.min(hi,v));
export const mix = (a,b,t) => a+(b-a)*t;
export function cue(p,a,b){const t=clamp((p-a)/(b-a));return t*t*(3-2*t)}
// Fractional rectangles use the measured sticky stage, not innerHeight.
// Segment endpoints coincide so reverse scrubbing cannot reset the subject.
const full = [0,0,1,1];
export function composition(p,mobile=false){
  p=clamp(p);
  const plate=mobile?[.08,.12,.84,.37]:[.52,.19,.44,.66];
  const desktop=mobile?[.065,.15,.87,.43]:[.48,.2,.47,.61];
  const phone=mobile?[.235,.115,.53,.505]:[.625,.16,.205,.69];
  let rect=full;
  if(p<.30) rect=full.map((v,i)=>mix(v,plate[i],cue(p,.035,.19)));
  else if(p<.48) rect=plate.map((v,i)=>mix(v,full[i],cue(p,.30,.46)));
  else if(p<.80) rect=full.map((v,i)=>mix(v,desktop[i],cue(p,.635,.785)));
  else rect=desktop.map((v,i)=>mix(v,phone[i],cue(p,.81,.94)));
  const phoneProgress=cue(p,.81,.94);
  return {rect,phoneProgress,frame:cue(p,.655,.78),
    photoHeight:mix(1,.57,phoneProgress),
    shade:1-cue(p,.025,.18)+.85*cue(p,.34,.47)-.85*cue(p,.635,.77),
    imageScale:1.06-.06*cue(p,0,.19)+.07*cue(p,.3,.46)-.07*cue(p,.635,.785),
    copies:[1-cue(p,.025,.115),cue(p,.13,.20)*(1-cue(p,.29,.36)),cue(p,.45,.52)*(1-cue(p,.615,.69)),cue(p,.745,.81)],
    chapter:p<.13?0:p<.39?1:p<.70?2:3,
    darkHeader:p>=.13&&p<.37||p>=.71,
    world:cue(p,.44,.51)*(1-cue(p,.63,.72)),
  };
}
export function progressFor(scrollY,top,trackHeight,stageHeight){
  return clamp((scrollY-top)/Math.max(1,trackHeight-stageHeight));
}
