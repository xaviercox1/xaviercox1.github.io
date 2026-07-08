(function () {
  const page = document.body;
  const space = document.querySelector(".microcosm-secret-space");
  const zoomFill = document.getElementById("microZoomFill");
  const zoomReadout = document.getElementById("microZoomReadout");
  const interfaceSwitch = document.querySelector(".microcosm-secret-interface-switch");
  const advancedSwitch = document.querySelector(".microcosm-advanced-interface-switch");
  const advancedNav = document.querySelector(".microcosm-advanced-nav");
  const simpleNav = document.querySelector(".microcosm-simple-nav");
  const simpleInterface = document.querySelector(".microcosm-simple-interface");
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
  let interfaceSwitchHideTimer = 0;

  const minFocalLength = 24;
  const maxFocalLength = 70;
  const minPanelOnsetDelay = 1000;
  const maxPanelOnsetDelay = 2200;
  const mediaReadyState = typeof HTMLMediaElement === "undefined" ? 3 : HTMLMediaElement.HAVE_FUTURE_DATA;
  const exitCursorZone = 104;
  const interfaceCursorPadding = 30;
  const coarsePointerQuery = window.matchMedia?.("(any-pointer: coarse)");
  const hasTouchInput = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const loaderLoopEpoch = performance.now();
  const isHybridPage = page.classList.contains("microcosm-hybrid-page");
  const interfaceSwitchHideDelay = 5000;

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
    if (!isAdvancedInterfaceActive()) {
      page.classList.remove("is-exit-cursor");
      return;
    }

    const isNearBackArrow = pointerX <= exitCursorZone && pointerY <= exitCursorZone;
    const isNearInterfaceSwitch =
      !page.classList.contains("has-hidden-interface-switch") &&
      isPointerNearElement(interfaceSwitch, interfaceCursorPadding);

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

  function isAdvancedInterfaceActive() {
    return !isHybridPage || page.classList.contains("is-advanced-interface");
  }

  function clearInterfaceSwitchHideTimer() {
    if (!interfaceSwitchHideTimer) return;
    window.clearTimeout(interfaceSwitchHideTimer);
    interfaceSwitchHideTimer = 0;
  }

  function scheduleInterfaceSwitchHide() {
    clearInterfaceSwitchHideTimer();
    page.classList.remove("has-hidden-interface-switch");

    if (!isAdvancedInterfaceActive()) return;

    interfaceSwitchHideTimer = window.setTimeout(() => {
      interfaceSwitchHideTimer = 0;
      page.classList.add("has-hidden-interface-switch");
      updateExitCursorState();
    }, interfaceSwitchHideDelay);
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
    if (!isAdvancedInterfaceActive()) return;

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
    if (orientationPermissionRequested || !(coarsePointerQuery?.matches || hasTouchInput)) return;
    if (!("DeviceOrientationEvent" in window)) return;

    orientationPermissionRequested = true;

    try {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") {
          orientationPermissionRequested = false;
          return;
        }
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
    loader.defaultMuted = true;
    loader.playsInline = true;
    loader.preload = "auto";
    loader.setAttribute("playsinline", "");
    loader.setAttribute("webkit-playsinline", "");

    const playAttempt = loader.play();
    if (playAttempt && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {
        // Autoplay can be denied in unusual browser states; the real panel still reveals.
      });
    }
  }

  function syncLoaderLoop(loader) {
    if (!loader) return;

    const sync = () => {
      const duration = loader.duration;
      if (!Number.isFinite(duration) || duration <= 0.4) return;

      const phase = ((performance.now() - loaderLoopEpoch) / 1000) % duration;
      if (Math.abs(loader.currentTime - phase) > 0.18) {
        try {
          loader.currentTime = phase;
        } catch (_error) {
          // The loader can still play normally if Safari rejects an early seek.
        }
      }
    };

    if (loader.readyState >= 1) {
      sync();
      return;
    }

    loader.addEventListener("loadedmetadata", sync, { once: true });
  }

  function bindSmoothLoop(video, options = {}) {
    if (!video) return;

    const start = options.start ?? 0;
    const padding = options.padding ?? 0.08;
    let didLoop = false;

    const tick = () => {
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > padding + start + 0.35) {
        const loopAt = duration - padding;

        if (!didLoop && video.currentTime >= loopAt) {
          didLoop = true;
          try {
            video.currentTime = start;
          } catch (_error) {}
        } else if (didLoop && video.currentTime > start + 0.18 && video.currentTime < loopAt - 0.12) {
          didLoop = false;
        }
      }

      if (typeof video.requestVideoFrameCallback === "function") {
        video.requestVideoFrameCallback(tick);
      } else {
        window.requestAnimationFrame(tick);
      }
    };

    tick();
  }

  function prepareInlineVideo(video) {
    if (!video) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
  }

  function waitForVideoReady(video) {
    if (!video || video.readyState >= mediaReadyState) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let isResolved = false;

      const finish = () => {
        if (video.readyState < mediaReadyState) return;
        if (isResolved) return;
        isResolved = true;
        video.removeEventListener("loadeddata", finish);
        video.removeEventListener("canplay", finish);
        video.removeEventListener("canplaythrough", finish);
        video.removeEventListener("playing", finish);
        video.removeEventListener("error", finish);
        resolve();
      };

      video.addEventListener("loadeddata", finish);
      video.addEventListener("canplay", finish);
      video.addEventListener("canplaythrough", finish);
      video.addEventListener("playing", finish);
      video.addEventListener("error", finish);

      if (video.preload !== "auto") {
        video.preload = "auto";
      }

      try {
        video.load();
      } catch (_error) {
        // Keep the loader visible if the real video cannot be loaded.
      }
    });
  }

  function waitForVideoPlaying(video) {
    if (!video || (!video.paused && video.readyState >= mediaReadyState)) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let isResolved = false;

      const finish = () => {
        if (isResolved) return;
        if (video.paused || video.readyState < mediaReadyState) return;
        isResolved = true;
        video.removeEventListener("playing", finish);
        video.removeEventListener("timeupdate", finish);
        video.removeEventListener("canplay", finish);
        resolve();
      };

      video.addEventListener("playing", finish);
      video.addEventListener("timeupdate", finish);
      video.addEventListener("canplay", finish);
      finish();
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

    prepareInlineVideo(video);
    video.volume = 0;

    await waitForVideoReady(video);
    await startMutedPlayback(video);
    await waitForVideoPlaying(video);
    await sleep(getPanelOnsetDelay());

    panel.ready = true;
    panel.node.classList.add("is-video-ready");
    panel.node.classList.remove("is-video-loading");

    if (!isAdvancedInterfaceActive()) {
      video.volume = 0;
      video.muted = true;
      video.pause();
      panel.loader?.pause();
      return;
    }

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

  async function startMutedPlayback(video) {
    if (!video) return false;

    video.muted = true;
    video.defaultMuted = true;
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

  function setElementHidden(element, isHidden) {
    if (!element) return;
    element.hidden = isHidden;
  }

  function updateInterfaceUrl(mode) {
    if (!isHybridPage || !window.history?.replaceState) return;
    window.history.replaceState(null, "", mode === "simple" ? "microcosm.html#simple" : "microcosm.html");
  }

  function pauseAdvancedPlayback() {
    panels.forEach((panel) => {
      panel.loader?.pause();

      if (!panel.video) return;
      panel.currentVolume = 0;
      panel.targetVolume = 0;
      panel.video.volume = 0;
      panel.video.muted = true;
      panel.video.pause();
    });
  }

  function resumeAdvancedPlayback() {
    panels.forEach((panel) => {
      if (panel.ready) {
        void startMutedPlayback(panel.video);
      } else {
        playLoaderVideo(panel.loader);
      }
    });

    markLookState();
    setAudioTargets();
  }

  function showSimpleInterface(updateUrl = true) {
    if (!isHybridPage) {
      window.location.href = "microcosm.html#simple";
      return;
    }

    page.classList.remove("microcosm-secret-page", "is-advanced-interface", "is-exit-cursor");
    page.classList.add("is-simple-interface");
    setElementHidden(advancedNav, true);
    setElementHidden(space, true);
    setElementHidden(simpleNav, false);
    setElementHidden(simpleInterface, false);
    clearInterfaceSwitchHideTimer();
    page.classList.remove("has-hidden-interface-switch");
    pauseAdvancedPlayback();

    if (updateUrl) updateInterfaceUrl("simple");
    document.dispatchEvent(new CustomEvent("microcosm:show-simple"));
  }

  function showAdvancedInterface(updateUrl = true) {
    if (!isHybridPage) return;

    document.dispatchEvent(new CustomEvent("microcosm:show-advanced"));
    page.classList.remove("is-simple-interface");
    page.classList.add("microcosm-secret-page", "is-advanced-interface");
    setElementHidden(simpleNav, true);
    setElementHidden(simpleInterface, true);
    setElementHidden(advancedNav, false);
    setElementHidden(space, false);
    resumeAdvancedPlayback();
    scheduleInterfaceSwitchHide();
    updateExitCursorState();

    if (updateUrl) updateInterfaceUrl("advanced");
  }

  function handlePointerMove(event) {
    if (!isAdvancedInterfaceActive()) return;

    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerActive = true;
    updateExitCursorState();
    setHoveredPanel(getPanelForPointerDirection());
  }

  function handlePanelEnter(panel) {
    if (!isAdvancedInterfaceActive()) return;

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
    if (!isAdvancedInterfaceActive()) return;

    if (hoveredPanel === panel) {
      hoveredPanel = getPanelForPointerDirection();
    }
    markLookState();
    setAudioTargets();
  }

  function handlePanelClick(panel) {
    if (!isAdvancedInterfaceActive()) return;

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
    if (!isAdvancedInterfaceActive()) return;

    event.preventDefault();
    page.classList.add("has-used-scroll-zoom");

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
    if (!isAdvancedInterfaceActive()) return;

    void tryEnableDeviceLook();

    if (event.touches.length !== 2) return;

    pinchStartDistance = getTouchDistance(event.touches);
    pinchStartZoomProgress = zoomProgress;

    if (pinchStartDistance > 0) {
      event.preventDefault();
    }
  }

  function handleTouchMove(event) {
    if (!isAdvancedInterfaceActive()) return;

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
    if (!isAdvancedInterfaceActive()) return;

    if (event.touches.length >= 2) return;

    pinchStartDistance = 0;
    pinchStartZoomProgress = zoomProgress;
  }

  function animate() {
    if (!isAdvancedInterfaceActive()) {
      panels.forEach((panel) => {
        if (!panel.video) return;
        panel.currentVolume = 0;
        panel.targetVolume = 0;
        panel.video.volume = 0;
        panel.video.muted = true;
      });
      requestAnimationFrame(animate);
      return;
    }

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
      prepareInlineVideo(video);
    }

    syncLoaderLoop(panel.loader);
    bindSmoothLoop(panel.loader, { padding: 0.08 });
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
    if (!isAdvancedInterfaceActive()) return;
    void tryEnableDeviceLook();
    void tryUnlockAudio(getVisualTargetPanel());
  }, { passive: true });
  window.addEventListener("keydown", () => {
    if (!isAdvancedInterfaceActive()) return;
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
      if (isHybridPage && page.classList.contains("is-simple-interface")) {
        showAdvancedInterface();
      } else if (isHybridPage) {
        showSimpleInterface();
      } else {
        window.location.href = "microcosm.html#simple";
      }
    }
  });
  interfaceSwitch?.addEventListener("click", (event) => {
    if (!isHybridPage) return;
    event.preventDefault();
    showSimpleInterface();
  });
  advancedSwitch?.addEventListener("click", (event) => {
    event.preventDefault();
    showAdvancedInterface();
  });
  space.addEventListener("wheel", handleWheel, { passive: false });
  space.addEventListener("touchstart", handleTouchStart, { passive: false });
  space.addEventListener("touchmove", handleTouchMove, { passive: false });
  space.addEventListener("touchend", (event) => {
    void tryEnableDeviceLook();
    handleTouchEnd(event);
  }, { passive: true });
  space.addEventListener("touchcancel", handleTouchEnd, { passive: true });
  space.addEventListener("click", (event) => {
    void tryEnableDeviceLook();
    handleSceneClick(event);
  });
  window.addEventListener("orientationchange", () => {
    orientationNeutral = null;
  }, { passive: true });
  screen.orientation?.addEventListener?.("change", () => {
    orientationNeutral = null;
  });
  document.addEventListener("mouseleave", () => {
    if (!isAdvancedInterfaceActive()) return;
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

  if (isHybridPage && window.location.hash.toLowerCase() === "#simple") {
    showSimpleInterface(false);
  } else {
    scheduleInterfaceSwitchHide();
  }
})();
