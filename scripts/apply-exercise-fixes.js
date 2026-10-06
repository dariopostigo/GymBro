/**
 * Aplica scripts/exerciseFixes.js (duplicados fusionados, categorías y
 * músculos corregidos) al catálogo ya descargado en src/data/exercises.json,
 * sin volver a llamar a wger.
 *
 * Es idempotente: ejecutarlo dos veces no cambia nada la segunda vez.
 *
 * Uso: npm run fix:exercise-catalog
 */

const fs = require('fs');
const path = require('path');
const { MERGED_INTO, applyExerciseFixes } = require('./exerciseFixes');

const CATALOG_PATH = path.join(__dirname, '..', 'src', 'data', 'exercises.json');

function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
  const { exercises, removed, fixed } = applyExerciseFixes(catalog);

  const ids = new Set(exercises.map(e => e.id));
  const sinDestino = Object.entries(MERGED_INTO).filter(([, target]) => !ids.has(target));
  if (sinDestino.length) {
    console.warn(`Aviso: fusiones hacia ids que no están en el catálogo: ${sinDestino.map(([from, to]) => `${from}->${to}`).join(', ')}`);
  }

  exercises.sort((a, b) => {
    if (a.category.name !== b.category.name) {
      return a.category.name.localeCompare(b.category.name, 'es');
    }
    return a.name.localeCompare(b.name, 'es');
  });

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(exercises, null, 2), 'utf-8');

  if (removed.length) {
    console.log(`Duplicados quitados (${removed.length}):`);
    console.log(removed.map(e => `  ${e.id} ${e.name}  →  ${MERGED_INTO[e.id]}`).join('\n'));
  }
  if (fixed.length) {
    console.log(`Corregidos (${fixed.length}):`);
    console.log(fixed.map(e => `  ${e.id} ${e.name} (${e.category.name})`).join('\n'));
  }
  if (!removed.length && !fixed.length) console.log('Sin cambios: los arreglos ya estaban aplicados.');
}

main();
