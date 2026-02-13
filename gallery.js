(async function () {
  const grid = document.getElementById("galleryGrid");
  const slider = document.getElementById("sizeSlider");
  if (!grid || !slider) return;

  const knownFiles = [
    "360.mp4",
    "CRTB.mp4",
    "Creature.mp4",
    "Dune.mp4",
    "Jacy.mp4",
    "Magma.mp4",
    "Sunreactor.mp4",
    "crybaby.mp4",
    "klf.mp4",
    "promo.mp4",
    "promo2.mp4",
  ];

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

  function createdTime(item) {
    const t = item.created ? Date.parse(item.created) : Number.NaN;
    return Number.isNaN(t) ? -Infinity : t;
  }

  function sortByCreated(a, b) {
    const ta = createdTime(a);
    const tb = createdTime(b);
    if (tb !== ta) return tb - ta;

    const ao = Number.isFinite(a.sourceOrder) ? a.sourceOrder : Number.MAX_SAFE_INTEGER;
    const bo = Number.isFinite(b.sourceOrder) ? b.sourceOrder : Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;

    return cleanTitle(a.alt || a.src).localeCompare(cleanTitle(b.alt || b.src));
  }

  function placeNextToEachOther(items, firstKey, secondKey) {
    const out = [...items];
    const firstIndex = out.findIndex((item) => item.key === firstKey);
    const secondIndex = out.findIndex((item) => item.key === secondKey);
    if (firstIndex === -1 || secondIndex === -1) return out;
    if (secondIndex === firstIndex + 1) return out;

    const [secondItem] = out.splice(secondIndex, 1);
    const insertAfter = out.findIndex((item) => item.key === firstKey);
    out.splice(insertAfter + 1, 0, secondItem);
    return out;
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
    workMap.set(key, {
      key,
      src: normalizeSrc(item.src),
      thumb: item.thumb || defaultThumb(item.src),
      thumbFallback: defaultThumbFallback(item.src),
      alt: item.alt || cleanTitle(item.src),
      created: item.created || "",
      sourceOrder: idx,
    });
  });

  knownFiles.forEach((file, idx) => {
    const temp = { src: file, alt: cleanTitle(file) };
    if (isExcludedWork(temp)) return;
    const key = srcKey(file);
    if (workMap.has(key)) return;
    workMap.set(key, {
      key,
      src: normalizeSrc(file),
      thumb: defaultThumb(file),
      thumbFallback: defaultThumbFallback(file),
      alt: cleanTitle(file),
      created: "",
      sourceOrder: 1000 + idx,
    });
  });

  const worksSorted = Array.from(workMap.values()).sort(sortByCreated);
  const works = placeNextToEachOther(worksSorted, "jacy.mp4", "crtb.mp4");

  grid.innerHTML = works
    .map((item) => {
      const src = encodeURI(item.src);
      const thumb = encodeURI(item.thumb);
      const thumbFallback = encodeURI(item.thumbFallback);
      const label = esc(item.alt);
      const pairClass = item.key === "jacy.mp4" || item.key === "crtb.mp4" ? " pair-jc" : "";

      return `
      <button type="button" class="g-tile${pairClass}" data-src="${src}" aria-label="${label}">
        <div class="g-media">
          <img class="g-thumb" src="${thumb}" data-fallback="${thumbFallback}" alt="${label}" loading="lazy" decoding="async" />
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
    let cornerPinned = false;
    let tileHovered = false;

    function setSoundIcon(muted) {
      icon.classList.toggle("is-muted", muted);
      icon.classList.toggle("is-unmuted", !muted);
    }

    function showSoundIcon({ persistent = false } = {}) {
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
      if (!force && cornerPinned) return;
      const prevTimer = iconTimers.get(icon);
      if (prevTimer) clearTimeout(prevTimer);
      icon.classList.remove("is-visible");
      iconTimers.delete(icon);
    }

    function syncCornerState(event) {
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

    setSoundIcon(true);
    hideSoundIcon();

    thumb.addEventListener("load", () => {
      setGeometry(tile, thumb.naturalWidth, thumb.naturalHeight);
    });

    thumb.addEventListener("error", () => {
      const fallback = thumb.dataset.fallback || "";
      if (fallback && thumb.getAttribute("src") !== fallback) {
        thumb.setAttribute("src", fallback);
      } else {
        tile.classList.add("no-thumb");
        tile.style.setProperty("--ratio", "1 / 1");
        tile.classList.add("is-square");
      }
    });

    video.addEventListener("loadedmetadata", () => {
      setGeometry(tile, video.videoWidth, video.videoHeight);
    });

    function startPreview(withSound) {
      if (!video.dataset.loaded) {
        video.src = tile.dataset.src || "";
        video.dataset.loaded = "1";
      }
      video.muted = !withSound;
      setSoundIcon(video.muted);
      tile.classList.add("is-playing");
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }

    function stopPreview() {
      tile.classList.remove("is-playing");
      video.muted = true;
      setSoundIcon(true);
      video.pause();
      video.currentTime = 0;
    }

    tile.addEventListener("mouseenter", (event) => {
      tileHovered = true;
      startPreview(false);
      showSoundIcon();
      syncCornerState(event);
    });

    tile.addEventListener("mouseleave", () => {
      tileHovered = false;
      cornerPinned = false;
      stopPreview();
      hideSoundIcon(true);
    });

    tile.addEventListener("mousemove", (event) => {
      syncCornerState(event);
    });

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

    // Click toggles sound on/off for the selected tile.
    tile.addEventListener("click", () => {
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
})();
