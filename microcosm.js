(function () {
  const page = document.body;
  const stage = document.getElementById("microStage");
  const videoShell = document.querySelector(".video-hero--microcosm");
  const titleBtn = document.getElementById("microTitleJump");
  const soundBtn = document.getElementById("microSound");
  const wideBtn = document.getElementById("microWide");
  const soundHotspot = document.getElementById("microSoundHotspot");
  const sceneButtons = Array.from(document.querySelectorAll(".microcosm-scene-btn"));
  const videos = [
    document.getElementById("microVideoA"),
    document.getElementById("microVideoB"),
  ].filter(Boolean);

  if (!stage || !videoShell || videos.length < 2) return;

  const scenes = [
    "Microcosm/Title.mp4",
    "Microcosm/1.mp4",
    "Microcosm/2.mp4",
    "Microcosm/3.mp4",
    "Microcosm/4.mp4",
    "Microcosm/5.mp4",
    "Microcosm/6.mp4",
  ];

  const screenFadeMs = 500;
  const audioFadeMs = 1500;

  let sceneIndex = 0;
  let pendingSceneIndex = null;
  let queuedSceneIndex = null;
  let activeSlot = 0;
  let muted = false;
  let isWide = false;
  let hideSoundTimer = null;
  let overVideoPlayer = false;
  let overSoundCorner = false;
  let overWideCorner = false;

  const volumeFadeTokens = new WeakMap();

  function getActiveVideo() {
    return videos[activeSlot];
  }

  function getInactiveVideo() {
    return videos[(activeSlot + 1) % videos.length];
  }

  function getLiveVideos() {
    return videos.filter((video) => !video.paused && Boolean(video.currentSrc));
  }

  function clearSoundHideTimer() {
    if (!hideSoundTimer) return;
    clearTimeout(hideSoundTimer);
    hideSoundTimer = null;
  }

  function showSoundControl() {
    if (soundBtn) soundBtn.classList.add("is-visible");
    if (wideBtn) wideBtn.classList.add("is-visible");
  }

  function hideSoundControl() {
    if (soundBtn) soundBtn.classList.remove("is-visible");
    if (wideBtn) wideBtn.classList.remove("is-visible");
  }

  function scheduleSoundHide() {
    clearSoundHideTimer();
    hideSoundTimer = setTimeout(() => {
      hideSoundTimer = null;
      hideSoundControl();
    }, 2000);
  }

  function registerControlActivity() {
    showSoundControl();
    scheduleSoundHide();
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function nextSceneIndex() {
    return (sceneIndex + 1) % scenes.length;
  }

  function previousSceneIndex() {
    return (sceneIndex - 1 + scenes.length) % scenes.length;
  }

  async function playVideoSafe(video) {
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      try {
        await promise;
        return true;
      } catch (_error) {
        return false;
      }
    }
    return true;
  }

  function waitForVideoReady(video) {
    if (video.readyState >= 2) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => {
        video.removeEventListener("loadeddata", done);
        video.removeEventListener("canplay", done);
        resolve();
      };
      video.addEventListener("loadeddata", done);
      video.addEventListener("canplay", done);
    });
  }

  function updateSceneUI() {
    const displayIndex = queuedSceneIndex ?? pendingSceneIndex ?? sceneIndex;
    const isBusy = pendingSceneIndex !== null;

    stage.setAttribute("aria-busy", String(isBusy));
    videoShell.classList.toggle("is-transitioning", isBusy);

    if (titleBtn) {
      const isActive = displayIndex === 0;
      titleBtn.classList.toggle("is-active", isActive);
      titleBtn.setAttribute("aria-pressed", String(isActive));
    }

    sceneButtons.forEach((btn) => {
      const idx = Number(btn.dataset.scene);
      const isActive = idx === displayIndex;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", String(isActive));
    });
  }

  function updateSoundUI() {
    if (!soundBtn) return;
    soundBtn.classList.toggle("is-muted", muted);
    soundBtn.classList.toggle("is-unmuted", !muted);
    soundBtn.setAttribute("aria-label", muted ? "Enable sound" : "Mute sound");
    soundBtn.setAttribute("aria-pressed", String(!muted));
  }

  function updateWideUI() {
    if (!wideBtn) return;
    page.classList.toggle("is-wide", isWide);
    wideBtn.classList.toggle("is-active", isWide);
    wideBtn.setAttribute("aria-pressed", String(isWide));
    wideBtn.setAttribute(
      "aria-label",
      isWide ? "Exit widescreen mode" : "Enter widescreen mode"
    );
  }

  function cancelVolumeFade(video) {
    const nextToken = (volumeFadeTokens.get(video) || 0) + 1;
    volumeFadeTokens.set(video, nextToken);
  }

  function fadeVideoVolume(video, target, duration) {
    const start = Number(video.volume) || 0;
    const end = Math.max(0, Math.min(1, target));
    const token = (volumeFadeTokens.get(video) || 0) + 1;

    volumeFadeTokens.set(video, token);

    if (duration <= 0 || Math.abs(end - start) < 0.001) {
      video.volume = end;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const t0 = performance.now();

      function step(now) {
        if (volumeFadeTokens.get(video) !== token) {
          resolve();
          return;
        }

        const progress = Math.min(1, (now - t0) / duration);
        video.volume = start + (end - start) * progress;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }

      requestAnimationFrame(step);
    });
  }

  function setVideoScene(video, index, preload = "auto") {
    if (video.dataset.sceneIndex === String(index)) {
      video.preload = preload;
      return false;
    }

    video.preload = preload;
    video.dataset.sceneIndex = String(index);
    video.src = scenes[index];
    video.load();
    return true;
  }

  function primeScene(index) {
    if (!Number.isFinite(index)) return;
    if (index === sceneIndex || index === pendingSceneIndex) return;

    const target = getInactiveVideo();

    cancelVolumeFade(target);
    target.pause();
    target.currentTime = 0;
    target.volume = 0;
    target.muted = true;
    target.classList.remove("is-active");
    setVideoScene(target, index, "auto");
  }

  async function changeScene(nextIndex) {
    if (!Number.isFinite(nextIndex) || nextIndex < 0 || nextIndex >= scenes.length) return;

    if (pendingSceneIndex !== null) {
      queuedSceneIndex = nextIndex;
      pendingSceneIndex = nextIndex;
      updateSceneUI();
      primeScene(nextIndex);
      return;
    }

    if (nextIndex === sceneIndex) {
      const activeVideo = getActiveVideo();
      activeVideo.currentTime = 0;
      void playVideoSafe(activeVideo);
      return;
    }

    const outgoing = getActiveVideo();
    const incoming = getInactiveVideo();
    const shouldRestoreAudio = !muted;

    pendingSceneIndex = nextIndex;
    queuedSceneIndex = null;
    updateSceneUI();

    cancelVolumeFade(incoming);
    incoming.pause();
    incoming.currentTime = 0;
    incoming.volume = 0;
    incoming.muted = !shouldRestoreAudio;
    setVideoScene(incoming, nextIndex, "auto");

    await waitForVideoReady(incoming);

    incoming.currentTime = 0;
    incoming.volume = 0;
    incoming.muted = !shouldRestoreAudio;
    void playVideoSafe(incoming);

    requestAnimationFrame(() => {
      incoming.classList.add("is-active");
      outgoing.classList.remove("is-active");
    });

    if (shouldRestoreAudio) {
      outgoing.muted = false;
      incoming.muted = false;
      void fadeVideoVolume(outgoing, 0, Math.min(audioFadeMs, screenFadeMs));
      void fadeVideoVolume(incoming, 1, audioFadeMs);
    } else {
      outgoing.volume = 0;
      outgoing.muted = true;
      incoming.volume = 0;
      incoming.muted = true;
    }

    await sleep(screenFadeMs);

    cancelVolumeFade(outgoing);
    outgoing.pause();
    outgoing.currentTime = 0;
    outgoing.volume = 0;
    outgoing.muted = true;
    outgoing.classList.remove("is-active");

    activeSlot = (activeSlot + 1) % videos.length;
    sceneIndex = nextIndex;
    pendingSceneIndex = null;
    updateSceneUI();

    const queuedTarget = queuedSceneIndex;
    queuedSceneIndex = null;

    primeScene(nextSceneIndex());

    if (queuedTarget !== null && queuedTarget !== sceneIndex) {
      void changeScene(queuedTarget);
    }
  }

  async function toggleSound() {
    if (pendingSceneIndex !== null) return;

    const liveVideos = getLiveVideos();
    if (!liveVideos.length) return;

    if (muted) {
      muted = false;
      updateSoundUI();

      liveVideos.forEach((video) => {
        video.muted = false;
      });

      await Promise.all(
        liveVideos.map((video) =>
          fadeVideoVolume(video, video === getActiveVideo() ? 1 : 0.5, audioFadeMs)
        )
      );
    } else {
      muted = true;
      updateSoundUI();

      await Promise.all(liveVideos.map((video) => fadeVideoVolume(video, 0, audioFadeMs)));

      liveVideos.forEach((video) => {
        video.muted = true;
        video.volume = 0;
      });
    }
  }

  async function handleSoundToggleRequest() {
    registerControlActivity();
    await toggleSound();
  }

  function shouldIgnoreGlobalSoundClick(target) {
    return !!target.closest("a, button, input, textarea, select, label");
  }

  function toggleWideMode() {
    isWide = !isWide;
    updateWideUI();
    registerControlActivity();
  }

  function setCornerHover(isHovering) {
    overSoundCorner = isHovering;

    if (isHovering) {
      registerControlActivity();
      return;
    }

    if (overVideoPlayer) {
      registerControlActivity();
    } else {
      hideSoundControl();
    }
  }

  titleBtn?.addEventListener("click", () => {
    void changeScene(0);
  });
  titleBtn?.addEventListener("mouseenter", () => primeScene(0));
  titleBtn?.addEventListener("focus", () => primeScene(0));

  sceneButtons.forEach((btn) => {
    const targetIndex = Number(btn.dataset.scene);

    btn.addEventListener("click", () => {
      void changeScene(targetIndex);
    });
    btn.addEventListener("mouseenter", () => primeScene(targetIndex));
    btn.addEventListener("focus", () => primeScene(targetIndex));
  });

  soundBtn?.addEventListener("click", async (event) => {
    event.stopPropagation();
    await handleSoundToggleRequest();
  });

  wideBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleWideMode();
  });

  soundHotspot?.addEventListener("mouseenter", () => setCornerHover(true));
  soundHotspot?.addEventListener("mouseleave", () => setCornerHover(false));
  soundHotspot?.addEventListener("mousemove", registerControlActivity);
  soundBtn?.addEventListener("mouseenter", () => setCornerHover(true));
  soundBtn?.addEventListener("mouseleave", () => setCornerHover(false));
  soundBtn?.addEventListener("mousemove", registerControlActivity);
  wideBtn?.addEventListener("mouseenter", () => {
    overWideCorner = true;
    registerControlActivity();
  });
  wideBtn?.addEventListener("mouseleave", () => {
    overWideCorner = false;
    if (overVideoPlayer) {
      registerControlActivity();
    } else {
      hideSoundControl();
    }
  });
  wideBtn?.addEventListener("mousemove", registerControlActivity);

  videoShell.addEventListener("click", async (event) => {
    if (soundBtn && (event.target === soundBtn || soundBtn.contains(event.target))) return;
    if (wideBtn && (event.target === wideBtn || wideBtn.contains(event.target))) return;
    await handleSoundToggleRequest();
  });

  videoShell.addEventListener("mouseenter", () => {
    overVideoPlayer = true;
    registerControlActivity();
  });
  videoShell.addEventListener("mousemove", registerControlActivity);

  videoShell.addEventListener("mouseleave", () => {
    overVideoPlayer = false;
    overSoundCorner = false;
    overWideCorner = false;
    clearSoundHideTimer();
    hideSoundControl();
  });

  document.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (shouldIgnoreGlobalSoundClick(target)) return;
    if (videoShell.contains(target)) return;
    await handleSoundToggleRequest();
  });

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (target instanceof HTMLElement &&
        target.closest("input, textarea, select, button, [contenteditable='true']"))
    ) {
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      void changeScene(nextSceneIndex());
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      void changeScene(previousSceneIndex());
    } else if (event.key === "Home") {
      event.preventDefault();
      void changeScene(0);
    } else if (event.key === "Escape" && isWide) {
      event.preventDefault();
      isWide = false;
      updateWideUI();
    }
  });

  videos.forEach((video) => {
    video.loop = false;
    video.addEventListener("ended", () => {
      if (video !== getActiveVideo() || pendingSceneIndex !== null) return;
      void changeScene(nextSceneIndex());
    });
  });

  updateSceneUI();
  updateSoundUI();
  updateWideUI();

  async function startInitialPlayback() {
    const initialVideo = getActiveVideo();
    initialVideo.classList.add("is-active");
    initialVideo.volume = muted ? 0 : 1;
    initialVideo.muted = muted;
    setVideoScene(initialVideo, 0, "auto");

    const started = await playVideoSafe(initialVideo);

    // Prefer sound-on for Microcosm, but fall back if the browser blocks audible autoplay.
    if (!started && !muted) {
      muted = true;
      updateSoundUI();
      initialVideo.volume = 0;
      initialVideo.muted = true;
      await playVideoSafe(initialVideo);
    }

    primeScene(nextSceneIndex());
  }

  void startInitialPlayback();
})();
