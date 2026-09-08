// A gesture requests a complete chapter transition. Progress still uses the
// native scroll position so links, scrollbar dragging, and page exit work.
export const RESTS = [0, .24, .56, 1];
export function createSceneNavigator({getProgress,seek,isEnabled,now,requestFrame,cancelFrame}) {
  let frame=0,running=false,lastWheel=-Infinity,amount=0;
  function cancel(){cancelFrame(frame);frame=0;running=false;amount=0;lastWheel=-Infinity}
  function goTo(target){
    if(!isEnabled())return false;
    if(running)return true;
    const from=getProgress();
    if(Math.abs(from-target)<.0001)return false;
    const start=now(),duration=1100+Math.abs(target-from)*900;
    running=true;
    function tick(){
      if(!isEnabled()){cancel();return}
      const t=Math.min(1,(now()-start)/duration);
      const ease=.5-.5*Math.cos(Math.PI*t);
      seek(from+(target-from)*ease);
      if(t<1)frame=requestFrame(tick);
      else {seek(target);frame=0;running=false}
    }
    frame=requestFrame(tick);return true;
  }
  function step(direction){
    if(!isEnabled())return false;
    if(running)return true;
    const p=getProgress(),eps=.015;
    const target=direction>0?RESTS.find(s=>s>p+eps):[...RESTS].reverse().find(s=>s<p-eps);
    return target===undefined?false:goTo(target);
  }
  function wheel(delta){
    if(!isEnabled()||!delta)return false;
    const time=now(),gap=time-lastWheel;lastWheel=time;
    // Trackpad inertia from the triggering gesture must not skip a chapter.
    if(running){amount=0;return true}
    if(gap<160&&amount===0)return true;
    const p=getProgress();
    if(p>=.999&&delta>0||p<=.001&&delta<0)return false;
    if(gap>=160||Math.sign(amount)!==Math.sign(delta))amount=0;
    amount+=delta;
    if(Math.abs(amount)>=18){const direction=Math.sign(amount);amount=0;return step(direction)}
    return true;
  }
  return {goTo,step,wheel,cancel,canStep:direction=>isEnabled()&&(running||(direction>0?getProgress()<.985:getProgress()>.015)),get running(){return running}};
}
