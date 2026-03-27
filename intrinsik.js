(function () {
  const portraitCards = Array.from(document.querySelectorAll(".intrinsik-portrait-card"));
  if (!portraitCards.length) return;

  const iconTimers = new WeakMap();
  const previewPrimerMap = new WeakMap();
  const iconFadeMs = 1000;
  const cornerRevealPx = 92;

  function playVideoSafe(video) {
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {});
    }
  }

  function inferHasAudioFromVideo(video) {
    if (typeof video.mozHasAudio === "boolean") {
      return video.mozHasAudio;
    }
    if (video.audioTracks && typeof video.audioTracks.length === "number") {
      return video.audioTracks.length > 0;
    }
    if (typeof video.webkitAudioDecodedByteCount === "number" && video.webkitAudioDecodedByteCount > 0) {
      return true;
    }
    return null;
  }

  function stopPortrait(card, { resetIcon = true, hideIcon = true } = {}) {
    const video = card.querySelector(".g-vid");
    const icon = card.querySelector(".g-audio-icon");
    if (card.classList.contains("is-playing")) {
      card.classList.remove("is-playing");
    }
    if (!video) return;
    video.muted = true;
    video.pause();
    video.currentTime = 0;
    if (icon && resetIcon) {
      icon.classList.add("is-muted");
      icon.classList.remove("is-unmuted");
    }
    if (icon && hideIcon) {
      const prevTimer = iconTimers.get(icon);
      if (prevTimer) clearTimeout(prevTimer);
      icon.classList.remove("is-visible");
      iconTimers.delete(icon);
    }
  }

  function stopAllPortraits(exceptCard = null) {
    portraitCards.forEach((card) => {
      if (card === exceptCard) return;
      stopPortrait(card);
    });
  }

  portraitCards.forEach((card) => {
    const thumb = card.querySelector(".g-thumb");
    const video = card.querySelector(".g-vid");
    const hotspot = card.querySelector(".g-audio-hotspot");
    const icon = card.querySelector(".g-audio-icon");
    if (!thumb || !video || !hotspot || !icon) return;

    const previewSrc = card.dataset.previewSrc || "";
    const fullSrc = card.dataset.fullSrc || previewSrc;
    let hasAudio = card.dataset.hasAudio === "1" ? true : card.dataset.hasAudio === "0" ? false : null;
    let cornerPinned = false;
    let tileHovered = false;
    let activeSrc = "";
    let thumbReady = thumb.complete && thumb.naturalWidth > 0;
    let pendingStartWithSound = null;

    function markThumbReady() {
      if (!thumbReady) {
        thumbReady = true;
      }
      if (pendingStartWithSound !== null) {
        const withSound = pendingStartWithSound;
        pendingStartWithSound = null;
        startPreview(withSound);
      }
    }

    function loadVideoSource(source, { preload = "metadata" } = {}) {
      if (!source) return;
      if (activeSrc === source && video.dataset.loaded === "1") {
        video.preload = preload;
        return;
      }
      const wasPlaying = !video.paused && !video.ended;
      video.pause();
      video.preload = preload;
      video.src = source;
      video.dataset.loaded = "1";
      activeSrc = source;
      if (wasPlaying) {
        playVideoSafe(video);
      } else {
        video.load();
      }
    }

    function primePreview() {
      if (video.dataset.loaded === "1") return;
      loadVideoSource(previewSrc, { preload: "metadata" });
    }

    function syncAudioAvailability() {
      if (hasAudio !== null) return;
      const inferred = inferHasAudioFromVideo(video);
      if (typeof inferred !== "boolean") return;
      hasAudio = inferred;
      card.dataset.hasAudio = inferred ? "1" : "0";
      applyAudioAvailability();
    }

    function hideSoundIcon(force = false) {
      if (hasAudio === false) return;
      if (!force && cornerPinned) return;
      const prevTimer = iconTimers.get(icon);
      if (prevTimer) clearTimeout(prevTimer);
      icon.classList.remove("is-visible");
      iconTimers.delete(icon);
    }

    function applyAudioAvailability() {
      const hideAudioUI = hasAudio === false;
      icon.hidden = hideAudioUI;
      hotspot.hidden = hideAudioUI;
      if (hideAudioUI) {
        cornerPinned = false;
        hideSoundIcon(true);
      }
    }

    function setSoundIcon(muted) {
      if (hasAudio === false) return;
      icon.classList.toggle("is-muted", muted);
      icon.classList.toggle("is-unmuted", !muted);
    }

    function showSoundIcon({ persistent = false } = {}) {
      if (hasAudio === false) return;
      const prevTimer = iconTimers.get(icon);
      if (prevTimer) clearTimeout(prevTimer);

      icon.classList.add("is-visible");
      if (persistent || cornerPinned) {
        iconTimers.delete(icon);
        return;
      }

      const timer = setTimeout(() => {
        if (!cornerPinned) {
          icon.classList.remove("is-visible");
          iconTimers.delete(icon);
        }
      }, iconFadeMs);
      iconTimers.set(icon, timer);
    }

    function syncCornerState(event) {
      if (hasAudio === false) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inCorner = x >= 0 && y >= 0 && x <= cornerRevealPx && y >= rect.height - cornerRevealPx;
      if (inCorner && !cornerPinned) {
        cornerPinned = true;
        showSoundIcon({ persistent: true });
      } else if (!inCorner && cornerPinned) {
        cornerPinned = false;
        if (tileHovered) {
          showSoundIcon();
        } else {
          hideSoundIcon(true);
        }
      }
    }

    function startPreview(withSound) {
      stopAllPortraits(card);
      if (!thumbReady && !card.classList.contains("no-thumb")) {
        pendingStartWithSound = Boolean(withSound);
        primePreview();
        return;
      }
      pendingStartWithSound = null;
      const shouldUseFullSource = withSound && hasAudio !== false && fullSrc && fullSrc !== previewSrc;
      if (shouldUseFullSource) {
        loadVideoSource(fullSrc, { preload: "auto" });
      } else {
        primePreview();
      }
      video.muted = !(withSound && hasAudio !== false);
      setSoundIcon(video.muted);
      card.classList.add("is-playing");
      playVideoSafe(video);
    }

    applyAudioAvailability();
    setSoundIcon(true);
    hideSoundIcon(true);

    thumb.addEventListener("load", markThumbReady);
    thumb.addEventListener("error", () => {
      const fallback = thumb.dataset.fallback || "";
      if (fallback && thumb.getAttribute("src") !== fallback) {
        thumb.setAttribute("src", fallback);
      } else {
        card.classList.add("no-thumb");
        markThumbReady();
      }
    });

    if (thumbReady) {
      markThumbReady();
    }

    video.addEventListener("loadeddata", syncAudioAvailability);
    video.addEventListener("canplay", syncAudioAvailability);
    video.addEventListener("timeupdate", syncAudioAvailability);

    previewPrimerMap.set(card, primePreview);

    card.addEventListener("mouseenter", (event) => {
      tileHovered = true;
      primePreview();
      startPreview(false);
      if (hasAudio !== false) {
        showSoundIcon();
        syncCornerState(event);
      }
    });

    card.addEventListener("mouseleave", () => {
      tileHovered = false;
      cornerPinned = false;
      pendingStartWithSound = null;
      stopPortrait(card);
      if (hasAudio !== false) {
        hideSoundIcon(true);
      }
    });

    card.addEventListener("mousemove", (event) => {
      if (hasAudio !== false) {
        syncCornerState(event);
      }
    });

    card.addEventListener("focusin", () => {
      tileHovered = true;
      primePreview();
      startPreview(false);
      if (hasAudio !== false) {
        showSoundIcon();
      }
    });

    card.addEventListener("focusout", () => {
      tileHovered = false;
      cornerPinned = false;
      pendingStartWithSound = null;
      stopPortrait(card);
      if (hasAudio !== false) {
        hideSoundIcon(true);
      }
    });

    hotspot.addEventListener("mouseenter", () => {
      if (hasAudio === false) return;
      cornerPinned = true;
      showSoundIcon({ persistent: true });
    });

    hotspot.addEventListener("mouseleave", () => {
      if (hasAudio === false) return;
      cornerPinned = false;
      if (tileHovered) {
        showSoundIcon();
      } else {
        hideSoundIcon(true);
      }
    });

    card.addEventListener("click", () => {
      if (hasAudio === false) return;
      const soundIsOn = card.classList.contains("is-playing") && !video.muted;
      if (soundIsOn) {
        video.muted = true;
        setSoundIcon(true);
        showSoundIcon({ persistent: cornerPinned });
        return;
      }

      startPreview(true);
      showSoundIcon({ persistent: cornerPinned });
    });
  });

  if ("IntersectionObserver" in window) {
    const preloadObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const card = entry.target;
          const primePreview = previewPrimerMap.get(card);
          if (primePreview) primePreview();
          observer.unobserve(card);
        });
      },
      { rootMargin: "220px 0px" }
    );

    portraitCards.forEach((card) => {
      preloadObserver.observe(card);
    });
  }
})();

