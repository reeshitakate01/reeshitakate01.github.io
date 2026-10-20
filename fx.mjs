// Visual effects, all optional: the page works without WebGL.
// Paper Shaders (Apache-2.0, github.com/paper-design/shaders): front-page mesh gradient + liquid-metal logo.
import {
  ShaderMount, meshGradientFragmentShader, liquidMetalFragmentShader,
  getShaderColorFromString, ShaderFitOptions, LiquidMetalShapes, emptyPixel
} from './vendor/paper-shaders.mjs';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sizing = (fit, scale = 1) => ({
  u_fit: ShaderFitOptions[fit], u_scale: scale, u_rotation: 0, u_offsetX: 0, u_offsetY: 0,
  u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0
});
const col = (c) => getShaderColorFromString(c);
function pauseOffscreen(el, mount, speed) {
  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver(([e]) => mount.setSpeed(e.isIntersecting && !reduce ? speed : 0)).observe(el);
}

/* ---------- front page: midnight and mint mesh gradient ---------- */
const HERO_COLORS = ['#1c2140', '#262d5a', '#141831', '#2b3c70', '#1d4a55'];
try {
  const bg = document.getElementById('heroBg');
  const m = new ShaderMount(bg, meshGradientFragmentShader, {
    ...sizing('none'),
    u_colors: HERO_COLORS.map(col), u_colorsCount: 5,
    u_distortion: 0.75, u_swirl: 0.2, u_grainMixer: 0, u_grainOverlay: 0
  }, undefined, reduce ? 0 : 0.2);
  pauseOffscreen(bg, m, 0.2);
} catch (e) { /* CSS gradient fallback stays */ }

/* ---------- logo: liquid metal behind the monogram ---------- */
(async () => {
  const host = document.getElementById('logoMark');
  const img = new Image();
  img.src = emptyPixel;
  await img.decode().catch(() => {});
  new ShaderMount(host, liquidMetalFragmentShader, {
    ...sizing('contain', 1.5),
    u_image: img, u_isImage: false, u_shape: LiquidMetalShapes.metaballs,
    u_colorBack: col('#b9a6ff'), u_colorTint: col('#ffffff'),
    u_contour: 0.4, u_distortion: 0.1, u_softness: 0.15, u_repetition: 2, u_shiftRed: 0.3, u_shiftBlue: 0.3, u_angle: 70
  }, undefined, reduce ? 0 : 0.6, 0, 2, undefined, ['u_image']);
})().catch(() => {});

