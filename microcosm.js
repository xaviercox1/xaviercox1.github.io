(function () {
  const video = document.getElementById("microVideo");
  if (!video) return;

  const videoShell = document.querySelector(".video-hero--microcosm");
  const titleBtn = document.getElementById("microTitleJump");
  const soundBtn = document.getElementById("microSound");
  const soundHotspot = document.getElementById("microSoundHotspot");
  const sceneButtons = Array.from(document.querySelectorAll(".microcosm-scene-btn"));

  const scenes = [
    "Microcosm/Title.mp4",
    "Microcosm/1.mp4",
    "Microcosm/2.mp4",
    "Microcosm/3.mp4",
    "Microcosm/4.mp4",
    "Microcosm/5.mp4",
    "Microcosm/6.mp4",
  ];

  const screenFadeMs = 1000;
  const audioFadeMs = 3000;

  let sceneIndex = 0;
  let pendingSceneIndex = null;
  let transitionLocked = false;
  let muted = true;
  let volumeFadeToken = 0;
  let hideSoundTimer = null;
  let overVideoPlayer = false;
  let overSoundCorner = false;

  function clearSoundHideTimer() {
    if (!hideSoundTimer) return;
    clearTimeout(hideSoundTimer);
    hideSoundTimer = null;
  }

  function showSoundControl() {
    if (!soundBtn) return;
    soundBtn.classList.add("is-visible");
  }

  function hideSoundControl() {
    if (!soundBtn || overSoundCorner) return;
    soundBtn.classList.remove("is-visible");
  }

  function scheduleSoundHide() {
    clearSoundHideTimer();
    hideSoundTimer = setTimeout(() => {
      hideSoundTimer = null;
      hideSoundControl();
    }, 2000);
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function nextSceneIndex() {
    return (sceneIndex + 1) % scenes.length;
  }

  function playVideoSafe() {
    const promise = video.play();
    if (promise && typeof promise.catch === "function") promise.catch(() => {});
  }

  function waitForVideoReady() {
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
    const displayIndex = pendingSceneIndex ?? sceneIndex;
    if (titleBtn) titleBtn.classList.toggle("is-active", displayIndex === 0);
    sceneButtons.forEach((btn) => {
      const idx = Number(btn.dataset.scene);
      btn.classList.toggle("is-active", idx === displayIndex);
    });
  }

  function updateSoundUI() {
    if (!soundBtn) return;
    soundBtn.classList.toggle("is-muted", muted);
    soundBtn.classList.toggle("is-unmuted", !muted);
    soundBtn.setAttribute("aria-label", muted ? "Enable sound" : "Mute sound");
  }

  function setControlsDisabled(disabled) {
    [titleBtn, soundBtn, ...sceneButtons].forEach((el) => {
      if (el) el.disabled = disabled;
    });
  }

  function cancelVolumeFade() {
    volumeFadeToken += 1;
  }

  function fadeVolumeTo(target, duration) {
    const thisToken = ++volumeFadeToken;
    const start = Number(video.volume) || 0;
    const end = Math.max(0, Math.min(1, target));

    if (duration <= 0 || Math.abs(end - start) < 0.001) {
      video.volume = end;
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const t0 = performance.now();
      function step(now) {
        if (thisToken !== volumeFadeToken) {
          resolve();
          return;
        }

        const p = Math.min(1, (now - t0) / duration);
        video.volume = start + (end - start) * p;

        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  async function changeScene(nextIndex) {
    if (transitionLocked) return;
    if (nextIndex === sceneIndex) {
      if (sceneIndex === 0) {
        video.currentTime = 0;
        playVideoSafe();
      }
      return;
    }

    transitionLocked = true;
    pendingSceneIndex = nextIndex;
    updateSceneUI();
    setControlsDisabled(true);

    const shouldRestoreAudio = !muted;

    if (shouldRestoreAudio) {
      await fadeVolumeTo(0, audioFadeMs);
      video.muted = true;
    }

    video.classList.add("is-screen-faded");
    await sleep(screenFadeMs);

    sceneIndex = nextIndex;
    pendingSceneIndex = null;
    updateSceneUI();

    cancelVolumeFade();
    video.pause();
    video.src = scenes[sceneIndex];
    video.load();
    await waitForVideoReady();

    video.volume = 0;
    video.muted = true;
    playVideoSafe();

    video.classList.remove("is-screen-faded");
    await sleep(screenFadeMs);

    if (shouldRestoreAudio) {
      video.muted = false;
      await fadeVolumeTo(1, audioFadeMs);
    } else {
      video.volume = 0;
      video.muted = true;
    }

    transitionLocked = false;
    setControlsDisabled(false);
  }

  async function toggleSound() {
    if (transitionLocked) return;

    if (muted) {
      muted = false;
      updateSoundUI();
      video.muted = false;
      await fadeVolumeTo(1, audioFadeMs);
    } else {
      muted = true;
      updateSoundUI();
      await fadeVolumeTo(0, audioFadeMs);
      video.muted = true;
    }
  }

  titleBtn?.addEventListener("click", () => changeScene(0));
  sceneButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      changeScene(Number(btn.dataset.scene));
    });
  });

  async function handleSoundToggleRequest() {
    showSoundControl();
    scheduleSoundHide();
    await toggleSound();
  }

  soundBtn?.addEventListener("click", async (event) => {
    event.stopPropagation();
    await handleSoundToggleRequest();
  });

  videoShell?.addEventListener("click", async (event) => {
    if (soundBtn && (event.target === soundBtn || soundBtn.contains(event.target))) return;
    await handleSoundToggleRequest();
  });

  function setCornerHover(isHovering) {
    overSoundCorner = isHovering;
    if (isHovering) {
      clearSoundHideTimer();
      showSoundControl();
    } else {
      if (overVideoPlayer) {
        showSoundControl();
        scheduleSoundHide();
      } else {
        hideSoundControl();
      }
    }
  }

  soundHotspot?.addEventListener("mouseenter", () => setCornerHover(true));
  soundHotspot?.addEventListener("mouseleave", () => setCornerHover(false));
  soundBtn?.addEventListener("mouseenter", () => setCornerHover(true));
  soundBtn?.addEventListener("mouseleave", () => setCornerHover(false));
  videoShell?.addEventListener("mouseenter", () => {
    overVideoPlayer = true;
    showSoundControl();
    scheduleSoundHide();
  });
  videoShell?.addEventListener("mouseleave", () => {
    overVideoPlayer = false;
    overSoundCorner = false;
    clearSoundHideTimer();
    hideSoundControl();
  });
  video.addEventListener("ended", () => {
    changeScene(nextSceneIndex());
  });

  updateSceneUI();
  updateSoundUI();

  video.src = scenes[0];
  video.loop = false;
  video.volume = 0;
  video.muted = true;
  playVideoSafe();
})();
