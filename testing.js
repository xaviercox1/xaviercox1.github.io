function sortTestingDateSections() {
  const header = document.querySelector(".testing-header");
  if (!header) return;

  const sections = Array.from(header.querySelectorAll(".testing-title-line"))
    .map((title) => {
      const toggle = title.querySelector(".testing-page-toggle[aria-controls^='date-']");
      const panel = toggle ? document.getElementById(toggle.getAttribute("aria-controls")) : null;
      const label = toggle ? toggle.textContent.replace(/[^\d/]/g, "").trim() : "";
      const [day = 0, month = 0] = label.split("/").map((part) => Number(part));
      if (!toggle || !panel || !Number.isFinite(day) || !Number.isFinite(month)) return null;
      return {
        title,
        panel,
        sortValue: month * 100 + day,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.sortValue - a.sortValue);

  sections.forEach(({ title, panel }) => {
    header.appendChild(title);
    header.appendChild(panel);
  });
}

sortTestingDateSections();

const testToggles = Array.from(document.querySelectorAll(".testing-page-toggle"));
const experimentToggles = Array.from(document.querySelectorAll(".experiment-toggle"));
const outputControls = {
  playPause: document.querySelector("#output-play-pause"),
  record: document.querySelector("#output-record"),
  stopRecord: document.querySelector("#output-stop-record"),
  width: document.querySelector("#output-canvas-width"),
  height: document.querySelector("#output-canvas-height"),
  applySize: document.querySelector("#output-apply-size"),
  status: document.querySelector("#output-status"),
};
const dateOnePanel = document.querySelector("#date-1-panel");
const dateTwoPanel = document.querySelector("#date-2-panel");
const dateThreePanel = document.querySelector("#date-3-panel");
const dateFourPanel = document.querySelector("#date-4-panel");
const textPanel = document.querySelector("#text-gradient-panel");
const patternPanel = document.querySelector("#pattern-image-panel");
const typePanel = document.querySelector("#type-physics-panel");
const type2Panel = document.querySelector("#type-gradient-physics-panel");
const gridTextPanel = document.querySelector("#grid-text-panel");
const gridText2Panel = document.querySelector("#grid-edit-2-panel");
const gridText3Panel = document.querySelector("#grid-edit-3-panel");
const gridText4Panel = document.querySelector("#grid-edit-4-panel");
const gridText5Panel = document.querySelector("#grid-edit-5-panel");
const gridText6Panel = document.querySelector("#grid-edit-6-panel");
const typeIdentityPanel = document.querySelector("#type-identity-panel");
const orbitTypePanel = document.querySelector("#orbit-type-panel");

const textCanvas = document.querySelector("#text-gradient-canvas");
const textCtx = textCanvas.getContext("2d", { alpha: false, willReadFrequently: true });
const textureCanvas = document.createElement("canvas");
const textureCtx = textureCanvas.getContext("2d", { willReadFrequently: true });
let textureData = null;
let textResizeFrame = 0;

const patternCanvas = document.querySelector("#pattern-canvas");
const patternCtx = patternCanvas.getContext("2d", { willReadFrequently: true });
const sourceCanvas = document.createElement("canvas");
const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
let sourceImage = null;

const typeCanvas = document.querySelector("#type-physics-canvas");
const type2Canvas = document.querySelector("#type-gradient-physics-canvas");
const gridTextCanvas = document.querySelector("#grid-text-canvas");
const gridText2Canvas = document.querySelector("#grid-edit-2-canvas");
const gridText3Canvas = document.querySelector("#grid-edit-3-canvas");
const gridText4Canvas = document.querySelector("#grid-edit-4-canvas");
const gridText5Canvas = document.querySelector("#grid-edit-5-canvas");
const gridText5WaveCanvas = document.querySelector("#grid5-wave-graph");
const gridText6Canvas = document.querySelector("#grid-edit-6-canvas");
const gridText6WaveCanvas = document.querySelector("#grid6-wave-graph");
const typeIdentityCanvas = document.querySelector("#type-identity-canvas");
const orbitTypeCanvas = document.querySelector("#orbit-type-canvas");
const gridTextCtx = gridTextCanvas.getContext("2d");
const gridText2Ctx = gridText2Canvas.getContext("2d");
const gridText3Ctx = gridText3Canvas.getContext("2d");
const gridText4Ctx = gridText4Canvas.getContext("2d");
const gridText5Ctx = gridText5Canvas.getContext("2d");
const gridText5WaveCtx = gridText5WaveCanvas.getContext("2d");
const gridText6Ctx = gridText6Canvas.getContext("2d");
const gridText6WaveCtx = gridText6WaveCanvas.getContext("2d");
const typeIdentityCtx = typeIdentityCanvas.getContext("2d");
const orbitTypeCtx = orbitTypeCanvas.getContext("2d");
const orbitTypeTextureCanvas = document.createElement("canvas");
const orbitTypeTextureCtx = orbitTypeTextureCanvas.getContext("2d");
let typeSystemOne = null;
let typeSystemTwo = null;
let gridTextAnimationFrame = 0;
let gridTextRunning = false;
let gridTextPixelRatio = 1;
let gridTextStartTime = performance.now();
let gridText2AnimationFrame = 0;
let gridText2Running = false;
let gridText2PixelRatio = 1;
let gridText2StartTime = performance.now();
let gridText3AnimationFrame = 0;
let gridText3Running = false;
let gridText3PixelRatio = 1;
let gridText3StartTime = performance.now();
let gridText3MotionTime = 0;
let gridText3LastFrameTime = 0;
let gridText3SmoothedDelta = 0;
let gridText4AnimationFrame = 0;
let gridText4Running = false;
let gridText4PixelRatio = 1;
let gridText4StartTime = performance.now();
let gridText4MotionTime = 0;
let gridText4LastFrameTime = 0;
let gridText4SmoothedDelta = 0;
let gridText5AnimationFrame = 0;
let gridText5Running = false;
let gridText5PixelRatio = 1;
let gridText5StartTime = performance.now();
let gridText5MotionTime = 0;
let gridText5LastFrameTime = 0;
let gridText5WaveDragIndex = -1;
let gridText5SyncingWaveEnds = false;
let gridText6AnimationFrame = 0;
let gridText6Running = false;
let gridText6PixelRatio = 1;
let gridText6StartTime = performance.now();
let gridText6MotionTime = 0;
let gridText6LastFrameTime = 0;
let gridText6WaveDragIndex = -1;
let gridText6SyncingWaveEnds = false;
let gridText6PresetStatusToken = 0;
let typeIdentityAnimationFrame = 0;
let typeIdentityRunning = false;
let typeIdentityPixelRatio = 1;
let typeIdentityStartTime = performance.now();
let orbitTypeAnimationFrame = 0;
let orbitTypeRunning = false;
let orbitTypePixelRatio = 1;
let orbitTypeStartTime = performance.now();
let orbitTypeMotionTime = 0;
let orbitTypeLastFrameTime = 0;
let orbitTypeDragState = null;
let orbitTypePresetStatusToken = 0;
let outputPlaybackPaused = false;
let outputRecorder = null;
let outputRecordingChunks = [];
let outputRecordingStream = null;
let outputStatusToken = 0;
const outputDimensionStorageKey = "xavier-testing-output-dimensions";

const fileInput = document.querySelector("#source-image");
const patternControls = {
  tileSize: document.querySelector("#tile-size"),
  contrast: document.querySelector("#contrast"),
  dither: document.querySelector("#dither"),
  patternCount: document.querySelector("#pattern-count"),
  invert: document.querySelector("#invert"),
  exportButton: document.querySelector("#export-image"),
};

const typeControls = {
  form: document.querySelector("#type-physics-controls"),
  text: document.querySelector("#type-text"),
  gravity: document.querySelector("#type-gravity"),
  sturdy: document.querySelector("#type-sturdy"),
  spring: document.querySelector("#type-spring"),
  home: document.querySelector("#type-home"),
  bounce: document.querySelector("#type-bounce"),
  drag: document.querySelector("#type-drag"),
  floorFriction: document.querySelector("#type-floor-friction"),
  mass: document.querySelector("#type-mass"),
  solverSteps: document.querySelector("#type-solver-steps"),
  size: document.querySelector("#type-size"),
  outline: document.querySelector("#type-outline"),
  pointAmount: document.querySelector("#type-point-amount"),
  pointSize: document.querySelector("#type-point-size"),
  opacity: document.querySelector("#type-opacity"),
  opacityVariation: document.querySelector("#type-opacity-variation"),
  shape: document.querySelector("#type-shape"),
  textMode: document.querySelector("#type-text-mode"),
  sourceMode: document.querySelector("#type-source-mode"),
  imageFile: document.querySelector("#type-image-file"),
  imageStatus: document.querySelector("#type-image-status"),
  imageThreshold: document.querySelector("#type-image-threshold"),
  imageInvert: document.querySelector("#type-image-invert"),
  gridRepeat: document.querySelector("#type-grid-repeat"),
  repeatCropX: document.querySelector("#type-repeat-crop-x"),
  repeatCropY: document.querySelector("#type-repeat-crop-y"),
  variation: document.querySelector("#type-variation"),
  mouseForce: document.querySelector("#type-mouse-force"),
  mouseRadius: document.querySelector("#type-mouse-radius"),
  mouseEnabled: document.querySelector("#type-mouse-enabled"),
  reset: document.querySelector("#type-reset"),
};

const type2Controls = {
  form: document.querySelector("#type-gradient-physics-controls"),
  text: document.querySelector("#type2-text"),
  gravity: document.querySelector("#type2-gravity"),
  sturdy: document.querySelector("#type2-sturdy"),
  spring: document.querySelector("#type2-spring"),
  home: document.querySelector("#type2-home"),
  bounce: document.querySelector("#type2-bounce"),
  drag: document.querySelector("#type2-drag"),
  floorFriction: document.querySelector("#type2-floor-friction"),
  mass: document.querySelector("#type2-mass"),
  solverSteps: document.querySelector("#type2-solver-steps"),
  size: document.querySelector("#type2-size"),
  outline: document.querySelector("#type2-outline"),
  pointAmount: document.querySelector("#type2-point-amount"),
  pointSize: document.querySelector("#type2-point-size"),
  opacity: document.querySelector("#type2-opacity"),
  opacityVariation: document.querySelector("#type2-opacity-variation"),
  shape: document.querySelector("#type2-shape"),
  textMode: document.querySelector("#type2-text-mode"),
  sourceMode: document.querySelector("#type2-source-mode"),
  imageFile: document.querySelector("#type2-image-file"),
  imageStatus: document.querySelector("#type2-image-status"),
  imageThreshold: document.querySelector("#type2-image-threshold"),
  imageInvert: document.querySelector("#type2-image-invert"),
  gridRepeat: document.querySelector("#type2-grid-repeat"),
  repeatCropX: document.querySelector("#type2-repeat-crop-x"),
  repeatCropY: document.querySelector("#type2-repeat-crop-y"),
  variation: document.querySelector("#type2-variation"),
  gradientMode: document.querySelector("#type2-gradient-mode"),
  gradientStrength: document.querySelector("#type2-gradient-strength"),
  gradientSpeed: document.querySelector("#type2-gradient-speed"),
  gradientRotation: document.querySelector("#type2-gradient-rotation"),
  gradientScale: document.querySelector("#type2-gradient-scale"),
  gradientContrast: document.querySelector("#type2-gradient-contrast"),
  gradientSoftness: document.querySelector("#type2-gradient-softness"),
  gradientBands: document.querySelector("#type2-gradient-bands"),
  gradientDrift: document.querySelector("#type2-gradient-drift"),
  gradientTurbulence: document.querySelector("#type2-gradient-turbulence"),
  gradientAction: document.querySelector("#type2-gradient-action"),
  gradientOverlay: document.querySelector("#type2-gradient-overlay"),
  reset: document.querySelector("#type2-reset"),
};

const gridTextControls = {
  form: document.querySelector("#grid-text-controls"),
  text: document.querySelector("#grid-text-input"),
  fontSize: document.querySelector("#grid-text-font-size"),
  weight: document.querySelector("#grid-text-weight"),
  letterSpace: document.querySelector("#grid-text-letter-space"),
  renderMode: document.querySelector("#grid-text-render-mode"),
  repeatX: document.querySelector("#grid-text-repeat-x"),
  repeatY: document.querySelector("#grid-text-repeat-y"),
  gapX: document.querySelector("#grid-text-gap-x"),
  gapY: document.querySelector("#grid-text-gap-y"),
  padding: document.querySelector("#grid-text-padding"),
  showBoxes: document.querySelector("#grid-text-show-boxes"),
  speed: document.querySelector("#grid-text-speed"),
  delay: document.querySelector("#grid-text-delay"),
  waveShape: document.querySelector("#grid-text-wave-shape"),
  position: document.querySelector("#grid-text-position"),
  scale: document.querySelector("#grid-text-scale"),
  rotation: document.querySelector("#grid-text-rotation"),
  skew: document.querySelector("#grid-text-skew"),
  fieldMode: document.querySelector("#grid-text-field-mode"),
  fieldAngle: document.querySelector("#grid-text-field-angle"),
  fieldScale: document.querySelector("#grid-text-field-scale"),
  fieldDrift: document.querySelector("#grid-text-field-drift"),
  waveDensity: document.querySelector("#grid-text-wave-density"),
  opacity: document.querySelector("#grid-text-opacity"),
};

const gridText2Controls = {
  form: document.querySelector("#grid-edit-2-controls"),
  text: document.querySelector("#grid2-input"),
  font: document.querySelector("#grid2-font"),
  weight: document.querySelector("#grid2-weight"),
  letterSpace: document.querySelector("#grid2-letter-space"),
  renderMode: document.querySelector("#grid2-render-mode"),
  repeatX: document.querySelector("#grid2-repeat-x"),
  repeatY: document.querySelector("#grid2-repeat-y"),
  marginX: document.querySelector("#grid2-margin-x"),
  marginY: document.querySelector("#grid2-margin-y"),
  padding: document.querySelector("#grid2-padding"),
  cropX: document.querySelector("#grid2-crop-x"),
  cropY: document.querySelector("#grid2-crop-y"),
  cropToBox: document.querySelector("#grid2-crop-to-box"),
  showBoxes: document.querySelector("#grid2-show-boxes"),
  zoom: document.querySelector("#grid2-zoom"),
  speed: document.querySelector("#grid2-speed"),
  delayX: document.querySelector("#grid2-delay-x"),
  delayY: document.querySelector("#grid2-delay-y"),
  waveShape: document.querySelector("#grid2-wave-shape"),
  rampCurve: document.querySelector("#grid2-ramp-curve"),
  position: document.querySelector("#grid2-position"),
  scale: document.querySelector("#grid2-scale"),
  rotation: document.querySelector("#grid2-rotation"),
  skew: document.querySelector("#grid2-skew"),
  fieldMode: document.querySelector("#grid2-field-mode"),
  fieldAngle: document.querySelector("#grid2-field-angle"),
  fieldScale: document.querySelector("#grid2-field-scale"),
  fieldDrift: document.querySelector("#grid2-field-drift"),
  waveDensity: document.querySelector("#grid2-wave-density"),
  opacity: document.querySelector("#grid2-opacity"),
};

const gridText3Controls = {
  form: document.querySelector("#grid-edit-3-controls"),
  text: document.querySelector("#grid3-input"),
  font: document.querySelector("#grid3-font"),
  weight: document.querySelector("#grid3-weight"),
  letterSpace: document.querySelector("#grid3-letter-space"),
  renderMode: document.querySelector("#grid3-render-mode"),
  repeatX: document.querySelector("#grid3-repeat-x"),
  repeatY: document.querySelector("#grid3-repeat-y"),
  marginX: document.querySelector("#grid3-margin-x"),
  marginY: document.querySelector("#grid3-margin-y"),
  padding: document.querySelector("#grid3-padding"),
  cropX: document.querySelector("#grid3-crop-x"),
  cropY: document.querySelector("#grid3-crop-y"),
  cropToBox: document.querySelector("#grid3-crop-to-box"),
  showBoxes: document.querySelector("#grid3-show-boxes"),
  zoom: document.querySelector("#grid3-zoom"),
  speed: document.querySelector("#grid3-speed"),
  delayX: document.querySelector("#grid3-delay-x"),
  delayY: document.querySelector("#grid3-delay-y"),
  waveShape: document.querySelector("#grid3-wave-shape"),
  rampCurve: document.querySelector("#grid3-ramp-curve"),
  position: document.querySelector("#grid3-position"),
  scale: document.querySelector("#grid3-scale"),
  rotation: document.querySelector("#grid3-rotation"),
  skew: document.querySelector("#grid3-skew"),
  fieldMode: document.querySelector("#grid3-field-mode"),
  fieldAngle: document.querySelector("#grid3-field-angle"),
  fieldScale: document.querySelector("#grid3-field-scale"),
  fieldDrift: document.querySelector("#grid3-field-drift"),
  waveDensity: document.querySelector("#grid3-wave-density"),
  opacity: document.querySelector("#grid3-opacity"),
  timeSlices: document.querySelector("#grid3-time-slices"),
  sliceDelay: document.querySelector("#grid3-slice-delay"),
  sliceDirection: document.querySelector("#grid3-slice-direction"),
  innerRepeatX: document.querySelector("#grid3-inner-repeat-x"),
  innerRepeatY: document.querySelector("#grid3-inner-repeat-y"),
  innerGap: document.querySelector("#grid3-inner-gap"),
  opacityRandom: document.querySelector("#grid3-opacity-random"),
  opacityUnit: document.querySelector("#grid3-opacity-unit"),
  randomGradientSize: document.querySelector("#grid3-random-gradient-size"),
  randomIterations: document.querySelector("#grid3-random-iterations"),
  textColorA: document.querySelector("#grid3-text-color-a"),
  textColorB: document.querySelector("#grid3-text-color-b"),
  bgColorA: document.querySelector("#grid3-bg-color-a"),
  bgColorB: document.querySelector("#grid3-bg-color-b"),
};

const gridText4Controls = {
  form: document.querySelector("#grid-edit-4-controls"),
  text: document.querySelector("#grid4-input"),
  font: document.querySelector("#grid4-font"),
  weight: document.querySelector("#grid4-weight"),
  letterSpace: document.querySelector("#grid4-letter-space"),
  renderMode: document.querySelector("#grid4-render-mode"),
  repeatX: document.querySelector("#grid4-repeat-x"),
  repeatY: document.querySelector("#grid4-repeat-y"),
  marginX: document.querySelector("#grid4-margin-x"),
  marginY: document.querySelector("#grid4-margin-y"),
  padding: document.querySelector("#grid4-padding"),
  cropX: document.querySelector("#grid4-crop-x"),
  cropY: document.querySelector("#grid4-crop-y"),
  cropToBox: document.querySelector("#grid4-crop-to-box"),
  showBoxes: document.querySelector("#grid4-show-boxes"),
  zoom: document.querySelector("#grid4-zoom"),
  tempo: document.querySelector("#grid4-tempo"),
  delayX: document.querySelector("#grid4-delay-x"),
  delayY: document.querySelector("#grid4-delay-y"),
  waveShape: document.querySelector("#grid4-wave-shape"),
  snapSteps: document.querySelector("#grid4-snap-steps"),
  loopLock: document.querySelector("#grid4-loop-lock"),
  positionX: document.querySelector("#grid4-position-x"),
  positionY: document.querySelector("#grid4-position-y"),
  scale: document.querySelector("#grid4-scale"),
  rotation: document.querySelector("#grid4-rotation"),
  skewX: document.querySelector("#grid4-skew-x"),
  skewY: document.querySelector("#grid4-skew-y"),
  timeSlices: document.querySelector("#grid4-time-slices"),
  slicePhase: document.querySelector("#grid4-slice-phase"),
  sliceAxis: document.querySelector("#grid4-slice-axis"),
  innerRepeatX: document.querySelector("#grid4-inner-repeat-x"),
  innerRepeatY: document.querySelector("#grid4-inner-repeat-y"),
  innerGap: document.querySelector("#grid4-inner-gap"),
  opacity: document.querySelector("#grid4-opacity"),
  opacityRandom: document.querySelector("#grid4-opacity-random"),
  opacityUnit: document.querySelector("#grid4-opacity-unit"),
  textColorA: document.querySelector("#grid4-text-color-a"),
  textColorB: document.querySelector("#grid4-text-color-b"),
  bgColorA: document.querySelector("#grid4-bg-color-a"),
  bgColorB: document.querySelector("#grid4-bg-color-b"),
};

const gridText5Controls = {
  form: document.querySelector("#grid-edit-5-controls"),
  text: document.querySelector("#grid5-input"),
  font: document.querySelector("#grid5-font"),
  weight: document.querySelector("#grid5-weight"),
  letterSpace: document.querySelector("#grid5-letter-space"),
  renderMode: document.querySelector("#grid5-render-mode"),
  opacity: document.querySelector("#grid5-opacity"),
  repeatX: document.querySelector("#grid5-repeat-x"),
  repeatY: document.querySelector("#grid5-repeat-y"),
  marginX: document.querySelector("#grid5-margin-x"),
  marginY: document.querySelector("#grid5-margin-y"),
  padding: document.querySelector("#grid5-padding"),
  cropX: document.querySelector("#grid5-crop-x"),
  cropY: document.querySelector("#grid5-crop-y"),
  cropToBox: document.querySelector("#grid5-crop-to-box"),
  showBoxes: document.querySelector("#grid5-show-boxes"),
  zoom: document.querySelector("#grid5-zoom"),
  waveMode: document.querySelector("#grid5-wave-mode"),
  tempo: document.querySelector("#grid5-tempo"),
  waveSmooth: document.querySelector("#grid5-wave-smooth"),
  wavePoints: [
    document.querySelector("#grid5-wave-point-0"),
    document.querySelector("#grid5-wave-point-1"),
    document.querySelector("#grid5-wave-point-2"),
    document.querySelector("#grid5-wave-point-3"),
    document.querySelector("#grid5-wave-point-4"),
  ],
  phaseX: document.querySelector("#grid5-phase-x"),
  phaseY: document.querySelector("#grid5-phase-y"),
  fieldAngle: document.querySelector("#grid5-field-angle"),
  fieldPhase: document.querySelector("#grid5-field-phase"),
  position: document.querySelector("#grid5-position"),
  direction: document.querySelector("#grid5-direction"),
  positionSnapUnit: document.querySelector("#grid5-position-snap-unit"),
  positionSnap: document.querySelector("#grid5-position-snap"),
  scale: document.querySelector("#grid5-scale"),
  rotation: document.querySelector("#grid5-rotation"),
  skewX: document.querySelector("#grid5-skew-x"),
  skewY: document.querySelector("#grid5-skew-y"),
  timeSlices: document.querySelector("#grid5-time-slices"),
  slicePhase: document.querySelector("#grid5-slice-phase"),
  sliceSnap: document.querySelector("#grid5-slice-snap"),
  sliceAxis: document.querySelector("#grid5-slice-axis"),
  sliceAngle: document.querySelector("#grid5-slice-angle"),
  innerRepeatX: document.querySelector("#grid5-inner-repeat-x"),
  innerRepeatY: document.querySelector("#grid5-inner-repeat-y"),
  innerGap: document.querySelector("#grid5-inner-gap"),
  animateWeight: document.querySelector("#grid5-animate-weight"),
  weightAmount: document.querySelector("#grid5-weight-amount"),
  animateLetter: document.querySelector("#grid5-animate-letter"),
  letterAmount: document.querySelector("#grid5-letter-amount"),
  animateOpacity: document.querySelector("#grid5-animate-opacity"),
  opacityAmount: document.querySelector("#grid5-opacity-amount"),
  opacityRandom: document.querySelector("#grid5-opacity-random"),
  opacityUnit: document.querySelector("#grid5-opacity-unit"),
};

const gridText6Controls = {
  form: document.querySelector("#grid-edit-6-controls"),
  presetName: document.querySelector("#grid6-preset-name"),
  presetSelect: document.querySelector("#grid6-preset-select"),
  savePreset: document.querySelector("#grid6-save-preset"),
  loadPreset: document.querySelector("#grid6-load-preset"),
  deletePreset: document.querySelector("#grid6-delete-preset"),
  resetTextOnly: document.querySelector("#grid6-reset-text-only"),
  presetStatus: document.querySelector("#grid6-preset-status"),
  text: document.querySelector("#grid6-input"),
  font: document.querySelector("#grid6-font"),
  weight: document.querySelector("#grid6-weight"),
  letterSpace: document.querySelector("#grid6-letter-space"),
  renderMode: document.querySelector("#grid6-render-mode"),
  opacity: document.querySelector("#grid6-opacity"),
  repeatX: document.querySelector("#grid6-repeat-x"),
  repeatY: document.querySelector("#grid6-repeat-y"),
  marginX: document.querySelector("#grid6-margin-x"),
  marginY: document.querySelector("#grid6-margin-y"),
  padding: document.querySelector("#grid6-padding"),
  cropX: document.querySelector("#grid6-crop-x"),
  cropY: document.querySelector("#grid6-crop-y"),
  cropToBox: document.querySelector("#grid6-crop-to-box"),
  showBoxes: document.querySelector("#grid6-show-boxes"),
  zoom: document.querySelector("#grid6-zoom"),
  waveMode: document.querySelector("#grid6-wave-mode"),
  tempo: document.querySelector("#grid6-tempo"),
  waveSmooth: document.querySelector("#grid6-wave-smooth"),
  wavePoints: [
    document.querySelector("#grid6-wave-point-0"),
    document.querySelector("#grid6-wave-point-1"),
    document.querySelector("#grid6-wave-point-2"),
    document.querySelector("#grid6-wave-point-3"),
    document.querySelector("#grid6-wave-point-4"),
  ],
  phaseX: document.querySelector("#grid6-phase-x"),
  phaseY: document.querySelector("#grid6-phase-y"),
  fieldAngle: document.querySelector("#grid6-field-angle"),
  fieldPhase: document.querySelector("#grid6-field-phase"),
  position: document.querySelector("#grid6-position"),
  direction: document.querySelector("#grid6-direction"),
  positionSnapUnit: document.querySelector("#grid6-position-snap-unit"),
  positionSnap: document.querySelector("#grid6-position-snap"),
  scale: document.querySelector("#grid6-scale"),
  scaleMode: document.querySelector("#grid6-scale-mode"),
  scaleAmount: document.querySelector("#grid6-scale-amount"),
  rotation: document.querySelector("#grid6-rotation"),
  skewX: document.querySelector("#grid6-skew-x"),
  skewY: document.querySelector("#grid6-skew-y"),
  timeSlices: document.querySelector("#grid6-time-slices"),
  slicePhase: document.querySelector("#grid6-slice-phase"),
  sliceSnap: document.querySelector("#grid6-slice-snap"),
  sliceAxis: document.querySelector("#grid6-slice-axis"),
  sliceAngle: document.querySelector("#grid6-slice-angle"),
  innerRepeatX: document.querySelector("#grid6-inner-repeat-x"),
  innerRepeatY: document.querySelector("#grid6-inner-repeat-y"),
  innerGap: document.querySelector("#grid6-inner-gap"),
  stretchX: document.querySelector("#grid6-stretch-x"),
  stretchY: document.querySelector("#grid6-stretch-y"),
  bend: document.querySelector("#grid6-bend"),
  waveWarp: document.querySelector("#grid6-wave-warp"),
  warpFrequency: document.querySelector("#grid6-warp-frequency"),
  warpAngle: document.querySelector("#grid6-warp-angle"),
  perspective: document.querySelector("#grid6-perspective"),
  weightMode: document.querySelector("#grid6-weight-mode"),
  weightAmount: document.querySelector("#grid6-weight-amount"),
  letterMode: document.querySelector("#grid6-letter-mode"),
  letterAmount: document.querySelector("#grid6-letter-amount"),
  opacityMode: document.querySelector("#grid6-opacity-mode"),
  opacityAmount: document.querySelector("#grid6-opacity-amount"),
  opacityRandom: document.querySelector("#grid6-opacity-random"),
  opacityUnit: document.querySelector("#grid6-opacity-unit"),
};

const gridText6PresetStorageKey = "xavier-testing-grid-edit-6-presets";
let gridText6PresetMemory = {};

const typeIdentityControls = {
  form: document.querySelector("#type-identity-controls"),
  preset: document.querySelector("#typegen-preset"),
  applyPreset: document.querySelector("#typegen-apply-preset"),
  randomize: document.querySelector("#typegen-randomize"),
  reset: document.querySelector("#typegen-reset"),
  phrase: document.querySelector("#typegen-phrase"),
  layout: document.querySelector("#typegen-layout"),
  weight: document.querySelector("#typegen-weight"),
  typeScale: document.querySelector("#typegen-type-scale"),
  letterSpace: document.querySelector("#typegen-letter-space"),
  density: document.querySelector("#typegen-density"),
  columns: document.querySelector("#typegen-columns"),
  rows: document.querySelector("#typegen-rows"),
  gap: document.querySelector("#typegen-gap"),
  seed: document.querySelector("#typegen-seed"),
  glyphMix: document.querySelector("#typegen-glyph-mix"),
  stretchX: document.querySelector("#typegen-stretch-x"),
  stretchXVar: document.querySelector("#typegen-stretch-x-var"),
  stretchY: document.querySelector("#typegen-stretch-y"),
  stretchYVar: document.querySelector("#typegen-stretch-y-var"),
  rotation: document.querySelector("#typegen-rotation"),
  sizeVar: document.querySelector("#typegen-size-var"),
  slices: document.querySelector("#typegen-slices"),
  sliceAngle: document.querySelector("#typegen-slice-angle"),
  sliceDrift: document.querySelector("#typegen-slice-drift"),
  maskBlocks: document.querySelector("#typegen-mask-blocks"),
  maskFlicker: document.querySelector("#typegen-mask-flicker"),
  crop: document.querySelector("#typegen-crop"),
  speed: document.querySelector("#typegen-speed"),
  slideX: document.querySelector("#typegen-slide-x"),
  slideY: document.querySelector("#typegen-slide-y"),
  pulse: document.querySelector("#typegen-pulse"),
  scan: document.querySelector("#typegen-scan"),
  tempoDrift: document.querySelector("#typegen-tempo-drift"),
};

const orbitTypeControls = {
  form: document.querySelector("#orbit-type-controls"),
  presetName: document.querySelector("#orbit-preset-name"),
  presetSelect: document.querySelector("#orbit-preset-select"),
  savePreset: document.querySelector("#orbit-save-preset"),
  loadPreset: document.querySelector("#orbit-load-preset"),
  deletePreset: document.querySelector("#orbit-delete-preset"),
  randomize: document.querySelector("#orbit-randomize"),
  resetDesign: document.querySelector("#orbit-reset-design"),
  resetCamera: document.querySelector("#orbit-reset-camera"),
  presetStatus: document.querySelector("#orbit-preset-status"),
  text: document.querySelector("#orbit-text"),
  font: document.querySelector("#orbit-font"),
  weight: document.querySelector("#orbit-weight"),
  fontSize: document.querySelector("#orbit-font-size"),
  letterSpace: document.querySelector("#orbit-letter-space"),
  radius: document.querySelector("#orbit-radius"),
  rays: document.querySelector("#orbit-rays"),
  radialCopies: document.querySelector("#orbit-radial-copies"),
  innerFill: document.querySelector("#orbit-inner-fill"),
  lineLength: document.querySelector("#orbit-line-length"),
  edgeSoftness: document.querySelector("#orbit-edge-softness"),
  opacity: document.querySelector("#orbit-opacity"),
  opacityRandom: document.querySelector("#orbit-opacity-random"),
  sizeRandom: document.querySelector("#orbit-size-random"),
  weightRandom: document.querySelector("#orbit-weight-random"),
  spacingRandom: document.querySelector("#orbit-spacing-random"),
  lengthRandom: document.querySelector("#orbit-length-random"),
  radiusJitter: document.querySelector("#orbit-radius-jitter"),
  degreeRandom: document.querySelector("#orbit-degree-random"),
  seed: document.querySelector("#orbit-seed"),
  cameraX: document.querySelector("#orbit-camera-x"),
  cameraY: document.querySelector("#orbit-camera-y"),
  cameraRoll: document.querySelector("#orbit-camera-roll"),
  zoom: document.querySelector("#orbit-zoom"),
  perspective: document.querySelector("#orbit-perspective"),
  autoOrbit: document.querySelector("#orbit-auto-orbit"),
  spin: document.querySelector("#orbit-spin"),
  pulse: document.querySelector("#orbit-pulse"),
  shimmer: document.querySelector("#orbit-shimmer"),
  dragFeel: document.querySelector("#orbit-drag-feel"),
  textColor: document.querySelector("#orbit-text-color"),
  bgColor: document.querySelector("#orbit-bg-color"),
  fadeCentre: document.querySelector("#orbit-fade-centre"),
};

const orbitTypePresetStorageKey = "xavier-testing-orbit-type-presets";
let orbitTypePresetMemory = {};

const orbitTypeDefaultSettings = {
  text: "ORBIT TYPE",
  font: "Helvetica, Arial, sans-serif",
  weight: 700,
  fontSize: 28,
  letterSpace: 4,
  radius: 280,
  rays: 180,
  radialCopies: 1,
  innerFill: 72,
  lineLength: 100,
  edgeSoftness: 32,
  opacity: 82,
  opacityRandom: 48,
  sizeRandom: 56,
  weightRandom: 300,
  spacingRandom: 26,
  lengthRandom: 38,
  radiusJitter: 18,
  degreeRandom: 42,
  seed: 427,
  cameraX: 0,
  cameraY: 0,
  cameraRoll: 0,
  zoom: 110,
  perspective: 72,
  autoOrbit: 8,
  spin: 0,
  pulse: 12,
  shimmer: 20,
  dragFeel: 54,
  textColor: "#f5f5f5",
  bgColor: "#050505",
  fadeCentre: 0,
};

const typeIdentityPresets = {
  denseGrid: {
    phrase: "POWER",
    layout: "denseGrid",
    weight: 900,
    typeScale: 82,
    letterSpace: -8,
    density: 14,
    columns: 8,
    rows: 8,
    gap: 18,
    seed: 318,
    glyphMix: 0,
    stretchX: 150,
    stretchXVar: 95,
    stretchY: 105,
    stretchYVar: 85,
    rotation: 6,
    sizeVar: 65,
    slices: 10,
    sliceAngle: 0,
    sliceDrift: 38,
    maskBlocks: 8,
    maskFlicker: 28,
    crop: true,
    speed: 32,
    slideX: 42,
    slideY: 0,
    pulse: 18,
    scan: 24,
    tempoDrift: 18,
  },
  variableStack: {
    phrase: "JUST YOU",
    layout: "variableStack",
    weight: 900,
    typeScale: 116,
    letterSpace: -12,
    density: 10,
    columns: 4,
    rows: 9,
    gap: -4,
    seed: 461,
    glyphMix: 10,
    stretchX: 98,
    stretchXVar: 175,
    stretchY: 155,
    stretchYVar: 165,
    rotation: 3,
    sizeVar: 55,
    slices: 15,
    sliceAngle: 0,
    sliceDrift: 58,
    maskBlocks: 10,
    maskFlicker: 34,
    crop: true,
    speed: 26,
    slideX: 0,
    slideY: -38,
    pulse: 22,
    scan: 30,
    tempoDrift: 12,
  },
  giantLetters: {
    phrase: "THE ONE",
    layout: "giantLetters",
    weight: 900,
    typeScale: 182,
    letterSpace: -24,
    density: 8,
    columns: 3,
    rows: 5,
    gap: -28,
    seed: 742,
    glyphMix: 6,
    stretchX: 112,
    stretchXVar: 210,
    stretchY: 118,
    stretchYVar: 115,
    rotation: 2,
    sizeVar: 28,
    slices: 20,
    sliceAngle: 90,
    sliceDrift: 62,
    maskBlocks: 14,
    maskFlicker: 22,
    crop: true,
    speed: 20,
    slideX: 22,
    slideY: 0,
    pulse: 12,
    scan: 18,
    tempoDrift: 8,
  },
  spacedRepeat: {
    phrase: "WIN",
    layout: "spacedRepeat",
    weight: 900,
    typeScale: 74,
    letterSpace: 58,
    density: 18,
    columns: 12,
    rows: 7,
    gap: 56,
    seed: 128,
    glyphMix: 0,
    stretchX: 160,
    stretchXVar: 110,
    stretchY: 92,
    stretchYVar: 55,
    rotation: 8,
    sizeVar: 42,
    slices: 5,
    sliceAngle: 0,
    sliceDrift: 24,
    maskBlocks: 6,
    maskFlicker: 18,
    crop: true,
    speed: 36,
    slideX: 70,
    slideY: 0,
    pulse: 10,
    scan: 12,
    tempoDrift: 20,
  },
  arcGlyphs: {
    phrase: "BALL",
    layout: "arcGlyphs",
    weight: 900,
    typeScale: 92,
    letterSpace: 0,
    density: 22,
    columns: 9,
    rows: 8,
    gap: 22,
    seed: 527,
    glyphMix: 100,
    stretchX: 100,
    stretchXVar: 65,
    stretchY: 100,
    stretchYVar: 65,
    rotation: 45,
    sizeVar: 76,
    slices: 0,
    sliceAngle: 0,
    sliceDrift: 0,
    maskBlocks: 4,
    maskFlicker: 16,
    crop: true,
    speed: 22,
    slideX: 12,
    slideY: 16,
    pulse: 28,
    scan: 0,
    tempoDrift: 26,
  },
  broadcastMix: {
    phrase: "THE ONE",
    layout: "broadcastMix",
    weight: 900,
    typeScale: 104,
    letterSpace: -14,
    density: 18,
    columns: 8,
    rows: 10,
    gap: 6,
    seed: 884,
    glyphMix: 34,
    stretchX: 136,
    stretchXVar: 190,
    stretchY: 118,
    stretchYVar: 210,
    rotation: 10,
    sizeVar: 92,
    slices: 18,
    sliceAngle: 0,
    sliceDrift: 72,
    maskBlocks: 16,
    maskFlicker: 42,
    crop: true,
    speed: 40,
    slideX: 36,
    slideY: -16,
    pulse: 35,
    scan: 38,
    tempoDrift: 30,
  },
};

const patternDrawers = [
  drawSolidBlack,
  drawLargeDots,
  drawCheckerDense,
  drawDiagonalDense,
  drawVerticalBars,
  drawRingGrid,
  drawCrossGrid,
  drawCheckerMid,
  drawWaveLines,
  drawChevron,
  drawSmallDots,
  drawNestedSquares,
  drawDiagonalLight,
  drawThinGrid,
  drawSparseDots,
  drawSolidWhite,
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(edge0, edge1, value) {
  const t = clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function isPanelOrContains(panel, child) {
  return panel === child || (panel && child && panel.contains(child));
}

function getOutputCanvasDimensions() {
  const width = clamp(Number(outputControls.width && outputControls.width.value) || 1080, 320, 3840);
  const height = clamp(Number(outputControls.height && outputControls.height.value) || 1080, 320, 3840);
  return {
    width: Math.round(width),
    height: Math.round(height),
  };
}

function getConfiguredCanvasSize(canvas, minWidth = 420, minHeight = 360, baseWidth = 780, baseHeight = 660) {
  if (outputControls.width && outputControls.height) {
    const dimensions = getOutputCanvasDimensions();
    const width = Math.max(minWidth, dimensions.width);
    const height = Math.max(minHeight, dimensions.height);
    return {
      width,
      height,
      pixelRatio: clamp(Math.min(width / baseWidth, height / baseHeight), 0.6, 4),
    };
  }

  const rect = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  return {
    width: Math.max(minWidth, Math.round(rect.width * pixelRatio)),
    height: Math.max(minHeight, Math.round(rect.height * pixelRatio)),
    pixelRatio,
  };
}

function applyOutputCanvasDimensions(shouldRender = true) {
  if (!outputControls.width || !outputControls.height) return;
  const dimensions = getOutputCanvasDimensions();
  outputControls.width.value = String(dimensions.width);
  outputControls.height.value = String(dimensions.height);
  [document.documentElement, document.body].forEach((element) => {
    if (!element) return;
    element.style.setProperty("--testing-canvas-width", `${dimensions.width}px`);
    element.style.setProperty("--testing-canvas-height", `${dimensions.height}px`);
    element.style.setProperty("--testing-canvas-aspect", `${dimensions.width} / ${dimensions.height}`);
  });

  try {
    localStorage.setItem(outputDimensionStorageKey, JSON.stringify(dimensions));
  } catch (error) {
    // Local persistence is optional; the page still applies the dimensions.
  }

  if (shouldRender) {
    const panel = getActiveExperimentPanel();
    if (panel) renderExperimentStill(panel);
  }
}

function loadOutputCanvasDimensions() {
  if (!outputControls.width || !outputControls.height) return;

  try {
    const stored = JSON.parse(localStorage.getItem(outputDimensionStorageKey) || "{}");
    if (Number.isFinite(Number(stored.width))) outputControls.width.value = String(stored.width);
    if (Number.isFinite(Number(stored.height))) outputControls.height.value = String(stored.height);
  } catch (error) {
    // Keep the default values when saved dimensions cannot be read.
  }

  applyOutputCanvasDimensions(false);
}

function getActiveExperimentPanel() {
  return Array.from(document.querySelectorAll(".date-experiment.is-active")).find((panel) => !panel.hidden) || null;
}

function getActiveOutputCanvas() {
  const panel = getActiveExperimentPanel();
  if (!panel) return null;
  return (
    panel.querySelector(".grid-text-stage canvas") ||
    panel.querySelector(".type-physics-stage canvas") ||
    panel.querySelector(".testing-artwork canvas") ||
    panel.querySelector(".testing-stage canvas")
  );
}

function renderExperimentStill(panel) {
  if (panel === textPanel) {
    requestAnimationFrame(resizeAndRenderTextMap);
  } else if (panel === patternPanel) {
    requestAnimationFrame(renderPatternImage);
  } else if (panel === typePanel) {
    requestAnimationFrame(() => rebuildTypePhysics(typeSystemOne));
  } else if (panel === type2Panel) {
    requestAnimationFrame(() => rebuildTypePhysics(typeSystemTwo));
  } else if (panel === gridTextPanel) {
    requestAnimationFrame(resizeGridTextCanvas);
  } else if (panel === gridText2Panel) {
    requestAnimationFrame(resizeGridText2Canvas);
  } else if (panel === gridText3Panel) {
    requestAnimationFrame(resizeGridText3Canvas);
  } else if (panel === gridText4Panel) {
    requestAnimationFrame(resizeGridText4Canvas);
  } else if (panel === gridText5Panel) {
    requestAnimationFrame(resizeGridText5Canvas);
  } else if (panel === gridText6Panel) {
    requestAnimationFrame(resizeGridText6Canvas);
  } else if (panel === typeIdentityPanel) {
    requestAnimationFrame(resizeTypeIdentityCanvas);
  } else if (panel === orbitTypePanel) {
    requestAnimationFrame(resizeOrbitTypeCanvas);
  }
}

function setOutputPlaybackPaused(isPaused) {
  outputPlaybackPaused = isPaused;
  updateOutputPlaybackControls();

  const activePanel = getActiveExperimentPanel();
  if (!activePanel) {
    setOutputStatus("Open an experiment");
    return;
  }

  if (isPaused) {
    stopExperimentPanel(activePanel);
    setOutputStatus("Paused");
  } else {
    startExperimentPanel(activePanel);
    setOutputStatus("Playing");
  }
}

function updateOutputPlaybackControls() {
  if (!outputControls.playPause) return;
  outputControls.playPause.textContent = outputPlaybackPaused ? "Play" : "Pause";
  outputControls.playPause.setAttribute("aria-pressed", String(outputPlaybackPaused));
  outputControls.playPause.classList.toggle("is-active", outputPlaybackPaused);
}

function getOutputRecordingFormat() {
  if (typeof MediaRecorder === "undefined") return null;

  const formats = [
    { mimeType: "video/mp4;codecs=avc1.42E01E", extension: "mp4" },
    { mimeType: "video/mp4;codecs=h264", extension: "mp4" },
    { mimeType: "video/mp4", extension: "mp4" },
    { mimeType: "video/webm;codecs=vp9", extension: "webm" },
    { mimeType: "video/webm;codecs=vp8", extension: "webm" },
    { mimeType: "video/webm", extension: "webm" },
  ];
  return formats.find((format) => MediaRecorder.isTypeSupported(format.mimeType)) || null;
}

function startOutputRecording() {
  if (outputRecorder) {
    setOutputStatus("Already recording");
    return;
  }

  const canvas = getActiveOutputCanvas();
  if (!canvas) {
    setOutputStatus("Open an experiment");
    return;
  }

  if (!canvas.captureStream || typeof MediaRecorder === "undefined") {
    downloadOutputSnapshot(canvas);
    return;
  }

  const format = getOutputRecordingFormat();
  if (!format) {
    downloadOutputSnapshot(canvas);
    return;
  }

  outputRecordingChunks = [];
  outputRecordingStream = canvas.captureStream(60);

  try {
    outputRecorder = new MediaRecorder(outputRecordingStream, { mimeType: format.mimeType });
  } catch (error) {
    stopOutputRecordingStream();
    outputRecorder = null;
    downloadOutputSnapshot(canvas);
    return;
  }

  outputRecorder.addEventListener("dataavailable", (event) => {
    if (event.data && event.data.size > 0) {
      outputRecordingChunks.push(event.data);
    }
  });

  outputRecorder.addEventListener("stop", () => finishOutputRecording(canvas, format));
  outputRecorder.start(250);
  outputControls.record.disabled = true;
  outputControls.stopRecord.disabled = false;
  setOutputStatus(format.extension === "mp4" ? "Recording MP4" : "Recording WEBM", true);
}

function stopOutputRecording() {
  if (!outputRecorder) {
    setOutputStatus("Not recording");
    return;
  }

  if (outputRecorder.state !== "inactive") {
    outputRecorder.stop();
  }
}

function finishOutputRecording(canvas, format) {
  const blob = new Blob(outputRecordingChunks, { type: format.mimeType });
  stopOutputRecordingStream();
  outputRecorder = null;
  outputRecordingChunks = [];
  outputControls.record.disabled = false;
  outputControls.stopRecord.disabled = true;

  if (blob.size <= 0) {
    downloadOutputSnapshot(canvas);
    return;
  }

  downloadBlob(blob, `${getOutputDownloadBaseName(canvas)}.${format.extension}`);
  setOutputStatus(format.extension === "mp4" ? "MP4 downloaded" : "WEBM downloaded");
}

function stopOutputRecordingStream() {
  if (!outputRecordingStream) return;
  outputRecordingStream.getTracks().forEach((track) => track.stop());
  outputRecordingStream = null;
}

function downloadOutputSnapshot(canvas) {
  canvas.toBlob((blob) => {
    if (!blob) {
      setOutputStatus("Download failed");
      return;
    }

    downloadBlob(blob, `${getOutputDownloadBaseName(canvas)}.png`);
    setOutputStatus("Snapshot downloaded");
  }, "image/png");
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function getOutputDownloadBaseName(canvas) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `xavier-testing-${canvas.id || "output"}-${stamp}`;
}

function setOutputStatus(message, persist = false) {
  if (!outputControls.status) return;
  const token = outputStatusToken + 1;
  outputStatusToken = token;
  outputControls.status.textContent = message;
  if (persist) return;
  window.setTimeout(() => {
    if (outputStatusToken === token) {
      outputControls.status.textContent = "";
    }
  }, 2400);
}

function setPanelExpanded(toggle, isExpanded) {
  const panel = document.getElementById(toggle.getAttribute("aria-controls"));

  if (isExpanded) {
    testToggles.forEach((otherToggle) => {
      if (otherToggle === toggle) return;
      const otherPanel = document.getElementById(otherToggle.getAttribute("aria-controls"));
      otherToggle.setAttribute("aria-expanded", "false");
      otherToggle.querySelector(".testing-page-toggle__arrow").textContent = "↓";
      otherPanel.hidden = true;
      if (isPanelOrContains(otherPanel, typePanel)) stopTypePhysics(typeSystemOne);
      if (isPanelOrContains(otherPanel, type2Panel)) stopTypePhysics(typeSystemTwo);
      if (isPanelOrContains(otherPanel, gridTextPanel)) stopGridText();
      if (isPanelOrContains(otherPanel, gridText2Panel)) stopGridText2();
      if (isPanelOrContains(otherPanel, gridText3Panel)) stopGridText3();
      if (isPanelOrContains(otherPanel, gridText4Panel)) stopGridText4();
      if (isPanelOrContains(otherPanel, gridText5Panel)) stopGridText5();
      if (isPanelOrContains(otherPanel, gridText6Panel)) stopGridText6();
      if (isPanelOrContains(otherPanel, typeIdentityPanel)) stopTypeIdentity();
      if (isPanelOrContains(otherPanel, orbitTypePanel)) stopOrbitType();
    });
  }

  toggle.setAttribute("aria-expanded", String(isExpanded));
  toggle.querySelector(".testing-page-toggle__arrow").textContent = isExpanded ? "↑" : "↓";
  panel.hidden = !isExpanded;

  if (isExpanded) {
    collapseExperimentsInPanel(panel);
  }

  if (!isExpanded && isPanelOrContains(panel, typePanel)) {
    stopTypePhysics(typeSystemOne);
  }

  if (!isExpanded && isPanelOrContains(panel, type2Panel)) {
    stopTypePhysics(typeSystemTwo);
  }

  if (!isExpanded && isPanelOrContains(panel, gridTextPanel)) {
    stopGridText();
  }

  if (!isExpanded && isPanelOrContains(panel, gridText2Panel)) {
    stopGridText2();
  }

  if (!isExpanded && isPanelOrContains(panel, gridText3Panel)) {
    stopGridText3();
  }

  if (!isExpanded && isPanelOrContains(panel, gridText4Panel)) {
    stopGridText4();
  }

  if (!isExpanded && isPanelOrContains(panel, gridText5Panel)) {
    stopGridText5();
  }

  if (!isExpanded && isPanelOrContains(panel, gridText6Panel)) {
    stopGridText6();
  }

  if (!isExpanded && isPanelOrContains(panel, typeIdentityPanel)) {
    stopTypeIdentity();
  }

  if (!isExpanded && isPanelOrContains(panel, orbitTypePanel)) {
    stopOrbitType();
  }
}

testToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    setPanelExpanded(toggle, toggle.getAttribute("aria-expanded") !== "true");
  });
});

