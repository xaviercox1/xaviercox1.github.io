// Project the raised lettering onto the red face from a mouse-following light.
(() => {
  const archive = document.querySelector('.archive-face');
  const content = archive.querySelector('.archive-content');
  const scene = document.querySelector('.home-scene');
  const settings = window.archiveSettings.settings;
  const editing = new URLSearchParams(location.search).get('edit') === '1';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const shadow = document.createElement('div');
  shadow.className = 'archive-shadow';
  shadow.setAttribute('aria-hidden', 'true');
  shadow.inert = true;
  const lettering = document.createElement('div');
  lettering.className = 'archive-shadow-content';
  for (const child of content.children) lettering.append(child.cloneNode(true));
  lettering.querySelectorAll('[id], [tabindex], a').forEach(element => {
    element.removeAttribute('id');
    element.removeAttribute('tabindex');
    element.removeAttribute('href');
  });
  shadow.append(lettering);
  archive.append(shadow);

  let indicator = null;
  let frame = 0;
  let chain = [];
  let pointer = null;
  let lightPosition = null;
  let lastUpdate = null;

  function active() {
    return settings.lightEnabled && !document.hidden && !archive.inert &&
      document.body.classList.contains('is-archive-open') &&
      !document.body.classList.contains('is-archive-flipping') &&
      !document.body.classList.contains('is-about-open');
  }

  function offset(element) {
    let x = 0, y = 0;
    for (let current = element; current; current = current.offsetParent) {
      x += current.offsetLeft;
      y += current.offsetTop;
      if (current.offsetParent) {
        x += current.offsetParent.clientLeft;
        y += current.offsetParent.clientTop;
      }
    }
    return { x, y };
  }

  function rebuild() {
    chain = [];
    for (let element = archive; element && element !== scene; element = element.parentElement) {
      const parent = element.parentElement;
      if (!parent) break;
      const position = offset(element), parentPosition = offset(parent);
      const style = getComputedStyle(element);
      const origin = style.transformOrigin.split(' ').map(parseFloat);
      let perspective = new DOMMatrix();
      // The scene's final projection belongs to the viewer, not the light rays.
      if (parent !== scene) {
        const parentStyle = getComputedStyle(parent);
        const distance = parseFloat(parentStyle.perspective);
        if (distance > 0) {
          const [x, y] = parentStyle.perspectiveOrigin.split(' ').map(parseFloat);
          const projection = new DOMMatrix();
          projection.m34 = -1 / distance;
          perspective = new DOMMatrix().translate(x, y).multiply(projection).translate(-x, -y);
        }
      }
      chain.push({ transform: style.transform, x: position.x - parentPosition.x, y: position.y - parentPosition.y, origin, perspective });
    }
  }

  function surfaceMatrix() {
    let matrix = new DOMMatrix();
    for (const { transform, x, y, origin, perspective } of chain) {
      const rotation = transform === 'none' ? new DOMMatrix() : new DOMMatrix(transform);
      const [ox = 0, oy = 0, oz = 0] = origin;
      const local = new DOMMatrix().translate(x, y).translate(ox, oy, oz)
        .multiply(rotation).translate(-ox, -oy, -oz);
      matrix = perspective.multiply(local).multiply(matrix);
    }
    return matrix;
  }

  function update() {
    if (!active()) return;
    // Use this frame's full pose, including moving origins and nested perspective.
    // The light follows the pointer in view space, independently of card rotation.
    rebuild();
    const style = getComputedStyle(scene);
    const perspective = parseFloat(style.perspective);
    const [cx, cy] = style.perspectiveOrigin.split(' ').map(parseFloat);
    const amount = settings.lightFollowAmountPercent / 100;
    const target = {
      x: innerWidth / 2 + ((pointer?.x ?? innerWidth / 2) - innerWidth / 2) * amount + settings.lightOffsetXPx,
      y: innerHeight / 2 + ((pointer?.y ?? innerHeight / 2) - innerHeight / 2) * amount + settings.lightOffsetYPx,
    };
    const now = performance.now();
    const elapsed = lastUpdate === null ? 1000 / 60 : Math.max(0, now - lastUpdate);
    lastUpdate = now;
    const blend = settings.lightSmoothingMs > 0 && !reducedMotion.matches
      ? 1 - Math.exp(-elapsed / settings.lightSmoothingMs) : 1;
    if (!lightPosition) lightPosition = { ...target };
    lightPosition.x += (target.x - lightPosition.x) * blend;
    lightPosition.y += (target.y - lightPosition.y) * blend;
    const { x: sx, y: sy } = lightPosition;
    if (indicator) {
      indicator.style.left = `${sx}px`;
      indicator.style.top = `${sy}px`;
    }
    const depth = settings.lightDepthPx;
    // Unproject the light's screen position at the chosen depth towards the viewer.
    const factor = perspective > 0 ? 1 - depth / perspective : 1;
    const light = new DOMPoint(cx + (sx - cx) * factor, cy + (sy - cy) * factor, depth)
      .matrixTransform(surfaceMatrix().inverse());
    const lx = light.x / light.w, ly = light.y / light.w, lz = light.z / light.w;
    window.dispatchEvent(new CustomEvent('archivelightframe', { detail: { x: lx, y: ly, z: lz } }));
    const gap = lz - settings.textDepthPx;
    if (!(gap > .01) || !Number.isFinite(lz)) { shadow.hidden = true; return; }
    // A ray through a glyph at z=textDepth hits the canvas at z=0.
    const scale = lz / gap;
    const x = (1 - scale) * lx, y = (1 - scale) * ly;
    if (![scale, x, y].every(Number.isFinite)) { shadow.hidden = true; return; }
    shadow.hidden = false;
    shadow.style.opacity = Math.min(1, Math.max(0, settings.textShadowOpacityPercent / 100));
    lettering.style.width = `${content.clientWidth}px`;
    lettering.style.filter = `blur(${Math.max(0, settings.textShadowBlurPx)}px)`;
    lettering.style.transform = `translate(${x}px, ${y}px) scale(${scale}) translate(${-content.scrollLeft}px, ${-content.scrollTop}px)`;
  }

  function animate() {
    frame = 0;
    if (!active()) return;
    update();
    if (!reducedMotion.matches) frame = requestAnimationFrame(animate);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastUpdate = null;
    shadow.hidden = !active();
    if (!active()) window.dispatchEvent(new CustomEvent('archivelightframe', { detail: null }));
    if (indicator) indicator.hidden = !active() || !settings.lightShowIndicator;
    if (active()) animate();
  }

  if (editing) {
    indicator = document.createElement('div');
    indicator.className = 'archive-light-indicator';
    indicator.textContent = '+';
    indicator.setAttribute('aria-hidden', 'true');
    indicator.hidden = true;
    document.body.append(indicator);
  }

  window.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch') return;
    pointer = { x: event.clientX, y: event.clientY };
    if (reducedMotion.matches && active()) update();
  }, { passive: true });

  window.addEventListener('archivelightchange', sync);
  window.addEventListener('archivechange', sync);
  window.addEventListener('jeffphasechange', sync);
  window.addEventListener('resize', sync);
  document.addEventListener('visibilitychange', sync);
  content.addEventListener('scroll', update, { passive: true });
  reducedMotion.addEventListener('change', sync);
  new ResizeObserver(sync).observe(archive);
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  sync();
})();
