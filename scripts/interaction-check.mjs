// Logic tests with controlled DOM doubles. Not a browser/layout/accessibility audit.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const project = join(dirname(fileURLToPath(import.meta.url)), '..');
const root = existsSync(join(project, 'dist')) ? join(project, 'dist') : project;
function element(id='') {
  const classes = new Set(), listeners = {}, attrs = {};
  return {id, style:{}, dataset:{}, listeners, attrs, textContent:'',
    classList:{contains:c=>classes.has(c),add:c=>classes.add(c),remove:c=>classes.delete(c),toggle(c,on){const next=on??!classes.has(c);next?classes.add(c):classes.delete(c);return next;}},
    addEventListener(name,cb){listeners[name]=cb},setAttribute(k,v){attrs[k]=v},focus(){this.focused=true},
    dispatch(name,event={}){listeners[name]?.(event)},querySelector(){return null}
  };
}
const header=element(),menu=element(),groups=[element(),element()],select=element(),output=element();
groups.forEach(g=>{g.open=false;g.summary=element();g.querySelector=()=>g.summary;});
const plans=['launch','business','premium'].map(x=>element('plan-'+x));
header.contains=x=>x===menu||groups.includes(x);
const documentEvents={};
const doc={querySelector:s=>({'.site-header':header,'.mobile-menu-button':menu,'#plan-needs':select,'#plan-match':output}[s]),querySelectorAll:s=>s==='.nav-group'?groups:s==='.plan'?plans:[],addEventListener:(n,cb)=>documentEvents[n]=cb};
vm.runInNewContext(readFileSync(join(root,'site.js'),'utf8'),{document:doc});
menu.dispatch('click');assert.equal(menu.attrs['aria-expanded'],'true');assert(header.classList.contains('menu-open'));
groups[0].open=true;groups[1].open=true;groups[1].dispatch('toggle');assert.equal(groups[0].open,false);
documentEvents.keydown({key:'Escape'});assert.equal(groups[1].open,false);assert(groups[1].summary.focused);
documentEvents.keydown({key:'Escape'});assert.equal(menu.attrs['aria-expanded'],'false');assert(menu.focused);
menu.dispatch('click');documentEvents.click({target:{}});assert.equal(menu.attrs['aria-expanded'],'false');
for(const name of ['launch','business','premium','']){select.value=name;select.dispatch('change');assert.equal(plans.filter(p=>p.classList.contains('selected-plan')).length,name?1:0);if(name)assert(output.textContent.toLowerCase().includes(name));}
const previewButtons=['desktop','mobile'].map(mode=>{const b=element();b.dataset.previewMode=mode;return b;});
const frames=Array.from({length:3},()=>{const f=element();f.clientWidth=1230;f.iframe=element();f.iframe.contentDocument={body:element()};f.querySelector=s=>s==='iframe'?f.iframe:{getBoundingClientRect:()=>({height:42})};return f;});
const showcases=element(),description=element();const previewDoc={body:element(),querySelector:s=>s==='.live-showcases'?showcases:null,querySelectorAll:s=>s==='[data-preview-mode]'?previewButtons:s==='.demo-browser'?frames:[],getElementById:s=>s==='preview-description'?description:null};
vm.runInNewContext(readFileSync(join(root,'app.js'),'utf8'),{document:previewDoc,window:{matchMedia:()=>({matches:true}),addEventListener(){},setTimeout:fn=>fn()},location:{}});
frames.forEach(f=>{assert.equal(f.iframe.style.width,'1440px');assert.equal(f.style.height,'657px');assert.equal(f.iframe.style.transform,'scale(0.8541666666666666)');});
frames.forEach(f=>f.clientWidth=390);previewButtons[1].dispatch('click');
frames.forEach(f=>{assert.equal(f.iframe.style.width,'390px');assert.equal(f.iframe.style.transform,'scale(1)');assert.equal(f.style.height,'802px');});
assert.equal(previewButtons[1].attrs['aria-pressed'],'true');assert(showcases.classList.contains('mobile-mode'));
frames.forEach(f=>f.clientWidth=310);previewButtons[1].dispatch('click');
frames.forEach(f=>assert.equal(f.iframe.style.transform,`scale(${310/390})`));
console.log('Interaction logic passed: navigation, Escape/focus, plan selection, and all three preview scale states. Browser rendering not tested.');
