(async function () {
  const index = document.getElementById("galleryIndex");
  const stage = document.getElementById("galleryStage");
  const stageThumb = document.getElementById("galleryStageThumb");
  const stageVideo = document.getElementById("galleryStageVideo");
  const stageYear = document.getElementById("galleryStageYear");
  const audioBtn = document.getElementById("galleryAudio");

  if (!index || !stage || !stageThumb || !stageVideo || !stageYear || !audioBtn) return;

  const knownWorks = [
    {
      src: "Back Inside.mp4",
      thumb: "Content/Thumbnails/Back Inside.png",
      alt: "Back Inside",
      hasAudio: true,
    },
    {
      src: "Magma.mp4",
      thumb: "Content/Thumbnails/Magma.png",
      alt: "Magma",
      hasAudio: false,
    },
    {
      src: "Sunreactor.mp4",
      thumb: "Content/Thumbnails/Sunreactor.png",
      alt: "Sunreactor",
      hasAudio: false,
    },
    {
      src: "Creature.mp4",
      thumb: "Content/Thumbnails/Creature.png",
      alt: "Creature",
      hasAudio: false,
    },
    {
      src: "Dune.mp4",
      thumb: "Content/Thumbnails/Dune.png",
      alt: "Dune",
      hasAudio: false,
    },
    {
      src: "Jacy.mp4",
      thumb: "Content/Thumbnails/Jacy.png",
      alt: "Jacy",
      hasAudio: true,
    },
    {
      src: "klf.mp4",
      thumb: "Content/Thumbnails/klf.png",
      alt: "KLF",
      hasAudio: true,
    },
    {
      src: "crybaby.mp4",
      thumb: "Content/Thumbnails/crybaby.png",
      alt: "Crybaby",
      hasAudio: true,
    },
    {
      src: "360.mp4",
      thumb: "Content/Thumbnails/360.png",
      alt: "360",
      hasAudio: true,
    },
    {
      src: "joke king.mp4",
      thumb: "Content/Thumbnails/joe king.png",
      alt: "Joe King",
      hasAudio: true,
    },
    {
      src: "Everything I Am.m4v",
      thumb: "Content/Thumbnails/everything i am.png",
      alt: "Everything I Am",
      hasAudio: true,
    },
    {
      src: "midnight gospel.mp4",
      thumb: "Content/Thumbnails/midnight gospel.png",
      alt: "Midnight Gospel",
      hasAudio: true,
    },
  ];

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

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
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

  function hashString(value) {
    let hash = 2166136261;
    const text = String(value || "");
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function sortByMixedOrder(a, b) {
    const ah = hashString(`${a.alt}|${a.src}`);
    const bh = hashString(`${b.alt}|${b.src}`);
    if (ah !== bh) return ah - bh;
    return sortBySourceOrder(a, b);
  }

  function setRatio(width, height) {
    if (!width || !height) return;
    stage.style.setProperty("--stage-ratio", `${width} / ${height}`);
  }

  function formatYear(created) {
    if (!created) return "";
    const date = new Date(created);
    if (Number.isNaN(date.getTime())) return "";
    return String(date.getFullYear());
  }

  function setAudioButtonState(isMuted) {
    audioBtn.classList.toggle("is-muted", isMuted);
    audioBtn.classList.toggle("is-unmuted", !isMuted);
    audioBtn.setAttribute("aria-label", isMuted ? "Unmute video" : "Mute video");
  }

  function setAudioAvailability(hasAudio) {
    audioBtn.hidden = !hasAudio;
    audioBtn.disabled = !hasAudio;
  }

  function toggleStageSound() {
    if (!currentWork || currentWork.hasAudio === false) return;
    const nextMuted = !stageVideo.muted;
    stageVideo.muted = nextMuted;
    setAudioButtonState(nextMuted);
    playStageVideo();
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
    const title = item.alt || cleanTitle(item.src);
    workMap.set(key, {
      key,
      slug: slugify(title || item.src),
      src: fullSource,
      fullSrc: fullSource,
      previewSrc: previewSource,
      thumb: item.thumb || defaultThumb(item.src),
      thumbFallback: defaultThumbFallback(item.src),
      alt: title,
      created: item.created || "",
      hasAudio: typeof item.hasAudio === "boolean" ? item.hasAudio : null,
      sourceOrder: idx,
    });
  });

  knownWorks.forEach((item, idx) => {
    const temp = { src: item.src, alt: item.alt || cleanTitle(item.src) };
    if (isExcludedWork(temp)) return;
    const key = srcKey(item.src);
    if (workMap.has(key)) return;
    const fullSource = normalizeSrc(item.src);
    const title = item.alt || cleanTitle(item.src);
    workMap.set(key, {
      key,
      slug: slugify(title || item.src),
      src: fullSource,
      fullSrc: fullSource,
      previewSrc: fullSource,
      thumb: item.thumb || defaultThumb(item.src),
      thumbFallback: item.thumb || defaultThumbFallback(item.src),
      alt: title,
      created: item.created || "",
      hasAudio: typeof item.hasAudio === "boolean" ? item.hasAudio : null,
      sourceOrder: 1000 + idx,
    });
  });

  const works = Array.from(workMap.values()).sort(sortByMixedOrder);
  if (!works.length) return;

  index.innerHTML = works
    .map((item) => {
      const thumb = encodeURI(item.thumb);
      const thumbFallback = encodeURI(item.thumbFallback);
      return `
        <button type="button" class="gallery-index-item" data-work="${item.slug}" aria-label="${item.alt}">
          <img class="gallery-index-thumb" src="${thumb}" data-fallback="${thumbFallback}" alt="" loading="lazy" decoding="async" />
        </button>
      `;
    })
    .join("");

  index.querySelectorAll(".gallery-index-thumb").forEach((img) => {
    img.addEventListener("error", () => {
      const fallback = img.dataset.fallback || "";
      if (fallback && img.getAttribute("src") !== fallback) {
        img.setAttribute("src", fallback);
      }
    });
  });

  const indexButtons = Array.from(index.querySelectorAll(".gallery-index-item"));
  let currentWork = null;

  function updateUrl(work, replace = false) {
    const url = new URL(window.location.href);
    url.searchParams.set("work", work.slug);
    const method = replace ? "replaceState" : "pushState";
    window.history[method]({}, "", url);
  }

  function syncSelectionState() {
    indexButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.work === currentWork?.slug);
    });
  }

  function loadStageThumb(work) {
    stageThumb.alt = work.alt;
    stageThumb.src = encodeURI(work.thumb);
  }

  function playStageVideo() {
    const promise = stageVideo.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {});
    }
  }

  function applyWork(work, { updateHistory = true, replaceHistory = false } = {}) {
    if (!work) return;

    currentWork = work;
    syncSelectionState();

    stage.classList.remove("is-video-ready");
    loadStageThumb(work);
    stageYear.textContent = formatYear(work.created);
    stageYear.hidden = !stageYear.textContent;

    stageVideo.pause();
    stageVideo.currentTime = 0;
    stageVideo.muted = true;
    setAudioButtonState(true);
    setAudioAvailability(work.hasAudio !== false);
    stageVideo.src = encodeURI(work.fullSrc || work.previewSrc || work.src);
    stageVideo.load();
    playStageVideo();

    if (updateHistory) {
      updateUrl(work, replaceHistory);
    }
  }

  stageThumb.addEventListener("load", () => {
    setRatio(stageThumb.naturalWidth, stageThumb.naturalHeight);
  });

  stageThumb.addEventListener("error", () => {
    if (!currentWork) return;
    const fallback = currentWork.thumbFallback || "";
    if (fallback && decodeURI(stageThumb.getAttribute("src") || "") !== currentWork.thumbFallback) {
      stageThumb.setAttribute("src", fallback);
    }
  });

  stageVideo.addEventListener("loadedmetadata", () => {
    setRatio(stageVideo.videoWidth, stageVideo.videoHeight);
  });

  stageVideo.addEventListener("loadeddata", () => {
    stage.classList.add("is-video-ready");
  });

  stageVideo.addEventListener("canplay", () => {
    stage.classList.add("is-video-ready");
  });

  stageVideo.addEventListener("ended", () => {
    playStageVideo();
  });

  audioBtn.addEventListener("click", () => {
    toggleStageSound();
  });

  indexButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selected = works.find((item) => item.slug === button.dataset.work);
      if (!selected) return;
      applyWork(selected);
    });
  });

  window.addEventListener("popstate", () => {
    const requested = slugify(new URLSearchParams(window.location.search).get("work") || "");
    const nextWork =
      works.find((item) => item.slug === requested || item.key === requested) ||
      works[0];
    applyWork(nextWork, { updateHistory: false });
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("a, button, input, textarea, select, label, .gallery-index")) return;
    toggleStageSound();
  });

  const requested = slugify(new URLSearchParams(window.location.search).get("work") || "");
  const initialWork =
    works.find((item) => item.slug === requested || item.key === requested || srcKey(item.src) === requested) ||
    works[0];

  applyWork(initialWork, { replaceHistory: true });
})();
