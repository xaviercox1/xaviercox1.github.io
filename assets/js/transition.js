// Click-transition tuning. Jeff's approved hover defaults remain in assets/js/home.js.
(() => {
  // Approved whole-animation settings; hover shake fades gently alongside this timeline.
  // One curve drives the entire turn; the swap is always at its midpoint.
  const parameters = [
    { key: 'animationDurationMs', label: 'Whole animation duration', unit: 'ms', min: 200, max: 8000, step: 25, value: 2075 },
    { key: 'easingPower', label: 'Whole S-curve strength', unit: '', min: 1, max: 8, step: 0.1, value: 6.5 },
    { key: 'edgeAngleDeg', label: 'Handoff angle (±)', unit: '°', min: 60, max: 89, step: 1, value: 81 },
    { key: 'tiltCarryPercent', label: 'Ambient tilt carry', unit: '%', min: 0, max: 100, step: 1, value: 95 },
    { key: 'handoffFadeMs', label: 'Fade around the midpoint', unit: 'ms', min: 0, max: 800, step: 10, value: 150 },
    { key: 'placeholderWidthPercent', label: 'Placeholder viewport width', unit: '%', min: 35, max: 96, step: 1, value: 69 },
  ];
  const storageKey = 'xavier-jeff-click-transition-v3';
  const settings = Object.fromEntries(parameters.map(p => [p.key, p.value]));
  window.jeffTransition = { settings };
  // Backlog UI: approved defaults are authoritative while the panel is removed.
  const fields = document.querySelector('#transition-control-fields');
  if (!fields) return;

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    parameters.forEach(p => {
      if (typeof saved?.[p.key] === 'number' && Number.isFinite(saved[p.key])) {
        settings[p.key] = Math.min(p.max, Math.max(p.min, saved[p.key]));
      }
    });
  } catch { /* Browser preferences are optional. */ }
  const values = document.querySelector('#transition-control-values');
  const copyStatus = document.querySelector('#transition-copy-status');
  const syncControls = [];
  function save() {
    values.value = JSON.stringify(settings, null, 2);
    copyStatus.textContent = '';
    try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch { /* Optional. */ }
  }
  parameters.forEach(p => {
    const row = document.createElement('div');
    row.className = 'eye-control-row';
    const label = document.createElement('label');
    label.htmlFor = `transition-${p.key}`;
    const name = p.unit ? `${p.label} (${p.unit})` : p.label;
    label.textContent = name;
    const range = document.createElement('input');
    range.type = 'range';
    range.id = label.htmlFor;
    const number = document.createElement('input');
    number.type = 'number';
    number.setAttribute('aria-label', `${name}, exact value`);
    for (const input of [range, number]) {
      input.min = p.min;
      input.max = p.max;
      input.step = p.step;
      input.value = settings[p.key];
      input.addEventListener('input', () => {
        if (input.value === '' || !Number.isFinite(input.valueAsNumber)) return;
        settings[p.key] = Math.min(p.max, Math.max(p.min, input.valueAsNumber));
        (input === range ? number : range).value = settings[p.key];
        save();
      });
      input.addEventListener('change', () => { input.value = settings[p.key]; });
    }
    syncControls.push(() => { range.value = number.value = settings[p.key]; });
    row.append(label, range, number);
    fields.append(row);
  });
  document.querySelector('#transition-replay').addEventListener('click', () => window.jeffWorkshop.replay());
  document.querySelector('#transition-reset-jeff').addEventListener('click', () => window.jeffWorkshop.reset());
  document.querySelector('#transition-reset-values').addEventListener('click', () => {
    parameters.forEach(p => { settings[p.key] = p.value; });
    syncControls.forEach(sync => sync());
    save();
  });
  document.querySelector('#transition-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(values.value);
      copyStatus.textContent = 'Copied.';
    } catch {
      values.focus();
      values.select();
      copyStatus.textContent = 'Select and copy the values below.';
    }
  });
  save();
})();
