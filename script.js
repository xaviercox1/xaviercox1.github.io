// script.js
// Custom cursor + center sandpile avalanche simulation
// - Cursor has a blur "lens" under it
// - Sandpile sim in center
// - SPEED variable controls how fast it evolves
// - Clicking the simulation resets it

// === Custom cursor + blur lens ===
const cursorDot = document.querySelector(".cursor-dot");
const cursorBlur = document.querySelector(".cursor-blur");
const cursorModeQuery = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
const CURSOR_RENDER_OFFSET_X = 0;
const CURSOR_RENDER_OFFSET_Y = 0;

if (cursorDot) {
  const homeOrbitPanel = null;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  const idleDelayDuration = 1050;
  const idleFadeDuration = 450;
  const idleMovementThreshold = 1.5;
  const baseScaleSmoothing = 13;
  const cursorProjectionSmoothing = 10;
  let overEmbeddedFrame = false;
  let customCursorEnabled = cursorModeQuery.matches;
  let lastActivityX = mouseX;
  let lastActivityY = mouseY;
  let lastActivityTime = performance.now();
  let pointerIsDown = false;
  let currentBaseScale = 1;
  let lastFrameTime = performance.now();
  let cursorProjectionX = 0;
  let cursorProjectionY = 0;
  let cursorProjectionBaseX = 0;
  let cursorProjectionBaseY = 0;
  let cursorProjectionTargetX = 0;
  let cursorProjectionTargetY = 0;
  let homePanelProximity = 0;
  let homePanelHovering = false;

  function resetCursorIdleState() {
    lastActivityTime = performance.now();
    pointerIsDown = false;
  }

  function getTargetBaseScale() {
    return cursorDot.classList.contains("cursor-dot--link") ? 1.6 : 1;
  }

  function getIdleVisualState(now, options = {}) {
    const { includePressedState = true } = options;

    if (
      (includePressedState && pointerIsDown) ||
      overEmbeddedFrame ||
      !customCursorEnabled ||
      !cursorDot.classList.contains("is-visible")
    ) {
      return { scaleFactor: 1, opacity: 1 };
    }

    const idleElapsed = now - lastActivityTime;
    if (idleElapsed <= idleDelayDuration) {
      return { scaleFactor: 1, opacity: 1 };
    }

    const idleProgress = Math.min((idleElapsed - idleDelayDuration) / idleFadeDuration, 1);
    if (idleProgress >= 1) {
      return { scaleFactor: 0, opacity: 0 };
    }

    const acceleratedProgress = Math.pow(idleProgress, 1.85);
    const scaleFactor = 1 - acceleratedProgress;
    const opacity = 1 - Math.pow(idleProgress, 0.92);
    return { scaleFactor, opacity };
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function noteCursorActivity() {
    lastActivityTime = performance.now();
  }

  function resetCursorProjection() {
    cursorProjectionX = 0;
    cursorProjectionY = 0;
    cursorProjectionBaseX = 0;
    cursorProjectionBaseY = 0;
    cursorProjectionTargetX = 0;
    cursorProjectionTargetY = 0;
  }

  function resetHomeOrbitPanelMotion() {
    homePanelProximity = 0;
    homePanelHovering = false;
    if (!homeOrbitPanel) return;
    homeOrbitPanel.style.setProperty("--home-page-float-x", "0px");
    homeOrbitPanel.style.setProperty("--home-page-float-y", "0px");
    homeOrbitPanel.style.setProperty("--home-page-float-z", "0px");
    homeOrbitPanel.style.setProperty("--home-page-dynamic-rotate-y", "0deg");
    homeOrbitPanel.style.setProperty("--home-page-dynamic-rotate-x", "0deg");
    homeOrbitPanel.style.setProperty("--home-page-dynamic-rotate-z", "0deg");
  }

  function updateCursorProjectionTarget(pointerX, pointerY, eventTarget) {
    cursorProjectionBaseX = 0;
    cursorProjectionBaseY = 0;
    homePanelHovering = false;

    if (!homeOrbitPanel || window.innerWidth <= 600) {
      return;
    }

    if (!(eventTarget instanceof Element)) {
      return;
    }

    homePanelHovering = Boolean(eventTarget.closest(".home-page .page"));
  }

  function updateHomeOrbitPanelMotion(frameNow, deltaSeconds) {
    if (!homeOrbitPanel || window.innerWidth <= 600) {
      resetHomeOrbitPanelMotion();
      return;
    }

    const rect = homeOrbitPanel.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      resetHomeOrbitPanelMotion();
      return;
    }

    let proximityTarget = 0;
    if (
      customCursorEnabled &&
      !overEmbeddedFrame &&
      cursorDot.classList.contains("is-visible")
    ) {
      if (homePanelHovering) {
        proximityTarget = 1;
      } else {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.hypot(mouseX - centerX, mouseY - centerY);
        const flatRadius = Math.max(rect.width * 1.2, 420);
        const releaseRadius = flatRadius + Math.max(rect.width * 0.65, 180);

        if (distance <= flatRadius) {
          proximityTarget = 1;
        } else {
          const releaseProgress = Math.min(
            Math.max((distance - flatRadius) / (releaseRadius - flatRadius), 0),
            1
          );
          const easedRelease =
            releaseProgress * releaseProgress * (3 - 2 * releaseProgress);
          proximityTarget = 1 - easedRelease;
        }
      }
    }

    const proximityBlend = 1 - Math.exp(-4.2 * deltaSeconds);
    homePanelProximity = lerp(homePanelProximity, proximityTarget, proximityBlend);

    const time = frameNow * 0.001;
    const wiggleStrength = 1 - homePanelProximity * 0.92;
    const orbitX = (Math.cos(time * 0.56) * 5.2 + Math.sin(time * 0.31) * 1.9) * wiggleStrength;
    const orbitY = Math.sin(time * 0.44) * 3.4 * wiggleStrength;
    const orbitZ =
      (Math.sin(time * 0.36) * 3.8 + Math.cos(time * 0.21) * 1.4) * wiggleStrength +
      homePanelProximity * 8;
    const dynamicRotateY =
      Math.sin(time * 0.42) * 2.1 * wiggleStrength + homePanelProximity * 11;
    const dynamicRotateX =
      Math.cos(time * 0.34) * 1.15 * wiggleStrength - homePanelProximity * 4;
    const dynamicRotateZ =
      Math.sin(time * 0.29) * 0.95 * wiggleStrength - homePanelProximity * 2;

    homeOrbitPanel.style.setProperty("--home-page-float-x", orbitX.toFixed(2) + "px");
    homeOrbitPanel.style.setProperty("--home-page-float-y", orbitY.toFixed(2) + "px");
    homeOrbitPanel.style.setProperty("--home-page-float-z", orbitZ.toFixed(2) + "px");
    homeOrbitPanel.style.setProperty(
      "--home-page-dynamic-rotate-y",
      dynamicRotateY.toFixed(2) + "deg"
    );
    homeOrbitPanel.style.setProperty(
      "--home-page-dynamic-rotate-x",
      dynamicRotateX.toFixed(2) + "deg"
    );
    homeOrbitPanel.style.setProperty(
      "--home-page-dynamic-rotate-z",
      dynamicRotateZ.toFixed(2) + "deg"
    );
  }

  function setCustomCursorEnabled(enabled) {
    customCursorEnabled = enabled;
    document.documentElement.classList.toggle("has-custom-cursor", enabled);

    if (!enabled) {
      overEmbeddedFrame = false;
      cursorDot.classList.remove("is-visible");
      cursorDot.classList.remove("cursor-dot--link");
      resetCursorIdleState();
      currentBaseScale = 1;
      resetCursorProjection();
      resetHomeOrbitPanelMotion();
      if (cursorBlur) {
        cursorBlur.style.opacity = "0";
      }
      return;
    }

    if (cursorBlur) {
      cursorBlur.style.opacity = "";
    }
  }

  function hideCustomCursor() {
    cursorDot.classList.remove("is-visible");
    cursorDot.classList.remove("cursor-dot--link");
    resetCursorIdleState();
    currentBaseScale = 1;
    resetCursorProjection();
    if (cursorBlur) {
      cursorBlur.style.opacity = "0";
    }
  }

  function restoreCustomCursorEffects() {
    if (cursorBlur && !overEmbeddedFrame) {
      cursorBlur.style.opacity = "";
    }
  }

  function applyCursorRenderPosition(renderX, renderY) {
    cursorDot.style.left = renderX + "px";
    cursorDot.style.top = renderY + "px";

    if (cursorBlur) {
      cursorBlur.style.left = renderX + "px";
      cursorBlur.style.top = renderY + "px";
    }
  }

  function renderCursorAtCurrentPointer() {
    const renderX = mouseX + cursorProjectionX + CURSOR_RENDER_OFFSET_X;
    const renderY = mouseY + cursorProjectionY + CURSOR_RENDER_OFFSET_Y;
    applyCursorRenderPosition(renderX, renderY);
  }

  function handleCursorModeChange(event) {
    setCustomCursorEnabled(event.matches);
  }

  if (typeof cursorModeQuery.addEventListener === "function") {
    cursorModeQuery.addEventListener("change", handleCursorModeChange);
  } else if (typeof cursorModeQuery.addListener === "function") {
    cursorModeQuery.addListener(handleCursorModeChange);
  }

  setCustomCursorEnabled(customCursorEnabled);

  window.addEventListener("pointermove", (event) => {
    if (!customCursorEnabled) return;
    mouseX = event.clientX;
    mouseY = event.clientY;
    updateCursorProjectionTarget(mouseX, mouseY, event.target);
    renderCursorAtCurrentPointer();
    if (!overEmbeddedFrame) {
      const movementDistance = Math.hypot(mouseX - lastActivityX, mouseY - lastActivityY);
      const movedEnough =
        !cursorDot.classList.contains("is-visible") ||
        movementDistance >= idleMovementThreshold;

      restoreCustomCursorEffects();
      cursorDot.classList.add("is-visible");
      if (movedEnough) {
        lastActivityX = mouseX;
        lastActivityY = mouseY;
        noteCursorActivity();
      }
    }
  });

  document.addEventListener("mouseleave", () => {
    if (!customCursorEnabled) return;
    hideCustomCursor();
  });

  document.addEventListener("mouseout", (event) => {
    if (!customCursorEnabled) return;
    if (event.relatedTarget || event.toElement) return;
    hideCustomCursor();
  });

  window.addEventListener("blur", () => {
    if (!customCursorEnabled) return;
    hideCustomCursor();
  });

  document.addEventListener("visibilitychange", () => {
    if (!customCursorEnabled) return;
    if (document.visibilityState !== "visible") {
      hideCustomCursor();
    }
  });

  document.addEventListener("mousedown", (event) => {
    if (!customCursorEnabled) return;
    pointerIsDown = true;
    if (event.button === 0) {
      cursorDot.classList.add("cursor-dot--link");
    }

    if (!overEmbeddedFrame) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      updateCursorProjectionTarget(mouseX, mouseY, event.target);
      renderCursorAtCurrentPointer();
      lastActivityX = mouseX;
      lastActivityY = mouseY;
      restoreCustomCursorEffects();
      cursorDot.classList.add("is-visible");
      noteCursorActivity();
    }
  });

  document.addEventListener("mouseup", (event) => {
    if (!customCursorEnabled) return;
    pointerIsDown = false;
    cursorDot.classList.remove("cursor-dot--link");
    if (!overEmbeddedFrame) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      updateCursorProjectionTarget(mouseX, mouseY, event.target);
      renderCursorAtCurrentPointer();
      lastActivityX = mouseX;
      lastActivityY = mouseY;
      restoreCustomCursorEffects();
      cursorDot.classList.add("is-visible");
      noteCursorActivity();
    }
  });

  const embeddedFrames = document.querySelectorAll(".video-hero iframe");
  embeddedFrames.forEach((frame) => {
    frame.addEventListener("mouseenter", () => {
      if (!customCursorEnabled) return;
      overEmbeddedFrame = true;
      hideCustomCursor();
    });

    frame.addEventListener("mouseleave", () => {
      if (!customCursorEnabled) return;
      overEmbeddedFrame = false;
      if (cursorBlur) {
        cursorBlur.style.opacity = "";
      }
    });
  });

  function animateCursor(now) {
    const frameNow = typeof now === "number" ? now : performance.now();
    const deltaSeconds = Math.min((frameNow - lastFrameTime) / 1000, 0.05);
    lastFrameTime = frameNow;

    if (!customCursorEnabled) {
      requestAnimationFrame(animateCursor);
      return;
    }

    updateHomeOrbitPanelMotion(frameNow, deltaSeconds);
    const projectionFalloff = 1 - homePanelProximity;
    cursorProjectionTargetX = cursorProjectionBaseX * projectionFalloff;
    cursorProjectionTargetY = cursorProjectionBaseY * projectionFalloff;
    const projectionBlend = 1 - Math.exp(-cursorProjectionSmoothing * deltaSeconds);
    cursorProjectionX = lerp(cursorProjectionX, cursorProjectionTargetX, projectionBlend);
    cursorProjectionY = lerp(cursorProjectionY, cursorProjectionTargetY, projectionBlend);

    const renderX = mouseX + cursorProjectionX + CURSOR_RENDER_OFFSET_X;
    const renderY = mouseY + cursorProjectionY + CURSOR_RENDER_OFFSET_Y;

    applyCursorRenderPosition(renderX, renderY);

    const cursorVisible = cursorDot.classList.contains("is-visible");
    const idleState = getIdleVisualState(frameNow);
    const targetBaseScale = getTargetBaseScale();
    const baseScaleBlend = 1 - Math.exp(-baseScaleSmoothing * deltaSeconds);
    currentBaseScale = lerp(currentBaseScale, targetBaseScale, baseScaleBlend);

    const renderScale = cursorVisible ? currentBaseScale * idleState.scaleFactor : currentBaseScale;
    const renderOpacity = cursorVisible ? idleState.opacity : 0;

    cursorDot.style.setProperty("--cursor-scale", renderScale.toFixed(4));
    cursorDot.style.opacity = renderOpacity.toFixed(4);

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}

