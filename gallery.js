(async function () {
  const grid = document.getElementById("galleryGrid");
  const slider = document.getElementById("sizeSlider");
  if (!grid || !slider) return;

  const knownFiles = [
    "Back Inside.mp4",
    "Magma.mp4",
    "Sunreactor.mp4",
    "promo2.mp4",
    "Creature.mp4",
    "promo.mp4",
    "CRTB.mp4",
    "Dune.mp4",
    "Jacy.mp4",
    "klf.mp4",
    "crybaby.mp4",
    "360.mp4",
  ];
  const eagerPreloadCount = 2;

  function esc(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function srcKey(src) {
    const clean = String(src || "").split("/").pop() || "";
    return decodeURIComponent(clean).trim().toLowerCase();
  }

  function normalizeSrc(src) {
    if (!src) return "";
    return src.includes("/") ? src : `Content/${src}`;
  }

  function baseName(src) {
    const file = decodeURIComponent(String(src || "").split("/").pop() || "");
    return file.replace(/\.[^/.]+$/, "");
  }

  function defaultThumb(src) {
    return `Content/Thumbnails/${baseName(src)}.png`;
  }

  function defaultThumbFallback(src) {
    return `Content/Thumbnails/${baseName(src).toLowerCase()}.png`;
  }

  function cleanTitle(raw) {
    return String(raw || "")
      .replace(/\.[^/.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isExcludedWork(item) {
    const source = srcKey(item.src || "");
    const alt = String(item.alt || "").toLowerCase();
    return (
      source.includes("beneath your eyes") ||
      alt.includes("beneath your eyes") ||
      source === "360.mp4" ||
      alt === "360"
    );
  }

  function sortBySourceOrder(a, b) {
    const ao = Number.isFinite(a.sourceOrder) ? a.sourceOrder : Number.MAX_SAFE_INTEGER;
    const bo = Number.isFinite(b.sourceOrder) ? b.sourceOrder : Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;

    return cleanTitle(a.alt || a.src).localeCompare(cleanTitle(b.alt || b.src));
  }

  let manifestItems = [];
  try {
    const response = await fetch("Content/manifest.json", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.items)) {
        manifestItems = data.items.filter((item) => item && item.src);
      }
    }
  } catch (_error) {
    manifestItems = [];
  }

  const workMap = new Map();

  manifestItems.forEach((item, idx) => {
    if (isExcludedWork(item)) return;
    const key = srcKey(item.src);
    const fullSource = normalizeSrc(item.fullSrc || item.src);
    const previewSource = normalizeSrc(item.previewSrc || fullSource);
    workMap.set(key, {
      key,
      src: fullSource,
      fullSrc: fullSource,
      previewSrc: previewSource,
      thumb: item.thumb || defaultThumb(item.src),
      thumbFallback: defaultThumbFallback(item.src),
      alt: item.alt || cleanTitle(item.src),
      created: item.created || "",
      hasAudio: typeof item.hasAudio === "boolean" ? item.hasAudio : null,
      sourceOrder: idx,
    });
  });

  knownFiles.forEach((file, idx) => {
    const temp = { src: file, alt: cleanTitle(file) };
    if (isExcludedWork(temp)) return;
    const key = srcKey(file);
    if (workMap.has(key)) return;
    const fullSource = normalizeSrc(file);
    workMap.set(key, {
      key,
      src: fullSource,
      fullSrc: fullSource,
      previewSrc: fullSource,
      thumb: defaultThumb(file),
      thumbFallback: defaultThumbFallback(file),
      alt: cleanTitle(file),
      created: "",
      hasAudio: null,
      sourceOrder: 1000 + idx,
    });
  });

  const works = Array.from(workMap.values()).sort(sortBySourceOrder);

  grid.innerHTML = works
    .map((item, idx) => {
      const src = encodeURI(item.src);
      const fullSrc = encodeURI(item.fullSrc || item.src);
      const previewSrc = encodeURI(item.previewSrc || item.src);
      const thumb = encodeURI(item.thumb);
      const thumbFallback = encodeURI(item.thumbFallback);
      const label = esc(item.alt);
      const hasAudioAttr = item.hasAudio === false ? "0" : item.hasAudio === true ? "1" : "auto";
      const pairClass = item.key === "jacy.mp4" || item.key === "crtb.mp4" ? " pair-jc" : "";
      const eagerAttr = idx < eagerPreloadCount ? "1" : "0";
      const thumbLoadingAttr = idx < eagerPreloadCount ? "eager" : "lazy";
      const thumbPriorityAttr = idx < eagerPreloadCount ? "high" : "auto";

      return `
      <button type="button" class="g-tile${pairClass}" data-src="${src}" data-full-src="${fullSrc}" data-preview-src="${previewSrc}" data-eager="${eagerAttr}" data-has-audio="${hasAudioAttr}" aria-label="${label}">
        <div class="g-media">
          <img class="g-thumb" src="${thumb}" data-fallback="${thumbFallback}" alt="${label}" loading="${thumbLoadingAttr}" fetchpriority="${thumbPriorityAttr}" decoding="async" />
          <video class="g-vid" muted playsinline loop preload="none"></video>
          <span class="g-audio-hotspot" aria-hidden="true"></span>
          <span class="g-audio-icon is-muted" aria-hidden="true">
            <svg class="g-audio-icon-muted" viewBox="0 0 24 24">
              <path class="g-audio-body" d="M11 6L7.4 9H4v6h3.4L11 18V6z"></path>
              <line x1="16" y1="9" x2="21" y2="14"></line>
              <line x1="21" y1="9" x2="16" y2="14"></line>
            </svg>
            <svg class="g-audio-icon-unmuted" viewBox="0 0 24 24">
              <path class="g-audio-body" d="M11 6L7.4 9H4v6h3.4L11 18V6z"></path>
              <path d="M15.5 9.5a4 4 0 0 1 0 5"></path>
              <path d="M18.2 7.6a7 7 0 0 1 0 8.8"></path>
            </svg>
          </span>
        </div>
      </button>`;
    })
    .join("");

  const tiles = Array.from(grid.querySelectorAll(".g-tile"));
  const iconTimers = new WeakMap();
  const previewPrimerMap = new WeakMap();
  const iconFadeMs = 1000;
  const cornerRevealPx = 92;

  function setGeometry(tile, w, h) {
    if (!w || !h) return;
    if (tile.classList.contains("pair-jc")) {
      tile.style.setProperty("--ratio", "1 / 1");
      tile.classList.remove("is-landscape", "is-portrait", "is-square");
      tile.classList.add("is-square");
      return;
    }
    tile.style.setProperty("--ratio", `${w} / ${h}`);
    const ratio = w / h;
    tile.classList.remove("is-landscape", "is-portrait", "is-square");
    if (ratio >= 1.25) {
      tile.classList.add("is-landscape");
    } else if (ratio <= 0.8) {
      tile.classList.add("is-portrait");
    } else {
      tile.classList.add("is-square");
    }
  }

  function applySize(value) {
    const ratio = Number(value);
    const unit = 130 + ratio * 230;
    grid.style.setProperty("--gallery-unit", `${unit}px`);
  }

  let targetRatio = Number(slider.value);
  let displayRatio = targetRatio;
  let sizeRaf = 0;
  const followSpeed = 0.2; // match cursor follow speed

  function animateSize() {
    displayRatio += (targetRatio - displayRatio) * followSpeed;
    if (Math.abs(targetRatio - displayRatio) < 0.001) {
      displayRatio = targetRatio;
    }

    slider.value = String(displayRatio);
    applySize(displayRatio);

    if (displayRatio !== targetRatio) {
      sizeRaf = requestAnimationFrame(animateSize);
    } else {
      sizeRaf = 0;
    }
  }

  function queueSizeAnimation() {
    if (!sizeRaf) sizeRaf = requestAnimationFrame(animateSize);
  }

  applySize(displayRatio);
  slider.addEventListener("input", () => {
    targetRatio = Number(slider.value);
    queueSizeAnimation();
  });

  tiles.forEach((tile) => {
    const thumb = tile.querySelector(".g-thumb");
    const video = tile.querySelector(".g-vid");
    const hotspot = tile.querySelector(".g-audio-hotspot");
    const icon = tile.querySelector(".g-audio-icon");
    if (!thumb || !video || !icon || !hotspot) return;
    const previewSrc = tile.dataset.previewSrc || tile.dataset.src || "";
    const fullSrc = tile.dataset.fullSrc || previewSrc;
    let hasAudio = tile.dataset.hasAudio === "1" ? true : tile.dataset.hasAudio === "0" ? false : null;
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
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {});
        }
      } else {
        video.load();
      }
    }

    function primePreview() {
      if (video.dataset.loaded === "1") return;
      loadVideoSource(previewSrc, { preload: "metadata" });
    }

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

    function syncAudioAvailability() {
      if (hasAudio !== null) return;
      const inferred = inferHasAudioFromVideo();
      if (typeof inferred !== "boolean") return;
      hasAudio = inferred;
      tile.dataset.hasAudio = inferred ? "1" : "0";
      applyAudioAvailability();
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

    function hideSoundIcon(force = false) {
      if (hasAudio === false) return;
      if (!force && cornerPinned) return;
      const prevTimer = iconTimers.get(icon);
      if (prevTimer) clearTimeout(prevTimer);
      icon.classList.remove("is-visible");
      iconTimers.delete(icon);
    }

    function syncCornerState(event) {
      if (hasAudio === false) return;
      const rect = tile.getBoundingClientRect();
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

    applyAudioAvailability();
    if (hasAudio !== false) {
      setSoundIcon(true);
      hideSoundIcon();
    }

    thumb.addEventListener("load", () => {
      setGeometry(tile, thumb.naturalWidth, thumb.naturalHeight);
      markThumbReady();
    });

    thumb.addEventListener("error", () => {
      const fallback = thumb.dataset.fallback || "";
      if (fallback && thumb.getAttribute("src") !== fallback) {
        thumb.setAttribute("src", fallback);
      } else {
        tile.classList.add("no-thumb");
        tile.style.setProperty("--ratio", "1 / 1");
        tile.classList.add("is-square");
        markThumbReady();
      }
    });

    if (thumbReady) {
      setGeometry(tile, thumb.naturalWidth, thumb.naturalHeight);
    }

    video.addEventListener("loadedmetadata", () => {
      setGeometry(tile, video.videoWidth, video.videoHeight);
      syncAudioAvailability();
    });
    video.addEventListener("loadeddata", syncAudioAvailability);
    video.addEventListener("canplay", syncAudioAvailability);
    video.addEventListener("timeupdate", syncAudioAvailability);

    function startPreview(withSound) {
      if (!thumbReady && !tile.classList.contains("no-thumb")) {
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
      if (hasAudio !== false) {
        setSoundIcon(video.muted);
      }
      tile.classList.add("is-playing");
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }

    function stopPreview() {
      tile.classList.remove("is-playing");
      video.muted = true;
      if (hasAudio !== false) {
        setSoundIcon(true);
      }
      video.pause();
      video.currentTime = 0;
    }

    previewPrimerMap.set(tile, primePreview);
    if (tile.dataset.eager === "1") {
      primePreview();
    }

    tile.addEventListener("mouseenter", (event) => {
      tileHovered = true;
      primePreview();
      startPreview(false);
      if (hasAudio !== false) {
        showSoundIcon();
        syncCornerState(event);
      }
    });

    tile.addEventListener("mouseleave", () => {
      tileHovered = false;
      cornerPinned = false;
      pendingStartWithSound = null;
      stopPreview();
      if (hasAudio !== false) {
        hideSoundIcon(true);
      }
    });

    tile.addEventListener("mousemove", (event) => {
      if (hasAudio !== false) {
        syncCornerState(event);
      }
    });

    if (hasAudio !== false) {
      hotspot.addEventListener("mouseenter", () => {
        cornerPinned = true;
        showSoundIcon({ persistent: true });
      });

      hotspot.addEventListener("mouseleave", () => {
        cornerPinned = false;
        if (tileHovered) {
          showSoundIcon();
        } else {
          hideSoundIcon(true);
        }
      });
    }

    // Click toggles sound on/off for the selected tile.
    tile.addEventListener("click", () => {
      if (hasAudio === false) return;
      const soundIsOn = tile.classList.contains("is-playing") && !video.muted;
      if (soundIsOn) {
        video.muted = true;
        setSoundIcon(true);
        showSoundIcon({ persistent: cornerPinned });
        return;
      }

      tiles.forEach((otherTile) => {
        if (otherTile !== tile) {
          const otherVideo = otherTile.querySelector(".g-vid");
          const otherIcon = otherTile.querySelector(".g-audio-icon");
          if (otherVideo) {
            otherTile.classList.remove("is-playing");
            otherVideo.muted = true;
            otherVideo.pause();
            otherVideo.currentTime = 0;
          }
          if (otherIcon) {
            otherIcon.classList.add("is-muted");
            otherIcon.classList.remove("is-unmuted");
            const otherTimer = iconTimers.get(otherIcon);
            if (otherTimer) clearTimeout(otherTimer);
            otherIcon.classList.remove("is-visible");
            iconTimers.delete(otherIcon);
          }
        }
      });
      startPreview(true);
      showSoundIcon({ persistent: cornerPinned });
    });
  });

  if ("IntersectionObserver" in window) {
    const preloadObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const tile = entry.target;
          const primePreview = previewPrimerMap.get(tile);
          if (primePreview) primePreview();
          observer.unobserve(tile);
        });
      },
      { rootMargin: "220px 0px" }
    );

    tiles.forEach((tile) => {
      if (tile.dataset.eager === "1") return;
      preloadObserver.observe(tile);
    });
  }
})();
