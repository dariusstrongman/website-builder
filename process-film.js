/* Native scrolling selects chapters. The preview is persistent, working DOM.
   No wheel interception, clipped content, queued states, or synthetic PASS results. */
(() => {
  const film = document.querySelector('.build-film');
  if (!film) return;

  const pin = film.querySelector('.film-pin');
  const workspace = film.querySelector('.film-workspace');
  const browser = document.getElementById('film-browser');
  const preview = document.getElementById('arc-preview');
  const notes = [...film.querySelectorAll('[data-note]')];
  const chapters = [...film.querySelectorAll('[data-chapter]')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  let chapter = 0;
  let revised = false;
  let framePending = false;
  const running = new Set();

  const responsiveScrollStyles = document.createElement('style');
  responsiveScrollStyles.dataset.processFilmResponsive = 'true';
  responsiveScrollStyles.textContent = `
    .build-film.is-enhanced{position:relative}
    .build-film.is-enhanced .film-pin{position:sticky;box-sizing:border-box;display:flex;flex-direction:column;overflow:hidden}
    .build-film.is-enhanced .film-workspace{flex:1;min-height:0}
    .build-film.is-enhanced .film-canvas{min-height:0}
    .build-film.is-enhanced .film-browser{min-height:0;max-height:none}
    .build-film.is-enhanced .arc-home{min-height:100%}
    .build-film.is-enhanced .arc-preview[data-direction=panorama] .arc-home{min-height:100%}
    .build-film.is-enhanced .film-chapters{flex-shrink:0}

    @media (max-width:1099px){
      .build-film.is-enhanced .film-pin{padding:16px 20px 0}
      .build-film.is-enhanced .film-heading{padding:10px 0 14px;flex-shrink:0}
      .build-film.is-enhanced .film-heading>p{font-size:13px;line-height:1.45}
      .build-film.is-enhanced .film-workspace{gap:18px;overflow:hidden}
      .build-film.is-enhanced .film-notes{padding-block:8px}
      .build-film.is-enhanced .film-canvas{height:auto;margin-bottom:0;padding-bottom:18px}
      .build-film.is-enhanced .film-browser{height:100%}
      .build-film.is-enhanced .film-chapters{position:relative;top:auto;margin-top:8px}
    }

    @media (max-width:760px){
      .build-film.is-enhanced .film-pin{padding:8px 12px 0}
      .build-film.is-enhanced .film-topline{display:none}
      .build-film.is-enhanced .film-heading{display:none}
      .build-film.is-enhanced .film-chapters{order:1;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px;margin:0 0 6px;padding:0;border-bottom:1px solid #dce0eb}
      .build-film.is-enhanced .film-chapters button{min-height:42px;padding:6px 0;font-size:8px;line-height:1.15;gap:2px}
      .build-film.is-enhanced .film-chapters button span{font-size:8px}
      .build-film.is-enhanced .film-workspace{order:2;display:flex;flex-direction:column;gap:6px;overflow:hidden;min-height:0}
      .build-film.is-enhanced .film-notes{flex:0 0 auto;max-height:145px;overflow:auto;padding:0 2px 0 0;align-self:stretch}
      .build-film.is-enhanced .film-index{margin:0 0 6px;font-size:10px}
      .premium-site .build-film.is-enhanced .film-note h2{font-size:20px;line-height:1.05;margin:0 0 6px}
      .build-film.is-enhanced .film-note h2 br{display:none}
      .build-film.is-enhanced .film-note>p{font-size:11px;line-height:1.35;margin-bottom:7px}
      .build-film.is-enhanced .film-note dl{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:0}
      .build-film.is-enhanced .film-note dl>div{padding:4px 0}
      .build-film.is-enhanced .film-note dl>div:last-child{grid-column:1/-1}
      .build-film.is-enhanced .film-note dt{font-size:9px}
      .build-film.is-enhanced .film-note dd{font-size:10px;line-height:1.25}
      .build-film.is-enhanced .film-direction-controls{gap:3px}
      .build-film.is-enhanced .film-direction-controls button{padding:6px 8px;min-height:32px}
      .build-film.is-enhanced .film-direction-controls button b{font-size:10px}
      .build-film.is-enhanced .film-direction-controls button span{font-size:9px;margin-left:4px}
      .build-film.is-enhanced .film-page-controls,.build-film.is-enhanced .film-device-controls{margin:5px 0;gap:4px}
      .build-film.is-enhanced .film-page-controls button,.build-film.is-enhanced .film-device-controls button{min-height:32px;padding:5px 8px;font-size:10px}
      .build-film.is-enhanced .film-note .film-small{font-size:10px;line-height:1.35;margin:6px 0 0}
      .build-film.is-enhanced .film-revision{padding:8px 10px;font-size:10px}
      .build-film.is-enhanced .film-canvas{flex:1;height:auto;min-height:0;margin:0;padding-bottom:13px}
      .build-film.is-enhanced .film-browser{height:100%;min-height:0;border-radius:8px}
      .build-film.is-enhanced .film-browser-bar{height:24px;padding:0 8px;font-size:7px}
      .build-film.is-enhanced .film-canvas-caption{font-size:7px}
    }

    @media (max-width:760px) and (max-height:700px){
      .build-film.is-enhanced .film-notes{max-height:112px}
      .build-film.is-enhanced .film-chapters button{min-height:36px;padding:4px 0}
    }

    @media (prefers-reduced-motion:reduce){
      .build-film.is-enhanced .film-browser,
      .build-film.is-enhanced .arc-home-copy,
      .build-film.is-enhanced .arc-nav{transition:none!important}
    }
  `;
  document.head.appendChild(responsiveScrollStyles);

  function viewportHeight() {
    return Math.max(420, Math.round(window.visualViewport?.height || window.innerHeight || 800));
  }

  function headerHeight() {
    const header = document.querySelector('.site-header');
    return Math.max(0, Math.round(header?.getBoundingClientRect().height || 0));
  }

  function sizeFilm() {
    const vh = viewportHeight();
    const hh = headerHeight();
    const usable = Math.max(360, vh - hh);
    film.style.height = `${Math.round(vh * 5.2)}px`;
    pin.style.top = `${hh}px`;
    pin.style.height = `${usable}px`;
  }

  function animate(element, frames, duration = 550) {
    if (reduce.matches || typeof element.animate !== 'function') return;
    const animation = element.animate(frames, {duration, easing:'cubic-bezier(.76,0,.24,1)'});
    running.add(animation);
    animation.finished.then(() => running.delete(animation), () => running.delete(animation));
  }

  function stopAnimations() {
    running.forEach(animation => animation.cancel());
    running.clear();
  }

  function setPage(page) {
    if (!['home','work','studio','contact'].includes(page)) return;
    preview.dataset.page = page;
    film.querySelectorAll('[data-preview-page]').forEach(panel => {
      panel.hidden = panel.dataset.previewPage !== page;
    });
    film.querySelectorAll('[data-sample-page]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.samplePage === page));
    });
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
    targets.forEach((el,index) => {
      const next = el.getBoundingClientRect();
      const start = previous[index];
      if (!start.width || !next.width || !start.height || !next.height) return;
      animate(el,[
        {transformOrigin:'0 0',transform:`translate(${start.left-next.left}px,${start.top-next.top}px) scale(${start.width/next.width},${start.height/next.height})`,opacity:.65},
        {transformOrigin:'0 0',transform:'none',opacity:1}
      ],650);
    });
  }

  function setChapter(next) {
    next = Math.max(0, Math.min(notes.length - 1, next));
    if (next === chapter && film.dataset.initialized) return;
    const focusedNote = notes.find(note => note.contains(document.activeElement));
    stopAnimations();
    chapter = next;
    workspace.dataset.filmStep = String(next);
    film.dataset.initialized = 'true';
    notes.forEach((note,index) => { note.hidden = index !== next; });
    chapters.forEach((button,index) => {
      if (index === next) button.setAttribute('aria-current','step');
      else button.removeAttribute('aria-current');
    });
    document.getElementById('film-number').textContent = String(next + 1).padStart(2,'0');
    if (next === 0 || next === 1 || next === 3 || next === 4) setPage('home');
    setDevice(next === 3 ? 'mobile' : 'desktop');
    animate(notes[next],[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],300);
    if (focusedNote && focusedNote.hidden) chapters[next].focus({preventScroll:true});
  }

  function geometry() {
    const hh = headerHeight();
    const vh = viewportHeight();
    const start = window.scrollY + film.getBoundingClientRect().top - hh;
    const distance = Math.max(1, film.offsetHeight - vh + hh);
    return {start,distance};
  }

  function navigateChapter(next) {
    setChapter(next);
    const {start,distance} = geometry();
    window.scrollTo({top:Math.max(0,start + distance * ((next + .12) / notes.length)),behavior:'auto'});
  }

  function syncScroll() {
    framePending = false;
    const {start,distance} = geometry();
    const progress = Math.max(0,Math.min(1,(window.scrollY - start) / distance));
    setChapter(Math.min(notes.length - 1, Math.floor(progress * notes.length)));
  }

  function requestSync() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(syncScroll);
  }

  chapters.forEach((button,index) => {
    button.addEventListener('click',() => navigateChapter(index));
    button.addEventListener('keydown',event => {
      let next;
      if (event.key === 'ArrowRight') next = Math.min(notes.length - 1,index + 1);
      if (event.key === 'ArrowLeft') next = Math.max(0,index - 1);
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = notes.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      navigateChapter(next);
      chapters[next].focus({preventScroll:true});
    });
  });

  film.querySelectorAll('button[data-direction]').forEach(button => button.addEventListener('click',() => setDirection(button.dataset.direction)));
  film.querySelectorAll('button[data-device]').forEach(button => button.addEventListener('click',() => setDevice(button.dataset.device)));
  film.querySelectorAll('button[data-sample-page]').forEach(button => button.addEventListener('click',() => setPage(button.dataset.samplePage)));

  document.getElementById('apply-revision').addEventListener('click',() => {
    revised = !revised;
    const headline = document.getElementById('arc-headline');
    headline.replaceChildren();
    headline.append(
      document.createTextNode(revised ? 'Coastal homes.' : 'A quieter'),
      document.createElement('br'),
      document.createTextNode(revised ? 'Considered for life.' : 'kind of extraordinary.')
    );
    const button = document.getElementById('apply-revision');
    button.textContent = revised ? 'Compare with original ↗' : 'Apply this revision ↗';
    button.setAttribute('aria-pressed',String(revised));
    document.getElementById('revision-result').textContent = revised
      ? 'Revised: the headline now names the specialty. Only this sample changed.'
      : 'Original restored. You can apply the revision again.';
    animate(headline,[{opacity:.15,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],400);
  });

  const sampleForm = document.getElementById('arc-sample-form');
  sampleForm.addEventListener('submit',event => {
    event.preventDefault();
    document.getElementById('arc-form-result').textContent = 'Enquiry preview complete. Nothing was sent or saved.';
  });
  sampleForm.querySelector('fieldset').disabled = false;

  function configure() {
    film.classList.add('is-enhanced');
    if (reduce.matches) stopAnimations();
    sizeFilm();
    requestSync();
  }

  window.addEventListener('scroll', requestSync, {passive:true});
  window.addEventListener('resize', configure, {passive:true});
  window.visualViewport?.addEventListener('resize', configure, {passive:true});
  window.visualViewport?.addEventListener('scroll', requestSync, {passive:true});
  reduce.addEventListener('change', configure);

  setChapter(0);
  configure();
})();
