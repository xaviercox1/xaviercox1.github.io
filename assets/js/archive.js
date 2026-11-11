// The finished showreel turns over in place; scroll intent never moves the scene.
(() => {
  const target = document.querySelector('.sim-wrapper');
  const plane = target.querySelector('.eye-plane');
  const card = plane.querySelector('.showreel-card');
  const front = card.querySelector('.showreel-front');
  const archive = card.querySelector('.archive-face');
  const content = archive.querySelector('.archive-content');
  const heading = archive.querySelector('h1');
  const settings = window.archiveSettings.settings;
  const about = document.querySelector('#workshop-about');
  const video = plane.querySelector('video');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let open = false;
  let turning = false;
  let finishTimer = 0;
  let wheelTotal = 0;
  let lastWheelAt = 0;
  let touchStart = null;
  let focusAfterTurn = false;

  const available = () => target.dataset.phase === 'complete' && about.hidden &&
    !document.fullscreenElement && !document.body.classList.contains('is-showreel-expanded') &&
    !video.webkitDisplayingFullscreen;

  function finishTurn() {
    if (!turning) return;
    clearTimeout(finishTimer);
    turning = false;
    document.body.classList.remove('is-archive-flipping');
    front.inert = open;
    archive.inert = !open;
    front.setAttribute('aria-hidden', String(open));
    archive.setAttribute('aria-hidden', String(!open));
    if (focusAfterTurn && available()) {
      if (open) heading.focus({ preventScroll: true });
      else {
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
      }
    }
  }

  function turn(next, keyboard = false, immediate = false) {
    if (!available() || turning || next === open) return;
    open = next;
    turning = true;
    focusAfterTurn = keyboard || front.contains(document.activeElement) || archive.contains(document.activeElement);
    front.inert = archive.inert = true;
    front.setAttribute('aria-hidden', 'true');
    archive.setAttribute('aria-hidden', 'true');
    if (next) content.scrollTop = 0;
    target.setAttribute('aria-label', next ? 'Xavier Cox project archive' : 'Xavier Cox showreel');
    if (immediate) document.body.classList.add('is-archive-instant');
    document.body.classList.add('is-archive-flipping');
    document.body.classList.toggle('is-archive-open', next);
    if (!next && location.hash === '#archive') history.replaceState(history.state, '', location.pathname + location.search);
    window.dispatchEvent(new CustomEvent('archivechange', { detail: { open: next } }));
    if (immediate) {
      finishTurn();
      // Commit the archive's first frame before enabling later scroll flips.
      requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('is-archive-instant')));
    } else {
      // A timeout also settles the state if a tab is hidden during the transition.
      finishTimer = setTimeout(finishTurn, reducedMotion.matches ? 0 : settings.flipDurationMs + 100);
    }
  }

  card.addEventListener('transitionend', event => {
    if (event.target === card && event.propertyName === 'transform') finishTurn();
  });
  window.addEventListener('archivepreview', () => turn(!open));

  function ignoreInput(element) {
    return element instanceof Element && Boolean(element.closest('input, textarea, select, [contenteditable="true"], .archive-controls'));
  }

  window.addEventListener('wheel', event => {
    if (!available() || event.ctrlKey || ignoreInput(event.target) || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    // A short reverse face scrolls normally on compact screens. Only an upward
    // gesture at its top turns it back over.
    if (open && !turning && archive.contains(event.target) && (event.deltaY > 0 || content.scrollTop > 1)) return;
    event.preventDefault();
    const now = performance.now();
    const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (now - lastWheelAt > 180 || Math.sign(delta) !== Math.sign(wheelTotal)) wheelTotal = 0;
    lastWheelAt = now;
    if (turning) { wheelTotal = 0; return; }
    wheelTotal += delta;
    if ((!open && wheelTotal > settings.scrollThresholdPx) || (open && wheelTotal < -settings.scrollThresholdPx)) {
      turn(!open);
      wheelTotal = 0;
    }
  }, { passive: false });

  window.addEventListener('touchstart', event => {
    touchStart = available() && !ignoreInput(event.target) && event.touches.length === 1
      ? { x: event.touches[0].clientX, y: event.touches[0].clientY, scrollTop: content.scrollTop }
      : null;
  }, { passive: true });
  window.addEventListener('touchmove', event => {
    if (event.touches.length !== 1) touchStart = null;
  }, { passive: true });
  window.addEventListener('touchcancel', () => { touchStart = null; }, { passive: true });
  window.addEventListener('touchend', event => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = touchStart.y - event.changedTouches[0].clientY;
    if (Math.abs(dy) > settings.swipeThresholdPx && Math.abs(dy) > Math.abs(dx) * 1.3) {
      if (!open && dy > 0) turn(true);
      else if (open && dy < 0 && touchStart.scrollTop <= 1) turn(false);
    }
    touchStart = null;
  }, { passive: true });

  document.addEventListener('keydown', event => {
    if (!available() || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || ignoreInput(event.target)) return;
    // Preserve the player's buttons and range-key behavior.
    if (event.target.closest('video, .showreel-controls')) return;
    if (event.key === ' ' && event.target.closest('button, a, video')) return;
    const down = ['ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey);
    const up = ['ArrowUp', 'PageUp', 'Escape'].includes(event.key) || (event.key === ' ' && event.shiftKey);
    if ((!open && down) || (open && up && (event.key === 'Escape' || content.scrollTop <= 1))) {
      event.preventDefault();
      turn(!open, true);
    }
  });

  function syncPhase() {
    const complete = target.dataset.phase === 'complete';
    if (!complete) {
      clearTimeout(finishTimer);
      turning = open = false;
      front.inert = false;
      front.removeAttribute('aria-hidden');
      archive.inert = true;
      archive.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-archive-open', 'is-archive-flipping');
    }
  }
  window.addEventListener('jeffphasechange', syncPhase);
  syncPhase();

  // Back arrows in the restored project pages return to this side of the card.
  if (location.hash === '#archive') {
    window.jeffWorkshop.openHome();
    turn(true, false, true);
  }
})();
