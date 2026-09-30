/**
 * Acceso a free-exercise-db (https://github.com/yuhonas/free-exercise-db),
 * el catálogo de dominio público (licencia Unlicense) del que salen las fotos
 * de los ejercicios que wger no ilustra.
 *
 * Las imágenes se sirven desde jsDelivr, igual que las de wger son URLs
 * remotas: no se descarga nada al repo.
 */

const DB_URL = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/dist/exercises.json';
const IMAGE_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises';

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

module.exports = { loadFreeExerciseImages, DB_URL, IMAGE_BASE };
