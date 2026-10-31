// Approved Jeff defaults and the retained tuning controls.
(() => {
  const parameters = [
    { key: "jeffGrowthPercent", label: "Jeff growth", unit: "%", min: 0, max: 40, step: 1, value: 6 },
    { key: "shakeAmountPx", label: "Shake strength", unit: "px", min: 0, max: 6, step: 0.1, value: 2 },
    { key: "shakeSpeedHz", label: "Shake speed", unit: "Hz", min: 0, max: 20, step: 0.5, value: 3 },
    { key: "hoverTransitionMs", label: "Hover transition", unit: "ms", min: 0, max: 1000, step: 10, value: 900 },
    { key: "jeffRotationSpeed", label: "Jeff rotation speed", unit: "×", min: 0.1, max: 10, step: 0.1, value: 7.6 },
  ];
  const storageKey = "xavier-home-redesign-eyes-v1";
  const settings = Object.fromEntries(parameters.map(p => [p.key, p.value]));
  window.jeffWorkshop = { settings };
  // Backlog: the controls initialize only when their template is restored.
  // While the panel is removed, use the chosen defaults without browser overrides.
  const fields = document.querySelector("#eye-control-fields");
  if (!fields) return;

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && typeof saved === "object") {
      saved.jeffGrowthPercent ??= saved.eyeGrowthPercent;
      saved.jeffRotationSpeed ??= saved.squareRotationSpeed;
    }
    parameters.forEach(p => {
      if (typeof saved?.[p.key] === "number" && Number.isFinite(saved[p.key])) {
        settings[p.key] = Math.min(p.max, Math.max(p.min, saved[p.key]));
      }
    });
  } catch { /* Local preferences are optional. */ }
  const exportField = document.querySelector("#eye-control-values");
  function save() {
    exportField.value = JSON.stringify(settings, null, 2);
    try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch { /* Optional. */ }
    document.querySelector("#eye-control-status").textContent = "";
  }
  const syncControls = [];
  parameters.forEach(p => {
    const row = document.createElement("div");
    row.className = "eye-control-row";
    const label = document.createElement("label");
    label.htmlFor = `control-${p.key}`;
    label.textContent = `${p.label} (${p.unit})`;
    const range = document.createElement("input");
    range.type = "range";
    range.id = `control-${p.key}`;
    const number = document.createElement("input");
    number.type = "number";
    number.setAttribute("aria-label", `${p.label} (${p.unit}), exact value`);
    for (const input of [range, number]) {
      input.min = p.min;
      input.max = p.max;
      input.step = p.step;
      input.value = settings[p.key];
      input.addEventListener("input", () => {
        if (input.value === "" || !Number.isFinite(input.valueAsNumber)) return;
        settings[p.key] = Math.min(p.max, Math.max(p.min, input.valueAsNumber));
        (input === range ? number : range).value = settings[p.key];
        save();
      });
      input.addEventListener("change", () => { input.value = settings[p.key]; });
    }
    syncControls.push(() => { range.value = number.value = settings[p.key]; });
    row.append(label, range, number);
    fields.append(row);
  });
  document.querySelector("#eye-controls-reset").addEventListener("click", () => {
    parameters.forEach(p => { settings[p.key] = p.value; });
    syncControls.forEach(sync => sync());
    save();
  });
  document.querySelector("#eye-controls-copy").addEventListener("click", async () => {
    exportField.value = JSON.stringify(settings, null, 2);
    try {
      await navigator.clipboard.writeText(exportField.value);
      document.querySelector("#eye-control-status").textContent = "Copied.";
    } catch {
      exportField.focus();
      exportField.select();
      document.querySelector("#eye-control-status").textContent = "Select and copy the values below.";
    }
  });
  save();
})();

