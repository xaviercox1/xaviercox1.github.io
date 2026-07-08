(function () {
  const stage = document.getElementById("industriqueStage");
  const mainImage = document.getElementById("industriqueMainImage");
  const prevButton = document.getElementById("industriquePrev");
  const nextButton = document.getElementById("industriqueNext");
  const cursorDot = document.querySelector(".cursor-dot");
  const controlsVideo = document.querySelector(".industrique-video");
  const screenReel = document.querySelector(".industrique-screen-reel");
  const screenVideoA = document.getElementById("industriqueScreenVideoA");
  const screenVideoB = document.getElementById("industriqueScreenVideoB");
  const moreToggle = document.getElementById("industriqueMoreToggle");
  const morePanel = document.getElementById("industriqueMorePanel");
  let moreRestoreCenter = null;

  if (!stage || !mainImage) return;

  const photos = [
    {
      src: "Content/Intrinsik Industrique/Web/photo-01-dscf3062.jpg",
      alt: "Intrinsik event lighting and LED screen in red haze",
    },
    {
      src: "Content/Intrinsik Industrique/Web/photo-02-dscf3063.jpg",
      alt: "Intrinsik stage with red lighting and silhouetted crowd",
    },
    {
      src: "Content/Intrinsik Industrique/Web/photo-03-dscf3101.jpg",
      alt: "Intrinsik LED screen and crowd in deep red light",
    },
    {
      src: "Content/Intrinsik Industrique/Web/photo-04-dscf3163.jpg",
      alt: "DJ silhouette in blue haze with LED screen behind",
    },
    {
      src: "Content/Intrinsik Industrique/Web/photo-05-dscf3169.jpg",
      alt: "Intrinsik crowd and LED screen under blue lighting",
    },
    {
      src: "Content/Intrinsik Industrique/Web/photo-06-dscf3197.jpg",
      alt: "Blue beams over the Intrinsik dance floor",
    },
    {
      src: "Content/Intrinsik Industrique/Web/photo-07-dscf3204.jpg",
      alt: "Green LED screen and moving beams at Intrinsik",
    },
    {
      src: "Content/Intrinsik Industrique/Web/photo-08-dscf3205.jpg",
      alt: "Intrinsik venue in green haze and blue beams",
    },
    {
      src: "Content/Intrinsik Industrique/Web/photo-09-dscf3206.jpg",
      alt: "Wide Intrinsik crowd view with LED screen and stage lighting",
    },
  ];

  let currentIndex = 0;
  let cursorDirection = "";

  function wrapIndex(index) {
    return (index + photos.length) % photos.length;
  }

  function encodedSource(src) {
    return encodeURI(src);
  }

  function preloadPhoto(index) {
    const image = new Image();
    image.decoding = "async";
    image.src = encodedSource(photos[wrapIndex(index)].src);
  }

  function prepareInlineMutedVideo(video) {
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.preload = "auto";
  }

  function playInlineVideo(video) {
    if (!video) return;
    prepareInlineMutedVideo(video);

    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {});
    }
  }

  function bindSmoothLoop(video, options = {}) {
    if (!video) return;

    const start = options.start ?? 0;
    const padding = options.padding ?? 0.08;
    let didLoop = false;

    const tick = () => {
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > start + padding + 0.35) {
        const loopAt = duration - padding;

        if (!didLoop && video.currentTime >= loopAt) {
          didLoop = true;
          try {
            video.currentTime = start;
          } catch (_error) {}
          playInlineVideo(video);
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

  function cueLoopStart(video, start) {
    if (!video) return;

    const cue = () => {
      if (video.readyState < 1) return;
      try {
        if (Math.abs(video.currentTime - start) > 0.04) {
          video.currentTime = start;
        }
      } catch (_error) {}
    };

    if (video.readyState >= 1) {
      cue();
    } else {
      video.addEventListener("loadedmetadata", cue, { once: true });
    }
  }

  function bindBufferedLoop(video, options = {}) {
    if (!video) return false;

    const shell = video.closest(".industrique-video-shell");
    if (!shell) return false;

    const start = options.start ?? 0;
    const padding = options.padding ?? 0.42;
    const standby = video.cloneNode(true);
    const players = [video, standby];
    let activeIndex = 0;
    let isSwapping = false;

    standby.removeAttribute("id");
    standby.setAttribute("aria-hidden", "true");
    video.after(standby);

    players.forEach((player, index) => {
      prepareInlineMutedVideo(player);
      player.loop = false;
      player.removeAttribute("loop");
      player.classList.toggle("is-active", index === 0);
      cueLoopStart(player, start);
      player.load();
    });

    function getActivePlayer() {
      return players[activeIndex];
    }

    function getStandbyPlayer() {
      return players[(activeIndex + 1) % players.length];
    }

    function playPlayer(player) {
      prepareInlineMutedVideo(player);
      player.loop = false;
      player.removeAttribute("loop");
      const promise = player.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    }

    function swapPlayers() {
      if (isSwapping) return;
      isSwapping = true;

      const outgoing = getActivePlayer();
      const incoming = getStandbyPlayer();

      cueLoopStart(incoming, start);
      playPlayer(incoming);

      requestAnimationFrame(() => {
        incoming.classList.add("is-active");
        outgoing.classList.remove("is-active");
        activeIndex = (activeIndex + 1) % players.length;

        window.setTimeout(() => {
          outgoing.pause();
          cueLoopStart(outgoing, start);
          isSwapping = false;
        }, 90);
      });
    }

    function tick() {
      const active = getActivePlayer();
      const duration = active.duration;

      if (
        Number.isFinite(duration) &&
        duration > start + padding + 0.6 &&
        active.currentTime >= duration - padding
      ) {
        swapPlayers();
      }

      window.requestAnimationFrame(tick);
    }

    players.forEach((player) => {
      player.addEventListener("ended", swapPlayers);
    });

    playPlayer(getActivePlayer());
    tick();
    return true;
  }

  function waitForVideoReady(video) {
    if (!video || video.readyState >= 3) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let isResolved = false;
      let fallbackTimer = 0;

      const finish = () => {
        if (isResolved || video.readyState < 3) return;
        isResolved = true;
        window.clearTimeout(fallbackTimer);
        video.removeEventListener("loadeddata", finish);
        video.removeEventListener("canplay", finish);
        video.removeEventListener("canplaythrough", finish);
        video.removeEventListener("playing", finish);
        video.removeEventListener("error", fallback);
        resolve();
      };

      const fallback = () => {
        if (isResolved) return;
        isResolved = true;
        window.clearTimeout(fallbackTimer);
        video.removeEventListener("loadeddata", finish);
        video.removeEventListener("canplay", finish);
        video.removeEventListener("canplaythrough", finish);
        video.removeEventListener("playing", finish);
        video.removeEventListener("error", fallback);
        resolve();
      };

      video.addEventListener("loadeddata", finish);
      video.addEventListener("canplay", finish);
      video.addEventListener("canplaythrough", finish);
      video.addEventListener("playing", finish);
      video.addEventListener("error", fallback);
      fallbackTimer = window.setTimeout(fallback, 8000);
      finish();
    });
  }

  function renderPhoto(index) {
    currentIndex = wrapIndex(index);
    const photo = photos[currentIndex];
    mainImage.src = encodedSource(photo.src);
    mainImage.alt = photo.alt;
    stage.setAttribute("aria-label", `Next photograph, showing ${photo.alt}`);
    preloadPhoto(currentIndex + 1);
    preloadPhoto(currentIndex - 1);
  }

  function stepPhoto(direction) {
    renderPhoto(currentIndex + direction);
  }

  function setCursorDirection(direction) {
    if (!cursorDot || cursorDirection === direction) return;
    cursorDirection = direction;
    cursorDot.classList.toggle("cursor-dot--photo-left", direction === "left");
    cursorDot.classList.toggle("cursor-dot--photo-right", direction === "right");
  }

  function clearCursorDirection() {
    setCursorDirection("");
  }

  prevButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    stepPhoto(-1);
  });

  nextButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    stepPhoto(1);
  });

  prevButton?.addEventListener("pointerenter", () => {
    setCursorDirection("left");
  });

  nextButton?.addEventListener("pointerenter", () => {
    setCursorDirection("right");
  });

  prevButton?.addEventListener("pointerleave", clearCursorDirection);
  nextButton?.addEventListener("pointerleave", clearCursorDirection);
  stage.addEventListener("pointerleave", clearCursorDirection);

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      stepPhoto(-1);
    } else if (event.key === "ArrowRight") {
      stepPhoto(1);
    }
  });

  preloadPhoto(1);

  if (controlsVideo) {
    const loopStartSeconds = 0;
    const loopSwapPaddingSeconds = 0.08;

    prepareInlineMutedVideo(controlsVideo);
    controlsVideo.loop = false;
    controlsVideo.removeAttribute("loop");

    if (!bindBufferedLoop(controlsVideo, { start: loopStartSeconds, padding: loopSwapPaddingSeconds })) {
      controlsVideo.addEventListener("loadedmetadata", () => {
        if (controlsVideo.currentTime < loopStartSeconds) {
          controlsVideo.currentTime = loopStartSeconds;
        }
        playInlineVideo(controlsVideo);
      });

      controlsVideo.addEventListener("ended", () => {
        controlsVideo.currentTime = loopStartSeconds;
        playInlineVideo(controlsVideo);
      });

      bindSmoothLoop(controlsVideo, { start: loopStartSeconds, padding: loopSwapPaddingSeconds });
      playInlineVideo(controlsVideo);
    }
  }

  if (screenVideoA && screenVideoB) {
    const screenSources = [3, 4, 5, 6, 7, 8, 9, 10].map((number) => ({
      webm: `Content/Intrinsik Industrique/Videos/Industrique${number}.webm`,
      mp4: `Content/Intrinsik Industrique/Videos/Industrique${number}.mp4`,
      poster: number === 3 ? "Content/Intrinsik Industrique/Videos/Industrique3-poster.png" : "",
    }));
    let activeScreenIndex = 0;
    let activeScreenVideo = screenVideoA;
    let standbyScreenVideo = screenVideoB;
    let screenAdvanceLocked = false;

    prepareInlineMutedVideo(screenVideoA);
    prepareInlineMutedVideo(screenVideoB);

    function setScreenSources(video, source) {
      video.innerHTML = "";

      const mp4Source = document.createElement("source");
      mp4Source.src = encodedSource(source.mp4);
      mp4Source.type = "video/mp4";

      const webmSource = document.createElement("source");
      webmSource.src = encodedSource(source.webm);
      webmSource.type = "video/webm";

      video.append(mp4Source, webmSource);
      video.poster = source.poster ? encodedSource(source.poster) : "";
      video.dataset.screenSrc = source.mp4;
      video.load();
    }

    function playScreenVideo(video) {
      playInlineVideo(video);
    }

    function setScreenLoading(isLoading) {
      screenReel?.classList.toggle("is-loading-media", isLoading);
    }

    function wrapScreenIndex(index) {
      return (index + screenSources.length) % screenSources.length;
    }

    function prepareStandbyVideo() {
      const nextIndex = wrapScreenIndex(activeScreenIndex + 1);
      setScreenSources(standbyScreenVideo, screenSources[nextIndex]);
      standbyScreenVideo.currentTime = 0;
      standbyScreenVideo.preload = "auto";
    }

    async function advanceScreenVideo() {
      if (screenAdvanceLocked) return;
      screenAdvanceLocked = true;
      setScreenLoading(true);

      const nextIndex = wrapScreenIndex(activeScreenIndex + 1);
      const previousActiveVideo = activeScreenVideo;
      const nextActiveVideo = standbyScreenVideo;

      try {
        await waitForVideoReady(nextActiveVideo);

        activeScreenVideo.classList.remove("is-active");
        activeScreenVideo.pause();

        activeScreenIndex = nextIndex;
        activeScreenVideo = nextActiveVideo;
        standbyScreenVideo = previousActiveVideo;
        activeScreenVideo.classList.add("is-active");
        activeScreenVideo.currentTime = 0;
        playScreenVideo(activeScreenVideo);
        setScreenLoading(false);
        prepareStandbyVideo();
      } finally {
        screenAdvanceLocked = false;
      }
    }

    setScreenSources(activeScreenVideo, screenSources[activeScreenIndex]);
    setScreenLoading(true);
    prepareStandbyVideo();
    waitForVideoReady(activeScreenVideo).then(() => {
      setScreenLoading(false);
      playScreenVideo(activeScreenVideo);
    });
    screenVideoA.addEventListener("canplay", () => {
      if (screenVideoA.classList.contains("is-active")) setScreenLoading(false);
    });
    screenVideoB.addEventListener("canplay", () => {
      if (screenVideoB.classList.contains("is-active")) setScreenLoading(false);
    });
    screenVideoA.addEventListener("playing", () => {
      if (screenVideoA.classList.contains("is-active")) setScreenLoading(false);
    });
    screenVideoB.addEventListener("playing", () => {
      if (screenVideoB.classList.contains("is-active")) setScreenLoading(false);
    });
    screenVideoA.addEventListener("ended", advanceScreenVideo);
    screenVideoB.addEventListener("ended", advanceScreenVideo);
  }

  moreToggle?.addEventListener("click", () => {
    if (!morePanel) return;
    const isOpen = moreToggle.getAttribute("aria-expanded") === "true";
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function restoreMoreCenter() {
      if (moreRestoreCenter === null) return;
      const targetScrollY = Math.max(0, moreRestoreCenter - window.innerHeight / 2);
      window.scrollTo({
        top: targetScrollY,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }

    if (isOpen) {
      morePanel.classList.remove("is-open");
      morePanel.classList.add("is-closing");
      moreToggle.setAttribute("aria-expanded", "false");
      moreToggle.textContent = "more";

      window.setTimeout(() => {
        if (moreToggle.getAttribute("aria-expanded") === "false") {
          morePanel.hidden = true;
          morePanel.classList.remove("is-closing");
          restoreMoreCenter();
        }
      }, 280);
      return;
    }

    moreRestoreCenter = window.scrollY + window.innerHeight / 2;
    morePanel.hidden = false;
    morePanel.classList.remove("is-closing");
    moreToggle.setAttribute("aria-expanded", "true");
    moreToggle.textContent = "less";

    window.requestAnimationFrame(() => {
      morePanel.classList.add("is-open");
    });
  });
})();
