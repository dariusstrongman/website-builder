/* Shared interactions: native navigation, explicit states, no animation dependency. */
const siteHeader = document.querySelector('.site-header');
const menuButton = document.querySelector('.mobile-menu-button');
const navGroups = [...document.querySelectorAll('.nav-group')];
function closeGroups(except) {
  navGroups.forEach(group => { if (group !== except) group.open = false; });
}
navGroups.forEach(group => group.addEventListener('toggle', () => {
  if (group.open) closeGroups(group);
}));
menuButton?.addEventListener('click', () => {
  const open = siteHeader.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
  if (!open) closeGroups();
});
document.addEventListener('click', event => {
  if (!siteHeader?.contains(event.target)) {
    closeGroups();
    siteHeader?.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const openGroup = navGroups.find(group => group.open);
  if (openGroup) {
    closeGroups();
    openGroup.querySelector('summary').focus();
  } else if (siteHeader?.classList.contains('menu-open')) {
    siteHeader.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.focus();
  }
});
const planNeeds = document.querySelector('#plan-needs');
const planMessages = {
  launch: 'Launch fits this scope — $500',
  business: 'Business fits this scope — $1,000',
  premium: 'Premium fits this scope — $1,500'
};
planNeeds?.addEventListener('change', () => {
  document.querySelectorAll('.plan').forEach(plan => {
    plan.classList.toggle('selected-plan', plan.id === `plan-${planNeeds.value}`);
  });
  document.querySelector('#plan-match').textContent = planMessages[planNeeds.value] || 'Compare the scope below';
});

const premiumReduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const directionPulse=document.querySelector('.direction-pulse');
if(directionPulse){
  const routeButtons=[...directionPulse.querySelectorAll('[data-live-route]')];
  const routeStates=[
    {name:'Editorial authority',copy:'Cinematic imagery, measured typography and quiet pacing make the work itself feel valuable.',link:'examples.html#architecture',label:'Open the architecture study →'},
    {name:'Kinetic energy',copy:'Bold type, controlled color and responsive movement turn atmosphere into a reason to participate.',link:'examples.html#wellness',label:'Open the wellness study →'},
    {name:'Operational confidence',copy:'Inspectable states, technical hierarchy and visible evidence make an unfamiliar product understandable.',link:'examples.html#industrial',label:'Open the industrial study →'}
  ];
  let activeRoute=0;
  let routeTimer;
  const selectRoute=index=>{
    activeRoute=index;
    const state=routeStates[index];
    directionPulse.dataset.route=String(index);
    routeButtons.forEach((button,buttonIndex)=>{const active=buttonIndex===index;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});
    document.querySelector('#direction-count').textContent=`${String(index+1).padStart(2,'0')} / 03`;
    document.querySelector('#direction-name').textContent=state.name;
    document.querySelector('#direction-copy').textContent=state.copy;
    const link=document.querySelector('#direction-link');link.href=state.link;link.textContent=state.label;
  };
  const stopCycle=()=>window.clearTimeout(routeTimer);
  const startCycle=()=>{if(premiumReduceMotion||activeRoute===routeStates.length-1)return;stopCycle();routeTimer=window.setTimeout(()=>{selectRoute(activeRoute+1);startCycle()},3200)};
  routeButtons.forEach((button,index)=>button.addEventListener('click',()=>{selectRoute(index);startCycle()}));
  directionPulse.addEventListener('mouseenter',stopCycle);
  directionPulse.addEventListener('mouseleave',startCycle);
  directionPulse.addEventListener('focusin',stopCycle);
  directionPulse.addEventListener('focusout',event=>{if(!directionPulse.contains(event.relatedTarget))startCycle()});
  selectRoute(0);
  startCycle();
}
