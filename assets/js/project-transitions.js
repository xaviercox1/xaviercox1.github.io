// Archived projects use the same exit timing as the gallery and journal.
(() => {
  const body = document.body;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const originalInert = body.inert;
  let leaving = false;
  let timer = 0;

  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin || !/\.html?$|\/$/i.test(destination.pathname)) return;
    // Keep Microcosm's interface switches and other same-page anchors immediate.
    if (destination.pathname === location.pathname && destination.search === location.search) return;
    event.preventDefault();
    if (leaving) return;
    leaving = true;
    document.querySelectorAll('video,audio').forEach(media => media.pause());
    body.classList.add('is-project-leaving');
    body.inert = true;
    timer = setTimeout(() => {
      if (destination.pathname.endsWith('/index.html') && destination.hash === '#archive') {
        try { sessionStorage.setItem('xavier-workshop-return-archive', '1'); } catch { /* Navigation remains available. */ }
      }
      location.assign(destination.href);
    }, reducedMotion.matches ? 0 : 900);
  });

  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    clearTimeout(timer);
    leaving = false;
    body.inert = originalInert;
    body.classList.remove('is-project-leaving');
  });
})();
