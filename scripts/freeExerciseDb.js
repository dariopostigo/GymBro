/**
 * Acceso a free-exercise-db (https://github.com/yuhonas/free-exercise-db),
 * el catálogo de dominio público (licencia Unlicense) del que salen las fotos
 * de los ejercicios que wger no ilustra.
 *
 * Las imágenes se sirven desde GitHub, igual que las de wger son URLs remotas:
 * no se descarga nada al repo. Antes iban por jsDelivr, pero jsDelivr no sirve
 * repos de más de 50 MB (y este lo es): solo funcionaban las fotos que tenía
 * en caché y el resto daba 403.
 *
 * Fijado a un commit para que las URLs no se rompan si el repo cambia; para
 * actualizarlo, cambia REVISION y ejecuta `npm run fix:exercise-images`.
 */

const REVISION = 'f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5';
const REPO_BASE = `https://raw.githubusercontent.com/yuhonas/free-exercise-db/${REVISION}`;
const DB_URL = `${REPO_BASE}/dist/exercises.json`;
const IMAGE_BASE = `${REPO_BASE}/exercises`;

/** ¿La URL es una foto de free-exercise-db (de cualquier revisión o CDN)? */
const isFreeDbImageUrl = url => /yuhonas\/free-exercise-db/.test(url);

/**
 * Descarga el catálogo y devuelve un Map `id -> URLs absolutas de sus fotos`.
 * Las entradas sin foto no se incluyen: no sirven para lo que queremos.
 */
async function loadFreeExerciseImages() {
  const res = await fetch(DB_URL);
  if (!res.ok) {
    throw new Error(`Error ${res.status} al descargar free-exercise-db (${DB_URL})`);
  }
  const entries = await res.json();

  const byId = new Map();
  for (const entry of entries) {
    if (!entry.images || entry.images.length === 0) continue;
    byId.set(
      entry.id,
      entry.images.map(relative => `${IMAGE_BASE}/${relative}`),
    );
  }
  return byId;
}

module.exports = { loadFreeExerciseImages, isFreeDbImageUrl, DB_URL, IMAGE_BASE };
