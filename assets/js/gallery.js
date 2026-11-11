(() => {
  const grid = document.querySelector('#portfolio-grid');
  const panel = document.querySelector('#grid-controls');
  const toggle = document.querySelector('#grid-settings-toggle');
  const json = document.querySelector('#grid-values');
  const copyStatus = document.querySelector('#grid-copy-status');
  const seedInput = document.querySelector('#grid-seed');
  const titlesInput = document.querySelector('#grid-titles');
  const storageKey = 'xavier-gallery-grid-workshop-v2';
  const parameters = [
    { key:'columns', label:'Columns (desktop)', min:1, max:8, step:1, value:4 },
    { key:'gapPx', label:'Gap (px)', min:0, max:100, step:1, value:26 },
    { key:'sidePaddingPx', label:'Side margins (px)', min:0, max:160, step:1, value:160 },
    { key:'topPaddingPx', label:'Space above grid (px)', min:48, max:240, step:1, value:70 },
    { key:'gridWidthPercent', label:'Grid width (%)', min:45, max:100, step:1, value:77 },
    { key:'sizeVariationPercent', label:'Random size variation (%)', min:0, max:45, step:1, value:0 },
    { key:'cornerRadiusPx', label:'Corner radius (px)', min:0, max:48, step:1, value:5 },
  ];
  const randomSeed = () => 1 + Math.floor(Math.random() * 999999);
  const defaults = { ...Object.fromEntries(parameters.map(p => [p.key,p.value])), showTitles:false, seed:725815 };
  const settings = { ...defaults };
  const clamp = (v,min,max) => Math.min(max,Math.max(min,v));
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    parameters.forEach(p => { if (Number.isFinite(saved?.[p.key])) settings[p.key] = clamp(saved[p.key],p.min,p.max); });
    if (typeof saved?.showTitles === 'boolean') settings.showTitles = saved.showTitles;
    if (Number.isFinite(saved?.seed)) settings.seed = clamp(Math.round(saved.seed),1,999999);
  } catch { /* Tuning still works without browser storage. */ }

  function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6D2B79F5;
      let t = Math.imul(value ^ value >>> 15,1 | value);
      t ^= t + Math.imul(t ^ t >>> 7,61 | t);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  let layoutFrame = 0;
  const scheduleLayout = () => { if (!layoutFrame) layoutFrame = requestAnimationFrame(layout); };
  // Keep the two exclusions already used by the current gallery.
  const works = window.portfolioWorks;
  const entries = works.map(work => {
    const dimensions = work.width ? {width:work.width,height:work.height,preview:work.thumb} : null;
    const tile = document.createElement('figure');
    tile.className = 'grid-tile';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'grid-tile__open';
    button.setAttribute('aria-label',`Open ${work.title}`);
    const img = document.createElement('img');
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    if (dimensions) { img.width = dimensions.width; img.height = dimensions.height; }
    img.src = dimensions?.preview || work.thumb;
    const hover = document.createElement('span');
    hover.className = 'grid-tile__hover';
    hover.textContent = work.title;
    button.append(img,hover);
    const caption = document.createElement('figcaption');
    caption.append(document.createTextNode(work.title));
    const year = document.createElement('span');
    year.textContent = work.year;
    caption.append(year);
    tile.append(button,caption);
    grid.append(tile);
    const entry = { work,tile,button,img,caption,ratio:dimensions ? dimensions.width / dimensions.height : 16 / 9 };
    // Remote thumbnails have no local metadata; their own shape is the fallback.
    if (!dimensions) img.addEventListener('load',() => {
      if (img.naturalWidth && img.naturalHeight) { entry.ratio = img.naturalWidth / img.naturalHeight; scheduleLayout(); }
    });
    button.addEventListener('click',() => openWork(work));
    return entry;
  });

  function layout() {
    layoutFrame = 0;
    const width = grid.clientWidth;
    const columns = Math.min(Math.round(settings.columns),Math.max(1,Math.floor((width + settings.gapPx) / (150 + settings.gapPx))));
    const gap = Math.min(settings.gapPx,width / Math.max(columns,1));
    const columnWidth = (width - gap * (columns - 1)) / columns;
    const heights = Array(columns).fill(0);
    const random = seededRandom(settings.seed);
    const featured = entries.filter(entry => entry.work.featured);
    const order = entries.filter(entry => !entry.work.featured);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i],order[j]] = [order[j],order[i]];
    }
    // Earth Tones stays at the top, including after reshuffles and resizes.
    order.unshift(...featured);
    // Match the DOM/tab order to the visual reading order after shuffling.
    order.forEach(entry => grid.append(entry.tile));
    order.forEach(entry => {
      const column = heights.indexOf(Math.min(...heights));
      const tileWidth = columnWidth * (1 - random() * settings.sizeVariationPercent / 100);
      const offset = (columnWidth - tileWidth) * random();
      const mediaHeight = tileWidth / entry.ratio;
      entry.tile.style.width = `${tileWidth}px`;
      entry.tile.style.left = `${column * (columnWidth + gap) + offset}px`;
      entry.tile.style.top = `${heights[column]}px`;
      entry.button.style.height = `${mediaHeight}px`;
      heights[column] += mediaHeight + (settings.showTitles ? entry.caption.offsetHeight : 0) + gap;
    });
    grid.style.height = `${Math.max(0,...heights) - gap}px`;
    grid.dataset.columns = columns;
  }

  function update() {
    const root = document.documentElement.style;
    root.setProperty('--grid-padding',`${settings.sidePaddingPx}px`);
    root.setProperty('--grid-top',`${settings.topPaddingPx}px`);
    root.setProperty('--grid-width',`${settings.gridWidthPercent}%`);
    root.setProperty('--grid-radius',`${settings.cornerRadiusPx}px`);
    grid.classList.toggle('show-grid-titles',settings.showTitles);
    seedInput.value = settings.seed;
    titlesInput.checked = settings.showTitles;
    json.value = JSON.stringify(settings,null,2);
    copyStatus.textContent = '';
    try { localStorage.setItem(storageKey,JSON.stringify(settings)); } catch { /* Optional. */ }
    scheduleLayout();
  }
  const syncInputs = [];
  parameters.forEach(p => {
    const row = document.createElement('div');
    row.className = 'grid-control-row';
    const label = document.createElement('label');
    label.htmlFor = `grid-${p.key}`;
    label.textContent = p.label;
    const slider = document.createElement('input');
    slider.type = 'range'; slider.id = label.htmlFor;
    const exact = document.createElement('input');
    exact.type = 'number'; exact.setAttribute('aria-label',`${p.label}, exact value`);
    [slider,exact].forEach(input => {
      input.min = p.min; input.max = p.max; input.step = p.step; input.value = settings[p.key];
      input.addEventListener('input',() => {
        if (input.value === '' || !Number.isFinite(input.valueAsNumber)) return;
        settings[p.key] = clamp(Math.round(input.valueAsNumber),p.min,p.max);
        (input === slider ? exact : slider).value = settings[p.key];
        update();
      });
      input.addEventListener('change',() => { input.value = settings[p.key]; });
    });
    syncInputs.push(() => { slider.value = exact.value = settings[p.key]; });
    row.append(label,slider,exact);
    document.querySelector('#grid-fields').append(row);
  });
  titlesInput.addEventListener('change',() => { settings.showTitles = titlesInput.checked; update(); });
  seedInput.addEventListener('input',() => {
    if (seedInput.value === '' || !Number.isFinite(seedInput.valueAsNumber)) return;
    settings.seed = clamp(Math.round(seedInput.valueAsNumber),1,999999); update();
  });
  document.querySelector('#grid-shuffle').addEventListener('click',() => { settings.seed = randomSeed(); update(); });
  document.querySelector('#grid-reset').addEventListener('click',() => {
    Object.assign(settings,defaults);
    syncInputs.forEach(sync => sync()); update();
  });
  document.querySelector('#grid-copy').addEventListener('click',async () => {
    try { await navigator.clipboard.writeText(json.value); copyStatus.textContent = 'COPIED :)'; }
    catch { json.focus(); json.select(); copyStatus.textContent = 'Select and copy above.'; }
  });
  // Backlog: restore a #grid-settings-toggle button to expose the tuning panel.
  function setPanel(open) { panel.hidden = !open; toggle?.setAttribute('aria-expanded',String(open)); }
  toggle?.addEventListener('click',() => setPanel(panel.hidden));
  document.querySelector('#grid-controls-close').addEventListener('click',() => { setPanel(false); toggle?.focus(); });

  const viewer = document.querySelector('#grid-viewer');
  const media = document.querySelector('#grid-viewer-media');
  const mediaStatus = document.querySelector('#grid-viewer-status');
  function openWork(work) {
    media.replaceChildren(); mediaStatus.textContent = '';
    document.querySelector('#grid-viewer-title').textContent = `${work.title} · ${work.year}`;
    let element;
    if (work.src) {
      element = document.createElement('video');
      element.controls = true; element.playsInline = true; element.preload = 'metadata'; element.poster = work.thumb; element.src = work.src;
      element.setAttribute('aria-label',work.title);
      element.addEventListener('error',() => { mediaStatus.textContent = 'This video could not load. Please try again.'; });
    } else if (work.youtube) {
      element = document.createElement('iframe');
      element.title = work.title; element.allow = 'autoplay; encrypted-media; fullscreen'; element.allowFullscreen = true;
      element.referrerPolicy = 'strict-origin-when-cross-origin';
      element.src = `https://www.youtube-nocookie.com/embed/${work.youtube}?autoplay=1&playsinline=1`;
    } else {
      element = document.createElement('img'); element.src = work.image || work.thumb; element.alt = work.title;
    }
    media.append(element); viewer.showModal(); document.body.style.overflow = 'hidden';
    if (work.src) element.play().catch(() => { mediaStatus.textContent = 'Press play to start the video.'; });
  }
  document.querySelector('#grid-viewer-close').addEventListener('click',() => viewer.close());
  viewer.addEventListener('close',() => {
    const video = media.querySelector('video');
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
    media.replaceChildren(); document.body.style.overflow = '';
  });
  new ResizeObserver(scheduleLayout).observe(grid);
  document.fonts.ready.then(scheduleLayout);
  if(new URLSearchParams(location.search).get('edit')==='1') setPanel(true);
  update();
})();
