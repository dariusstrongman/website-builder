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
  const pinned = window.matchMedia('(min-width: 1100px) and (min-height: 800px) and (prefers-reduced-motion: no-preference)');
  let chapter = 0;
  let revised = false;
  let framePending = false;
  const running = new Set();

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
    if (pinned.matches) {
      const {start,distance} = geometry();
      // Jump directly to the selected chapter; don't animate through intermediates.
      window.scrollTo({top:Math.max(0,start + distance * ((next+.12)/notes.length)),behavior:'instant'});
    }
  }
  function syncScroll() {
    framePending = false;
    if (!pinned.matches) return;
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
  window.addEventListener('scroll',() => {if(!framePending && pinned.matches){framePending=true;window.requestAnimationFrame(syncScroll);}}, {passive:true});
  window.addEventListener('resize',() => {if(!framePending){framePending=true;window.requestAnimationFrame(syncScroll);}}, {passive:true});
  pinned.addEventListener('change',configure);
  reduce.addEventListener('change',configure);
  setChapter(0);
  configure();
})();
