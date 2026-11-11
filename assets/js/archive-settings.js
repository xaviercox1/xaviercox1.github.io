// Tuning is opt-in: public visits always use the approved defaults.
(() => {
  const defaults = {
    flipDurationMs: 950,
    flipEasing: 'cubic-bezier(.65, 0, .25, 1)',
    flipAxis: 'X',
    flipDirection: 1,
    scrollThresholdPx: 64,
    swipeThresholdPx: 48,
    cardWidthPercent: 49,
    cardMaxHeightPercent: 80,
    cornerRadiusPercent: 3.5,
    motionStrengthPercent: 20,
    fontSizePx: 12,
    lineHeight: 1.2,
    rowGapPx: 9.2,
    paddingPx: 44,
    contactGapPx: 25.6,
    backgroundColor: '#ff2600',
    textColor: '#ffffff',
    underlineOpacityPercent: 59,
    textAlign: 'left',
    showContact: true,
    drawingEnabled: true,
    drawingColor: '#ffffff',
    drawingWidthPx: 1.5,
    drawingOpacityPercent: 65,
    drawingFps: 10,
    drawingWigglePx: 2.5,
    drawingPasses: 2,
    drawingSpacingPx: 6,
    drawingLifetimeSeconds: 0,
    drawingMaxPoints: 2000,
  };
  const settings = { ...defaults };
  window.archiveSettings = { settings, defaults };
  const editing = new URLSearchParams(location.search).get('edit') === '1';
  const storageKey = 'xavier-archive-settings-v3';
  const fields = [
    ['Flip', 'flipDurationMs', 'Flip duration', 'ms', 100, 4000, 50],
    ['Flip', 'flipEasing', 'Flip easing', { 'cubic-bezier(.65, 0, .25, 1)': 'Smooth', 'cubic-bezier(.2, .8, .2, 1)': 'Quick start', 'ease-in-out': 'Gentle', 'linear': 'Linear' }],
    ['Flip', 'flipAxis', 'Flip axis', { X: 'Over the top', Y: 'Sideways' }],
    ['Flip', 'flipDirection', 'Flip direction', { 1: 'Forward', '-1': 'Reverse' }],
    ['Flip', 'scrollThresholdPx', 'Scroll threshold', 'px', 10, 240, 2],
    ['Flip', 'swipeThresholdPx', 'Swipe threshold', 'px', 20, 160, 2],
    ['Card', 'cardWidthPercent', 'Card width', '% of viewport', 35, 96, 1],
    ['Card', 'cardMaxHeightPercent', 'Maximum card height', '% of viewport', 35, 90, 1],
    ['Card', 'cornerRadiusPercent', 'Corner radius', '% of card height', 0, 20, .5],
    ['Card', 'motionStrengthPercent', 'Ambient movement', '%', 0, 100, 1],
    ['Typography & spacing', 'fontSizePx', 'Font size', 'px', 10, 48, 1],
    ['Typography & spacing', 'lineHeight', 'Line height', '×', 1, 2, .05],
    ['Typography & spacing', 'rowGapPx', 'Space between entries', 'px', 0, 40, .2],
    ['Typography & spacing', 'paddingPx', 'Inner padding', 'px', 8, 100, 1],
    ['Typography & spacing', 'contactGapPx', 'Space above contact', 'px', 0, 80, .2],
    ['Typography & spacing', 'textAlign', 'Text alignment', { left: 'Left', center: 'Centre', right: 'Right' }],
    ['Colour & details', 'backgroundColor', 'Archive colour', 'color'],
    ['Colour & details', 'textColor', 'Text colour', 'color'],
    ['Colour & details', 'underlineOpacityPercent', 'Underline opacity', '%', 0, 100, 1],
    ['Colour & details', 'showContact', 'Show contact line', 'checkbox'],
    ['Drawing', 'drawingEnabled', 'Enable mouse drawing', 'checkbox'],
    ['Drawing', 'drawingColor', 'Stroke colour', 'color'],
    ['Drawing', 'drawingWidthPx', 'Stroke width', 'px', .5, 8, .5],
    ['Drawing', 'drawingOpacityPercent', 'Stroke opacity', '%', 5, 100, 1],
    ['Drawing', 'drawingFps', 'Wiggle frame rate', 'fps', 1, 30, 1],
    ['Drawing', 'drawingWigglePx', 'Wiggle amount', 'px', 0, 12, .5],
    ['Drawing', 'drawingPasses', 'Sketch passes', 'passes', 1, 4, 1],
    ['Drawing', 'drawingSpacingPx', 'Sketch point spacing', 'px', 2, 24, 1],
    ['Drawing', 'drawingLifetimeSeconds', 'Trail lifetime (0 keeps drawing)', 'seconds', 0, 60, 1],
    ['Drawing', 'drawingMaxPoints', 'Maximum drawing points', 'points', 200, 4000, 100],
  ];

  if (editing) {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      fields.forEach(([, key, , type, min, max]) => {
        const value = saved?.[key];
        if (typeof type === 'object' && Object.hasOwn(type, value)) settings[key] = typeof defaults[key] === 'number' ? Number(value) : value;
        else if (type === 'color' && /^#[0-9a-f]{6}$/i.test(value)) settings[key] = value;
        else if (type === 'checkbox' && typeof value === 'boolean') settings[key] = value;
        else if (typeof value === 'number' && Number.isFinite(value) && typeof min === 'number') settings[key] = Math.min(max, Math.max(min, value));
      });
    } catch { /* Saved experiments are optional. */ }
  }

  function apply() {
    const style = document.documentElement.style;
    const properties = {
      '--archive-duration': `${settings.flipDurationMs}ms`,
      '--archive-easing': settings.flipEasing,
      '--archive-turn': `rotate${settings.flipAxis}(${180 * settings.flipDirection}deg)`,
      '--archive-back': `rotate${settings.flipAxis}(180deg)`,
      '--archive-font-size': `${settings.fontSizePx}px`,
      '--archive-line-height': settings.lineHeight,
      '--archive-row-gap': `${settings.rowGapPx}px`,
      '--archive-padding': `${settings.paddingPx}px`,
      '--archive-contact-gap': `${settings.contactGapPx}px`,
      '--archive-background': settings.backgroundColor,
      '--archive-text': settings.textColor,
      '--archive-underline-opacity': settings.underlineOpacityPercent / 100,
      '--archive-align': settings.textAlign,
      '--archive-contact-display': settings.showContact ? 'block' : 'none',
    };
    Object.entries(properties).forEach(([key, value]) => style.setProperty(key, value));
    window.dispatchEvent(new Event('archivedrawingchange'));
    // Reuse Jeff's sizing and geometry updates, retaining the 16:9 video ratio.
    window.dispatchEvent(new Event('resize'));
  }
  apply();
  if (!editing) return;

  const panel = document.createElement('details');
  panel.className = 'eye-controls archive-controls';
  panel.open = true;
  panel.innerHTML = `<summary>Archive settings</summary><div class="eye-controls-body"><p class="eye-controls-help">Changes preview live and save in this browser's edit mode. Move your mouse over the archive to draw. Zero trail lifetime keeps strokes until cleared; the point limit removes the oldest marks. Copy the values to share your choices.</p><div class="eye-controls-actions archive-preview-actions"><button type="button" data-preview>Preview flip</button><button type="button" data-clear-drawing>Clear drawing</button></div><div class="archive-settings-fields"></div><div class="eye-controls-actions"><button type="button" data-copy>Copy values</button><button type="button" data-reset>Reset defaults</button><span role="status"></span></div><textarea aria-label="Archive settings to copy" readonly spellcheck="false"></textarea></div>`;
  document.body.append(panel);
  const container = panel.querySelector('.archive-settings-fields');
  const output = panel.querySelector('textarea');
  const status = panel.querySelector('[role="status"]');
  const syncControls = [];
  let group;
  let groupName = '';

  function save() {
    apply();
    output.value = JSON.stringify(settings, null, 2);
    status.textContent = '';
    try { localStorage.setItem(storageKey, output.value); } catch { /* Optional. */ }
  }

  fields.forEach(([section, key, title, type, min, max, step]) => {
    if (section !== groupName) {
      groupName = section;
      group = document.createElement('fieldset');
      const legend = document.createElement('legend');
      legend.textContent = section;
      group.append(legend);
      container.append(group);
    }
    const row = document.createElement('div');
    row.className = 'eye-control-row';
    const label = document.createElement('label');
    label.htmlFor = `archive-control-${key}`;
    label.textContent = `${title}${typeof min === 'number' ? ` (${type})` : ''}`;
    row.append(label);
    let input;
    if (typeof type === 'object') {
      input = document.createElement('select');
      Object.entries(type).forEach(([value, text]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = text;
        input.append(option);
      });
      input.value = String(settings[key]);
      syncControls.push(() => { input.value = String(settings[key]); });
      input.addEventListener('change', () => {
        settings[key] = typeof defaults[key] === 'number' ? Number(input.value) : input.value;
        save();
      });
    } else if (type === 'color' || type === 'checkbox') {
      input = document.createElement('input');
      input.type = type;
      const property = type === 'checkbox' ? 'checked' : 'value';
      input[property] = settings[key];
      syncControls.push(() => { input[property] = settings[key]; });
      input.addEventListener('input', () => { settings[key] = input[property]; save(); });
    } else {
      input = document.createElement('input');
      input.type = 'range';
      const number = document.createElement('input');
      number.type = 'number';
      number.setAttribute('aria-label', `${title}, exact value`);
      [input, number].forEach(control => {
        Object.assign(control, { min, max, step, value: settings[key] });
        control.addEventListener('input', () => {
          if (!Number.isFinite(control.valueAsNumber)) return;
          settings[key] = Math.min(max, Math.max(min, control.valueAsNumber));
          (control === input ? number : input).value = settings[key];
          save();
        });
        control.addEventListener('change', () => { control.value = settings[key]; });
      });
      syncControls.push(() => { input.value = number.value = settings[key]; });
      row.append(number);
    }
    input.id = label.htmlFor;
    row.insertBefore(input, row.children[1] || null);
    group.append(row);
  });
  panel.querySelector('[data-preview]').addEventListener('click', () => {
    if (document.querySelector('.sim-wrapper').dataset.phase !== 'complete') window.jeffWorkshop.openHome();
    window.dispatchEvent(new Event('archivepreview'));
  });
  panel.querySelector('[data-reset]').addEventListener('click', () => {
    Object.assign(settings, defaults);
    syncControls.forEach(sync => sync());
    save();
    status.textContent = 'Defaults restored.';
  });
  panel.querySelector('[data-clear-drawing]').addEventListener('click', () => {
    window.dispatchEvent(new Event('archiveclear'));
    status.textContent = 'Drawing cleared.';
  });
  panel.querySelector('[data-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = 'Copied.';
    } catch {
      output.focus();
      output.select();
      status.textContent = 'Copy the selected values below.';
    }
  });
  output.value = JSON.stringify(settings, null, 2);
})();
