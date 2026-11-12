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
  // A sibling plane escapes the face's rounded bounds and text/scroll clipping.
  archive.parentElement.append(layer);
  const context = canvas.getContext('2d');
  if (!context) { layer.remove(); return; }
  const strokeShadow = document.createElement('div');
  strokeShadow.className = 'archive-stroke-shadow';
  strokeShadow.setAttribute('aria-hidden', 'true');
  strokeShadow.inert = true;
  strokeShadow.hidden = true;
  const shadowPlane = document.createElement('div');
  shadowPlane.className = 'archive-stroke-shadow__plane';
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = shadowCanvas.height = 1;
  shadowPlane.append(shadowCanvas);
  strokeShadow.append(shadowPlane);
  archive.append(strokeShadow);
  const shadowContext = shadowCanvas.getContext('2d');
  let light = null;
  let width = 0;
  let height = 0;
  let cardWidth = 0;
  let cardHeight = 0;
  let padding = 0;
  let points = [];
  let shapes = [];
  let currentStroke = [];
  let shapeCount = 0;
  const shapeStatus = document.querySelector('[data-shape-count]');
  let lastPoint = null;
  let timer = 0;
  let phase = 0;
  let lastFrameAt = null;

  function active() {
    return settings.drawingEnabled && !document.hidden && !archive.inert &&
      document.body.classList.contains('is-archive-open') &&
      !document.body.classList.contains('is-about-open') &&
      !document.body.classList.contains('is-archive-flipping');
  }

  function stop() {
    clearTimeout(timer);
    timer = 0;
    lastFrameAt = null;
    lastPoint = null;
    currentStroke = [];
  }

  function endStroke() {
    lastPoint = null;
    currentStroke = [];
  }

  function clearDrawing() {
    points = [];
    shapes = [];
    stop();
    render();
  }

  function hasInk() {
    return points.length || (settings.drawingShapesEnabled && shapes.length);
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
    return { x, y };
  }

  function trim(now) {
    const lifetime = settings.drawingLifetimeSeconds * 1000;
    if (lifetime) points = points.filter(point => now - point.time < lifetime);
    const excess = points.length - Math.round(settings.drawingMaxPoints);
    if (excess > 0) points.splice(0, excess);
    const retained = new Set(points);
    currentStroke = currentStroke.filter(point => retained.has(point));
    const shapeLifetime = settings.drawingShapeLifetimeSeconds * 1000;
    if (shapeLifetime > 0) shapes = shapes.filter(shape => now - shape.created < shapeLifetime);
    const excessShapes = shapes.length - Math.max(0, Math.round(settings.drawingMaxShapes));
    if (excessShapes > 0) shapes.splice(0, excessShapes);
    if (shapeStatus && shapeCount !== shapes.length) {
      shapeCount = shapes.length;
      shapeStatus.textContent = `${shapeCount} closed ${shapeCount === 1 ? 'shape' : 'shapes'}`;
    }
  }

  function addPoint(point) {
    points.push(point);
    if (point.start) currentStroke = [];
    currentStroke.push(point);
    if (!settings.drawingShapesEnabled || currentStroke.length < 6) return;
    const close = Math.abs(settings.drawingShapeClosePx);
    const minimum = Math.abs(settings.drawingShapeMinSizePx);
    let candidate = -1, nearest = Infinity;
    for (let i = 0; i < currentStroke.length - 4; i++) {
      const previous = currentStroke[i];
      if (point.distance - previous.distance < Math.max(minimum * 3, close * 4)) continue;
      const dx = (point.x - previous.x) * cardWidth;
      const dy = (point.y - previous.y) * cardHeight;
      const distance = dx * dx + dy * dy;
      if (distance <= close * close && distance < nearest) { candidate = i; nearest = distance; }
    }
    if (candidate < 0) return;
    const loop = currentStroke.slice(candidate);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, area = 0;
    loop.forEach((vertex, index) => {
      minX = Math.min(minX, vertex.x); maxX = Math.max(maxX, vertex.x);
      minY = Math.min(minY, vertex.y); maxY = Math.max(maxY, vertex.y);
      const next = loop[(index + 1) % loop.length];
      area += vertex.x * next.y - next.x * vertex.y;
    });
    // Ignore short backtracks and tiny accidental crossings.
    if ((maxX - minX) * cardWidth < minimum || (maxY - minY) * cardHeight < minimum ||
        Math.abs(area) * cardWidth * cardHeight / 2 < minimum * minimum / 4) return;
    shapes.push({
      created: point.time,
      points: loop.map(({ x, y, distance, seed }) => ({ x, y, distance, seed })),
    });
    // Keep any tail before the loop, then start a fresh trace at its closing point.
    const consumed = new Set(loop.slice(1));
    points = points.filter(vertex => !consumed.has(vertex));
    const anchor = { ...point, start: true };
    points.push(anchor);
    currentStroke = [anchor];
  }

  function random(x, y, seed) {
    const value = Math.sin(x * 127.1 + y * 311.7 + seed) * 43758.5453;
    return (value - Math.floor(value)) * 2 - 1;
  }

  function noise(distance, time, seed) {
    const x = Math.floor(distance), y = Math.floor(time);
    const smooth = value => value * value * value * (value * (value * 6 - 15) + 10);
    const u = smooth(distance - x), v = smooth(time - y);
    const a = random(x, y, seed), b = random(x + 1, y, seed);
    const c = random(x, y + 1, seed), d = random(x + 1, y + 1, seed);
    return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
  }

  function wiggle(distance, time, seed) {
    const base = noise(distance, time, seed);
    const complexity = Math.max(0, settings.drawingComplexity);
    if (!complexity) return base;
    // Add finer detail without increasing the number of layers for huge inputs.
    const mix = complexity / (complexity + 2);
    const scale = 2 + complexity;
    const middleWeight = mix * .5, fineWeight = mix * mix * .25;
    const middle = noise(distance * scale, time, seed + 43.19);
    const fine = noise(distance * scale * 2, time, seed + 81.71);
    return (base + middle * middleWeight + fine * fineWeight) / (1 + middleWeight + fineWeight);
  }

  function updateStrokeShadow() {
    if (!shadowContext || !settings.drawingShadowEnabled || !hasInk() || !active() || !settings.lightEnabled || !light) {
      strokeShadow.hidden = true;
      return;
    }
    const gap = light.z - (settings.drawingShadowDepthPx + .01);
    if (!(gap > .01)) { strokeShadow.hidden = true; return; }
    const scale = light.z / gap;
    const x = (1 - scale) * light.x, y = (1 - scale) * light.y;
    if (![scale, x, y].every(Number.isFinite)) { strokeShadow.hidden = true; return; }
    strokeShadow.hidden = false;
    strokeShadow.style.opacity = Math.min(1, Math.max(0, settings.drawingShadowOpacityPercent / 100));
    shadowPlane.style.filter = `blur(${Math.max(0, settings.drawingShadowBlurPx)}px)`;
    shadowPlane.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  function copyStrokeShadow() {
    if (!shadowContext || !settings.drawingShadowEnabled || !hasInk() || !active()) {
      strokeShadow.hidden = true;
      if (shadowCanvas.width !== 1) shadowCanvas.width = shadowCanvas.height = 1;
      return;
    }
    if (shadowCanvas.width !== canvas.width || shadowCanvas.height !== canvas.height) {
      shadowCanvas.width = canvas.width;
      shadowCanvas.height = canvas.height;
    }
    Object.assign(shadowCanvas.style, { left: `${-padding}px`, top: `${-padding}px`, width: `${width}px`, height: `${height}px` });
    shadowContext.clearRect(0, 0, shadowCanvas.width, shadowCanvas.height);
    shadowContext.drawImage(canvas, 0, 0);
    shadowContext.globalCompositeOperation = 'source-in';
    shadowContext.fillStyle = '#000';
    shadowContext.fillRect(0, 0, shadowCanvas.width, shadowCanvas.height);
    shadowContext.globalCompositeOperation = 'source-over';
    updateStrokeShadow();
  }

  function render() {
    trim(performance.now());
    context.clearRect(0, 0, width, height);
    if (!settings.drawingEnabled || !hasInk()) { copyStrokeShadow(); return; }
    const passes = Math.round(settings.drawingPasses);
    context.strokeStyle = settings.drawingColor;
    context.lineWidth = settings.drawingWidthPx;
    context.lineCap = context.lineJoin = 'round';
    // Keep overlapping sketch passes from becoming fully opaque.
    const opacity = Math.min(1, Math.max(0, settings.drawingOpacityPercent / 100));
    const strokeAlpha = 1 - (1 - opacity) ** (1 / passes);
    const fillOpacity = opacity * Math.min(1, Math.max(0, settings.drawingShapeOpacityPercent / 100));
    const fillAlpha = 1 - (1 - fillOpacity) ** (1 / passes);
    context.fillStyle = settings.drawingColor;
    for (let pass = 0; pass < passes; pass++) {
      if (settings.drawingShapesEnabled) {
        for (const shape of shapes) {
          context.beginPath();
          shape.points.forEach((point, index) => {
            const seed = point.seed + pass * 31.37;
            const distance = point.distance / (settings.drawingBendLengthPx || 1);
            const x = padding + point.x * cardWidth + wiggle(distance, phase, seed) * settings.drawingWigglePx;
            const y = padding + point.y * cardHeight + wiggle(distance, phase, seed + 17.53) * settings.drawingWigglePx;
            if (!index) context.moveTo(x, y); else context.lineTo(x, y);
          });
          context.closePath();
          context.globalAlpha = fillAlpha;
          context.fill();
          context.globalAlpha = strokeAlpha;
          context.stroke();
        }
      }
      context.beginPath();
      context.globalAlpha = strokeAlpha;
      for (const point of points) {
        const seed = point.seed + pass * 31.37;
        // Neighbours share a smooth random field, measured along the stroke.
        // Bend length and temporal frequency are independent of sampling and fps.
        const distance = point.distance / (settings.drawingBendLengthPx || 1);
        const x = padding + point.x * cardWidth + wiggle(distance, phase, seed) * settings.drawingWigglePx;
        const y = padding + point.y * cardHeight + wiggle(distance, phase, seed + 17.53) * settings.drawingWigglePx;
        if (point.start) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    }
    if (padding > 0) {
      context.save();
      context.globalAlpha = 1;
      context.globalCompositeOperation = 'destination-in';
      for (const [endX, endY, size] of [[width, 0, width], [0, height, height]]) {
        const fade = context.createLinearGradient(0, 0, endX, endY);
        const edge = padding / size;
        const fadeWidth = Math.max(0, settings.drawingOverspillPx) / size;
        fade.addColorStop(0, 'transparent');
        fade.addColorStop(Math.max(0, edge - fadeWidth), 'transparent');
        fade.addColorStop(edge, '#000');
        fade.addColorStop(1 - edge, '#000');
        fade.addColorStop(Math.min(1, 1 - edge + fadeWidth), 'transparent');
        fade.addColorStop(1, 'transparent');
        context.fillStyle = fade;
        context.fillRect(0, 0, width, height);
      }
      context.restore();
    }
    copyStrokeShadow();
  }

  function tick() {
    timer = 0;
    if (!active()) return;
    const now = performance.now();
    if (!reducedMotion.matches && settings.drawingFps > 0 && lastFrameAt !== null) {
      phase += Math.max(0, (now - lastFrameAt) / 1000) * settings.drawingWiggleHz;
    }
    lastFrameAt = now;
    render();
    const animating = !reducedMotion.matches && settings.drawingFps > 0 && settings.drawingWiggleHz !== 0 && settings.drawingWigglePx !== 0;
    const expiring = (points.length && settings.drawingLifetimeSeconds > 0) || (shapes.length && settings.drawingShapeLifetimeSeconds > 0);
    if ((hasInk() && animating) || expiring) schedule();
  }

  function schedule() {
    const expiring = (points.length && settings.drawingLifetimeSeconds > 0) || (shapes.length && settings.drawingShapeLifetimeSeconds > 0);
    if (settings.drawingFps <= 0 && !expiring) {
      if (active()) render();
      return;
    }
    if (!timer && active()) {
      if (lastFrameAt === null) lastFrameAt = performance.now();
      timer = setTimeout(tick, settings.drawingFps > 0 ? 1000 / settings.drawingFps : 100);
    }
  }

  function sync() {
    stop();
    // Freeze the existing sketch while the card turns; clear it only once the
    // video side has fully settled (including instant and timeout completions).
    if (!document.body.classList.contains('is-archive-open') &&
        !document.body.classList.contains('is-archive-flipping')) {
      clearDrawing();
      return;
    }
    updateStrokeShadow();
    if (active()) { render(); schedule(); }
  }

  function resize() {
    width = layer.clientWidth;
    height = layer.clientHeight;
    cardWidth = archive.clientWidth;
    cardHeight = archive.clientHeight;
    padding = (width - cardWidth) / 2;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    render();
  }

  window.addEventListener('pointermove', event => {
    // Touch keeps native scrolling and the swipe-to-flip gesture.
    if (!active() || event.pointerType === 'touch' || (event.pointerType === 'pen' && !event.buttons)) {
      endStroke();
      return;
    }
    if (event.target instanceof Element && !archive.contains(event.target) &&
        event.target.closest('a, button, input, textarea, select, .archive-controls')) {
      endStroke();
      return;
    }
    const point = localPoint(event.clientX, event.clientY);
    if (!point || !width || !height) { endStroke(); return; }
    const inside = point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
    if (!inside && !lastPoint) return;
    point.x = (point.x * width - padding) / cardWidth;
    point.y = (point.y * height - padding) / cardHeight;
    const now = performance.now();
    trim(now);
    const spacing = Math.abs(settings.drawingSpacingPx) || 1;
    const distance = lastPoint ? Math.hypot((point.x - lastPoint.x) * cardWidth, (point.y - lastPoint.y) * cardHeight) : 0;
    if (inside && lastPoint && distance < spacing) return;
    const steps = lastPoint ? Math.min(100, Math.ceil(distance / spacing)) : 1;
    const origin = lastPoint || { ...point, distance: 0, seed: Math.random() * 10000 };
    for (let step = 1; step <= steps; step++) {
      addPoint({
        x: origin.x + (point.x - origin.x) * step / steps,
        y: origin.y + (point.y - origin.y) * step / steps,
        seed: origin.seed,
        distance: origin.distance + distance * step / steps,
        time: now,
        start: !lastPoint,
      });
    }
    // Finish an exiting segment beyond the fade, even when a fast move skips it.
    if (inside) lastPoint = { ...point, distance: origin.distance + distance, seed: origin.seed };
    else endStroke();
    trim(now);
    schedule();
  });
  window.addEventListener('pointerout', event => { if (!event.relatedTarget) endStroke(); });
  window.addEventListener('pointercancel', endStroke);
  archive.querySelector('.archive-content').addEventListener('scroll', endStroke, { passive: true });
  window.addEventListener('blur', stop);
  window.addEventListener('focus', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('archivechange', sync);
  window.addEventListener('jeffphasechange', () => {
    if (!document.body.classList.contains('is-archive-open')) clearDrawing();
    else sync();
  });
  window.addEventListener('archivedrawingchange', () => { render(); sync(); });
  window.addEventListener('archivelightframe', event => { light = event.detail; updateStrokeShadow(); });
  window.addEventListener('archiveclear', clearDrawing);
  reducedMotion.addEventListener('change', sync);
  // Start only after the turn settles; also suspend while About is visible.
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  new ResizeObserver(resize).observe(layer);
  resize();
})();
