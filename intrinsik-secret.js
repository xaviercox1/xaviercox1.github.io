(function () {
  "use strict";

  const THREE = window.THREE;
  const page = document.body;
  const space = document.getElementById("intrinsikSecretSpace");
  const mount = document.getElementById("intrinsikWebgl");
  const videoA = document.getElementById("intrinsikVideoA");
  const videoB = document.getElementById("intrinsikVideoB");

  if (!THREE || !page || !space || !mount || !videoA || !videoB) {
    page?.classList.remove("is-loading");
    page?.classList.add("is-ready");
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const sourceRoot = "Content/Intrinsik Industrique/Videos/";
  const screenSources = [3, 4, 5, 6, 7, 8, 9, 10].map((number) => `${sourceRoot}Industrique${number}.mp4`);
  const exitCursorZone = 104;
  const minFov = 30;
  const maxFov = 46;
  const pointer = { x: 0, y: 0, active: false };
  const deviceLook = { x: 0, y: 0, active: false, baseBeta: null, baseGamma: null };
  const cameraLook = { x: 0, y: 0 };
  const zoom = { target: 0.02, current: 0.02 };
  const clock = new THREE.Clock();
  const sampleCanvas = document.createElement("canvas");
  const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
  const sampledColor = new THREE.Color(0xff1739);
  const targetColor = new THREE.Color(0xff1739);
  const workingColor = new THREE.Color();
  const screenVideos = [videoA, videoB];
  const videoTextures = [];
  let activeVideoIndex = 0;
  let activeSourceIndex = 0;
  let screenSwapLocked = false;
  let orientationRequested = false;
  let pinchDistance = 0;
  let pinchZoomStart = 0;
  let sampleFrame = 0;

  sampleCanvas.width = 24;
  sampleCanvas.height = 8;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: !isCoarsePointer,
      alpha: false,
      powerPreference: "high-performance",
    });
  } catch (_error) {
    page.classList.remove("is-loading");
    page.classList.add("is-ready");
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCoarsePointer ? 1.35 : 1.7));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x050000, 0.018);

  const camera = new THREE.PerspectiveCamera(maxFov, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, -0.45, 14.2);

  const room = new THREE.Group();
  const atmosphere = new THREE.Group();
  const crowdGroup = new THREE.Group();
  scene.add(room, atmosphere, crowdGroup);

  const blackMaterial = new THREE.MeshStandardMaterial({ color: 0x020202, roughness: 0.86, metalness: 0.12 });
  const rigMaterial = new THREE.MeshStandardMaterial({ color: 0x090909, roughness: 0.58, metalness: 0.46 });
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x030000, roughness: 1, metalness: 0 });
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x020101, roughness: 0.72, metalness: 0.12 });

  function addBox(parent, width, height, depth, x, y, z, material, rotationZ) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
    mesh.position.set(x, y, z);
    mesh.rotation.z = rotationZ || 0;
    parent.add(mesh);
    return mesh;
  }

  function addBeam(parent, start, end, thickness, material) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dz = end.z - start.z;
    const length = Math.hypot(dx, dy, dz);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(length, thickness, thickness), material);
    beam.position.set((start.x + end.x) / 2, (start.y + end.y) / 2, (start.z + end.z) / 2);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(dx, dy, dz).normalize());
    parent.add(beam);
    return beam;
  }

  function createDustTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext("2d");
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 15);
    gradient.addColorStop(0, "rgba(255,255,255,0.9)");
    gradient.addColorStop(0.25, "rgba(255,255,255,0.32)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(canvas);
  }

  function buildRoom() {
    addBox(room, 30, 0.18, 34, 0, -4.25, 1.4, floorMaterial);
    addBox(room, 30, 13, 0.25, 0, 1.5, -11.8, wallMaterial);
    addBox(room, 0.2, 13, 34, -14.8, 1.5, 1.4, wallMaterial);
    addBox(room, 0.2, 13, 34, 14.8, 1.5, 1.4, wallMaterial);
    addBox(room, 30, 0.2, 34, 0, 7.7, 1.4, blackMaterial);

    [-8.2, -6.1].forEach((z) => {
      addBox(room, 22, 0.16, 0.16, 0, 5.45, z, rigMaterial);
      addBox(room, 22, 0.16, 0.16, 0, 4.5, z, rigMaterial);
      for (let x = -10.2; x <= 10.2; x += 1.7) {
        addBeam(room, new THREE.Vector3(x, 4.5, z), new THREE.Vector3(x + 1.7, 5.45, z), 0.07, rigMaterial);
        addBeam(room, new THREE.Vector3(x, 5.45, z), new THREE.Vector3(x + 1.7, 4.5, z), 0.07, rigMaterial);
      }
    });

    [-7.6, -3.8, 0, 3.8, 7.6].forEach((x, index) => {
      addBox(room, 0.1, 0.72, 0.1, x, 4.12, -7.05, rigMaterial);
      const fixture = addBox(room, index === 2 ? 1.15 : 0.72, index === 2 ? 0.95 : 0.7, 0.92, x, 3.62, -6.96, blackMaterial);
      fixture.rotation.x = index % 2 ? 0.12 : -0.08;
    });

    addBox(room, 1.45, 1.7, 1.25, -6.4, 3.35, -8.75, blackMaterial);
    addBox(room, 1.45, 1.7, 1.25, 6.4, 3.35, -8.75, blackMaterial);
    addBox(room, 1.25, 1.9, 1.05, 0, 3.15, -9.35, blackMaterial);
  }

  buildRoom();

  const ambientLight = new THREE.HemisphereLight(0x240206, 0x000000, 0.22);
  const stageWash = new THREE.PointLight(0xff1438, 48, 24, 1.9);
  stageWash.position.set(0, -0.3, -8.25);
  const floorWash = new THREE.PointLight(0xff1838, 24, 15, 2);
  floorWash.position.set(0, -3.1, -5.2);
  scene.add(ambientLight, stageWash, floorWash);

  const dustCount = isCoarsePointer ? 460 : 980;
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i += 1) {
    dustPositions[i * 3] = (Math.random() - 0.5) * 22;
    dustPositions[i * 3 + 1] = Math.random() * 10 - 4;
    dustPositions[i * 3 + 2] = Math.random() * 18 - 9;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    map: createDustTexture(),
    color: 0xff6676,
    size: isCoarsePointer ? 0.042 : 0.031,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  atmosphere.add(dust);

  screenVideos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    videoTextures.push(texture);
  });

  const screenWidth = 14.2;
  const screenHeight = 1.72;
  const screenAspect = screenWidth / screenHeight;
  const screenUniforms = {
    videoMap: { value: videoTextures[0] },
    ready: { value: 0 },
    cropScale: { value: new THREE.Vector2(1, 4 / screenAspect) },
    screenAspect: { value: screenAspect },
  };
  const screenMaterial = new THREE.ShaderMaterial({
    uniforms: screenUniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D videoMap;
      uniform float ready;
      uniform vec2 cropScale;
      uniform float screenAspect;
      varying vec2 vUv;

      float roundedBoxSdf(vec2 point, vec2 halfSize, float radius) {
        vec2 q = abs(point) - halfSize + radius;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - radius;
      }

      void main() {
        vec2 point = (vUv - 0.5) * vec2(screenAspect, 1.0);
        float distanceToEdge = roundedBoxSdf(point, vec2(screenAspect * 0.5, 0.5), 0.13);
        float antialiasWidth = max(fwidth(distanceToEdge) * 1.2, 0.0015);
        float mask = 1.0 - smoothstep(-antialiasWidth, antialiasWidth, distanceToEdge);
        if (mask < 0.01) discard;

        vec2 uv = (vUv - 0.5) * cropScale + 0.5;
        vec3 image = texture2D(videoMap, uv).rgb;
        float scan = 0.965 + 0.035 * sin(uv.y * 900.0);
        vec3 standby = vec3(1.0, 0.955, 0.94);
        vec3 color = mix(standby, image * scan * 1.22, ready);
        gl_FragColor = vec4(color, mask);
      }
    `,
    toneMapped: false,
    transparent: true,
    extensions: { derivatives: true },
  });

  const screenGroup = new THREE.Group();
  screenGroup.position.set(0, -0.52, -8.85);
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(screenWidth, screenHeight), screenMaterial);
  screenGroup.add(screenMesh);
  room.add(screenGroup);

  const textureLoader = new THREE.TextureLoader();
  const crowdMaterials = [];

  function loadTexture(path) {
    return new Promise((resolve, reject) => {
      textureLoader.load(path, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        resolve(texture);
      }, undefined, reject);
    });
  }

  function createCrowdMaterial(texture, opacity, tintStrength, baseLight) {
    const uniforms = {
      map: { value: texture },
      lightColor: { value: sampledColor.clone() },
      opacity: { value: opacity },
      tintStrength: { value: tintStrength },
      baseLight: { value: baseLight },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: true,
      alphaTest: 0.025,
      side: THREE.DoubleSide,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform vec3 lightColor;
        uniform float opacity;
        uniform float tintStrength;
        uniform float baseLight;
        varying vec2 vUv;
        void main() {
          vec4 texel = texture2D(map, vUv);
          if (texel.a < 0.025) discard;
          float luminance = dot(texel.rgb, vec3(0.2126, 0.7152, 0.0722));
          float reflectedAmount = pow(max(luminance, 0.0), 0.72) * tintStrength;
          vec3 color = lightColor * (baseLight + reflectedAmount) + texel.rgb * 0.08;
          gl_FragColor = vec4(color, texel.a * opacity);
        }
      `,
    });
    crowdMaterials.push(material);
    return material;
  }

  function addCrowdPlane(texture, width, aspect, x, y, z, opacity, tintStrength, baseLight, rotationY, mirrored) {
    const material = createCrowdMaterial(texture, opacity, tintStrength, baseLight);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width / aspect), material);
    mesh.position.set(x, y, z);
    mesh.rotation.y = rotationY || 0;
    if (mirrored) mesh.scale.x = -1;
    mesh.renderOrder = Math.round(20 - z);
    crowdGroup.add(mesh);
    return mesh;
  }

  function createPerformerMaterial(texture) {
    return new THREE.ShaderMaterial({
      uniforms: { map: { value: texture } },
      transparent: true,
      alphaTest: 0.025,
      depthWrite: true,
      side: THREE.DoubleSide,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        varying vec2 vUv;
        void main() {
          vec4 texel = texture2D(map, vUv);
          if (texel.a < 0.025) discard;
          gl_FragColor = vec4(vec3(0.001), texel.a);
        }
      `,
    });
  }

  async function buildPeople() {
    const progress = (value) => space.style.setProperty("--load-progress", String(value));
    progress(0.16);
    const [performerTexture, farCrowdTexture, closeCrowdTexture] = await Promise.all([
      loadTexture("Intrinsik%20Assets/Lenny.png"),
      loadTexture("Intrinsik%20Assets/Crowd-Other.png"),
      loadTexture("Intrinsik%20Assets/Crowd-Closest.png"),
    ]);
    progress(0.68);

    addCrowdPlane(farCrowdTexture, 17.8, 2732 / 768, -0.25, -3.15, -6.7, 0.72, 0.9, 0.05, 0.018, false);
    addCrowdPlane(farCrowdTexture, 20.4, 2732 / 768, 0.4, -3.75, -4.7, 0.82, 0.78, 0.045, -0.014, true);
    addCrowdPlane(farCrowdTexture, 23, 2732 / 768, -0.55, -4.45, -1.4, 0.94, 0.66, 0.035, 0.01, false);
    addCrowdPlane(closeCrowdTexture, 21, 1366 / 768, 0.15, -7.15, 3.6, 1, 0.54, 0.025, -0.007, true);

    const performer = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.9), createPerformerMaterial(performerTexture));
    performer.position.set(0, -1.72, -8.25);
    performer.renderOrder = 14;
    room.add(performer);
    addBox(room, 5, 0.72, 0.72, 0, -2.75, -8.08, blackMaterial);
    addBox(room, 3.5, 0.42, 0.52, 0, -2.34, -8.01, blackMaterial);
    progress(0.82);
  }

  function encoded(path) {
    return encodeURI(path);
  }

  function updateScreenCrop(video) {
    const videoAspect = video.videoWidth && video.videoHeight ? video.videoWidth / video.videoHeight : 4;
    let cropX = 1;
    let cropY = 1;

    if (videoAspect > screenAspect) {
      cropX = screenAspect / videoAspect;
    } else {
      cropY = videoAspect / screenAspect;
    }

    screenUniforms.cropScale.value.set(cropX, cropY);
  }

  function setVideoSource(video, sourceIndex) {
    video.pause();
    video.src = encoded(screenSources[sourceIndex]);
    video.load();
  }

  function playVideo(video) {
    const attempt = video.play();
    if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
  }

  function waitForVideo(video) {
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return Promise.resolve();
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
        settled = true;
        video.removeEventListener("canplay", finish);
        video.removeEventListener("loadeddata", finish);
        resolve();
      };
      video.addEventListener("canplay", finish);
      video.addEventListener("loadeddata", finish);
      finish();
    });
  }

  async function prepareVideoSequence() {
    setVideoSource(videoA, 0);
    setVideoSource(videoB, 1);
    await waitForVideo(videoA);
    playVideo(videoA);
    screenUniforms.videoMap.value = videoTextures[0];
    updateScreenCrop(videoA);
    screenUniforms.ready.value = 1;
    space.style.setProperty("--load-progress", "0.94");
  }

  async function advanceVideo() {
    if (screenSwapLocked) return;
    screenSwapLocked = true;
    const incomingIndex = activeVideoIndex === 0 ? 1 : 0;
    const incoming = screenVideos[incomingIndex];
    const outgoing = screenVideos[activeVideoIndex];
    const nextSourceIndex = (activeSourceIndex + 1) % screenSources.length;

    try {
      if (!incoming.src || incoming.dataset.sourceIndex !== String(nextSourceIndex)) {
        setVideoSource(incoming, nextSourceIndex);
        incoming.dataset.sourceIndex = String(nextSourceIndex);
      }
      await waitForVideo(incoming);
      incoming.currentTime = 0;
      playVideo(incoming);
      screenUniforms.videoMap.value = videoTextures[incomingIndex];
      activeVideoIndex = incomingIndex;
      activeSourceIndex = nextSourceIndex;
      updateScreenCrop(incoming);
      outgoing.pause();

      const followingSourceIndex = (activeSourceIndex + 1) % screenSources.length;
      setVideoSource(outgoing, followingSourceIndex);
      outgoing.dataset.sourceIndex = String(followingSourceIndex);
    } finally {
      screenSwapLocked = false;
    }
  }

  screenVideos.forEach((video, videoIndex) => {
    video.addEventListener("loadedmetadata", () => {
      if (videoIndex === activeVideoIndex) updateScreenCrop(video);
    });
    video.addEventListener("ended", () => void advanceVideo());
    video.addEventListener("timeupdate", () => {
      if (video !== screenVideos[activeVideoIndex] || screenSwapLocked) return;
      if (Number.isFinite(video.duration) && video.duration > 0.5 && video.currentTime >= video.duration - 0.12) {
        void advanceVideo();
      }
    });
  });

  videoA.dataset.sourceIndex = "0";
  videoB.dataset.sourceIndex = "1";

  function sampleScreenColor() {
    const video = screenVideos[activeVideoIndex];
    if (!sampleContext || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth) return;
    try {
      sampleContext.drawImage(video, 0, 0, sampleCanvas.width, sampleCanvas.height);
      const pixels = sampleContext.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
      let red = 0;
      let green = 0;
      let blue = 0;
      let weightTotal = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        const r = pixels[index] / 255;
        const g = pixels[index + 1] / 255;
        const b = pixels[index + 2] / 255;
        const luminance = r * 0.2126 + g * 0.7152 + b * 0.0722;
        const weight = 0.2 + luminance * 1.8;
        red += r * weight;
        green += g * weight;
        blue += b * weight;
        weightTotal += weight;
      }
      if (weightTotal > 0) {
        targetColor.setRGB(red / weightTotal, green / weightTotal, blue / weightTotal);
        targetColor.lerp(new THREE.Color(0xff1238), 0.36);
      }
    } catch (_error) {
      targetColor.set(0xff1739);
    }
  }

  function updateSceneLight() {
    sampledColor.lerp(targetColor, 0.035);
    stageWash.color.copy(sampledColor);
    floorWash.color.copy(sampledColor);
    dustMaterial.color.copy(sampledColor).lerp(new THREE.Color(0xffffff), 0.28);
    crowdMaterials.forEach((material) => material.uniforms.lightColor.value.copy(sampledColor));
    workingColor.copy(sampledColor).multiplyScalar(0.014);
    scene.fog.color.copy(workingColor);
    scene.background.copy(workingColor).multiplyScalar(0.12);
  }

  function updateCamera() {
    const sourceX = deviceLook.active ? deviceLook.x : pointer.x;
    const sourceY = deviceLook.active ? deviceLook.y : pointer.y;
    const targetX = reducedMotion ? 0 : sourceX * 0.14;
    const targetY = reducedMotion ? 0 : sourceY * 0.085;
    cameraLook.x += (targetX - cameraLook.x) * 0.055;
    cameraLook.y += (targetY - cameraLook.y) * 0.055;
    zoom.current += (zoom.target - zoom.current) * 0.075;
    camera.fov = maxFov + (minFov - maxFov) * zoom.current;
    camera.updateProjectionMatrix();

    const distance = 24;
    const target = new THREE.Vector3(
      Math.sin(cameraLook.x) * distance,
      camera.position.y + Math.sin(cameraLook.y) * distance,
      camera.position.z - Math.cos(cameraLook.x) * distance
    );
    camera.lookAt(target);
  }

  function render() {
    const elapsed = clock.getElapsedTime();
    sampleFrame += 1;
    if (sampleFrame % 14 === 0) sampleScreenColor();
    updateSceneLight();
    updateCamera();
    dust.rotation.y = Math.sin(elapsed * 0.035) * 0.018;
    dust.position.y = Math.sin(elapsed * 0.12) * 0.04;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  function updateExitCursor(clientX, clientY) {
    page.classList.toggle("is-exit-cursor", clientX <= exitCursorZone && clientY <= exitCursorZone);
  }

  function handlePointerMove(event) {
    pointer.active = true;
    pointer.x = Math.max(-1, Math.min(1, event.clientX / Math.max(window.innerWidth, 1) * 2 - 1));
    pointer.y = Math.max(-1, Math.min(1, 1 - event.clientY / Math.max(window.innerHeight, 1) * 2));
    updateExitCursor(event.clientX, event.clientY);
  }

  function handleWheel(event) {
    event.preventDefault();
    zoom.target = Math.max(0, Math.min(1, zoom.target - event.deltaY * 0.00115));
  }

  function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  function handleTouchStart(event) {
    void requestOrientationPermission();
    if (event.touches.length === 2) {
      pinchDistance = getTouchDistance(event.touches);
      pinchZoomStart = zoom.target;
    }
  }

  function handleTouchMove(event) {
    if (event.touches.length !== 2 || !pinchDistance) return;
    event.preventDefault();
    const distance = getTouchDistance(event.touches);
    zoom.target = Math.max(0, Math.min(1, pinchZoomStart + (distance - pinchDistance) / 260));
  }

  function handleTouchEnd(event) {
    if (event.touches.length < 2) pinchDistance = 0;
  }

  function handleOrientation(event) {
    if (typeof event.beta !== "number" || typeof event.gamma !== "number") return;
    if (deviceLook.baseBeta === null || deviceLook.baseGamma === null) {
      deviceLook.baseBeta = event.beta;
      deviceLook.baseGamma = event.gamma;
    }
    const gammaDelta = Math.max(-24, Math.min(24, event.gamma - deviceLook.baseGamma));
    const betaDelta = Math.max(-18, Math.min(18, event.beta - deviceLook.baseBeta));
    deviceLook.x = gammaDelta / 24;
    deviceLook.y = -betaDelta / 18;
    deviceLook.active = true;
  }

  async function requestOrientationPermission() {
    if (orientationRequested || typeof window.DeviceOrientationEvent === "undefined") return;
    orientationRequested = true;
    try {
      if (typeof window.DeviceOrientationEvent.requestPermission === "function") {
        const permission = await window.DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") return;
      }
      window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    } catch (_error) {
      deviceLook.active = false;
    }
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCoarsePointer ? 1.35 : 1.7));
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  Promise.all([buildPeople(), prepareVideoSequence()])
    .then(() => {
      space.style.setProperty("--load-progress", "1");
      window.setTimeout(() => {
        page.classList.remove("is-loading");
        page.classList.add("is-ready");
      }, 120);
    })
    .catch(() => {
      page.classList.remove("is-loading");
      page.classList.add("is-ready");
    });

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("pointerleave", () => {
    pointer.active = false;
    pointer.x = 0;
    pointer.y = 0;
    page.classList.remove("is-exit-cursor");
  }, { passive: true });
  space.addEventListener("wheel", handleWheel, { passive: false });
  space.addEventListener("touchstart", handleTouchStart, { passive: true });
  space.addEventListener("touchmove", handleTouchMove, { passive: false });
  space.addEventListener("touchend", handleTouchEnd, { passive: true });
  window.addEventListener("resize", handleResize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    const activeVideo = screenVideos[activeVideoIndex];
    if (document.hidden) activeVideo.pause();
    else playVideo(activeVideo);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") window.location.href = "index.html";
  });

  if (typeof window.DeviceOrientationEvent !== "undefined" && typeof window.DeviceOrientationEvent.requestPermission !== "function") {
    window.addEventListener("deviceorientation", handleOrientation, { passive: true });
  }

  render();
}());
