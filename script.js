// script.js
// Custom cursor + center sandpile avalanche simulation
// - Cursor has a blur "lens" under it
// - Sandpile sim in center
// - SPEED variable controls how fast it evolves
// - Clicking the simulation resets it

// === Custom cursor + blur lens ===
const cursorDot = document.querySelector(".cursor-dot");
const cursorBlur = document.querySelector(".cursor-blur");
const cursorModeQuery = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");

if (cursorDot) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX;
  let dotY = mouseY;
  const followSpeed = 0.2;
  let overEmbeddedFrame = false;
  let customCursorEnabled = cursorModeQuery.matches;

  function setCustomCursorEnabled(enabled) {
    customCursorEnabled = enabled;
    document.documentElement.classList.toggle("has-custom-cursor", enabled);

    if (!enabled) {
      overEmbeddedFrame = false;
      cursorDot.classList.remove("is-visible");
      cursorDot.classList.remove("cursor-dot--link");
      if (cursorBlur) {
        cursorBlur.style.opacity = "0";
      }
      return;
    }

    if (cursorBlur) {
      cursorBlur.style.opacity = "";
    }
  }

  function handleCursorModeChange(event) {
    setCustomCursorEnabled(event.matches);
  }

  if (typeof cursorModeQuery.addEventListener === "function") {
    cursorModeQuery.addEventListener("change", handleCursorModeChange);
  } else if (typeof cursorModeQuery.addListener === "function") {
    cursorModeQuery.addListener(handleCursorModeChange);
  }

  setCustomCursorEnabled(customCursorEnabled);

  window.addEventListener("mousemove", (event) => {
    if (!customCursorEnabled) return;
    mouseX = event.clientX;
    mouseY = event.clientY;
    if (!overEmbeddedFrame) {
      cursorDot.classList.add("is-visible");
    }
  });

  document.addEventListener("mouseleave", () => {
    if (!customCursorEnabled) return;
    cursorDot.classList.remove("is-visible");
  });

  document.addEventListener("mousedown", (event) => {
    if (!customCursorEnabled) return;
    if (event.button === 0) {
      cursorDot.classList.add("cursor-dot--link");
    }
  });

  document.addEventListener("mouseup", () => {
    if (!customCursorEnabled) return;
    cursorDot.classList.remove("cursor-dot--link");
  });

  const embeddedFrames = document.querySelectorAll(".video-hero iframe");
  embeddedFrames.forEach((frame) => {
    frame.addEventListener("mouseenter", () => {
      if (!customCursorEnabled) return;
      overEmbeddedFrame = true;
      cursorDot.classList.remove("is-visible");
      cursorDot.classList.remove("cursor-dot--link");
      if (cursorBlur) {
        cursorBlur.style.opacity = "0";
      }
    });

    frame.addEventListener("mouseleave", () => {
      if (!customCursorEnabled) return;
      overEmbeddedFrame = false;
      if (cursorBlur) {
        cursorBlur.style.opacity = "";
      }
    });
  });

  function animateCursor() {
    if (!customCursorEnabled) {
      requestAnimationFrame(animateCursor);
      return;
    }

    dotX += (mouseX - dotX) * followSpeed;
    dotY += (mouseY - dotY) * followSpeed;

    cursorDot.style.left = dotX + "px";
    cursorDot.style.top = dotY + "px";

    if (cursorBlur) {
      cursorBlur.style.left = dotX + "px";
      cursorBlur.style.top = dotY + "px";
    }

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}