// === Center eye art ===
(function () {
  const eyeArt = document.querySelector(".eye-art");
  const eyePlane = eyeArt?.querySelector(".eye-plane");
  const eyeBackdrop = eyeArt?.querySelector(".eye-backdrop");
  const eyeField = eyeArt?.querySelector(".eye-field");
  if (!eyeArt || !eyePlane || !eyeBackdrop || !eyeField) return;
  eyeArt.classList.add("is-loading-media");

  const frameBasePath = "WebArt/Eye/eyeball_png_sequence/";
  const eyeFrames = [
    { filename: "centre.png", lookX: 0, lookY: 0, idleWeight: 4.2 },
    { filename: "left.png", lookX: -1, lookY: 0, idleWeight: 0.6 },
    { filename: "right.png", lookX: 1, lookY: 0, idleWeight: 0.6 },
    { filename: "up.png", lookX: 0, lookY: -1, idleWeight: 0.45 },
    { filename: "down.png", lookX: 0, lookY: 1, idleWeight: 0.45 },
    { filename: "leftup.png", lookX: -1, lookY: -1, idleWeight: 0.28 },
    { filename: "rightup.png", lookX: 1, lookY: -1, idleWeight: 0.28 },
    { filename: "leftdown.png", lookX: -1, lookY: 1, idleWeight: 0.28 },
    { filename: "rightdown.png", lookX: 1, lookY: 1, idleWeight: 0.28 },
    { filename: "slightleftup.png", lookX: -0.56, lookY: -0.52, idleWeight: 1.1 },
    { filename: "slightrightup.png", lookX: 0.56, lookY: -0.52, idleWeight: 1.1 },
    { filename: "slightleftdown.png", lookX: -0.56, lookY: 0.52, idleWeight: 1.1 },
    { filename: "slightrightdown.png", lookX: 0.56, lookY: 0.52, idleWeight: 1.1 },
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
      eyeArt.classList.remove("is-loading-media");
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

    if (isEyeIdling(frameNow)) {
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
    const orbitRotateX = Math.cos(time * 0.41) * 3.2;
    const orbitRotateY = Math.sin(time * 0.38) * 4.1;
    const orbitRotateZ = Math.sin(time * 0.25) * 4.8;
    const targetX = orbitX + normalizedX * 8;
    const targetY = orbitY + normalizedY * 7;
    const targetZ = backdropBaseZ + orbitZ + Math.abs(normalizedX) * 3;
    const targetRotateX = orbitRotateX - normalizedY * 16;
    const targetRotateY = orbitRotateY + normalizedX * 19;
    const targetRotateZ = orbitRotateZ + normalizedX * -4.2 + normalizedY * 2.6;
    const positionBlend = 1 - Math.exp(-backdropPositionFollowSpeed * deltaSeconds);
    const rotationBlend = 1 - Math.exp(-backdropRotationFollowSpeed * deltaSeconds);

    currentBackdropX = lerp(currentBackdropX, targetX, positionBlend);
    currentBackdropY = lerp(currentBackdropY, targetY, positionBlend);
    currentBackdropZ = lerp(currentBackdropZ, targetZ, positionBlend);
    currentBackdropRotateX = lerp(currentBackdropRotateX, targetRotateX, rotationBlend);
    currentBackdropRotateY = lerp(currentBackdropRotateY, targetRotateY, rotationBlend);
    currentBackdropRotateZ = lerp(currentBackdropRotateZ, targetRotateZ, rotationBlend);

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

  function animateEye(now) {
    const frameNow = typeof now === "number" ? now : performance.now();
    updateEyeBackdropMotion(frameNow);
    updateEyeWiggle(frameNow);
    eyeStates.forEach((eyeState) => {
      updateEyeStackDrift(eyeState, frameNow);
    });

    if (eyeReady && eyeFrames.length) {
      eyeStates.forEach((eyeState) => {
        updatePointerTarget(eyeState, frameNow);
        eyeState.currentLookX +=
          (eyeState.targetLookX - eyeState.currentLookX) * eyeState.followBlend;
        eyeState.currentLookY +=
          (eyeState.targetLookY - eyeState.currentLookY) * eyeState.followBlend;
        setActiveFrame(eyeState, getNearestFrame(eyeState.currentLookX, eyeState.currentLookY));
      });
    }

    requestAnimationFrame(animateEye);
  }

  animateEye();
})();

// === Sandpile simulation ===
(function () {
  const canvas = document.getElementById("sandpile");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;

  // >>> Adjust this to control speed <<<
  // Higher SPEED -> more grains and topples per frame -> faster, more intense sim
  const SPEED = 40; // try values between 1 and ~40

  // Logical grid size (rendered pixelated & scaled via CSS)
  const N = 300;
  const threshold = 4; // K = 4: classic Abelian sandpile
  const GRAINS_PER_FRAME = SPEED;
  const TOPPLES_PER_FRAME = 4000 * SPEED;
  canvas.width = N;
  canvas.height = N;

  const size = N * N;
  const grid = new Int32Array(size);
  const active = [];
  const queued = new Uint8Array(size);
  const centerX = (N / 2) | 0;
  const centerY = (N / 2) | 0;
  const centerIndex = centerY * N + centerX;

  // Keep the existing palette, though the classic stable sandpile only uses heights 0-3.
  const palette = [
    [0, 0, 0],        // 0
    [60, 80, 200],    // 1
    [80, 160, 240],   // 2
    [180, 220, 255],  // 3
    [240, 240, 240],  // 4
    [255, 210, 150],  // 5
    [255, 140, 80],   // 6
    [220, 60, 60],    // 7
  ];

  const imageData = ctx.createImageData(N, N);
  const data = imageData.data;
  let needsDraw = true;

  function idx(x, y) {
    return y * N + x;
  }

  function queueIfUnstable(i) {
    if (grid[i] >= threshold && !queued[i]) {
      queued[i] = 1;
      active.push(i);
    }
  }

  function addGrainAtCenter() {
    grid[centerIndex] += 1;
    queueIfUnstable(centerIndex);
    needsDraw = true;
  }

  function toppleNext() {
    if (!active.length) return 0;

    const i = active.pop();
    queued[i] = 0;

    const h = grid[i];
    if (h < threshold) return 0;

    const t = (h / threshold) | 0;
    const x = i % N;
    const y = (i / N) | 0;

    grid[i] -= t * threshold;
    queueIfUnstable(i);

    if (x > 0) {
      const left = i - 1;
      grid[left] += t;
      queueIfUnstable(left);
    }

    if (x < N - 1) {
      const right = i + 1;
      grid[right] += t;
      queueIfUnstable(right);
    }

    if (y > 0) {
      const up = i - N;
      grid[up] += t;
      queueIfUnstable(up);
    }

    if (y < N - 1) {
      const down = i + N;
      grid[down] += t;
      queueIfUnstable(down);
    }

    needsDraw = true;
    return t;
  }

  function draw() {
    let p = 0;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        // Classical Abelian piles stabilize into heights 0-3.
        const h = Math.min(grid[idx(x, y)], threshold - 1);
        const c = palette[h];
        data[p++] = c[0]; // R
        data[p++] = c[1]; // G
        data[p++] = c[2]; // B
        data[p++] = 255;  // A
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // Reset simulation (used on click)
  function resetSandpile() {
    grid.fill(0);
    queued.fill(0);
    active.length = 0;
    needsDraw = true;
  }

  // Keep the background non-selectable/non-draggable while still allowing
  // clicks in the canvas region to reset the simulation.
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    if (window.getSelection()?.type === "Range") return;
    if (event.target.closest(".page, a, button, input, textarea, label")) return;

    const rect = canvas.getBoundingClientRect();
    const clickedInsideCanvas =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    if (clickedInsideCanvas) {
      resetSandpile();
    }
  });

  function step() {
    let grainsRemaining = GRAINS_PER_FRAME;
    let topples = 0;

    while (topples < TOPPLES_PER_FRAME) {
      if (active.length > 0) {
        topples += toppleNext();
        continue;
      }

      if (grainsRemaining <= 0) {
        break;
      }

      addGrainAtCenter();
      grainsRemaining -= 1;
    }

    if (needsDraw) {
      draw();
      needsDraw = false;
    }

    requestAnimationFrame(step);
  }

  step();
})();


// === Page reveal animation (blur + opacity + optional directional slide) ===
(function () {
  const items = Array.from(document.querySelectorAll(".reveal, .reveal-right"));
  if (!items.length) return;

  const autoStagger = 120; // ms per item if no data-delay is provided

  requestAnimationFrame(() => {
    items.forEach((el, i) => {
      const delayAttr = el.getAttribute("data-delay");
      const delay = delayAttr !== null ? Number(delayAttr) : i * autoStagger;

      setTimeout(() => {
        el.classList.add("is-visible");
      }, delay);
    });
  });
})();

// === Shared media loading indicator ===
(function () {
  const mediaSelector = "img, video, iframe";
  const wrapperSelector = [
    ".g-media",
    ".video-hero",
    ".industrique-gallery",
    ".industrique-video-shell",
    ".gallery-stage-media",
    ".intrinsik-landscape-shell",
  ].join(", ");

  function getLoaderTarget(media) {
    if (media.classList.contains("industrique-screen-video")) return null;
    return media.closest(wrapperSelector) || media.parentElement;
  }

  function isReady(media) {
    if (media.tagName === "IMG") {
      return media.complete && media.naturalWidth > 0;
    }

    if (media.tagName === "VIDEO") {
      if (!media.currentSrc && !media.getAttribute("src") && !media.querySelector("source")) {
        return true;
      }
      return media.readyState >= 2;
    }

    if (media.tagName === "IFRAME") {
      return media.dataset.loaderReady === "1";
    }

    return true;
  }

  function syncMedia(media) {
    const target = getLoaderTarget(media);
    if (!target) return;
    target.classList.toggle("is-loading-media", !isReady(media));
  }

  function bindMedia(media) {
    if (media.dataset.loaderBound === "1") {
      syncMedia(media);
      return;
    }

    media.dataset.loaderBound = "1";
    syncMedia(media);

    if (media.tagName === "IMG") {
      media.addEventListener("load", () => syncMedia(media));
      media.addEventListener("error", () => syncMedia(media));
      return;
    }

    if (media.tagName === "VIDEO") {
      ["loadstart", "waiting", "loadeddata", "canplay", "playing", "error"].forEach((eventName) => {
        media.addEventListener(eventName, () => syncMedia(media));
      });
      return;
    }

    if (media.tagName === "IFRAME") {
      media.addEventListener("load", () => {
        media.dataset.loaderReady = "1";
        syncMedia(media);
      });
    }
  }

  function bindAll(root = document) {
    root.querySelectorAll(mediaSelector).forEach(bindMedia);
  }

  bindAll();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches(mediaSelector)) {
          bindMedia(node);
        }
        bindAll(node);
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

// === Local file fallback for YouTube embeds ===
(function () {
  if (window.location.protocol !== "file:") return;

  const youtubeFrames = Array.from(document.querySelectorAll(".video-hero iframe")).filter((frame) =>
    /youtube(?:-nocookie)?\.com\/embed\//.test(frame.src)
  );

  youtubeFrames.forEach((frame) => {
    let videoId = "";

    try {
      const url = new URL(frame.src);
      const match = url.pathname.match(/\/embed\/([^/?]+)/);
      videoId = match ? match[1] : "";
    } catch (_error) {
      videoId = "";
    }

    const fallback = document.createElement("div");
    fallback.className = "video-embed-fallback";

    const eyebrow = document.createElement("p");
    eyebrow.className = "video-embed-fallback__eyebrow";
    eyebrow.textContent = "Local preview";

    const title = document.createElement("h2");
    title.className = "video-embed-fallback__title";
    title.textContent = frame.title || "Video";

    const text = document.createElement("p");
    text.className = "video-embed-fallback__text";
    text.textContent = "YouTube blocks embedded playback when this page is opened directly as a local file.";

    const actions = document.createElement("div");
    actions.className = "video-embed-fallback__actions";

    const openLink = document.createElement("a");
    openLink.href = videoId ? `https://youtu.be/${videoId}` : "https://www.youtube.com/";
    openLink.target = "_blank";
    openLink.rel = "noreferrer";
    openLink.textContent = "Open on YouTube";

    const serverHint = document.createElement("p");
    serverHint.className = "video-embed-fallback__hint";
    serverHint.textContent = "To preview the embed here, serve the folder over localhost instead of opening the HTML file directly.";

    actions.appendChild(openLink);
    fallback.appendChild(eyebrow);
    fallback.appendChild(title);
    fallback.appendChild(text);
    fallback.appendChild(actions);
    fallback.appendChild(serverHint);

    frame.replaceWith(fallback);
  });
})();

// === Live VJ: 3D carousel + grid toggle (placeholders) ===
// === Live VJ: Sphere carousel + FLIP grid toggle ===
// === Live VJ: Click-to-expand grid with FLIP animation ===
(function () {
  const grid = document.getElementById("vjGrid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".vj-card"));
  let expanded = null;

  function flip(applyLayoutChange) {
    const first = new Map();
    cards.forEach((c) => first.set(c, c.getBoundingClientRect()));

    applyLayoutChange();

    const last = new Map();
    cards.forEach((c) => last.set(c, c.getBoundingClientRect()));

    cards.forEach((c) => {
      const f = first.get(c);
      const l = last.get(c);
      if (!f || !l) return;

      const dx = f.left - l.left;
      const dy = f.top - l.top;
      const sx = f.width / l.width;
      const sy = f.height / l.height;

      c.classList.add("is-flipping");
      c.style.transformOrigin = "top left";
      c.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    });

    requestAnimationFrame(() => {
      cards.forEach((c) => {
        c.style.transform = "";
        c.style.transformOrigin = "";
      });

      setTimeout(() => {
        cards.forEach((c) => c.classList.remove("is-flipping"));
      }, 650);
    });
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      flip(() => {
        // toggle expanded state
        if (expanded === card) {
          card.classList.remove("is-expanded");
          expanded = null;
        } else {
          if (expanded) expanded.classList.remove("is-expanded");
          card.classList.add("is-expanded");
          expanded = card;
        }
      });
    });
  });

  // optional: ESC to close expanded
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && expanded) {
      flip(() => {
        expanded.classList.remove("is-expanded");
        expanded = null;
      });
    }
  });
})();

