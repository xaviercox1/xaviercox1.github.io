// script.js
// Custom cursor + physically simulated balls that inherit cursor velocity

const cursor = document.querySelector(".cursor-dot");

if (cursor) {
  // --- Cursor follower state ---
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX;
  let dotY = mouseY;

  // Smoothed cursor velocity (px / second)
  let cursorVX = 0;
  let cursorVY = 0;
  let prevDotX = dotX;
  let prevDotY = dotY;

  const cursorSpeed = 0.2; // 0–1, higher = cursor dot sticks closer to real mouse

  // --- Ball physics parameters ---
  const ballSize = cursor.offsetWidth || 12;
  const ballRadius = ballSize / 2;

  const gravity = 2600;           // px/s^2 downward
  const airDrag = 0.08;           // per second, gentle drag
  const groundFriction = 0.83;    // horizontal slowdown on the ground
  const wallBounceDamping = 0.6;  // how much speed is kept after hitting a wall
  const bounceDamping = 0.6;      // how much vertical speed is kept after a bounce
  const bounceThreshold = 150;    // minimum impact speed to count as a bounce

  const balls = [];

  function spawnBall(x, y, vx0, vy0) {
    const el = document.createElement("div");
    el.className = "cursor-ball";
    el.style.width = ballSize + "px";
    el.style.height = ballSize + "px";
    el.style.left = x + "px";
    el.style.top = y + "px";
    document.body.appendChild(el);

    balls.push({
      el,
      x,
      y,
      vx: vx0 || 0,
      vy: vy0 || 0,
      radius: ballRadius,
      life: 0,
      onGround: false,
    });
  }

  let lastTime = null;

  function animate(timestamp) {
    if (lastTime === null) {
      lastTime = timestamp;
    }

    let dt = (timestamp - lastTime) / 1000; // seconds
    if (dt <= 0) dt = 0.016;
    if (dt > 0.05) dt = 0.05; // clamp big jumps
    lastTime = timestamp;

    // --- Cursor smoothing ---
    dotX += (mouseX - dotX) * cursorSpeed;
    dotY += (mouseY - dotY) * cursorSpeed;

    cursor.style.left = dotX + "px";
    cursor.style.top = dotY + "px";

    // --- Estimate cursor velocity (px/s), then smooth it ---
    const instVX = (dotX - prevDotX) / dt;
    const instVY = (dotY - prevDotY) / dt;
    const velSmooth = 0.2; // how much we trust this frame's velocity

    cursorVX = cursorVX * (1 - velSmooth) + instVX * velSmooth;
    cursorVY = cursorVY * (1 - velSmooth) + instVY * velSmooth;

    prevDotX = dotX;
    prevDotY = dotY;

    // --- Physics for balls ---
    const groundMargin = 24; // visual gap from bottom
    const wallMargin = 10;   // little inset for walls
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    for (let i = balls.length - 1; i >= 0; i--) {
      const b = balls[i];
      b.life += dt;

      // Gravity
      b.vy += gravity * dt;

      // Integrate velocity
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      const groundY = windowH - b.radius - groundMargin;

      // Floor collision
      if (b.y >= groundY && b.vy > 0) {
        b.y = groundY;

        if (Math.abs(b.vy) > bounceThreshold) {
          // Bounce
          b.vy = -b.vy * bounceDamping;
          b.vx *= groundFriction;
          b.onGround = false;
        } else {
          // Settle on the ground
          b.vy = 0;
          b.onGround = true;
          b.vx *= groundFriction;
        }
      } else {
        b.onGround = false;
      }

      // Wall collisions
      const leftWall = b.radius + wallMargin;
      const rightWall = windowW - b.radius - wallMargin;

      if (b.x <= leftWall) {
        b.x = leftWall;
        b.vx = -b.vx * wallBounceDamping;
      } else if (b.x >= rightWall) {
        b.x = rightWall;
        b.vx = -b.vx * wallBounceDamping;
      }

      // Air drag (gentle slow down over time)
      const dragFactor = Math.exp(-airDrag * dt);
      b.vx *= dragFactor;
      b.vy *= dragFactor;

      // Apply DOM position
      b.el.style.left = b.x + "px";
      b.el.style.top = b.y + "px";

      // Remove if almost stopped on ground, or too old
      const speed = Math.hypot(b.vx, b.vy);
      if ((b.onGround && speed < 25 && b.life > 0.4) || b.life > 8) {
        const el = b.el;
        el.classList.add("cursor-ball--pop");
        balls.splice(i, 1);
        setTimeout(() => {
          if (el && el.parentNode) {
            el.parentNode.removeChild(el);
          }
        }, 200);
      }
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // --- Mouse tracking for the cursor ---
  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursor.classList.add("is-visible");
  });

  document.addEventListener("mouseleave", () => {
    cursor.classList.remove("is-visible");
  });

  // --- Link hover effect on cursor ---
  const links = document.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      cursor.classList.add("cursor-dot--link");
    });
    link.addEventListener("mouseleave", () => {
      cursor.classList.remove("cursor-dot--link");
    });
  });

  // --- Spawn a ball when the left mouse button is released ---
  document.addEventListener("mouseup", (event) => {
    if (event.button !== 0) return; // only left click

    // Use cursor velocity as throw force
    const throwFactor = 0.35; // increase for wilder throws
    const vx0 = cursorVX * throwFactor;
    const vy0 = cursorVY * throwFactor;

    const spawnX = dotX;
    const spawnY = dotY;

    cursor.classList.add("cursor-dot--link");
    spawnBall(spawnX, spawnY, vx0, vy0);

    // Quick pulse of the cursor
    setTimeout(() => {
      cursor.classList.remove("cursor-dot--link");
    }, 100);
  });

  // Optional: press-down visual
  document.addEventListener("mousedown", (event) => {
    if (event.button === 0) {
      cursor.classList.add("cursor-dot--link");
    }
  });
} else {
  console.warn("No .cursor-dot element found");
}