// === Sandpile simulation ===
(function () {
  const canvas = document.getElementById("sandpile");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;

  // >>> Adjust this to control speed <<<
  // Higher SPEED -> more grains and topples per frame -> faster, more intense sim
  const SPEED = 40; // try values between 1 and ~40

  // Logical grid size (rendered pixelated & scaled via CSS)
  const N = 300;
  const threshold = 4; // K = 4: classic Abelian sandpile
  const GRAINS_PER_FRAME = SPEED;
  const TOPPLES_PER_FRAME = 4000 * SPEED;
  canvas.width = N;
  canvas.height = N;

  const size = N * N;
  const grid = new Int32Array(size);
  const active = [];
  const queued = new Uint8Array(size);
  const centerX = (N / 2) | 0;
  const centerY = (N / 2) | 0;
  const centerIndex = centerY * N + centerX;

  // Keep the existing palette, though the classic stable sandpile only uses heights 0-3.
  const palette = [
    [0, 0, 0],        // 0
    [60, 80, 200],    // 1
    [80, 160, 240],   // 2
    [180, 220, 255],  // 3
    [240, 240, 240],  // 4
    [255, 210, 150],  // 5
    [255, 140, 80],   // 6
    [220, 60, 60],    // 7
  ];

  const imageData = ctx.createImageData(N, N);
  const data = imageData.data;
  let needsDraw = true;

  function idx(x, y) {
    return y * N + x;
  }

  function queueIfUnstable(i) {
    if (grid[i] >= threshold && !queued[i]) {
      queued[i] = 1;
      active.push(i);
    }
  }

  function addGrainAtCenter() {
    grid[centerIndex] += 1;
    queueIfUnstable(centerIndex);
    needsDraw = true;
  }

  function toppleNext() {
    if (!active.length) return 0;

    const i = active.pop();
    queued[i] = 0;

    const h = grid[i];
    if (h < threshold) return 0;

    const t = (h / threshold) | 0;
    const x = i % N;
    const y = (i / N) | 0;

    grid[i] -= t * threshold;
    queueIfUnstable(i);

    if (x > 0) {
      const left = i - 1;
      grid[left] += t;
      queueIfUnstable(left);
    }

    if (x < N - 1) {
      const right = i + 1;
      grid[right] += t;
      queueIfUnstable(right);
    }

    if (y > 0) {
      const up = i - N;
      grid[up] += t;
      queueIfUnstable(up);
    }

    if (y < N - 1) {
      const down = i + N;
      grid[down] += t;
      queueIfUnstable(down);
    }

    needsDraw = true;
    return t;
  }

  function draw() {
    let p = 0;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        // Classical Abelian piles stabilize into heights 0-3.
        const h = Math.min(grid[idx(x, y)], threshold - 1);
        const c = palette[h];
        data[p++] = c[0]; // R
        data[p++] = c[1]; // G
        data[p++] = c[2]; // B
        data[p++] = 255;  // A
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // Reset simulation (used on click)
  function resetSandpile() {
    grid.fill(0);
    queued.fill(0);
    active.length = 0;
    needsDraw = true;
  }

  // Clicking ON the simulation resets it
  canvas.addEventListener("click", (event) => {
    event.stopPropagation();
    resetSandpile();
  });

  function step() {
    let grainsRemaining = GRAINS_PER_FRAME;
    let topples = 0;

    while (topples < TOPPLES_PER_FRAME) {
      if (active.length > 0) {
        topples += toppleNext();
        continue;
      }

      if (grainsRemaining <= 0) {
        break;
      }

      addGrainAtCenter();
      grainsRemaining -= 1;
    }

    if (needsDraw) {
      draw();
      needsDraw = false;
    }

    requestAnimationFrame(step);
  }

  step();
})();


// === Page reveal animation (blur + opacity + optional directional slide) ===
(function () {
  const items = Array.from(document.querySelectorAll(".reveal, .reveal-right"));
  if (!items.length) return;

  const autoStagger = 120; // ms per item if no data-delay is provided

  requestAnimationFrame(() => {
    items.forEach((el, i) => {
      const delayAttr = el.getAttribute("data-delay");
      const delay = delayAttr !== null ? Number(delayAttr) : i * autoStagger;

      setTimeout(() => {
        el.classList.add("is-visible");
      }, delay);
    });
  });
})();

// === Local file fallback for YouTube embeds ===
(function () {
  if (window.location.protocol !== "file:") return;

  const youtubeFrames = Array.from(document.querySelectorAll(".video-hero iframe")).filter((frame) =>
    /youtube(?:-nocookie)?\.com\/embed\//.test(frame.src)
  );

  youtubeFrames.forEach((frame) => {
    let videoId = "";

    try {
      const url = new URL(frame.src);
      const match = url.pathname.match(/\/embed\/([^/?]+)/);
      videoId = match ? match[1] : "";
    } catch (_error) {
      videoId = "";
    }

    const fallback = document.createElement("div");
    fallback.className = "video-embed-fallback";

    const eyebrow = document.createElement("p");
    eyebrow.className = "video-embed-fallback__eyebrow";
    eyebrow.textContent = "Local preview";

    const title = document.createElement("h2");
    title.className = "video-embed-fallback__title";
    title.textContent = frame.title || "Video";

    const text = document.createElement("p");
    text.className = "video-embed-fallback__text";
    text.textContent = "YouTube blocks embedded playback when this page is opened directly as a local file.";

    const actions = document.createElement("div");
    actions.className = "video-embed-fallback__actions";

    const openLink = document.createElement("a");
    openLink.href = videoId ? `https://youtu.be/${videoId}` : "https://www.youtube.com/";
    openLink.target = "_blank";
    openLink.rel = "noreferrer";
    openLink.textContent = "Open on YouTube";

    const serverHint = document.createElement("p");
    serverHint.className = "video-embed-fallback__hint";
    serverHint.textContent = "To preview the embed here, serve the folder over localhost instead of opening the HTML file directly.";

    actions.appendChild(openLink);
    fallback.appendChild(eyebrow);
    fallback.appendChild(title);
    fallback.appendChild(text);
    fallback.appendChild(actions);
    fallback.appendChild(serverHint);

    frame.replaceWith(fallback);
  });
})();

// === Live VJ: 3D carousel + grid toggle (placeholders) ===
// === Live VJ: Sphere carousel + FLIP grid toggle ===
// === Live VJ: Click-to-expand grid with FLIP animation ===
(function () {
  const grid = document.getElementById("vjGrid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".vj-card"));
  let expanded = null;

  function flip(applyLayoutChange) {
    const first = new Map();
    cards.forEach((c) => first.set(c, c.getBoundingClientRect()));

    applyLayoutChange();

    const last = new Map();
    cards.forEach((c) => last.set(c, c.getBoundingClientRect()));

    cards.forEach((c) => {
      const f = first.get(c);
      const l = last.get(c);
      if (!f || !l) return;

      const dx = f.left - l.left;
      const dy = f.top - l.top;
      const sx = f.width / l.width;
      const sy = f.height / l.height;

      c.classList.add("is-flipping");
      c.style.transformOrigin = "top left";
      c.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    });

    requestAnimationFrame(() => {
      cards.forEach((c) => {
        c.style.transform = "";
        c.style.transformOrigin = "";
      });

      setTimeout(() => {
        cards.forEach((c) => c.classList.remove("is-flipping"));
      }, 650);
    });
  }

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      flip(() => {
        // toggle expanded state
        if (expanded === card) {
          card.classList.remove("is-expanded");
          expanded = null;
        } else {
          if (expanded) expanded.classList.remove("is-expanded");
          card.classList.add("is-expanded");
          expanded = card;
        }
      });
    });
  });

  // optional: ESC to close expanded
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && expanded) {
      flip(() => {
        expanded.classList.remove("is-expanded");
        expanded = null;
      });
    }
  });
})();

