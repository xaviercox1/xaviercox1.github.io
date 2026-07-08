(function () {
  const page = document.body;
  const space = document.querySelector(".microcosm-secret-space");
  const zoomFill = document.getElementById("microZoomFill");
  const zoomReadout = document.getElementById("microZoomReadout");
  const interfaceSwitch = document.querySelector(".microcosm-secret-interface-switch");
  const panelNodes = Array.from(document.querySelectorAll(".microcosm-secret-panel"));

  if (!page || !space || !panelNodes.length) return;

  const panelWorld = {
    title: { x: 0, y: 0, z: 1350 },
    one: { x: -430, y: -295, z: 1350 },
    two: { x: 430, y: -295, z: 1350 },
    three: { x: -560, y: 0, z: 1350 },
    four: { x: 560, y: 0, z: 1350 },
    five: { x: -290, y: 320, z: 1350 },
    six: { x: 290, y: 320, z: 1350 },
  };

  const panels = panelNodes.map((node) => {
    const id = node.dataset.panel || "";
    const world = panelWorld[id] || { x: 0, y: 0, z: 1350 };
    return {
      node,
      loader: node.querySelector(".microcosm-panel-loader"),
      video: node.querySelector(".microcosm-panel-video"),
      id,
      world,
      angleYaw: Math.atan2(world.x, world.z) * 180 / Math.PI,
      anglePitch: Math.atan2(world.y, world.z) * 180 / Math.PI,
      ready: false,
      currentVolume: node.classList.contains("microcosm-secret-panel--title") ? 0.72 : 0,
      targetVolume: node.classList.contains("microcosm-secret-panel--title") ? 0.72 : 0,
      screenX: 0,
      screenY: 0,
      cameraDepth: 0,
      visible: true,
    };
  });

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let pointerActive = false;
  let hoveredPanel = null;
  let audioAllowed = true;
  let hasTriedUnlock = false;
  let cameraYaw = 0;
  let cameraPitch = 0;
  let currentFocalLength = 24;
  let zoomProgress = 0;
  let orientationActive = false;
  let orientationPermissionRequested = false;
  let orientationListenerBound = false;
  let orientationNeutral = null;
  let orientationYaw = 0;
  let orientationPitch = 0;
  let pinchStartDistance = 0;
  let pinchStartZoomProgress = 0;

  const minFocalLength = 24;
  const maxFocalLength = 70;
  const minPanelOnsetDelay = 1000;
  const maxPanelOnsetDelay = 2200;
  const mediaReadyState = typeof HTMLMediaElement === "undefined" ? 2 : HTMLMediaElement.HAVE_CURRENT_DATA;
  const exitCursorZone = 104;
  const interfaceCursorPadding = 30;
  const coarsePointerQuery = window.matchMedia?.("(any-pointer: coarse)");

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function lerp(start, end, amount) {
    return start + (end - start) * amount;
  }

  function sleep(duration) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, duration);
    });
  }

  function getPanelOnsetDelay() {
    return minPanelOnsetDelay + Math.random() * (maxPanelOnsetDelay - minPanelOnsetDelay);
  }

  function toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  function toDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  function getPointerNormal() {
    return {
      x: clamp((pointerX / Math.max(window.innerWidth, 1) - 0.5) * 2, -1, 1),
      y: clamp((pointerY / Math.max(window.innerHeight, 1) - 0.5) * 2, -1, 1),
    };
  }

  function isPointerNearElement(element, padding = 0) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();

    return (
      pointerX >= rect.left - padding &&
      pointerX <= rect.right + padding &&
      pointerY >= rect.top - padding &&
      pointerY <= rect.bottom + padding
    );
  }

  function updateExitCursorState() {
    const isNearBackArrow = pointerX <= exitCursorZone && pointerY <= exitCursorZone;
    const isNearInterfaceSwitch = isPointerNearElement(interfaceSwitch, interfaceCursorPadding);

    page.classList.toggle(
      "is-exit-cursor",
      isNearBackArrow || isNearInterfaceSwitch
    );
  }

  function getPointerLookAngles() {
    const pointerNormal = getPointerNormal();
    return {
      yaw: pointerNormal.x * 32,
      pitch: pointerNormal.y * 21,
    };
  }

  function isLookInputActive() {
    return pointerActive || orientationActive;
  }

  function getLookAngles() {
    if (orientationActive) {
      return {
        yaw: orientationYaw,
        pitch: orientationPitch,
      };
    }

    return getPointerLookAngles();
  }

  function getScreenAngle() {
    const rawAngle =
      screen.orientation?.angle ??
      window.orientation ??
      0;
    const normalized = ((Number(rawAngle) % 360) + 360) % 360;
    return normalized;
  }

  function getOrientationDeltas(event) {
    const beta = typeof event.beta === "number" ? event.beta : null;
    const gamma = typeof event.gamma === "number" ? event.gamma : null;

    if (beta === null || gamma === null) return null;

    if (!orientationNeutral) {
      orientationNeutral = {
        beta,
        gamma,
      };
    }

    const betaDelta = beta - orientationNeutral.beta;
    const gammaDelta = gamma - orientationNeutral.gamma;

    switch (getScreenAngle()) {
      case 90:
        return { yaw: betaDelta, pitch: -gammaDelta };
      case 270:
        return { yaw: -betaDelta, pitch: gammaDelta };
      case 180:
        return { yaw: -gammaDelta, pitch: -betaDelta };
      default:
        return { yaw: gammaDelta, pitch: betaDelta };
    }
  }

  function handleDeviceOrientation(event) {
    const deltas = getOrientationDeltas(event);
    if (!deltas) return;

    orientationYaw = clamp(deltas.yaw * 1.15, -32, 32);
    orientationPitch = clamp(deltas.pitch * 0.85, -21, 21);
    orientationActive = true;
    page.classList.add("has-device-look");

    const lookTarget = getPanelForPointerDirection();
    setHoveredPanel(lookTarget);
    markLookState();
    setAudioTargets();
  }

  function bindDeviceOrientation() {
    if (orientationListenerBound || !("DeviceOrientationEvent" in window)) return;
    orientationListenerBound = true;
    window.addEventListener("deviceorientation", handleDeviceOrientation, true);
  }

  async function tryEnableDeviceLook() {
    if (orientationPermissionRequested || !coarsePointerQuery?.matches) return;
    if (!("DeviceOrientationEvent" in window)) return;

    orientationPermissionRequested = true;

    try {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") return;
      }

      bindDeviceOrientation();
    } catch (_error) {
      orientationPermissionRequested = false;
    }
  }

  function getTouchDistance(touches) {
    const first = touches[0];
    const second = touches[1];

    if (!first || !second) return 0;

    return Math.hypot(
      second.clientX - first.clientX,
      second.clientY - first.clientY
    );
  }

  function getPanelForPointerDirection() {
    if (!isLookInputActive()) return null;

    const look = getLookAngles();
    const candidates = panels
      .map((panel) => {
        const yawDelta = panel.angleYaw - look.yaw;
        const pitchDelta = panel.anglePitch - look.pitch;
        return {
          panel,
          yawDelta,
          pitchDelta,
          score: Math.hypot(yawDelta / 7.5, pitchDelta / 6.5),
        };
      })
      .filter((candidate) => Math.abs(candidate.yawDelta) < 9.5 && Math.abs(candidate.pitchDelta) < 8.5);

    candidates.sort((a, b) => a.score - b.score);
    return candidates[0]?.panel || null;
  }

  function getBasePanelWidth() {
    return clamp(window.innerWidth * 0.31, 320, 410);
  }

  function getBaseFocalPx() {
    return Math.max(window.innerWidth, window.innerHeight) * 0.86;
  }

  function getFocalLength(progress) {
    return minFocalLength + (maxFocalLength - minFocalLength) * clamp(progress, 0, 1);
  }

  function getVisualTargetPanel() {
    return hoveredPanel;
  }

  function getPanelFromElement(element) {
    if (!(element instanceof Element)) return null;
    const panelNode = element.closest(".microcosm-secret-panel");
    if (!panelNode) return null;
    return panels.find((panel) => panel.node === panelNode) || null;
  }

  function playLoaderVideo(loader) {
    if (!loader) return;

    loader.muted = true;
    loader.playsInline = true;
    loader.preload = "auto";

    const playAttempt = loader.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {
        // Autoplay can be denied in unusual browser states; the real panel still reveals.
      });
    }
  }

  function waitForVideoReady(video) {
    if (!video || video.readyState >= mediaReadyState) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let isResolved = false;
      let fallbackTimer = 0;

      const finish = () => {
        if (isResolved) return;
        isResolved = true;
        window.clearTimeout(fallbackTimer);
        video.removeEventListener("loadeddata", finish);
        video.removeEventListener("canplay", finish);
        video.removeEventListener("error", finish);
        resolve();
      };

      fallbackTimer = window.setTimeout(finish, 9000);
      video.addEventListener("loadeddata", finish);
      video.addEventListener("canplay", finish);
      video.addEventListener("error", finish);

      if (video.preload !== "auto") {
        video.preload = "auto";
      }

      try {
        video.load();
      } catch (_error) {
        finish();
      }
    });
  }

  async function revealPanelWhenReady(panel) {
    const video = panel.video;

    panel.node.classList.add("is-video-loading");

    if (!video) {
      await sleep(getPanelOnsetDelay());
      panel.ready = true;
      panel.node.classList.add("is-video-ready");
      panel.node.classList.remove("is-video-loading");
      return;
    }

    video.volume = 0;
    video.muted = true;
    video.playsInline = true;

    await waitForVideoReady(video);
    await sleep(getPanelOnsetDelay());

    panel.ready = true;
    panel.node.classList.add("is-video-ready");
    panel.node.classList.remove("is-video-loading");
    setAudioTargets();
    video.volume = panel.targetVolume;
    video.muted = panel.id !== "title";
    void tryPlay(panel, panel.id === "title");

    if (panel.loader) {
      panel.loader.pause();
    }
  }

  function getPanelAtPoint(clientX, clientY, options = {}) {
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;

    const { hitPadding = 8 } = options;
    const candidates = panels
      .map((panel) => {
        if (!panel.visible) return null;
        const rect = panel.node.getBoundingClientRect();
        const inside =
          clientX >= rect.left - hitPadding &&
          clientX <= rect.right + hitPadding &&
          clientY >= rect.top - hitPadding &&
          clientY <= rect.bottom + hitPadding;

        if (!inside || !rect.width || !rect.height) return null;

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const normalizedDistance = Math.hypot(
          (clientX - centerX) / rect.width,
          (clientY - centerY) / rect.height
        );

        return {
          panel,
          score: normalizedDistance + panel.cameraDepth / 10000,
        };
      })
      .filter(Boolean);

    candidates.sort((a, b) => a.score - b.score);
    return candidates[0]?.panel || null;
  }

  function setHoveredPanel(panel) {
    const nextPanel = panel || null;
    if (hoveredPanel === nextPanel) return;

    hoveredPanel = nextPanel;
    markLookState();
    setAudioTargets();
  }

  function updateZoomHud() {
    const focalLength = Math.round(getFocalLength(zoomProgress));

    space.style.setProperty("--zoom-progress", zoomProgress.toFixed(4));
    page.classList.toggle("is-max-zoom", zoomProgress > 0.965);

    if (zoomReadout) {
      zoomReadout.textContent = focalLength + "mm";
    }

    if (zoomFill) {
      zoomFill.style.transform = "scaleX(" + zoomProgress.toFixed(4) + ")";
    }
  }

  function setZoomProgress(nextValue) {
    zoomProgress = clamp(nextValue, 0, 1);
    updateZoomHud();
  }

  function projectPanel(panel) {
    const yaw = toRadians(cameraYaw);
    const pitch = toRadians(cameraPitch);
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const { x, y, z } = panel.world;

    const xAfterYaw = cosYaw * x - sinYaw * z;
    const zAfterYaw = sinYaw * x + cosYaw * z;
    const yAfterPitch = cosPitch * y - sinPitch * zAfterYaw;
    const zAfterPitch = sinPitch * y + cosPitch * zAfterYaw;
    const visible = zAfterPitch > 160;
    const focalPx = getBaseFocalPx() * (currentFocalLength / minFocalLength);
    const projectedScale = visible ? focalPx / zAfterPitch : 0.01;
    const screenX = xAfterYaw * projectedScale;
    const screenY = yAfterPitch * projectedScale;
    const rotateY = clamp(toDegrees(Math.atan2(-xAfterYaw, zAfterPitch)) * 0.84, -38, 38);
    const rotateX = clamp(toDegrees(Math.atan2(yAfterPitch, zAfterPitch)) * -0.84, -26, 26);
    const basePanelWidth = getBasePanelWidth();

    panel.screenX = screenX;
    panel.screenY = screenY;
    panel.cameraDepth = zAfterPitch;
    panel.visible = visible;

    panel.node.style.setProperty("--panel-width", basePanelWidth.toFixed(2) + "px");
    panel.node.style.setProperty("--screen-x", screenX.toFixed(2) + "px");
    panel.node.style.setProperty("--screen-y", screenY.toFixed(2) + "px");
    panel.node.style.setProperty("--project-scale", projectedScale.toFixed(4));
    panel.node.style.setProperty("--project-rotate-x", rotateX.toFixed(3) + "deg");
    panel.node.style.setProperty("--project-rotate-y", rotateY.toFixed(3) + "deg");
    panel.node.style.visibility = visible ? "visible" : "hidden";
    panel.node.style.zIndex = panel === hoveredPanel ? "40" : String(Math.round(3000 - zAfterPitch));
  }

  function markLookState() {
    const target = getVisualTargetPanel();
    const hasHoveredPanel = Boolean(target);
    const hasLookInput = isLookInputActive();

    page.classList.toggle("has-focused-panel", false);
    page.classList.toggle("has-negative-space", hasLookInput && !hasHoveredPanel);
    page.classList.toggle("has-looked-away", hasLookInput && target?.id !== "title");

    panels.forEach((panel) => {
      const isTarget = panel === target;
      const isHovered = panel === hoveredPanel;
      const screenDistance = target ? Math.hypot(panel.screenX - target.screenX, panel.screenY - target.screenY) : 0;
      const blur = !target || isTarget ? 0 : clamp(screenDistance / 460, 0.6, 2.6);

      panel.node.classList.toggle("is-hovered", isHovered);
      panel.node.classList.toggle("is-focused", false);
      panel.node.classList.toggle("is-active", panel === target);
      panel.node.classList.toggle("is-intro-held", false);
      panel.node.classList.toggle("is-dimmed", Boolean(target) && !isTarget);
      panel.node.style.setProperty("--panel-blur", blur.toFixed(2) + "px");
      panel.node.style.setProperty("--panel-video-scale", (1 + blur * 0.014).toFixed(3));
    });
  }

  function setAudioTargets() {
    const audiblePanel = hoveredPanel;

    panels.forEach((panel) => {
      if (!panel.video || !panel.ready) {
        panel.targetVolume = 0;
        return;
      }

      if (!audiblePanel || page.classList.contains("has-negative-space")) {
        panel.targetVolume = 0;
      } else if (panel === audiblePanel) {
        panel.targetVolume = panel.id === "title" && !pointerActive ? 0.72 : 0.92;
      } else {
        panel.targetVolume = 0;
      }
    });
  }

  async function ensureMutedPlayback(panel) {
    const video = panel.video;
    if (!video || !panel.ready) return false;

    video.muted = true;
    video.volume = 0;

    try {
      await video.play();
      return true;
    } catch (_error) {
      return false;
    }
  }

  async function tryPlay(panel, audible = false) {
    const video = panel.video;
    if (!video || !panel.ready) return false;

    try {
      await video.play();
      if (audible && !video.muted) {
        audioAllowed = true;
      }
      return true;
    } catch (_error) {
      if (audible) {
        audioAllowed = false;
      }
      await ensureMutedPlayback(panel);
      return false;
    }
  }

  async function tryUnlockAudio(panelToFavor) {
    hasTriedUnlock = true;
    audioAllowed = false;
    const favoredPanel = panelToFavor || getVisualTargetPanel();

    await Promise.all(panels.map(async (panel) => {
      if (!panel.video || !panel.ready) return;
      const shouldBeAudible = panel === favoredPanel;

      panel.video.muted = !shouldBeAudible;
      if (shouldBeAudible) {
        panel.video.volume = Math.max(panel.currentVolume, 0.28);
      } else {
        panel.video.volume = 0;
      }

      const started = await tryPlay(panel, shouldBeAudible);
      if (shouldBeAudible && started) {
        audioAllowed = true;
      }
    }));

    if (!audioAllowed) {
      await Promise.all(panels.map(ensureMutedPlayback));
    }
  }

  function handlePointerMove(event) {
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerActive = true;
    updateExitCursorState();
    setHoveredPanel(getPanelForPointerDirection());
  }

  function handlePanelEnter(panel) {
    hoveredPanel = panel;
    pointerActive = true;
    markLookState();
    setAudioTargets();

    if (!hasTriedUnlock) {
      panels.forEach((candidate) => {
        if (!candidate.video || !candidate.ready) return;
        candidate.video.muted = candidate !== panel;
      });
    }
  }

  function handlePanelLeave(panel) {
    if (hoveredPanel === panel) {
      hoveredPanel = getPanelForPointerDirection();
    }
    markLookState();
    setAudioTargets();
  }

  function handlePanelClick(panel) {
    hoveredPanel = panel;
    void tryUnlockAudio(panel);
    markLookState();
    setAudioTargets();
  }

  function handleSceneClick(event) {
    const directPanel = getPanelFromElement(event.target);
    if (directPanel) {
      handlePanelClick(directPanel);
    }
  }

  function handleWheel(event) {
    event.preventDefault();

    const currentTarget = getPanelForPointerDirection();
    if (currentTarget) {
      setHoveredPanel(currentTarget);
    }

    const direction = event.deltaY > 0 ? -1 : 1;
    const amount = clamp(Math.abs(event.deltaY) / 1500, 0.008, 0.05);
    setZoomProgress(zoomProgress + direction * amount);
    markLookState();
    setAudioTargets();
  }

  function handleTouchStart(event) {
    void tryEnableDeviceLook();

    if (event.touches.length !== 2) return;

    pinchStartDistance = getTouchDistance(event.touches);
    pinchStartZoomProgress = zoomProgress;

    if (pinchStartDistance > 0) {
      event.preventDefault();
    }
  }

  function handleTouchMove(event) {
    if (event.touches.length !== 2 || pinchStartDistance <= 0) return;

    event.preventDefault();

    const nextDistance = getTouchDistance(event.touches);
    if (nextDistance <= 0) return;

    const pinchScale = nextDistance / pinchStartDistance;
    const zoomDelta = Math.log(pinchScale) * 0.82;

    setZoomProgress(pinchStartZoomProgress + zoomDelta);
    markLookState();
    setAudioTargets();
  }

  function handleTouchEnd(event) {
    if (event.touches.length >= 2) return;

    pinchStartDistance = 0;
    pinchStartZoomProgress = zoomProgress;
  }

  function animate() {
    const look = getLookAngles();
    const hasLookInput = isLookInputActive();
    const targetYaw = hasLookInput ? look.yaw : 0;
    const targetPitch = hasLookInput ? look.pitch : 0;
    const targetFocalLength = getFocalLength(zoomProgress);

    cameraYaw = lerp(cameraYaw, targetYaw, 0.075);
    cameraPitch = lerp(cameraPitch, targetPitch, 0.075);
    currentFocalLength = lerp(currentFocalLength, targetFocalLength, 0.08);

    panels.forEach(projectPanel);
    markLookState();

    panels.forEach((panel) => {
      if (!panel.video) return;
      if (!panel.ready) {
        panel.currentVolume = 0;
        panel.video.volume = 0;
        panel.video.muted = true;
        return;
      }

      panel.currentVolume = lerp(panel.currentVolume, panel.targetVolume, 0.075);
      panel.video.volume = clamp(panel.currentVolume, 0, 1);
      panel.video.muted = !audioAllowed || panel.video.volume < 0.015;
    });

    requestAnimationFrame(animate);
  }

  panels.forEach((panel) => {
    const video = panel.video;
    if (video) {
      video.volume = 0;
      video.muted = true;
      video.playsInline = true;
    }

    playLoaderVideo(panel.loader);
    void revealPanelWhenReady(panel);

    panel.node.addEventListener("pointerenter", () => handlePanelEnter(panel));
    panel.node.addEventListener("pointerleave", () => handlePanelLeave(panel));
    panel.node.addEventListener("click", (event) => {
      event.stopPropagation();
      handlePanelClick(panel);
    });
    panel.node.addEventListener("focus", () => handlePanelEnter(panel));
    panel.node.addEventListener("blur", () => handlePanelLeave(panel));
  });

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerdown", () => {
    void tryEnableDeviceLook();
    void tryUnlockAudio(getVisualTargetPanel());
  }, { passive: true });
  window.addEventListener("keydown", () => {
    void tryUnlockAudio(getVisualTargetPanel());
  }, { once: true });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      window.location.href = "index.html";
      return;
    }

    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.defaultPrevented
    ) {
      return;
    }

    if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      window.location.href = "microcosm.html";
    }
  });
  space.addEventListener("wheel", handleWheel, { passive: false });
  space.addEventListener("touchstart", handleTouchStart, { passive: false });
  space.addEventListener("touchmove", handleTouchMove, { passive: false });
  space.addEventListener("touchend", handleTouchEnd, { passive: true });
  space.addEventListener("touchcancel", handleTouchEnd, { passive: true });
  space.addEventListener("click", handleSceneClick);
  window.addEventListener("orientationchange", () => {
    orientationNeutral = null;
  }, { passive: true });
  screen.orientation?.addEventListener?.("change", () => {
    orientationNeutral = null;
  });
  document.addEventListener("mouseleave", () => {
    pointerActive = false;
    hoveredPanel = null;
    page.classList.remove("is-exit-cursor");
    markLookState();
    setAudioTargets();
  });

  panels.forEach(projectPanel);
  markLookState();
  setAudioTargets();
  updateZoomHud();
  requestAnimationFrame(animate);
})();
