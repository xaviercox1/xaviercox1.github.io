(function () {
  const stage = document.getElementById("industriqueStage");
  const mainImage = document.getElementById("industriqueMainImage");
  const prevButton = document.getElementById("industriquePrev");
  const nextButton = document.getElementById("industriqueNext");
  const cursorDot = document.querySelector(".cursor-dot");
  const controlsVideo = document.querySelector(".industrique-video");
  const screenVideoA = document.getElementById("industriqueScreenVideoA");
  const screenVideoB = document.getElementById("industriqueScreenVideoB");
  const moreToggle = document.getElementById("industriqueMoreToggle");
  const morePanel = document.getElementById("industriqueMorePanel");

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
    const loopPaddingSeconds = 0.16;
    const loopStartSeconds = 0.04;

    controlsVideo.loop = false;

    function playControlsVideo() {
      const promise = controlsVideo.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    }

    function tightenControlsLoop() {
      const duration = controlsVideo.duration;
      if (
        Number.isFinite(duration) &&
        duration > 0.5 &&
        controlsVideo.currentTime >= duration - loopPaddingSeconds
      ) {
        controlsVideo.currentTime = loopStartSeconds;
        playControlsVideo();
      }

      requestAnimationFrame(tightenControlsLoop);
    }

    controlsVideo.addEventListener("loadedmetadata", () => {
      playControlsVideo();
    });

    controlsVideo.addEventListener("ended", () => {
      controlsVideo.currentTime = loopStartSeconds;
      playControlsVideo();
    });

    tightenControlsLoop();
  }

  if (screenVideoA && screenVideoB) {
    const screenSources = [3, 4, 5, 6, 7, 8, 9, 10].map((number) => ({
      webm: `Content/Intrinsik Industrique/Videos/Industrique${number}.webm`,
      mp4: `Content/Intrinsik Industrique/Videos/Industrique${number}.mp4`,
    }));
    let activeScreenIndex = 0;
    let activeScreenVideo = screenVideoA;
    let standbyScreenVideo = screenVideoB;

    function setScreenSources(video, source) {
      video.innerHTML = "";

      const webmSource = document.createElement("source");
      webmSource.src = encodedSource(source.webm);
      webmSource.type = "video/webm";

      const mp4Source = document.createElement("source");
      mp4Source.src = encodedSource(source.mp4);
      mp4Source.type = "video/mp4";

      video.append(webmSource, mp4Source);
      video.load();
    }

    function playScreenVideo(video) {
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
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

    function advanceScreenVideo() {
      activeScreenVideo.classList.remove("is-active");
      activeScreenVideo.pause();

      activeScreenIndex = wrapScreenIndex(activeScreenIndex + 1);
      const previousActiveVideo = activeScreenVideo;
      activeScreenVideo = standbyScreenVideo;
      standbyScreenVideo = previousActiveVideo;

      activeScreenVideo.classList.add("is-active");
      activeScreenVideo.currentTime = 0;
      playScreenVideo(activeScreenVideo);
      prepareStandbyVideo();
    }

    setScreenSources(activeScreenVideo, screenSources[activeScreenIndex]);
    prepareStandbyVideo();
    activeScreenVideo.addEventListener("canplay", () => {
      playScreenVideo(activeScreenVideo);
    }, { once: true });
    screenVideoA.addEventListener("ended", advanceScreenVideo);
    screenVideoB.addEventListener("ended", advanceScreenVideo);
  }

  moreToggle?.addEventListener("click", () => {
    if (!morePanel) return;
    const isOpen = !morePanel.hidden;
    morePanel.hidden = isOpen;
    moreToggle.setAttribute("aria-expanded", String(!isOpen));
  });
})();