(function () {
  const video = document.getElementById("intrinsikLandscapeVideo");
  if (!video) return;

  const videoShell = document.querySelector(".intrinsik-landscape-shell");
  const hotspot = videoShell?.querySelector(".g-audio-hotspot");
  const icon = videoShell?.querySelector(".g-audio-icon");
  const sceneButtons = Array.from(document.querySelectorAll(".intrinsik-landscape [data-scene]"));
  const sources = [
    "landscape-promo.mp4",
    "landscape-promo2.mp4",
  ];

  let sceneIndex = 0;
  let transitionLocked = false;
  let hasAudio = null;
  let cornerPinned = false;
  let shellHovered = false;
  let iconTimer = null;

  function inferHasAudioFromVideo() {
    if (typeof video.mozHasAudio === "boolean") {
      return video.mozHasAudio;
    }
    if (video.audioTracks && typeof video.audioTracks.length === "number") {
      return video.audioTracks.length > 0;
    }
    if (typeof video.webkitAudioDecodedByteCount === "number" && video.webkitAudioDecodedByteCount > 0) {
      return true;
    }
    return null;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function playVideoSafe() {
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {});
    }
  }

  function setSoundIcon(muted) {
    if (!icon || hasAudio === false) return;
    icon.classList.toggle("is-muted", muted);
    icon.classList.toggle("is-unmuted", !muted);
  }

  function clearIconTimer() {
    if (!iconTimer) return;
    clearTimeout(iconTimer);
    iconTimer = null;
  }

  function hideSoundIcon(force = false) {
    if (!icon || hasAudio === false) return;
    if (!force && cornerPinned) return;
    clearIconTimer();
    icon.classList.remove("is-visible");
  }

  function showSoundIcon({ persistent = false } = {}) {
    if (!icon || hasAudio === false) return;
    clearIconTimer();
    icon.classList.add("is-visible");
    if (persistent || cornerPinned) return;
    iconTimer = setTimeout(() => {
      iconTimer = null;
      if (!cornerPinned) {
        icon.classList.remove("is-visible");
      }
    }, 1000);
  }

  function applyAudioAvailability() {
    const hideAudioUI = hasAudio === false;
    if (icon) icon.hidden = hideAudioUI;
    if (hotspot) hotspot.hidden = hideAudioUI;
    if (hideAudioUI) {
      cornerPinned = false;
      hideSoundIcon(true);
    }
  }

  function syncAudioAvailability() {
    if (hasAudio !== null) return;
    const inferred = inferHasAudioFromVideo();
    if (typeof inferred !== "boolean") return;
    hasAudio = inferred;
    applyAudioAvailability();
  }

  function toggleSound() {
    if (hasAudio === false || transitionLocked) return;
    video.muted = !video.muted;
    setSoundIcon(video.muted);
    playVideoSafe();
    showSoundIcon({ persistent: cornerPinned });
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

  function updateSceneUI(displayIndex = sceneIndex) {
    sceneButtons.forEach((button) => {
      const idx = Number(button.dataset.scene) - 1;
      button.classList.toggle("is-active", idx === displayIndex);
    });
  }

  function setControlsDisabled(disabled) {
    sceneButtons.forEach((button) => {
      button.disabled = disabled;
    });
  }

  async function changeScene(nextIndex) {
    if (transitionLocked) return;

    if (nextIndex === sceneIndex) {
      video.currentTime = 0;
      playVideoSafe();
      return;
    }

    transitionLocked = true;
    updateSceneUI(nextIndex);
    setControlsDisabled(true);
    const wasMuted = video.muted;

    video.classList.add("is-screen-faded");
    await sleep(450);

    sceneIndex = nextIndex;
    video.pause();
    video.src = sources[sceneIndex];
    video.load();
    await waitForVideoReady();
    video.muted = wasMuted;
    setSoundIcon(video.muted);
    playVideoSafe();

    video.classList.remove("is-screen-faded");
    await sleep(450);

    setControlsDisabled(false);
    updateSceneUI();
    transitionLocked = false;
  }

  updateSceneUI();
  setSoundIcon(true);
  applyAudioAvailability();
  video.addEventListener("loadeddata", syncAudioAvailability);
  video.addEventListener("canplay", syncAudioAvailability);
  video.addEventListener("timeupdate", syncAudioAvailability);

  videoShell?.addEventListener("mouseenter", () => {
    shellHovered = true;
    showSoundIcon();
  });

  videoShell?.addEventListener("mouseleave", () => {
    shellHovered = false;
    cornerPinned = false;
    hideSoundIcon(true);
  });

  videoShell?.addEventListener("click", () => {
    toggleSound();
  });

  hotspot?.addEventListener("mouseenter", () => {
    if (hasAudio === false) return;
    cornerPinned = true;
    showSoundIcon({ persistent: true });
  });

  hotspot?.addEventListener("mouseleave", () => {
    if (hasAudio === false) return;
    cornerPinned = false;
    if (shellHovered) {
      showSoundIcon();
    } else {
      hideSoundIcon(true);
    }
  });

  sceneButtons.forEach((button) => {
    button.addEventListener("click", () => {
      changeScene(Number(button.dataset.scene) - 1);
    });
  });
})();