function setExperimentExpanded(toggle, isExpanded) {
  const panel = document.getElementById(toggle.getAttribute("aria-controls"));
  const group = toggle.closest("[data-experiment-group]");

  if (isExpanded && group) {
    group.querySelectorAll(".experiment-toggle").forEach((otherToggle) => {
      if (otherToggle === toggle) return;
      const otherPanel = document.getElementById(otherToggle.getAttribute("aria-controls"));
      otherToggle.setAttribute("aria-expanded", "false");
      otherToggle.querySelector(".testing-page-toggle__arrow").textContent = "↓";
      otherPanel.hidden = true;
      otherPanel.classList.remove("is-active");
      stopExperimentPanel(otherPanel);
    });
  }

  toggle.setAttribute("aria-expanded", String(isExpanded));
  toggle.querySelector(".testing-page-toggle__arrow").textContent = isExpanded ? "↑" : "↓";
  panel.hidden = !isExpanded;
  panel.classList.toggle("is-active", isExpanded);

  if (isExpanded) {
    startExperimentPanel(panel);
  } else {
    stopExperimentPanel(panel);
  }
}

experimentToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    setExperimentExpanded(toggle, toggle.getAttribute("aria-expanded") !== "true");
  });
});

function collapseExperimentsInPanel(datePanel) {
  datePanel.querySelectorAll(".experiment-toggle").forEach((toggle) => {
    const panel = document.getElementById(toggle.getAttribute("aria-controls"));
    toggle.setAttribute("aria-expanded", "false");
    toggle.querySelector(".testing-page-toggle__arrow").textContent = "↓";
    panel.hidden = true;
    panel.classList.remove("is-active");
    stopExperimentPanel(panel);
  });
}

function startExperimentPanel(panel) {
  if (outputPlaybackPaused) {
    renderExperimentStill(panel);
    return;
  }

  if (panel === textPanel) {
    requestAnimationFrame(resizeAndRenderTextMap);
  } else if (panel === patternPanel) {
    requestAnimationFrame(renderPatternImage);
  } else if (panel === typePanel) {
    startTypePhysics(typeSystemOne);
  } else if (panel === type2Panel) {
    startTypePhysics(typeSystemTwo);
  } else if (panel === gridTextPanel) {
    startGridText();
  } else if (panel === gridText2Panel) {
    startGridText2();
  } else if (panel === gridText3Panel) {
    startGridText3();
  } else if (panel === gridText4Panel) {
    startGridText4();
  } else if (panel === gridText5Panel) {
    startGridText5();
  } else if (panel === gridText6Panel) {
    startGridText6();
  } else if (panel === typeIdentityPanel) {
    startTypeIdentity();
  } else if (panel === orbitTypePanel) {
    startOrbitType();
  }
}

function stopExperimentPanel(panel) {
  if (isPanelOrContains(panel, typePanel)) stopTypePhysics(typeSystemOne);
  if (isPanelOrContains(panel, type2Panel)) stopTypePhysics(typeSystemTwo);
  if (isPanelOrContains(panel, gridTextPanel)) stopGridText();
  if (isPanelOrContains(panel, gridText2Panel)) stopGridText2();
  if (isPanelOrContains(panel, gridText3Panel)) stopGridText3();
  if (isPanelOrContains(panel, gridText4Panel)) stopGridText4();
  if (isPanelOrContains(panel, gridText5Panel)) stopGridText5();
  if (isPanelOrContains(panel, gridText6Panel)) stopGridText6();
  if (isPanelOrContains(panel, typeIdentityPanel)) stopTypeIdentity();
  if (isPanelOrContains(panel, orbitTypePanel)) stopOrbitType();
}

function bindOutputControls() {
  if (!outputControls.playPause) return;

  outputControls.playPause.addEventListener("click", () => {
    setOutputPlaybackPaused(!outputPlaybackPaused);
  });

  outputControls.record.addEventListener("click", startOutputRecording);
  outputControls.stopRecord.addEventListener("click", stopOutputRecording);
  outputControls.applySize.addEventListener("click", () => {
    applyOutputCanvasDimensions(true);
    setOutputStatus("Size applied");
  });
  [outputControls.width, outputControls.height].forEach((input) => {
    input.addEventListener("change", () => applyOutputCanvasDimensions(true));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyOutputCanvasDimensions(true);
      }
    });
  });
  loadOutputCanvasDimensions();
  updateOutputPlaybackControls();
}

function createTextTexture(width, height, scale) {
  textureCanvas.width = width;
  textureCanvas.height = height;
  textureCtx.clearRect(0, 0, width, height);
  textureCtx.textBaseline = "middle";

  const lines = [
    "the sentence becomes surface and pressure",
    "radial text held inside a blue sphere",
    "language folds through paper grain",
    "small serif marks drift into an hourglass",
    "ink, field, map, displacement, touch",
  ];

  const rowStep = 11 * scale;
  const columnStep = 128 * scale;
  for (let y = -height * 0.12; y < height * 1.12; y += rowStep) {
    const rowIndex = Math.round(y / rowStep);
    const opacity = 0.24 + ((rowIndex * 19) % 40) / 100;
    const rotation = Math.sin(rowIndex * 1.37) * 0.026;
    const offset = ((rowIndex * 53) % 140) * scale;
    textureCtx.save();
    textureCtx.translate(width / 2, y);
    textureCtx.rotate(rotation);
    textureCtx.font = `${mix(6.6, 9.2, (rowIndex % 7) / 6) * scale}px Georgia, "Times New Roman", serif`;
    textureCtx.fillStyle = `rgba(2, 25, 84, ${opacity})`;

    for (let x = -width * 0.78 - offset; x < width * 0.78; x += columnStep) {
      const phrase = lines[Math.abs(rowIndex + Math.round(x / columnStep)) % lines.length];
      const jitterX = Math.sin((x + y) * 0.009) * 4.5 * scale;
      const jitterY = Math.cos((x - y) * 0.012) * 1.4 * scale;
      textureCtx.fillText(phrase, x + jitterX, jitterY);
    }

    textureCtx.restore();
  }

  textureData = textureCtx.getImageData(0, 0, width, height).data;
}

function sampleTexture(x, y, textureWidth, textureHeight) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = x - x0;
  const ty = y - y0;
  const a = getTexturePixel(x0, y0, textureWidth, textureHeight);
  const b = getTexturePixel(x0 + 1, y0, textureWidth, textureHeight);
  const c = getTexturePixel(x0, y0 + 1, textureWidth, textureHeight);
  const d = getTexturePixel(x0 + 1, y0 + 1, textureWidth, textureHeight);

  return [
    mix(mix(a[0], b[0], tx), mix(c[0], d[0], tx), ty),
    mix(mix(a[1], b[1], tx), mix(c[1], d[1], tx), ty),
    mix(mix(a[2], b[2], tx), mix(c[2], d[2], tx), ty),
    mix(mix(a[3], b[3], tx), mix(c[3], d[3], tx), ty) / 255,
  ];
}

function getTexturePixel(x, y, textureWidth, textureHeight) {
  const wrappedX = ((x % textureWidth) + textureWidth) % textureWidth;
  const wrappedY = ((y % textureHeight) + textureHeight) % textureHeight;
  const index = (wrappedY * textureWidth + wrappedX) * 4;
  return [
    textureData[index],
    textureData[index + 1],
    textureData[index + 2],
    textureData[index + 3],
  ];
}

function renderTextGradientMap() {
  const width = textCanvas.width;
  const height = textCanvas.height;
  const image = textCtx.createImageData(width, height);
  const data = image.data;
  const shortSide = Math.min(width, height);
  const textureWidth = textureCanvas.width;
  const textureHeight = textureCanvas.height;
  const cx = width / 2;
  const cy = height / 2;
  const sphereRadius = shortSide * 0.38;
  const upper = { x: cx, y: cy - sphereRadius * 0.64 };
  const lower = { x: cx, y: cy + sphereRadius * 0.64 };

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = (x - cx) / shortSide;
      const ny = (y - cy) / shortSide;
      const paperGrain = pseudoNoise(x, y) * 8 - 4;
      const paperFiber = Math.sin(x * 0.018 + y * 0.007) * 1.5 + Math.sin(y * 0.031) * 1.1;
      const paper = 244 + paperGrain + paperFiber;
      let maskTotal = 0;
      let sampleX = x + Math.sin(ny * 18) * shortSide * 0.006;
      let sampleY = y + Math.sin(nx * 12) * shortSide * 0.003;
      let blueGlow = 0;
      let innerPressure = 0;

      [upper, lower].forEach((lobe) => {
        const dx = x - lobe.x;
        const dy = y - lobe.y;
        const distance = Math.hypot(dx, dy);
        const unit = distance / sphereRadius;
        const mask = 1 - smoothstep(0.72, 1.02, unit);

        if (mask <= 0) return;

        const angle = Math.atan2(dy, dx);
        const depth = Math.sqrt(Math.max(0, 1 - unit * unit));
        const sphericalBend = Math.pow(1 - depth, 0.72) * sphereRadius * 0.92;
        const polarSwirl = Math.sin(unit * Math.PI) * sphereRadius * 0.18;
        const equatorPinch = Math.cos(angle * 2) * sphereRadius * 0.1 * mask;
        sampleX += (Math.cos(angle) * sphericalBend + Math.sin(angle * 2.7) * equatorPinch) * mask;
        sampleY += (Math.sin(angle) * sphericalBend - polarSwirl) * mask;
        maskTotal += mask;
        blueGlow += Math.pow(mask, 1.65);
        innerPressure += Math.pow(mask, 2.2) * depth;
      });

      const centerBridge = Math.exp(-Math.abs(ny) * 22) * Math.exp(-Math.abs(nx) * 8.5);
      sampleY += centerBridge * Math.sin(nx * 24) * shortSide * 0.018;
      const hourglassMask = clamp(maskTotal * 0.8 + centerBridge * 0.52, 0, 1);
      const [tr, tg, tb, ta] = sampleTexture(sampleX, sampleY, textureWidth, textureHeight);
      const ink = clamp(ta * hourglassMask * 1.75, 0, 0.92);
      const throatUpper = Math.exp(-(nx * nx * 190 + Math.pow(ny + 0.058, 2) * 310));
      const throatLower = Math.exp(-(nx * nx * 190 + Math.pow(ny - 0.058, 2) * 310));
      const throatDark = clamp(throatUpper + throatLower, 0, 1);
      const radialBlue = clamp(blueGlow * 0.34 + centerBridge * 0.2 + innerPressure * 0.05 + throatDark * 0.42, 0, 0.82);
      const outerMist = Math.pow(clamp(hourglassMask, 0, 1), 1.8);
      const shadow = smoothstep(0.96, 0.16, Math.hypot(nx * 0.95, ny * 0.82)) * hourglassMask;

      let r = paper;
      let g = paper - radialBlue * 18 - outerMist * 7;
      let b = paper - radialBlue * 42 - outerMist * 18;

      r = mix(r, tr, ink * 0.76);
      g = mix(g, tg, ink * 0.84);
      b = mix(b, tb, ink * 0.92);

      r -= shadow * 7;
      g -= shadow * 18;
      b -= shadow * 34;
      r -= throatDark * 92;
      g -= throatDark * 118;
      b -= throatDark * 138;

      const index = (y * width + x) * 4;
      data[index] = clamp(r, 0, 255);
      data[index + 1] = clamp(g, 0, 255);
      data[index + 2] = clamp(b, 0, 255);
      data[index + 3] = 255;
    }
  }

  textCtx.putImageData(image, 0, 0);
  addTextGradientWash(width, height, "behind");
  softenTextCanvas(width, height);
  addTextGradientWash(width, height, "over");
  addPaperSpecks(width, height);
}

function softenTextCanvas(width, height) {
  const soften = document.createElement("canvas");
  soften.width = width;
  soften.height = height;
  soften.getContext("2d").drawImage(textCanvas, 0, 0);

  textCtx.save();
  textCtx.globalAlpha = 0.2;
  textCtx.filter = "blur(9px)";
  textCtx.drawImage(soften, 0, 0);
  textCtx.globalAlpha = 0.34;
  textCtx.filter = "blur(2.2px)";
  textCtx.drawImage(soften, 0, 0);
  textCtx.restore();
}

function addTextGradientWash(width, height, layer) {
  const cx = width / 2;
  const cy = height / 2;
  const alphaScale = layer === "behind" ? 1 : 0.55;
  textCtx.save();
  textCtx.globalCompositeOperation = "multiply";

  const upperGradient = textCtx.createRadialGradient(cx, cy - height * 0.18, 0, cx, cy - height * 0.18, height * 0.38);
  upperGradient.addColorStop(0, `rgba(21, 72, 158, ${0.26 * alphaScale})`);
  upperGradient.addColorStop(0.58, `rgba(38, 93, 177, ${0.16 * alphaScale})`);
  upperGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  textCtx.fillStyle = upperGradient;
  textCtx.fillRect(0, 0, width, height);

  const lowerGradient = textCtx.createRadialGradient(cx, cy + height * 0.18, 0, cx, cy + height * 0.18, height * 0.38);
  lowerGradient.addColorStop(0, `rgba(13, 58, 142, ${0.3 * alphaScale})`);
  lowerGradient.addColorStop(0.58, `rgba(29, 86, 174, ${0.16 * alphaScale})`);
  lowerGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  textCtx.fillStyle = lowerGradient;
  textCtx.fillRect(0, 0, width, height);
  textCtx.restore();
}

function addPaperSpecks(width, height) {
  const image = textCtx.getImageData(0, 0, width, height);
  const data = image.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const speck = pseudoNoise(x * 3.1, y * 2.7);
      if (speck > 0.985) {
        data[index] -= 9;
        data[index + 1] -= 8;
        data[index + 2] -= 5;
      } else if (speck < 0.018) {
        data[index] += 7;
        data[index + 1] += 6;
        data[index + 2] += 4;
      }
    }
  }

  textCtx.putImageData(image, 0, 0);
}

function pseudoNoise(x, y) {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
  return value - Math.floor(value);
}

function resizeAndRenderTextMap() {
  if (textPanel.hidden) return;

  const { width, height, pixelRatio } = getConfiguredCanvasSize(textCanvas, 360, 560, 620, 980);

  if (textCanvas.width !== width || textCanvas.height !== height) {
    textCanvas.width = width;
    textCanvas.height = height;
    createTextTexture(width, height, pixelRatio);
  }

  renderTextGradientMap();
}

function applyContrast(value, amount) {
  const factor = amount / 100;
  return clamp((value - 128) * factor + 128, 0, 255);
}

function imageToSquare(image) {
  const size = 960;
  sourceCanvas.width = size;
  sourceCanvas.height = size;
  sourceCtx.fillStyle = "#fff";
  sourceCtx.fillRect(0, 0, size, size);

  const crop = Math.min(image.naturalWidth, image.naturalHeight);
  const sx = (image.naturalWidth - crop) / 2;
  const sy = (image.naturalHeight - crop) / 2;
  sourceCtx.drawImage(image, sx, sy, crop, crop, 0, 0, size, size);
}

function imageToOutputCanvas(image, width, height) {
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  sourceCtx.fillStyle = "#fff";
  sourceCtx.fillRect(0, 0, width, height);

  const targetRatio = width / Math.max(1, height);
  const sourceRatio = image.naturalWidth / Math.max(1, image.naturalHeight);
  let sx = 0;
  let sy = 0;
  let sw = image.naturalWidth;
  let sh = image.naturalHeight;

  if (sourceRatio > targetRatio) {
    sw = image.naturalHeight * targetRatio;
    sx = (image.naturalWidth - sw) / 2;
  } else {
    sh = image.naturalWidth / targetRatio;
    sy = (image.naturalHeight - sh) / 2;
  }

  sourceCtx.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
}

function sampleCell(imageData, startX, startY, size) {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  let total = 0;
  let count = 0;

  for (let y = startY; y < Math.min(startY + size, height); y += 2) {
    for (let x = startX; x < Math.min(startX + size, width); x += 2) {
      const index = (y * width + x) * 4;
      total += data[index] * 0.2126 + data[index + 1] * 0.7152 + data[index + 2] * 0.0722;
      count++;
    }
  }

  return total / Math.max(count, 1);
}

function renderPatternImage() {
  if (!sourceImage) {
    drawPatternPlaceholder();
    return;
  }

  const dimensions = getOutputCanvasDimensions();
  imageToOutputCanvas(sourceImage, dimensions.width, dimensions.height);
  const tile = Number(patternControls.tileSize.value);
  const contrast = Number(patternControls.contrast.value);
  const dither = Number(patternControls.dither.value);
  const activePatternCount = Number(patternControls.patternCount.value);
  const imageData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);

  patternCanvas.width = sourceCanvas.width;
  patternCanvas.height = sourceCanvas.height;
  patternCtx.fillStyle = "#fff";
  patternCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);

  for (let y = 0; y < patternCanvas.height; y += tile) {
    for (let x = 0; x < patternCanvas.width; x += tile) {
      const noise = (((x * 17 + y * 31) % 97) / 96 - 0.5) * dither;
      let lightness = applyContrast(sampleCell(imageData, x, y, tile) + noise, contrast);
      if (patternControls.invert.checked) lightness = 255 - lightness;

      const patternIndex = Math.round((lightness / 255) * (activePatternCount - 1));
      const drawerIndex = Math.round(
        (patternIndex / Math.max(activePatternCount - 1, 1)) * (patternDrawers.length - 1)
      );
      patternDrawers[drawerIndex](patternCtx, x, y, tile);
    }
  }
}

function drawPatternPlaceholder() {
  const dimensions = getOutputCanvasDimensions();
  patternCanvas.width = dimensions.width;
  patternCanvas.height = dimensions.height;
  patternCtx.fillStyle = "#fff";
  patternCtx.fillRect(0, 0, patternCanvas.width, patternCanvas.height);

  const tile = 48;
  const centerX = patternCanvas.width / 2;
  const centerY = patternCanvas.height / 2;
  for (let y = 0; y < patternCanvas.height; y += tile) {
    for (let x = 0; x < patternCanvas.width; x += tile) {
      const distance = Math.hypot(x - centerX, y - centerY * 0.98);
      const lightness = clamp(distance / 2.7 + Math.sin(x * 0.02) * 38, 0, 255);
      const index = Math.round((lightness / 255) * (patternDrawers.length - 1));
      patternDrawers[index](patternCtx, x, y, tile);
    }
  }
}

function withClip(context, x, y, size, draw) {
  context.save();
  context.beginPath();
  context.rect(x, y, size, size);
  context.clip();
  context.fillStyle = "#fff";
  context.fillRect(x, y, size, size);
  draw();
  context.restore();
}

function drawSolidBlack(context, x, y, size) {
  context.fillStyle = "#000";
  context.fillRect(x, y, size, size);
}

function drawSolidWhite(context, x, y, size) {
  context.fillStyle = "#fff";
  context.fillRect(x, y, size, size);
}

function drawLargeDots(context, x, y, size) {
  withClip(context, x, y, size, () => {
    context.fillStyle = "#000";
    const radius = size * 0.28;
    for (let yy = y; yy <= y + size; yy += size * 0.52) {
      for (let xx = x; xx <= x + size; xx += size * 0.52) {
        circle(context, xx, yy, radius);
      }
    }
  });
}

function drawCheckerDense(context, x, y, size) {
  drawChecker(context, x, y, size, 4);
}

function drawCheckerMid(context, x, y, size) {
  drawChecker(context, x, y, size, 3);
}

function drawChecker(context, x, y, size, cells) {
  const unit = size / cells;
  withClip(context, x, y, size, () => {
    context.fillStyle = "#000";
    for (let row = 0; row < cells; row++) {
      for (let col = 0; col < cells; col++) {
        if ((row + col) % 2 === 0) context.fillRect(x + col * unit, y + row * unit, unit, unit);
      }
    }
  });
}

function drawDiagonalDense(context, x, y, size) {
  drawDiagonal(context, x, y, size, size * 0.16, size * 0.34);
}

function drawDiagonalLight(context, x, y, size) {
  drawDiagonal(context, x, y, size, size * 0.045, size * 0.28);
}

function drawDiagonal(context, x, y, size, lineWidth, spacing) {
  withClip(context, x, y, size, () => {
    context.strokeStyle = "#000";
    context.lineWidth = Math.max(1, lineWidth);
    for (let i = -size; i < size * 2; i += spacing) {
      line(context, x + i, y + size, x + i + size, y);
    }
  });
}

function drawVerticalBars(context, x, y, size) {
  withClip(context, x, y, size, () => {
    context.fillStyle = "#000";
    const unit = size / 6;
    for (let i = 0; i < 6; i += 2) context.fillRect(x + i * unit, y, unit, size);
  });
}

function drawRingGrid(context, x, y, size) {
  withClip(context, x, y, size, () => {
    context.strokeStyle = "#000";
    context.lineWidth = Math.max(1, size * 0.08);
    for (let yy = y + size * 0.24; yy < y + size; yy += size * 0.42) {
      for (let xx = x + size * 0.24; xx < x + size; xx += size * 0.42) {
        context.beginPath();
        context.arc(xx, yy, size * 0.17, 0, Math.PI * 2);
        context.stroke();
      }
    }
  });
}

function drawCrossGrid(context, x, y, size) {
  withClip(context, x, y, size, () => {
    context.strokeStyle = "#000";
    context.lineWidth = Math.max(1, size * 0.1);
    line(context, x, y + size / 2, x + size, y + size / 2);
    line(context, x + size / 2, y, x + size / 2, y + size);
    line(context, x, y, x + size, y + size);
    line(context, x + size, y, x, y + size);
  });
}

