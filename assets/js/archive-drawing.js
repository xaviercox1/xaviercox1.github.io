// Mouse marks live on the reverse face and redraw as a low-frame-rate sketch.
(() => {
  const archive = document.querySelector('.archive-face');
  const settings = window.archiveSettings.settings;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const layer = document.createElement('div');
  layer.className = 'archive-drawing';
  layer.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  layer.append(canvas);
  // Projected corners let the pen stay under the cursor as the 3D card tilts.
  const corners = [[0, 0], [100, 0], [100, 100], [0, 100]].map(([x, y]) => {
    const corner = document.createElement('span');
    corner.className = 'archive-drawing__corner';
    corner.style.left = `${x}%`;
    corner.style.top = `${y}%`;
    layer.append(corner);
    return corner;
  });
  archive.prepend(layer);
  const context = canvas.getContext('2d');
  if (!context) { layer.remove(); return; }
  let width = 0;
  let height = 0;
  let points = [];
  let lastPoint = null;
  let timer = 0;
  let frame = 0;

  function active() {
    return settings.drawingEnabled && !document.hidden && !archive.inert &&
      document.body.classList.contains('is-archive-open') &&
      !document.body.classList.contains('is-about-open') &&
      !document.body.classList.contains('is-archive-flipping');
  }

  function stop() {
    clearTimeout(timer);
    timer = 0;
    lastPoint = null;
  }

  // Invert the quadrilateral's projective map, including perspective distortion.
  function localPoint(clientX, clientY) {
    const [a, b, c, d] = corners.map(corner => corner.getBoundingClientRect());
    const dx1 = b.x - c.x, dx2 = d.x - c.x;
    const dy1 = b.y - c.y, dy2 = d.y - c.y;
    const dx3 = a.x - b.x + c.x - d.x;
    const dy3 = a.y - b.y + c.y - d.y;
    const determinant = dx1 * dy2 - dx2 * dy1;
    if (Math.abs(determinant) < .001) return null;
    const g = (dx3 * dy2 - dx2 * dy3) / determinant;
    const h = (dx1 * dy3 - dx3 * dy1) / determinant;
    const ax = b.x - a.x + g * b.x, bx = d.x - a.x + h * d.x;
    const ay = b.y - a.y + g * b.y, by = d.y - a.y + h * d.y;
    const aa = ax - clientX * g, bb = bx - clientX * h;
    const cc = ay - clientY * g, dd = by - clientY * h;
    const det = aa * dd - bb * cc;
    if (Math.abs(det) < .001) return null;
    const x = ((clientX - a.x) * dd - bb * (clientY - a.y)) / det;
    const y = (aa * (clientY - a.y) - (clientX - a.x) * cc) / det;
    return x >= 0 && x <= 1 && y >= 0 && y <= 1 ? { x, y } : null;
  }

  function trim(now) {
    const lifetime = settings.drawingLifetimeSeconds * 1000;
    if (lifetime) points = points.filter(point => now - point.time < lifetime);
    const excess = points.length - Math.round(settings.drawingMaxPoints);
    if (excess > 0) points.splice(0, excess);
  }

  function noise(seed) {
    const value = Math.sin(seed * 127.1 + frame * 311.7) * 43758.5453;
    return (value - Math.floor(value)) * 2 - 1;
  }

  function render() {
    trim(performance.now());
    context.clearRect(0, 0, width, height);
    if (!settings.drawingEnabled || !points.length) return;
    const passes = Math.round(settings.drawingPasses);
    context.strokeStyle = settings.drawingColor;
    context.lineWidth = settings.drawingWidthPx;
    context.lineCap = context.lineJoin = 'round';
    // Keep overlapping sketch passes from becoming fully opaque.
    context.globalAlpha = 1 - (1 - settings.drawingOpacityPercent / 100) ** (1 / passes);
    for (let pass = 0; pass < passes; pass++) {
      context.beginPath();
      for (const point of points) {
        const seed = point.seed + pass * 31.37;
        const x = point.x * width + noise(seed) * settings.drawingWigglePx;
        const y = point.y * height + noise(seed + 17.53) * settings.drawingWigglePx;
        if (point.start) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    }
  }

  function tick() {
    timer = 0;
    if (!active()) return;
    if (!reducedMotion.matches) frame++;
    render();
    if (points.length && (!reducedMotion.matches || settings.drawingLifetimeSeconds > 0)) schedule();
  }

  function schedule() {
    if (!timer && active()) timer = setTimeout(tick, 1000 / settings.drawingFps);
  }

  function sync() {
    stop();
    if (active()) { render(); schedule(); }
  }

  function resize() {
    width = layer.clientWidth;
    height = layer.clientHeight;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    render();
  }

  archive.addEventListener('pointermove', event => {
    // Touch keeps native scrolling and the swipe-to-flip gesture.
    if (!active() || event.pointerType === 'touch' || (event.pointerType === 'pen' && !event.buttons)) {
      lastPoint = null;
      return;
    }
    const point = localPoint(event.clientX, event.clientY);
    if (!point || !width || !height) { lastPoint = null; return; }
    const now = performance.now();
    const spacing = settings.drawingSpacingPx;
    const distance = lastPoint ? Math.hypot((point.x - lastPoint.x) * width, (point.y - lastPoint.y) * height) : 0;
    if (lastPoint && distance < spacing) return;
    const steps = lastPoint ? Math.min(100, Math.ceil(distance / spacing)) : 1;
    const origin = lastPoint || point;
    for (let step = 1; step <= steps; step++) {
      points.push({
        x: origin.x + (point.x - origin.x) * step / steps,
        y: origin.y + (point.y - origin.y) * step / steps,
        seed: Math.random() * 10000,
        time: now,
        start: !lastPoint,
      });
    }
    lastPoint = point;
    trim(now);
    schedule();
  });
  archive.addEventListener('pointerleave', () => { lastPoint = null; });
  archive.addEventListener('pointercancel', () => { lastPoint = null; });
  archive.querySelector('.archive-content').addEventListener('scroll', () => { lastPoint = null; }, { passive: true });
  window.addEventListener('blur', stop);
  window.addEventListener('focus', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('archivechange', sync);
  window.addEventListener('jeffphasechange', sync);
  window.addEventListener('archivedrawingchange', () => { render(); sync(); });
  window.addEventListener('archiveclear', () => { points = []; stop(); render(); });
  reducedMotion.addEventListener('change', sync);
  // Start only after the turn settles; also suspend while About is visible.
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  new ResizeObserver(resize).observe(layer);
  resize();
})();