// === Live VJ video forward / back navigation ===
(function () {
  const video = document.getElementById("vjVideo");
  if (!video) return;

  const sources = [
    "landscape-promo.mp4",
    "landscape-promo2.mp4",
  ];

  let index = 0;

  function swapVideo(newIndex) {
    index = (newIndex + sources.length) % sources.length;

    // soft fade out
    video.style.transition = "opacity 300ms ease, filter 300ms ease";
    video.style.opacity = "0";
    video.style.filter = "blur(6px)";

    setTimeout(() => {
      video.src = sources[index];
      video.load();
      video.play();

      // fade back in
      video.style.opacity = "1";
      video.style.filter = "blur(0px)";
    }, 300);
  }

  document.getElementById("nextVideo")?.addEventListener("click", () => {
    swapVideo(index + 1);
  });

  document.getElementById("prevVideo")?.addEventListener("click", () => {
    swapVideo(index - 1);
  });
})();

// === Live VJ: sound bar (muted by default) + cursor solid on clickable UI ===
// === Live VJ: simple sound toggle (muted by default) + cursor feedback ===
(function () {
  const video = document.getElementById("vjVideo");
  if (!video) return;

  const soundToggle = document.getElementById("soundToggle");
  // ensure muted on load
  video.muted = true;

  function updateLabel() {
    soundToggle.textContent = video.muted ? "sound" : "mute";
    soundToggle.setAttribute(
      "aria-label",
      video.muted ? "Enable sound" : "Mute sound"
    );
  }

  function toggleSound() {
    video.muted = !video.muted;
    updateLabel();
  }

  soundToggle.addEventListener("click", () => {
    toggleSound();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("a, button, input, textarea, select, label")) return;
    toggleSound();
  });

  updateLabel();

})();
