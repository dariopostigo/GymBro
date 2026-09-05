/**
 * Descarga las ilustraciones de ejercicios de simplyfitness.com para USO LOCAL
 * Y PERSONAL únicamente (contenido con copyright de un sitio comercial de
 * terceros, no redistribuible). No se ejecuta en CI ni se llama desde npm
 * scripts a propósito: es una herramienta puntual.
 *
 * Uso: node scripts/scrape-simplyfitness-images.js <carpeta-salida>
 */

const fs = require('fs');
const path = require('path');

const BASE = 'https://www.simplyfitness.com';
const NAV_PAGE = `${BASE}/es/pages/chest-exercise-guides`;
const USER_AGENT = 'GymBro-personal-use-script/1.0 (+scraping para uso local, no redistribuido)';
const REQUEST_DELAY_MS = 350;

const EXCLUDE_SLUG_PATTERN =
  /exercise-guides|calculator|contact-us|workout-plan|fitness-tools|bmr|bmi|programs|meal-plan/i;

const outDir = process.argv[2];
if (!outDir) {
  console.error('Uso: node scripts/scrape-simplyfitness-images.js <carpeta-salida>');
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.text();
}

async function fetchExerciseSlugs() {
  const html = await fetchText(NAV_PAGE);
  const slugs = new Set();
  const re = /href="\/es\/pages\/([^"?#]+)"/g;
  let match;
  while ((match = re.exec(html))) {
    const slug = match[1];
    if (!EXCLUDE_SLUG_PATTERN.test(slug)) slugs.add(slug);
  }
  return [...slugs].sort();
}

function extractTitle(html) {
  const match = html.match(/<h1[^>]*>([^<]*)<\/h1>/);
  return match ? match[1].trim() : null;
}

function extractIllustrationImage(html) {
  const imgRe = /<img[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/g;
  let match;
  while ((match = imgRe.exec(html))) {
    const [, src, alt] = match;
    if (/^Ilustraci[oó]n/i.test(alt) && /\.(png|jpe?g|webp)(\?|$)/i.test(src)) {
      return { src, alt };
    }
  }
  return null;
}

async function downloadImage(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar imagen ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

async function main() {
  console.log('Buscando listado de ejercicios...');
  const slugs = await fetchExerciseSlugs();
  console.log(`Encontrados ${slugs.length} ejercicios.`);

  const manifest = [];

  for (const [index, slug] of slugs.entries()) {
    const url = `${BASE}/es/pages/${slug}`;
    process.stdout.write(`[${index + 1}/${slugs.length}] ${slug}... `);
    try {
      const html = await fetchText(url);
      const title = extractTitle(html);
      const image = extractIllustrationImage(html);

      if (!title || !image) {
        console.log('sin título/imagen, omitido.');
        manifest.push({ slug, url, title, imageUrl: null, file: null });
        await sleep(REQUEST_DELAY_MS);
        continue;
      }

      const ext = (image.src.match(/\.(png|jpe?g|webp)(\?|$)/i)?.[1] || 'png').toLowerCase();
      const file = `${slug}.${ext}`;
      await downloadImage(image.src, path.join(outDir, file));

      manifest.push({ slug, url, title, imageUrl: image.src, file });
      console.log(`OK ("${title}")`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      manifest.push({ slug, url, title: null, imageUrl: null, file: null, error: err.message });
    }
    await sleep(REQUEST_DELAY_MS);
  }

  const manifestPath = path.join(outDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`\nManifiesto guardado en ${manifestPath}`);
  console.log(`Imágenes descargadas: ${manifest.filter(m => m.file).length}/${manifest.length}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
