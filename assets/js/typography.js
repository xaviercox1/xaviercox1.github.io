// Navigation fills to a heavy face; the email keeps its travelling width pulse.
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const activeWaves = new Set();
  const controllers = [];
  let frame = 0;
  let previousTime = performance.now();
  const baseWidth = 100;
  const peakWidth = 145;
  const pulseMs = 650;
  const travelMs = 430;
  const cycleMs = pulseMs + travelMs + 500;
  const navigationTravelMs = 140;
  const springSpeed = 42;
  const springDamping = 0.72;
  const navigationRipplePeriodMs = 1000;
  const navigationRippleDurationMs = 320;
  const navigationRippleDepth = 18;

  function stepNavigationSpring(state, index, target, dt) {
    // An exact damped spring keeps fast reversals smooth, even at low frame rates.
    const offset = state.amounts[index] - target;
    const velocity = state.velocities[index];
    const damping = springDamping * springSpeed;
    const frequency = springSpeed * Math.sqrt(1 - springDamping ** 2);
    const decay = Math.exp(-damping * dt);
    const sin = Math.sin(frequency * dt), cos = Math.cos(frequency * dt);
    state.amounts[index] = target + decay * (offset * cos + (velocity + damping * offset) / frequency * sin);
    state.velocities[index] = decay * (velocity * cos - (damping * velocity + springSpeed ** 2 * offset) / frequency * sin);
  }

  function drawLetter(state, letter, index, widthDip = 0) {
    const amount = Math.max(0, Math.min(1, state.amounts[index]));
    letter.style.fontVariationSettings = state.navigation
      ? `"wdth" ${100 + (51 - widthDip) * amount}, "wght" ${400 + 600 * amount}, "GRAD" ${100 * amount}, "opsz" ${14 - 6 * amount}`
      : `"wdth" ${baseWidth + (peakWidth - baseWidth) * amount}`;
    if (state.navigation) {
      // Font axes stop at their maximum; a tiny stretch preserves the spring's
      // overshoot without moving the word's fixed layout anchor.
      const bounce = Math.max(0, state.amounts[index] - 1);
      letter.style.transform = bounce ? `scale(${1 + bounce * 0.55}, ${1 + bounce * 0.2})` : '';
    }
  }

  function tick(now) {
    const dt = Math.min(Math.max((now - previousTime) / 1000, 0), 0.05);
    previousTime = now;
    activeWaves.forEach(state => {
      const elapsed = now - state.start;
      const phase = elapsed % cycleMs;
      let settled = true;
      state.letters.forEach((letter, index) => {
        const position = index / Math.max(state.letters.length - 1, 1);
        const distance = state.origin === 'center' ? Math.abs(position * 2 - 1)
          : state.origin === 'right' ? 1 - position : position;
        const local = (phase - position * travelMs) / pulseMs;
        const target = !state.wanted ? 0 : state.navigation
          ? (elapsed >= distance * navigationTravelMs ? 1 : 0)
          : local > 0 && local < 1 ? Math.sin(Math.PI * local) ** 2 : 0;
        if (state.navigation) stepNavigationSpring(state, index, target, dt);
        else state.amounts[index] += (target - state.amounts[index]) * (1 - Math.exp(-18 * dt));
        const finalAmount = state.wanted ? 1 : 0;
        if (Math.abs(state.amounts[index] - finalAmount) > 0.001 || Math.abs(state.velocities[index]) > 0.01) settled = false;
        // Let the initial spring settle, then pass a width-only dip along
        // the same left / centre / right path once per second.
        const rippleElapsed = elapsed - 700 - distance * navigationTravelMs;
        const ripplePhase = rippleElapsed % navigationRipplePeriodMs;
        const ripple = state.navigation && rippleElapsed >= 0 && ripplePhase < navigationRippleDurationMs
          ? Math.sin(Math.PI * ripplePhase / navigationRippleDurationMs) ** 2 : 0;
        drawLetter(state, letter, index, navigationRippleDepth * ripple);
      });
      if (settled && !state.wanted) {
        state.amounts.fill(0);
        state.velocities.fill(0);
        state.letters.forEach(letter => {
          letter.style.fontVariationSettings = '';
          letter.style.transform = '';
        });
        activeWaves.delete(state);
      }
    });
    frame = activeWaves.size ? requestAnimationFrame(tick) : 0;
  }

  document.querySelectorAll('[data-width-wave]').forEach(element => {
    const text = element.textContent.trim();
    element.setAttribute('aria-label', text);
    const measure = document.createElement('span');
    measure.className = 'width-wave__measure';
    measure.setAttribute('aria-hidden', 'true');
    measure.textContent = text;
    const word = document.createElement('span');
    word.className = 'width-wave__word';
    word.setAttribute('aria-hidden', 'true');
    const letters = Array.from(text, character => {
      const span = document.createElement('span');
      span.className = 'width-wave__letter';
      span.textContent = character;
      word.append(span);
      return span;
    });
    const accessible = document.createElement('span');
    accessible.className = 'width-wave__accessible';
    accessible.textContent = text;
    element.replaceChildren(measure, word, accessible);
    const state = { element, letters, amounts: letters.map(() => 0), velocities: letters.map(() => 0), navigation: element.classList.contains('workshop-nav__item'), origin: element.dataset.waveOrigin || 'left', hovered: false, wanted: false, start: 0 };
    controllers.push(state);
    const sync = () => {
      const wanted = state.hovered || element.matches(':focus-visible');
      if (reducedMotion.matches) {
        state.wanted = wanted;
        activeWaves.delete(state);
        state.amounts.fill(wanted && state.navigation ? 1 : 0);
        state.velocities.fill(0);
        letters.forEach((letter, index) => drawLetter(state, letter, index));
        return;
      }
      if (wanted && !state.wanted) state.start = performance.now();
      state.wanted = wanted;
      activeWaves.add(state);
      if (!frame) {
        previousTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    element.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch') return;
      state.hovered = true;
      sync();
    });
    element.addEventListener('pointerleave', () => { state.hovered = false; sync(); });
    element.addEventListener('focus', sync);
    element.addEventListener('blur', sync);
  });

  reducedMotion.addEventListener('change', () => {
    if (!reducedMotion.matches) return;
    cancelAnimationFrame(frame);
    frame = 0;
    activeWaves.clear();
    controllers.forEach(state => {
      state.wanted = false;
      state.amounts.fill(0);
      state.velocities.fill(0);
      state.letters.forEach(letter => { letter.style.fontVariationSettings = ''; letter.style.transform = ''; });
    });
  });

  const emailButton = document.querySelector('#about-email-copy');
  const notice = document.querySelector('#email-copy-status');
  if (!emailButton || !notice) return;
  const notices = new Set();

  function clearNotice() {
    notices.forEach(entry => {
      clearTimeout(entry.fadeTimer);
      clearTimeout(entry.removeTimer);
      entry.element.remove();
    });
    notices.clear();
  }

  emailButton.addEventListener('click', async () => {
    const email = emailButton.dataset.email;
    let copied = false;
    try {
      await navigator.clipboard.writeText(email);
      copied = true;
    } catch {
      // Keep copy available in browsers that do not expose the Clipboard API.
      const field = document.createElement('textarea');
      field.value = email;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
      document.body.append(field);
      field.select();
      try { copied = document.execCommand('copy'); } catch { /* Report failure below. */ }
      field.remove();
      emailButton.focus({ preventScroll: true });
    }
    if (document.querySelector('#workshop-about').hidden) return;
    const element = document.createElement('span');
    element.className = 'email-copy-status__entry';
    element.textContent = copied ? 'COPIED :)' : 'Please copy the email manually.';
    notice.append(element);
    const entry = { element };
    notices.add(entry);
    entry.fadeTimer = setTimeout(() => element.classList.add('is-fading'), 1000);
    entry.removeTimer = setTimeout(() => {
      element.remove();
      notices.delete(entry);
    }, 1220);
  });
  new MutationObserver(() => {
    if (document.querySelector('#workshop-about').hidden) clearNotice();
  }).observe(document.querySelector('#workshop-about'), { attributes: true, attributeFilter: ['hidden'] });
})();
