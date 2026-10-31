// Gallery and Blog share the same gaze, shake and return-home peek.
(() => {
  const page = document.body.classList.contains('blog-redesign-page') ? 'blog' : 'gallery';
  const main = document.querySelector('.grid-main,.blog-main');
  const nav = document.querySelector('.workshop-nav');
  const topJeff = document.querySelector('.gallery-jeff--top');
  const edgeJeff = document.querySelector('.gallery-jeff--edge');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const layout = [
    [14.3,13.5,.98],[50,12.5,1.03],[85.7,13.5,.98],
    [31.2,31.5,1],[68.8,31.5,1],
    [14.3,49.5,.99],[50,48.5,1.04],[85.7,49.5,.99],
    [31.2,67.5,1],[68.8,67.5,1],
    [14.3,85.5,.98],[50,84.5,1.03],[85.7,85.5,.98],
  ];
  const frames = [
    ['centre',0,0],['left',-1,0],['right',1,0],['up',0,-1],['down',0,1],
    ['leftup',-1,-1],['rightup',1,-1],['leftdown',-1,1],['rightdown',1,1],
    ['slightleftup',-.56,-.52],['slightrightup',.56,-.52],
    ['slightleftdown',-.56,.52],['slightrightdown',.56,.52],
  ].map(([name,x,y]) => ({src:`Content/Jeff/eyes/${name}.webp`,x,y}));
  frames.forEach(frame => { const image = new Image(); image.src = frame.src; });
  const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
  let pointerX = innerWidth / 2, pointerY = innerHeight / 2, pointerActive = false;
  let scrolled = false, leaving = false, initialInvite = 0, scrollFrame = 0;
  let lastFrame = performance.now(), animationFrame = 0, phase = 0;
  const states = [topJeff,edgeJeff].map(button => {
    const square = button.querySelector('.jeff-home__square');
    const eyes = layout.map(([x,y,scale]) => {
      const eye = document.createElement('span'); eye.className = 'jeff-home__eye';
      eye.style.setProperty('--eye-x',`${x}%`); eye.style.setProperty('--eye-y',`${y}%`); eye.style.setProperty('--eye-scale',scale);
      const image = document.createElement('img'); image.src = frames[0].src; image.alt = ''; image.draggable = false;
      eye.append(image); square.append(eye);
      return {image,x:0,y:0,src:frames[0].src};
    });
    const state = {button,motion:button.querySelector('.jeff-home__motion'),eyes,hover:0,idleTimer:0,nearby:false};
    button.addEventListener('pointerenter',event => {
      if (event.pointerType === 'touch' || leaving) return;
      clearTimeout(state.idleTimer); button.classList.add('is-near');
    });
    button.addEventListener('pointerleave',() => schedulePeek(state));
    button.addEventListener('focus',() => clearTimeout(state.idleTimer));
    button.addEventListener('blur',() => schedulePeek(state));
    button.addEventListener('animationend',event => {
      if (event.animationName === 'jeff-invitation') button.classList.remove('is-bouncing');
    });
    button.addEventListener('click',() => returnHome(state));
    return state;
  });
  const activeState = () => states[scrolled ? 1 : 0];

  function schedulePeek(state) {
    clearTimeout(state.idleTimer);
    if (leaving) return;
    state.idleTimer = setTimeout(() => {
      if (state.button.matches(':hover') || state.button.matches(':focus-visible')) return;
      state.button.classList.remove('is-near','is-invited','is-bouncing');
    },2000);
  }
  function invite(state) {
    if (leaving) return;
    state.button.classList.add('is-invited');
    if (!reducedMotion.matches) state.button.classList.add('is-bouncing');
    schedulePeek(state);
  }
  function syncScroll() {
    scrollFrame = 0;
    if (leaving) return;
    const next = scrollY > (scrolled ? 4 : 16);
    if (next === scrolled) return;
    scrolled = next;
    clearTimeout(initialInvite);
    states.forEach(state => {
      clearTimeout(state.idleTimer);
      state.button.classList.remove('is-near','is-invited','is-bouncing');
      state.hover = 0; state.nearby = false;
    });
    document.body.classList.toggle(`is-${page}-scrolled`,scrolled);
    nav.inert = scrolled;
    nav.setAttribute('aria-hidden',String(scrolled));
    topJeff.tabIndex = scrolled ? -1 : 0;
    edgeJeff.inert = !scrolled;
    edgeJeff.tabIndex = scrolled ? 0 : -1;
    edgeJeff.setAttribute('aria-hidden',String(!scrolled));
    if (scrolled) invite(states[1]);
  }
  window.addEventListener('scroll',() => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScroll);
  },{passive:true});
  window.addEventListener('pageshow',event => {
    if (event.persisted) {
      leaving = false;
      document.body.classList.remove(`is-${page}-leaving`);
      main.inert = false;
      nav.inert = scrolled;
      states.forEach(state => {
        state.button.disabled = false;
        state.button.classList.remove('is-retreating');
      });
      cancelAnimationFrame(animationFrame);
      lastFrame = performance.now();
      animationFrame = requestAnimationFrame(tick);
    }
    syncScroll();
  });
  window.addEventListener('pointermove',event => {
    if (event.pointerType === 'touch' || leaving) return;
    pointerX = event.clientX; pointerY = event.clientY; pointerActive = true;
    const state = activeState();
    const rect = state.button.getBoundingClientRect();
    const anchorX = scrolled ? 0 : rect.left + rect.width / 2;
    const anchorY = scrolled ? rect.top + rect.height / 2 : 0;
    const nearby = Math.hypot(pointerX-anchorX,pointerY-anchorY) < 130;
    if (nearby && !state.nearby) { state.button.classList.add('is-near'); schedulePeek(state); }
    state.nearby = nearby;
  },{passive:true});
  function leavePointer() { pointerActive = false; states.forEach(state => { state.nearby = false; schedulePeek(state); }); }
  document.addEventListener('mouseleave',leavePointer);
  window.addEventListener('blur',leavePointer);

  function tick(now) {
    animationFrame = 0;
    if (document.hidden || leaving) return;
    const dt = Math.min(Math.max((now-lastFrame)/1000,0),.05); lastFrame = now;
    phase += dt * 1.5 * Math.PI * 2;
    const state = activeState();
    const hovered = state.button.matches(':hover') || state.button.matches(':focus-visible');
    state.hover += ((hovered ? 1 : 0)-state.hover) * (1-Math.exp(-3*dt/.9));
    const strength = reducedMotion.matches ? 0 : .6 * state.hover;
    const x = (Math.sin(phase)*.7+Math.sin(phase*1.7)*.3)*strength;
    const y = (Math.cos(phase*1.3)*.7+Math.sin(phase*2.1)*.3)*strength;
    state.motion.style.transform = `translate(${x.toFixed(3)}px,${y.toFixed(3)}px)`;
    const range = state.button.offsetWidth * 1.5;
    state.eyes.forEach(eye => {
      const rect = eye.image.getBoundingClientRect();
      const tx = pointerActive ? clamp((pointerX-rect.left-rect.width*.5)/range,-1,1) : 0;
      const ty = pointerActive ? clamp((pointerY-rect.top-rect.height*.347)/range,-1,1) : 0;
      const follow = 1-Math.exp(-6*dt);
      eye.x += (tx-eye.x)*follow; eye.y += (ty-eye.y)*follow;
      let nearest = frames[0], distance = Infinity;
      frames.forEach(frame => {
        const d = (frame.x-eye.x)**2+(frame.y-eye.y)**2;
        if (d < distance) { nearest = frame; distance = d; }
      });
      if (nearest.src !== eye.src) { eye.image.src = nearest.src; eye.src = nearest.src; }
    });
    animationFrame = requestAnimationFrame(tick);
  }
  document.addEventListener('visibilitychange',() => {
    cancelAnimationFrame(animationFrame);
    if (!document.hidden && !leaving) { lastFrame = performance.now(); animationFrame = requestAnimationFrame(tick); }
  });
  function returnHome(state) {
    if (leaving) return;
    leaving = true;
    main.querySelectorAll('video').forEach(video => video.pause());
    clearTimeout(initialInvite); states.forEach(s => clearTimeout(s.idleTimer));
    cancelAnimationFrame(animationFrame);
    state.button.classList.remove('is-bouncing');
    state.button.classList.add('is-retreating');
    states.forEach(s => { s.button.disabled = true; });
    document.body.classList.add(`is-${page}-leaving`);
    nav.inert = true; main.inert = true;
    setTimeout(() => {
      try { sessionStorage.setItem('xavier-workshop-return-home',page); } catch { /* Navigation remains available. */ }
      location.href = 'index.html';
    },reducedMotion.matches ? 0 : 900);
  }
  initialInvite = setTimeout(() => { if (!scrolled) invite(states[0]); },3000);
  syncScroll();
  animationFrame = requestAnimationFrame(tick);
})();