function drawWaveLines(context, x, y, size) {
  withClip(context, x, y, size, () => {
    context.strokeStyle = "#000";
    context.lineWidth = Math.max(1, size * 0.07);
    for (let yy = y + size * 0.2; yy < y + size; yy += size * 0.24) {
      context.beginPath();
      for (let xx = x; xx <= x + size; xx += size / 8) {
        const waveY = yy + Math.sin((xx - x) / size * Math.PI * 2) * size * 0.07;
        if (xx === x) context.moveTo(xx, waveY);
        else context.lineTo(xx, waveY);
      }
      context.stroke();
    }
  });
}

function drawChevron(context, x, y, size) {
  withClip(context, x, y, size, () => {
    context.strokeStyle = "#000";
    context.lineWidth = Math.max(1, size * 0.07);
    for (let yy = y - size * 0.1; yy < y + size * 1.1; yy += size * 0.28) {
      context.beginPath();
      context.moveTo(x, yy);
      context.lineTo(x + size / 2, yy + size * 0.18);
      context.lineTo(x + size, yy);
      context.stroke();
    }
  });
}

function drawSmallDots(context, x, y, size) {
  withClip(context, x, y, size, () => {
    context.fillStyle = "#000";
    const radius = Math.max(1, size * 0.06);
    for (let yy = y + size * 0.15; yy < y + size; yy += size * 0.28) {
      for (let xx = x + size * 0.15; xx < x + size; xx += size * 0.28) {
        circle(context, xx, yy, radius);
      }
    }
  });
}

function drawNestedSquares(context, x, y, size) {
  withClip(context, x, y, size, () => {
    context.strokeStyle = "#000";
    context.lineWidth = Math.max(1, size * 0.06);
    for (let i = 0; i < 3; i++) {
      const inset = size * (0.12 + i * 0.14);
      context.strokeRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
    }
  });
}

function drawThinGrid(context, x, y, size) {
  withClip(context, x, y, size, () => {
    context.strokeStyle = "#000";
    context.lineWidth = Math.max(1, size * 0.035);
    for (let i = 0; i <= size; i += size / 4) {
      line(context, x + i, y, x + i, y + size);
      line(context, x, y + i, x + size, y + i);
    }
  });
}

function drawSparseDots(context, x, y, size) {
  withClip(context, x, y, size, () => {
    context.fillStyle = "#000";
    circle(context, x + size * 0.28, y + size * 0.28, Math.max(1, size * 0.055));
    circle(context, x + size * 0.72, y + size * 0.72, Math.max(1, size * 0.055));
  });
}

function circle(context, x, y, radius) {
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

function line(context, x1, y1, x2, y2) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
}

function loadFile(file) {
  if (!file) return;

  const image = new Image();
  image.onload = () => {
    sourceImage = image;
    URL.revokeObjectURL(image.src);
    renderPatternImage();
  };
  image.src = URL.createObjectURL(file);
}

function exportPatternCanvas() {
  const link = document.createElement("a");
  link.download = "pattern-image-test.png";
  link.href = patternCanvas.toDataURL("image/png");
  link.click();
}

fileInput.addEventListener("change", (event) => loadFile(event.target.files[0]));
patternControls.exportButton.addEventListener("click", exportPatternCanvas);

Object.values(patternControls).forEach((control) => {
  if (control instanceof HTMLInputElement) {
    control.addEventListener("input", renderPatternImage);
  }
});

window.addEventListener("resize", () => {
  cancelAnimationFrame(textResizeFrame);
  if (!dateOnePanel.hidden && !textPanel.hidden) {
    textResizeFrame = requestAnimationFrame(resizeAndRenderTextMap);
  }
  if (!dateOnePanel.hidden && !typePanel.hidden) requestAnimationFrame(() => rebuildTypePhysics(typeSystemOne));
  if (!dateOnePanel.hidden && !type2Panel.hidden) requestAnimationFrame(() => rebuildTypePhysics(typeSystemTwo));
  if (!dateTwoPanel.hidden && !gridTextPanel.hidden) requestAnimationFrame(resizeGridTextCanvas);
  if (!dateTwoPanel.hidden && !gridText2Panel.hidden) requestAnimationFrame(resizeGridText2Canvas);
  if (!dateTwoPanel.hidden && !gridText3Panel.hidden) requestAnimationFrame(resizeGridText3Canvas);
  if (!dateTwoPanel.hidden && !gridText4Panel.hidden) requestAnimationFrame(resizeGridText4Canvas);
  if (!dateThreePanel.hidden && !gridText5Panel.hidden) requestAnimationFrame(resizeGridText5Canvas);
  if (!dateThreePanel.hidden && !gridText6Panel.hidden) {
    requestAnimationFrame(resizeGridText6Canvas);
    requestAnimationFrame(resizeGridText6WaveCanvas);
  }
  if (!dateThreePanel.hidden && !typeIdentityPanel.hidden) requestAnimationFrame(resizeTypeIdentityCanvas);
  if (!dateFourPanel.hidden && !orbitTypePanel.hidden) requestAnimationFrame(resizeOrbitTypeCanvas);
});

drawPatternPlaceholder();

function createTypePhysicsSystem({ panel, canvas, controls, forceMode }) {
  if (!panel || !canvas || !controls.form) return null;

  const outlineCanvas = document.createElement("canvas");
  return {
    panel,
    canvas,
    controls,
    forceMode,
    ctx: canvas.getContext("2d"),
    outlineCanvas,
    outlineCtx: outlineCanvas.getContext("2d", { willReadFrequently: true }),
    particles: [],
    links: [],
    animationFrame: 0,
    running: false,
    pixelRatio: 1,
    startTime: performance.now(),
    fieldSettings: null,
    sourceImage: null,
    sourceImageName: "",
    mouse: { x: 0, y: 0, active: false },
  };
}

function startTypePhysics(system) {
  if (!system) return;
  rebuildTypePhysics(system);
  if (system.running) return;
  system.running = true;
  system.startTime = performance.now();
  system.animationFrame = requestAnimationFrame(() => stepTypePhysics(system));
}

function stopTypePhysics(system) {
  if (!system) return;
  system.running = false;
  cancelAnimationFrame(system.animationFrame);
}

function rebuildTypePhysics(system) {
  if (!system) return;
  resizeTypeCanvas(system);
  const samples = sampleTypeOutline(system);
  buildTypeParticles(system, samples);
  drawTypePhysics(system);
}

function resizeTypeCanvas(system) {
  const size = getConfiguredCanvasSize(system.canvas, 420, 360);
  system.pixelRatio = size.pixelRatio;
  const { width, height } = size;

  if (system.canvas.width !== width || system.canvas.height !== height) {
    system.canvas.width = width;
    system.canvas.height = height;
  }
}

function sampleTypeOutline(system) {
  const width = system.canvas.width;
  const height = system.canvas.height;
  const controls = system.controls;
  const text = (controls.text.value || "TYPE").slice(0, 18).toUpperCase();
  const requestedFontSize = readRangeValue(controls.size, 118) * system.pixelRatio;
  const outlineWidth = readRangeValue(controls.outline, 7) * system.pixelRatio;
  const gridRepeat = controls.gridRepeat.checked;
  const textMode = controls.textMode.value;
  const sourceMode = controls.sourceMode ? controls.sourceMode.value : "text";
  const fitWidth = width * (gridRepeat ? 0.42 : 0.82);
  const fitHeight = height * (gridRepeat ? 0.24 : sourceMode === "image" ? 0.56 : 0.34);
  const requestedPointCount = readRangeValue(controls.pointAmount, 900);
  const maxSamples = requestedPointCount;

  system.outlineCanvas.width = width;
  system.outlineCanvas.height = height;
  system.outlineCtx.clearRect(0, 0, width, height);
  if (sourceMode === "image") {
    if (!system.sourceImage) {
      const empty = [];
      empty.linkRadius = 18 * system.pixelRatio;
      return empty;
    }
    drawSourceImageMask(system, fitWidth, fitHeight, requestedFontSize);
  } else {
    system.outlineCtx.font = `700 ${requestedFontSize}px Helvetica, Arial, sans-serif`;
    const metrics = system.outlineCtx.measureText(text);
    const measuredWidth = Math.max(
      (metrics.actualBoundingBoxLeft || 0) + (metrics.actualBoundingBoxRight || 0),
      metrics.width,
      1
    );
    const measuredHeight = Math.max(
      (metrics.actualBoundingBoxAscent || 0) + (metrics.actualBoundingBoxDescent || 0),
      requestedFontSize * 0.72
    );
    const fitScale = Math.min(1, fitWidth / measuredWidth, fitHeight / measuredHeight);
    const fontSize = Math.max(24 * system.pixelRatio, requestedFontSize * fitScale);

    system.outlineCtx.save();
    system.outlineCtx.translate(width / 2, height / 2);
    system.outlineCtx.font = `700 ${fontSize}px Helvetica, Arial, sans-serif`;
    system.outlineCtx.textAlign = "center";
    system.outlineCtx.textBaseline = "middle";
    system.outlineCtx.lineJoin = "round";
    system.outlineCtx.lineCap = "round";
    system.outlineCtx.lineWidth = Math.max(1, outlineWidth);
    system.outlineCtx.strokeStyle = "#fff";
    system.outlineCtx.fillStyle = "#fff";

    if (textMode === "stroke") {
      system.outlineCtx.strokeText(text, 0, 0);
    } else {
      system.outlineCtx.fillText(text, 0, 0);
    }

    system.outlineCtx.restore();
  }

  const image = system.outlineCtx.getImageData(0, 0, width, height);
  if (sourceMode === "image") {
    thresholdSourceImageMask(system, image);
  }

  if (textMode === "stroke") {
    return sampleStrokeContour(image, maxSamples, system.pixelRatio);
  }

  return sampleFillMask(image, maxSamples, system.pixelRatio);
}

function drawSourceImageMask(system, fitWidth, fitHeight, requestedSize) {
  const image = system.sourceImage;
  const width = system.canvas.width;
  const height = system.canvas.height;
  const imageSize = getSourceImageSize(image);
  const sourceScale = clamp(requestedSize / (124 * system.pixelRatio), 0.3, 1.8);
  const fitScale = Math.min(fitWidth / imageSize.width, fitHeight / imageSize.height) * sourceScale;
  const drawWidth = Math.max(1, imageSize.width * fitScale);
  const drawHeight = Math.max(1, imageSize.height * fitScale);
  const x = width / 2 - drawWidth / 2;
  const y = height / 2 - drawHeight / 2;

  system.outlineCtx.save();
  system.outlineCtx.imageSmoothingEnabled = true;
  system.outlineCtx.imageSmoothingQuality = "high";
  system.outlineCtx.drawImage(image, x, y, drawWidth, drawHeight);
  system.outlineCtx.restore();
}

function getSourceImageSize(image) {
  return {
    width: Math.max(1, image.naturalWidth || image.videoWidth || image.width || 1),
    height: Math.max(1, image.naturalHeight || image.videoHeight || image.height || 1),
  };
}

function thresholdSourceImageMask(system, image) {
  const threshold = (readRangeValue(system.controls.imageThreshold, 58) / 100) * 255;
  const invert = system.controls.imageInvert.checked;
  const data = image.data;

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    const luminance = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722;
    const active = alpha > 0.05 && (invert ? luminance >= threshold : luminance <= threshold);
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    data[i + 3] = active ? 255 : 0;
  }
}

function sampleFillMask(image, maxSamples, pixelRatio) {
  const width = image.width;
  const height = image.height;
  const mask = getMaskBoundsAndArea(image, pixelRatio);
  const samples = [];

  if (!mask) {
    samples.linkRadius = 18 * pixelRatio;
    return samples;
  }

  const targetSpacing = Math.max(2 * pixelRatio, Math.sqrt(mask.area / Math.max(maxSamples, 1)));
  const maxAttempts = maxSamples * 90;
  let attempt = 1;

  while (samples.length < maxSamples && attempt < maxAttempts) {
    const x = mask.minX + halton(attempt, 2) * (mask.maxX - mask.minX || 1);
    const y = mask.minY + halton(attempt, 3) * (mask.maxY - mask.minY || 1);
    if (alphaAt(image, x, y) > 48) {
      samples.push({
        x,
        y,
        nx: (x - width / 2) / width,
        ny: (y - height / 2) / height,
        gx: Math.round(x / targetSpacing),
        gy: Math.round(y / targetSpacing),
      });
    }
    attempt++;
  }

  samples.linkRadius = targetSpacing * 2.1;
  return samples;
}

function getMaskBoundsAndArea(image, pixelRatio) {
  const width = image.width;
  const height = image.height;
  const step = Math.max(1, Math.round(pixelRatio * 2));
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let count = 0;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (alphaAt(image, x, y) <= 48) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      count++;
    }
  }

  if (!count) return null;

  return {
    minX,
    minY,
    maxX,
    maxY,
    area: count * step * step,
  };
}

function halton(index, base) {
  let result = 0;
  let fraction = 1 / base;
  let value = index;

  while (value > 0) {
    result += fraction * (value % base);
    value = Math.floor(value / base);
    fraction /= base;
  }

  return result;
}

function sampleStrokeContour(image, maxSamples, pixelRatio) {
  const width = image.width;
  const height = image.height;
  const step = Math.max(2, Math.round(pixelRatio * 2));
  const segments = traceMaskSegments(image, step);
  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);

  if (!segments.length || totalLength <= 0) {
    const empty = [];
    empty.linkRadius = 18 * pixelRatio;
    return empty;
  }

  const samples = [];
  let segmentIndex = 0;
  let consumed = 0;

  for (let i = 0; i < maxSamples; i++) {
    const target = ((i + 0.5) / maxSamples) * totalLength;
    while (
      segmentIndex < segments.length - 1 &&
      consumed + segments[segmentIndex].length < target
    ) {
      consumed += segments[segmentIndex].length;
      segmentIndex++;
    }

    const segment = segments[segmentIndex];
    const t = clamp((target - consumed) / Math.max(segment.length, 1), 0, 1);
    const x = mix(segment.x1, segment.x2, t);
    const y = mix(segment.y1, segment.y2, t);
    samples.push({
      x,
      y,
      nx: (x - width / 2) / width,
      ny: (y - height / 2) / height,
      gx: Math.round(x / step),
      gy: Math.round(y / step),
    });
  }

  samples.linkRadius = Math.max(8 * pixelRatio, (totalLength / maxSamples) * 2.4);
  return samples;
}

function traceMaskSegments(image, step) {
  const width = image.width;
  const height = image.height;
  const segments = [];
  const threshold = 42;

  for (let y = 0; y < height - step; y += step) {
    for (let x = 0; x < width - step; x += step) {
      const tl = alphaAt(image, x, y) > threshold;
      const tr = alphaAt(image, x + step, y) > threshold;
      const br = alphaAt(image, x + step, y + step) > threshold;
      const bl = alphaAt(image, x, y + step) > threshold;
      const index = (tl ? 8 : 0) | (tr ? 4 : 0) | (br ? 2 : 0) | (bl ? 1 : 0);
      if (index === 0 || index === 15) continue;

      const points = {
        top: { x: x + step / 2, y },
        right: { x: x + step, y: y + step / 2 },
        bottom: { x: x + step / 2, y: y + step },
        left: { x, y: y + step / 2 },
      };

      getMarchingSegments(index).forEach(([a, b]) => {
        const p1 = points[a];
        const p2 = points[b];
        const length = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        segments.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, length });
      });
    }
  }

  return segments;
}

function getMarchingSegments(index) {
  const table = {
    1: [["left", "bottom"]],
    2: [["bottom", "right"]],
    3: [["left", "right"]],
    4: [["top", "right"]],
    5: [["top", "left"], ["bottom", "right"]],
    6: [["top", "bottom"]],
    7: [["top", "left"]],
    8: [["top", "left"]],
    9: [["top", "bottom"]],
    10: [["top", "right"], ["left", "bottom"]],
    11: [["top", "right"]],
    12: [["left", "right"]],
    13: [["bottom", "right"]],
    14: [["left", "bottom"]],
  };

  return table[index] || [];
}

function alphaAt(image, x, y) {
  const ix = clamp(Math.round(x), 0, image.width - 1);
  const iy = clamp(Math.round(y), 0, image.height - 1);
  return image.data[(iy * image.width + ix) * 4 + 3];
}

function buildTypeParticles(system, samples) {
  system.particles = [];
  system.links = [];

  const controls = system.controls;
  const gridRepeat = controls.gridRepeat.checked;
  const repeatCount = gridRepeat ? 6 : 1;
  const variation = readRangeValue(controls.variation, 44) / 100;
  const centerX = system.canvas.width / 2;
  const centerY = system.canvas.height / 2;
  const sampleLinks = buildSampleLinks(samples, samples.linkRadius || 18 * system.pixelRatio);

  const cells = gridRepeat
    ? makeTypeRepeatCells(
      system.canvas.width,
      system.canvas.height,
      readRangeValue(controls.repeatCropX, 0) / 100,
      readRangeValue(controls.repeatCropY, 0) / 100
    )
    : [{ x: centerX, y: centerY, width: system.canvas.width, height: system.canvas.height }];

  for (let repeat = 0; repeat < repeatCount; repeat++) {
    const cell = cells[repeat % cells.length];
    const repeatAngle = gridRepeat ? (repeat - 2.5) * 0.035 * variation : 0;
    const driftX = gridRepeat ? Math.sin(repeat * 2.17) * cell.width * 0.035 * variation : 0;
    const driftY = gridRepeat ? Math.cos(repeat * 1.91) * cell.height * 0.035 * variation : 0;
    const scale = gridRepeat ? 0.9 + ((repeat % 3) - 1) * 0.035 * variation : 1;
    const startIndex = system.particles.length;

    samples.forEach((sample) => {
      const dx = sample.nx * cell.width * scale;
      const dy = sample.ny * cell.height * scale;
      const rotatedX = dx * Math.cos(repeatAngle) - dy * Math.sin(repeatAngle);
      const rotatedY = dx * Math.sin(repeatAngle) + dy * Math.cos(repeatAngle);
      const homeX = cell.x + rotatedX + driftX;
      const homeY = cell.y + rotatedY + driftY;
      system.particles.push({
        x: homeX + (Math.random() - 0.5) * 22 * variation,
        y: homeY - system.canvas.height * 0.08 - Math.random() * 24,
        homeX,
        homeY,
        vx: (Math.random() - 0.5) * 1.2,
        vy: Math.random() * -1.2,
        gx: sample.gx,
        gy: sample.gy,
        mass: 0.85 + Math.random() * 0.5,
        opacitySeed: Math.random(),
        repeat,
        minX: cell.x - cell.width * 0.48,
        maxX: cell.x + cell.width * 0.48,
        floor: gridRepeat ? cell.y + cell.height * 0.4 : system.canvas.height - 28 * system.pixelRatio,
      });
    });

    sampleLinks.forEach((link) => {
      const aIndex = startIndex + link.a;
      const bIndex = startIndex + link.b;
      const a = system.particles[aIndex];
      const b = system.particles[bIndex];
      if (!a || !b) return;
      const rest = Math.hypot(a.homeX - b.homeX, a.homeY - b.homeY);
      system.links.push({ a: aIndex, b: bIndex, rest });
    });
  }
}

