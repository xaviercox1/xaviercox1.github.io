// Quiet controls for the showreel; the existing cover owns loading and buffering.
(() => {
  const plane = document.querySelector('.eye-plane');
  if (plane.classList.contains('is-native-showreel')) return;
  const video = plane.querySelector('video');
  const surface = plane.querySelector('.showreel-surface');
  const controls = plane.querySelector('.showreel-controls');
  const toggle = controls.querySelector('.showreel-toggle');
  const mute = controls.querySelector('.showreel-mute');
  const volume = controls.querySelector('.showreel-volume');
  const volumeWrap = controls.querySelector('.showreel-volume-wrap');
  const seek = controls.querySelector('.showreel-seek');
  const fullscreen = controls.querySelector('.showreel-fullscreen');
  let hasRevealed = false;
  let active = false;
  let scrubbing = false;
  let resumeAfterScrub = false;
  let lastVolume = 0.5;
  let hideTimer = 0;
  let bufferTimer = 0;
  let uiFrame = 0;
  let keyboardNavigation = false;
  const hoverPointer = matchMedia('(hover: hover) and (pointer: fine)');
  // iOS keeps volume under the device buttons; avoid presenting a dead slider.
  const adjustableVolume = Math.abs(video.volume - 0.5) < 0.01;
  volumeWrap.hidden = !adjustableVolume;
  volume.disabled = !adjustableVolume;
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') keyboardNavigation = true;
  });
  document.addEventListener('pointerdown', () => { keyboardNavigation = false; }, true);

  function keyboardControlsFocused() {
    return keyboardNavigation && (Boolean(controls.querySelector(':focus-visible')) || surface.matches(':focus-visible'));
  }

  function hideControls() {
    clearTimeout(hideTimer);
    cancelAnimationFrame(uiFrame);
    uiFrame = 0;
    plane.classList.remove('are-controls-visible');
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    const value = Math.max(0, Math.floor(seconds));
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  }

  function syncTime() {
    const duration = Number.isFinite(video.duration) ? video.duration : 0;
    const position = scrubbing ? Number(seek.value) / 1000 * duration : video.currentTime;
    if (!scrubbing) seek.value = duration ? String(position / duration * 1000) : '0';
    const played = duration ? position / duration * 100 : 0;
    let buffered = played;
    for (let index = 0; index < video.buffered.length; index++) {
      if (video.buffered.start(index) <= position && video.buffered.end(index) >= position) buffered = Math.max(buffered, video.buffered.end(index) / duration * 100);
    }
    seek.style.setProperty('--played', `${played}%`);
    seek.style.setProperty('--buffered', `${Math.min(100, buffered)}%`);
    seek.setAttribute('aria-valuetext', `${formatTime(position)} of ${formatTime(duration)}`);
    seek.disabled = !duration;
  }

  function updateControls() {
    uiFrame = 0;
    syncTime();
    if (active && !video.paused && !document.hidden && plane.classList.contains('are-controls-visible')) uiFrame = requestAnimationFrame(updateControls);
  }

  function showControls() {
    if (!active || controls.hidden) return;
    if (hoverPointer.matches && !plane.matches(':hover') && !keyboardControlsFocused()) {
      hideControls();
      return;
    }
    plane.classList.add('are-controls-visible');
    clearTimeout(hideTimer);
    if (!uiFrame) uiFrame = requestAnimationFrame(updateControls);
    hideTimer = setTimeout(() => {
      if (!scrubbing && !controls.matches(':hover') && !controls.contains(document.activeElement)) plane.classList.remove('are-controls-visible');
    }, 2400);
  }

  function syncSound() {
    const muted = video.muted || video.volume === 0;
    plane.classList.toggle('is-video-muted', muted);
    mute.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video');
    mute.title = muted ? 'Unmute' : 'Mute';
    volume.value = String(Math.round(video.volume * 100));
    volume.style.setProperty('--volume', `${video.volume * 100}%`);
    volume.setAttribute('aria-valuetext', `${volume.value}%`);
    syncPlayState();
  }

  function syncPlayState() {
    plane.classList.toggle('is-video-paused', video.paused);
    toggle.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
    toggle.title = video.paused ? 'Play' : 'Pause';
    surface.setAttribute('aria-label', video.muted || video.volume === 0 ? 'Turn on video sound' : video.paused ? 'Play video' : 'Pause video');
  }

  function openVolume(open) {
    open = open && adjustableVolume;
    plane.classList.toggle('is-volume-open', open);
    volumeWrap.inert = !open;
    showControls();
  }

  function toggleSound() {
    const unmuting = video.muted || video.volume === 0;
    if (unmuting && video.volume === 0) video.volume = lastVolume || 0.5;
    video.muted = !unmuting;
    openVolume(unmuting);
    syncSound();
  }

  function togglePlayback() {
    video.dataset.userPaused = String(!video.paused);
    if (video.paused) video.play().catch(() => {});
    else video.pause();
    syncPlayState();
    showControls();
  }

  surface.addEventListener('click', () => {
    if (video.muted || video.volume === 0) {
      toggleSound();
      if (video.paused && video.dataset.userPaused !== 'true') video.play().catch(() => {});
    } else togglePlayback();
  });
  toggle.addEventListener('click', togglePlayback);
  mute.addEventListener('click', toggleSound);
  volume.addEventListener('input', () => {
    video.volume = Number(volume.value) / 100;
    if (video.volume > 0) lastVolume = video.volume;
    video.muted = video.volume === 0;
    syncSound();
    showControls();
  });

  function startScrub() {
    if (scrubbing) return;
    scrubbing = true;
    video.dataset.scrubbing = 'true';
    resumeAfterScrub = !video.paused;
    video.pause();
    showControls();
  }
  function finishScrub() {
    if (!scrubbing) return;
    scrubbing = false;
    video.dataset.scrubbing = 'false';
    if (resumeAfterScrub && video.dataset.userPaused !== 'true') video.play().catch(() => {});
    syncTime();
    showControls();
  }
  seek.addEventListener('pointerdown', startScrub);
  seek.addEventListener('input', () => {
    if (!Number.isFinite(video.duration)) return;
    video.currentTime = Number(seek.value) / 1000 * video.duration;
    syncTime();
    showControls();
  });
  seek.addEventListener('change', finishScrub);
  window.addEventListener('pointerup', finishScrub);
  window.addEventListener('pointercancel', finishScrub);
  window.addEventListener('blur', finishScrub);

  function maybeBuffer() {
    clearTimeout(bufferTimer);
    if (!active || !hasRevealed) return;
    bufferTimer = setTimeout(() => {
      if (video.readyState < 3 || video.seeking) window.jeffWorkshop.bufferShowreel();
    }, 180);
  }
  video.addEventListener('waiting', maybeBuffer);
  video.addEventListener('seeking', maybeBuffer);
  ['canplay', 'playing', 'seeked'].forEach(event => video.addEventListener(event, () => {
    if (video.readyState >= 3 && !video.seeking) clearTimeout(bufferTimer);
  }));
  ['timeupdate', 'durationchange', 'progress', 'loadedmetadata'].forEach(event => video.addEventListener(event, syncTime));
  video.addEventListener('volumechange', syncSound);
  ['play', 'pause', 'ended'].forEach(event => video.addEventListener(event, () => {
    syncPlayState();
    if (event === 'play') showControls();
  }));
  plane.addEventListener('pointermove', showControls);
  plane.addEventListener('pointerenter', showControls);
  plane.addEventListener('pointerleave', () => {
    if (hoverPointer.matches && !keyboardControlsFocused()) hideControls();
  });
  controls.addEventListener('pointerleave', showControls);
  controls.addEventListener('focusin', showControls);
  controls.addEventListener('focusout', showControls);
  surface.addEventListener('focus', showControls);

  function isFullscreen() {
    return document.fullscreenElement === plane || document.body.classList.contains('is-showreel-expanded') || video.webkitDisplayingFullscreen;
  }
  function syncFullscreen() {
    const full = Boolean(isFullscreen());
    plane.classList.toggle('is-video-fullscreen', full);
    fullscreen.setAttribute('aria-label', full ? 'Exit fullscreen' : 'Enter fullscreen');
    fullscreen.title = full ? 'Exit fullscreen' : 'Fullscreen';
    window.jeffWorkshop.refreshShowreelGeometry();
    showControls();
  }
  async function exitFullscreen() {
    document.body.classList.remove('is-showreel-expanded');
    if (document.fullscreenElement === plane) await document.exitFullscreen().catch(() => {});
    else if (video.webkitDisplayingFullscreen && video.webkitExitFullscreen) video.webkitExitFullscreen();
    syncFullscreen();
  }
  fullscreen.addEventListener('click', async () => {
    if (isFullscreen()) return exitFullscreen();
    try {
      if (plane.requestFullscreen) await plane.requestFullscreen();
      else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
      else document.body.classList.add('is-showreel-expanded');
    } catch {
      document.body.classList.add('is-showreel-expanded');
    }
    syncFullscreen();
  });
  document.addEventListener('fullscreenchange', syncFullscreen);
  ['webkitbeginfullscreen', 'webkitendfullscreen'].forEach(event => video.addEventListener(event, syncFullscreen));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('is-showreel-expanded')) exitFullscreen();
  });

  window.addEventListener('showreelstatechange', event => {
    const state = event.detail;
    active = state.active;
    if (state.stage === 'loading' || state.stage === 'idle') {
      hasRevealed = false;
      scrubbing = false;
      resumeAfterScrub = false;
      video.dataset.scrubbing = 'false';
    }
    if (state.stage === 'ready') hasRevealed = true;
    const interactive = active && hasRevealed && !['idle', 'loading', 'error', 'blocked'].includes(state.stage);
    controls.hidden = surface.hidden = !interactive;
    if (interactive) {
      syncTime();
      syncSound();
      showControls();
    } else {
      clearTimeout(hideTimer);
      clearTimeout(bufferTimer);
      cancelAnimationFrame(uiFrame);
      uiFrame = 0;
      plane.classList.remove('are-controls-visible');
      if (!active) exitFullscreen();
    }
  });
  syncSound();
  syncPlayState();
})();
