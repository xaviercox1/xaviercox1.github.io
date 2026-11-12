// Invite a click only while the original, unopened Jeff introduction is idle.
(() => {
  const target = document.querySelector('.sim-wrapper');
  const prompt = target?.querySelector('.jeff-click-prompt');
  if (!prompt) return;

  let due = false;
  let dismissed = target.dataset.phase !== 'idle';
  let fadeTimer = 0;
  const timer = setTimeout(() => {
    due = true;
    syncPrompt();
  }, 7000);

  function hidePrompt(immediate = false) {
    prompt.classList.remove('is-visible');
    clearTimeout(fadeTimer);
    if (immediate || prompt.paused) prompt.pause();
    else fadeTimer = setTimeout(() => prompt.pause(), 100);
  }

  function syncPrompt() {
    if (dismissed || !due || document.hidden || target.dataset.phase !== 'idle') {
      hidePrompt(document.hidden);
      return;
    }
    prompt.muted = true;
    clearTimeout(fadeTimer);
    prompt.classList.add('is-visible');
    prompt.play().catch(() => { /* Muted inline autoplay may be restricted. */ });
  }

  window.addEventListener('jeffphasechange', event => {
    if (event.detail.phase !== 'idle') {
      dismissed = true;
      clearTimeout(timer);
    }
    syncPrompt();
  });
  document.addEventListener('visibilitychange', syncPrompt);
  window.addEventListener('pagehide', () => hidePrompt(true));
  window.addEventListener('pageshow', syncPrompt);
  if (new URLSearchParams(location.search).get('edit') === '1') {
    window.addEventListener('jeffpromptpreview', () => {
      dismissed = false;
      due = true;
      clearTimeout(timer);
      syncPrompt();
    });
  }
})();