function buildSampleLinks(samples, radius) {
  const buckets = new Map();
  const links = [];
  const linkCounts = new Array(samples.length).fill(0);
  const cellSize = Math.max(radius, 1);

  samples.forEach((sample, index) => {
    const bx = Math.floor(sample.x / cellSize);
    const by = Math.floor(sample.y / cellSize);
    const key = `${bx},${by}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(index);
  });

  samples.forEach((sample, index) => {
    const bx = Math.floor(sample.x / cellSize);
    const by = Math.floor(sample.y / cellSize);
    const candidates = [];

    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        const bucket = buckets.get(`${bx + ox},${by + oy}`);
        if (!bucket) continue;
        bucket.forEach((otherIndex) => {
          if (otherIndex <= index) return;
          const other = samples[otherIndex];
          const distance = Math.hypot(other.x - sample.x, other.y - sample.y);
          if (distance > 0 && distance <= radius) {
            candidates.push({ otherIndex, distance });
          }
        });
      }
    }

    candidates
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .forEach(({ otherIndex }) => {
        if (linkCounts[index] >= 5 || linkCounts[otherIndex] >= 5) return;
        links.push({ a: index, b: otherIndex });
        linkCounts[index]++;
        linkCounts[otherIndex]++;
      });
  });

  return links;
}

function makeTypeRepeatCells(width, height, cropX = 0, cropY = 0) {
  const columns = 3;
  const rows = 2;
  const insetX = width * clamp(cropX, 0, 0.45);
  const insetY = height * clamp(cropY, 0, 0.45);
  const repeatWidth = Math.max(width - insetX * 2, width * 0.1);
  const repeatHeight = Math.max(height - insetY * 2, height * 0.1);
  const cellWidth = repeatWidth / columns;
  const cellHeight = repeatHeight / rows;
  const cells = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      cells.push({
        x: insetX + cellWidth * (col + 0.5),
        y: insetY + cellHeight * (row + 0.5),
        width: cellWidth * 0.9,
        height: cellHeight * 0.82,
      });
    }
  }

  return cells;
}

function stepTypePhysics(system) {
  if (!system.running) return;

  const controls = system.controls;
  const elapsed = (performance.now() - system.startTime) / 1000;
  const gravity = readRangeValue(controls.gravity, 48) / 100;
  const sturdy = readRangeValue(controls.sturdy, 58) / 100;
  const spring = readRangeValue(controls.spring, 58) / 100;
  const home = readRangeValue(controls.home, 52) / 100;
  const bounce = readRangeValue(controls.bounce, 42) / 100;
  const drag = readRangeValue(controls.drag, 18) / 100;
  const floorFriction = readRangeValue(controls.floorFriction, 36) / 100;
  const massControl = Math.max(0.2, readRangeValue(controls.mass, 86) / 100);
  const mouseForce = readRangeValue(controls.mouseForce, 0) / 100;
  const mouseRadius = readRangeValue(controls.mouseRadius, 120) * system.pixelRatio;
  const solverSteps = Math.max(1, readRangeValue(controls.solverSteps, 3));
  const homeStrength = (0.0008 + home * 0.024) * (0.45 + sturdy);
  const springStrength = (0.01 + spring * 0.12) * (0.55 + sturdy * 0.85);
  const damping = 0.998 - drag * 0.075;
  const maxVelocity = (18 + sturdy * 18) * system.pixelRatio;
  const fieldSettings = system.forceMode === "gradient" ? getGradientFieldSettings(system, elapsed) : null;
  system.fieldSettings = fieldSettings;

  for (let step = 0; step < solverSteps; step++) {
    const stepScale = 1 / solverSteps;

    system.particles.forEach((particle) => {
      const mass = particle.mass * massControl;
      particle.vy += gravity * 0.5 * mass * stepScale;
      particle.vx += (particle.homeX - particle.x) * homeStrength * stepScale;
      particle.vy += (particle.homeY - particle.y) * homeStrength * (0.35 + sturdy * 0.7) * stepScale;

      if (system.forceMode === "mouse" && controls.mouseEnabled.checked && system.mouse.active) {
        const dx = particle.x - system.mouse.x;
        const dy = particle.y - system.mouse.y;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance < mouseRadius) {
          const pressure = Math.pow(1 - distance / mouseRadius, 2) * mouseForce * 3.6 * stepScale;
          particle.vx += (dx / distance) * pressure / Math.max(mass, 0.2);
          particle.vy += (dy / distance) * pressure / Math.max(mass, 0.2);
        }
      }

      if (system.forceMode === "gradient" && fieldSettings) {
        const fieldForce = sampleGradientForce(particle.x, particle.y, fieldSettings);
        particle.vx += fieldForce.fx * stepScale / Math.max(mass, 0.2);
        particle.vy += fieldForce.fy * stepScale / Math.max(mass, 0.2);
      }
    });

    for (let i = 0; i < system.links.length; i++) {
      const link = system.links[i];
      const a = system.particles[link.a];
      const b = system.particles[link.b];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.hypot(dx, dy) || 1;
      const force = (distance - link.rest) * springStrength * stepScale;
      const fx = (dx / distance) * force;
      const fy = (dy / distance) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    system.particles.forEach((particle) => {
      particle.vx *= damping;
      particle.vy *= damping;
      const speed = Math.hypot(particle.vx, particle.vy);
      if (speed > maxVelocity) {
        particle.vx = (particle.vx / speed) * maxVelocity;
        particle.vy = (particle.vy / speed) * maxVelocity;
      }

      particle.x += particle.vx * stepScale;
      particle.y += particle.vy * stepScale;

      if (particle.y > particle.floor) {
        particle.y = particle.floor;
        particle.vy *= -(0.18 + bounce * 0.72);
        particle.vx *= 1 - (0.04 + floorFriction * 0.32);
      }

      if (particle.x < particle.minX) {
        particle.x = particle.minX;
        particle.vx *= -(0.22 + bounce * 0.58);
      } else if (particle.x > particle.maxX) {
        particle.x = particle.maxX;
        particle.vx *= -(0.22 + bounce * 0.58);
      }
    });
  }

  drawTypePhysics(system);
  system.animationFrame = requestAnimationFrame(() => stepTypePhysics(system));
}

function drawTypePhysics(system) {
  const width = system.canvas.width;
  const height = system.canvas.height;
  const controls = system.controls;
  const particleSize = readRangeValue(controls.pointSize, 6) * system.pixelRatio;
  const shape = controls.shape.value;
  const globalOpacity = readRangeValue(controls.opacity, 82) / 100;
  const opacityVariation = readRangeValue(controls.opacityVariation, 18) / 100;

  system.ctx.clearRect(0, 0, width, height);
  system.ctx.fillStyle = "#050505";
  system.ctx.fillRect(0, 0, width, height);

  if (system.forceMode === "gradient" && controls.gradientOverlay.checked) {
    drawGradientField(system, width, height, system.fieldSettings || getGradientFieldSettings(system, 0));
  }

  drawPhysicsGrid(system, width, height);

  system.ctx.save();
  system.ctx.globalCompositeOperation = "lighter";
  system.ctx.strokeStyle = "rgba(245, 245, 245, 0.72)";
  system.ctx.fillStyle = "rgba(245, 245, 245, 0.82)";
  system.ctx.lineWidth = Math.max(1, particleSize * 0.18);

  if (shape === "line") {
    system.links.forEach((link) => {
      const a = system.particles[link.a];
      const b = system.particles[link.b];
      const stretch = Math.abs(Math.hypot(b.x - a.x, b.y - a.y) - link.rest) / Math.max(link.rest, 1);
      if (stretch > 1.8) return;
      system.ctx.globalAlpha = getTypeParticleOpacity(a, globalOpacity, opacityVariation);
      system.ctx.beginPath();
      system.ctx.moveTo(a.x, a.y);
      system.ctx.lineTo(b.x, b.y);
      system.ctx.stroke();
    });
  } else {
    system.particles.forEach((particle) => {
      const flicker = 0.78 + ((particle.gx * 17 + particle.gy * 31 + particle.repeat * 13) % 23) / 100;
      system.ctx.globalAlpha = flicker * getTypeParticleOpacity(particle, globalOpacity, opacityVariation);
      if (shape === "square") {
        system.ctx.fillRect(
          particle.x - particleSize / 2,
          particle.y - particleSize / 2,
          particleSize,
          particleSize
        );
      } else {
        system.ctx.beginPath();
        system.ctx.arc(particle.x, particle.y, particleSize * 0.48, 0, Math.PI * 2);
        system.ctx.fill();
      }
    });
  }
  system.ctx.restore();

  if (system.forceMode === "mouse" && controls.mouseEnabled.checked && system.mouse.active) {
    system.ctx.save();
    system.ctx.strokeStyle = "rgba(245, 245, 245, 0.2)";
    system.ctx.lineWidth = 1 * system.pixelRatio;
    system.ctx.beginPath();
    system.ctx.arc(system.mouse.x, system.mouse.y, readRangeValue(controls.mouseRadius, 120) * system.pixelRatio, 0, Math.PI * 2);
    system.ctx.stroke();
    system.ctx.restore();
  }
}

function getTypeParticleOpacity(particle, globalOpacity, opacityVariation) {
  const offset = (particle.opacitySeed * 2 - 1) * opacityVariation;
  return clamp(globalOpacity + offset, 0.03, 1);
}

function drawPhysicsGrid(system, width, height) {
  system.ctx.save();
  if (system.controls.gridRepeat.checked) {
    const cropX = readRangeValue(system.controls.repeatCropX, 0) / 100;
    const cropY = readRangeValue(system.controls.repeatCropY, 0) / 100;
    const insetX = width * clamp(cropX, 0, 0.45);
    const insetY = height * clamp(cropY, 0, 0.45);
    const repeatWidth = Math.max(width - insetX * 2, width * 0.1);
    const repeatHeight = Math.max(height - insetY * 2, height * 0.1);
    system.ctx.strokeStyle = "rgba(255, 255, 255, 0.13)";
    system.ctx.lineWidth = 1 * system.pixelRatio;
    system.ctx.strokeRect(insetX, insetY, repeatWidth, repeatHeight);
    for (let col = 1; col < 3; col++) {
      const x = insetX + (repeatWidth / 3) * col;
      system.ctx.beginPath();
      system.ctx.moveTo(x, insetY);
      system.ctx.lineTo(x, insetY + repeatHeight);
      system.ctx.stroke();
    }
    const y = insetY + repeatHeight / 2;
    system.ctx.beginPath();
    system.ctx.moveTo(insetX, y);
    system.ctx.lineTo(insetX + repeatWidth, y);
    system.ctx.stroke();
  }

  system.ctx.restore();
}

function getGradientFieldSettings(system, elapsed) {
  const controls = system.controls;
  const width = system.canvas.width;
  const height = system.canvas.height;
  const shortSide = Math.min(width, height);
  const mode = controls.gradientMode.value;
  const speed = readRangeValue(controls.gradientSpeed, 76) / 100;
  const drift = readRangeValue(controls.gradientDrift, 42) / 100;
  const baseAngle = (readRangeValue(controls.gradientRotation, 32) * Math.PI) / 180;
  const angle = mode === "conic" ? baseAngle + elapsed * speed * 0.36 : baseAngle;
  const travel = Math.sin(elapsed * mix(0.35, 2.25, speed)) * shortSide * 0.42 * drift;
  const sideDrift = Math.sin(elapsed * mix(0.22, 1.4, speed) + 1.7) * shortSide * 0.12 * drift;
  let cx = width / 2 + Math.cos(baseAngle) * travel - Math.sin(baseAngle) * sideDrift;
  let cy = height / 2 + Math.sin(baseAngle) * travel + Math.cos(baseAngle) * sideDrift;

  if (mode !== "linear") {
    cx = width / 2 + Math.cos(elapsed * speed * 0.9 + 0.4) * width * 0.24 * drift;
    cy = height / 2 + Math.sin(elapsed * speed * 0.73 + 1.2) * height * 0.24 * drift;
  }

  return {
    mode,
    action: controls.gradientAction.value,
    width,
    height,
    pixelRatio: system.pixelRatio,
    cx,
    cy,
    angle,
    phase: elapsed * speed * 0.32,
    strength: readRangeValue(controls.gradientStrength, 28) / 100,
    scale: shortSide * mix(0.18, 1.28, readRangeValue(controls.gradientScale, 96) / 180),
    contrast: readRangeValue(controls.gradientContrast, 56) / 100,
    softness: readRangeValue(controls.gradientSoftness, 50) / 100,
    bands: readRangeValue(controls.gradientBands, 3),
    turbulence: readRangeValue(controls.gradientTurbulence, 16) / 100,
  };
}

function gradientIntensityAt(x, y, field) {
  const dx = x - field.cx;
  const dy = y - field.cy;
  let raw = 0;

  if (field.mode === "radial") {
    const radius = Math.hypot(dx, dy) / Math.max(field.scale, 1);
    raw = 0.5 + 0.5 * Math.cos((radius - field.phase) * Math.PI * 2 * field.bands);
  } else if (field.mode === "conic") {
    const theta = Math.atan2(dy, dx) + field.angle + field.phase * Math.PI * 2;
    raw = 0.5 + 0.5 * Math.cos(theta * field.bands);
  } else {
    const axisX = Math.cos(field.angle);
    const axisY = Math.sin(field.angle);
    const position = (dx * axisX + dy * axisY) / Math.max(field.scale, 1);
    raw = 0.5 + 0.5 * Math.cos((position - field.phase) * Math.PI * 2 * field.bands);
  }

  const noise = (pseudoNoise(x * 0.012 + field.phase * 79, y * 0.012 - field.phase * 53) - 0.5) * field.turbulence * 0.28;
  const softness = mix(0.06, 0.44, field.softness);
  const softened = smoothstep(0.5 - softness, 0.5 + softness, raw + noise);
  return clamp((softened - 0.5) * (1 + field.contrast * 2.6) + 0.5, 0, 1);
}

function sampleGradientForce(x, y, field) {
  const delta = Math.max(2, 5 * field.pixelRatio);
  const intensity = gradientIntensityAt(x, y, field);
  const gx = (gradientIntensityAt(x + delta, y, field) - gradientIntensityAt(x - delta, y, field)) / (delta * 2);
  const gy = (gradientIntensityAt(x, y + delta, field) - gradientIntensityAt(x, y - delta, field)) / (delta * 2);
  let fx = gx;
  let fy = gy;
  let magnitude = Math.hypot(fx, fy);

  if (magnitude < 0.0001) {
    if (field.mode === "radial") {
      fx = x - field.cx;
      fy = y - field.cy;
    } else {
      fx = Math.cos(field.angle);
      fy = Math.sin(field.angle);
    }
    magnitude = Math.hypot(fx, fy) || 1;
  }

  fx /= magnitude;
  fy /= magnitude;

  if (field.action === "away") {
    fx *= -1;
    fy *= -1;
  } else if (field.action === "orbit") {
    const orbitX = -fy;
    fy = fx;
    fx = orbitX;
  }

  const pressure = intensity * field.strength * field.pixelRatio * 4.8;
  return { fx: fx * pressure, fy: fy * pressure };
}

function drawGradientField(system, width, height, field) {
  const tile = Math.max(8 * system.pixelRatio, Math.round(Math.min(width, height) / 72));

  system.ctx.save();
  system.ctx.globalCompositeOperation = "screen";
  for (let y = 0; y < height; y += tile) {
    for (let x = 0; x < width; x += tile) {
      const intensity = gradientIntensityAt(x + tile / 2, y + tile / 2, field);
      system.ctx.fillStyle = `rgba(245, 245, 245, ${0.015 + intensity * 0.13})`;
      system.ctx.fillRect(x, y, tile + 1, tile + 1);
    }
  }

  system.ctx.globalCompositeOperation = "lighter";
  system.ctx.strokeStyle = "rgba(245, 245, 245, 0.28)";
  system.ctx.lineWidth = 1 * system.pixelRatio;
  system.ctx.beginPath();
  system.ctx.arc(field.cx, field.cy, Math.max(8, field.scale * 0.08), 0, Math.PI * 2);
  system.ctx.stroke();
  system.ctx.restore();
}

function readRangeValue(control, fallback) {
  if (!control) return fallback;
  const value = Number(control.value);
  return Number.isFinite(value) ? value : fallback;
}

function updateTypeMouse(system, event) {
  const rect = system.canvas.getBoundingClientRect();
  system.mouse.x = (event.clientX - rect.left) * system.pixelRatio;
  system.mouse.y = (event.clientY - rect.top) * system.pixelRatio;
  system.mouse.active = true;
}

function bindTypePhysicsSystem(system) {
  if (!system) return;

  const controls = system.controls;
  controls.form.addEventListener("submit", (event) => event.preventDefault());
  controls.reset.addEventListener("click", () => rebuildTypePhysics(system));
  bindSourceModeControls(system);
  if (controls.imageFile) {
    controls.imageFile.addEventListener("click", () => {
      controls.imageFile.value = "";
    });
    controls.imageFile.addEventListener("change", (event) => loadTypeSourceImage(system, event.target.files[0]));
  }

  [
    controls.text,
    controls.size,
    controls.outline,
    controls.pointAmount,
    controls.textMode,
    controls.sourceMode,
    controls.imageThreshold,
    controls.imageInvert,
    controls.gridRepeat,
    controls.repeatCropX,
    controls.repeatCropY,
    controls.variation,
  ].filter(Boolean).forEach((control) => {
    control.addEventListener("input", () => rebuildTypePhysics(system));
    control.addEventListener("change", () => rebuildTypePhysics(system));
  });

  [
    controls.shape,
    controls.pointSize,
    controls.opacity,
    controls.opacityVariation,
    controls.gradientOverlay,
  ].filter(Boolean).forEach((control) => {
    control.addEventListener("input", () => drawTypePhysics(system));
  });

  if (system.forceMode === "mouse") {
    system.canvas.addEventListener("pointermove", (event) => updateTypeMouse(system, event));
    system.canvas.addEventListener("pointerenter", (event) => updateTypeMouse(system, event));
    system.canvas.addEventListener("pointerleave", () => {
      system.mouse.active = false;
    });
  }
}

function bindSourceModeControls(system) {
  const buttons = Array.from(system.controls.form.querySelectorAll(".physics-source-button"));
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      setTypeSourceMode(system, button.dataset.sourceValue || "text", true);
    });
  });

  if (system.controls.sourceMode) {
    system.controls.sourceMode.addEventListener("change", () => {
      setTypeSourceMode(system, system.controls.sourceMode.value, true);
    });
  }

  setTypeSourceMode(system, system.controls.sourceMode ? system.controls.sourceMode.value : "text", false);
}

function setTypeSourceMode(system, mode, shouldRebuild) {
  const nextMode = mode === "image" ? "image" : "text";
  if (system.controls.sourceMode) system.controls.sourceMode.value = nextMode;
  system.controls.form.classList.toggle("is-image-source", nextMode === "image");

  system.controls.form.querySelectorAll(".physics-source-button").forEach((button) => {
    const isActive = button.dataset.sourceValue === nextMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  updateTypeImageFileLabel(system, system.sourceImageName);
  if (shouldRebuild) rebuildTypePhysics(system);
}

async function loadTypeSourceImage(system, file) {
  if (!file) return;

  updateTypeImageFileLabel(system, "Loading image...");

  try {
    const image = await decodeTypeSourceImage(file);
    releaseTypeSourceImage(system);
    system.sourceImage = image;
    system.sourceImageName = file.name;
    setTypeSourceMode(system, "image", false);
    if (system.controls.textMode) system.controls.textMode.value = "fill";
    updateTypeImageFileLabel(system, file.name);
    rebuildTypePhysics(system);
  } catch (error) {
    console.error("Could not load source image", error);
    updateTypeImageFileLabel(system, "Image failed to load");
  }
}

async function decodeTypeSourceImage(file) {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, {
        imageOrientation: "from-image",
        premultiplyAlpha: "default",
      });
    } catch (error) {
      console.warn("createImageBitmap failed, falling back to HTMLImageElement", error);
    }
  }

  return loadHtmlImageFromFile(file);
}

function loadHtmlImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("Image decode failed"));
    };
    image.src = imageUrl;
  });
}

function releaseTypeSourceImage(system) {
  if (system.sourceImage && typeof system.sourceImage.close === "function") {
    system.sourceImage.close();
  }
  system.sourceImage = null;
}

function updateTypeImageFileLabel(system, fileName) {
  const label = system.controls.imageFile && system.controls.imageFile.closest(".physics-file-field");
  const sourceMode = system.controls.sourceMode ? system.controls.sourceMode.value : "text";
  const status = system.controls.imageStatus;

  if (label) {
    const text = label.querySelector("span");
    if (text) text.textContent = system.sourceImageName ? system.sourceImageName.slice(0, 24) : "Import Image";
  }

  if (status) {
    if (fileName === "Loading image..." || fileName === "Image failed to load") {
      status.textContent = fileName;
    } else if (system.sourceImageName) {
      status.textContent = `Using image: ${system.sourceImageName}`;
    } else if (sourceMode === "image") {
      status.textContent = "Choose an image to replace the text source";
    } else {
      status.textContent = "Text source active";
    }
  }
}

function startGridText() {
  resizeGridTextCanvas();
  if (gridTextRunning) return;
  gridTextRunning = true;
  gridTextStartTime = performance.now();
  gridTextAnimationFrame = requestAnimationFrame(renderGridText);
}

function stopGridText() {
  gridTextRunning = false;
  cancelAnimationFrame(gridTextAnimationFrame);
}

function resizeGridTextCanvas() {
  const size = getConfiguredCanvasSize(gridTextCanvas, 420, 360);
  gridTextPixelRatio = size.pixelRatio;
  const { width, height } = size;

  if (gridTextCanvas.width !== width || gridTextCanvas.height !== height) {
    gridTextCanvas.width = width;
    gridTextCanvas.height = height;
  }

  drawGridTextFrame(performance.now());
}

function renderGridText(timestamp) {
  if (!gridTextRunning) return;
  drawGridTextFrame(timestamp);
  gridTextAnimationFrame = requestAnimationFrame(renderGridText);
}

function drawGridTextFrame(timestamp) {
  const width = gridTextCanvas.width;
  const height = gridTextCanvas.height;
  const text = (gridTextControls.text.value || "TEXT").slice(0, 80);
  const fontSize = readRangeValue(gridTextControls.fontSize, 72) * gridTextPixelRatio;
  const weight = readRangeValue(gridTextControls.weight, 700);
  const letterSpace = readRangeValue(gridTextControls.letterSpace, 0) * gridTextPixelRatio;
  const padding = readRangeValue(gridTextControls.padding, 20) * gridTextPixelRatio;
  const mode = gridTextControls.renderMode.value;
  const repeatX = readRangeValue(gridTextControls.repeatX, 4);
  const repeatY = readRangeValue(gridTextControls.repeatY, 3);
  const gapX = Math.max(0, readRangeValue(gridTextControls.gapX, 10)) * gridTextPixelRatio;
  const gapY = Math.max(0, readRangeValue(gridTextControls.gapY, 10)) * gridTextPixelRatio;
  const opacity = readRangeValue(gridTextControls.opacity, 86) / 100;
  const elapsed = (timestamp - gridTextStartTime) / 1000;
  const speed = readRangeValue(gridTextControls.speed, 76) / 100;
  const delay = readRangeValue(gridTextControls.delay, 58) / 100;
  const waveShape = gridTextControls.waveShape.value;
  const positionAmp = readRangeValue(gridTextControls.position, 42) * gridTextPixelRatio;
  const scaleAmp = readRangeValue(gridTextControls.scale, 24) / 100;
  const rotationAmp = (readRangeValue(gridTextControls.rotation, 32) * Math.PI) / 180;
  const skewAmp = readRangeValue(gridTextControls.skew, 22) / 100;
  const field = getGridTextField(width, height, elapsed, speed);

  gridTextCtx.clearRect(0, 0, width, height);
  gridTextCtx.fillStyle = "#050505";
  gridTextCtx.fillRect(0, 0, width, height);
  gridTextCtx.font = `${weight} ${fontSize}px Helvetica, Arial, sans-serif`;
  gridTextCtx.textAlign = "center";
  gridTextCtx.textBaseline = "middle";
  gridTextCtx.lineJoin = "round";
  gridTextCtx.lineCap = "round";

  const metrics = gridTextCtx.measureText(text);
  const textWidth = Math.max(1, metrics.width + Math.max(0, text.length - 1) * letterSpace);
  const textHeight = Math.max(
    fontSize * 0.72,
    (metrics.actualBoundingBoxAscent || 0) + (metrics.actualBoundingBoxDescent || 0)
  );
  const cellWidth = Math.max(12 * gridTextPixelRatio, textWidth + padding * 2);
  const cellHeight = Math.max(12 * gridTextPixelRatio, textHeight + padding * 2);
  const stepX = cellWidth + gapX;
  const stepY = cellHeight + gapY;
  const centerX = width / 2;
  const centerY = height / 2;

  gridTextCtx.save();
  gridTextCtx.strokeStyle = "rgba(245, 245, 245, 0.16)";
  gridTextCtx.lineWidth = 1 * gridTextPixelRatio;
  gridTextCtx.fillStyle = "rgba(245, 245, 245, 0.92)";

  for (let gy = -repeatY; gy <= repeatY; gy++) {
    for (let gx = -repeatX; gx <= repeatX; gx++) {
      const baseX = centerX + gx * stepX;
      const baseY = centerY + gy * stepY;
      const distance = Math.hypot(gx, gy);
      const localTime = elapsed * mix(0.35, 2.4, speed) - distance * delay;
      const fieldValue = sampleGridTextField(baseX, baseY, localTime, field);
      const centeredField = fieldValue * 2 - 1;
      const transformValue = getGridTextWaveValue(waveShape, localTime, centeredField, fieldValue);
      const offsetX = Math.cos(field.angle) * transformValue * positionAmp;
      const offsetY = Math.sin(field.angle) * transformValue * positionAmp;
      const scale = Math.max(0.08, 1 + transformValue * scaleAmp);
      const rotation = transformValue * rotationAmp;
      const skew = transformValue * skewAmp;

      gridTextCtx.save();
      gridTextCtx.beginPath();
      gridTextCtx.rect(baseX - cellWidth / 2, baseY - cellHeight / 2, cellWidth, cellHeight);
      if (gridTextControls.showBoxes.checked) {
        gridTextCtx.stroke();
      }
      gridTextCtx.clip();
      gridTextCtx.translate(baseX + offsetX, baseY + offsetY);
      gridTextCtx.rotate(rotation);
      gridTextCtx.transform(1, skew * 0.45, skew, 1, 0, 0);
      gridTextCtx.scale(scale, scale);
      gridTextCtx.globalAlpha = clamp(opacity * (0.72 + fieldValue * 0.4), 0.04, 1);
      drawGridTextString(text, letterSpace, mode, fontSize);
      gridTextCtx.restore();
    }
  }

  gridTextCtx.restore();
}

function getGridTextWaveValue(shape, time, centeredField, fieldValue) {
  const phase = time + centeredField * 0.5;

  if (shape === "triangle") {
    const cycle = positiveModulo(phase, 1);
    const ramp = 1 - Math.abs(cycle * 2 - 1);
    return ramp * (0.72 + fieldValue * 0.28);
  }

  if (shape === "saw") {
    const ramp = positiveModulo(phase, 1);
    return ramp * (0.72 + fieldValue * 0.28);
  }

  const wave = Math.sin(time * Math.PI * 2 + centeredField * Math.PI);
  return wave * 0.58 + centeredField * 0.42;
}

function positiveModulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function getGridTextField(width, height, elapsed, speed) {
  const angle = (readRangeValue(gridTextControls.fieldAngle, 45) * Math.PI) / 180;
  const drift = readRangeValue(gridTextControls.fieldDrift, 40) / 100;
  const shortSide = Math.min(width, height);
  return {
    mode: gridTextControls.fieldMode.value,
    angle,
    cx: width / 2 + Math.cos(elapsed * speed * 0.7) * shortSide * 0.25 * drift,
    cy: height / 2 + Math.sin(elapsed * speed * 0.58 + 1.3) * shortSide * 0.25 * drift,
    scale: shortSide * mix(0.18, 1.8, readRangeValue(gridTextControls.fieldScale, 100) / 220),
    density: readRangeValue(gridTextControls.waveDensity, 4),
  };
}

function sampleGridTextField(x, y, time, field) {
  const dx = x - field.cx;
  const dy = y - field.cy;
  let raw = 0;

  if (field.mode === "radial") {
    raw = Math.cos((Math.hypot(dx, dy) / Math.max(field.scale, 1)) * Math.PI * 2 * field.density - time);
  } else if (field.mode === "conic") {
    raw = Math.cos((Math.atan2(dy, dx) + field.angle) * field.density - time);
  } else {
    const axisX = Math.cos(field.angle);
    const axisY = Math.sin(field.angle);
    raw = Math.cos(((dx * axisX + dy * axisY) / Math.max(field.scale, 1)) * Math.PI * 2 * field.density - time);
  }

  return raw * 0.5 + 0.5;
}

function drawGridTextString(text, letterSpace, mode, fontSize) {
  gridTextCtx.lineWidth = Math.max(1, fontSize * 0.035);
  gridTextCtx.strokeStyle = "rgba(245, 245, 245, 0.9)";
  gridTextCtx.fillStyle = "#f5f5f5";

  if (Math.abs(letterSpace) < 0.01) {
    if (mode === "stroke" || mode === "both") gridTextCtx.strokeText(text, 0, 0);
    if (mode === "fill" || mode === "both") gridTextCtx.fillText(text, 0, 0);
    return;
  }

  const widths = Array.from(text).map((character) => gridTextCtx.measureText(character).width);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, widths.length - 1) * letterSpace;
  let cursor = -totalWidth / 2;

  Array.from(text).forEach((character, index) => {
    const characterWidth = widths[index];
    const x = cursor + characterWidth / 2;
    if (mode === "stroke" || mode === "both") gridTextCtx.strokeText(character, x, 0);
    if (mode === "fill" || mode === "both") gridTextCtx.fillText(character, x, 0);
    cursor += characterWidth + letterSpace;
  });
}

function bindGridTextControls() {
  if (!gridTextControls.form) return;

  gridTextControls.form.addEventListener("submit", (event) => event.preventDefault());

  Object.values(gridTextControls).forEach((control) => {
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return;
    const redraw = () => {
      if (!dateTwoPanel.hidden && !gridTextPanel.hidden) {
        resizeGridTextCanvas();
      }
    };
    control.addEventListener("input", redraw);
    control.addEventListener("change", redraw);
  });
}

function startGridText2() {
  resizeGridText2Canvas();
  if (gridText2Running) return;
  gridText2Running = true;
  gridText2StartTime = performance.now();
  gridText2AnimationFrame = requestAnimationFrame(renderGridText2);
}

function stopGridText2() {
  gridText2Running = false;
  cancelAnimationFrame(gridText2AnimationFrame);
}

function resizeGridText2Canvas() {
  const size = getConfiguredCanvasSize(gridText2Canvas, 420, 360);
  gridText2PixelRatio = size.pixelRatio;
  const { width, height } = size;

  if (gridText2Canvas.width !== width || gridText2Canvas.height !== height) {
    gridText2Canvas.width = width;
    gridText2Canvas.height = height;
  }

  drawGridText2Frame(performance.now());
}

function renderGridText2(timestamp) {
  if (!gridText2Running) return;
  drawGridText2Frame(timestamp);
  gridText2AnimationFrame = requestAnimationFrame(renderGridText2);
}

function drawGridText2Frame(timestamp) {
  const width = gridText2Canvas.width;
  const height = gridText2Canvas.height;
  const text = (gridText2Controls.text.value || "GRID EDIT 2").slice(0, 120);
  const weight = Math.max(100, readRangeValue(gridText2Controls.weight, 0));
  const fontFamily = gridText2Controls.font.value || "Helvetica, Arial, sans-serif";
  const fontSize = 74 * gridText2PixelRatio;
  const letterSpace = readRangeValue(gridText2Controls.letterSpace, 0) * gridText2PixelRatio;
  const padding = readRangeValue(gridText2Controls.padding, 28) * gridText2PixelRatio;
  const mode = gridText2Controls.renderMode.value;
  const repeatX = readRangeValue(gridText2Controls.repeatX, 7);
  const repeatY = readRangeValue(gridText2Controls.repeatY, 5);
  const marginX = Math.max(0, readRangeValue(gridText2Controls.marginX, 22)) * gridText2PixelRatio;
  const marginY = Math.max(0, readRangeValue(gridText2Controls.marginY, 22)) * gridText2PixelRatio;
  const cropX = readRangeValue(gridText2Controls.cropX, 0) / 100;
  const cropY = readRangeValue(gridText2Controls.cropY, 0) / 100;
  const cropToBox = gridText2Controls.cropToBox.checked;
  const zoomValue = readRangeValue(gridText2Controls.zoom, 0);
  const viewZoom = zoomValue <= 0 ? 1 : Math.max(0.05, zoomValue / 100);
  const opacity = readRangeValue(gridText2Controls.opacity, 100) / 100;
  const elapsed = (timestamp - gridText2StartTime) / 1000;
  const speed = mapGridText2Speed(readRangeValue(gridText2Controls.speed, 0));
  const delayX = readRangeValue(gridText2Controls.delayX, 0) / 100;
  const delayY = readRangeValue(gridText2Controls.delayY, 0) / 100;
  const waveShape = gridText2Controls.waveShape.value;
  const rampCurve = gridText2Controls.rampCurve.value;
  const scaleAmp = readRangeValue(gridText2Controls.scale, 34) / 100;
  const rotationAmp = (readRangeValue(gridText2Controls.rotation, 46) * Math.PI) / 180;
  const skewAmp = readRangeValue(gridText2Controls.skew, 24) / 100;
  const field = getGridText2Field(width, height, elapsed, speed);

  gridText2Ctx.clearRect(0, 0, width, height);
  gridText2Ctx.fillStyle = "#050505";
  gridText2Ctx.fillRect(0, 0, width, height);
  gridText2Ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
  gridText2Ctx.textAlign = "center";
  gridText2Ctx.textBaseline = "alphabetic";
  gridText2Ctx.lineJoin = "round";
  gridText2Ctx.lineCap = "round";

  const metrics = gridText2Ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.74;
  const descent = metrics.actualBoundingBoxDescent || fontSize * 0.22;
  const baselineY = (ascent - descent) / 2;
  const textWidth = Math.max(1, metrics.width + Math.max(0, text.length - 1) * letterSpace);
  const textHeight = Math.max(fontSize * 0.72, ascent + descent);
  const cellWidth = Math.max(12 * gridText2PixelRatio, textWidth + padding * 2);
  const cellHeight = Math.max(12 * gridText2PixelRatio, textHeight + padding * 2);
  const boxWidth = Math.max(2 * gridText2PixelRatio, cellWidth * (1 - cropX * 2));
  const boxHeight = Math.max(2 * gridText2PixelRatio, cellHeight * (1 - cropY * 2));
  const stepX = boxWidth + marginX;
  const stepY = boxHeight + marginY;
  const positionAmp = (readRangeValue(gridText2Controls.position, 0) / 100) * Math.max(boxWidth, boxHeight);
  const centerX = width / 2;
  const centerY = height / 2;
  const visibleLeft = centerX - width / (2 * viewZoom) - cellWidth * 2;
  const visibleRight = centerX + width / (2 * viewZoom) + cellWidth * 2;
  const visibleTop = centerY - height / (2 * viewZoom) - cellHeight * 2;
  const visibleBottom = centerY + height / (2 * viewZoom) + cellHeight * 2;

  gridText2Ctx.save();
  gridText2Ctx.translate(centerX, centerY);
  gridText2Ctx.scale(viewZoom, viewZoom);
  gridText2Ctx.translate(-centerX, -centerY);
  gridText2Ctx.strokeStyle = "rgba(245, 245, 245, 0.14)";
  gridText2Ctx.lineWidth = Math.max(0.6, gridText2PixelRatio / viewZoom);
  gridText2Ctx.fillStyle = "#f5f5f5";

  for (let gy = -repeatY; gy <= repeatY; gy++) {
    for (let gx = -repeatX; gx <= repeatX; gx++) {
      const baseX = centerX + gx * stepX;
      const baseY = centerY + gy * stepY;
      if (baseX < visibleLeft || baseX > visibleRight || baseY < visibleTop || baseY > visibleBottom) {
        continue;
      }

      const localTime = elapsed * speed - gx * delayX - gy * delayY;
      const fieldValue = sampleGridText2Field(baseX, baseY, localTime, field);
      const wave = getGridText2WaveValue(waveShape, localTime, rampCurve);
      const fieldStrength = mix(0.72, 1.08, fieldValue);
      const transformValue = wave.transform * fieldStrength;
      const positionValue = wave.position * fieldStrength;
      const offsetX = Math.cos(field.angle) * positionValue * positionAmp;
      const offsetY = Math.sin(field.angle) * positionValue * positionAmp;
      const scale = Math.max(0.05, 1 + transformValue * scaleAmp);
      const rotation = transformValue * rotationAmp;
      const skew = transformValue * skewAmp;

      if (gridText2Controls.showBoxes.checked) {
        gridText2Ctx.strokeRect(baseX - boxWidth / 2, baseY - boxHeight / 2, boxWidth, boxHeight);
      }

      gridText2Ctx.save();
      if (cropToBox) {
        gridText2Ctx.beginPath();
        gridText2Ctx.rect(baseX - boxWidth / 2, baseY - boxHeight / 2, boxWidth, boxHeight);
        gridText2Ctx.clip();
      }
      gridText2Ctx.translate(baseX + offsetX, baseY + offsetY);
      gridText2Ctx.rotate(rotation);
      gridText2Ctx.transform(1, skew * 0.45, skew, 1, 0, 0);
      gridText2Ctx.scale(scale, scale);

      gridText2Ctx.globalAlpha = clamp(opacity, 0, 1);
      drawGridText2String(text, letterSpace, mode, fontSize, baselineY);
      gridText2Ctx.restore();
    }
  }

  gridText2Ctx.restore();
}

function mapGridText2Speed(value) {
  const t = clamp(value / 100, 0, 1);
  if (t <= 0) return 0;
  return mix(0.015, 4.8, Math.pow(t, 2.35));
}

function getGridText2WaveValue(shape, phase, curve = "linear") {
  const cycle = positiveModulo(phase, 1);

  if (shape === "triangle") {
    const ramp = applyGridText2RampCurve(1 - Math.abs(cycle * 2 - 1), curve);
    return {
      transform: ramp,
      position: ramp * 2 - 1,
    };
  }

  if (shape === "saw") {
    const ramp = applyGridText2RampCurve(cycle, curve);
    return {
      transform: ramp,
      position: ramp * 2 - 1,
    };
  }

  if (shape === "reverse-saw") {
    const ramp = applyGridText2RampCurve(1 - cycle, curve);
    return {
      transform: ramp,
      position: ramp * 2 - 1,
    };
  }

  const sine = Math.sin(phase * Math.PI * 2);
  return {
    transform: sine,
    position: sine,
  };
}

function applyGridText2RampCurve(value, curve) {
  const t = clamp(value, 0, 1);

  if (curve === "smooth") {
    return t * t * (3 - 2 * t);
  }

  if (curve === "ease-in") {
    return t * t;
  }

  if (curve === "ease-out") {
    return 1 - (1 - t) * (1 - t);
  }

  if (curve === "ease-in-out") {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  return t;
}

function getGridText2Field(width, height, elapsed, speed) {
  const angle = (snapGridText2Angle(readRangeValue(gridText2Controls.fieldAngle, 45)) * Math.PI) / 180;
  const drift = readRangeValue(gridText2Controls.fieldDrift, 38) / 100;
  const shortSide = Math.min(width, height);
  return {
    mode: gridText2Controls.fieldMode.value,
    angle,
    cx: width / 2 + Math.cos(elapsed * speed * 0.62) * shortSide * 0.25 * drift,
    cy: height / 2 + Math.sin(elapsed * speed * 0.54 + 1.3) * shortSide * 0.25 * drift,
    scale: shortSide * mix(0.18, 1.9, readRangeValue(gridText2Controls.fieldScale, 110) / 240),
    density: readRangeValue(gridText2Controls.waveDensity, 4),
  };
}

function sampleGridText2Field(x, y, time, field) {
  const dx = x - field.cx;
  const dy = y - field.cy;
  let raw = 0;

  if (field.mode === "radial") {
    raw = Math.cos((Math.hypot(dx, dy) / Math.max(field.scale, 1)) * Math.PI * 2 * field.density - time * Math.PI * 2);
  } else if (field.mode === "conic") {
    raw = Math.cos((Math.atan2(dy, dx) + field.angle) * field.density - time * Math.PI * 2);
  } else {
    const axisX = Math.cos(field.angle);
    const axisY = Math.sin(field.angle);
    raw = Math.cos(((dx * axisX + dy * axisY) / Math.max(field.scale, 1)) * Math.PI * 2 * field.density - time * Math.PI * 2);
  }

  return raw * 0.5 + 0.5;
}

function drawGridText2String(text, letterSpace, mode, fontSize, baselineY) {
  gridText2Ctx.lineWidth = Math.max(1, fontSize * 0.035);
  gridText2Ctx.strokeStyle = "#f5f5f5";
  gridText2Ctx.fillStyle = "#f5f5f5";

  if (Math.abs(letterSpace) < 0.01) {
    if (mode === "stroke" || mode === "both") gridText2Ctx.strokeText(text, 0, baselineY);
    if (mode === "fill" || mode === "both") gridText2Ctx.fillText(text, 0, baselineY);
    return;
  }

  const widths = Array.from(text).map((character) => gridText2Ctx.measureText(character).width);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, widths.length - 1) * letterSpace;
  let cursor = -totalWidth / 2;

  Array.from(text).forEach((character, index) => {
    const characterWidth = widths[index];
    const x = cursor + characterWidth / 2;
    if (mode === "stroke" || mode === "both") gridText2Ctx.strokeText(character, x, baselineY);
    if (mode === "fill" || mode === "both") gridText2Ctx.fillText(character, x, baselineY);
    cursor += characterWidth + letterSpace;
  });
}

function snapGridText2Angle(value) {
  const candidates = [0, 45, 90, 135, 180, 225, 270, 315, 360];
  let closest = value;
  let closestDistance = Infinity;

  candidates.forEach((candidate) => {
    const distance = Math.abs(value - candidate);
    if (distance < closestDistance) {
      closest = candidate;
      closestDistance = distance;
    }
  });

  return closestDistance <= 2 ? closest : value;
}

function snapGridText2AngleControl() {
  const input = gridText2Controls.fieldAngle;
  const value = Number(input.value);
  const snapped = snapGridText2Angle(value);

  if (snapped !== value) {
    input.value = String(snapped);
    updateKnobControl(input);
  }
}

function bindGridText2Controls() {
  if (!gridText2Controls.form) return;

  gridText2Controls.form.addEventListener("submit", (event) => event.preventDefault());

  Object.values(gridText2Controls).forEach((control) => {
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return;
    const redraw = () => {
      if (control === gridText2Controls.fieldAngle) {
        snapGridText2AngleControl();
      }
      if (!dateTwoPanel.hidden && !gridText2Panel.hidden) {
        resizeGridText2Canvas();
      }
    };
    control.addEventListener("input", redraw);
    control.addEventListener("change", redraw);
  });
}

function startGridText3() {
  if (!gridText3Running) {
    resetGridText3MotionClock();
  }
  resizeGridText3Canvas();
  if (gridText3Running) return;
  gridText3Running = true;
  gridText3AnimationFrame = requestAnimationFrame(renderGridText3);
}

function stopGridText3() {
  gridText3Running = false;
  cancelAnimationFrame(gridText3AnimationFrame);
}

function resizeGridText3Canvas() {
  const size = getConfiguredCanvasSize(gridText3Canvas, 420, 360);
  gridText3PixelRatio = size.pixelRatio;
  const { width, height } = size;
  const didResize = gridText3Canvas.width !== width || gridText3Canvas.height !== height;

  if (didResize) {
    gridText3Canvas.width = width;
    gridText3Canvas.height = height;
  }

  gridText3Ctx.imageSmoothingEnabled = true;
  gridText3Ctx.imageSmoothingQuality = "high";

  if (!gridText3Running) {
    drawGridText3Frame(performance.now());
  }
}

function renderGridText3(timestamp) {
  if (!gridText3Running) return;
  drawGridText3Frame(timestamp);
  gridText3AnimationFrame = requestAnimationFrame(renderGridText3);
}

function resetGridText3MotionClock() {
  gridText3StartTime = performance.now();
  gridText3MotionTime = 0;
  gridText3LastFrameTime = 0;
  gridText3SmoothedDelta = 0;
}

function getGridText3Elapsed(timestamp) {
  if (!gridText3Running) return (timestamp - gridText3StartTime) / 1000;

  if (!gridText3LastFrameTime) {
    gridText3LastFrameTime = timestamp;
    return gridText3MotionTime;
  }

  const rawDelta = clamp((timestamp - gridText3LastFrameTime) / 1000, 0, 1 / 12);
  gridText3LastFrameTime = timestamp;

  if (rawDelta <= 0) return gridText3MotionTime;

  if (!gridText3SmoothedDelta) {
    gridText3SmoothedDelta = rawDelta;
  } else {
    gridText3SmoothedDelta = mix(gridText3SmoothedDelta, rawDelta, 0.2);
  }

  gridText3MotionTime += gridText3SmoothedDelta;
  return gridText3MotionTime;
}

function drawGridText3Frame(timestamp) {
  const width = gridText3Canvas.width;
  const height = gridText3Canvas.height;
  const text = (gridText3Controls.text.value || "GRID EDIT 3").slice(0, 120);
  const weight = Math.max(100, readRangeValue(gridText3Controls.weight, 0));
  const fontFamily = gridText3Controls.font.value || "Helvetica, Arial, sans-serif";
  const fontSize = 74 * gridText3PixelRatio;
  const letterSpace = readRangeValue(gridText3Controls.letterSpace, 0) * gridText3PixelRatio;
  const padding = readRangeValue(gridText3Controls.padding, 0) * gridText3PixelRatio;
  const mode = gridText3Controls.renderMode.value;
  const repeatX = readRangeValue(gridText3Controls.repeatX, 0);
  const repeatY = readRangeValue(gridText3Controls.repeatY, 0);
  const marginX = Math.max(0, readRangeValue(gridText3Controls.marginX, 0)) * gridText3PixelRatio;
  const marginY = Math.max(0, readRangeValue(gridText3Controls.marginY, 0)) * gridText3PixelRatio;
  const cropX = readRangeValue(gridText3Controls.cropX, 0) / 100;
  const cropY = readRangeValue(gridText3Controls.cropY, 0) / 100;
  const cropToBox = gridText3Controls.cropToBox.checked;
  const zoomValue = readRangeValue(gridText3Controls.zoom, 0);
  const viewZoom = zoomValue <= 0 ? 1 : Math.max(0.05, zoomValue / 100);
  const opacity = readRangeValue(gridText3Controls.opacity, 100) / 100;
  const elapsed = getGridText3Elapsed(timestamp);
  const speed = mapGridText2Speed(readRangeValue(gridText3Controls.speed, 0));
  const delayX = readRangeValue(gridText3Controls.delayX, 0) / 100;
  const delayY = readRangeValue(gridText3Controls.delayY, 0) / 100;
  const waveShape = gridText3Controls.waveShape.value;
  const rampCurve = gridText3Controls.rampCurve.value;
  const scaleAmp = readRangeValue(gridText3Controls.scale, 0) / 100;
  const rotationAmp = (readRangeValue(gridText3Controls.rotation, 0) * Math.PI) / 180;
  const skewAmp = readRangeValue(gridText3Controls.skew, 0) / 100;
  const timeSlices = Math.max(0, Math.round(readRangeValue(gridText3Controls.timeSlices, 0)));
  const sliceDelay = readRangeValue(gridText3Controls.sliceDelay, 0) / 100;
  const sliceDirection = gridText3Controls.sliceDirection.value;
  const innerRepeatX = readRangeValue(gridText3Controls.innerRepeatX, 0);
  const innerRepeatY = readRangeValue(gridText3Controls.innerRepeatY, 0);
  const innerGap = readRangeValue(gridText3Controls.innerGap, 0) * gridText3PixelRatio;
  const field = getGridText3Field(width, height, elapsed, speed);
  const textColorA = parseHexColor(gridText3Controls.textColorA.value, [245, 245, 245]);
  const textColorB = parseHexColor(gridText3Controls.textColorB.value, [111, 183, 255]);
  const bgColorA = parseHexColor(gridText3Controls.bgColorA.value, [5, 5, 5]);
  const bgColorB = parseHexColor(gridText3Controls.bgColorB.value, [22, 22, 22]);

  gridText3Ctx.clearRect(0, 0, width, height);
  fillGridText3Background(width, height, field.angle, bgColorA, bgColorB);
  gridText3Ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
  gridText3Ctx.textAlign = "center";
  gridText3Ctx.textBaseline = "alphabetic";
  gridText3Ctx.fontKerning = "normal";
  gridText3Ctx.textRendering = "geometricPrecision";
  gridText3Ctx.lineJoin = "round";
  gridText3Ctx.lineCap = "round";

  const textLayout = getGridText3TextLayout(text, letterSpace, fontSize);
  const baselineY = textLayout.baselineY;
  const textWidth = textLayout.width;
  const textHeight = textLayout.height;
  const cellWidth = Math.max(12 * gridText3PixelRatio, textWidth + padding * 2);
  const cellHeight = Math.max(12 * gridText3PixelRatio, textHeight + padding * 2);
  const boxWidth = Math.max(2 * gridText3PixelRatio, cellWidth * (1 - cropX * 2));
  const boxHeight = Math.max(2 * gridText3PixelRatio, cellHeight * (1 - cropY * 2));
  const stepX = boxWidth + marginX;
  const stepY = boxHeight + marginY;
  const positionAmp = (readRangeValue(gridText3Controls.position, 0) / 100) * Math.max(boxWidth, boxHeight);
  const centerX = width / 2;
  const centerY = height / 2;
  const visibleLeft = centerX - width / (2 * viewZoom) - cellWidth * 2;
  const visibleRight = centerX + width / (2 * viewZoom) + cellWidth * 2;
  const visibleTop = centerY - height / (2 * viewZoom) - cellHeight * 2;
  const visibleBottom = centerY + height / (2 * viewZoom) + cellHeight * 2;
  const effect = {
    randomAmount: readRangeValue(gridText3Controls.opacityRandom, 0) / 100,
    opacityUnit: gridText3Controls.opacityUnit.value,
    randomGradientSize: readRangeValue(gridText3Controls.randomGradientSize, 0) * gridText3PixelRatio,
    randomIterations: readRangeValue(gridText3Controls.randomIterations, 0),
  };

  gridText3Ctx.save();
  gridText3Ctx.translate(centerX, centerY);
  gridText3Ctx.scale(viewZoom, viewZoom);
  gridText3Ctx.translate(-centerX, -centerY);
  gridText3Ctx.strokeStyle = "rgba(245, 245, 245, 0.14)";
  gridText3Ctx.lineWidth = Math.max(0.6, gridText3PixelRatio / viewZoom);

  for (let gy = -repeatY; gy <= repeatY; gy++) {
    for (let gx = -repeatX; gx <= repeatX; gx++) {
      const baseX = centerX + gx * stepX;
      const baseY = centerY + gy * stepY;
      if (baseX < visibleLeft || baseX > visibleRight || baseY < visibleTop || baseY > visibleBottom) {
        continue;
      }

      if (gridText3Controls.showBoxes.checked) {
        gridText3Ctx.strokeRect(baseX - boxWidth / 2, baseY - boxHeight / 2, boxWidth, boxHeight);
      }

      const baseTime = elapsed * speed - gx * delayX - gy * delayY;
      const sliceTotal = Math.max(1, timeSlices);
      for (let slice = 0; slice < sliceTotal; slice++) {
        const sliceProgress = sliceTotal === 1 ? 0.5 : slice / Math.max(1, sliceTotal - 1);
        const sliceOffset = (sliceProgress * 2 - 1) * sliceDelay;
        const sliceTime = baseTime + sliceOffset;
        const fieldValue = sampleGridText3Field(baseX, baseY, sliceTime, field);
        const wave = getGridText2WaveValue(waveShape, sliceTime, rampCurve);
        const fieldStrength = mix(0.72, 1.08, fieldValue);
        const transformValue = wave.transform * fieldStrength;
        const positionValue = wave.position * fieldStrength;
        const offsetX = Math.cos(field.angle) * positionValue * positionAmp;
        const offsetY = Math.sin(field.angle) * positionValue * positionAmp;
        const scale = Math.max(0.05, 1 + transformValue * scaleAmp);
        const rotation = transformValue * rotationAmp;
        const skew = transformValue * skewAmp;
        const textColor = colorToCss(mixColor(textColorA, textColorB, fieldValue));

        gridText3Ctx.save();
        clipGridText3TimeSlice(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, sliceDirection, field.angle, cropToBox);
        gridText3Ctx.translate(baseX + offsetX, baseY + offsetY);
        gridText3Ctx.rotate(rotation);
        gridText3Ctx.transform(1, skew * 0.45, skew, 1, 0, 0);
        gridText3Ctx.scale(scale, scale);

        for (let innerY = -innerRepeatY; innerY <= innerRepeatY; innerY++) {
          for (let innerX = -innerRepeatX; innerX <= innerRepeatX; innerX++) {
            const copyX = innerX * (textWidth + innerGap);
            const copyY = innerY * (textHeight + innerGap);
            drawGridText3String(text, {
              letterSpace,
              mode,
              fontSize,
              baselineY,
              x: copyX + textLayout.anchorOffsetX,
              y: copyY,
              color: textColor,
              opacity,
              effect,
              gx,
              gy,
              slice,
              innerX,
              innerY,
              worldX: baseX + copyX,
              worldY: baseY + copyY,
            });
          }
        }
        gridText3Ctx.restore();
      }
    }
  }

  gridText3Ctx.restore();
}

function clipGridText3TimeSlice(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, direction, angle, cropToBox) {
  if (cropToBox || sliceTotal > 1) {
    gridText3Ctx.beginPath();
    gridText3Ctx.rect(baseX - boxWidth / 2, baseY - boxHeight / 2, boxWidth, boxHeight);
    gridText3Ctx.clip();
  }

  if (sliceTotal <= 1) return;

  const bleed = Math.max(1, gridText3PixelRatio);
  gridText3Ctx.beginPath();

  if (direction === "horizontal") {
    const sliceHeight = boxHeight / sliceTotal;
    const y = baseY - boxHeight / 2 + slice * sliceHeight;
    gridText3Ctx.rect(baseX - boxWidth / 2 - bleed, y - bleed, boxWidth + bleed * 2, sliceHeight + bleed * 2);
  } else if (direction === "field") {
    addGridText3AngledSlicePath(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, angle, bleed);
  } else {
    const sliceWidth = boxWidth / sliceTotal;
    const x = baseX - boxWidth / 2 + slice * sliceWidth;
    gridText3Ctx.rect(x - bleed, baseY - boxHeight / 2 - bleed, sliceWidth + bleed * 2, boxHeight + bleed * 2);
  }

  gridText3Ctx.clip();
}

function addGridText3AngledSlicePath(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, angle, bleed) {
  const diagonal = Math.hypot(boxWidth, boxHeight) + bleed * 4;
  const sliceWidth = diagonal / sliceTotal;
  const x0 = -diagonal / 2 + slice * sliceWidth - bleed;
  const x1 = x0 + sliceWidth + bleed * 2;
  const y0 = -diagonal;
  const y1 = diagonal;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const points = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];

  points.forEach(([x, y], index) => {
    const px = baseX + x * cos - y * sin;
    const py = baseY + x * sin + y * cos;
    if (index === 0) {
      gridText3Ctx.moveTo(px, py);
    } else {
      gridText3Ctx.lineTo(px, py);
    }
  });
  gridText3Ctx.closePath();
}

function getGridText3TextLayout(text, letterSpace, fontSize) {
  const metrics = gridText3Ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.74;
  const descent = metrics.actualBoundingBoxDescent || fontSize * 0.22;
  const left = Number.isFinite(metrics.actualBoundingBoxLeft) ? metrics.actualBoundingBoxLeft : metrics.width / 2;
  const right = Number.isFinite(metrics.actualBoundingBoxRight) ? metrics.actualBoundingBoxRight : metrics.width / 2;
  const letterGapWidth = Math.max(0, Array.from(text).length - 1) * letterSpace;
  const visualWidth = Math.max(metrics.width, left + right) + letterGapWidth;

  return {
    anchorOffsetX: (left - right) / 2,
    baselineY: (ascent - descent) / 2,
    width: Math.max(1, visualWidth),
    height: Math.max(fontSize * 0.72, ascent + descent),
  };
}

function fillGridText3Background(width, height, angle, colorA, colorB) {
  const axisX = Math.cos(angle);
  const axisY = Math.sin(angle);
  const radius = Math.max(width, height);
  const gradient = gridText3Ctx.createLinearGradient(
    width / 2 - axisX * radius,
    height / 2 - axisY * radius,
    width / 2 + axisX * radius,
    height / 2 + axisY * radius
  );
  gradient.addColorStop(0, colorToCss(colorA));
  gradient.addColorStop(1, colorToCss(colorB));
  gridText3Ctx.fillStyle = gradient;
  gridText3Ctx.fillRect(0, 0, width, height);
}

function getGridText3Field(width, height, elapsed, speed) {
  const angle = (snapGridText2Angle(readRangeValue(gridText3Controls.fieldAngle, 0)) * Math.PI) / 180;
  const drift = readRangeValue(gridText3Controls.fieldDrift, 0) / 100;
  const shortSide = Math.min(width, height);
  return {
    mode: gridText3Controls.fieldMode.value,
    angle,
    cx: width / 2 + Math.cos(elapsed * speed * 0.62) * shortSide * 0.25 * drift,
    cy: height / 2 + Math.sin(elapsed * speed * 0.54 + 1.3) * shortSide * 0.25 * drift,
    scale: shortSide * mix(0.18, 1.9, readRangeValue(gridText3Controls.fieldScale, 0) / 240),
    density: readRangeValue(gridText3Controls.waveDensity, 0),
  };
}

function sampleGridText3Field(x, y, time, field) {
  const dx = x - field.cx;
  const dy = y - field.cy;
  let raw = 0;

  if (field.density <= 0) return 0.5;

  if (field.mode === "radial") {
    raw = Math.cos((Math.hypot(dx, dy) / Math.max(field.scale, 1)) * Math.PI * 2 * field.density - time * Math.PI * 2);
  } else if (field.mode === "conic") {
    raw = Math.cos((Math.atan2(dy, dx) + field.angle) * field.density - time * Math.PI * 2);
  } else {
    const axisX = Math.cos(field.angle);
    const axisY = Math.sin(field.angle);
    raw = Math.cos(((dx * axisX + dy * axisY) / Math.max(field.scale, 1)) * Math.PI * 2 * field.density - time * Math.PI * 2);
  }

  return raw * 0.5 + 0.5;
}

function drawGridText3String(text, options) {
  gridText3Ctx.lineWidth = Math.max(1, options.fontSize * 0.035);
  gridText3Ctx.strokeStyle = options.color;
  gridText3Ctx.fillStyle = options.color;

  if (options.effect.randomAmount <= 0) {
    gridText3Ctx.globalAlpha = clamp(options.opacity, 0, 1);
    drawGridText3PlainString(text, options);
    return;
  }

  const tokens = makeGridText3Tokens(text, options.effect.opacityUnit, options.letterSpace);
  let cursor = options.x - tokens.totalWidth / 2;

  tokens.items.forEach((token, index) => {
    const x = cursor + token.width / 2;
    const tokenAlpha = getGridText3TokenOpacity(index, x, options);
    gridText3Ctx.globalAlpha = clamp(options.opacity * tokenAlpha, 0, 1);
    drawGridText3Token(token.text, x, options.y + options.baselineY, options.mode);
    cursor += token.width + token.trailingSpace;
  });
}

function drawGridText3PlainString(text, options) {
  if (Math.abs(options.letterSpace) < 0.01) {
    drawGridText3Token(text, options.x, options.y + options.baselineY, options.mode);
    return;
  }

  const widths = Array.from(text).map((character) => gridText3Ctx.measureText(character).width);
  const totalWidth = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, widths.length - 1) * options.letterSpace;
  let cursor = options.x - totalWidth / 2;

  Array.from(text).forEach((character, index) => {
    const characterWidth = widths[index];
    const x = cursor + characterWidth / 2;
    drawGridText3Token(character, x, options.y + options.baselineY, options.mode);
    cursor += characterWidth + options.letterSpace;
  });
}

function makeGridText3Tokens(text, unit, letterSpace) {
  const rawTokens = unit === "word" ? (text.match(/\S+|\s+/g) || [text]) : Array.from(text);
  const items = rawTokens.map((token, index) => {
    const isSpace = /^\s+$/.test(token);
    const width = gridText3Ctx.measureText(token).width;
    return {
      text: token,
      width,
      trailingSpace: unit === "letter" && index < rawTokens.length - 1 ? letterSpace : 0,
      isSpace,
    };
  });

  const totalWidth = items.reduce((sum, item) => sum + item.width + item.trailingSpace, 0);
  return { items, totalWidth };
}

function drawGridText3Token(token, x, y, mode) {
  if (mode === "stroke" || mode === "both") gridText3Ctx.strokeText(token, x, y);
  if (mode === "fill" || mode === "both") gridText3Ctx.fillText(token, x, y);
}

function getGridText3TokenOpacity(index, x, options) {
  const effect = options.effect;
  const seed = gridTextHash(index, options.gx, options.gy, options.slice, options.innerX, options.innerY);
  const random = gridTextFraction(seed);
  let gradientValue = random;

  if (effect.randomGradientSize > 0 || effect.randomIterations > 0) {
    const scale = Math.max(1, effect.randomGradientSize || 72 * gridText3PixelRatio);
    let amp = 1;
    let total = 0;
    let sum = 0;
    const iterations = Math.max(1, effect.randomIterations + 1);
    for (let i = 0; i < iterations; i++) {
      const frequency = (i + 1) / scale;
      const signal = Math.sin((options.worldX + x) * frequency * 1.71 + options.worldY * frequency * 2.13 + seed * 0.00019);
      sum += (signal * 0.5 + 0.5) * amp;
      total += amp;
      amp *= 0.58;
    }
    gradientValue = sum / Math.max(total, 0.0001);
  }

  return 1 - effect.randomAmount * mix(random, gradientValue, 0.72);
}

function parseHexColor(value, fallback) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value || "");
  if (!match) return fallback;
  return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
}

function mixColor(a, b, t) {
  return [
    Math.round(mix(a[0], b[0], t)),
    Math.round(mix(a[1], b[1], t)),
    Math.round(mix(a[2], b[2], t)),
  ];
}

function colorToCss(color) {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

function gridTextHash(...values) {
  let hash = 2166136261;
  values.forEach((value) => {
    hash ^= Math.round((value + 4096) * 1009);
    hash = Math.imul(hash, 16777619);
  });
  return hash >>> 0;
}

function gridTextFraction(seed) {
  return ((Math.sin(seed * 12.9898) * 43758.5453) % 1 + 1) % 1;
}

function bindGridText3Controls() {
  if (!gridText3Controls.form) return;

  gridText3Controls.form.addEventListener("submit", (event) => event.preventDefault());

  Object.values(gridText3Controls).forEach((control) => {
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return;
    const redraw = () => {
      if (control === gridText3Controls.fieldAngle) {
        snapGridText3AngleControl();
      }
      if (!dateTwoPanel.hidden && !gridText3Panel.hidden) {
        resizeGridText3Canvas();
      }
    };
    control.addEventListener("input", redraw);
    control.addEventListener("change", redraw);
  });
}

function snapGridText3AngleControl() {
  const input = gridText3Controls.fieldAngle;
  const value = Number(input.value);
  const snapped = snapGridText2Angle(value);

  if (snapped !== value) {
    input.value = String(snapped);
    updateKnobControl(input);
  }
}

function startGridText4() {
  if (!gridText4Controls.form) return;
  if (gridText4Running) return;
  resetGridText4MotionClock();
  gridText4Running = true;
  resizeGridText4Canvas();
  gridText4AnimationFrame = requestAnimationFrame(renderGridText4);
}

function stopGridText4() {
  gridText4Running = false;
  cancelAnimationFrame(gridText4AnimationFrame);
}

function resizeGridText4Canvas() {
  const size = getConfiguredCanvasSize(gridText4Canvas, 420, 360);
  gridText4PixelRatio = size.pixelRatio;
  const { width, height } = size;

  if (gridText4Canvas.width !== width || gridText4Canvas.height !== height) {
    gridText4Canvas.width = width;
    gridText4Canvas.height = height;
  }

  gridText4Ctx.imageSmoothingEnabled = true;
  gridText4Ctx.imageSmoothingQuality = "high";

  if (!gridText4Running) {
    drawGridText4Frame(performance.now());
  }
}

function renderGridText4(timestamp) {
  if (!gridText4Running) return;
  drawGridText4Frame(timestamp);
  gridText4AnimationFrame = requestAnimationFrame(renderGridText4);
}

function resetGridText4MotionClock() {
  gridText4StartTime = performance.now();
  gridText4MotionTime = 0;
  gridText4LastFrameTime = 0;
  gridText4SmoothedDelta = 0;
}

function getGridText4Elapsed(timestamp) {
  if (!gridText4Running) return (timestamp - gridText4StartTime) / 1000;

  if (!gridText4LastFrameTime) {
    gridText4LastFrameTime = timestamp;
    return gridText4MotionTime;
  }

  const rawDelta = clamp((timestamp - gridText4LastFrameTime) / 1000, 0, 1 / 12);
  gridText4LastFrameTime = timestamp;
  gridText4MotionTime += rawDelta;
  return gridText4MotionTime;
}

function drawGridText4Frame(timestamp) {
  const width = gridText4Canvas.width;
  const height = gridText4Canvas.height;
  const text = (gridText4Controls.text.value || "RHYTHM GRID").slice(0, 140);
  const weight = Math.max(100, readRangeValue(gridText4Controls.weight, 700));
  const fontFamily = gridText4Controls.font.value || "Helvetica, Arial, sans-serif";
  const fontSize = 74 * gridText4PixelRatio;
  const letterSpace = readRangeValue(gridText4Controls.letterSpace, 0) * gridText4PixelRatio;
  const padding = readRangeValue(gridText4Controls.padding, 24) * gridText4PixelRatio;
  const mode = gridText4Controls.renderMode.value;
  const repeatX = readRangeValue(gridText4Controls.repeatX, 5);
  const repeatY = readRangeValue(gridText4Controls.repeatY, 3);
  const marginX = readRangeValue(gridText4Controls.marginX, 0) * gridText4PixelRatio;
  const marginY = readRangeValue(gridText4Controls.marginY, 0) * gridText4PixelRatio;
  const cropX = readRangeValue(gridText4Controls.cropX, 0) / 100;
  const cropY = readRangeValue(gridText4Controls.cropY, 0) / 100;
  const cropToBox = gridText4Controls.cropToBox.checked;
  const viewZoom = Math.max(0.05, readRangeValue(gridText4Controls.zoom, 100) / 100);
  const elapsed = getGridText4Elapsed(timestamp);
  const tempo = mapGridText4Tempo(readRangeValue(gridText4Controls.tempo, 38));
  const loopLock = gridText4Controls.loopLock.checked;
  const snapSteps = Math.max(1, Math.round(readRangeValue(gridText4Controls.snapSteps, 4)));
  const delayX = getGridText4PhaseValue(readRangeValue(gridText4Controls.delayX, 0) / 100, loopLock, snapSteps);
  const delayY = getGridText4PhaseValue(readRangeValue(gridText4Controls.delayY, 0) / 100, loopLock, snapSteps);
  const waveShape = gridText4Controls.waveShape.value;
  const scaleAmp = readRangeValue(gridText4Controls.scale, 0) / 100;
  const rotationAmp = (readRangeValue(gridText4Controls.rotation, 0) * Math.PI) / 180;
  const skewXAmp = readRangeValue(gridText4Controls.skewX, 0) / 100;
  const skewYAmp = readRangeValue(gridText4Controls.skewY, 0) / 100;
  const timeSlices = Math.max(0, Math.round(readRangeValue(gridText4Controls.timeSlices, 0)));
  const slicePhase = getGridText4PhaseValue(readRangeValue(gridText4Controls.slicePhase, 0) / 100, loopLock, snapSteps);
  const sliceAxis = gridText4Controls.sliceAxis.value;
  const innerRepeatX = readRangeValue(gridText4Controls.innerRepeatX, 0);
  const innerRepeatY = readRangeValue(gridText4Controls.innerRepeatY, 0);
  const innerGap = readRangeValue(gridText4Controls.innerGap, 0) * gridText4PixelRatio;
  const opacity = readRangeValue(gridText4Controls.opacity, 100) / 100;
  const textColorA = parseHexColor(gridText4Controls.textColorA.value, [245, 245, 245]);
  const textColorB = parseHexColor(gridText4Controls.textColorB.value, [125, 184, 255]);
  const bgColorA = parseHexColor(gridText4Controls.bgColorA.value, [5, 5, 5]);
  const bgColorB = parseHexColor(gridText4Controls.bgColorB.value, [18, 18, 22]);

  gridText4Ctx.clearRect(0, 0, width, height);
  gridText4Ctx.font = `${weight} ${fontSize}px ${fontFamily}`;
  gridText4Ctx.textAlign = "center";
  gridText4Ctx.textBaseline = "alphabetic";
  gridText4Ctx.fontKerning = "normal";
  gridText4Ctx.textRendering = "geometricPrecision";
  gridText4Ctx.lineJoin = "round";
  gridText4Ctx.lineCap = "round";

  const layout = getGridText4TextLayout(text, letterSpace, fontSize);
  const textPlan = makeGridText4Plan(text, letterSpace);
  const cellWidth = Math.max(12 * gridText4PixelRatio, layout.width + padding * 2);
  const cellHeight = Math.max(12 * gridText4PixelRatio, layout.height + padding * 2);
  const boxWidth = Math.max(2 * gridText4PixelRatio, cellWidth * (1 - cropX * 2));
  const boxHeight = Math.max(2 * gridText4PixelRatio, cellHeight * (1 - cropY * 2));
  const stepX = boxWidth + Math.max(0, marginX);
  const stepY = boxHeight + Math.max(0, marginY);
  let positionX = (readRangeValue(gridText4Controls.positionX, 0) / 100) * stepX;
  let positionY = (readRangeValue(gridText4Controls.positionY, 0) / 100) * stepY;

  if (loopLock) {
    positionX = snapGridText4Distance(positionX, stepX, snapSteps);
    positionY = snapGridText4Distance(positionY, stepY, snapSteps);
  }

  const motionAngle = Math.abs(positionX) + Math.abs(positionY) > 0.001 ? Math.atan2(positionY, positionX) : 0;
  fillGridText4Background(width, height, motionAngle, bgColorA, bgColorB, elapsed * tempo);

  const centerX = width / 2;
  const centerY = height / 2;
  const visible = getGridText4VisibleRange({
    centerX,
    centerY,
    width,
    height,
    viewZoom,
    repeatX,
    repeatY,
    stepX,
    stepY,
    cellWidth,
    cellHeight,
  });
  const effect = {
    randomAmount: readRangeValue(gridText4Controls.opacityRandom, 0) / 100,
    opacityUnit: gridText4Controls.opacityUnit.value,
  };

  gridText4Ctx.save();
  gridText4Ctx.translate(centerX, centerY);
  gridText4Ctx.scale(viewZoom, viewZoom);
  gridText4Ctx.translate(-centerX, -centerY);
  gridText4Ctx.strokeStyle = "rgba(245, 245, 245, 0.14)";
  gridText4Ctx.lineWidth = Math.max(0.6, gridText4PixelRatio / viewZoom);

  for (let gy = visible.minY; gy <= visible.maxY; gy++) {
    for (let gx = visible.minX; gx <= visible.maxX; gx++) {
      const baseX = centerX + gx * stepX;
      const baseY = centerY + gy * stepY;
      const basePhase = elapsed * tempo - gx * delayX - gy * delayY;

      if (gridText4Controls.showBoxes.checked) {
        gridText4Ctx.strokeRect(baseX - boxWidth / 2, baseY - boxHeight / 2, boxWidth, boxHeight);
      }

      const sliceTotal = Math.max(1, timeSlices);
      for (let slice = 0; slice < sliceTotal; slice++) {
        const sliceProgress = sliceTotal === 1 ? 0.5 : slice / Math.max(1, sliceTotal - 1);
        const localPhase = basePhase + (sliceProgress * 2 - 1) * slicePhase;
        const wave = getGridText4Wave(waveShape, localPhase);
        const offsetX = positionX * wave.position;
        const offsetY = positionY * wave.position;
        const scale = Math.max(0.03, 1 + wave.transform * scaleAmp);
        const rotation = wave.transform * rotationAmp;
        const skewX = wave.transform * skewXAmp * 0.45;
        const skewY = wave.transform * skewYAmp * 0.45;
        const colorBeat = 0.5 + 0.5 * Math.sin((localPhase + gx * 0.031 - gy * 0.023) * Math.PI * 2);
        const textColor = colorToCss(mixColor(textColorA, textColorB, mix(wave.ink, colorBeat, 0.28)));

        gridText4Ctx.save();
        clipGridText4TimeSlice(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, sliceAxis, motionAngle, cropToBox);
        gridText4Ctx.translate(baseX + offsetX, baseY + offsetY);
        gridText4Ctx.rotate(rotation);
        gridText4Ctx.transform(1, skewY, skewX, 1, 0, 0);
        gridText4Ctx.scale(scale, scale);

        for (let innerY = -innerRepeatY; innerY <= innerRepeatY; innerY++) {
          for (let innerX = -innerRepeatX; innerX <= innerRepeatX; innerX++) {
            drawGridText4String(textPlan, {
              mode,
              fontSize,
              letterSpace,
              baselineY: layout.baselineY,
              x: layout.anchorOffsetX + innerX * (layout.width + innerGap),
              y: innerY * (layout.height + innerGap),
              color: textColor,
              opacity,
              effect,
              gx,
              gy,
              slice,
              innerX,
              innerY,
            });
          }
        }
        gridText4Ctx.restore();
      }
    }
  }

  gridText4Ctx.restore();
}

function mapGridText4Tempo(value) {
  const t = clamp(value / 100, 0, 1);
  if (t <= 0) return 0;
  return mix(0.025, 2.8, Math.pow(t, 2.2));
}

function getGridText4PhaseValue(value, shouldSnap, steps) {
  if (!shouldSnap) return value;
  return Math.round(value * steps) / Math.max(1, steps);
}

function snapGridText4Distance(value, step, snapSteps) {
  const unit = Math.max(1, step / Math.max(1, snapSteps));
  return Math.round(value / unit) * unit;
}

function getGridText4Wave(shape, phase) {
  const cycle = positiveModulo(phase, 1);

  if (shape === "sine") {
    const sine = Math.sin(cycle * Math.PI * 2);
    return {
      position: sine,
      transform: sine,
      ink: sine * 0.5 + 0.5,
    };
  }

  if (shape === "triangle") {
    const triangle = 1 - Math.abs(cycle * 2 - 1);
    return {
      position: triangle * 2 - 1,
      transform: triangle * 2 - 1,
      ink: triangle,
    };
  }

  if (shape === "step") {
    const pulse = cycle < 0.5 ? 0 : 1;
    return {
      position: pulse,
      transform: pulse * 2 - 1,
      ink: pulse,
    };
  }

  const ramp = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2;
  return {
    position: ramp,
    transform: ramp,
    ink: ramp,
  };
}

function getGridText4VisibleRange({ centerX, centerY, width, height, viewZoom, repeatX, repeatY, stepX, stepY, cellWidth, cellHeight }) {
  const left = centerX - width / (2 * viewZoom) - cellWidth * 2;
  const right = centerX + width / (2 * viewZoom) + cellWidth * 2;
  const top = centerY - height / (2 * viewZoom) - cellHeight * 2;
  const bottom = centerY + height / (2 * viewZoom) + cellHeight * 2;

  return {
    minX: Math.max(-repeatX, Math.floor((left - centerX) / stepX) - 1),
    maxX: Math.min(repeatX, Math.ceil((right - centerX) / stepX) + 1),
    minY: Math.max(-repeatY, Math.floor((top - centerY) / stepY) - 1),
    maxY: Math.min(repeatY, Math.ceil((bottom - centerY) / stepY) + 1),
  };
}

function fillGridText4Background(width, height, angle, colorA, colorB, phase) {
  const axisX = Math.cos(angle);
  const axisY = Math.sin(angle);
  const radius = Math.max(width, height);
  const gradient = gridText4Ctx.createLinearGradient(
    width / 2 - axisX * radius,
    height / 2 - axisY * radius,
    width / 2 + axisX * radius,
    height / 2 + axisY * radius
  );

  gradient.addColorStop(0, colorToCss(colorA));
  gradient.addColorStop(1, colorToCss(colorB));
  gridText4Ctx.fillStyle = gradient;
  gridText4Ctx.fillRect(0, 0, width, height);

  const glowX = width / 2 + Math.cos(phase * Math.PI * 2) * width * 0.08;
  const glowY = height / 2 + Math.sin(phase * Math.PI * 2) * height * 0.08;
  const glow = gridText4Ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, Math.max(width, height) * 0.72);
  glow.addColorStop(0, "rgba(255, 255, 255, 0.08)");
  glow.addColorStop(1, "rgba(255, 255, 255, 0)");
  gridText4Ctx.save();
  gridText4Ctx.globalCompositeOperation = "screen";
  gridText4Ctx.fillStyle = glow;
  gridText4Ctx.fillRect(0, 0, width, height);
  gridText4Ctx.restore();
}

function clipGridText4TimeSlice(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, axis, angle, cropToBox) {
  if (cropToBox || sliceTotal > 1) {
    gridText4Ctx.beginPath();
    gridText4Ctx.rect(baseX - boxWidth / 2, baseY - boxHeight / 2, boxWidth, boxHeight);
    gridText4Ctx.clip();
  }

  if (sliceTotal <= 1) return;

  const bleed = Math.max(1, gridText4PixelRatio);
  gridText4Ctx.beginPath();

  if (axis === "y") {
    const sliceHeight = boxHeight / sliceTotal;
    const y = baseY - boxHeight / 2 + slice * sliceHeight;
    gridText4Ctx.rect(baseX - boxWidth / 2 - bleed, y - bleed, boxWidth + bleed * 2, sliceHeight + bleed * 2);
  } else if (axis === "motion") {
    addGridText4AngledSlicePath(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, angle, bleed);
  } else {
    const sliceWidth = boxWidth / sliceTotal;
    const x = baseX - boxWidth / 2 + slice * sliceWidth;
    gridText4Ctx.rect(x - bleed, baseY - boxHeight / 2 - bleed, sliceWidth + bleed * 2, boxHeight + bleed * 2);
  }

  gridText4Ctx.clip();
}

function addGridText4AngledSlicePath(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, angle, bleed) {
  const diagonal = Math.hypot(boxWidth, boxHeight) + bleed * 4;
  const sliceWidth = diagonal / sliceTotal;
  const x0 = -diagonal / 2 + slice * sliceWidth - bleed;
  const x1 = x0 + sliceWidth + bleed * 2;
  const y0 = -diagonal;
  const y1 = diagonal;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const points = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];

  points.forEach(([x, y], index) => {
    const px = baseX + x * cos - y * sin;
    const py = baseY + x * sin + y * cos;
    if (index === 0) {
      gridText4Ctx.moveTo(px, py);
    } else {
      gridText4Ctx.lineTo(px, py);
    }
  });
  gridText4Ctx.closePath();
}

function getGridText4TextLayout(text, letterSpace, fontSize) {
  const metrics = gridText4Ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.74;
  const descent = metrics.actualBoundingBoxDescent || fontSize * 0.22;
  const left = Number.isFinite(metrics.actualBoundingBoxLeft) ? metrics.actualBoundingBoxLeft : metrics.width / 2;
  const right = Number.isFinite(metrics.actualBoundingBoxRight) ? metrics.actualBoundingBoxRight : metrics.width / 2;
  const letterGapWidth = Math.max(0, Array.from(text).length - 1) * letterSpace;
  const visualWidth = Math.max(metrics.width, left + right) + letterGapWidth;

  return {
    anchorOffsetX: (left - right) / 2,
    baselineY: (ascent - descent) / 2,
    width: Math.max(1, visualWidth),
    height: Math.max(fontSize * 0.72, ascent + descent),
  };
}

function makeGridText4Plan(text, letterSpace) {
  const characters = Array.from(text).map((character) => ({
    text: character,
    width: gridText4Ctx.measureText(character).width,
  }));
  const rawWords = text.match(/\S+|\s+/g) || [text];
  const words = rawWords.map((word) => ({
    text: word,
    width: gridText4Ctx.measureText(word).width,
  }));

  return {
    text,
    characters,
    characterWidth: characters.reduce((sum, item) => sum + item.width, 0) + Math.max(0, characters.length - 1) * letterSpace,
    words,
    wordWidth: words.reduce((sum, item) => sum + item.width, 0),
  };
}

function drawGridText4String(plan, options) {
  gridText4Ctx.lineWidth = Math.max(1, options.fontSize * 0.035);
  gridText4Ctx.strokeStyle = options.color;
  gridText4Ctx.fillStyle = options.color;

  if (options.effect.randomAmount <= 0) {
    gridText4Ctx.globalAlpha = clamp(options.opacity, 0, 1);
    drawGridText4PlainString(plan, options);
    return;
  }

  if (options.effect.opacityUnit === "cell") {
    const cellAlpha = getGridText4TokenOpacity(0, options);
    gridText4Ctx.globalAlpha = clamp(options.opacity * cellAlpha, 0, 1);
    drawGridText4PlainString(plan, options);
    return;
  }

  const tokens = options.effect.opacityUnit === "word" ? plan.words : plan.characters;
  const totalWidth = options.effect.opacityUnit === "word" ? plan.wordWidth : plan.characterWidth;
  let cursor = options.x - totalWidth / 2;

  tokens.forEach((token, index) => {
    const x = cursor + token.width / 2;
    const tokenAlpha = getGridText4TokenOpacity(index, options);
    gridText4Ctx.globalAlpha = clamp(options.opacity * tokenAlpha, 0, 1);
    drawGridText4Token(token.text, x, options.y + options.baselineY, options.mode);
    cursor += token.width + (options.effect.opacityUnit === "letter" ? options.letterSpace : 0);
  });
}

function drawGridText4PlainString(plan, options) {
  if (Math.abs(options.letterSpace) < 0.01) {
    drawGridText4Token(plan.text, options.x, options.y + options.baselineY, options.mode);
    return;
  }

  let cursor = options.x - plan.characterWidth / 2;
  plan.characters.forEach((character) => {
    const x = cursor + character.width / 2;
    drawGridText4Token(character.text, x, options.y + options.baselineY, options.mode);
    cursor += character.width + options.letterSpace;
  });
}

function drawGridText4Token(token, x, y, mode) {
  if (mode === "stroke" || mode === "both") gridText4Ctx.strokeText(token, x, y);
  if (mode === "fill" || mode === "both") gridText4Ctx.fillText(token, x, y);
}

function getGridText4TokenOpacity(index, options) {
  const seed = gridTextHash(index, options.gx, options.gy, options.slice, options.innerX, options.innerY);
  const random = gridTextFraction(seed);
  return 1 - options.effect.randomAmount * random;
}

function bindGridText4Controls() {
  if (!gridText4Controls.form) return;

  gridText4Controls.form.addEventListener("submit", (event) => event.preventDefault());

  Object.values(gridText4Controls).forEach((control) => {
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return;
    const redraw = () => {
      if (!dateTwoPanel.hidden && !gridText4Panel.hidden) {
        resizeGridText4Canvas();
      }
    };
    control.addEventListener("input", redraw);
    control.addEventListener("change", redraw);
  });
}

function startGridText5() {
  if (!gridText5Controls.form) return;
  if (gridText5Running) return;
  resetGridText5MotionClock();
  resizeGridText5Canvas();
  resizeGridText5WaveCanvas();
  gridText5Running = true;
  gridText5AnimationFrame = requestAnimationFrame(renderGridText5);
}

function stopGridText5() {
  gridText5Running = false;
  cancelAnimationFrame(gridText5AnimationFrame);
}

function resizeGridText5Canvas() {
  const size = getConfiguredCanvasSize(gridText5Canvas, 420, 360);
  gridText5PixelRatio = size.pixelRatio;
  const { width, height } = size;

  if (gridText5Canvas.width !== width || gridText5Canvas.height !== height) {
    gridText5Canvas.width = width;
    gridText5Canvas.height = height;
  }

  gridText5Ctx.imageSmoothingEnabled = true;
  gridText5Ctx.imageSmoothingQuality = "high";

  if (!gridText5Running) {
    drawGridText5Frame(performance.now());
  }
}

function renderGridText5(timestamp) {
  if (!gridText5Running) return;
  drawGridText5Frame(timestamp);
  gridText5AnimationFrame = requestAnimationFrame(renderGridText5);
}

function resetGridText5MotionClock() {
  gridText5StartTime = performance.now();
  gridText5MotionTime = 0;
  gridText5LastFrameTime = 0;
}

function getGridText5Elapsed(timestamp) {
  if (!gridText5Running) return (timestamp - gridText5StartTime) / 1000;

  if (!gridText5LastFrameTime) {
    gridText5LastFrameTime = timestamp;
    return gridText5MotionTime;
  }

  const rawDelta = clamp((timestamp - gridText5LastFrameTime) / 1000, 0, 1 / 12);
  gridText5LastFrameTime = timestamp;
  gridText5MotionTime += rawDelta;
  return gridText5MotionTime;
}

function drawGridText5Frame(timestamp) {
  const width = gridText5Canvas.width;
  const height = gridText5Canvas.height;
  const text = (gridText5Controls.text.value || "GRID EDIT 5").slice(0, 140);
  const baseWeight = Math.max(100, readRangeValue(gridText5Controls.weight, 700));
  const fontFamily = gridText5Controls.font.value || "Helvetica, Arial, sans-serif";
  const fontSize = 74 * gridText5PixelRatio;
  const baseLetterSpace = readRangeValue(gridText5Controls.letterSpace, 0) * gridText5PixelRatio;
  const padding = readRangeValue(gridText5Controls.padding, 10) * gridText5PixelRatio;
  const mode = gridText5Controls.renderMode.value;
  const repeatX = readRangeValue(gridText5Controls.repeatX, 5);
  const repeatY = readRangeValue(gridText5Controls.repeatY, 3);
  const marginX = Math.max(0, readRangeValue(gridText5Controls.marginX, 0)) * gridText5PixelRatio;
  const marginY = Math.max(0, readRangeValue(gridText5Controls.marginY, 0)) * gridText5PixelRatio;
  const cropX = readRangeValue(gridText5Controls.cropX, 0) / 100;
  const cropY = readRangeValue(gridText5Controls.cropY, 0) / 100;
  const cropToBox = gridText5Controls.cropToBox.checked;
  const viewZoom = Math.max(0.05, readRangeValue(gridText5Controls.zoom, 100) / 100);
  const elapsed = getGridText5Elapsed(timestamp);
  const tempo = mapGridText5Tempo(readRangeValue(gridText5Controls.tempo, 38));
  const phaseX = readRangeValue(gridText5Controls.phaseX, 0) / 100;
  const phaseY = readRangeValue(gridText5Controls.phaseY, 0) / 100;
  const fieldAngle = (snapGridText2Angle(readRangeValue(gridText5Controls.fieldAngle, 0)) * Math.PI) / 180;
  const fieldPhase = readRangeValue(gridText5Controls.fieldPhase, 0) / 100;
  const direction = (snapGridText2Angle(readRangeValue(gridText5Controls.direction, 0)) * Math.PI) / 180;
  const positionSnapUnit = Math.max(0.25, readRangeValue(gridText5Controls.positionSnapUnit, 25) / 100);
  const shouldSnapPosition = gridText5Controls.positionSnap.checked;
  const scaleAmp = readRangeValue(gridText5Controls.scale, 0) / 100;
  const rotationAmp = (readRangeValue(gridText5Controls.rotation, 0) * Math.PI) / 180;
  const skewXAmp = readRangeValue(gridText5Controls.skewX, 0) / 100;
  const skewYAmp = readRangeValue(gridText5Controls.skewY, 0) / 100;
  const timeSlices = Math.max(0, Math.round(readRangeValue(gridText5Controls.timeSlices, 0)));
  const slicePhaseRaw = readRangeValue(gridText5Controls.slicePhase, 0) / 100;
  const slicePhase = gridText5Controls.sliceSnap.checked ? Math.round(slicePhaseRaw * 4) / 4 : slicePhaseRaw;
  const sliceAxis = gridText5Controls.sliceAxis.value;
  const sliceAngle = (snapGridText2Angle(readRangeValue(gridText5Controls.sliceAngle, 0)) * Math.PI) / 180;
  const innerRepeatX = readRangeValue(gridText5Controls.innerRepeatX, 0);
  const innerRepeatY = readRangeValue(gridText5Controls.innerRepeatY, 0);
  const innerGap = readRangeValue(gridText5Controls.innerGap, 0) * gridText5PixelRatio;
  const baseOpacity = readRangeValue(gridText5Controls.opacity, 100) / 100;
  const shouldAnimateWeight = gridText5Controls.animateWeight.checked;
  const weightAmount = shouldAnimateWeight ? readRangeValue(gridText5Controls.weightAmount, 0) : 0;
  const shouldAnimateLetter = gridText5Controls.animateLetter.checked;
  const letterAmount = (shouldAnimateLetter ? readRangeValue(gridText5Controls.letterAmount, 0) : 0) * gridText5PixelRatio;
  const shouldAnimateOpacity = gridText5Controls.animateOpacity.checked;
  const opacityAmount = shouldAnimateOpacity ? readRangeValue(gridText5Controls.opacityAmount, 0) / 100 : 0;
  const textColor = "#f5f5f5";

  gridText5Ctx.clearRect(0, 0, width, height);
  gridText5Ctx.fillStyle = "#050505";
  gridText5Ctx.fillRect(0, 0, width, height);
  gridText5Ctx.textAlign = "center";
  gridText5Ctx.textBaseline = "alphabetic";
  gridText5Ctx.fontKerning = "normal";
  gridText5Ctx.textRendering = "geometricPrecision";
  gridText5Ctx.lineJoin = "round";
  gridText5Ctx.lineCap = "round";

  const envelopeWeight = clamp(baseWeight + Math.abs(weightAmount), 100, 900);
  const envelopeLetterSpace = baseLetterSpace + Math.abs(letterAmount);
  gridText5Ctx.font = `${Math.round(envelopeWeight)} ${fontSize}px ${fontFamily}`;
  const envelopeLayout = getGridText5TextLayout(text, envelopeLetterSpace, fontSize);
  const cellWidth = Math.max(12 * gridText5PixelRatio, envelopeLayout.width + padding * 2);
  const cellHeight = Math.max(12 * gridText5PixelRatio, envelopeLayout.height + padding * 2);
  const boxWidth = Math.max(2 * gridText5PixelRatio, cellWidth * (1 - cropX * 2));
  const boxHeight = Math.max(2 * gridText5PixelRatio, cellHeight * (1 - cropY * 2));
  const stepX = boxWidth + marginX;
  const stepY = boxHeight + marginY;
  let positionRatio = readRangeValue(gridText5Controls.position, 0) / 100;
  if (shouldSnapPosition) {
    positionRatio = Math.round(positionRatio / positionSnapUnit) * positionSnapUnit;
  }
  const positionDistance = positionRatio * Math.max(boxWidth, boxHeight);
  const positionX = Math.cos(direction) * positionDistance;
  const positionY = Math.sin(direction) * positionDistance;
  const motionAngle = Math.abs(positionX) + Math.abs(positionY) > 0.001 ? Math.atan2(positionY, positionX) : direction;
  const centerX = width / 2;
  const centerY = height / 2;
  const visible = getGridText5VisibleRange({
    centerX,
    centerY,
    width,
    height,
    viewZoom,
    repeatX,
    repeatY,
    stepX,
    stepY,
    cellWidth,
    cellHeight,
  });
  const effect = {
    randomAmount: readRangeValue(gridText5Controls.opacityRandom, 0) / 100,
    opacityUnit: gridText5Controls.opacityUnit.value,
  };

  gridText5Ctx.save();
  gridText5Ctx.translate(centerX, centerY);
  gridText5Ctx.scale(viewZoom, viewZoom);
  gridText5Ctx.translate(-centerX, -centerY);
  gridText5Ctx.strokeStyle = "rgba(245, 245, 245, 0.18)";
  gridText5Ctx.lineWidth = Math.max(0.6, gridText5PixelRatio / viewZoom);

  for (let gy = visible.minY; gy <= visible.maxY; gy++) {
    for (let gx = visible.minX; gx <= visible.maxX; gx++) {
      const baseX = centerX + gx * stepX;
      const baseY = centerY + gy * stepY;
      const fieldProjection = gx * Math.cos(fieldAngle) + gy * Math.sin(fieldAngle);
      const basePhase = elapsed * tempo - gx * phaseX - gy * phaseY - fieldProjection * fieldPhase;

      if (gridText5Controls.showBoxes.checked) {
        gridText5Ctx.strokeRect(baseX - boxWidth / 2, baseY - boxHeight / 2, boxWidth, boxHeight);
      }

      const sliceTotal = Math.max(1, timeSlices);
      for (let slice = 0; slice < sliceTotal; slice++) {
        const sliceProgress = sliceTotal === 1 ? 0.5 : slice / Math.max(1, sliceTotal - 1);
        const localPhase = basePhase + (sliceProgress * 2 - 1) * slicePhase;
        const wave = getGridText5Wave(localPhase);
        const effectiveWeight = clamp(baseWeight + wave.value * weightAmount, 100, 900);
        const effectiveLetterSpace = baseLetterSpace + wave.value * letterAmount;
        const opacityWave = 1 - (1 - wave.unit) * opacityAmount;
        const effectiveOpacity = baseOpacity * clamp(opacityWave, 0, 1);
        const offsetX = positionX * wave.value;
        const offsetY = positionY * wave.value;
        const scale = Math.max(0.03, 1 + wave.value * scaleAmp);
        const rotation = wave.value * rotationAmp;
        const skewX = wave.value * skewXAmp * 0.45;
        const skewY = wave.value * skewYAmp * 0.45;

        gridText5Ctx.font = `${Math.round(effectiveWeight)} ${fontSize}px ${fontFamily}`;
        const drawLayout = getGridText5TextLayout(text, effectiveLetterSpace, fontSize);
        const textPlan = makeGridText5Plan(text, effectiveLetterSpace);

        gridText5Ctx.save();
        clipGridText5TimeSlice(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, sliceAxis, motionAngle, sliceAngle, cropToBox);
        gridText5Ctx.translate(baseX + offsetX, baseY + offsetY);
        gridText5Ctx.rotate(rotation);
        gridText5Ctx.transform(1, skewY, skewX, 1, 0, 0);
        gridText5Ctx.scale(scale, scale);

        for (let innerY = -innerRepeatY; innerY <= innerRepeatY; innerY++) {
          for (let innerX = -innerRepeatX; innerX <= innerRepeatX; innerX++) {
            drawGridText5String(textPlan, {
              mode,
              fontSize,
              letterSpace: effectiveLetterSpace,
              baselineY: drawLayout.baselineY,
              x: drawLayout.anchorOffsetX + innerX * (envelopeLayout.width + innerGap),
              y: innerY * (envelopeLayout.height + innerGap),
              color: textColor,
              opacity: effectiveOpacity,
              effect,
              gx,
              gy,
              slice,
              innerX,
              innerY,
            });
          }
        }
        gridText5Ctx.restore();
      }
    }
  }

  gridText5Ctx.restore();
}

function mapGridText5Tempo(value) {
  const t = clamp(value / 100, 0, 1);
  if (t <= 0) return 0;
  return mix(0.015, 3.2, Math.pow(t, 2.25));
}

function getGridText5Wave(phase) {
  const mode = gridText5Controls.waveMode.value;
  const cycle = positiveModulo(phase, 1);

  if (mode === "sine") {
    const sine = Math.sin(cycle * Math.PI * 2);
    return { value: sine, unit: sine * 0.5 + 0.5 };
  }

  if (mode === "return") {
    const ramp = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2;
    return { value: ramp, unit: ramp };
  }

  if (mode === "triangle") {
    const triangle = 1 - Math.abs(cycle * 2 - 1);
    return { value: triangle * 2 - 1, unit: triangle };
  }

  if (mode === "step") {
    const pulse = cycle < 0.5 ? -1 : 1;
    return { value: pulse, unit: pulse > 0 ? 1 : 0 };
  }

  const value = sampleGridText5CustomWave(cycle);
  return { value, unit: value * 0.5 + 0.5 };
}

function sampleGridText5CustomWave(cycle) {
  const points = gridText5Controls.wavePoints.map((input) => readRangeValue(input, 0) / 100);
  const segmentCount = Math.max(1, points.length - 1);
  const scaled = positiveModulo(cycle, 1) * segmentCount;
  const index = Math.min(segmentCount - 1, Math.floor(scaled));
  const nextIndex = index + 1;
  const rawT = scaled - Math.floor(scaled);
  const smoothT = rawT * rawT * (3 - 2 * rawT);
  const smoothAmount = readRangeValue(gridText5Controls.waveSmooth, 45) / 100;
  const t = mix(rawT, smoothT, smoothAmount);
  return mix(points[index], points[nextIndex], t);
}

function getGridText5VisibleRange({ centerX, centerY, width, height, viewZoom, repeatX, repeatY, stepX, stepY, cellWidth, cellHeight }) {
  const left = centerX - width / (2 * viewZoom) - cellWidth * 2;
  const right = centerX + width / (2 * viewZoom) + cellWidth * 2;
  const top = centerY - height / (2 * viewZoom) - cellHeight * 2;
  const bottom = centerY + height / (2 * viewZoom) + cellHeight * 2;

  return {
    minX: Math.max(-repeatX, Math.floor((left - centerX) / stepX) - 1),
    maxX: Math.min(repeatX, Math.ceil((right - centerX) / stepX) + 1),
    minY: Math.max(-repeatY, Math.floor((top - centerY) / stepY) - 1),
    maxY: Math.min(repeatY, Math.ceil((bottom - centerY) / stepY) + 1),
  };
}

function clipGridText5TimeSlice(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, axis, motionAngle, sliceAngle, cropToBox) {
  if (cropToBox || sliceTotal > 1) {
    gridText5Ctx.beginPath();
    gridText5Ctx.rect(baseX - boxWidth / 2, baseY - boxHeight / 2, boxWidth, boxHeight);
    gridText5Ctx.clip();
  }

  if (sliceTotal <= 1) return;

  gridText5Ctx.beginPath();
  if (axis === "y") {
    const sliceHeight = boxHeight / sliceTotal;
    const y = baseY - boxHeight / 2 + slice * sliceHeight;
    gridText5Ctx.rect(baseX - boxWidth / 2, y, boxWidth, sliceHeight);
  } else if (axis === "motion") {
    addGridText5AngledSlicePath(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, motionAngle);
  } else if (axis === "angle") {
    addGridText5AngledSlicePath(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, sliceAngle);
  } else {
    const sliceWidth = boxWidth / sliceTotal;
    const x = baseX - boxWidth / 2 + slice * sliceWidth;
    gridText5Ctx.rect(x, baseY - boxHeight / 2, sliceWidth, boxHeight);
  }
  gridText5Ctx.clip();
}

function addGridText5AngledSlicePath(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, angle) {
  const diagonal = Math.hypot(boxWidth, boxHeight);
  const sliceWidth = diagonal / sliceTotal;
  const x0 = -diagonal / 2 + slice * sliceWidth;
  const x1 = x0 + sliceWidth;
  const y0 = -diagonal;
  const y1 = diagonal;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const points = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];

  points.forEach(([x, y], index) => {
    const px = baseX + x * cos - y * sin;
    const py = baseY + x * sin + y * cos;
    if (index === 0) {
      gridText5Ctx.moveTo(px, py);
    } else {
      gridText5Ctx.lineTo(px, py);
    }
  });
  gridText5Ctx.closePath();
}

function getGridText5TextLayout(text, letterSpace, fontSize) {
  const metrics = gridText5Ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.72;
  const descent = metrics.actualBoundingBoxDescent || 0;
  const left = Number.isFinite(metrics.actualBoundingBoxLeft) ? metrics.actualBoundingBoxLeft : metrics.width / 2;
  const right = Number.isFinite(metrics.actualBoundingBoxRight) ? metrics.actualBoundingBoxRight : metrics.width / 2;
  const letterGapWidth = Math.max(0, Array.from(text).length - 1) * letterSpace;
  const visualWidth = Math.max(metrics.width, left + right) + letterGapWidth;

  return {
    anchorOffsetX: (left - right) / 2,
    baselineY: (ascent - descent) / 2,
    width: Math.max(1, visualWidth),
    height: Math.max(1, ascent + descent),
  };
}

function makeGridText5Plan(text, letterSpace) {
  const characters = Array.from(text).map((character) => ({
    text: character,
    width: gridText5Ctx.measureText(character).width,
  }));
  const rawWords = text.match(/\S+|\s+/g) || [text];
  const words = rawWords.map((word) => ({
    text: word,
    width: gridText5Ctx.measureText(word).width,
  }));

  return {
    text,
    characters,
    characterWidth: characters.reduce((sum, item) => sum + item.width, 0) + Math.max(0, characters.length - 1) * letterSpace,
    words,
    wordWidth: words.reduce((sum, item) => sum + item.width, 0),
  };
}

function drawGridText5String(plan, options) {
  gridText5Ctx.lineWidth = Math.max(1, options.fontSize * 0.035);
  gridText5Ctx.strokeStyle = options.color;
  gridText5Ctx.fillStyle = options.color;

  if (options.effect.randomAmount <= 0) {
    gridText5Ctx.globalAlpha = clamp(options.opacity, 0, 1);
    drawGridText5PlainString(plan, options);
    return;
  }

  if (options.effect.opacityUnit === "cell") {
    const cellAlpha = getGridText5TokenOpacity(0, options);
    gridText5Ctx.globalAlpha = clamp(options.opacity * cellAlpha, 0, 1);
    drawGridText5PlainString(plan, options);
    return;
  }

  const tokens = options.effect.opacityUnit === "word" ? plan.words : plan.characters;
  const totalWidth = options.effect.opacityUnit === "word" ? plan.wordWidth : plan.characterWidth;
  let cursor = options.x - totalWidth / 2;

  tokens.forEach((token, index) => {
    const x = cursor + token.width / 2;
    const tokenAlpha = getGridText5TokenOpacity(index, options);
    gridText5Ctx.globalAlpha = clamp(options.opacity * tokenAlpha, 0, 1);
    drawGridText5Token(token.text, x, options.y + options.baselineY, options.mode);
    cursor += token.width + (options.effect.opacityUnit === "letter" ? options.letterSpace : 0);
  });
}

function drawGridText5PlainString(plan, options) {
  if (Math.abs(options.letterSpace) < 0.01) {
    drawGridText5Token(plan.text, options.x, options.y + options.baselineY, options.mode);
    return;
  }

  let cursor = options.x - plan.characterWidth / 2;
  plan.characters.forEach((character) => {
    const x = cursor + character.width / 2;
    drawGridText5Token(character.text, x, options.y + options.baselineY, options.mode);
    cursor += character.width + options.letterSpace;
  });
}

function drawGridText5Token(token, x, y, mode) {
  if (mode === "stroke" || mode === "both") gridText5Ctx.strokeText(token, x, y);
  if (mode === "fill" || mode === "both") gridText5Ctx.fillText(token, x, y);
}

function getGridText5TokenOpacity(index, options) {
  const seed = gridTextHash(index, options.gx, options.gy, options.slice, options.innerX, options.innerY);
  const random = gridTextFraction(seed);
  return 1 - options.effect.randomAmount * random;
}

function resizeGridText5WaveCanvas() {
  const rect = gridText5WaveCanvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  const width = Math.max(180, Math.round(rect.width * ratio));
  const height = Math.max(90, Math.round(rect.height * ratio));

  if (gridText5WaveCanvas.width !== width || gridText5WaveCanvas.height !== height) {
    gridText5WaveCanvas.width = width;
    gridText5WaveCanvas.height = height;
  }

  drawGridText5WaveGraph();
}

function drawGridText5WaveGraph() {
  const width = gridText5WaveCanvas.width;
  const height = gridText5WaveCanvas.height;
  const pad = 12 * Math.min(window.devicePixelRatio || 1, 1.5);
  const points = gridText5Controls.wavePoints.map((input) => readRangeValue(input, 0) / 100);

  gridText5WaveCtx.clearRect(0, 0, width, height);
  gridText5WaveCtx.fillStyle = "#f5f5f5";
  gridText5WaveCtx.fillRect(0, 0, width, height);
  gridText5WaveCtx.strokeStyle = "rgba(5, 5, 5, 0.16)";
  gridText5WaveCtx.lineWidth = 1;
  gridText5WaveCtx.beginPath();
  gridText5WaveCtx.moveTo(pad, height / 2);
  gridText5WaveCtx.lineTo(width - pad, height / 2);
  for (let i = 0; i < points.length; i++) {
    const x = pad + (i / Math.max(1, points.length - 1)) * (width - pad * 2);
    gridText5WaveCtx.moveTo(x, pad);
    gridText5WaveCtx.lineTo(x, height - pad);
  }
  gridText5WaveCtx.stroke();

  gridText5WaveCtx.strokeStyle = "#050505";
  gridText5WaveCtx.lineWidth = 2;
  gridText5WaveCtx.beginPath();
  for (let i = 0; i <= 140; i++) {
    const t = i / 140;
    const value = sampleGridText5CustomWave(t);
    const x = pad + t * (width - pad * 2);
    const y = gridText5WaveValueToY(value, height, pad);
    if (i === 0) {
      gridText5WaveCtx.moveTo(x, y);
    } else {
      gridText5WaveCtx.lineTo(x, y);
    }
  }
  gridText5WaveCtx.stroke();

  points.forEach((value, index) => {
    const x = pad + (index / Math.max(1, points.length - 1)) * (width - pad * 2);
    const y = gridText5WaveValueToY(value, height, pad);
    gridText5WaveCtx.fillStyle = "#050505";
    gridText5WaveCtx.beginPath();
    gridText5WaveCtx.arc(x, y, 5 * Math.min(window.devicePixelRatio || 1, 1.5), 0, Math.PI * 2);
    gridText5WaveCtx.fill();
  });
}

function gridText5WaveValueToY(value, height, pad) {
  return mix(height - pad, pad, value * 0.5 + 0.5);
}

function gridText5WaveYToValue(y) {
  const height = gridText5WaveCanvas.height;
  const pad = 12 * Math.min(window.devicePixelRatio || 1, 1.5);
  return clamp(((height - pad - y) / Math.max(1, height - pad * 2)) * 2 - 1, -1, 1);
}

function setGridText5WavePointFromEvent(event, index) {
  const rect = gridText5WaveCanvas.getBoundingClientRect();
  const ratio = gridText5WaveCanvas.height / Math.max(1, rect.height);
  const value = Math.round(gridText5WaveYToValue((event.clientY - rect.top) * ratio) * 100);
  setRangeValue(gridText5Controls.wavePoints[index], value);
}

function getGridText5WavePointIndex(event) {
  const rect = gridText5WaveCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const t = clamp(x / Math.max(1, rect.width), 0, 1);
  return clamp(Math.round(t * (gridText5Controls.wavePoints.length - 1)), 0, gridText5Controls.wavePoints.length - 1);
}

function syncGridText5WaveEndpoint(index) {
  if (gridText5SyncingWaveEnds) return;

  const lastIndex = gridText5Controls.wavePoints.length - 1;
  if (index !== 0 && index !== lastIndex) return;

  const source = gridText5Controls.wavePoints[index];
  const target = gridText5Controls.wavePoints[index === 0 ? lastIndex : 0];
  gridText5SyncingWaveEnds = true;
  target.value = source.value;
  updateKnobControl(target);
  gridText5SyncingWaveEnds = false;
}

function bindGridText5Controls() {
  if (!gridText5Controls.form) return;

  gridText5Controls.form.addEventListener("submit", (event) => event.preventDefault());

  const redraw = () => {
    drawGridText5WaveGraph();
    if (!dateThreePanel.hidden && !gridText5Panel.hidden) {
      resizeGridText5Canvas();
    }
  };

  Object.values(gridText5Controls).forEach((control) => {
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return;
    control.addEventListener("input", redraw);
    control.addEventListener("change", redraw);
  });

  gridText5Controls.wavePoints.forEach((control, index) => {
    const redrawPoint = () => {
      syncGridText5WaveEndpoint(index);
      redraw();
    };
    control.addEventListener("input", redrawPoint);
    control.addEventListener("change", redrawPoint);
  });

  [gridText5Controls.fieldAngle, gridText5Controls.direction, gridText5Controls.sliceAngle].forEach((input) => {
    input.addEventListener("input", () => snapGridText5AngleControl(input));
    input.addEventListener("change", () => snapGridText5AngleControl(input));
  });

  gridText5WaveCanvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    gridText5WaveDragIndex = getGridText5WavePointIndex(event);
    gridText5WaveCanvas.setPointerCapture(event.pointerId);
    setGridText5WavePointFromEvent(event, gridText5WaveDragIndex);
  });

  gridText5WaveCanvas.addEventListener("pointermove", (event) => {
    if (gridText5WaveDragIndex < 0) return;
    setGridText5WavePointFromEvent(event, gridText5WaveDragIndex);
  });

  gridText5WaveCanvas.addEventListener("pointerup", () => {
    gridText5WaveDragIndex = -1;
  });

  gridText5WaveCanvas.addEventListener("pointercancel", () => {
    gridText5WaveDragIndex = -1;
  });

  requestAnimationFrame(resizeGridText5WaveCanvas);
}

function snapGridText5AngleControl(input) {
  const value = Number(input.value);
  const snapped = snapGridText2Angle(value);

  if (snapped !== value) {
    input.value = String(snapped);
    updateKnobControl(input);
  }
}

function startGridText6() {
  if (!gridText6Controls.form) return;
  if (gridText6Running) return;
  resetGridText6MotionClock();
  resizeGridText6Canvas();
  resizeGridText6WaveCanvas();
  gridText6Running = true;
  gridText6AnimationFrame = requestAnimationFrame(renderGridText6);
}

function stopGridText6() {
  gridText6Running = false;
  cancelAnimationFrame(gridText6AnimationFrame);
}

function resizeGridText6Canvas() {
  const size = getConfiguredCanvasSize(gridText6Canvas, 420, 360);
  gridText6PixelRatio = size.pixelRatio;
  const { width, height } = size;

  if (gridText6Canvas.width !== width || gridText6Canvas.height !== height) {
    gridText6Canvas.width = width;
    gridText6Canvas.height = height;
  }

  gridText6Ctx.imageSmoothingEnabled = true;
  gridText6Ctx.imageSmoothingQuality = "high";

  if (!gridText6Running) {
    drawGridText6Frame(performance.now());
  }
}

function renderGridText6(timestamp) {
  if (!gridText6Running) return;
  drawGridText6Frame(timestamp);
  gridText6AnimationFrame = requestAnimationFrame(renderGridText6);
}

function resetGridText6MotionClock() {
  gridText6StartTime = performance.now();
  gridText6MotionTime = 0;
  gridText6LastFrameTime = 0;
}

function getGridText6Elapsed(timestamp) {
  if (!gridText6Running) return (timestamp - gridText6StartTime) / 1000;

  if (!gridText6LastFrameTime) {
    gridText6LastFrameTime = timestamp;
    return gridText6MotionTime;
  }

  const rawDelta = clamp((timestamp - gridText6LastFrameTime) / 1000, 0, 1 / 12);
  gridText6LastFrameTime = timestamp;
  gridText6MotionTime += rawDelta;
  return gridText6MotionTime;
}

function drawGridText6Frame(timestamp) {
  const width = gridText6Canvas.width;
  const height = gridText6Canvas.height;
  const text = (gridText6Controls.text.value || "GRID EDIT 6").slice(0, 180);
  const baseWeight = Math.max(100, readRangeValue(gridText6Controls.weight, 700));
  const fontFamily = gridText6Controls.font.value || "Helvetica, Arial, sans-serif";
  const fontSize = 74 * gridText6PixelRatio;
  const baseLetterSpace = readRangeValue(gridText6Controls.letterSpace, 0) * gridText6PixelRatio;
  const padding = readRangeValue(gridText6Controls.padding, 8) * gridText6PixelRatio;
  const mode = gridText6Controls.renderMode.value;
  const repeatX = readRangeValue(gridText6Controls.repeatX, 5);
  const repeatY = readRangeValue(gridText6Controls.repeatY, 3);
  const marginX = Math.max(0, readRangeValue(gridText6Controls.marginX, 0)) * gridText6PixelRatio;
  const marginY = Math.max(0, readRangeValue(gridText6Controls.marginY, 0)) * gridText6PixelRatio;
  const cropX = readRangeValue(gridText6Controls.cropX, 0) / 100;
  const cropY = readRangeValue(gridText6Controls.cropY, 0) / 100;
  const cropToBox = gridText6Controls.cropToBox.checked;
  const viewZoom = Math.max(0.05, readRangeValue(gridText6Controls.zoom, 100) / 100);
  const elapsed = getGridText6Elapsed(timestamp);
  const tempo = mapGridText6Tempo(readRangeValue(gridText6Controls.tempo, 38));
  const phaseX = readRangeValue(gridText6Controls.phaseX, 0) / 100;
  const phaseY = readRangeValue(gridText6Controls.phaseY, 0) / 100;
  const fieldAngle = (snapGridText2Angle(readRangeValue(gridText6Controls.fieldAngle, 0)) * Math.PI) / 180;
  const fieldPhase = readRangeValue(gridText6Controls.fieldPhase, 0) / 100;
  const direction = (snapGridText2Angle(readRangeValue(gridText6Controls.direction, 0)) * Math.PI) / 180;
  const positionSnapUnit = Math.max(0.25, readRangeValue(gridText6Controls.positionSnapUnit, 25) / 100);
  const shouldSnapPosition = gridText6Controls.positionSnap.checked;
  const baseScale = Math.max(0.05, readRangeValue(gridText6Controls.scale, 100) / 100);
  const scaleAmount = readRangeValue(gridText6Controls.scaleAmount, 0) / 100;
  const rotationAmp = (readRangeValue(gridText6Controls.rotation, 0) * Math.PI) / 180;
  const skewXAmp = readRangeValue(gridText6Controls.skewX, 0) / 100;
  const skewYAmp = readRangeValue(gridText6Controls.skewY, 0) / 100;
  const requestedSlices = Math.max(0, Math.round(readRangeValue(gridText6Controls.timeSlices, 0)));
  const rawSlicePhase = readRangeValue(gridText6Controls.slicePhase, 0) / 100;
  const slicePhase = gridText6Controls.sliceSnap.checked ? Math.round(rawSlicePhase * 4) / 4 : rawSlicePhase;
  const shouldDelaySlices = requestedSlices > 1 && Math.abs(slicePhase) > 0.0001;
  const sliceTotal = shouldDelaySlices ? requestedSlices : 1;
  const sliceAxis = gridText6Controls.sliceAxis.value;
  const sliceAngle = (snapGridText2Angle(readRangeValue(gridText6Controls.sliceAngle, 0)) * Math.PI) / 180;
  const innerRepeatX = readRangeValue(gridText6Controls.innerRepeatX, 0);
  const innerRepeatY = readRangeValue(gridText6Controls.innerRepeatY, 0);
  const innerGap = readRangeValue(gridText6Controls.innerGap, 0) * gridText6PixelRatio;
  const stretchX = Math.max(0.05, readRangeValue(gridText6Controls.stretchX, 100) / 100);
  const stretchY = Math.max(0.05, readRangeValue(gridText6Controls.stretchY, 100) / 100);
  const bendAmount = readRangeValue(gridText6Controls.bend, 0) * gridText6PixelRatio;
  const waveWarpAmount = readRangeValue(gridText6Controls.waveWarp, 0) * gridText6PixelRatio;
  const warpFrequency = Math.max(1, readRangeValue(gridText6Controls.warpFrequency, 4));
  const warpAngle = (snapGridText2Angle(readRangeValue(gridText6Controls.warpAngle, 90)) * Math.PI) / 180;
  const perspectiveAmount = readRangeValue(gridText6Controls.perspective, 0) / 100;
  const baseOpacity = readRangeValue(gridText6Controls.opacity, 100) / 100;
  const weightAmount = readRangeValue(gridText6Controls.weightAmount, 0);
  const letterAmount = readRangeValue(gridText6Controls.letterAmount, 0) * gridText6PixelRatio;
  const opacityAmount = readRangeValue(gridText6Controls.opacityAmount, 0) / 100;
  const textColor = "#f5f5f5";

  gridText6Ctx.clearRect(0, 0, width, height);
  gridText6Ctx.fillStyle = "#050505";
  gridText6Ctx.fillRect(0, 0, width, height);
  gridText6Ctx.textAlign = "center";
  gridText6Ctx.textBaseline = "alphabetic";
  gridText6Ctx.fontKerning = "normal";
  gridText6Ctx.textRendering = "geometricPrecision";
  gridText6Ctx.lineJoin = "round";
  gridText6Ctx.lineCap = "round";

  const envelopeWeight = getGridText6EnvelopeValue(baseWeight, weightAmount, gridText6Controls.weightMode.value, 100, 900);
  const envelopeLetterSpace = getGridText6EnvelopeValue(baseLetterSpace, letterAmount, gridText6Controls.letterMode.value, -120 * gridText6PixelRatio, 240 * gridText6PixelRatio);
  gridText6Ctx.font = `${Math.round(envelopeWeight)} ${fontSize}px ${fontFamily}`;
  const envelopeLayout = getGridText6TextLayout(text, envelopeLetterSpace, fontSize);
  const cellWidth = Math.max(12 * gridText6PixelRatio, envelopeLayout.width + padding * 2);
  const cellHeight = Math.max(12 * gridText6PixelRatio, envelopeLayout.height + padding * 2);
  const boxWidth = Math.max(2 * gridText6PixelRatio, cellWidth * (1 - cropX * 2));
  const boxHeight = Math.max(2 * gridText6PixelRatio, cellHeight * (1 - cropY * 2));
  const stepX = boxWidth + marginX;
  const stepY = boxHeight + marginY;
  let positionRatio = readRangeValue(gridText6Controls.position, 0) / 100;

  if (shouldSnapPosition) {
    positionRatio = Math.round(positionRatio / positionSnapUnit) * positionSnapUnit;
  }

  const positionDistance = positionRatio * Math.max(boxWidth, boxHeight);
  const positionX = Math.cos(direction) * positionDistance;
  const positionY = Math.sin(direction) * positionDistance;
  const motionAngle = Math.abs(positionX) + Math.abs(positionY) > 0.001 ? Math.atan2(positionY, positionX) : direction;
  const centerX = width / 2;
  const centerY = height / 2;
  const visible = getGridText6VisibleRange({
    centerX,
    centerY,
    width,
    height,
    viewZoom,
    repeatX,
    repeatY,
    stepX,
    stepY,
    cellWidth,
    cellHeight,
  });
  const effect = {
    randomAmount: readRangeValue(gridText6Controls.opacityRandom, 0) / 100,
    opacityUnit: gridText6Controls.opacityUnit.value,
  };

  gridText6Ctx.save();
  gridText6Ctx.translate(centerX, centerY);
  gridText6Ctx.scale(viewZoom, viewZoom);
  gridText6Ctx.translate(-centerX, -centerY);
  gridText6Ctx.strokeStyle = "rgba(245, 245, 245, 0.18)";
  gridText6Ctx.lineWidth = Math.max(0.6, gridText6PixelRatio / viewZoom);

  for (let gy = visible.minY; gy <= visible.maxY; gy++) {
    for (let gx = visible.minX; gx <= visible.maxX; gx++) {
      const baseX = centerX + gx * stepX;
      const baseY = centerY + gy * stepY;
      const fieldProjection = gx * Math.cos(fieldAngle) + gy * Math.sin(fieldAngle);
      const basePhase = elapsed * tempo - gx * phaseX - gy * phaseY - fieldProjection * fieldPhase;

      if (gridText6Controls.showBoxes.checked) {
        gridText6Ctx.strokeRect(baseX - boxWidth / 2, baseY - boxHeight / 2, boxWidth, boxHeight);
      }

      for (let slice = 0; slice < sliceTotal; slice++) {
        const sliceProgress = sliceTotal === 1 ? 0 : slice / Math.max(1, sliceTotal - 1);
        const localPhase = shouldDelaySlices ? basePhase - sliceProgress * slicePhase : basePhase;
        const wave = getGridText6Wave(localPhase);
        const envelope = Math.max(0, wave.value);
        const effectiveWeight = applyGridText6DirectedValue(baseWeight, weightAmount, gridText6Controls.weightMode.value, envelope, 100, 900);
        const effectiveLetterSpace = applyGridText6DirectedValue(baseLetterSpace, letterAmount, gridText6Controls.letterMode.value, envelope, -120 * gridText6PixelRatio, 240 * gridText6PixelRatio);
        const opacityWave = applyGridText6DirectedValue(baseOpacity, opacityAmount, gridText6Controls.opacityMode.value, envelope, 0, 1);
        const effectiveOpacity = clamp(opacityWave, 0, 1);
        const scale = applyGridText6DirectedValue(baseScale, scaleAmount, gridText6Controls.scaleMode.value, envelope, 0.03, 8);
        const offsetX = positionX * wave.value;
        const offsetY = positionY * wave.value;
        const rotation = wave.value * rotationAmp;
        const skewX = wave.value * skewXAmp * 0.45;
        const skewY = wave.value * skewYAmp * 0.45;
        const perspective = wave.value * perspectiveAmount * 0.25;
        const perspectiveX = perspective * Math.cos(warpAngle);
        const perspectiveY = perspective * Math.sin(warpAngle);

        gridText6Ctx.font = `${Math.round(effectiveWeight)} ${fontSize}px ${fontFamily}`;
        const drawLayout = getGridText6TextLayout(text, effectiveLetterSpace, fontSize);
        const textPlan = makeGridText6Plan(text, effectiveLetterSpace);
        const warp = {
          bend: bendAmount * wave.value,
          wave: waveWarpAmount * wave.value,
          frequency: warpFrequency,
          angle: warpAngle,
          phase: localPhase,
          active: Math.abs(bendAmount) > 0.01 || Math.abs(waveWarpAmount) > 0.01,
        };

        gridText6Ctx.save();
        clipGridText6TimeSlice(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, sliceAxis, motionAngle, sliceAngle, cropToBox);
        gridText6Ctx.translate(baseX + offsetX, baseY + offsetY);
        gridText6Ctx.rotate(rotation);
        gridText6Ctx.transform(1, skewY + perspectiveY, skewX + perspectiveX, 1, 0, 0);
        gridText6Ctx.scale(scale * stretchX, scale * stretchY);

        for (let innerY = -innerRepeatY; innerY <= innerRepeatY; innerY++) {
          for (let innerX = -innerRepeatX; innerX <= innerRepeatX; innerX++) {
            drawGridText6String(textPlan, {
              mode,
              fontSize,
              letterSpace: effectiveLetterSpace,
              baselineY: drawLayout.baselineY,
              x: drawLayout.anchorOffsetX + innerX * (envelopeLayout.width + innerGap),
              y: innerY * (envelopeLayout.height + innerGap),
              color: textColor,
              opacity: effectiveOpacity,
              effect,
              warp,
              gx,
              gy,
              slice,
              innerX,
              innerY,
            });
          }
        }
        gridText6Ctx.restore();
      }
    }
  }

  gridText6Ctx.restore();
}

function getGridText6EnvelopeValue(base, amount, mode, min, max) {
  if (mode === "grow") return clamp(base + Math.max(0, amount), min, max);
  return clamp(base, min, max);
}

function applyGridText6DirectedValue(base, amount, mode, unit, min, max) {
  if (mode === "grow") return clamp(base + amount * unit, min, max);
  if (mode === "shrink") return clamp(base - amount * unit, min, max);
  return clamp(base, min, max);
}

function mapGridText6Tempo(value) {
  const t = clamp(value / 100, 0, 1);
  if (t <= 0) return 0;
  return mix(0.01, 3.4, Math.pow(t, 2.35));
}

function getGridText6Wave(phase) {
  const mode = gridText6Controls.waveMode.value;
  const cycle = positiveModulo(phase, 1);

  if (mode === "sine") {
    const sine = Math.sin(cycle * Math.PI * 2);
    return { value: sine, unit: sine * 0.5 + 0.5 };
  }

  if (mode === "return") {
    const ramp = cycle < 0.5 ? cycle * 2 : (1 - cycle) * 2;
    return { value: ramp, unit: ramp };
  }

  if (mode === "triangle") {
    const triangle = 1 - Math.abs(cycle * 2 - 1);
    return { value: triangle * 2 - 1, unit: triangle };
  }

  if (mode === "step") {
    const pulse = cycle < 0.5 ? 0 : 1;
    return { value: pulse, unit: pulse };
  }

  const value = sampleGridText6CustomWave(cycle);
  return { value, unit: value * 0.5 + 0.5 };
}

function sampleGridText6CustomWave(cycle) {
  const points = gridText6Controls.wavePoints.map((input) => readRangeValue(input, 0) / 100);
  const segmentCount = Math.max(1, points.length - 1);
  const scaled = positiveModulo(cycle, 1) * segmentCount;
  const index = Math.min(segmentCount - 1, Math.floor(scaled));
  const nextIndex = index + 1;
  const rawT = scaled - Math.floor(scaled);
  const smoothT = rawT * rawT * (3 - 2 * rawT);
  const smoothAmount = readRangeValue(gridText6Controls.waveSmooth, 30) / 100;
  const t = mix(rawT, smoothT, smoothAmount);
  return mix(points[index], points[nextIndex], t);
}

function getGridText6VisibleRange({ centerX, centerY, width, height, viewZoom, repeatX, repeatY, stepX, stepY, cellWidth, cellHeight }) {
  const left = centerX - width / (2 * viewZoom) - cellWidth * 2;
  const right = centerX + width / (2 * viewZoom) + cellWidth * 2;
  const top = centerY - height / (2 * viewZoom) - cellHeight * 2;
  const bottom = centerY + height / (2 * viewZoom) + cellHeight * 2;

  return {
    minX: Math.max(-repeatX, Math.floor((left - centerX) / stepX) - 1),
    maxX: Math.min(repeatX, Math.ceil((right - centerX) / stepX) + 1),
    minY: Math.max(-repeatY, Math.floor((top - centerY) / stepY) - 1),
    maxY: Math.min(repeatY, Math.ceil((bottom - centerY) / stepY) + 1),
  };
}

function clipGridText6TimeSlice(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, axis, motionAngle, sliceAngle, cropToBox) {
  if (cropToBox || sliceTotal > 1) {
    gridText6Ctx.beginPath();
    gridText6Ctx.rect(baseX - boxWidth / 2, baseY - boxHeight / 2, boxWidth, boxHeight);
    gridText6Ctx.clip();
  }

  if (sliceTotal <= 1) return;

  gridText6Ctx.beginPath();
  if (axis === "y") {
    const sliceHeight = boxHeight / sliceTotal;
    const y = baseY - boxHeight / 2 + slice * sliceHeight;
    gridText6Ctx.rect(baseX - boxWidth / 2, y, boxWidth, sliceHeight);
  } else if (axis === "motion") {
    addGridText6AngledSlicePath(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, motionAngle);
  } else if (axis === "angle") {
    addGridText6AngledSlicePath(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, sliceAngle);
  } else {
    const sliceWidth = boxWidth / sliceTotal;
    const x = baseX - boxWidth / 2 + slice * sliceWidth;
    gridText6Ctx.rect(x, baseY - boxHeight / 2, sliceWidth, boxHeight);
  }
  gridText6Ctx.clip();
}

function addGridText6AngledSlicePath(baseX, baseY, boxWidth, boxHeight, slice, sliceTotal, angle) {
  const diagonal = Math.hypot(boxWidth, boxHeight);
  const sliceWidth = diagonal / sliceTotal;
  const x0 = -diagonal / 2 + slice * sliceWidth;
  const x1 = x0 + sliceWidth;
  const y0 = -diagonal;
  const y1 = diagonal;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const points = [
    [x0, y0],
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ];

  points.forEach(([x, y], index) => {
    const px = baseX + x * cos - y * sin;
    const py = baseY + x * sin + y * cos;
    if (index === 0) {
      gridText6Ctx.moveTo(px, py);
    } else {
      gridText6Ctx.lineTo(px, py);
    }
  });
  gridText6Ctx.closePath();
}

function getGridText6TextLayout(text, letterSpace, fontSize) {
  const metrics = gridText6Ctx.measureText(text);
  const ascent = Math.max(1, metrics.actualBoundingBoxAscent || fontSize * 0.72);
  const descent = Math.max(0, metrics.actualBoundingBoxDescent || 0);
  const left = Number.isFinite(metrics.actualBoundingBoxLeft) ? metrics.actualBoundingBoxLeft : metrics.width / 2;
  const right = Number.isFinite(metrics.actualBoundingBoxRight) ? metrics.actualBoundingBoxRight : metrics.width / 2;
  const letterGapWidth = Math.max(0, Array.from(text).length - 1) * letterSpace;
  const visualWidth = Math.max(metrics.width, left + right) + letterGapWidth;

  return {
    anchorOffsetX: (left - right) / 2,
    baselineY: (ascent - descent) / 2,
    width: Math.max(1, visualWidth),
    height: Math.max(1, ascent + descent),
  };
}

function makeGridText6Plan(text, letterSpace) {
  const characters = [];
  let wordIndex = -1;

  (text.match(/\S+|\s+/g) || [text]).forEach((token) => {
    const isWord = /\S/.test(token);
    if (isWord) wordIndex += 1;
    Array.from(token).forEach((character) => {
      characters.push({
        text: character,
        width: gridText6Ctx.measureText(character).width,
        wordIndex: isWord ? wordIndex : -1,
      });
    });
  });

  return {
    text,
    characters,
    characterWidth: characters.reduce((sum, item) => sum + item.width, 0) + Math.max(0, characters.length - 1) * letterSpace,
  };
}

function drawGridText6String(plan, options) {
  gridText6Ctx.lineWidth = Math.max(1, options.fontSize * 0.035);
  gridText6Ctx.strokeStyle = options.color;
  gridText6Ctx.fillStyle = options.color;

  if (!options.warp.active && Math.abs(options.letterSpace) < 0.01 && options.effect.randomAmount <= 0) {
    gridText6Ctx.globalAlpha = clamp(options.opacity, 0, 1);
    drawGridText6Token(plan.text, options.x, options.y + options.baselineY, options.mode);
    return;
  }

  let cursor = options.x - plan.characterWidth / 2;
  plan.characters.forEach((character, index) => {
    const x = cursor + character.width / 2;
    const alpha = getGridText6CharacterOpacity(character, index, options);
    gridText6Ctx.globalAlpha = clamp(options.opacity * alpha, 0, 1);
    drawGridText6Character(character.text, x, options.y + options.baselineY, plan.characterWidth, options);
    cursor += character.width + options.letterSpace;
  });
}

function drawGridText6Character(character, x, y, totalWidth, options) {
  if (!options.warp.active) {
    drawGridText6Token(character, x, y, options.mode);
    return;
  }

  const normalized = totalWidth <= 0 ? 0 : clamp((x - options.x) / Math.max(1, totalWidth / 2), -1, 1);
  const wavePhase = (normalized * options.warp.frequency + options.warp.phase) * Math.PI * 2;
  const bendOffset = options.warp.bend * (normalized * normalized - 0.25);
  const waveOffset = options.warp.wave * Math.sin(wavePhase);
  const totalOffset = bendOffset + waveOffset;
  const offsetX = Math.cos(options.warp.angle) * totalOffset;
  const offsetY = Math.sin(options.warp.angle) * totalOffset;
  const bendTilt = options.warp.bend * normalized * 0.0025;
  const waveTilt = options.warp.wave * Math.cos(wavePhase) * options.warp.frequency * 0.0015;

  gridText6Ctx.save();
  gridText6Ctx.translate(x + offsetX, y + offsetY);
  gridText6Ctx.rotate(bendTilt + waveTilt);
  drawGridText6Token(character, 0, 0, options.mode);
  gridText6Ctx.restore();
}

function drawGridText6Token(token, x, y, mode) {
  if (mode === "stroke" || mode === "both") gridText6Ctx.strokeText(token, x, y);
  if (mode === "fill" || mode === "both") gridText6Ctx.fillText(token, x, y);
}

function getGridText6CharacterOpacity(character, index, options) {
  if (options.effect.randomAmount <= 0) return 1;

  let seedIndex = index;
  if (options.effect.opacityUnit === "cell") seedIndex = 0;
  if (options.effect.opacityUnit === "word") seedIndex = character.wordIndex < 0 ? index : character.wordIndex;

  const seed = gridTextHash(seedIndex, options.gx, options.gy, options.slice, options.innerX, options.innerY);
  const random = gridTextFraction(seed);
  return 1 - options.effect.randomAmount * random;
}

function resizeGridText6WaveCanvas() {
  const rect = gridText6WaveCanvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  const width = Math.max(180, Math.round(rect.width * ratio));
  const height = Math.max(110, Math.round(rect.height * ratio));

  if (gridText6WaveCanvas.width !== width || gridText6WaveCanvas.height !== height) {
    gridText6WaveCanvas.width = width;
    gridText6WaveCanvas.height = height;
  }

  drawGridText6WaveGraph();
}

function drawGridText6WaveGraph() {
  const width = gridText6WaveCanvas.width;
  const height = gridText6WaveCanvas.height;
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  const pad = 14 * ratio;
  const points = gridText6Controls.wavePoints.map((input) => readRangeValue(input, 0) / 100);

  gridText6WaveCtx.clearRect(0, 0, width, height);
  gridText6WaveCtx.fillStyle = "#050505";
  gridText6WaveCtx.fillRect(0, 0, width, height);
  gridText6WaveCtx.strokeStyle = "rgba(245, 245, 245, 0.12)";
  gridText6WaveCtx.lineWidth = 1;

  for (let i = 0; i <= 8; i++) {
    const x = pad + (i / 8) * (width - pad * 2);
    gridText6WaveCtx.beginPath();
    gridText6WaveCtx.moveTo(x, pad);
    gridText6WaveCtx.lineTo(x, height - pad);
    gridText6WaveCtx.stroke();
  }

  for (let i = 0; i <= 4; i++) {
    const y = pad + (i / 4) * (height - pad * 2);
    gridText6WaveCtx.beginPath();
    gridText6WaveCtx.moveTo(pad, y);
    gridText6WaveCtx.lineTo(width - pad, y);
    gridText6WaveCtx.stroke();
  }

  gridText6WaveCtx.strokeStyle = "rgba(245, 245, 245, 0.42)";
  gridText6WaveCtx.beginPath();
  gridText6WaveCtx.moveTo(pad, height / 2);
  gridText6WaveCtx.lineTo(width - pad, height / 2);
  gridText6WaveCtx.stroke();

  gridText6WaveCtx.strokeStyle = "#f5f5f5";
  gridText6WaveCtx.lineWidth = 2 * ratio;
  gridText6WaveCtx.beginPath();
  for (let i = 0; i <= 180; i++) {
    const t = i / 180;
    const value = sampleGridText6CustomWave(t);
    const x = pad + t * (width - pad * 2);
    const y = gridText6WaveValueToY(value, height, pad);
    if (i === 0) {
      gridText6WaveCtx.moveTo(x, y);
    } else {
      gridText6WaveCtx.lineTo(x, y);
    }
  }
  gridText6WaveCtx.stroke();

  points.forEach((value, index) => {
    const x = pad + (index / Math.max(1, points.length - 1)) * (width - pad * 2);
    const y = gridText6WaveValueToY(value, height, pad);
    const handle = 8 * ratio;
    gridText6WaveCtx.fillStyle = "#f5f5f5";
    gridText6WaveCtx.fillRect(x - handle / 2, y - handle / 2, handle, handle);
    gridText6WaveCtx.strokeStyle = "#050505";
    gridText6WaveCtx.lineWidth = 1;
    gridText6WaveCtx.strokeRect(x - handle / 2, y - handle / 2, handle, handle);
  });
}

function gridText6WaveValueToY(value, height, pad) {
  return mix(height - pad, pad, value * 0.5 + 0.5);
}

function gridText6WaveYToValue(y) {
  const height = gridText6WaveCanvas.height;
  const pad = 14 * Math.min(window.devicePixelRatio || 1, 1.5);
  return clamp(((height - pad - y) / Math.max(1, height - pad * 2)) * 2 - 1, -1, 1);
}

function setGridText6WavePointFromEvent(event, index) {
  const rect = gridText6WaveCanvas.getBoundingClientRect();
  const ratio = gridText6WaveCanvas.height / Math.max(1, rect.height);
  const value = Math.round(gridText6WaveYToValue((event.clientY - rect.top) * ratio) * 100);
  setRangeValue(gridText6Controls.wavePoints[index], value);
}

function getGridText6WavePointIndex(event) {
  const rect = gridText6WaveCanvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const t = clamp(x / Math.max(1, rect.width), 0, 1);
  return clamp(Math.round(t * (gridText6Controls.wavePoints.length - 1)), 0, gridText6Controls.wavePoints.length - 1);
}

function syncGridText6WaveEndpoint(index) {
  if (gridText6SyncingWaveEnds) return;

  const lastIndex = gridText6Controls.wavePoints.length - 1;
  if (index !== 0 && index !== lastIndex) return;

  const source = gridText6Controls.wavePoints[index];
  const target = gridText6Controls.wavePoints[index === 0 ? lastIndex : 0];
  gridText6SyncingWaveEnds = true;
  target.value = source.value;
  updateKnobControl(target);
  gridText6SyncingWaveEnds = false;
}

function getGridText6SettingControls() {
  if (!gridText6Controls.form) return [];
  return Array.from(gridText6Controls.form.querySelectorAll("input, select")).filter((control) => {
    return control.id && control.id.startsWith("grid6-") && !control.id.startsWith("grid6-preset");
  });
}

function collectGridText6Preset() {
  const settings = {};

  getGridText6SettingControls().forEach((control) => {
    settings[control.id] = control.type === "checkbox" ? control.checked : control.value;
  });

  return {
    version: 1,
    savedAt: new Date().toISOString(),
    settings,
  };
}

function getGridText6TextOnlySettings() {
  return {
    "grid6-font": "Helvetica, Arial, sans-serif",
    "grid6-weight": "700",
    "grid6-letter-space": "0",
    "grid6-render-mode": "fill",
    "grid6-opacity": "100",
    "grid6-repeat-x": "0",
    "grid6-repeat-y": "0",
    "grid6-margin-x": "0",
    "grid6-margin-y": "0",
    "grid6-padding": "8",
    "grid6-crop-x": "0",
    "grid6-crop-y": "0",
    "grid6-crop-to-box": false,
    "grid6-show-boxes": false,
    "grid6-zoom": "100",
    "grid6-wave-mode": "custom",
    "grid6-tempo": "0",
    "grid6-wave-smooth": "0",
    "grid6-wave-point-0": "0",
    "grid6-wave-point-1": "0",
    "grid6-wave-point-2": "0",
    "grid6-wave-point-3": "0",
    "grid6-wave-point-4": "0",
    "grid6-phase-x": "0",
    "grid6-phase-y": "0",
    "grid6-field-angle": "0",
    "grid6-field-phase": "0",
    "grid6-position": "0",
    "grid6-direction": "0",
    "grid6-position-snap-unit": "25",
    "grid6-position-snap": true,
    "grid6-scale": "100",
    "grid6-scale-mode": "static",
    "grid6-scale-amount": "0",
    "grid6-rotation": "0",
    "grid6-skew-x": "0",
    "grid6-skew-y": "0",
    "grid6-time-slices": "0",
    "grid6-slice-phase": "0",
    "grid6-slice-snap": false,
    "grid6-slice-axis": "x",
    "grid6-slice-angle": "0",
    "grid6-inner-repeat-x": "0",
    "grid6-inner-repeat-y": "0",
    "grid6-inner-gap": "0",
    "grid6-stretch-x": "100",
    "grid6-stretch-y": "100",
    "grid6-bend": "0",
    "grid6-wave-warp": "0",
    "grid6-warp-frequency": "4",
    "grid6-warp-angle": "90",
    "grid6-perspective": "0",
    "grid6-weight-mode": "static",
    "grid6-weight-amount": "0",
    "grid6-letter-mode": "static",
    "grid6-letter-amount": "0",
    "grid6-opacity-mode": "static",
    "grid6-opacity-amount": "0",
    "grid6-opacity-random": "0",
    "grid6-opacity-unit": "letter",
  };
}

function applyGridText6Settings(settings, options = {}) {
  const currentText = gridText6Controls.text.value;

  getGridText6SettingControls().forEach((control) => {
    if (options.preserveText && control === gridText6Controls.text) return;
    if (!Object.prototype.hasOwnProperty.call(settings, control.id)) return;
    setGridText6ControlValue(control, settings[control.id]);
  });

  if (options.preserveText) {
    gridText6Controls.text.value = currentText;
  }

  drawGridText6WaveGraph();
  resizeGridText6Canvas();
}

function setGridText6ControlValue(control, value) {
  if (control instanceof HTMLInputElement && control.type === "checkbox") {
    control.checked = value === true || value === "true";
    return;
  }

  if (control instanceof HTMLInputElement && control.type === "range") {
    const min = Number(control.min);
    const max = Number(control.max);
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      const step = getRangeStep(control);
      const stepped = Math.round((clamp(numeric, min, max) - min) / step) * step + min;
      control.value = String(clamp(stepped, min, max));
      updateKnobControl(control);
    }
    return;
  }

  if (control instanceof HTMLSelectElement) {
    const option = Array.from(control.options).find((item) => item.value === String(value));
    if (option) control.value = String(value);
    return;
  }

  control.value = String(value);
}

function readGridText6Presets() {
  try {
    const stored = JSON.parse(localStorage.getItem(gridText6PresetStorageKey) || "{}");
    if (stored && typeof stored === "object" && !Array.isArray(stored)) {
      gridText6PresetMemory = stored;
      return stored;
    }
  } catch (error) {
    return gridText6PresetMemory;
  }

  return gridText6PresetMemory;
}

function writeGridText6Presets(presets) {
  gridText6PresetMemory = presets;

  try {
    localStorage.setItem(gridText6PresetStorageKey, JSON.stringify(presets));
  } catch (error) {
    setGridText6PresetStatus("Saved for this session");
  }
}

function refreshGridText6PresetSelect(selectedName = "") {
  const select = gridText6Controls.presetSelect;
  if (!select) return;

  const presets = readGridText6Presets();
  const names = Object.keys(presets).sort((a, b) => a.localeCompare(b));
  select.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = names.length ? "Saved Presets" : "No Presets";
  select.appendChild(placeholder);

  names.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });

  if (selectedName && names.includes(selectedName)) {
    select.value = selectedName;
  }
}

function getGridText6PresetName(presets) {
  const typedName = gridText6Controls.presetName.value.trim().replace(/\s+/g, " ");
  if (typedName) return typedName.slice(0, 64);

  const textName = (gridText6Controls.text.value || "Grid Edit 6").trim().replace(/\s+/g, " ").slice(0, 24) || "Preset";
  let index = Object.keys(presets).length + 1;
  let name = `${textName} ${index}`;

  while (presets[name]) {
    index += 1;
    name = `${textName} ${index}`;
  }

  return name;
}

function saveGridText6Preset() {
  const presets = readGridText6Presets();
  const name = getGridText6PresetName(presets);
  presets[name] = collectGridText6Preset();
  writeGridText6Presets(presets);
  gridText6Controls.presetName.value = name;
  refreshGridText6PresetSelect(name);
  setGridText6PresetStatus("Preset saved");
}

function loadGridText6Preset() {
  const name = gridText6Controls.presetSelect.value;
  const presets = readGridText6Presets();
  const preset = presets[name];

  if (!preset || !preset.settings) {
    setGridText6PresetStatus("Select a preset");
    return;
  }

  applyGridText6Settings(preset.settings);
  gridText6Controls.presetName.value = name;
  setGridText6PresetStatus("Preset loaded");
}

function deleteGridText6Preset() {
  const name = gridText6Controls.presetSelect.value;
  const presets = readGridText6Presets();

  if (!name || !presets[name]) {
    setGridText6PresetStatus("Select a preset");
    return;
  }

  delete presets[name];
  writeGridText6Presets(presets);
  refreshGridText6PresetSelect();
  setGridText6PresetStatus("Preset deleted");
}

function resetGridText6ToTextOnly() {
  applyGridText6Settings(getGridText6TextOnlySettings(), { preserveText: true });
  gridText6Controls.presetSelect.value = "";
  gridText6Controls.presetName.value = "";
  resetGridText6MotionClock();
  setGridText6PresetStatus("Text only");
}

function setGridText6PresetStatus(message) {
  if (!gridText6Controls.presetStatus) return;
  const token = gridText6PresetStatusToken + 1;
  gridText6PresetStatusToken = token;
  gridText6Controls.presetStatus.textContent = message;
  window.setTimeout(() => {
    if (gridText6PresetStatusToken === token) {
      gridText6Controls.presetStatus.textContent = "";
    }
  }, 2200);
}

function bindGridText6Controls() {
  if (!gridText6Controls.form) return;

  gridText6Controls.form.addEventListener("submit", (event) => event.preventDefault());

  const redraw = () => {
    drawGridText6WaveGraph();
    if (!dateThreePanel.hidden && !gridText6Panel.hidden) {
      resizeGridText6Canvas();
    }
  };

  Object.values(gridText6Controls).forEach((control) => {
    if (Array.isArray(control)) return;
    if (control.id && control.id.startsWith("grid6-preset")) return;
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return;
    control.addEventListener("input", redraw);
    control.addEventListener("change", redraw);
  });

  gridText6Controls.wavePoints.forEach((control, index) => {
    const redrawPoint = () => {
      syncGridText6WaveEndpoint(index);
      redraw();
    };
    control.addEventListener("input", redrawPoint);
    control.addEventListener("change", redrawPoint);
  });

  [gridText6Controls.fieldAngle, gridText6Controls.direction, gridText6Controls.sliceAngle, gridText6Controls.warpAngle].forEach((input) => {
    input.addEventListener("input", () => snapGridText6AngleControl(input));
    input.addEventListener("change", () => snapGridText6AngleControl(input));
  });

  gridText6WaveCanvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    gridText6WaveDragIndex = getGridText6WavePointIndex(event);
    gridText6WaveCanvas.setPointerCapture(event.pointerId);
    setGridText6WavePointFromEvent(event, gridText6WaveDragIndex);
  });

  gridText6WaveCanvas.addEventListener("pointermove", (event) => {
    if (gridText6WaveDragIndex < 0) return;
    setGridText6WavePointFromEvent(event, gridText6WaveDragIndex);
  });

  gridText6WaveCanvas.addEventListener("pointerup", () => {
    gridText6WaveDragIndex = -1;
  });

  gridText6WaveCanvas.addEventListener("pointercancel", () => {
    gridText6WaveDragIndex = -1;
  });

  gridText6Controls.savePreset.addEventListener("click", saveGridText6Preset);
  gridText6Controls.loadPreset.addEventListener("click", loadGridText6Preset);
  gridText6Controls.deletePreset.addEventListener("click", deleteGridText6Preset);
  gridText6Controls.resetTextOnly.addEventListener("click", resetGridText6ToTextOnly);

  refreshGridText6PresetSelect();
  requestAnimationFrame(resizeGridText6WaveCanvas);
}

function snapGridText6AngleControl(input) {
  const value = Number(input.value);
  const snapped = snapGridText2Angle(value);

  if (snapped !== value) {
    input.value = String(snapped);
    updateKnobControl(input);
  }
}

class TextBlock {
  constructor(options) {
    Object.assign(this, options);
  }

  draw(ctx, time, params) {
    const pulse = 1 + Math.sin(time * 2 + this.phase) * params.pulse * 0.12;
    const driftX = Math.sin(time * 0.9 + this.phase) * params.scan * this.scanX;
    const driftY = Math.cos(time * 0.8 + this.phase * 1.3) * params.scan * this.scanY;

    ctx.save();
    ctx.translate(this.x + driftX, this.y + driftY);
    ctx.rotate(this.rotation + Math.sin(time * 0.6 + this.phase) * this.rotationMotion);
    ctx.scale(this.stretchX * pulse, this.stretchY / Math.max(0.35, pulse));
    ctx.font = `${params.weight} ${this.size}px ${params.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f5f5f5";
    ctx.globalAlpha = this.alpha;
    this.drawLetters(ctx, params);
    ctx.restore();
  }

  drawLetters(ctx, params) {
    const letters = Array.from(this.text);
    const widths = letters.map((letter) => ctx.measureText(letter).width);
    const totalWidth = widths.reduce((sum, width) => sum + width, 0) + Math.max(0, letters.length - 1) * params.letterSpace;
    let cursor = -totalWidth / 2;

    letters.forEach((letter, index) => {
      const width = widths[index];
      const letterSeed = typeIdentityNoise(this.seed, index, 7);
      const letterStretch = 1 + (letterSeed - 0.5) * params.letterStretch;
      const yKick = (typeIdentityNoise(this.seed, index, 13) - 0.5) * params.letterLift;

      ctx.save();
      ctx.translate(cursor + width / 2, yKick);
      ctx.scale(Math.max(0.2, letterStretch), 1);
      ctx.fillText(letter, 0, 0);
      ctx.restore();
      cursor += width + params.letterSpace;
    });
  }
}

class ArcGlyph {
  constructor(options) {
    Object.assign(this, options);
  }

  draw(ctx, time) {
    const motion = Math.sin(time * 0.7 + this.phase) * 0.08;
    const size = this.size * (1 + Math.sin(time + this.phase) * this.pulse);
    const radius = size * 0.42;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation + motion);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.strokeStyle = "#f5f5f5";
    ctx.lineWidth = Math.max(2, size * 0.09);
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.68, -Math.PI * 0.55, Math.PI * 0.55);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.68, Math.PI * 0.45, Math.PI * 1.55);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-radius, 0);
    ctx.quadraticCurveTo(0, -radius * 0.28, radius, 0);
    ctx.moveTo(-radius, 0);
    ctx.quadraticCurveTo(0, radius * 0.28, radius, 0);
    ctx.stroke();
    ctx.restore();
  }
}

