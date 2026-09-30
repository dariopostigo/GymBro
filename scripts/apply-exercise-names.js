/**
 * Aplica NAME_ES (scripts/exerciseNamesEs.js) al catálogo ya descargado en
 * src/data/exercises.json, sin volver a llamar a wger, y reordena el fichero
 * con el mismo criterio que fetch-exercises.js.
 *
 * Es idempotente: ejecutarlo dos veces no cambia nada la segunda vez.
 *
 * Uso: npm run fix:exercise-names
 */

const fs = require('fs');
const path = require('path');
const { NAME_ES } = require('./exerciseNamesEs');

const CATALOG_PATH = path.join(__dirname, '..', 'src', 'data', 'exercises.json');

const normalize = name =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

function main() {
  const exercises = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
  const byId = new Map(exercises.map(e => [e.id, e]));

  const missing = Object.keys(NAME_ES)
    .map(Number)
    .filter(id => !byId.has(id));
  if (missing.length) {
    console.warn(`Aviso: ${missing.length} id(s) de NAME_ES no están en el catálogo: ${missing.join(', ')}`);
  }

  const applied = [];
  for (const exercise of exercises) {
    const next = NAME_ES[exercise.id];
    if (!next || next === exercise.name) continue;
    applied.push(`${String(exercise.id).padStart(4)}  ${exercise.name}  →  ${next}`);
    exercise.name = next;
  }

  exercises.sort((a, b) => {
    if (a.category.name !== b.category.name) {
      return a.category.name.localeCompare(b.category.name, 'es');
    }
    return a.name.localeCompare(b.name, 'es');
  });

  fs.writeFileSync(CATALOG_PATH, JSON.stringify(exercises, null, 2), 'utf-8');

  console.log(applied.length ? applied.join('\n') : 'Sin cambios: los nombres ya estaban aplicados.');
  console.log(`\n${applied.length} nombre(s) corregido(s) de ${exercises.length}.`);

  // Dos ejercicios con el mismo nombre dentro de una categoría son
  // indistinguibles en el selector: merece la pena verlo al aplicar.
  const seen = new Map();
  for (const e of exercises) {
    const key = `${e.category.name}|${normalize(e.name)}`;
    if (seen.has(key)) {
      console.warn(`Nombre duplicado en ${e.category.name}: "${e.name}" (ids ${seen.get(key)} y ${e.id})`);
    } else {
      seen.set(key, e.id);
    }
  }
}

main();
