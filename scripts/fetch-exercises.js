/**
 * Descarga el catálogo de ejercicios de wger (https://wger.de) y lo guarda
 * localmente en src/data/exercises.json para que la app funcione offline
 * y sin depender de la disponibilidad del servidor de wger.
 *
 * Uso: npm run fetch:exercises
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'https://wger.de/api/v2';
const SPANISH_LANGUAGE_ID = 4;
const ENGLISH_LANGUAGE_ID = 2;
const PAGE_SIZE = 100;
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'exercises.json');

// wger no traduce categoría/músculo/equipo vía API (solo nombre de ejercicio y
// descripción tienen traducciones). Como es un vocabulario fijo y pequeño,
// se traduce aquí a mano en vez de complicar el modelo en runtime.
const CATEGORY_ES = {
  10: 'Abdominales',
  8: 'Brazos',
  12: 'Espalda',
  14: 'Gemelos',
  15: 'Cardio',
  11: 'Pecho',
  9: 'Piernas',
  13: 'Hombros',
};

const EQUIPMENT_ES = {
  1: 'Barra',
  8: 'Banco',
  3: 'Mancuerna',
  4: 'Esterilla',
  9: 'Banco inclinado',
  10: 'Kettlebell',
  6: 'Barra de dominadas',
  11: 'Banda elástica',
  2: 'Barra Z',
  5: 'Fitball',
  7: 'Ninguno (peso corporal)',
};

const MUSCLE_ES = {
  1: 'Bíceps',
  2: 'Hombros (deltoide anterior)',
  3: 'Serrato anterior',
  4: 'Pecho',
  5: 'Tríceps',
  6: 'Abdominales',
  7: 'Gemelos',
  8: 'Glúteos',
  9: 'Trapecio',
  10: 'Cuádriceps',
  11: 'Isquiotibiales',
  12: 'Dorsales',
  13: 'Braquial',
  14: 'Oblicuos',
  15: 'Sóleo',
};

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickTranslation(translations) {
  if (!translations || translations.length === 0) return null;
  return (
    translations.find(t => t.language === SPANISH_LANGUAGE_ID) ||
    translations.find(t => t.language === ENGLISH_LANGUAGE_ID) ||
    translations[0]
  );
}

function mapMuscle(muscle) {
  return {
    id: muscle.id,
    name: MUSCLE_ES[muscle.id] || muscle.name_en || muscle.name,
  };
}

function mapEquipment(equipment) {
  return {
    id: equipment.id,
    name: EQUIPMENT_ES[equipment.id] || equipment.name,
  };
}

function mapCategory(category) {
  return {
    id: category.id,
    name: CATEGORY_ES[category.id] || category.name,
  };
}

function mapImages(images) {
  return [...images]
    .sort((a, b) => Number(b.is_main) - Number(a.is_main))
    .map(img => img.thumbnails?.medium || img.image)
    .filter(Boolean);
}

function mapVideos(videos) {
  return (videos || []).map(v => v.video).filter(Boolean);
}

async function fetchAllExercises() {
  const all = [];
  let url = `${API_BASE}/exerciseinfo/?language=${SPANISH_LANGUAGE_ID}&limit=${PAGE_SIZE}&offset=0`;

  while (url) {
    process.stdout.write(`Descargando: ${url}\n`);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error ${res.status} al descargar ${url}`);
    }
    const data = await res.json();
    all.push(...data.results);
    url = data.next;
  }

  return all;
}

async function main() {
  const rawExercises = await fetchAllExercises();
  console.log(`Descargados ${rawExercises.length} ejercicios en bruto.`);

  const exercises = [];
  for (const raw of rawExercises) {
    const translation = pickTranslation(raw.translations);
    if (!translation || !translation.name) continue;

    exercises.push({
      id: raw.id,
      uuid: raw.uuid,
      name: translation.name,
      description: stripHtml(translation.description || ''),
      category: mapCategory(raw.category),
      musclesPrimary: (raw.muscles || []).map(mapMuscle),
      musclesSecondary: (raw.muscles_secondary || []).map(mapMuscle),
      equipment: (raw.equipment || []).map(mapEquipment),
      images: mapImages(raw.images || []),
      videos: mapVideos(raw.videos),
    });
  }

  exercises.sort((a, b) => {
    if (a.category.name !== b.category.name) {
      return a.category.name.localeCompare(b.category.name, 'es');
    }
    return a.name.localeCompare(b.name, 'es');
  });

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(exercises, null, 2), 'utf-8');

  console.log(`Guardados ${exercises.length} ejercicios en ${OUTPUT_PATH}`);
  console.log(
    `Omitidos ${rawExercises.length - exercises.length} ejercicios sin traducción utilizable.`,
  );
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