class MaskSlice {
  constructor(params) {
    this.params = params;
  }

  draw(ctx, width, height, time) {
    const slices = Math.round(this.params.slices);
    const maskBlocks = Math.round(this.params.maskBlocks);

    if (slices > 0) {
      this.drawSlices(ctx, width, height, time, slices);
    }

    if (maskBlocks > 0) {
      this.drawBlocks(ctx, width, height, time, maskBlocks);
    }
  }

  drawSlices(ctx, width, height, time, slices) {
    const diagonal = Math.hypot(width, height);
    const sliceHeight = diagonal / Math.max(1, slices * 2.3);
    const drift = this.params.sliceDrift * Math.sin(time * 1.7);

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(this.params.sliceAngle);
    ctx.fillStyle = "#050505";

    for (let index = -slices; index <= slices; index++) {
      const flicker = typeIdentityNoise(this.params.seed, index, Math.floor(time * this.params.maskFlicker + 12));
      if (this.params.maskFlicker > 0 && flicker < this.params.maskFlicker * 0.22) continue;
      const y = (index / slices) * diagonal * 0.56 + drift * (index % 2 ? 1 : -1);
      const heightScale = 0.45 + typeIdentityNoise(this.params.seed, index, 4) * 0.85;
      ctx.fillRect(-diagonal, y, diagonal * 2, sliceHeight * heightScale);
    }

    ctx.restore();
  }

