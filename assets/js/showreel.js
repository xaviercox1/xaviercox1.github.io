// A readiness-gated perimeter loader above a persistent red video cover.
(() => {
  const target = document.querySelector('.sim-wrapper');
  const plane = target.querySelector('.eye-plane');
  const cover = plane.querySelector('.eye-backdrop');
  const video = plane.querySelector('video');
  const eyeArt = target.querySelector('.eye-art');
  const loader = plane.querySelector('.showreel-loader');
  const stroke = loader.querySelector('.showreel-loader__stroke');
  const wipe = loader.querySelector('.showreel-loader__wipe');
  const playButton = target.querySelector('.showreel-play');
  const about = document.querySelector('#workshop-about');
  // Touch-first devices use the journal's tap-to-load playback model. Decide
  // once so rotating the phone cannot replace its player during playback.
  const nativePlayer = matchMedia('(hover: none), (pointer: coarse), (max-width: 760px)').matches;
  if (nativePlayer) {
    plane.classList.add('is-native-showreel');
    let active = false;
    let requested = false;
    let failed = false;
    video.preload = 'none';
    video.muted = false;
    video.removeAttribute('muted');
    video.setAttribute('aria-label', 'Xavier Cox showreel');

    function syncNativeGeometry() {
      plane.style.setProperty('--showreel-radius', `${parseFloat(getComputedStyle(cover).borderTopLeftRadius) || plane.offsetHeight * 0.035}px`);
    }
    function syncNativePlayer() {
      const visible = active && about.hidden && !document.hidden;
      if (!visible) video.pause();
      plane.classList.toggle('is-showreel', active);
      plane.classList.toggle('has-native-player', requested);
      plane.dataset.showreelState = failed ? 'error' : requested ? 'native' : 'prompt';
      playButton.hidden = !visible || (requested && !failed);
      playButton.textContent = failed ? 'RETRY VIDEO' : 'PLAY VIDEO';
      video.controls = requested;
      video.tabIndex = visible && requested ? 0 : -1;
      video.setAttribute('aria-hidden', String(!visible || !requested));
      if (active) {
        eyeArt.removeAttribute('aria-hidden');
        target.setAttribute('role', 'group');
        target.setAttribute('aria-label', 'Xavier Cox showreel');
        target.removeAttribute('aria-busy');
        target.removeAttribute('aria-disabled');
        target.removeAttribute('tabindex');
        syncNativeGeometry();
      } else eyeArt.setAttribute('aria-hidden', 'true');
    }
    playButton.addEventListener('click', () => {
      // Set the source and call play in this very tap, without awaiting a
      // readiness event or Jeff's animation. iOS retains the user gesture.
      requested = true;
      failed = false;
      video.src = video.dataset.src;
      syncNativePlayer();
      video.play().catch(() => {
        // Native controls remain reachable even if playback is declined.
        syncNativePlayer();
      });
    });
    video.addEventListener('error', () => {
      if (!requested || !video.getAttribute('src')) return;
      failed = true;
      syncNativePlayer();
    });
    window.addEventListener('jeffphasechange', event => {
      if (event.detail.phase === 'complete') active = true;
      else if (event.detail.phase === 'idle') active = false;
      syncNativePlayer();
    });
    new MutationObserver(syncNativePlayer).observe(about, { attributes: true, attributeFilter: ['hidden'] });
    new ResizeObserver(syncNativeGeometry).observe(plane);
    document.addEventListener('visibilitychange', syncNativePlayer);
    window.addEventListener('pagehide', () => video.pause());
    window.jeffWorkshop.setShowreelSource = src => {
      video.pause();
      video.dataset.src = src;
      video.removeAttribute('src');
      video.load();
      requested = failed = false;
      syncNativePlayer();
    };
    window.jeffWorkshop.bufferShowreel = () => {}; // Native controls own buffering.
    window.jeffWorkshop.refreshShowreelGeometry = syncNativeGeometry;
    active = target.dataset.phase === 'complete';
    syncNativePlayer();
    return;
  }
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const minimumLoadMs = 1200;
  const revealDurationMs = 2000;
  const pulsePeriodMs = 2200;
  let active = false;
  let stage = 'idle';
  let progress = 0;
  let startedAt = 0;
  let revealAt = 0;
  let lastFrame = 0;
  let animationFrame = 0;
  let loadVersion = 0;
  let sourceUrl = '';
  let wipeWidth = 0;
  let wipeHeight = 0;

  video.muted = true;
  video.volume = 0.5;
  const homeVisible = () => active && about.hidden && !document.hidden;

  function setStage(next) {
    stage = next;
    plane.dataset.showreelState = next;
    plane.classList.toggle('is-showreel-revealing', next === 'revealing');
    plane.classList.toggle('is-showreel-ready', next === 'ready');
    if (active) {
      target.setAttribute('role', 'group');
      eyeArt.removeAttribute('aria-hidden');
      target.setAttribute('aria-label', next === 'ready' || next === 'revealing' ? 'Xavier Cox showreel' : next === 'error' ? 'Showreel could not load' : 'Loading showreel');
      target.setAttribute('aria-busy', String(next !== 'ready' && next !== 'revealing' && next !== 'error'));
    }
    window.dispatchEvent(new CustomEvent('showreelstatechange', { detail: { stage, active } }));
  }

  function updateWipe() {
    const cx = wipeWidth / 2, cy = wipeHeight / 2;
    if (progress <= 0) {
      wipe.setAttribute('d', 'M 0 0');
    } else if (progress >= 1) {
      wipe.setAttribute('d', `M 0 0 H ${wipeWidth} V ${wipeHeight} H 0 Z`);
    } else {
      // Reveal the perimeter with a rotating radial edge, starting at 12 o'clock.
      const radius = Math.hypot(cx, cy) + 1;
      const angle = progress * Math.PI * 2;
      const x = cx + Math.sin(angle) * radius;
      const y = cy - Math.cos(angle) * radius;
      wipe.setAttribute('d', `M ${cx} ${cy} L ${cx} ${cy - radius} A ${radius} ${radius} 0 ${progress > 0.5 ? 1 : 0} 1 ${x} ${y} Z`);
    }
  }

  function syncGeometry() {
    if (!active) return;
    const width = plane.offsetWidth;
    const height = plane.offsetHeight;
    const expanded = document.fullscreenElement === plane || document.body.classList.contains('is-showreel-expanded');
    const radius = expanded ? 0 : parseFloat(getComputedStyle(cover).borderTopLeftRadius) || height * 0.035;
    const thickness = Math.min(7, Math.max(3, height * 0.014));
    plane.style.setProperty('--showreel-radius', `${radius}px`);
    wipeWidth = width + thickness * 2;
    wipeHeight = height + thickness * 2;
    loader.setAttribute('viewBox', `0 0 ${wipeWidth} ${wipeHeight}`);
    loader.style.cssText = `left:${-thickness}px;top:${-thickness}px;width:${width + thickness * 2}px;height:${height + thickness * 2}px;`;
    const x = thickness / 2, y = thickness / 2;
    const right = x + width + thickness, bottom = y + height + thickness;
    const center = (x + right) / 2;
    // Offset the centreline and corner arcs by half a stroke, placing all of
    // its thickness outside the red cover rather than over its inner edge.
    const strokeRadius = radius + thickness / 2;
    // A clockwise lap begins and closes at the middle of the top edge.
    stroke.setAttribute('d', `M ${center} ${y} H ${right - strokeRadius} A ${strokeRadius} ${strokeRadius} 0 0 1 ${right} ${y + strokeRadius} V ${bottom - strokeRadius} A ${strokeRadius} ${strokeRadius} 0 0 1 ${right - strokeRadius} ${bottom} H ${x + strokeRadius} A ${strokeRadius} ${strokeRadius} 0 0 1 ${x} ${bottom - strokeRadius} V ${y + strokeRadius} A ${strokeRadius} ${strokeRadius} 0 0 1 ${x + strokeRadius} ${y} H ${center} Z`);
    stroke.setAttribute('stroke-width', thickness);
    updateWipe();
  }
  new ResizeObserver(syncGeometry).observe(plane);

  function requestTick() {
    if (!active || animationFrame || stage === 'ready' || stage === 'error') return;
    lastFrame = performance.now();
    animationFrame = requestAnimationFrame(tick);
  }

  function resetLoading() {
    loadVersion++;
    video.pause();
    progress = 0;
    startedAt = performance.now();
    revealAt = 0;
    playButton.hidden = true;
    video.dataset.userPaused = 'false';
    plane.classList.remove('is-showreel-resuming');
    updateWipe();
    plane.dataset.loadingProgress = '0';
    setStage('loading');
    syncGeometry();
    requestTick();
  }

  function loadSource(src) {
    resetLoading(); // Restore the opaque red cover before replacing the clip.
    video.preload = 'auto';
    video.src = src;
    sourceUrl = video.src;
    video.load();
  }

  function playbackReady() {
    return video.readyState >= 3 && video.videoWidth > 0 && video.videoHeight > 0;
  }

  function bufferedFraction() {
    if (!Number.isFinite(video.duration) || !video.duration) return 0;
    let seconds = 0;
    for (let index = 0; index < video.buffered.length; index++) seconds += video.buffered.end(index) - video.buffered.start(index);
    return Math.min(1, seconds / video.duration);
  }

  async function beginReveal() {
    if (!homeVisible() || !['loading', 'buffering', 'blocked'].includes(stage)) return;
    const version = loadVersion;
    setStage('starting');
    playButton.hidden = true;
    try {
      if (video.dataset.userPaused !== 'true') await video.play();
      if (version !== loadVersion) return;
      if (!homeVisible()) {
        video.pause();
        setStage('loading');
        return;
      }
      // play() resolves once playback starts, so a decoded frame is underneath.
      revealAt = performance.now();
      setStage('revealing');
      requestTick();
    } catch {
      if (version !== loadVersion) return;
      if (!homeVisible()) {
        setStage('loading');
        return;
      }
      setStage('blocked');
      playButton.textContent = 'PLAY VIDEO';
      playButton.hidden = !homeVisible();
      requestTick();
    }
  }

  function tick(now) {
    animationFrame = 0;
    if (!active) return;
    const dt = Math.min(Math.max((now - lastFrame) / 1000, 0), 0.05);
    lastFrame = now;
    stroke.style.opacity = reducedMotion.matches ? '1' : String(0.8 + 0.2 * Math.cos((now - startedAt) / pulsePeriodMs * Math.PI * 2));
    if (stage === 'loading' || stage === 'buffering') {
      const elapsed = now - startedAt;
      // Browsers expose buffered playback, not reliable download-byte totals.
      // The visual estimate can approach 92%, but only real readiness unlocks 100%.
      const estimate = 0.85 * (1 - Math.exp(-elapsed / 2800));
      const ready = playbackReady() && !video.seeking && video.dataset.scrubbing !== 'true' && elapsed >= (stage === 'buffering' ? 200 : minimumLoadMs);
      const goal = ready ? 1 : Math.min(0.92, Math.max(estimate, bufferedFraction() * 0.92));
      progress = Math.max(progress, progress + (goal - progress) * (1 - Math.exp(-8 * dt)));
      if (ready && progress > 0.998) {
        progress = 1;
        beginReveal();
      }
      updateWipe();
      plane.dataset.loadingProgress = (progress * 100).toFixed(1);
    } else if (stage === 'revealing' && now - revealAt >= revealDurationMs) {
      setStage('ready');
    }
    requestTick();
  }

  function syncPlayback() {
    if (!homeVisible()) {
      video.pause();
      playButton.hidden = true;
      return;
    }
    if ((stage === 'ready' || stage === 'revealing') && video.dataset.userPaused !== 'true') video.play().catch(() => {
      playButton.textContent = 'PLAY VIDEO';
      playButton.hidden = false;
    });
    else if (stage === 'blocked' || stage === 'error') playButton.hidden = false;
    requestTick();
  }

  function onPhase(phase) {
    if (phase === 'complete') {
      active = true;
      plane.classList.add('is-showreel');
      plane.classList.toggle('is-showreel-resuming', stage === 'ready');
      if (stage === 'idle') loadSource(video.dataset.src);
      else setStage(stage);
      syncGeometry();
      syncPlayback();
    } else if (phase === 'idle') {
      active = false;
      eyeArt.setAttribute('aria-hidden', 'true');
      target.removeAttribute('aria-busy');
      plane.classList.remove('is-showreel');
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      syncPlayback();
      window.dispatchEvent(new CustomEvent('showreelstatechange', { detail: { stage, active } }));
    }
  }

  playButton.addEventListener('click', () => {
    video.dataset.userPaused = 'false';
    if (stage === 'error') loadSource(video.dataset.src);
    else if (stage === 'ready' || stage === 'revealing') {
      video.play().then(() => { playButton.hidden = true; }).catch(() => {});
    } else beginReveal();
  });
  video.addEventListener('loadstart', () => {
    // Also cover a clip replaced directly through the video's src attribute.
    const current = video.currentSrc || video.src;
    if (current !== sourceUrl) {
      sourceUrl = current;
      resetLoading();
    }
  });
  ['progress', 'loadeddata', 'canplay', 'canplaythrough'].forEach(event => video.addEventListener(event, requestTick));
  video.addEventListener('error', () => {
    if (!video.getAttribute('src')) return;
    loadVersion++;
    setStage('error');
    playButton.textContent = 'RETRY VIDEO';
    playButton.hidden = !homeVisible();
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  });
  new MutationObserver(syncPlayback).observe(about, { attributes: true, attributeFilter: ['hidden'] });
  document.addEventListener('visibilitychange', syncPlayback);
  window.addEventListener('jeffphasechange', event => onPhase(event.detail.phase));
  window.jeffWorkshop.setShowreelSource = src => {
    video.dataset.src = src;
    loadSource(src);
  };
  window.jeffWorkshop.bufferShowreel = () => {
    if (!active || !['ready', 'revealing'].includes(stage)) return;
    loadVersion++;
    progress = 0;
    startedAt = performance.now();
    plane.classList.remove('is-showreel-resuming');
    updateWipe();
    plane.dataset.loadingProgress = '0';
    setStage('buffering');
    requestTick();
  };
  window.jeffWorkshop.refreshShowreelGeometry = syncGeometry;
  // Desktop still preloads on page opening; mobile never requests the MP4
  // until its play button is tapped.
  loadSource(video.dataset.src);
  onPhase(target.dataset.phase);
})();
