/**
 * Mete CUSTOM_EXERCISES (scripts/customExercises.js) en el catálogo ya
 * descargado en src/data/exercises.json, sin volver a llamar a wger, y
 * reordena el fichero con el mismo criterio que fetch-exercises.js.
 *
 * Las fotos que ya tuviera cada ejercicio se conservan: las pone
 * `npm run fix:exercise-images`, que hay que ejecutar después.
 *
 * Es idempotente: ejecutarlo dos veces no cambia nada la segunda vez.
 *
 * Uso: npm run fix:custom-exercises
 */

const fs = require('fs');
const path = require('path');
const { CUSTOM_EXERCISES } = require('./customExercises');

const CATALOG_PATH = path.join(__dirname, '..', 'src', 'data', 'exercises.json');

function main() {
  const exercises = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
  const byId = new Map(exercises.map(e => [e.id, e]));

  const added = [];
  const updated = [];
  for (const custom of CUSTOM_EXERCISES) {
    const current = byId.get(custom.id);
    if (!current) {
      exercises.push({ ...custom });
      added.push(`${custom.id}  ${custom.name}`);
      continue;
    }
    const next = { ...custom, images: current.images };
    if (JSON.stringify(next) === JSON.stringify(current)) continue;
    Object.assign(current, next);
    updated.push(`${custom.id}  ${custom.name}`);
  }

  exercises.sort((a, b) => {
    if (a.category.name !== b.category.name) {
      return a.category.name.localeCompare(b.category.name, 'es');
    }
    return a.name.localeCompare(b.name, 'es');
  });

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(exercises, null, 2), 'utf-8');

  if (added.length) console.log(`Añadidos (${added.length}):\n  ${added.join('\n  ')}`);
  if (updated.length) console.log(`Actualizados (${updated.length}):\n  ${updated.join('\n  ')}`);
  if (!added.length && !updated.length) console.log('Sin cambios: los ejercicios propios ya estaban.');
}

main();