  drawBlocks(ctx, width, height, time, maskBlocks) {
    const beat = Math.floor(time * (2 + this.params.maskFlicker * 4));
    ctx.fillStyle = "#050505";

    for (let index = 0; index < maskBlocks; index++) {
      const active = this.params.maskFlicker <= 0 || typeIdentityNoise(this.params.seed, index, beat) > this.params.maskFlicker * 0.35;
      if (!active) continue;

      const x = typeIdentityNoise(this.params.seed, index, 21) * width;
      const y = typeIdentityNoise(this.params.seed, index, 22) * height;
      const blockWidth = mix(width * 0.06, width * 0.34, typeIdentityNoise(this.params.seed, index, 23));
      const blockHeight = mix(height * 0.025, height * 0.13, typeIdentityNoise(this.params.seed, index, 24));
      ctx.fillRect(x - blockWidth / 2, y - blockHeight / 2, blockWidth, blockHeight);
    }
  }
}

class RepeatedGrid {
  constructor(params) {
    this.params = params;
  }

  draw(ctx, width, height, time) {
    const cols = Math.max(1, Math.round(this.params.columns));
    const rows = Math.max(1, Math.round(this.params.rows));
    const cellW = Math.max(12, (width + this.params.gap * cols) / cols);
    const cellH = Math.max(12, (height + this.params.gap * rows) / rows);
    const slideX = positiveModulo(time * this.params.slideX, cellW) - cellW * 0.5;
    const slideY = positiveModulo(time * this.params.slideY, cellH) - cellH * 0.5;

    for (let row = -1; row <= rows; row++) {
      for (let col = -1; col <= cols; col++) {
        const index = row * 131 + col;
        const baseX = col * cellW + cellW / 2 - this.params.gap / 2 + slideX;
        const baseY = row * cellH + cellH / 2 - this.params.gap / 2 + slideY;
        const glyphChance = this.params.layout === "arcGlyphs" ? 1 : this.params.glyphMix;
        const shouldGlyph = typeIdentityNoise(this.params.seed, index, 1) < glyphChance;

        if (shouldGlyph) {
          this.drawGlyph(ctx, baseX, baseY, index, time);
        } else {
          this.drawText(ctx, baseX, baseY, index, time);
        }
      }
    }
  }