// === Center eye art ===
(function () {
  const eyeArt = document.querySelector("[data-workshop-eyes]");
  const eyePlane = eyeArt?.querySelector(".eye-plane");
  const eyeBackdrop = eyeArt?.querySelector(".eye-backdrop");
  const eyeField = eyeArt?.querySelector(".eye-field");
  if (!eyeArt || !eyePlane || !eyeBackdrop || !eyeField) return;

  const settings = window.jeffWorkshop.settings;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let lastHoverFrame = performance.now();
  let shakePhase = 0;
  let jeffHoverBlend = 0;
  let jeffHovered = false;
  const jeffMotion = document.querySelector(".jeff-motion");
  jeffMotion.addEventListener("pointerenter", event => { jeffHovered = event.pointerType !== "touch"; });
  jeffMotion.addEventListener("pointerleave", () => { jeffHovered = false; });

  const frameBasePath = "Content/Jeff/eyes/";
  const eyeFrames = [
    { filename: "centre.webp", lookX: 0, lookY: 0, idleWeight: 4.2 },
    { filename: "left.webp", lookX: -1, lookY: 0, idleWeight: 0.6 },
    { filename: "right.webp", lookX: 1, lookY: 0, idleWeight: 0.6 },
    { filename: "up.webp", lookX: 0, lookY: -1, idleWeight: 0.45 },
    { filename: "down.webp", lookX: 0, lookY: 1, idleWeight: 0.45 },
    { filename: "leftup.webp", lookX: -1, lookY: -1, idleWeight: 0.28 },
    { filename: "rightup.webp", lookX: 1, lookY: -1, idleWeight: 0.28 },
    { filename: "leftdown.webp", lookX: -1, lookY: 1, idleWeight: 0.28 },
    { filename: "rightdown.webp", lookX: 1, lookY: 1, idleWeight: 0.28 },
    { filename: "slightleftup.webp", lookX: -0.56, lookY: -0.52, idleWeight: 1.1 },
    { filename: "slightrightup.webp", lookX: 0.56, lookY: -0.52, idleWeight: 1.1 },
    { filename: "slightleftdown.webp", lookX: -0.56, lookY: 0.52, idleWeight: 1.1 },
    { filename: "slightrightdown.webp", lookX: 0.56, lookY: 0.52, idleWeight: 1.1 },
  ].map((frame) => ({
    ...frame,
    src: frameBasePath + frame.filename,
  }));
  const trackingCenterXRatio = 0.5;
  const trackingCenterYRatio = 0.347;
  const eyeRevealDelay = 2000;
  const idleLookDelay = 1200;
  const activeWiggleBlend = 0.14;
  const backdropBaseZ = -136;
  const backdropPositionFollowSpeed = 1.55;
  const backdropRotationFollowSpeed = 0.8;
  const eyeLayout = [
    { x: 14.3, y: 13.5, scale: 0.98 },
    { x: 50, y: 12.5, scale: 1.03 },
    { x: 85.7, y: 13.5, scale: 0.98 },
    { x: 31.2, y: 31.5, scale: 1 },
    { x: 68.8, y: 31.5, scale: 1 },
    { x: 14.3, y: 49.5, scale: 0.99 },
    { x: 50, y: 48.5, scale: 1.04 },
    { x: 85.7, y: 49.5, scale: 0.99 },
    { x: 31.2, y: 67.5, scale: 1 },
    { x: 68.8, y: 67.5, scale: 1 },
    { x: 14.3, y: 85.5, scale: 0.98 },
    { x: 50, y: 84.5, scale: 1.03 },
    { x: 85.7, y: 85.5, scale: 0.98 },
  ];
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let pointerIsActive = false;
  let lastPointerMoveTime = performance.now();
  const neutralFrame = eyeFrames.find((frame) => frame.filename === "centre.png") || eyeFrames[0];
  const idleLookFrames = eyeFrames.filter((frame) => frame.filename !== "centre.png");
  let idleLookTargetX = neutralFrame.lookX;
  let idleLookTargetY = neutralFrame.lookY;
  let idleLookNextShiftTime = performance.now() + randomBetween(300, 1100);
  const idleSwaySpeedX = randomBetween(0.11, 0.16);
  const idleSwaySpeedY = randomBetween(0.09, 0.13);
  const idleSwayAmplitudeX = 0.055;
  const idleSwayAmplitudeY = 0.04;
  const idlePhaseX = randomBetween(0, Math.PI * 2);
  const idlePhaseY = randomBetween(0, Math.PI * 2);
  let lastBackdropFrameTime = performance.now();
  let currentBackdropX = 0;
  let currentBackdropY = 0;
  let currentBackdropZ = backdropBaseZ;
  let currentBackdropRotateX = 0;
  let currentBackdropRotateY = 0;
  let currentBackdropRotateZ = 0;
  let eyeReady = false;
  let eyeAssetsReady = false;
  let eyeRevealScheduled = false;
  const eyeRevealReadyTime = performance.now() + eyeRevealDelay;
  const eyeStates = eyeLayout.map((layout) => {
    const stack = document.createElement("div");
    stack.className = "eye-stack";
    stack.style.setProperty("--eye-x", layout.x + "%");
    stack.style.setProperty("--eye-y", layout.y + "%");
    stack.style.setProperty("--eye-scale", layout.scale.toFixed(3));

    const shadow = document.createElement("div");
    shadow.className = "eye-stack__shadow";

    const underlay = document.createElement("div");
    underlay.className = "eye-stack__underlay";

    const image = document.createElement("img");
    image.className = "eye-stack__image";
    image.src = neutralFrame.src;
    image.alt = "";
    image.draggable = false;

    stack.append(shadow, underlay, image);
    eyeField.appendChild(stack);

    return {
      root: stack,
      image,
      activeFrameSrc: neutralFrame.src,
      currentLookX: neutralFrame.lookX,
      currentLookY: neutralFrame.lookY,
      targetLookX: neutralFrame.lookX,
      targetLookY: neutralFrame.lookY,
      followBlend: randomBetween(0.055, 0.095),
      lookRange: randomBetween(0.78, 1),
      floatAmplitudeX: randomBetween(0.6, 1.7),
      floatAmplitudeY: randomBetween(0.5, 1.5),
      floatSpeedX: randomBetween(0.2, 0.38),
      floatSpeedY: randomBetween(0.18, 0.34),
      rotateAmplitude: randomBetween(0.35, 0.95),
      rotateSpeed: randomBetween(0.15, 0.28),
      floatPhaseX: randomBetween(0, Math.PI * 2),
      floatPhaseY: randomBetween(0, Math.PI * 2),
      rotatePhase: randomBetween(0, Math.PI * 2),
    };
  });

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function revealEyeArt() {
    if (eyeRevealScheduled || !eyeAssetsReady) return;
    eyeRevealScheduled = true;
    const remainingDelay = Math.max(eyeRevealReadyTime - performance.now(), 0);
    window.setTimeout(() => {
      eyeArt.classList.add("is-revealed");
    }, remainingDelay);
  }

  function isEyeIdling(frameNow) {
    return !pointerIsActive || frameNow - lastPointerMoveTime >= idleLookDelay;
  }

  function preloadFrames(frameList) {
    return Promise.all(
      frameList.map(
        (frame) =>
          new Promise((resolve) => {
            const image = new Image();
            image.decoding = "async";
            image.src = frame.src;
            if (image.complete) {
              resolve();
              return;
            }
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          })
      )
    );
  }

  function chooseWeightedFrame(frameList) {
    let totalWeight = 0;
    for (const frame of frameList) {
      totalWeight += frame.idleWeight || 1;
    }

    let remainingWeight = Math.random() * totalWeight;
    for (const frame of frameList) {
      remainingWeight -= frame.idleWeight || 1;
      if (remainingWeight <= 0) {
        return frame;
      }
    }

    return frameList[frameList.length - 1];
  }

  function updateIdleLookTarget(frameNow) {
    if (!neutralFrame) return;
    if (frameNow < idleLookNextShiftTime) return;

    if (!idleLookFrames.length || Math.random() < 0.3) {
      idleLookTargetX = randomBetween(-0.18, 0.18);
      idleLookTargetY = randomBetween(-0.1, 0.16);
      idleLookNextShiftTime = frameNow + randomBetween(1400, 2600);
      return;
    }

    const sampledFrame = chooseWeightedFrame(idleLookFrames);
    idleLookTargetX = sampledFrame.lookX;
    idleLookTargetY = sampledFrame.lookY;
    idleLookNextShiftTime = frameNow + randomBetween(1700, 3200);
  }

  function updatePointerTarget(eyeState, frameNow) {
    if (!eyeFrames.length || !neutralFrame) return;

    if (!pointerIsActive) {
      updateIdleLookTarget(frameNow);
      const sharedIdleLookX = clamp(
        idleLookTargetX +
          Math.sin(frameNow * 0.001 * idleSwaySpeedX + idlePhaseX) * idleSwayAmplitudeX,
        -1,
        1
      );
      const sharedIdleLookY = clamp(
        idleLookTargetY +
          Math.sin(frameNow * 0.001 * idleSwaySpeedY + idlePhaseY) * idleSwayAmplitudeY,
        -1,
        1
      );
      eyeState.targetLookX = sharedIdleLookX * eyeState.lookRange;
      eyeState.targetLookY = sharedIdleLookY * eyeState.lookRange;
      return;
    }

    const rect = eyeState.image.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      eyeState.targetLookX = neutralFrame.lookX;
      eyeState.targetLookY = neutralFrame.lookY;
      return;
    }

    const centerX = rect.left + rect.width * trackingCenterXRatio;
    const centerY = rect.top + rect.height * trackingCenterYRatio;
    const normalizedX = clamp((pointerX - centerX) / (rect.width * 0.38), -1, 1);
    const normalizedY = clamp((pointerY - centerY) / (rect.height * 0.4), -1, 1);

    eyeState.targetLookX = normalizedX * eyeState.lookRange;
    eyeState.targetLookY = normalizedY * 0.94 * eyeState.lookRange;
  }

  function getNearestFrame(lookX, lookY) {
    const horizontalDominance =
      Math.abs(lookX) / Math.max(Math.abs(lookX) + Math.abs(lookY), 0.001);
    const verticalWeight = 1 - horizontalDominance * 0.62;
    let nearestFrame = eyeFrames[0];
    let nearestDistance = Infinity;

    for (const frame of eyeFrames) {
      const distance =
        (frame.lookX - lookX) ** 2 + (frame.lookY - lookY) ** 2 * verticalWeight;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestFrame = frame;
      }
    }

    return nearestFrame;
  }

  function applyBackdropStep(stepX, stepY, stepZ, rotateX, rotateY, rotateZ) {
    currentBackdropX = stepX;
    currentBackdropY = stepY;
    currentBackdropZ = stepZ;
    currentBackdropRotateX = rotateX;
    currentBackdropRotateY = rotateY;
    currentBackdropRotateZ = rotateZ;

    eyeArt.style.setProperty("--eye-backdrop-x", currentBackdropX.toFixed(2) + "px");
    eyeArt.style.setProperty("--eye-backdrop-y", currentBackdropY.toFixed(2) + "px");
    eyeArt.style.setProperty("--eye-backdrop-z", currentBackdropZ.toFixed(2) + "px");
    eyeArt.style.setProperty(
      "--eye-backdrop-rotate-x",
      currentBackdropRotateX.toFixed(2) + "deg"
    );
    eyeArt.style.setProperty(
      "--eye-backdrop-rotate-y",
      currentBackdropRotateY.toFixed(2) + "deg"
    );
    eyeArt.style.setProperty(
      "--eye-backdrop-rotate-z",
      currentBackdropRotateZ.toFixed(2) + "deg"
    );

  }

  function ambientRotation(frameNow, normalizedX, normalizedY) {
    const time = frameNow * 0.001;
    return {
      x: Math.cos(time * 0.41) * 3.2 - normalizedY * 16,
      y: Math.sin(time * 0.38) * 4.1 + normalizedX * 19,
      z: Math.sin(time * 0.25) * 4.8 - normalizedX * 4.2 + normalizedY * 2.6,
    };
  }

  function updateEyeBackdropMotion(frameNow) {
    if (!eyeArt || !eyeBackdrop) return;

    const deltaSeconds = Math.min((frameNow - lastBackdropFrameTime) / 1000, 0.05);
    lastBackdropFrameTime = frameNow;
    const rect = eyeArt.getBoundingClientRect();
    let normalizedX = 0;
    let normalizedY = 0;

    if (pointerIsActive && rect.width && rect.height) {
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * trackingCenterYRatio;
      normalizedX = clamp((pointerX - centerX) / (rect.width * 0.85), -1, 1);
      normalizedY = clamp((pointerY - centerY) / (rect.height * 0.85), -1, 1);
    }

    const time = (typeof frameNow === "number" ? frameNow : performance.now()) * 0.001;
    const orbitX = Math.cos(time * 0.54) * 7.2 + Math.sin(time * 0.29) * 2.6;
    const orbitY = Math.sin(time * 0.46) * 5.4 + Math.cos(time * 0.21) * 1.8;
    const orbitZ = Math.sin(time * 0.35) * 10;
    const targetX = orbitX + normalizedX * 8;
    const targetY = orbitY + normalizedY * 7;
    const targetZ = backdropBaseZ + orbitZ + Math.abs(normalizedX) * 3;
    const targetRotation = ambientRotation(frameNow, normalizedX, normalizedY);
    const positionBlend = 1 - Math.exp(-backdropPositionFollowSpeed * deltaSeconds);
    const rotationBlend = 1 - Math.exp(-backdropRotationFollowSpeed * settings.jeffRotationSpeed * deltaSeconds);

    currentBackdropX = lerp(currentBackdropX, targetX, positionBlend);
    currentBackdropY = lerp(currentBackdropY, targetY, positionBlend);
    currentBackdropZ = lerp(currentBackdropZ, targetZ, positionBlend);
    currentBackdropRotateX = lerp(currentBackdropRotateX, targetRotation.x, rotationBlend);
    currentBackdropRotateY = lerp(currentBackdropRotateY, targetRotation.y, rotationBlend);
    currentBackdropRotateZ = lerp(currentBackdropRotateZ, targetRotation.z, rotationBlend);

    applyBackdropStep(
      currentBackdropX,
      currentBackdropY,
      currentBackdropZ,
      currentBackdropRotateX,
      currentBackdropRotateY,
      currentBackdropRotateZ
    );
  }

  function setActiveFrame(eyeState, frame) {
    if (!frame) return;
    if (frame.src === eyeState.activeFrameSrc) return;
    eyeState.activeFrameSrc = frame.src;
    eyeState.image.src = frame.src;
  }

  function updateEyeWiggle(frameNow) {
    if (!eyeArt) return;

    const time = frameNow * 0.001;
    const activityBlend = isEyeIdling(frameNow) ? 1 : activeWiggleBlend;
    const floatX = (Math.cos(time * 0.36) * 6.2 + Math.sin(time * 0.18) * 2.1) * activityBlend;
    const floatY = (Math.sin(time * 0.31) * 6.9 + Math.cos(time * 0.17) * 1.35) * activityBlend;
    const rotateZ = Math.sin(time * 0.22) * 1.45 * activityBlend;

    eyeArt.style.setProperty("--eye-float-x", floatX.toFixed(2) + "px");
    eyeArt.style.setProperty("--eye-float-y", floatY.toFixed(2) + "px");
    eyeArt.style.setProperty("--eye-rotate-z", rotateZ.toFixed(2) + "deg");
  }

  function updateEyeStackDrift(eyeState, frameNow) {
    const time = frameNow * 0.001;
    const activityBlend = isEyeIdling(frameNow) ? 1 : activeWiggleBlend;
    const floatX =
      Math.cos(time * eyeState.floatSpeedX + eyeState.floatPhaseX) *
      eyeState.floatAmplitudeX *
      activityBlend;
    const floatY =
      Math.sin(time * eyeState.floatSpeedY + eyeState.floatPhaseY) *
      eyeState.floatAmplitudeY *
      activityBlend;
    const rotateZ =
      Math.sin(time * eyeState.rotateSpeed + eyeState.rotatePhase) *
      eyeState.rotateAmplitude *
      activityBlend;

    eyeState.root.style.setProperty("--eye-stack-float-x", floatX.toFixed(2) + "px");
    eyeState.root.style.setProperty("--eye-stack-float-y", floatY.toFixed(2) + "px");
    eyeState.root.style.setProperty("--eye-stack-rotate-z", rotateZ.toFixed(2) + "deg");
  }

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerIsActive = true;
    lastPointerMoveTime = performance.now();
  });

  document.addEventListener("mouseleave", () => {
    pointerIsActive = false;
  });

  window.addEventListener("blur", () => {
    pointerIsActive = false;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") {
      pointerIsActive = false;
    }
  });

  preloadFrames(eyeFrames)
    .then(() => {
      updateEyeBackdropMotion(performance.now());
      eyeStates.forEach((eyeState) => {
        setActiveFrame(eyeState, neutralFrame);
      });
      eyeReady = true;
      eyeAssetsReady = true;
      revealEyeArt();
    })
    .catch(() => {
      eyeReady = true;
      eyeAssetsReady = true;
      revealEyeArt();
    });

  // The same plane becomes the placeholder, keeping a continuous position and size.
  const jeffTarget = document.querySelector('.sim-wrapper');
  const status = document.querySelector('#transition-status');
  const originalPlaneStyle = eyePlane.style.cssText;
  const originalBackdropStyle = eyeBackdrop.style.cssText;
  let clickTransition = null;
  const visitKey = 'xavier-home-jeff-opened-v1';
  try { window.jeffWorkshop.hasOpened = localStorage.getItem(visitKey) === '1'; }
  catch { window.jeffWorkshop.hasOpened = false; }

  function rememberJeffOpened() {
    window.jeffWorkshop.hasOpened = true;
    try { localStorage.setItem(visitKey, '1'); } catch { /* Keep the in-page state. */ }
  }

  function setTransitionPhase(phase, text) {
    const previousPhase = jeffTarget.dataset.phase;
    jeffTarget.dataset.phase = phase;
    if (status && status.textContent !== text) status.textContent = text;
    if (previousPhase !== phase) {
      window.dispatchEvent(new CustomEvent('jeffphasechange', { detail: { phase } }));
    }
  }

  function easeTransition(t, power) {
    t = clamp(t, 0, 1);
    const a = t ** power;
    return a / (a + (1 - t) ** power);
  }

  function placeholderSize(options) {
    // A 1920 × 1080 canvas, scaled down to fit the viewport with breathing room.
    const width = Math.min(1920, innerWidth * options.placeholderWidthPercent / 100, innerHeight * 0.8 * 16 / 9);
    return { width, height: width * 9 / 16 };
  }

  function resetJeff() {
    clickTransition = null;
    delete jeffTarget.dataset.timeline;
    delete jeffTarget.dataset.progress;
    eyePlane.style.cssText = originalPlaneStyle;
    eyeBackdrop.style.cssText = originalBackdropStyle;
    eyeField.style.opacity = '';
    jeffMotion.style.transform = 'translate(0px, 0px) scale(1)';
    jeffHoverBlend = 0;
    jeffHovered = false;
    pointerIsActive = false;
    currentBackdropX = currentBackdropY = 0;
    currentBackdropZ = backdropBaseZ;
    currentBackdropRotateX = currentBackdropRotateY = currentBackdropRotateZ = 0;
    lastHoverFrame = lastBackdropFrameTime = performance.now();
    applyBackdropStep(0, 0, backdropBaseZ, 0, 0, 0);
    eyeArt.style.setProperty('--eye-float-x', '0px');
    eyeArt.style.setProperty('--eye-float-y', '0px');
    eyeArt.style.setProperty('--eye-rotate-z', '0deg');
    eyeArt.classList.add('is-revealed');
    jeffTarget.setAttribute('role', 'button');
    jeffTarget.setAttribute('tabindex', '0');
    jeffTarget.setAttribute('aria-label', 'Jeff — click to open the showreel');
    jeffTarget.removeAttribute('aria-disabled');
    setTransitionPhase('idle', 'Ready — click Jeff.');
  }

  function startJeffTransition() {
    if (clickTransition || !eyeReady) return;
    rememberJeffOpened();
    const options = { ...window.jeffTransition.settings };
    if (reducedMotion.matches) {
      options.animationDurationMs = 1;
    }
    const motion = new DOMMatrixReadOnly(getComputedStyle(jeffMotion).transform);
    clickTransition = {
      start: performance.now(), options, complete: false,
      width: eyePlane.offsetWidth, height: eyePlane.offsetHeight,
      centerX: eyePlane.offsetLeft + eyePlane.offsetWidth / 2,
      centerY: eyePlane.offsetTop + eyePlane.offsetHeight / 2,
      scale: Math.hypot(motion.m11, motion.m12),
      lastFrame: performance.now(),
    };
    eyePlane.style.inset = 'auto';
    eyePlane.style.margin = '0';
    eyePlane.style.transformOrigin = 'center';
    jeffTarget.setAttribute('aria-disabled', 'true');
    setTransitionPhase('settling', 'Jeff is calming.');
    updateClickTransition(clickTransition.start);
  }

  function updateLiveGaze(now, deltaSeconds) {
    eyeStates.forEach(eye => {
      updatePointerTarget(eye, now);
      const blend = 1 - (1 - eye.followBlend) ** (deltaSeconds * 60);
      eye.currentLookX = lerp(eye.currentLookX, eye.targetLookX, blend);
      eye.currentLookY = lerp(eye.currentLookY, eye.targetLookY, blend);
      setActiveFrame(eye, getNearestFrame(eye.currentLookX, eye.currentLookY));
    });
  }

  function updatePlaceholderRotation(now, deltaSeconds, state) {
    const rect = eyePlane.getBoundingClientRect();
    const nx = pointerIsActive && rect.width ? clamp((pointerX - rect.left - rect.width * 0.5) / (rect.width * 0.85), -1, 1) : 0;
    const ny = pointerIsActive && rect.height ? clamp((pointerY - rect.top - rect.height * trackingCenterYRatio) / (rect.height * 0.85), -1, 1) : 0;
    const target = ambientRotation(now, nx, ny);
    const progress = clamp((now - state.completedAt) / 700, 0, 1);
    const strength = reducedMotion.matches ? 0 : 0.2 * progress * progress * (3 - 2 * progress);
    const blend = reducedMotion.matches ? 1 : 1 - Math.exp(-backdropRotationFollowSpeed * settings.jeffRotationSpeed * deltaSeconds);
    const rotation = state.placeholderRotation;
    for (const axis of ['x', 'y', 'z']) rotation[axis] = lerp(rotation[axis], target[axis] * strength, blend);
    eyePlane.style.transform = `translate(-50%, -50%) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`;
  }

  function updateClickTransition(now) {
    const state = clickTransition;
    if (!state) return;
    const p = state.options;
    const elapsed = Math.max(now - state.start, 0);
    const deltaSeconds = clamp((now - state.lastFrame) / 1000, 0, 0.05);
    state.lastFrame = now;
    const time = clamp(elapsed / p.animationDurationMs, 0, 1);
    // A single S-curve accelerates through the swap, then slows toward flat.
    // Both halves map this same progress; neither starts a new ease.
    const progress = easeTransition(time, p.easingPower);
    const incoming = progress >= 0.5;
    const faceProgress = incoming ? progress * 2 - 1 : progress * 2;
    const motionWeight = 1 - progress;
    const tiltWeight = motionWeight * (1 + p.tiltCarryPercent / 100 * progress);

    // Gradual shake decay uses the whole timeline, with gentle nonzero floors.
    // Keep this running after the turn so the residual shake remains alive on hover.
    const shakeFade = time * time * (3 - 2 * time);
    const shakeSpeedWeight = lerp(1, 0.3, shakeFade);
    const shakeStrengthWeight = lerp(1, 0.2, shakeFade);
    const hoverTarget = pointerIsActive && jeffHovered ? 1 : 0;
    const hoverBlend = settings.hoverTransitionMs === 0 || reducedMotion.matches
      ? 1 : 1 - Math.exp(-3 * deltaSeconds / (settings.hoverTransitionMs / 1000));
    jeffHoverBlend = lerp(jeffHoverBlend, hoverTarget, hoverBlend);
    shakePhase = (shakePhase + deltaSeconds * settings.shakeSpeedHz * Math.PI * 2 * shakeSpeedWeight) % (Math.PI * 2000);
    const shakeAmount = reducedMotion.matches ? 0 : settings.shakeAmountPx * jeffHoverBlend * shakeStrengthWeight;
    const shakeX = (Math.sin(shakePhase) * 0.7 + Math.sin(shakePhase * 1.7) * 0.3) * shakeAmount;
    const shakeY = (Math.cos(shakePhase * 1.3) * 0.7 + Math.sin(shakePhase * 2.1) * 0.3) * shakeAmount;
    // Preserve the approved 375 ms growth settle as a share of the whole duration.
    const calmTime = p.animationDurationMs * (375 / 2200);
    const calm = 1 - (1 - clamp(elapsed / calmTime, 0, 1)) ** 3;
    jeffMotion.style.transform = `translate(${shakeX}px, ${shakeY}px) scale(${lerp(state.scale, 1, calm)})`;
    if (state.complete) {
      updatePlaceholderRotation(now, deltaSeconds, state);
      return;
    }
    updateEyeBackdropMotion(now);
    updateEyeWiggle(now);
    updateLiveGaze(now, deltaSeconds);
    eyeStates.forEach(eye => {
      updateEyeStackDrift(eye, now);
      for (const property of ['--eye-stack-float-x', '--eye-stack-float-y', '--eye-stack-rotate-z']) {
        const value = parseFloat(eye.root.style.getPropertyValue(property)) || 0;
        eye.root.style.setProperty(property, `${value * tiltWeight}${property.endsWith('-z') ? 'deg' : 'px'}`);
      }
    });

    const size = placeholderSize(p);
    const shape = incoming ? faceProgress : 0;
    const width = lerp(state.width, size.width, shape);
    const height = lerp(state.height, size.height, shape);
    const centerX = lerp(state.centerX, eyeArt.offsetWidth / 2, shape);
    const centerY = lerp(state.centerY, eyeArt.offsetHeight / 2, shape);
    const x = currentBackdropX * motionWeight;
    const y = currentBackdropY * motionWeight;
    const z = currentBackdropZ * motionWeight;
    const rotateX = currentBackdropRotateX * tiltWeight;
    const rotateZ = currentBackdropRotateZ * tiltWeight;
    // Ambient Y eases to zero at the edge so the handoff angles remain exact.
    const ambientY = currentBackdropRotateY * tiltWeight * Math.abs(progress * 2 - 1);
    const rotateY = incoming
      ? lerp(-p.edgeAngleDeg, 0, faceProgress) + ambientY
      : lerp(0, p.edgeAngleDeg, faceProgress) + ambientY;
    const floatX = (parseFloat(eyeArt.style.getPropertyValue('--eye-float-x')) || 0) * motionWeight;
    const floatY = (parseFloat(eyeArt.style.getPropertyValue('--eye-float-y')) || 0) * motionWeight;
    const outerZ = (parseFloat(eyeArt.style.getPropertyValue('--eye-rotate-z')) || 0) * tiltWeight;
    const fadeSpan = Math.min(p.handoffFadeMs, p.animationDurationMs / 2);
    const fade = fadeSpan === 0 ? 1 : clamp(Math.abs(elapsed - p.animationDurationMs / 2) / fadeSpan, 0, 1);
    const opacity = fade * fade * (3 - 2 * fade);
    eyeField.style.opacity = incoming ? '0' : '1';
    eyeBackdrop.style.backgroundImage = incoming ? 'none' : '';
    eyeArt.style.setProperty('--eye-float-x', `${floatX}px`);
    eyeArt.style.setProperty('--eye-float-y', `${floatY}px`);
    eyeArt.style.setProperty('--eye-rotate-z', `${outerZ}deg`);
    eyePlane.style.width = `${width}px`;
    eyePlane.style.height = `${height}px`;
    eyePlane.style.left = `${centerX}px`;
    eyePlane.style.top = `${centerY}px`;
    eyePlane.style.opacity = opacity;
    eyePlane.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    eyeBackdrop.style.borderRadius = `${Math.min(width, height) * lerp(0.07, 0.035, shape)}px`;
    // Read-only preview diagnostics also make the shared midpoint explicit.
    jeffTarget.dataset.timeline = time.toFixed(5);
    jeffTarget.dataset.progress = progress.toFixed(5);
    if (elapsed < calmTime) setTransitionPhase('settling', 'Jeff is calming — gaze and motion stay live.');
    else if (!incoming) setTransitionPhase('turning', 'Turning through the S-curve.');
    else setTransitionPhase('entering', 'Easing from the midpoint to flat.');

    if (time === 1) {
      state.complete = true;
      state.completedAt = now;
      state.placeholderRotation = { x: 0, y: 0, z: 0 };
      jeffTarget.setAttribute('role', 'img');
      jeffTarget.removeAttribute('tabindex');
      jeffTarget.removeAttribute('aria-disabled');
      jeffTarget.setAttribute('aria-label', 'Showreel placeholder, 1920 by 1080');
      setTransitionPhase('complete', 'Complete — showreel is ready.');
    }
  }

  function openCompletedHome() {
    // Returning visitors get the finished surface, with no replay of the intro.
    resetJeff();
    const options = { ...window.jeffTransition.settings };
    const size = placeholderSize(options);
    const now = performance.now();
    eyePlane.style.inset = 'auto';
    eyePlane.style.margin = '0';
    eyePlane.style.transformOrigin = 'center';
    eyePlane.style.width = `${size.width}px`;
    eyePlane.style.height = `${size.height}px`;
    eyePlane.style.left = `${eyeArt.offsetWidth / 2}px`;
    eyePlane.style.top = `${eyeArt.offsetHeight / 2}px`;
    eyePlane.style.opacity = '1';
    eyePlane.style.transform = 'translate(-50%, -50%) translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
    eyeBackdrop.style.backgroundImage = 'none';
    eyeBackdrop.style.borderRadius = `${size.height * 0.035}px`;
    eyeField.style.opacity = '0';
    clickTransition = {
      start: now - options.animationDurationMs, lastFrame: now, options,
      complete: true, width: size.width, height: size.height,
      completedAt: now, placeholderRotation: { x: 0, y: 0, z: 0 },
      centerX: eyeArt.offsetWidth / 2, centerY: eyeArt.offsetHeight / 2, scale: 1,
    };
    jeffTarget.setAttribute('role', 'img');
    jeffTarget.removeAttribute('tabindex');
    jeffTarget.removeAttribute('aria-disabled');
    jeffTarget.setAttribute('aria-label', 'Showreel placeholder, 1920 by 1080');
    setTransitionPhase('complete', 'Complete — showreel is ready.');
  }

  jeffTarget.addEventListener('click', startJeffTransition);
  jeffTarget.addEventListener('keydown', event => {
    if (event.target !== jeffTarget || clickTransition) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      startJeffTransition();
    }
  });
  window.jeffWorkshop.openHome = openCompletedHome;
  window.jeffWorkshop.eyeFrameForLook = (x, y) => getNearestFrame(x, y).src;
  window.jeffWorkshop.reset = resetJeff;
  window.jeffWorkshop.replay = () => { resetJeff(); startJeffTransition(); };
  window.addEventListener('resize', () => {
    if (clickTransition?.complete) {
      const size = placeholderSize(clickTransition.options);
      eyePlane.style.width = `${size.width}px`;
      eyePlane.style.height = `${size.height}px`;
      eyePlane.style.left = `${eyeArt.offsetWidth / 2}px`;
      eyePlane.style.top = `${eyeArt.offsetHeight / 2}px`;
      eyeBackdrop.style.borderRadius = `${size.height * 0.035}px`;
    }
  });

  let eyeAnimationFrame = 0;
  const eyeMotionVisible = () => !document.hidden && !document.body.classList.contains("is-about-open");
  function animateEye(now) {
    eyeAnimationFrame = 0;
    if (!eyeMotionVisible()) return;
    const frameNow = typeof now === "number" ? now : performance.now();
    if (clickTransition) {
      updateClickTransition(frameNow);
      eyeAnimationFrame = requestAnimationFrame(animateEye);
      return;
    }
    const deltaSeconds = Math.min(Math.max((frameNow - lastHoverFrame) / 1000, 0), 0.05);
    lastHoverFrame = frameNow;
    shakePhase = (shakePhase + deltaSeconds * settings.shakeSpeedHz * Math.PI * 2) % (Math.PI * 2000);
    updateEyeBackdropMotion(frameNow);
    updateEyeWiggle(frameNow);
    eyeStates.forEach((eyeState) => {
      updateEyeStackDrift(eyeState, frameNow);
    });
    // One transform moves the red square and every eye together as Jeff.
    const target = pointerIsActive && jeffHovered ? 1 : 0;
    const blend = settings.hoverTransitionMs === 0 || reducedMotion.matches
      ? 1 : 1 - Math.exp(-3 * deltaSeconds / (settings.hoverTransitionMs / 1000));
    jeffHoverBlend = lerp(jeffHoverBlend, target, blend);
    const amount = reducedMotion.matches ? 0 : settings.shakeAmountPx * jeffHoverBlend;
    const shakeX = (Math.sin(shakePhase) * 0.7 + Math.sin(shakePhase * 1.7) * 0.3) * amount;
    const shakeY = (Math.cos(shakePhase * 1.3) * 0.7 + Math.sin(shakePhase * 2.1) * 0.3) * amount;
    const scale = 1 + settings.jeffGrowthPercent / 100 * jeffHoverBlend;
    jeffMotion.style.transform = `translate(${shakeX.toFixed(3)}px, ${shakeY.toFixed(3)}px) scale(${scale.toFixed(4)})`;

    if (eyeReady && eyeFrames.length) updateLiveGaze(frameNow, deltaSeconds);

    eyeAnimationFrame = requestAnimationFrame(animateEye);
  }

  function syncEyeAnimation() {
    cancelAnimationFrame(eyeAnimationFrame);
    eyeAnimationFrame = 0;
    lastHoverFrame = performance.now();
    if (eyeMotionVisible()) eyeAnimationFrame = requestAnimationFrame(animateEye);
  }
  document.addEventListener('visibilitychange', syncEyeAnimation);
  new MutationObserver(syncEyeAnimation).observe(document.querySelector('#workshop-about'), {attributes:true,attributeFilter:['hidden']});
  syncEyeAnimation();
})();
