(async function () {
  const index = document.getElementById("galleryIndex");
  const stage = document.getElementById("galleryStage");
  const stageThumb = document.getElementById("galleryStageThumb");
  const stageVideo = document.getElementById("galleryStageVideo");
  const stageNav = document.getElementById("galleryStageNav");
  const stagePrev = document.getElementById("galleryStagePrev");
  const stageNext = document.getElementById("galleryStageNext");
  const audioBtn = document.getElementById("galleryAudio");
  const indexYear = document.getElementById("galleryIndexYear");
  const mobileGalleryQuery = window.matchMedia("(max-width: 760px)");

  if (!index || !stage || !stageThumb || !stageVideo || !audioBtn) return;

  const groupedWorks = [
    {
      slug: "intrinsik-motion-graphics",
      alt: "Intrinsik Motion Graphics",
      created: "2026-01-01T00:00:00+11:00",
      layout: "portrait-stack",
      items: [
        {
          src: "Content/Intrinsik/Sensor Systems.mp4",
          thumb: "Content/Intrinsik/Thumbnails/Sensor Systems.png",
          alt: "Sensor Systems",
          hasAudio: null,
        },
        {
          src: "Content/Intrinsik/Toobris.mp4",
          thumb: "Content/Intrinsik/Thumbnails/Toobris.png",
          alt: "Toobris",
          hasAudio: null,
        },
        {
          src: "Content/Intrinsik/lilac extended.mp4",
          thumb: "Content/Intrinsik/Thumbnails/Lilac.png",
          alt: "Lilac Extended",
          hasAudio: null,
        },
      ],
    },
    {
      slug: "intrinsik-live-performance",
      alt: "Intrinsik Live Performance",
      created: "2026-01-01T00:00:00+11:00",
      layout: "landscape-stack",
      items: [
        {
          src: "./landscape-promo.mp4",
          thumb: "Content/Thumbnails/promo.png",
          alt: "Live Promo 1",
          hasAudio: null,
        },
        {
          src: "./landscape-promo2.mp4",
          thumb: "Content/Thumbnails/promo2.png",
          alt: "Live Promo 2",
          hasAudio: null,
        },
      ],
    },
  ];

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

  const preferredOrder = new Map([
    ["intrinsik-live-performance", 0],
    ["intrinsik-motion-graphics", 1],
    ["joe-king", 2],
    ["magma", 3],
    ["tubular-bells", 4],
    ["klf", 5],
  ]);

  function sortByMixedOrder(a, b) {
    const ap = preferredOrder.get(a.slug);
    const bp = preferredOrder.get(b.slug);

    if (Number.isFinite(ap) || Number.isFinite(bp)) {
      const ar = Number.isFinite(ap) ? ap : Number.MAX_SAFE_INTEGER;
      const br = Number.isFinite(bp) ? bp : Number.MAX_SAFE_INTEGER;
      if (ar !== br) return ar - br;
    }

    const ah = hashString(`${a.alt}|${a.src}`);
    const bh = hashString(`${b.alt}|${b.src}`);
    if (ah !== bh) return ah - bh;
    return sortBySourceOrder(a, b);
  }

  function setRatio(width, height) {
    if (!width || !height) return;
    stage.style.setProperty("--stage-ratio", `${width} / ${height}`);
    const ratio = width / height;
    let shape = "landscape";

    if (ratio < 0.92) {
      shape = "portrait";
    } else if (ratio <= 1.08) {
      shape = "square";
    }

    stage.dataset.mediaShape = shape;
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

  function normalizeEntry(item, sourceOrder) {
    const fullSource = normalizeSrc(item.fullSrc || item.src);
    const previewSource = normalizeSrc(item.previewSrc || fullSource);
    const title = item.alt || cleanTitle(item.src);
    return {
      key: srcKey(item.src || title),
      slug: slugify(title || item.src),
      src: fullSource,
      fullSrc: fullSource,
      previewSrc: previewSource,
      thumb: item.thumb || defaultThumb(item.src),
      thumbFallback: item.thumb || defaultThumbFallback(item.src),
      alt: title,
      created: item.created || "",
      hasAudio: typeof item.hasAudio === "boolean" ? item.hasAudio : null,
      sourceOrder,
      type: "single",
    };
  }

  function normalizeGroup(group, sourceOrder) {
    const items = group.items.map((item, idx) =>
      normalizeEntry(
        {
          ...item,
          created: item.created || group.created || "",
        },
        sourceOrder + idx / 100
      )
    );

    return {
      key: `group:${group.slug}`,
      slug: group.slug,
      src: `group:${group.slug}`,
      alt: group.alt,
      created: group.created || "",
      sourceOrder,
      type: "group",
      layout: group.layout || "portrait-stack",
      activeIndex: 0,
      items,
    };
  }

  function getDisplayedEntry(work) {
    if (!work) return null;
    if (work.type !== "group") return work;
    if (!work.items.length) return null;
    const total = work.items.length;
    const safeIndex = ((work.activeIndex || 0) % total + total) % total;
    return work.items[safeIndex];
  }

  function toggleStageSound() {
    const displayedEntry = getDisplayedEntry(currentWork);
    if (!displayedEntry || displayedEntry.hasAudio === false) return;
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
    const normalized = normalizeEntry(item, idx);
    workMap.set(srcKey(item.src), normalized);
  });

  knownWorks.forEach((item, idx) => {
    const temp = { src: item.src, alt: item.alt || cleanTitle(item.src) };
    if (isExcludedWork(temp)) return;
    const key = srcKey(item.src);
    if (workMap.has(key)) return;
    workMap.set(key, normalizeEntry(item, 1000 + idx));
  });

  const works = [
    ...Array.from(workMap.values()),
    ...groupedWorks.map((group, idx) => normalizeGroup(group, 2000 + idx)),
  ].sort(sortByMixedOrder);

  if (!works.length) return;

  index.innerHTML = works
    .map((item) => {
      if (item.type === "group") {
        const cluster = item.items
          .map((entry) => {
            const thumb = encodeURI(entry.thumb);
            const thumbFallback = encodeURI(entry.thumbFallback);
            return `
              <span class="gallery-index-group-cell" aria-hidden="true">
                <img class="gallery-index-group-thumb" src="${thumb}" data-fallback="${thumbFallback}" alt="" loading="lazy" decoding="async" />
              </span>
            `;
          })
          .join("");

        return `
          <button
            type="button"
            class="gallery-index-item gallery-index-item--group gallery-index-item--${item.layout}"
            data-work="${item.slug}"
            aria-label="${item.alt}"
          >
            ${cluster}
          </button>
        `;
      }

      const thumb = encodeURI(item.thumb);
      const thumbFallback = encodeURI(item.thumbFallback);
      return `
        <button type="button" class="gallery-index-item" data-work="${item.slug}" aria-label="${item.alt}">
          <img class="gallery-index-thumb" src="${thumb}" data-fallback="${thumbFallback}" alt="" loading="lazy" decoding="async" />
        </button>
      `;
    })
    .join("");

  index
    .querySelectorAll(".gallery-index-thumb, .gallery-index-group-thumb")
    .forEach((img) => {
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

  function updateIndexYear() {
    if (!indexYear) return;

    const year = formatYear(currentWork?.created);
    const activeButton = index.querySelector(".gallery-index-item.is-active");

    if (!year || !activeButton) {
      indexYear.hidden = true;
      indexYear.textContent = "";
      return;
    }

    const buttonRect = activeButton.getBoundingClientRect();
    indexYear.textContent = year;
    indexYear.hidden = false;

    if (mobileGalleryQuery.matches) {
      indexYear.style.left = `${buttonRect.left + buttonRect.width / 2}px`;
      indexYear.style.top = `${buttonRect.top - 6}px`;
      indexYear.style.transform = "translate(-50%, -100%)";
    } else {
      indexYear.style.left = `${buttonRect.left - 8}px`;
      indexYear.style.top = `${buttonRect.top + buttonRect.height / 2}px`;
      indexYear.style.transform = "translate(-100%, -50%)";
    }
  }

  function syncSelectionState() {
    indexButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.work === currentWork?.slug);
    });
    updateIndexYear();
  }

  function syncStageNav() {
    if (!stageNav || !stagePrev || !stageNext) return;
    const isGroup = currentWork?.type === "group" && currentWork.items.length > 1;
    stageNav.hidden = !isGroup;
    stagePrev.disabled = !isGroup;
    stageNext.disabled = !isGroup;
  }

  function loadStageThumb(entry) {
    stageThumb.alt = entry.alt;
    stageThumb.src = encodeURI(entry.thumb);
  }

  function playStageVideo() {
    const promise = stageVideo.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {});
    }
  }

  function renderCurrentWork({ preserveMute = false } = {}) {
    const entry = getDisplayedEntry(currentWork);
    if (!currentWork || !entry) return;

    const previousMutedState = stageVideo.muted;
    stage.classList.remove("is-video-ready");
    loadStageThumb(entry);

    stageVideo.pause();
    stageVideo.currentTime = 0;
    stageVideo.muted =
      preserveMute && entry.hasAudio !== false ? previousMutedState : true;
    setAudioButtonState(stageVideo.muted);
    setAudioAvailability(entry.hasAudio !== false);
    stageVideo.src = encodeURI(entry.fullSrc || entry.previewSrc || entry.src);
    stageVideo.load();
    playStageVideo();
    syncStageNav();
  }

  function applyWork(work, { updateHistory = true, replaceHistory = false } = {}) {
    if (!work) return;

    currentWork = work;
    if (currentWork.type === "group" && !Number.isInteger(currentWork.activeIndex)) {
      currentWork.activeIndex = 0;
    }

    syncSelectionState();
    renderCurrentWork();

    if (updateHistory) {
      updateUrl(work, replaceHistory);
    }
  }

  function stepGroup(direction) {
    if (!currentWork || currentWork.type !== "group" || currentWork.items.length < 2) return;
    const count = currentWork.items.length;
    currentWork.activeIndex = (currentWork.activeIndex + direction + count) % count;
    renderCurrentWork({ preserveMute: true });
  }

  stageThumb.addEventListener("load", () => {
    setRatio(stageThumb.naturalWidth, stageThumb.naturalHeight);
  });

  stageThumb.addEventListener("error", () => {
    const entry = getDisplayedEntry(currentWork);
    if (!entry) return;
    const fallback = entry.thumbFallback || "";
    if (fallback && decodeURI(stageThumb.getAttribute("src") || "") !== entry.thumbFallback) {
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

  stagePrev?.addEventListener("click", () => {
    stepGroup(-1);
  });

  stageNext?.addEventListener("click", () => {
    stepGroup(1);
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

  index.addEventListener(
    "scroll",
    () => {
      updateIndexYear();
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    updateIndexYear();
  });

  if (typeof mobileGalleryQuery.addEventListener === "function") {
    mobileGalleryQuery.addEventListener("change", updateIndexYear);
  } else if (typeof mobileGalleryQuery.addListener === "function") {
    mobileGalleryQuery.addListener(updateIndexYear);
  }

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
