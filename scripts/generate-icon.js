/**
 * Genera el icono de Android de GymBro (una mancuerna estilizada) para todas
 * las densidades, en formato legacy (ic_launcher / ic_launcher_round) y
 * adaptativo (ic_launcher_foreground + fondo de color, Android 8+).
 *
 * No usa ninguna librería de dibujo nativa: rasteriza formas geométricas
 * simples (rectángulos redondeados con un degradado vertical) a mano con
 * supersampling para el antialiasing, y codifica el PNG con pngjs (puro JS).
 *
 * Uso: node scripts/generate-icon.js
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const RES_DIR = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
const SUPERSAMPLE = 4;

// Paleta (coherente con src/theme/colors.ts)
const BACKGROUND_HEX = '#0d0e10'; // colors.background
const BACKGROUND = hexToRgb(BACKGROUND_HEX);
const ACCENT = hexToRgb('#f2d024'); // colors.accent
const ACCENT_LIGHT = hexToRgb('#ffe25c'); // realce superior del degradado

/**
 * Estilo del icono: mancuerna monocroma en el amarillo de marca, con un
 * degradado vertical muy leve que le da volumen sin romper el plano, sobre el
 * fondo oscuro de la app.
 */
const GRADIENT = { from: ACCENT_LIGHT, to: ACCENT };
const STYLE = { plate: GRADIENT, collar: GRADIENT, bar: GRADIENT };

/**
 * Mancuerna en coordenadas normalizadas 0..1, simétrica respecto a x = 0.5:
 * collarín exterior corto, disco interior alto y barra central. Es la misma
 * silueta que `DumbbellIcon` de src/components/icons.tsx.
 */
const SHAPES = {
  collar: { w: 0.082, h: 0.33, x: 0.1, r: 0.034 },
  plate: { w: 0.125, h: 0.63, x: 0.21, r: 0.048 },
  bar: { x0: 0.325, y0: 0.452, x1: 0.675, y1: 0.548, r: 0.048 },
};

const DENSITIES = [
  { name: 'mdpi', legacySize: 48, foregroundSize: 108 },
  { name: 'hdpi', legacySize: 72, foregroundSize: 162 },
  { name: 'xhdpi', legacySize: 96, foregroundSize: 216 },
  { name: 'xxhdpi', legacySize: 144, foregroundSize: 324 },
  { name: 'xxxhdpi', legacySize: 192, foregroundSize: 432 },
];

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

/** Par de rectángulos espejados en x = 0.5 a partir de {w, h, x}. */
function mirroredPair({ w, h, x, r }) {
  const y0 = 0.5 - h / 2;
  const y1 = 0.5 + h / 2;
  return [
    { x0: x, y0, x1: x + w, y1, r },
    { x0: 1 - x - w, y0, x1: 1 - x, y1, r },
  ];
}

const COLLARS = mirroredPair(SHAPES.collar);
const PLATES = mirroredPair(SHAPES.plate);

