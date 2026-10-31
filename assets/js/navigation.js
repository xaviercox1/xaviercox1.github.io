// Navigation starts revealing as the showreel surface begins its incoming turn.
(() => {
  const nav = document.querySelector('.workshop-nav');
  const labels = [...nav.querySelectorAll('.workshop-nav__item')];
  const about = document.querySelector('#workshop-about');
  const aboutButton = document.querySelector('#workshop-about-toggle');
  const scene = document.querySelector('.home-scene');
  const homeJeff = document.querySelector('#jeff-home');
  const aboutContent = document.querySelector('.about-content');
  const portrait = about.querySelector('.about-portrait');
  const homeJeffMotion = homeJeff.querySelector('.jeff-home__motion');
  const miniEyes = [];
  const desktopMotion = matchMedia('(min-width: 761px) and (hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let timers = [];
  let navigationReady = false;
  let revealVersion = 0;
  let returningHome = false;
  let aboutRevealFrame = 0;
  let aboutMotionStart = 0;
  let jeffInviteTimer = 0;
  let jeffIdleTimer = 0;
  let jeffPointerNearby = false;

  // Match Jeff's rotation axes, cursor response and idle orbit at half strength.
  const aboutRotationStrength = 0.5;
  let rotationFrame = 0;
  let lastRotationFrame = 0;
  let rotationX = 0, rotationY = 0, rotationZ = 0;
  let pointerX = innerWidth / 2, pointerY = innerHeight / 2;
  let pointerActive = false;
  let miniShakePhase = 0, miniHoverBlend = 0;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function scheduleJeffPeek() {
    clearTimeout(jeffIdleTimer);
    if (about.hidden || returningHome) return;
    jeffIdleTimer = setTimeout(() => {
      if (about.hidden || returningHome || homeJeff.matches(':hover') || homeJeff.matches(':focus-visible')) return;
      homeJeff.classList.remove('is-near', 'is-invited', 'is-bouncing');
    }, 2000);
  }

  homeJeff.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    clearTimeout(jeffIdleTimer);
    homeJeff.classList.add('is-near');
  });
  homeJeff.addEventListener('pointerleave', scheduleJeffPeek);
  homeJeff.addEventListener('focus', () => clearTimeout(jeffIdleTimer));
  homeJeff.addEventListener('blur', scheduleJeffPeek);

  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerActive = true;
    if (!about.hidden && !returningHome) {
      const rect = portrait.getBoundingClientRect();
      const mobile = innerWidth <= 760;
      const anchorX = mobile ? rect.left + rect.width * 0.2 : rect.left;
      const anchorY = mobile ? rect.top : rect.top + rect.height * 0.5;
      const distance = Math.hypot(event.clientX - anchorX, event.clientY - anchorY);
      const nearby = distance < 150;
      if (nearby && !jeffPointerNearby) {
        homeJeff.classList.add('is-near');
        scheduleJeffPeek();
      }
      jeffPointerNearby = nearby;
    }
  });
  document.addEventListener('mouseleave', () => { pointerActive = false; jeffPointerNearby = false; scheduleJeffPeek(); });
  window.addEventListener('blur', () => { pointerActive = false; jeffPointerNearby = false; scheduleJeffPeek(); });

  function animateAbout(now) {
    if (about.hidden) {
      aboutContent.style.transform = '';
      rotationFrame = 0;
      return;
    }
    const dt = Math.min(Math.max((now - lastRotationFrame) / 1000, 0), 0.05);
    lastRotationFrame = now;
    updateMiniJeff(dt);
    if (!desktopMotion.matches || reducedMotion.matches) {
      aboutContent.style.transform = '';
      rotationFrame = requestAnimationFrame(animateAbout);
      return;
    }
    const rect = aboutContent.getBoundingClientRect();
    const nx = pointerActive ? clamp((pointerX - rect.left - rect.width * 0.5) / (rect.width * 0.85), -1, 1) : 0;
    const ny = pointerActive ? clamp((pointerY - rect.top - rect.height * 0.347) / (rect.height * 0.85), -1, 1) : 0;
    const time = now * 0.001;
    // Finish the blur before gently introducing the group's cursor rotation.
    const motionProgress = clamp((now - aboutMotionStart) / 600, 0, 1);
    const strength = aboutRotationStrength * motionProgress * motionProgress * (3 - 2 * motionProgress);
    const targetX = (Math.cos(time * 0.41) * 3.2 - ny * 16) * strength;
    const targetY = (Math.sin(time * 0.38) * 4.1 + nx * 19) * strength;
    const targetZ = (Math.sin(time * 0.25) * 4.8 - nx * 4.2 + ny * 2.6) * strength;
    const blend = 1 - Math.exp(-0.8 * window.jeffWorkshop.settings.jeffRotationSpeed * dt);
    rotationX += (targetX - rotationX) * blend;
    rotationY += (targetY - rotationY) * blend;
    rotationZ += (targetZ - rotationZ) * blend;
    aboutContent.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ}deg)`;
    rotationFrame = requestAnimationFrame(animateAbout);
  }

  function startAboutMotion() {
    cancelAnimationFrame(rotationFrame);
    rotationX = rotationY = rotationZ = 0;
    lastRotationFrame = performance.now();
    aboutContent.style.transform = '';
    if (!about.hidden) rotationFrame = requestAnimationFrame(animateAbout);
  }
  desktopMotion.addEventListener('change', startAboutMotion);
  reducedMotion.addEventListener('change', startAboutMotion);

  function reveal(elements, stagger = 120) {
    elements.forEach(element => {
      element.classList.remove('is-visible');
      element.classList.add('reveal');
    });
    const version = revealVersion;
    // Let the original .reveal starting styles render before applying visibility.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (version !== revealVersion) return;
      elements.forEach((element, index) => {
        const show = () => element.classList.add('is-visible');
        if (reducedMotion.matches) show();
        else timers.push(setTimeout(show, index * stagger));
      });
    }));
  }

  // Reuse Jeff's eye layout and gaze artwork for the smaller return control.
  const miniSquare = homeJeff.querySelector('.jeff-home__square');
  document.querySelectorAll('[data-workshop-eyes] .eye-stack').forEach(source => {
    const eye = document.createElement('span');
    eye.className = 'jeff-home__eye';
    for (const property of ['--eye-x', '--eye-y', '--eye-scale']) {
      eye.style.setProperty(property, source.style.getPropertyValue(property));
    }
    const image = document.createElement('img');
    image.src = source.querySelector('img').src;
    image.alt = '';
    image.draggable = false;
    eye.append(image);
    miniSquare.append(eye);
    miniEyes.push({ image, x: 0, y: 0, src: image.src });
  });

  function updateMiniJeff(dt) {
    const settings = window.jeffWorkshop.settings;
    const hovered = !returningHome && (homeJeff.matches(':hover') || homeJeff.matches(':focus-visible'));
    const blend = settings.hoverTransitionMs === 0 ? 1 : 1 - Math.exp(-3 * dt / (settings.hoverTransitionMs / 1000));
    miniHoverBlend += ((hovered ? 1 : 0) - miniHoverBlend) * blend;
    miniShakePhase += dt * settings.shakeSpeedHz * 0.5 * Math.PI * 2;
    const strength = reducedMotion.matches ? 0 : settings.shakeAmountPx * 0.3 * miniHoverBlend;
    const x = (Math.sin(miniShakePhase) * 0.7 + Math.sin(miniShakePhase * 1.7) * 0.3) * strength;
    const y = (Math.cos(miniShakePhase * 1.3) * 0.7 + Math.sin(miniShakePhase * 2.1) * 0.3) * strength;
    homeJeffMotion.style.transform = `translate(${x.toFixed(3)}px, ${y.toFixed(3)}px)`;
    const range = homeJeff.offsetWidth * 1.5;
    miniEyes.forEach(eye => {
      const rect = eye.image.getBoundingClientRect();
      const targetX = pointerActive ? clamp((pointerX - rect.left - rect.width * 0.5) / range, -1, 1) : 0;
      const targetY = pointerActive ? clamp((pointerY - rect.top - rect.height * 0.347) / range, -1, 1) : 0;
      const follow = 1 - Math.exp(-6 * dt);
      eye.x += (targetX - eye.x) * follow;
      eye.y += (targetY - eye.y) * follow;
      const src = window.jeffWorkshop.eyeFrameForLook(eye.x, eye.y);
      if (src !== eye.src) {
        eye.image.src = src;
        eye.src = src;
      }
    });
  }

  function showNavigation(immediate = false) {
    navigationReady = true;
    nav.hidden = false;
    nav.inert = false;
    if (immediate) {
      revealVersion++;
      timers.forEach(clearTimeout);
      timers = [];
      labels.forEach(label => label.classList.remove('reveal', 'is-visible'));
    } else reveal(labels);
  }

  function returnToHome() {
    if (returningHome || about.hidden) return;
    returningHome = true;
    clearTimeout(jeffInviteTimer);
    clearTimeout(jeffIdleTimer);
    homeJeff.classList.remove('is-bouncing');
    cancelAnimationFrame(rotationFrame);
    // Restore the shared reveal rules before reversing them for the page exit.
    labels.forEach(label => label.classList.add('reveal', 'is-visible'));
    void nav.offsetWidth;
    homeJeff.classList.add('is-retreating');
    homeJeff.disabled = true;
    about.inert = true;
    nav.inert = true;
    document.body.classList.add('is-returning-home');
    setTimeout(() => {
      if (!reducedMotion.matches) {
        scene.classList.add('is-return-revealing');
        scene.addEventListener('animationend', () => scene.classList.remove('is-return-revealing'), { once: true });
      }
      window.jeffWorkshop.openHome();
      showNavigation(true);
      document.body.classList.remove('is-returning-home');
      reveal(labels);
      about.inert = false;
      homeJeff.disabled = false;
      homeJeff.classList.remove('is-retreating', 'is-near');
      returningHome = false;
      aboutButton.focus({ preventScroll: true });
    }, reducedMotion.matches ? 0 : 900);
  }
  homeJeff.addEventListener('click', returnToHome);

  function closeAbout(restoreFocus = true) {
    cancelAnimationFrame(aboutRevealFrame);
    clearTimeout(jeffInviteTimer);
    clearTimeout(jeffIdleTimer);
    jeffPointerNearby = false;
    about.hidden = true;
    homeJeff.hidden = true;
    homeJeff.classList.remove('is-near', 'is-invited', 'is-bouncing');
    cancelAnimationFrame(rotationFrame);
    rotationFrame = 0;
    aboutContent.style.transform = '';
    document.body.classList.remove('is-about-open');
    aboutButton.setAttribute('aria-expanded', 'false');
    scene.inert = false;
    scene.removeAttribute('aria-hidden');
    if (restoreFocus) aboutButton.focus({ preventScroll: true });
  }

  aboutButton.addEventListener('click', () => {
    if (returningHome) return;
    if (!about.hidden) {
      closeAbout();
      return;
    }
    const panels = [...about.querySelectorAll('[data-about-reveal]')];
    // Reset while hidden, then commit the starting styles before fading in.
    panels.forEach(panel => {
      panel.classList.add('reveal');
      panel.classList.remove('is-visible');
    });
    about.hidden = false;
    homeJeff.hidden = false;
    about.scrollTop = 0;
    document.body.classList.add('is-about-open');
    aboutMotionStart = performance.now() + (reducedMotion.matches ? 0 : 900);
    startAboutMotion();
    aboutButton.setAttribute('aria-expanded', 'true');
    scene.inert = true;
    scene.setAttribute('aria-hidden', 'true');
    void about.offsetHeight;
    aboutRevealFrame = requestAnimationFrame(() => {
      if (!about.hidden && !returningHome) panels.forEach(panel => panel.classList.add('is-visible'));
    });
    clearTimeout(jeffInviteTimer);
    jeffInviteTimer = setTimeout(() => {
      if (about.hidden || returningHome) return;
      const alreadyOut = homeJeff.classList.contains('is-near') || homeJeff.matches(':focus-visible');
      homeJeff.classList.add('is-invited');
      if (!alreadyOut && !reducedMotion.matches) homeJeff.classList.add('is-bouncing');
      scheduleJeffPeek();
    }, 3000);
    document.querySelector('#about-name').focus({ preventScroll: true });
  });
  homeJeff.addEventListener('animationend', event => {
    if (event.animationName === 'jeff-invitation') homeJeff.classList.remove('is-bouncing');
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !about.hidden && !returningHome) closeAbout();
  });

  function onPhase(phase) {
    if ((phase === 'entering' || phase === 'complete') && !navigationReady) {
      showNavigation();
    } else if (phase === 'idle') {
      navigationReady = false;
      revealVersion++;
      timers.forEach(clearTimeout);
      timers = [];
      closeAbout(false);
      nav.hidden = true;
      nav.inert = true;
      labels.forEach(label => label.classList.remove('reveal', 'is-visible'));
    }
  }
  window.addEventListener('jeffphasechange', event => onPhase(event.detail.phase));
  // A page load always starts with Jeff alone. Returning from About uses the
  // completed surface above, so it brings navigation back without replaying Jeff.
  onPhase(document.querySelector('.sim-wrapper').dataset.phase);
  // A one-use return from gallery Jeff resumes the completed homepage. A later
  // refresh still starts with the original Jeff introduction.
  window.addEventListener('DOMContentLoaded', () => {
    let fromGallery = false;
    try {
      fromGallery = ['gallery','blog'].includes(sessionStorage.getItem('xavier-workshop-return-home'));
      sessionStorage.removeItem('xavier-workshop-return-home');
    } catch { /* The regular homepage remains available without storage. */ }
    const openAbout = location.hash === '#about';
    if (openAbout) history.replaceState(history.state,'',location.pathname + location.search);
    if (!fromGallery && !openAbout) return;
    if (!openAbout) {
      scene.classList.add('is-return-revealing');
      scene.addEventListener('animationend', () => scene.classList.remove('is-return-revealing'), { once:true });
    }
    window.jeffWorkshop.openHome();
    if (openAbout) aboutButton.click();
  }, { once:true });
})();
