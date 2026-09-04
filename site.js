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