  drawText(ctx, baseX, baseY, index, time) {
    const params = this.params;
    const gapMagnitude = Math.abs(params.gap);
    const jitterX = (typeIdentityNoise(params.seed, index, 2) - 0.5) * Math.min(gapMagnitude * 1.4, 120);
    const jitterY = (typeIdentityNoise(params.seed, index, 3) - 0.5) * Math.min(gapMagnitude * 1.2, 100);
    const size = params.fontSize * (1 + (typeIdentityNoise(params.seed, index, 4) - 0.5) * params.sizeVar);
    const stretchX = Math.max(0.12, params.stretchX + (typeIdentityNoise(params.seed, index, 5) - 0.5) * params.stretchXVar);
    const stretchY = Math.max(0.12, params.stretchY + (typeIdentityNoise(params.seed, index, 6) - 0.5) * params.stretchYVar);
    const rotation = (typeIdentityNoise(params.seed, index, 8) - 0.5) * params.rotation * 2;
    const text = getTypeIdentityPhrase(params, index);

    new TextBlock({
      text,
      x: baseX + jitterX,
      y: baseY + jitterY,
      size,
      stretchX,
      stretchY,
      rotation,
      rotationMotion: params.rotation * 0.08,
      scanX: typeIdentityNoise(params.seed, index, 10) - 0.5,
      scanY: typeIdentityNoise(params.seed, index, 11) - 0.5,
      phase: typeIdentityNoise(params.seed, index, 12) * Math.PI * 2,
      alpha: 1,
      seed: params.seed + index,
    }).draw(ctx, time, params);
  }

  drawGlyph(ctx, baseX, baseY, index, time) {
    const params = this.params;
    const glyph = new ArcGlyph({
      x: baseX,
      y: baseY,
      size: params.fontSize * mix(0.62, 1.8, typeIdentityNoise(params.seed, index, 31)),
      rotation: typeIdentityNoise(params.seed, index, 32) * Math.PI * 2,
      scaleX: mix(0.55, 1.9, typeIdentityNoise(params.seed, index, 33)),
      scaleY: mix(0.55, 1.9, typeIdentityNoise(params.seed, index, 34)),
      phase: typeIdentityNoise(params.seed, index, 35) * Math.PI * 2,
      pulse: params.pulse * 0.18,
    });
    glyph.draw(ctx, time);
  }
}

class CompositionScene {
  constructor(params) {
    this.params = params;
  }

  draw(ctx, width, height, time) {
    ctx.save();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, width, height);
    ctx.textRendering = "geometricPrecision";
    ctx.fontKerning = "normal";

    if (this.params.crop) {
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.clip();
    }

    if (this.params.layout === "giantLetters") {
      this.drawGiantLetters(ctx, width, height, time);
    } else {
      new RepeatedGrid(this.params).draw(ctx, width, height, time);
    }

    new MaskSlice(this.params).draw(ctx, width, height, time);
    ctx.restore();
  }

  drawGiantLetters(ctx, width, height, time) {
    const letters = Array.from(this.params.phrase.replace(/\s+/g, ""));
    const count = Math.max(1, letters.length);
    const step = width / count;

    letters.forEach((letter, index) => {
      const seedIndex = index * 97;
      const size = this.params.fontSize * mix(1.4, 2.8, typeIdentityNoise(this.params.seed, seedIndex, 41));
      const x = step * index + step / 2 + Math.sin(time + index) * this.params.slideX;
      const y = height / 2 + (typeIdentityNoise(this.params.seed, seedIndex, 42) - 0.5) * height * 0.35 + Math.cos(time + index) * this.params.slideY;

      new TextBlock({
        text: letter,
        x,
        y,
        size,
        stretchX: Math.max(0.2, this.params.stretchX + (typeIdentityNoise(this.params.seed, seedIndex, 43) - 0.5) * this.params.stretchXVar),
        stretchY: Math.max(0.2, this.params.stretchY + (typeIdentityNoise(this.params.seed, seedIndex, 44) - 0.5) * this.params.stretchYVar),
        rotation: (typeIdentityNoise(this.params.seed, seedIndex, 45) - 0.5) * this.params.rotation * 2,
        rotationMotion: this.params.rotation * 0.08,
        scanX: typeIdentityNoise(this.params.seed, seedIndex, 46) - 0.5,
        scanY: typeIdentityNoise(this.params.seed, seedIndex, 47) - 0.5,
        phase: typeIdentityNoise(this.params.seed, seedIndex, 48) * Math.PI * 2,
        alpha: 1,
        seed: this.params.seed + seedIndex,
      }).draw(ctx, time, this.params);
    });
  }
}

function startTypeIdentity() {
  if (!typeIdentityControls.form) return;
  if (typeIdentityRunning) return;
  resizeTypeIdentityCanvas();
  typeIdentityStartTime = performance.now();
  typeIdentityRunning = true;
  typeIdentityAnimationFrame = requestAnimationFrame(renderTypeIdentity);
}

function stopTypeIdentity() {
  typeIdentityRunning = false;
  cancelAnimationFrame(typeIdentityAnimationFrame);
}

function resizeTypeIdentityCanvas() {
  const size = getConfiguredCanvasSize(typeIdentityCanvas, 420, 360);
  typeIdentityPixelRatio = size.pixelRatio;
  const { width, height } = size;

  if (typeIdentityCanvas.width !== width || typeIdentityCanvas.height !== height) {
    typeIdentityCanvas.width = width;
    typeIdentityCanvas.height = height;
  }

  typeIdentityCtx.imageSmoothingEnabled = true;
  typeIdentityCtx.imageSmoothingQuality = "high";

  if (!typeIdentityRunning) {
    drawTypeIdentityFrame(performance.now());
  }
}

function renderTypeIdentity(timestamp) {
  if (!typeIdentityRunning) return;
  drawTypeIdentityFrame(timestamp);
  typeIdentityAnimationFrame = requestAnimationFrame(renderTypeIdentity);
}

function drawTypeIdentityFrame(timestamp) {
  const width = typeIdentityCanvas.width;
  const height = typeIdentityCanvas.height;
  const params = getTypeIdentityParams(timestamp);
  new CompositionScene(params).draw(typeIdentityCtx, width, height, params.time);
}

