import {composition,progressFor,clamp,cue} from './timeline.mjs';
const $=s=>document.querySelector(s);
const story=$('.story'),stage=$('.stage'),media=$('.media'),photo=$('.media-photo'),img=$('.media-photo img');
const header=$('.lab-header'),shade=$('.image-shade'),bar=$('.browser-bar'),brand=$('.site-brand'),content=$('.site-content'),island=$('.phone-island');
const copies=[...document.querySelectorAll('[data-copy]')],bottom=$('.stage-bottom'),progress=$('.scroll-progress i');
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),narrow=matchMedia('(max-width:700px)');
const button=$('.motion-toggle');
let manualReduce=false,enabled=false,frame=0,metrics={};
const labels=['THE FIRST IDEA','01 / POINT OF VIEW','02 / THE WORLD','03 / EVERY SCREEN'];
function measure(){
  if(!enabled)return;
  const r=story.getBoundingClientRect();
  metrics={top:r.top+scrollY,track:story.offsetHeight,w:stage.clientWidth,h:stage.clientHeight};
  schedule();
}
function draw(){
  frame=0;if(!enabled)return;
  const p=progressFor(scrollY,metrics.top,metrics.track,metrics.h),s=composition(p,narrow.matches);
  const [x,y,w,h]=s.rect,ww=w*metrics.w,hh=h*metrics.h;
  media.style.width=`${ww}px`;media.style.height=`${hh}px`;
  media.style.transform=`translate3d(${x*metrics.w}px,${y*metrics.h}px,0)`;
  media.style.borderRadius=`${s.phoneProgress*27}px`;
  media.style.border=`${s.frame*(1+s.phoneProgress*4)}px solid #17252f`;
  photo.style.height=`${s.photoHeight*100}%`;
  img.style.transform=`scale(${s.imageScale})`;
  shade.style.opacity=clamp(s.shade);
  bar.style.opacity=s.frame*(1-s.phoneProgress);
  island.style.opacity=s.phoneProgress;
  content.style.opacity=s.phoneProgress;
  brand.style.opacity=s.world;
  const sweepA=cue(p,.305,.425),sweepB=cue(p,.345,.465);
  $('.curtain-a').style.transform=`translate3d(${-105+210*sweepA}%,0,0)`;
  $('.curtain-b').style.transform=`translate3d(${-105+210*sweepB}%,0,0)`;
  for(let i=0;i<copies.length;i++){
    const el=copies[i],a=s.copies[i];
    el.style.opacity=a;el.style.visibility=a>.001?'visible':'hidden';
    el.setAttribute('aria-hidden',a<.5?'true':'false');el.inert=a<.5;
    el.style.transform=`translate3d(0,${(1-a)*(i===0?-45:32)}px,0)`;
    // Headline lines follow the panel instead of all arriving on the same frame.
    el.querySelectorAll('h1>span,h2>span').forEach((line,j)=>{
      const v=clamp(a*(1+j*.18)-j*.18);
      line.style.transform=`translateY(${(1-v)*22}px)`;line.style.opacity=v;
    });
  }
  header.classList.toggle('dark',s.darkHeader && scrollY < metrics.top+metrics.track-metrics.h*.2);
  bottom.style.color=s.darkHeader?'#152027':'white';
  $('.stage-label').textContent=labels[s.chapter];
  $('.stage-count').textContent=`0${s.chapter} — 03`;
  progress.style.transform=`scaleX(${p})`;
  stage.dataset.progress=p.toFixed(5);stage.dataset.chapter=s.chapter;
}
function schedule(){if(enabled&&!frame)frame=requestAnimationFrame(draw)}
function mode(){
  const oldY=scrollY,oldTop=story.getBoundingClientRect().top+scrollY;
  const compact=innerHeight<620||innerWidth<350;
  enabled=!(reduced.matches||manualReduce||compact);
  document.body.classList.toggle('animated',enabled);
  button.hidden=false;button.disabled=reduced.matches||compact;
  button.textContent=reduced.matches?'Reduced motion':compact?'Reading layout':manualReduce?'Enable motion':'Reduce motion';
  button.setAttribute('aria-pressed',String(!enabled));
  if(!enabled){
    cancelAnimationFrame(frame);frame=0;
    for(const el of [media,photo,img,shade,bar,brand,content,island])el.removeAttribute('style');
    copies.forEach(el=>{el.removeAttribute('aria-hidden');el.inert=false;});
    header.classList.remove('dark');
    if(oldY>oldTop)scrollTo({top:oldTop,behavior:'instant'});
  }else measure();
}
button.addEventListener('click',()=>{manualReduce=!manualReduce;mode()});
addEventListener('scroll',schedule,{passive:true});
let lastWidth=innerWidth,lastShort=innerHeight<620;
addEventListener('resize',()=>{
  const short=innerHeight<620;
  if(lastWidth!==innerWidth||lastShort!==short){lastWidth=innerWidth;lastShort=short;mode()}
  else measure();
},{passive:true});
reduced.addEventListener('change',mode);
addEventListener('pageshow',measure);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)measure()});
document.querySelectorAll('[data-jump]').forEach(a=>a.addEventListener('click',e=>{
  if(!enabled)return;e.preventDefault();
  scrollTo({top:metrics.top+Number(a.dataset.jump)*(metrics.track-metrics.h),behavior:'smooth'});
}));
mode();