function insideRoundedRect(px, py, rect) {
  const { x0, y0, x1, y1, r } = rect;
  if (px < x0 || px > x1 || py < y0 || py > y1) return false;
  const cx = px < x0 + r ? x0 + r : px > x1 - r ? x1 - r : px;
  const cy = py < y0 + r ? y0 + r : py > y1 - r ? y1 - r : py;
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

function insideCircle(px, py, cx, cy, radius) {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= radius * radius;
}

function scalePoint(px, py, scale) {
  return { x: 0.5 + (px - 0.5) / scale, y: 0.5 + (py - 0.5) / scale };
}

function mix(a, b, t) {
  return { r: a.r + (b.r - a.r) * t, g: a.g + (b.g - a.g) * t, b: a.b + (b.b - a.b) * t };
}

/**
 * Resuelve un color de la mancuerna: o es plano ({r,g,b}) o un degradado
 * vertical ({from, to}) interpolado a lo largo de la altura del disco.
 */
function resolveColor(spec, py) {
  if (!spec.from) return spec;
  const top = 0.5 - SHAPES.plate.h / 2;
  const t = Math.min(1, Math.max(0, (py - top) / SHAPES.plate.h));
  return mix(spec.from, spec.to, t);
}

/**
 * Dibuja fondo (círculo | cuadrado redondeado | ninguno) + halo + mancuerna,
 * esta última escalada por `dumbbellScale` (el halo la acompaña).
 */
function renderIcon(size, { background, dumbbellScale, style = STYLE }) {
  const ss = size * SUPERSAMPLE;
  // Acumuladores premultiplicados por píxel final (para promediar el supersampling)
  const sums = new Float64Array(size * size * 4);

  for (let sy = 0; sy < ss; sy++) {
    const ny = (sy + 0.5) / ss;
    const outY = Math.floor(sy / SUPERSAMPLE);
    for (let sx = 0; sx < ss; sx++) {
      const nx = (sx + 0.5) / ss;

      // color acumulado de la muestra, premultiplicado por alfa (0..1)
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;

      const over = (color, alpha) => {
        r = color.r * alpha + r * (1 - alpha);
        g = color.g * alpha + g * (1 - alpha);
        b = color.b * alpha + b * (1 - alpha);
        a = alpha + a * (1 - alpha);
      };

      if (background === 'square') {
        if (insideRoundedRect(nx, ny, { x0: 0, y0: 0, x1: 1, y1: 1, r: 0.22 })) {
          over(BACKGROUND, 1);
        }
      } else if (background === 'circle') {
        if (insideCircle(nx, ny, 0.5, 0.5, 0.5)) {
          over(BACKGROUND, 1);
        }
      }

      const p = scalePoint(nx, ny, dumbbellScale);

      if (PLATES.some(rect => insideRoundedRect(p.x, p.y, rect))) {
        over(resolveColor(style.plate, p.y), 1);
      } else if (COLLARS.some(rect => insideRoundedRect(p.x, p.y, rect))) {
        over(resolveColor(style.collar, p.y), 1);
      } else if (insideRoundedRect(p.x, p.y, SHAPES.bar)) {
        over(resolveColor(style.bar, p.y), 1);
      }

      const outX = Math.floor(sx / SUPERSAMPLE);
      const idx = (outY * size + outX) * 4;
      sums[idx] += r;
      sums[idx + 1] += g;
      sums[idx + 2] += b;
      sums[idx + 3] += a;
    }
  }

  const samplesPerPixel = SUPERSAMPLE * SUPERSAMPLE;
  const png = new PNG({ width: size, height: size });
  for (let i = 0; i < size * size; i++) {
    const base = i * 4;
    const alpha = sums[base + 3] / samplesPerPixel;
    // des-premultiplicar: los canales de color se acumularon ya multiplicados por alfa
    let r = 0;
    let g = 0;
    let b = 0;
    if (alpha > 0) {
      r = sums[base] / (samplesPerPixel * alpha);
      g = sums[base + 1] / (samplesPerPixel * alpha);
      b = sums[base + 2] / (samplesPerPixel * alpha);
    }
    png.data[base] = Math.round(r);
    png.data[base + 1] = Math.round(g);
    png.data[base + 2] = Math.round(b);
    png.data[base + 3] = Math.round(alpha * 255);
  }
  return png;
}

function writePng(png, filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, PNG.sync.write(png));
  console.log('Escrito', path.relative(process.cwd(), filePath));
}

function main() {
  for (const density of DENSITIES) {
    const dir = path.join(RES_DIR, `mipmap-${density.name}`);

    const square = renderIcon(density.legacySize, { background: 'square', dumbbellScale: 0.92 });
    writePng(square, path.join(dir, 'ic_launcher.png'));

    const round = renderIcon(density.legacySize, { background: 'circle', dumbbellScale: 0.86 });
    writePng(round, path.join(dir, 'ic_launcher_round.png'));

    // 0.6 mantiene la mancuerna dentro de la zona segura del icono adaptativo
    const foreground = renderIcon(density.foregroundSize, {
      background: 'none',
      dumbbellScale: 0.6,
    });
    writePng(foreground, path.join(dir, 'ic_launcher_foreground.png'));
  }

  // Icono adaptativo (Android 8.0+): fondo de color + capa de primer plano
  const colorsPath = path.join(RES_DIR, 'values', 'colors.xml');
  fs.writeFileSync(
    colorsPath,
    `<resources>
    <color name="ic_launcher_background">${BACKGROUND_HEX}</color>
</resources>
`,
  );
  console.log('Escrito', path.relative(process.cwd(), colorsPath));

  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
  const anydpiDir = path.join(RES_DIR, 'mipmap-anydpi-v26');
  fs.mkdirSync(anydpiDir, { recursive: true });
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveXml);
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), adaptiveXml);
  console.log('Escrito', path.relative(process.cwd(), anydpiDir), '(ic_launcher.xml, ic_launcher_round.xml)');
}

if (require.main === module) {
  main();
}

module.exports = { renderIcon, STYLE, SHAPES, BACKGROUND, ACCENT, ACCENT_LIGHT };
