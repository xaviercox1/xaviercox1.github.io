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
  const SPEED =  60; // try values between 1 and ~10

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
    [5, 5, 5],        // 0
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