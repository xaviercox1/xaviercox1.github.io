// script.js
// Custom cursor + center sandpile avalanche simulation
// - Cursor has a blur "lens" under it
// - Sandpile sim in center
// - SPEED variable controls how fast it evolves
// - Clicking the simulation resets it

// === Custom cursor + blur lens ===
const cursorDot = document.querySelector(".cursor-dot");
const cursorBlur = document.querySelector(".cursor-blur");

if (cursorDot) {
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX;
  let dotY = mouseY;
  const followSpeed = 0.2;

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursorDot.classList.add("is-visible");
  });

  document.addEventListener("mouseleave", () => {
    cursorDot.classList.remove("is-visible");
  });

  // Hover effect on links
  const links = document.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      cursorDot.classList.add("cursor-dot--link");
    });
    link.addEventListener("mouseleave", () => {
      cursorDot.classList.remove("cursor-dot--link");
    });
  });

  document.addEventListener("mousedown", (event) => {
    if (event.button === 0) {
      cursorDot.classList.add("cursor-dot--link");
    }
  });

  document.addEventListener("mouseup", () => {
    cursorDot.classList.remove("cursor-dot--link");
  });

  function animateCursor() {
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

  // >>> Adjust this to control speed <<<
  // Higher SPEED -> more grains and topples per frame -> faster, more intense sim
  const SPEED =  40; // try values between 1 and ~10

  // Logical grid size (rendered pixelated & scaled via CSS)
  const N = 220;
  const threshold = 4; // K = 4: classic Abelian sandpile
  canvas.width = N;
  canvas.height = N;

  const size = N * N;
  const grid = new Uint16Array(size);
  const active = [];

  // Colour palette by local height (mod 8)
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

  function idx(x, y) {
    return y * N + x;
  }

  function addGrainAtCenter() {
    const cx = (N / 2) | 0;
    const cy = (N / 2) | 0;
    const i = idx(cx, cy);
    grid[i] += 1;
    if (grid[i] >= threshold) {
      active.push(i);
    }
  }

  // Topple up to maxTopples "units" this frame
  function topple(maxTopples) {
    let count = 0;

    while (active.length > 0 && count < maxTopples) {
      const i = active.pop();
      let h = grid[i];
      if (h < threshold) continue;

      const x = i % N;
      const y = (i / N) | 0;

      // How many full topples we can do at once
      const t = (h / threshold) | 0;
      const grainsToDistribute = t * threshold;
      grid[i] -= grainsToDistribute;

      const dx = [1, -1, 0, 0];
      const dy = [0, 0, 1, -1];

      for (let n = 0; n < 4; n++) {
        const nx = x + dx[n];
        const ny = y + dy[n];
        if (nx >= 0 && nx < N && ny >= 0 && ny < N) {
          const ni = idx(nx, ny);
          grid[ni] += t;
          if (grid[ni] >= threshold) {
            active.push(ni);
          }
        }
      }

      count += t;
    }
  }

  function draw() {
    let p = 0;
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const h = grid[idx(x, y)];
        const c = palette[h % palette.length];
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
    active.length = 0;
  }

  // Clicking ON the simulation resets it
  canvas.addEventListener("click", (event) => {
    event.stopPropagation();
    resetSandpile();
  });

  function step() {
    // Drop some grains per frame at the center (scaled by SPEED)
    const GRAINS_PER_FRAME = 1;
    const TOPPLES_PER_FRAME = 4000;

    for (let i = 0; i < GRAINS_PER_FRAME * SPEED; i++) {
      addGrainAtCenter();
    }

    topple(TOPPLES_PER_FRAME * SPEED);
    draw();

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
  const cursorDot = document.querySelector(".cursor-dot");

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

  // cursor goes solid over arrows + sound toggle
  if (cursorDot) {
    document
      .querySelectorAll(".video-arrow, .sound-toggle")
      .forEach((el) => {
        el.addEventListener("mouseenter", () =>
          cursorDot.classList.add("cursor-dot--link")
        );
        el.addEventListener("mouseleave", () =>
          cursorDot.classList.remove("cursor-dot--link")
        );
      });
  }
})();