function getTypeIdentityParams(timestamp) {
  const elapsed = (timestamp - typeIdentityStartTime) / 1000;
  const speed = mapTypeIdentitySpeed(readRangeValue(typeIdentityControls.speed, 32));
  const layout = typeIdentityControls.layout.value || "denseGrid";
  const density = readRangeValue(typeIdentityControls.density, 14);
  const tempoDrift = readRangeValue(typeIdentityControls.tempoDrift, 18) / 100;
  const densityFactor = mix(0.55, 1.75, clamp(density / 32, 0, 1));
  const densityPulse = Math.sin(elapsed * speed * 0.7) * tempoDrift;

  return {
    phrase: (typeIdentityControls.phrase.value || "POWER").slice(0, 48).toUpperCase(),
    layout,
    fontFamily: "Helvetica, Arial, sans-serif",
    weight: Math.max(400, readRangeValue(typeIdentityControls.weight, 900)),
    fontSize: readRangeValue(typeIdentityControls.typeScale, 82) * typeIdentityPixelRatio,
    letterSpace: readRangeValue(typeIdentityControls.letterSpace, -8) * typeIdentityPixelRatio,
    letterStretch: readRangeValue(typeIdentityControls.stretchXVar, 95) / 180,
    letterLift: readRangeValue(typeIdentityControls.stretchYVar, 85) * 0.08 * typeIdentityPixelRatio,
    density,
    columns: Math.max(1, readRangeValue(typeIdentityControls.columns, 8) * densityFactor + densityPulse * density * 0.18),
    rows: Math.max(1, readRangeValue(typeIdentityControls.rows, 8) * densityFactor - densityPulse * density * 0.08),
    gap: readRangeValue(typeIdentityControls.gap, 18) * typeIdentityPixelRatio,
    seed: readRangeValue(typeIdentityControls.seed, 318),
    glyphMix: readRangeValue(typeIdentityControls.glyphMix, 0) / 100,
    stretchX: readRangeValue(typeIdentityControls.stretchX, 150) / 100,
    stretchXVar: readRangeValue(typeIdentityControls.stretchXVar, 95) / 100,
    stretchY: readRangeValue(typeIdentityControls.stretchY, 105) / 100,
    stretchYVar: readRangeValue(typeIdentityControls.stretchYVar, 85) / 100,
    rotation: (readRangeValue(typeIdentityControls.rotation, 6) * Math.PI) / 180,
    sizeVar: readRangeValue(typeIdentityControls.sizeVar, 65) / 100,
    slices: readRangeValue(typeIdentityControls.slices, 10),
    sliceAngle: (readRangeValue(typeIdentityControls.sliceAngle, 0) * Math.PI) / 180,
    sliceDrift: readRangeValue(typeIdentityControls.sliceDrift, 38) * typeIdentityPixelRatio,
    maskBlocks: readRangeValue(typeIdentityControls.maskBlocks, 8),
    maskFlicker: readRangeValue(typeIdentityControls.maskFlicker, 28) / 100,
    crop: typeIdentityControls.crop.checked,
    slideX: readRangeValue(typeIdentityControls.slideX, 42) * typeIdentityPixelRatio,
    slideY: readRangeValue(typeIdentityControls.slideY, 0) * typeIdentityPixelRatio,
    pulse: readRangeValue(typeIdentityControls.pulse, 18) / 100,
    scan: readRangeValue(typeIdentityControls.scan, 24) * typeIdentityPixelRatio,
    speed,
    time: elapsed * speed,
  };
}

function getTypeIdentityPhrase(params, index) {
  if (params.layout !== "broadcastMix") return params.phrase;

  const phrases = [params.phrase, "POWER", "WIN", "JUST", "THE ONE"];
  const phraseIndex = Math.floor(typeIdentityNoise(params.seed, index, 51) * phrases.length);
  return phrases[phraseIndex];
}

function mapTypeIdentitySpeed(value) {
  const t = clamp(value / 100, 0, 1);
  if (t <= 0) return 0;
  return mix(0.04, 2.8, Math.pow(t, 2.1));
}

function typeIdentityNoise(seed, index = 0, channel = 0) {
  const raw = Math.sin((seed + 1) * 12.9898 + (index + 3) * 78.233 + (channel + 9) * 37.719) * 43758.5453;
  return raw - Math.floor(raw);
}

function applyTypeIdentityPreset(name) {
  const preset = typeIdentityPresets[name] || typeIdentityPresets.denseGrid;
  Object.entries(preset).forEach(([key, value]) => {
    const control = typeIdentityControls[key];
    if (!control) return;
    setTypeIdentityControlValue(control, value);
  });

  if (typeIdentityControls.preset.value !== name && typeIdentityPresets[name]) {
    typeIdentityControls.preset.value = name;
  }

  resizeTypeIdentityCanvas();
}

function randomizeTypeIdentity() {
  const seed = Math.floor(Math.random() * 999) + 1;
  setTypeIdentityControlValue(typeIdentityControls.seed, seed);
  setTypeIdentityControlValue(typeIdentityControls.stretchX, Math.round(mix(70, 220, Math.random())));
  setTypeIdentityControlValue(typeIdentityControls.stretchY, Math.round(mix(70, 240, Math.random())));
  setTypeIdentityControlValue(typeIdentityControls.stretchXVar, Math.round(mix(40, 220, Math.random())));
  setTypeIdentityControlValue(typeIdentityControls.stretchYVar, Math.round(mix(35, 240, Math.random())));
  setTypeIdentityControlValue(typeIdentityControls.rotation, Math.round(mix(0, 18, Math.random())));
  setTypeIdentityControlValue(typeIdentityControls.slices, Math.round(mix(0, 28, Math.random())));
  setTypeIdentityControlValue(typeIdentityControls.maskBlocks, Math.round(mix(0, 24, Math.random())));
  setTypeIdentityControlValue(typeIdentityControls.glyphMix, Math.round(mix(0, 70, Math.random())));
  resizeTypeIdentityCanvas();
}

function setTypeIdentityControlValue(control, value) {
  if (control instanceof HTMLInputElement && control.type === "checkbox") {
    control.checked = Boolean(value);
    return;
  }

  if (control instanceof HTMLInputElement && control.type === "range") {
    const min = Number(control.min);
    const max = Number(control.max);
    const step = getRangeStep(control);
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return;
    const stepped = Math.round((clamp(numeric, min, max) - min) / step) * step + min;
    control.value = String(clamp(stepped, min, max));
    updateKnobControl(control);
    return;
  }

  if (control instanceof HTMLSelectElement) {
    const option = Array.from(control.options).find((item) => item.value === String(value));
    if (option) control.value = String(value);
    return;
  }

  control.value = String(value);
}

function bindTypeIdentityControls() {
  if (!typeIdentityControls.form) return;

  typeIdentityControls.form.addEventListener("submit", (event) => event.preventDefault());

  const redraw = () => {
    if (!dateThreePanel.hidden && !typeIdentityPanel.hidden) {
      resizeTypeIdentityCanvas();
    }
  };

  Object.values(typeIdentityControls).forEach((control) => {
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return;
    control.addEventListener("input", redraw);
    control.addEventListener("change", redraw);
  });

  typeIdentityControls.applyPreset.addEventListener("click", () => applyTypeIdentityPreset(typeIdentityControls.preset.value));
  typeIdentityControls.reset.addEventListener("click", () => applyTypeIdentityPreset(typeIdentityControls.preset.value));
  typeIdentityControls.randomize.addEventListener("click", randomizeTypeIdentity);
  typeIdentityControls.preset.addEventListener("change", () => applyTypeIdentityPreset(typeIdentityControls.preset.value));

  requestAnimationFrame(resizeTypeIdentityCanvas);
}

function startOrbitType() {
  if (!orbitTypeControls.form) return;
  if (orbitTypeRunning) return;

  resizeOrbitTypeCanvas();
  orbitTypeRunning = true;
  orbitTypeLastFrameTime = 0;
  orbitTypeAnimationFrame = requestAnimationFrame(renderOrbitType);
}

function stopOrbitType() {
  orbitTypeRunning = false;
  orbitTypeLastFrameTime = 0;
  cancelAnimationFrame(orbitTypeAnimationFrame);
  orbitTypeCanvas.classList.remove("is-dragging");
}

function resizeOrbitTypeCanvas() {
  if (!orbitTypeControls.form) return;

  const size = getConfiguredCanvasSize(orbitTypeCanvas, 420, 360);
  orbitTypePixelRatio = size.pixelRatio;
  const width = Math.round(size.width);
  const height = Math.round(size.height);

  if (orbitTypeCanvas.width !== width || orbitTypeCanvas.height !== height) {
    orbitTypeCanvas.width = width;
    orbitTypeCanvas.height = height;
  }

  orbitTypeCtx.imageSmoothingEnabled = true;
  orbitTypeCtx.imageSmoothingQuality = "high";

  if (!orbitTypeRunning) {
    drawOrbitTypeFrame(orbitTypeMotionTime);
  }
}

function renderOrbitType(timestamp) {
  if (!orbitTypeRunning) return;

  orbitTypeAnimationFrame = requestAnimationFrame(renderOrbitType);
  const time = getOrbitTypeTime(timestamp);
  drawOrbitTypeFrame(time);
}

function getOrbitTypeTime(timestamp) {
  if (!orbitTypeRunning) return orbitTypeMotionTime;

  if (!orbitTypeLastFrameTime) {
    orbitTypeLastFrameTime = timestamp;
    return orbitTypeMotionTime;
  }

  const rawDelta = clamp((timestamp - orbitTypeLastFrameTime) / 1000, 0, 1 / 12);
  orbitTypeLastFrameTime = timestamp;
  orbitTypeMotionTime += rawDelta;
  return orbitTypeMotionTime;
}

function drawOrbitTypeFrame(time) {
  const width = orbitTypeCanvas.width;
  const height = orbitTypeCanvas.height;
  if (!width || !height) return;

  const params = getOrbitTypeParams(time);
  orbitTypeCtx.save();
  orbitTypeCtx.globalAlpha = 1;
  orbitTypeCtx.globalCompositeOperation = "source-over";
  orbitTypeCtx.fillStyle = params.bgColor;
  orbitTypeCtx.fillRect(0, 0, width, height);

  const texture = renderOrbitTypeTexture(params);
  drawOrbitTypeTexturePlane(texture, params);
  orbitTypeCtx.restore();
}

function getOrbitTypeParams(time) {
  const width = orbitTypeCanvas.width;
  const height = orbitTypeCanvas.height;
  const minDimension = Math.min(width, height);
  const pixelRatio = orbitTypePixelRatio;
  const autoYaw = time * readRangeValue(orbitTypeControls.autoOrbit, 8) * 0.14;
  const spin = time * readRangeValue(orbitTypeControls.spin, 0) * 0.18;
  const pulse = Math.sin(time * 1.8) * (readRangeValue(orbitTypeControls.pulse, 12) / 100) * 0.18;

  return {
    width,
    height,
    cx: width / 2,
    cy: height / 2,
    minDimension,
    text: (orbitTypeControls.text.value || "ORBIT TYPE").slice(0, 120),
    fontFamily: orbitTypeControls.font.value || "Helvetica, Arial, sans-serif",
    baseWeight: Math.max(100, readRangeValue(orbitTypeControls.weight, 700)),
    baseFontSize: readRangeValue(orbitTypeControls.fontSize, 28) * pixelRatio,
    baseLetterSpace: readRangeValue(orbitTypeControls.letterSpace, 4) * pixelRatio,
    radius: readRangeValue(orbitTypeControls.radius, 280) * pixelRatio * (1 + pulse),
    rays: Math.max(8, Math.round(readRangeValue(orbitTypeControls.rays, 180))),
    radialCopies: Math.max(1, Math.round(readRangeValue(orbitTypeControls.radialCopies, 1))),
    innerFill: readRangeValue(orbitTypeControls.innerFill, 72) / 100,
    lineLength: readRangeValue(orbitTypeControls.lineLength, 100) / 100,
    edgeSoftness: readRangeValue(orbitTypeControls.edgeSoftness, 32) / 100,
    baseOpacity: readRangeValue(orbitTypeControls.opacity, 82) / 100,
    opacityRandom: readRangeValue(orbitTypeControls.opacityRandom, 48) / 100,
    sizeRandom: readRangeValue(orbitTypeControls.sizeRandom, 56) / 100,
    weightRandom: readRangeValue(orbitTypeControls.weightRandom, 300),
    spacingRandom: readRangeValue(orbitTypeControls.spacingRandom, 26) / 100,
    lengthRandom: readRangeValue(orbitTypeControls.lengthRandom, 38) / 100,
    radiusJitter: readRangeValue(orbitTypeControls.radiusJitter, 18) * pixelRatio,
    degreeRandom: readRangeValue(orbitTypeControls.degreeRandom, 42) / 100,
    seed: readRangeValue(orbitTypeControls.seed, 427),
    pitch: (readRangeValue(orbitTypeControls.cameraX, 0) * Math.PI) / 180,
    yaw: ((readRangeValue(orbitTypeControls.cameraY, 0) + autoYaw) * Math.PI) / 180,
    roll: (readRangeValue(orbitTypeControls.cameraRoll, 0) * Math.PI) / 180,
    zoom: readRangeValue(orbitTypeControls.zoom, 110) / 100,
    perspective: readRangeValue(orbitTypeControls.perspective, 72) / 180,
    shimmer: readRangeValue(orbitTypeControls.shimmer, 20) / 100,
    textColor: orbitTypeControls.textColor.value || "#f5f5f5",
    bgColor: orbitTypeControls.bgColor.value || "#050505",
    fadeCentre: readRangeValue(orbitTypeControls.fadeCentre, 0) / 100,
    spin,
    time,
  };
}

function renderOrbitTypeTexture(params) {
  const maxLineScale = Math.max(1.08, params.lineLength * (1 + params.lengthRandom));
  const textureRadius = Math.max(80, params.radius * maxLineScale + params.radiusJitter + params.baseFontSize * 3);
  const maxTextureSize = 4096;
  const textureScale = Math.min(1, maxTextureSize / Math.max(1, textureRadius * 2));
  const textureSize = Math.max(2, Math.ceil(textureRadius * 2 * textureScale));

  if (orbitTypeTextureCanvas.width !== textureSize || orbitTypeTextureCanvas.height !== textureSize) {
    orbitTypeTextureCanvas.width = textureSize;
    orbitTypeTextureCanvas.height = textureSize;
  }

  orbitTypeTextureCtx.save();
  orbitTypeTextureCtx.clearRect(0, 0, textureSize, textureSize);
  orbitTypeTextureCtx.scale(textureScale, textureScale);
  orbitTypeTextureCtx.translate(textureRadius, textureRadius);
  orbitTypeTextureCtx.textAlign = "left";
  orbitTypeTextureCtx.textBaseline = "middle";
  orbitTypeTextureCtx.fontKerning = "normal";
  orbitTypeTextureCtx.textRendering = "geometricPrecision";
  orbitTypeTextureCtx.fillStyle = params.textColor;
  drawOrbitTypeTextureLines(orbitTypeTextureCtx, params);
  orbitTypeTextureCtx.restore();

  return {
    canvas: orbitTypeTextureCanvas,
    sourceRadius: textureRadius * textureScale,
    sourceCenter: textureSize / 2,
    planeRadius: textureRadius,
  };
}

function drawOrbitTypeTextureLines(context, params) {
  const total = params.rays * params.radialCopies;
  const maxDraws = 18000;
  const step = Math.max(1, Math.ceil(total / maxDraws));
  const skippedAlphaBoost = Math.min(2.4, Math.sqrt(step));

  for (let index = 0; index < total; index++) {
    if (index % step !== 0) continue;

    const sizeNoise = orbitTypeNoise(params.seed, index, 1);
    const opacityNoise = orbitTypeNoise(params.seed, index, 2);
    const lengthNoise = orbitTypeNoise(params.seed, index, 3);
    const radiusNoise = orbitTypeNoise(params.seed, index, 4);
    const weightNoise = orbitTypeNoise(params.seed, index, 5);
    const spacingNoise = orbitTypeNoise(params.seed, index, 6);
    const angleNoise = orbitTypeNoise(params.seed, index, 7);
    const evenAngle = (index / total) * Math.PI * 2;
    const jitterRange = (Math.PI * 2) / Math.max(1, total) * 5.5;
    const angle = evenAngle + (angleNoise - 0.5) * jitterRange * params.degreeRandom + params.spin;
    const lengthScale = Math.max(0.04, params.lineLength * (1 + (lengthNoise - 0.5) * params.lengthRandom * 2));
    const endpointRadius = Math.max(1, params.radius * lengthScale + (radiusNoise - 0.5) * params.radiusJitter);
    const edgeFade = params.edgeSoftness <= 0 ? 1 : 1 - smoothstep(
      params.radius * (1 - params.edgeSoftness * 0.62),
      params.radius * (1 + params.edgeSoftness * 0.32),
      endpointRadius
    ) * params.edgeSoftness;
    const centerFade = params.fadeCentre <= 0 ? 1 : 1 - params.fadeCentre * 0.68;
    const opacityVar = mix(1, Math.pow(opacityNoise, 1.45), params.opacityRandom);
    const shimmer = 1 - params.shimmer * 0.28 + params.shimmer * 0.28 * (0.5 + 0.5 * Math.sin(params.time * 5.2 + opacityNoise * Math.PI * 2));
    const innerBoost = mix(0.78, 1.18, params.innerFill);
    const alpha = clamp(params.baseOpacity * opacityVar * edgeFade * centerFade * shimmer * innerBoost * skippedAlphaBoost, 0, 1);

    if (alpha <= 0.003) continue;

    const fontSize = params.baseFontSize * Math.max(0.08, 1 + (sizeNoise - 0.5) * params.sizeRandom * 2);
    const weight = clamp(params.baseWeight + (weightNoise - 0.5) * params.weightRandom * 2, 100, 900);
    const letterSpace = params.baseLetterSpace * Math.max(0.05, 1 + (spacingNoise - 0.5) * params.spacingRandom * 2);
    context.font = `${Math.round(weight)} ${fontSize}px ${params.fontFamily}`;
    const textWidth = Math.max(1, measureOrbitSpacedText(context, params.text, letterSpace));
    const xScale = endpointRadius / textWidth;

    context.save();
    context.rotate(angle);
    context.scale(Math.max(0.01, xScale), 1);
    context.globalAlpha = alpha;
    drawOrbitSpacedText(context, params.text, letterSpace);
    context.restore();
  }
}

function drawOrbitTypeTexturePlane(texture, params) {
  const center = projectOrbitTypePoint(0, 0, 0, params);
  const xAxis = projectOrbitTypePoint(texture.planeRadius, 0, 0, params);
  const yAxis = projectOrbitTypePoint(0, texture.planeRadius, 0, params);
  const sourceRadius = Math.max(1, texture.sourceRadius);
  const sourceCenter = texture.sourceCenter;

  const a = (xAxis.x - center.x) / sourceRadius;
  const b = (xAxis.y - center.y) / sourceRadius;
  const c = (yAxis.x - center.x) / sourceRadius;
  const d = (yAxis.y - center.y) / sourceRadius;
  const e = center.x - a * sourceCenter - c * sourceCenter;
  const f = center.y - b * sourceCenter - d * sourceCenter;

  orbitTypeCtx.save();
  orbitTypeCtx.imageSmoothingEnabled = true;
  orbitTypeCtx.imageSmoothingQuality = "high";
  orbitTypeCtx.setTransform(a, b, c, d, e, f);
  orbitTypeCtx.drawImage(texture.canvas, 0, 0);
  orbitTypeCtx.restore();
}

function projectOrbitTypePoint(x, y, z, params) {
  const cosYaw = Math.cos(params.yaw);
  const sinYaw = Math.sin(params.yaw);
  const cosPitch = Math.cos(params.pitch);
  const sinPitch = Math.sin(params.pitch);
  const cosRoll = Math.cos(params.roll);
  const sinRoll = Math.sin(params.roll);

  const yawX = x * cosYaw + z * sinYaw;
  const yawZ = -x * sinYaw + z * cosYaw;
  const pitchY = y * cosPitch - yawZ * sinPitch;
  const pitchZ = y * sinPitch + yawZ * cosPitch;
  const rollX = yawX * cosRoll - pitchY * sinRoll;
  const rollY = yawX * sinRoll + pitchY * cosRoll;
  const cameraDistance = params.minDimension * mix(14, 1.45, params.perspective) + 80;
  const depthDenominator = Math.max(cameraDistance - pitchZ, cameraDistance * 0.14);
  const perspectiveScale = params.perspective <= 0.001 ? 1 : cameraDistance / depthDenominator;
  const scale = params.zoom * perspectiveScale;

  return {
    x: params.cx + rollX * scale,
    y: params.cy + rollY * scale,
    scale,
    depth: pitchZ,
  };
}

function measureOrbitSpacedText(context, text, letterSpace) {
  if (Math.abs(letterSpace) < 0.01) {
    return context.measureText(text).width;
  }

  const letters = Array.from(text);
  const textWidth = letters.reduce((total, character) => total + context.measureText(character).width, 0);
  return textWidth + Math.max(0, letters.length - 1) * letterSpace;
}

function drawOrbitSpacedText(context, text, letterSpace) {
  if (Math.abs(letterSpace) < 0.01) {
    context.fillText(text, 0, 0);
    return;
  }

  let cursor = 0;
  Array.from(text).forEach((character) => {
    context.fillText(character, cursor, 0);
    cursor += context.measureText(character).width + letterSpace;
  });
}

function orbitTypeNoise(seed, index = 0, channel = 0) {
  const value = Math.sin(seed * 91.113 + index * 37.719 + channel * 271.17) * 43758.5453123;
  return value - Math.floor(value);
}

function getOrbitTypeSettingKeys() {
  return Object.keys(orbitTypeDefaultSettings);
}

function collectOrbitTypeSettings() {
  const settings = {};
  getOrbitTypeSettingKeys().forEach((key) => {
    const control = orbitTypeControls[key];
    if (!control) return;
    if (control instanceof HTMLInputElement && control.type === "checkbox") {
      settings[key] = control.checked;
    } else if (control instanceof HTMLInputElement && control.type === "range") {
      settings[key] = readRangeValue(control, orbitTypeDefaultSettings[key]);
    } else {
      settings[key] = control.value;
    }
  });
  return settings;
}

function applyOrbitTypeSettings(settings, options = {}) {
  getOrbitTypeSettingKeys().forEach((key) => {
    if (options.preserveCamera && key.startsWith("camera")) return;
    const control = orbitTypeControls[key];
    if (!control || !(key in settings)) return;
    const value = settings[key];

    if (control instanceof HTMLInputElement && control.type === "checkbox") {
      control.checked = Boolean(value);
      control.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (control instanceof HTMLInputElement && control.type === "range") {
      setRangeValue(control, Number(value));
    } else {
      control.value = String(value);
      control.dispatchEvent(new Event("input", { bubbles: true }));
      control.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });

  requestAnimationFrame(resizeOrbitTypeCanvas);
}

function resetOrbitTypeDesign() {
  applyOrbitTypeSettings(orbitTypeDefaultSettings);
  orbitTypeMotionTime = 0;
  orbitTypeLastFrameTime = 0;
  setOrbitTypePresetStatus("Design reset");
}

function resetOrbitTypeCamera() {
  ["cameraX", "cameraY", "cameraRoll", "zoom", "perspective"].forEach((key) => {
    const control = orbitTypeControls[key];
    if (control) setRangeValue(control, orbitTypeDefaultSettings[key]);
  });
  setOrbitTypePresetStatus("Camera reset");
}

function randomizeOrbitType() {
  setRangeValue(orbitTypeControls.seed, Math.round(mix(1, 999, Math.random())));
  setRangeValue(orbitTypeControls.rays, Math.round(mix(80, 720, Math.random())));
  setRangeValue(orbitTypeControls.radialCopies, Math.round(mix(1, 28, Math.random())));
  setRangeValue(orbitTypeControls.radius, Math.round(mix(140, 620, Math.random())));
  setRangeValue(orbitTypeControls.innerFill, Math.round(mix(35, 100, Math.random())));
  setRangeValue(orbitTypeControls.opacityRandom, Math.round(mix(12, 92, Math.random())));
  setRangeValue(orbitTypeControls.sizeRandom, Math.round(mix(10, 150, Math.random())));
  setRangeValue(orbitTypeControls.weightRandom, Math.round(mix(0, 700, Math.random()) / 100) * 100);
  setRangeValue(orbitTypeControls.spacingRandom, Math.round(mix(0, 110, Math.random())));
  setRangeValue(orbitTypeControls.lengthRandom, Math.round(mix(0, 95, Math.random())));
  setRangeValue(orbitTypeControls.radiusJitter, Math.round(mix(0, 120, Math.random())));
  setRangeValue(orbitTypeControls.degreeRandom, Math.round(mix(8, 94, Math.random())));
  setRangeValue(orbitTypeControls.autoOrbit, Math.round(mix(-40, 40, Math.random())));
  setOrbitTypePresetStatus("Randomized");
}

function readOrbitTypePresets() {
  if (Object.keys(orbitTypePresetMemory).length) return orbitTypePresetMemory;

  try {
    const stored = JSON.parse(localStorage.getItem(orbitTypePresetStorageKey) || "{}");
    if (stored && typeof stored === "object") {
      orbitTypePresetMemory = stored;
    }
  } catch (error) {
    orbitTypePresetMemory = {};
  }

  return orbitTypePresetMemory;
}

function writeOrbitTypePresets(presets) {
  orbitTypePresetMemory = presets;
  try {
    localStorage.setItem(orbitTypePresetStorageKey, JSON.stringify(presets));
  } catch (error) {
    setOrbitTypePresetStatus("Preset storage full");
  }
  refreshOrbitTypePresetSelect();
}

function refreshOrbitTypePresetSelect() {
  const select = orbitTypeControls.presetSelect;
  if (!select) return;
  const current = select.value;
  const presets = readOrbitTypePresets();
  const names = Object.keys(presets).sort((a, b) => a.localeCompare(b));
  select.innerHTML = '<option value="">Saved presets</option>';
  names.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });
  if (presets[current]) select.value = current;
}

function getOrbitTypePresetName(presets) {
  const typedName = orbitTypeControls.presetName.value.trim().replace(/\s+/g, " ");
  if (typedName) return typedName;

  const textName = (orbitTypeControls.text.value || "Orbit Type").trim().replace(/\s+/g, " ").slice(0, 24) || "Orbit Type";
  let index = Object.keys(presets).length + 1;
  let name = `${textName} ${index}`;
  while (presets[name]) {
    index++;
    name = `${textName} ${index}`;
  }
  return name;
}

function saveOrbitTypePreset() {
  const presets = readOrbitTypePresets();
  const name = getOrbitTypePresetName(presets);
  presets[name] = { settings: collectOrbitTypeSettings() };
  writeOrbitTypePresets(presets);
  orbitTypeControls.presetName.value = name;
  orbitTypeControls.presetSelect.value = name;
  setOrbitTypePresetStatus("Preset saved");
}

function loadOrbitTypePreset() {
  const name = orbitTypeControls.presetSelect.value;
  const presets = readOrbitTypePresets();
  const preset = presets[name];

  if (!preset || !preset.settings) {
    setOrbitTypePresetStatus("Select a preset");
    return;
  }

  applyOrbitTypeSettings(preset.settings);
  orbitTypeControls.presetName.value = name;
  setOrbitTypePresetStatus("Preset loaded");
}

function deleteOrbitTypePreset() {
  const name = orbitTypeControls.presetSelect.value;
  const presets = readOrbitTypePresets();

  if (!name || !presets[name]) {
    setOrbitTypePresetStatus("Select a preset");
    return;
  }

  delete presets[name];
  writeOrbitTypePresets(presets);
  orbitTypeControls.presetName.value = "";
  orbitTypeControls.presetSelect.value = "";
  setOrbitTypePresetStatus("Preset deleted");
}

function setOrbitTypePresetStatus(message) {
  if (!orbitTypeControls.presetStatus) return;
  const token = orbitTypePresetStatusToken + 1;
  orbitTypePresetStatusToken = token;
  orbitTypeControls.presetStatus.textContent = message;
  window.setTimeout(() => {
    if (orbitTypePresetStatusToken === token) {
      orbitTypeControls.presetStatus.textContent = "";
    }
  }, 2200);
}

function updateOrbitTypeCameraFromPointer(event) {
  if (!orbitTypeDragState) return;
  const feel = readRangeValue(orbitTypeControls.dragFeel, 54) / 54;
  const dx = event.clientX - orbitTypeDragState.x;
  const dy = event.clientY - orbitTypeDragState.y;
  setRangeValue(orbitTypeControls.cameraY, orbitTypeDragState.cameraY + dx * 0.34 * feel);
  setRangeValue(orbitTypeControls.cameraX, orbitTypeDragState.cameraX - dy * 0.24 * feel);
}

function bindOrbitTypeCanvasInput() {
  orbitTypeCanvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    orbitTypeCanvas.setPointerCapture(event.pointerId);
    orbitTypeCanvas.classList.add("is-dragging");
    orbitTypeDragState = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      cameraX: readRangeValue(orbitTypeControls.cameraX, 0),
      cameraY: readRangeValue(orbitTypeControls.cameraY, 0),
    };
  });

  orbitTypeCanvas.addEventListener("pointermove", (event) => {
    if (!orbitTypeDragState || orbitTypeDragState.pointerId !== event.pointerId) return;
    updateOrbitTypeCameraFromPointer(event);
  });

  const endDrag = () => {
    orbitTypeDragState = null;
    orbitTypeCanvas.classList.remove("is-dragging");
  };

  orbitTypeCanvas.addEventListener("pointerup", endDrag);
  orbitTypeCanvas.addEventListener("pointercancel", endDrag);
  orbitTypeCanvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 12 : -12;
    setRangeValue(orbitTypeControls.zoom, readRangeValue(orbitTypeControls.zoom, 110) + delta);
  }, { passive: false });
}

function bindOrbitTypeControls() {
  if (!orbitTypeControls.form) return;

  orbitTypeControls.form.addEventListener("submit", (event) => event.preventDefault());
  refreshOrbitTypePresetSelect();

  const redraw = () => {
    if (!dateFourPanel.hidden && !orbitTypePanel.hidden) {
      resizeOrbitTypeCanvas();
    }
  };

  Object.values(orbitTypeControls).forEach((control) => {
    if (!(control instanceof HTMLInputElement || control instanceof HTMLSelectElement)) return;
    control.addEventListener("input", redraw);
    control.addEventListener("change", redraw);
  });

  orbitTypeControls.savePreset.addEventListener("click", saveOrbitTypePreset);
  orbitTypeControls.loadPreset.addEventListener("click", loadOrbitTypePreset);
  orbitTypeControls.deletePreset.addEventListener("click", deleteOrbitTypePreset);
  orbitTypeControls.randomize.addEventListener("click", randomizeOrbitType);
  orbitTypeControls.resetDesign.addEventListener("click", resetOrbitTypeDesign);
  orbitTypeControls.resetCamera.addEventListener("click", resetOrbitTypeCamera);
  bindOrbitTypeCanvasInput();
  requestAnimationFrame(resizeOrbitTypeCanvas);
}

function setupPhysicsTabs() {
  document.querySelectorAll(".physics-controls").forEach((form) => {
    const tabs = Array.from(form.querySelectorAll(".physics-tab"));
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetId = tab.dataset.tabTarget;
        tabs.forEach((otherTab) => {
          const isActive = otherTab === tab;
          otherTab.classList.toggle("is-active", isActive);
          otherTab.setAttribute("aria-selected", String(isActive));
        });
        form.querySelectorAll(".physics-tab-panel").forEach((panel) => {
          panel.classList.toggle("is-active", panel.id === targetId);
        });
      });
    });
  });
}

let knobDragState = null;

function setupKnobControls() {
  document.querySelectorAll(".physics-controls input[type='range']").forEach((input) => {
    if (input.closest(".knob-shell")) return;
    input.dataset.defaultValue = input.value;

    const shell = document.createElement("span");
    const dial = document.createElement("span");
    const value = document.createElement("span");
    shell.className = "knob-shell";
    shell.tabIndex = 0;
    shell.setAttribute("role", "slider");
    dial.className = "knob-dial";
    value.className = "knob-value";
    value.setAttribute("aria-hidden", "true");

    input.parentNode.insertBefore(shell, input);
    shell.appendChild(input);
    shell.appendChild(dial);
    shell.appendChild(value);

    input.addEventListener("input", () => updateKnobControl(input));
    shell.addEventListener("pointerdown", (event) => beginKnobDrag(event, input, shell));
    shell.addEventListener("pointermove", (event) => moveKnobDrag(event, input, shell));
    shell.addEventListener("pointerup", () => endKnobDrag(shell));
    shell.addEventListener("pointercancel", () => endKnobDrag(shell));
    shell.addEventListener("wheel", (event) => wheelKnob(event, input));
    shell.addEventListener("keydown", (event) => keyKnob(event, input));
    shell.addEventListener("dblclick", (event) => {
      event.preventDefault();
      setRangeValue(input, Number(input.dataset.defaultValue));
    });
    updateKnobControl(input);
  });
}

function beginKnobDrag(event, input, shell) {
  event.preventDefault();
  input.focus();
  shell.setPointerCapture(event.pointerId);
  shell.classList.add("is-dragging");
  knobDragState = {
    input,
    pointerId: event.pointerId,
    startY: event.clientY,
    startValue: Number(input.value),
  };
}

function moveKnobDrag(event, input) {
  if (!knobDragState || knobDragState.input !== input || knobDragState.pointerId !== event.pointerId) return;
  const range = Number(input.max) - Number(input.min);
  setRangeValue(input, knobDragState.startValue + (knobDragState.startY - event.clientY) * (range / 180));
}

function endKnobDrag(shell) {
  if (!knobDragState) return;
  shell.classList.remove("is-dragging");
  knobDragState = null;
}

function wheelKnob(event, input) {
  event.preventDefault();
  const range = Number(input.max) - Number(input.min);
  setRangeValue(input, Number(input.value) + (event.deltaY < 0 ? 1 : -1) * range * 0.025);
}

function keyKnob(event, input) {
  const step = getRangeStep(input);
  const largeStep = step * 10;
  const keySteps = {
    ArrowUp: step,
    ArrowRight: step,
    ArrowDown: -step,
    ArrowLeft: -step,
    PageUp: largeStep,
    PageDown: -largeStep,
  };

  if (event.key === "Home") {
    event.preventDefault();
    setRangeValue(input, Number(input.min));
  } else if (event.key === "End") {
    event.preventDefault();
    setRangeValue(input, Number(input.max));
  } else if (keySteps[event.key]) {
    event.preventDefault();
    setRangeValue(input, Number(input.value) + keySteps[event.key]);
  }
}

function setRangeValue(input, rawValue) {
  const min = Number(input.min);
  const max = Number(input.max);
  const step = getRangeStep(input);
  const stepped = Math.round((clamp(rawValue, min, max) - min) / step) * step + min;
  input.value = String(clamp(stepped, min, max));
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function getRangeStep(input) {
  const step = input.step && input.step !== "any" ? Number(input.step) : 1;
  return Number.isFinite(step) && step > 0 ? step : 1;
}

function updateKnobControl(input) {
  const shell = input.closest(".knob-shell");
  if (!shell) return;

  const min = Number(input.min);
  const max = Number(input.max);
  const value = Number(input.value);
  const percent = clamp((value - min) / Math.max(max - min, 1), 0, 1);
  shell.style.setProperty("--knob-angle", `${-135 + percent * 270}deg`);
  shell.setAttribute("aria-valuemin", input.min);
  shell.setAttribute("aria-valuemax", input.max);
  shell.setAttribute("aria-valuenow", input.value);
  shell.setAttribute("aria-label", input.id.replace(/-/g, " "));
  shell.querySelector(".knob-value").textContent = Math.round(value).toString();
}

setupPhysicsTabs();
setupKnobControls();
bindOutputControls();

typeSystemOne = createTypePhysicsSystem({
  panel: typePanel,
  canvas: typeCanvas,
  controls: typeControls,
  forceMode: "mouse",
});

typeSystemTwo = createTypePhysicsSystem({
  panel: type2Panel,
  canvas: type2Canvas,
  controls: type2Controls,
  forceMode: "gradient",
});

bindTypePhysicsSystem(typeSystemOne);
bindTypePhysicsSystem(typeSystemTwo);
bindGridTextControls();
bindGridText2Controls();
bindGridText3Controls();
bindGridText4Controls();
bindGridText5Controls();
bindGridText6Controls();
bindTypeIdentityControls();
bindOrbitTypeControls();
