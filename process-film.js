/* Native scrolling selects chapters. The preview is persistent, working DOM.
   No wheel interception, clipped content, queued states, or synthetic PASS results. */
(() => {
  const film = document.querySelector('.build-film');
  if (!film) return;
  const workspace = film.querySelector('.film-workspace');
  const browser = document.getElementById('film-browser');
  const preview = document.getElementById('arc-preview');
  const notes = [...film.querySelectorAll('[data-note]')];
  const chapters = [...film.querySelectorAll('[data-chapter]')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollMotion = window.matchMedia('(prefers-reduced-motion: no-preference)');
  let chapter = 0;
  let revised = false;
  let framePending = false;
  const running = new Set();

  const responsiveScrollStyles = document.createElement('style');
  responsiveScrollStyles.dataset.processFilmResponsive = 'true';
  responsiveScrollStyles.textContent = `
    @media (max-width:1099px) and (prefers-reduced-motion:no-preference){
      .build-film.is-enhanced{height:460svh}
      .is-enhanced .film-pin{position:sticky;top:84px;height:calc(100svh - 84px);box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden}
      .is-enhanced .film-workspace{flex:1;min-height:0}
      .is-enhanced .film-canvas{min-height:0}
      .is-enhanced .film-browser{min-height:0;max-height:none}
      .is-enhanced .arc-home{min-height:100%}
      .is-enhanced .arc-preview[data-direction=panorama] .arc-home{min-height:100%}
      .is-enhanced .film-chapters{flex-shrink:0}
    }
    @media (max-width:760px) and (prefers-reduced-motion:no-preference){
      .is-enhanced .film-pin{padding:10px 14px 0}
      .is-enhanced .film-topline{display:none}
      .is-enhanced .film-heading{padding:6px 0 8px;flex-shrink:0}
      .premium-site .is-enhanced .film-heading h1{font-size:25px;line-height:1.02}
      .is-enhanced .film-heading>p{display:none}
      .is-enhanced .film-chapters{position:relative;top:auto;order:2;margin:0 0 8px;min-height:46px}
      .is-enhanced .film-chapters button{min-height:46px;padding:8px 0;font-size:9px;gap:3px}
      .is-enhanced .film-chapters button span{font-size:9px}
      .is-enhanced .film-workspace{order:3;gap:8px;overflow:hidden}
      .is-enhanced .film-notes{flex:0 0 auto;max-height:205px;overflow:auto;padding-right:2px}
      .premium-site .is-enhanced .film-note h2{font-size:23px;margin-bottom:8px}
      .is-enhanced .film-note>p{font-size:12px;line-height:1.45;margin-bottom:10px}
      .is-enhanced .film-note dl{gap:6px}
      .is-enhanced .film-note dl>div{padding:6px 0}
      .is-enhanced .film-note dt{font-size:10px}
      .is-enhanced .film-note dd{font-size:11px}
      .is-enhanced .film-direction-controls{gap:4px}
      .is-enhanced .film-direction-controls button{padding:8px 10px;min-height:36px}
      .is-enhanced .film-page-controls,.is-enhanced .film-device-controls{margin:6px 0;gap:5px}
      .is-enhanced .film-page-controls button,.is-enhanced .film-device-controls button{min-height:36px;padding:7px 10px;font-size:11px}
      .is-enhanced .film-revision{padding:10px 12px;font-size:12px}
      .is-enhanced .film-canvas{flex:1;height:auto;min-height:0;margin-bottom:0;padding-bottom:17px}
      .is-enhanced .film-browser{height:100%;min-height:0}
      .is-enhanced .film-canvas-caption{font-size:8px}
    }
    @media (max-width:760px) and (max-height:700px) and (prefers-reduced-motion:no-preference){
      .is-enhanced .film-heading{display:none}
      .is-enhanced .film-notes{max-height:170px}
      .is-enhanced .film-chapters{margin-bottom:5px}
    }
  `;
  document.head.appendChild(responsiveScrollStyles);

  function animate(element, frames, duration = 550) {
    if (reduce.matches || typeof element.animate !== 'function') return;
    const animation = element.animate(frames, {duration, easing:'cubic-bezier(.76,0,.24,1)'});
    running.add(animation);
    animation.finished.then(() => running.delete(animation), () => running.delete(animation));
  }
  function stopAnimations() {running.forEach(animation => animation.cancel()); running.clear();}

  function setPage(page) {
    if (!['home','work','studio','contact'].includes(page)) return;
    preview.dataset.page = page;
    film.querySelectorAll('[data-preview-page]').forEach(panel => {panel.hidden = panel.dataset.previewPage !== page;});
    film.querySelectorAll('[data-sample-page]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.samplePage === page)));
    preview.scrollTop = 0;
    const panel = film.querySelector(`[data-preview-page="${page}"]`);
    if (panel) animate(panel, [{opacity:.35,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}], 320);
  }

  function setDevice(device) {
    if (!['desktop','mobile'].includes(device)) return;
    browser.dataset.device = device;
    document.getElementById('film-size-label').textContent = device === 'mobile' ? 'Mobile' : 'Desktop';
    film.querySelectorAll('[data-device]').forEach(button => {
      if (button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(button.dataset.device === device));
    });
  }

  function setDirection(direction) {
    if (!['panorama','editorial','gallery'].includes(direction)) return;
    stopAnimations();
    setPage('home');
    const targets = [...preview.querySelectorAll('.arc-hero-photo,.arc-home-copy')];
    const previous = targets.map(el => el.getBoundingClientRect());
    preview.dataset.direction = direction;
    browser.dataset.direction = direction;
    film.querySelectorAll('[data-direction]').forEach(button => {
      if (button.tagName === 'BUTTON') button.setAttribute('aria-pressed', String(button.dataset.direction === direction));
    });
    targets.forEach((el,i) => {
      const next = el.getBoundingClientRect();
      const start = previous[i];
      if (!start.width || !next.width || !start.height || !next.height) return;
      // Match both rectangles, then release the transform into the new layout.
      animate(el, [{transformOrigin:'0 0',transform:`translate(${start.left-next.left}px,${start.top-next.top}px) scale(${start.width/next.width},${start.height/next.height})`,opacity:.65},{transformOrigin:'0 0',transform:'none',opacity:1}], 650);
    });
  }

  function setChapter(next) {
    next = Math.max(0, Math.min(notes.length-1, next));
    if (next === chapter && film.dataset.initialized) return;
    const focusedNote = notes.find(note => note.contains(document.activeElement));
    stopAnimations();
    chapter = next;
    workspace.dataset.filmStep = String(next);
    film.dataset.initialized = 'true';
    notes.forEach((note,index) => {note.hidden = index !== next;});
    chapters.forEach((button,index) => {
      if(index === next) button.setAttribute('aria-current','step');
      else button.removeAttribute('aria-current');
    });
    document.getElementById('film-number').textContent = String(next+1).padStart(2,'0');
    if (next === 0 || next === 1 || next === 3 || next === 4) setPage('home');
    setDevice(next === 3 ? 'mobile' : 'desktop');
    animate(notes[next], [{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}], 350);
    if (focusedNote && focusedNote.hidden) chapters[next].focus({preventScroll:true});
  }

  function geometry() {
    const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height || 84;
    const start = window.scrollY + film.getBoundingClientRect().top - headerHeight;
    const distance = Math.max(1, film.offsetHeight - window.innerHeight + headerHeight);
    return {start,distance};
  }
  function navigateChapter(next) {
    setChapter(next);
    if (scrollMotion.matches) {
      const {start,distance} = geometry();
      // Jump directly to the selected chapter; don't animate through intermediates.
      window.scrollTo({top:Math.max(0,start + distance * ((next+.12)/notes.length)),behavior:'instant'});
    }
  }
  function syncScroll() {
    framePending = false;
    if (!scrollMotion.matches) return;
    const {start,distance} = geometry();
    const progress = Math.max(0,Math.min(1,(window.scrollY-start)/distance));
    setChapter(Math.min(notes.length-1,Math.floor(progress*notes.length)));
  }
  chapters.forEach((button,index) => {
    button.addEventListener('click',() => navigateChapter(index));
    button.addEventListener('keydown',event => {
      let next;
      if(event.key === 'ArrowRight') next = Math.min(notes.length-1,index+1);
      if(event.key === 'ArrowLeft') next = Math.max(0,index-1);
      if(event.key === 'Home') next = 0;
      if(event.key === 'End') next = notes.length-1;
      if(next === undefined) return;
      event.preventDefault(); navigateChapter(next); chapters[next].focus({preventScroll:true});
    });
  });
  film.querySelectorAll('button[data-direction]').forEach(button => button.addEventListener('click',() => setDirection(button.dataset.direction)));
  film.querySelectorAll('button[data-device]').forEach(button => button.addEventListener('click',() => setDevice(button.dataset.device)));
  film.querySelectorAll('button[data-sample-page]').forEach(button => button.addEventListener('click',() => setPage(button.dataset.samplePage)));
  document.getElementById('apply-revision').addEventListener('click',() => {
    revised = !revised;
    const headline = document.getElementById('arc-headline');
    headline.replaceChildren();
    headline.append(document.createTextNode(revised ? 'Coastal homes.' : 'A quieter'), document.createElement('br'), document.createTextNode(revised ? 'Considered for life.' : 'kind of extraordinary.'));
    const button = document.getElementById('apply-revision');
    button.textContent = revised ? 'Compare with original ↗' : 'Apply this revision ↗';
    button.setAttribute('aria-pressed',String(revised));
    document.getElementById('revision-result').textContent = revised ? 'Revised: the headline now names the specialty. Only this sample changed.' : 'Original restored. You can apply the revision again.';
    animate(headline,[{opacity:.15,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],400);
  });
  document.getElementById('arc-sample-form').addEventListener('submit',event => {
    event.preventDefault();
    document.getElementById('arc-form-result').textContent = 'Enquiry preview complete. Nothing was sent or saved.';
  });
  document.getElementById('arc-sample-form').querySelector('fieldset').disabled = false;
  function configure() {film.classList.add('is-enhanced'); if(reduce.matches) stopAnimations(); syncScroll();}
  window.addEventListener('scroll',() => {if(!framePending && scrollMotion.matches){framePending=true;window.requestAnimationFrame(syncScroll);}}, {passive:true});
  window.addEventListener('resize',() => {if(!framePending){framePending=true;window.requestAnimationFrame(syncScroll);}}, {passive:true});
  scrollMotion.addEventListener('change',configure);
  reduce.addEventListener('change',configure);
  setChapter(0);
  configure();
})();
