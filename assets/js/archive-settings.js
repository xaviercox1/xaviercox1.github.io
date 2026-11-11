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
    motionStrengthPercent: 30,
    fontSizePx: 12,
    lineHeight: 1.2,
    rowGapPx: 9.2,
    paddingPx: 44,
    contactGapPx: 27.6,
    backgroundColor: '#ff2600',
    textColor: '#ffffff',
    underlineOpacityPercent: 59,
    textAlign: 'left',
    showContact: true,
    textDepthPx: 23,
    textShadowOpacityPercent: 26,
    textShadowBlurPx: .75,
    lightEnabled: true,
    lightDepthPx: 920,
    lightFollowAmountPercent: 100,
    lightSmoothingMs: 170,
    lightOffsetXPx: 0,
    lightOffsetYPx: 0,
    lightShowIndicator: false,
    drawingEnabled: true,
    drawingColor: '#ffffff',
    drawingWidthPx: 2,
    drawingOpacityPercent: 100,
    drawingFps: 8,
    drawingWigglePx: 11.5,
    drawingWiggleHz: 5,
    drawingBendLengthPx: 80,
    drawingComplexity: 2.9,
    drawingPasses: 1,
    drawingSpacingPx: 16,
    drawingLifetimeSeconds: 6,
    drawingMaxPoints: 4000,
    drawingOverspillPx: 500,
    drawingShadowEnabled: true,
    drawingShadowDepthPx: 33,
    drawingShadowOpacityPercent: 27,
    drawingShadowBlurPx: 1.75,
    drawingShapesEnabled: false,
    drawingShapeClosePx: 24,
    drawingShapeMinSizePx: 24,
    drawingShapeOpacityPercent: 100,
    drawingShapeLifetimeSeconds: 12,
    drawingMaxShapes: 20,
    drawingHeaderFadeEnabled: true,
    drawingHeaderSolidPx: 40,
    drawingHeaderFadePx: 120,
    drawingFooterFadeEnabled: true,
    drawingFooterSolidPx: 40,
    drawingFooterFadePx: 120,
  };
  const settings = { ...defaults };
  window.archiveSettings = { settings, defaults };
  const editing = new URLSearchParams(location.search).get('edit') === '1';
  const storageKey = 'xavier-archive-settings-v9';
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
    ['Text depth & shadow', 'textDepthPx', 'Text lift from canvas', 'px', 0, 12, .5],
    ['Text depth & shadow', 'textShadowOpacityPercent', 'Text shadow opacity', '%', 0, 60, 1],
    ['Text depth & shadow', 'textShadowBlurPx', 'Text shadow softness', 'px', 0, 6, .25],
    ['Lighting', 'lightEnabled', 'Mouse-follow lighting', 'checkbox'],
    ['Lighting', 'lightFollowAmountPercent', 'Mouse follow amount', '%', 0, 200, 1],
    ['Lighting', 'lightSmoothingMs', 'Light follow smoothing', 'ms', 0, 1500, 10],
    ['Lighting', 'lightOffsetXPx', 'Light horizontal offset from mouse', 'px', -500, 500, 1],
    ['Lighting', 'lightOffsetYPx', 'Light vertical offset from mouse', 'px', -500, 500, 1],
    ['Lighting', 'lightDepthPx', 'Light depth towards viewer', 'px', 50, 2000, 10],
    ['Lighting', 'lightShowIndicator', 'Show light position in edit mode', 'checkbox'],
    ['Colour & details', 'backgroundColor', 'Archive colour', 'color'],
    ['Colour & details', 'textColor', 'Text colour', 'color'],
    ['Colour & details', 'underlineOpacityPercent', 'Underline opacity', '%', 0, 100, 1],
    ['Colour & details', 'showContact', 'Show contact line', 'checkbox'],
    ['Drawing', 'drawingEnabled', 'Enable mouse drawing', 'checkbox'],
    ['Drawing', 'drawingColor', 'Stroke colour', 'color'],
    ['Drawing', 'drawingWidthPx', 'Stroke width', 'px', .5, 8, .5],
    ['Drawing', 'drawingOpacityPercent', 'Stroke opacity', '%', 5, 100, 1],
    ['Drawing', 'drawingWigglePx', 'Wiggle amount', 'px', 0, 24, .5],
    ['Drawing', 'drawingWiggleHz', 'Wiggle frequency', 'Hz', 0, 8, .1],
    ['Drawing', 'drawingBendLengthPx', 'Wiggle bend length', 'px', 4, 320, 4],
    ['Drawing', 'drawingComplexity', 'Wiggle complexity', 'detail', 0, 6, .1],
    ['Drawing', 'drawingFps', 'Drawing frame rate', 'fps', 1, 30, 1],
    ['Drawing', 'drawingPasses', 'Sketch passes', 'passes', 1, 4, 1],
    ['Drawing', 'drawingSpacingPx', 'Sketch point spacing', 'px', 2, 24, 1],
    ['Drawing', 'drawingLifetimeSeconds', 'Trail lifetime (0 keeps drawing)', 'seconds', 0, 60, 1],
    ['Drawing', 'drawingMaxPoints', 'Maximum drawing points', 'points', 200, 4000, 100],
    ['Drawing', 'drawingOverspillPx', 'Stroke overspill and fade', 'px', 0, 120, 1],
    ['Stroke shadow', 'drawingShadowEnabled', 'Stroke shadow', 'checkbox'],
    ['Stroke shadow', 'drawingShadowDepthPx', 'Stroke lift from canvas', 'px', 0, 40, .5],
    ['Stroke shadow', 'drawingShadowOpacityPercent', 'Stroke shadow opacity', '%', 0, 100, 1],
    ['Stroke shadow', 'drawingShadowBlurPx', 'Stroke shadow softness', 'px', 0, 12, .25],
    ['Closed shapes', 'drawingShapesEnabled', 'Fill closed loops', 'checkbox'],
    ['Closed shapes', 'drawingShapeClosePx', 'Loop closing distance', 'px', 2, 80, 1],
    ['Closed shapes', 'drawingShapeMinSizePx', 'Minimum loop size', 'px', 4, 120, 1],
    ['Closed shapes', 'drawingShapeOpacityPercent', 'Shape fill opacity', '%', 0, 100, 1],
    ['Closed shapes', 'drawingShapeLifetimeSeconds', 'Shape lifetime (0 keeps shapes)', 'seconds', 0, 60, 1],
    ['Closed shapes', 'drawingMaxShapes', 'Maximum shapes', 'shapes', 1, 100, 1],
    ['Page edge fades', 'drawingHeaderFadeEnabled', 'Protect Journal / Gallery / About', 'checkbox'],
    ['Page edge fades', 'drawingHeaderSolidPx', 'Solid black area at page top', 'px', 0, 160, 1],
    ['Page edge fades', 'drawingHeaderFadePx', 'Page top fade distance', 'px', 0, 320, 1],
    ['Page edge fades', 'drawingFooterFadeEnabled', 'Fade ink at page bottom', 'checkbox'],
    ['Page edge fades', 'drawingFooterSolidPx', 'Solid black area at page bottom', 'px', 0, 160, 1],
    ['Page edge fades', 'drawingFooterFadePx', 'Page bottom fade distance', 'px', 0, 320, 1],
  ];

  if (editing) {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      fields.forEach(([, key, , type, min, max]) => {
        const value = saved?.[key];
        if (typeof type === 'object' && Object.hasOwn(type, value)) settings[key] = typeof defaults[key] === 'number' ? Number(value) : value;
        else if (type === 'color' && /^#[0-9a-f]{6}$/i.test(value)) settings[key] = value;
        else if (type === 'checkbox' && typeof value === 'boolean') settings[key] = value;
        else if (typeof value === 'number' && Number.isFinite(value) && typeof min === 'number') settings[key] = value;
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
      '--archive-text-depth': `${settings.textDepthPx}px`,
      '--archive-drawing-padding': `${Math.max(128, Math.max(0, settings.drawingOverspillPx) + Math.abs(settings.drawingWigglePx) + Math.abs(settings.drawingWidthPx) / 2 + 16)}px`,
      '--archive-header-solid': `${Math.max(0, settings.drawingHeaderSolidPx)}px`,
      '--archive-header-fade': `${Math.max(0, settings.drawingHeaderFadePx)}px`,
      '--archive-header-display': settings.drawingHeaderFadeEnabled ? 'block' : 'none',
      '--archive-footer-solid': `${Math.max(0, settings.drawingFooterSolidPx)}px`,
      '--archive-footer-fade': `${Math.max(0, settings.drawingFooterFadePx)}px`,
      '--archive-footer-display': settings.drawingFooterFadeEnabled ? 'block' : 'none',
      '--archive-stroke-depth': `${settings.drawingShadowEnabled ? settings.drawingShadowDepthPx : 0}px`,
    };
    Object.entries(properties).forEach(([key, value]) => style.setProperty(key, value));
    window.dispatchEvent(new Event('archivedrawingchange'));
    window.dispatchEvent(new Event('archivelightchange'));
    // Reuse Jeff's sizing and geometry updates, retaining the 16:9 video ratio.
    window.dispatchEvent(new Event('resize'));
  }
  apply();
  if (!editing) return;

  const panel = document.createElement('details');
  panel.className = 'eye-controls archive-controls';
  panel.open = true;
  panel.innerHTML = `<summary>Archive settings</summary><div class="eye-controls-body"><p class="eye-controls-help">Changes preview live and save in this browser's edit mode. Sliders are guides; value boxes accept numbers beyond their ranges. Move your mouse over the archive to draw. Wiggle amount controls how far the stroke moves. Lower wiggle frequency makes slower, drawn-out shakes; longer bend length makes broader curves along the line. Complexity adds fine, irregular detail; zero keeps broad, simple bends. Drawing frame rate controls the stepped animation look. Text lift adds depth above the canvas. The light follows your mouse. Lighting controls adjust follow amount, smoothing, cursor offsets and depth. Zero smoothing follows immediately; zero offsets place the light at the cursor. Zero trail lifetime keeps strokes until cleared; the point limit removes the oldest marks. Copy the values to share your choices.</p><div class="eye-controls-actions archive-preview-actions"><button type="button" data-preview>Preview flip</button><button type="button" data-clear-drawing>Clear drawing</button><button type="button" data-settings-section="drawing" aria-controls="archive-settings-drawing">Drawing controls</button><button type="button" data-settings-section="text-depth-shadow" aria-controls="archive-settings-text-depth-shadow">Text depth &amp; shadow</button><button type="button" data-settings-section="lighting" aria-controls="archive-settings-lighting">Lighting controls</button><button type="button" data-settings-section="stroke-shadow" aria-controls="archive-settings-stroke-shadow">Stroke shadow</button><button type="button" data-settings-section="closed-shapes" aria-controls="archive-settings-closed-shapes">Closed shapes</button><button type="button" data-settings-section="page-edge-fades" aria-controls="archive-settings-page-edge-fades">Page edge fades</button></div><div class="archive-settings-fields"></div><div class="eye-controls-actions"><button type="button" data-copy>Copy values</button><button type="button" data-reset>Reset defaults</button><span role="status"></span></div><textarea aria-label="Archive settings to copy" readonly spellcheck="false"></textarea></div>`;
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
      group.id = `archive-settings-${section.toLowerCase().replace(/[^a-z]+/g, '-')}`;
      const legend = document.createElement('legend');
      legend.textContent = section;
      group.append(legend);
      if (section === 'Closed shapes') {
        const count = document.createElement('p');
        count.className = 'eye-controls-help';
        count.dataset.shapeCount = '';
        count.setAttribute('role', 'status');
        count.textContent = '0 closed shapes';
        group.append(count);
      }
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
      Object.assign(input, { min, max, step, value: settings[key] });
      const number = document.createElement('input');
      number.type = 'number';
      number.step = 'any';
      number.value = settings[key];
      number.setAttribute('aria-label', `${title}, exact value`);
      [input, number].forEach(control => {
        control.addEventListener('input', () => {
          if (!Number.isFinite(control.valueAsNumber)) return;
          settings[key] = control.valueAsNumber;
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
  panel.querySelectorAll('[data-settings-section]').forEach(button => {
    button.addEventListener('click', () => {
      const section = panel.querySelector(`#archive-settings-${button.dataset.settingsSection}`);
      section.scrollIntoView({ block: 'start' });
      section.querySelector('input').focus({ preventScroll: true });
    });
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
