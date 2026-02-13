(function () {
  const video = document.getElementById("beneathVideo");
  if (!video) return;

  const videoShell = video.closest(".video-hero--microcosm");
  const soundBtn = document.getElementById("beneathSound");
  const soundHotspot = document.getElementById("beneathSoundHotspot");

  if (!videoShell || !soundBtn) return;

  let muted = Boolean(video.muted);
  let hideSoundTimer = null;
  let overVideoPlayer = false;
  let overSoundCorner = false;

  function clearSoundHideTimer() {
    if (!hideSoundTimer) return;
    clearTimeout(hideSoundTimer);
    hideSoundTimer = null;
  }

  function showSoundControl() {
    soundBtn.classList.add("is-visible");
  }

  function hideSoundControl() {
    if (overSoundCorner) return;
    soundBtn.classList.remove("is-visible");
  }

  function scheduleSoundHide() {
    clearSoundHideTimer();
    hideSoundTimer = setTimeout(() => {
      hideSoundTimer = null;
      hideSoundControl();
    }, 2000);
  }

  function updateSoundUI() {
    soundBtn.classList.toggle("is-muted", muted);
    soundBtn.classList.toggle("is-unmuted", !muted);
    soundBtn.setAttribute("aria-label", muted ? "Enable sound" : "Mute sound");
  }

  function setCornerHover(isHovering) {
    overSoundCorner = isHovering;
    if (isHovering) {
      clearSoundHideTimer();
      showSoundControl();
    } else if (overVideoPlayer) {
      showSoundControl();
      scheduleSoundHide();
    } else {
      hideSoundControl();
    }
  }

  function toggleSound() {
    muted = !muted;
    video.muted = muted;
    updateSoundUI();
  }

  function handleSoundToggleRequest() {
    showSoundControl();
    scheduleSoundHide();
    toggleSound();
  }

  soundBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    handleSoundToggleRequest();
  });

  videoShell.addEventListener("click", (event) => {
    if (event.target === soundBtn || soundBtn.contains(event.target)) return;
    handleSoundToggleRequest();
  });

  soundHotspot?.addEventListener("mouseenter", () => setCornerHover(true));
  soundHotspot?.addEventListener("mouseleave", () => setCornerHover(false));
  soundBtn.addEventListener("mouseenter", () => setCornerHover(true));
  soundBtn.addEventListener("mouseleave", () => setCornerHover(false));

  videoShell.addEventListener("mouseenter", () => {
    overVideoPlayer = true;
    showSoundControl();
    scheduleSoundHide();
  });

  videoShell.addEventListener("mouseleave", () => {
    overVideoPlayer = false;
    overSoundCorner = false;
    clearSoundHideTimer();
    hideSoundControl();
  });

  updateSoundUI();
})();