// === Live VJ video forward / back navigation ===
(function () {
  const video = document.getElementById("vjVideo");
  if (!video) return;

  const sources = [
    "landscape-promo.mp4",
    "landscape-promo2.mp4",
  ];

  let index = 0;

  function swapVideo(newIndex) {
    index = (newIndex + sources.length) % sources.length;

    // soft fade out
    video.style.transition = "opacity 300ms ease, filter 300ms ease";
    video.style.opacity = "0";
    video.style.filter = "blur(6px)";

    setTimeout(() => {
      video.src = sources[index];
      video.load();
      video.play();

      // fade back in
      video.style.opacity = "1";
      video.style.filter = "blur(0px)";
    }, 300);
  }

  document.getElementById("nextVideo")?.addEventListener("click", () => {
    swapVideo(index + 1);
  });

  document.getElementById("prevVideo")?.addEventListener("click", () => {
    swapVideo(index - 1);
  });
})();

// === Live VJ: sound bar (muted by default) + cursor solid on clickable UI ===
// === Live VJ: simple sound toggle (muted by default) + cursor feedback ===
(function () {
  const video = document.getElementById("vjVideo");
  if (!video) return;

  const soundToggle = document.getElementById("soundToggle");
  // ensure muted on load
  video.muted = true;

  function updateLabel() {
    soundToggle.textContent = video.muted ? "sound" : "mute";
    soundToggle.setAttribute(
      "aria-label",
      video.muted ? "Enable sound" : "Mute sound"
    );
  }

  soundToggle.addEventListener("click", () => {
    video.muted = !video.muted;
    updateLabel();
  });

  updateLabel();

})();
