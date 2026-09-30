/**
 * Aplica FREE_DB_IMAGES (scripts/exerciseImagesFree.js) al catálogo ya
 * descargado en src/data/exercises.json, sin volver a llamar a wger.
 *
 * Es idempotente: ejecutarlo dos veces no cambia nada la segunda vez.
 *
 * Al terminar avisa de lo que hay que revisar a mano:
 *  - ids del mapa que ya no están en el catálogo o que no existen en
 *    free-exercise-db (típico tras actualizar cualquiera de los dos),
 *  - ejercicios a los que wger ya les ha puesto foto propia (sobran del mapa),
 *  - ejercicios sin foto que no están ni en el mapa ni en SIN_EQUIVALENTE, que
 *    son los nuevos que tocaría emparejar.
 *
 * Uso: npm run fix:exercise-images
 */

const fs = require('fs');
const path = require('path');
const { FREE_DB_IMAGES, SIN_EQUIVALENTE } = require('./exerciseImagesFree');
const { loadFreeExerciseImages, IMAGE_BASE } = require('./freeExerciseDb');

const CATALOG_PATH = path.join(__dirname, '..', 'src', 'data', 'exercises.json');
const LOCAL_MAP_PATH = path.join(__dirname, '..', 'src', 'assets', 'exerciseImageMap.ts');

const sameImages = (a, b) => a.length === b.length && a.every((url, i) => url === b[i]);

/**
 * uuids de los ejercicios ilustrados a mano en src/assets/exercises-local.
 * No están en el JSON (los resuelve la app), pero sí cuentan como "con foto".
 */
function readLocalImageUuids() {
  const source = fs.readFileSync(LOCAL_MAP_PATH, 'utf-8');
  return new Set([...source.matchAll(/'([0-9a-f-]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})':/g)].map(m => m[1]));
}

async function main() {
  const exercises = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
  const byId = new Map(exercises.map(e => [e.id, e]));

  console.log('Descargando free-exercise-db...');
  const freeImages = await loadFreeExerciseImages();
  console.log(`${freeImages.size} ejercicios con foto en free-exercise-db.\n`);

  const applied = [];
  const desconocidos = [];
  const fueraDeCatalogo = [];
  const conFotoPropia = [];

  for (const [wgerId, freeDbId] of Object.entries(FREE_DB_IMAGES)) {
    const exercise = byId.get(Number(wgerId));
    if (!exercise) {
      fueraDeCatalogo.push(`${wgerId} -> ${freeDbId}`);
      continue;
    }

    const urls = freeImages.get(freeDbId);
    if (!urls) {
      desconocidos.push(`${wgerId} (${exercise.name}) -> ${freeDbId}`);
      continue;
    }

    // Si wger ya ilustra el ejercicio, su foto manda: es la del ejercicio
    // exacto, no una equivalencia nuestra.
    const propias = exercise.images.filter(url => !url.startsWith(IMAGE_BASE));
    if (propias.length) {
      conFotoPropia.push(`${wgerId} (${exercise.name})`);
      continue;
    }

    if (sameImages(exercise.images, urls)) continue;
    applied.push(`${String(wgerId).padStart(4)}  ${exercise.name}  →  ${freeDbId}`);
    exercise.images = urls;
  }

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(exercises, null, 2), 'utf-8');

  console.log(applied.length ? applied.join('\n') : 'Sin cambios: las imágenes ya estaban aplicadas.');
  console.log(`\n${applied.length} ejercicio(s) actualizado(s).`);

  const revisados = new Set([...Object.keys(FREE_DB_IMAGES).map(Number), ...SIN_EQUIVALENTE]);
  const locales = readLocalImageUuids();
  const sinFoto = exercises.filter(e => e.images.length === 0 && !locales.has(e.uuid));
  const sinRevisar = sinFoto.filter(e => !revisados.has(e.id));

  const conFoto = exercises.length - sinFoto.length;
  console.log(
    `\nCatálogo: ${conFoto}/${exercises.length} con foto ` +
      `(${Math.round((conFoto / exercises.length) * 100)}%), ${sinFoto.length} sin foto.`,
  );

  if (desconocidos.length) {
    console.warn(`\nIds que no existen en free-exercise-db (${desconocidos.length}):`);
    console.warn(desconocidos.map(x => `  ${x}`).join('\n'));
  }
  if (fueraDeCatalogo.length) {
    console.warn(`\nIds del mapa que ya no están en el catálogo (${fueraDeCatalogo.length}):`);
    console.warn(fueraDeCatalogo.map(x => `  ${x}`).join('\n'));
  }
  if (conFotoPropia.length) {
    console.warn(`\nYa tienen foto de wger, sobran del mapa (${conFotoPropia.length}):`);
    console.warn(conFotoPropia.map(x => `  ${x}`).join('\n'));
  }
  if (sinRevisar.length) {
    console.warn(`\nSin foto y sin revisar — hay que emparejarlos a mano (${sinRevisar.length}):`);
    console.warn(sinRevisar.map(e => `  ${e.id} ${e.name} (${e.category.name})`).join('\n'));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
