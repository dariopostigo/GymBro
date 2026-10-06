/**
 * Arreglos del catálogo de wger que no son de nombre (para eso está NAME_ES):
 *
 * - Duplicados: src/data/exerciseMerges.json (id que sobra -> id que se queda).
 *   Vive en src/ porque la app también lo usa: las rutinas, sesiones y
 *   favoritos guardados con el id que sobra se pasan al que se queda al
 *   cargarlos, así que no se pierde nada. Por eso un id fusionado no se
 *   vuelve a usar nunca.
 * - EXERCISE_FIXES: categoría o músculos mal puestos (o vacíos) en wger.
 * - Descripciones: se limpian los restos de HTML (&nbsp;...) y los enlaces, y
 *   las de DESCRIPTION_ES (exerciseDescriptionsEs.js) sustituyen a las de wger.
 * - MUSCLE_RENAMES: nombres de músculo que se cambian en todo el catálogo.
 *
 * Igual que NAME_ES, viven aquí para sobrevivir al siguiente
 * `npm run fetch:exercises`. Para aplicarlos al catálogo ya descargado:
 * `npm run fix:exercise-catalog`.
 */

const MERGED_INTO = require('../src/data/exerciseMerges.json');
const { DESCRIPTION_ES } = require('./exerciseDescriptionsEs');

const PIERNAS = { id: 9, name: 'Piernas' };
const BRAZOS = { id: 8, name: 'Brazos' };
const ABDOMINALES_CATEGORIA = { id: 10, name: 'Abdominales' };
const PECHO = { id: 11, name: 'Pecho' };
const ESPALDA = { id: 12, name: 'Espalda' };
const HOMBROS = { id: 13, name: 'Hombros' };
const GEMELOS = { id: 14, name: 'Gemelos' };

// wger llama al 2 "deltoide anterior", pero lo usa para cualquier ejercicio de
// hombro (laterales, pájaros...). Con el nombre genérico no engaña.
const MUSCLE_RENAMES = { 2: 'Hombros (deltoides)' };

const BICEPS = { id: 1, name: 'Bíceps' };
const HOMBRO = { id: 2, name: MUSCLE_RENAMES[2] };
const PECTORAL = { id: 4, name: 'Pecho' };
const TRICEPS = { id: 5, name: 'Tríceps' };
const ABDOMINALES = { id: 6, name: 'Abdominales' };
const GEMELO = { id: 7, name: 'Gemelos' };
const GLUTEOS = { id: 8, name: 'Glúteos' };
const TRAPECIO = { id: 9, name: 'Trapecio' };
const CUADRICEPS = { id: 10, name: 'Cuádriceps' };
const ISQUIOS = { id: 11, name: 'Isquiotibiales' };
const DORSALES = { id: 12, name: 'Dorsales' };
const BRAQUIAL = { id: 13, name: 'Braquial' };
const OBLICUOS = { id: 14, name: 'Oblicuos' };
const SOLEO = { id: 15, name: 'Sóleo' };
// wger no tiene estos tres: ids propios a partir del 16.
const ANTEBRAZOS = { id: 16, name: 'Antebrazos' };
const TIBIAL = { id: 17, name: 'Tibial anterior' };
const ADUCTORES = { id: 18, name: 'Aductores' };

/** Atajo: músculos principales y, opcionalmente, secundarios. */
const m = (primary, secondary = []) => ({ musclesPrimary: primary, musclesSecondary: secondary });

const EXERCISE_FIXES = {
  // --- Categoría equivocada ---
  1294: { category: PIERNAS, ...m([ISQUIOS], [GLUTEOS]) }, // Curl femoral a una pierna (estaba en Espalda)
  1219: { category: ESPALDA }, // Dominadas australianas (estaba en Brazos)
  1700: { category: PIERNAS, ...m([ISQUIOS, GLUTEOS], [DORSALES, TRAPECIO]) }, // Peso muerto rumano con barra (estaba en Espalda)
  1218: { category: PECHO, ...m([PECTORAL], [TRICEPS, HOMBRO]) }, // Flexiones de rodillas (estaba en Brazos)
  454: { category: HOMBROS, ...m([HOMBRO], [TRICEPS]) }, // Flexiones de pica (estaba en Brazos)
  1473: { category: HOMBROS, ...m([HOMBRO], [TRAPECIO]) }, // Aperturas inversas en polea (estaba en Espalda)
  1098: { category: HOMBROS, ...m([HOMBRO], [TRAPECIO]) }, // Elevación de deltoides posterior sentado (estaba en Espalda)
  31: { category: HOMBROS, ...m([HOMBRO], [TRAPECIO]) }, // Sostenimiento lateral isométrico (estaba en Brazos)
  1774: { category: BRAZOS, ...m([TRICEPS], [HOMBRO, PECTORAL]) }, // Fondos en silla (estaba en Hombros)
  1001: { category: ABDOMINALES_CATEGORIA, ...m([ABDOMINALES], [HOMBRO, PECTORAL]) }, // Plancha alta (estaba en Pecho)
  1243: { category: GEMELOS, ...m([GEMELO], [SOLEO]) }, // Elevación de talones a dos piernas (estaba en Piernas)

  // --- Músculo principal que no cuadraba ---
  51: m([ANTEBRAZOS]), // Curl de muñeca con barra (tenía deltoides + isquiotibiales)
  1519: m([TRICEPS]), // Extensión de tríceps por encima de la cabeza (tenía trapecio)
  484: m([DORSALES, TRAPECIO], [GLUTEOS, ISQUIOS]), // Peso muerto en rack (solo glúteos)
  1718: m([DORSALES], [BICEPS, TRAPECIO]), // Remo alto desde polea (oblicuos, serrato y tríceps)
  12: m([ADUCTORES]), // Aducción de cadera en máquina (glúteos)
  152: m([DORSALES, BICEPS], [ABDOMINALES]), // Dominadas con agarre supino (vacío)

  // --- Sin músculo principal ---
  // Abdominales
  165: m([ABDOMINALES]), // Abdominales en bola de estabilidad
  178: m([ABDOMINALES]), // Bicho muerto
  505: m([ABDOMINALES]), // Crunch en silla romana
  1776: m([OBLICUOS, ABDOMINALES], [ANTEBRAZOS]), // Paseo del maletín
  1766: m([ABDOMINALES], [HOMBRO]), // Plancha con extensión de brazo
  1019: m([OBLICUOS, ABDOMINALES]), // Plancha de lado derecho
  500: m([ABDOMINALES], [GLUTEOS, ISQUIOS]), // Plancha inversa
  1779: m([OBLICUOS], [HOMBRO]), // Rotación con landmine
  1966: m([OBLICUOS]), // Rotación torácica en media rodilla
  // Brazos
  1012: m([BICEPS], [BRAQUIAL]), // Curl de bíceps alterno
  1205: m([ANTEBRAZOS]), // Curl de muñeca con mancuernas
  1771: m([ANTEBRAZOS]), // Curl de muñeca en polea
  48: m([ANTEBRAZOS]), // Curl de muñeca inverso con barra
  1881: m([ANTEBRAZOS]), // Extensión de muñeca con mancuernas
  803: m([TRICEPS]), // Extensión de tríceps a una mano en polea
  1209: m([TRICEPS], [PECTORAL, ABDOMINALES]), // Flexión a tres puntos
  985: m([TRICEPS, PECTORAL], [OBLICUOS]), // Flexiones a rotación
  1000: m([TRICEPS], [PECTORAL, HOMBRO]), // Fondos
  112: m([TRICEPS], [ABDOMINALES, PECTORAL]), // Plancha a flexión
  // Cardio
  1618: m([CUADRICEPS], [GLUTEOS, GEMELO]), // Bicicleta estática
  530: m([CUADRICEPS, ISQUIOS], [GLUTEOS, GEMELO]), // Correr en cinta
  983: m([CUADRICEPS], [ABDOMINALES]), // Rodillas elevadas
  // Espalda
  1380: m([TRAPECIO], [HOMBRO]), // Aperturas con banda elástica
  1737: m([DORSALES, BICEPS]), // Dominadas supinas asistidas
  1083: m([TRAPECIO], [HOMBRO]), // Elevaciones Y-W-T
  695: m([DORSALES], [BICEPS]), // Jalón con barra en V
  189: m([ISQUIOS, GLUTEOS, DORSALES], [TRAPECIO]), // Peso muerto con déficit
  310: m([DORSALES], [BICEPS, TRAPECIO]), // Remo con mancuernas en banco inclinado
  1119: m([DORSALES], [BICEPS]), // Remo en máquina agarre estrecho
  1120: m([DORSALES], [BICEPS]), // Remo en máquina agarre estrecho supino
  1117: m([DORSALES], [BICEPS, TRAPECIO]), // Remo gironda agarre cerrado
  1082: m([DORSALES, TRAPECIO], [HOMBRO]), // Remo inclinado con rotación externa
  // Gemelos
  1200: m([TIBIAL]), // Elevación tibial anterior
  // Hombros
  1936: m([HOMBRO], [TRAPECIO]), // Aperturas para deltoides posterior en polea
  406: m([HOMBRO]), // Ejercicio del manguito rotador tumbado
  1754: m([HOMBRO]), // Elevaciones laterales a 45°
  82: m([HOMBRO], [TRAPECIO]), // Elevaciones posteriores
  1755: m([HOMBRO, TRAPECIO]), // Jalón en Y en polea
  20: m([HOMBRO], [TRICEPS]), // Press Arnold
  193: m([HOMBRO], [TRICEPS]), // Press diagonal para hombros
  418: m([HOMBRO], [TRICEPS, TRAPECIO]), // Press militar
  578: m([HOMBRO]), // Rotación externa tumbado de lado
  // Pecho
  801: m([PECTORAL], [TRICEPS, HOMBRO]), // Flexiones con mancuernas
  1353: m([PECTORAL], [TRICEPS]), // Press hex con mancuernas
  // Piernas
  1202: m([GLUTEOS]), // Abducción de cadera en decúbito lateral
  1096: m([GLUTEOS]), // Abducción de pie
  1724: m([ADUCTORES]), // Aducción de pie (polea)
  1116: m([TRAPECIO, ANTEBRAZOS], [ABDOMINALES]), // Paseo del granjero
  1370: m([ISQUIOS, GLUTEOS], [CUADRICEPS]), // Peso muerto con mancuernas
  1088: m([GLUTEOS, CUADRICEPS], [ISQUIOS, ADUCTORES]), // Peso muerto sumo con mancuerna
  989: m([CUADRICEPS, GLUTEOS]), // Sentadilla búlgara
  987: m([CUADRICEPS, ADUCTORES], [GLUTEOS]), // Sentadilla lateral
  1208: m([CUADRICEPS, GLUTEOS]), // Sentadilla del prisionero
  43: m([CUADRICEPS], [GLUTEOS, ISQUIOS]), // Sentadilla hack con barra
  981: m([CUADRICEPS, GLUTEOS]), // Subida a peldaño
  1366: m([CUADRICEPS, GLUTEOS]), // Zancada estática con mancuernas
  802: m([CUADRICEPS, GLUTEOS]), // Zancadas caminando con barra
  999: m([CUADRICEPS, GLUTEOS], [ISQUIOS]), // Zancadas hacia atrás
};

const HTML_ENTITIES = { '&nbsp;': ' ', '&amp;': '&', '&quot;': '"', '&#39;': "'", '&lt;': '<', '&gt;': '>' };

/** Quita los restos de HTML y los enlaces que trae wger en las descripciones. */
function cleanDescription(text) {
  return text
    .replace(/&(nbsp|amp|quot|lt|gt|#39);/g, entity => HTML_ENTITIES[entity])
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const renameMuscle = muscle =>
  MUSCLE_RENAMES[muscle.id] ? { ...muscle, name: MUSCLE_RENAMES[muscle.id] } : muscle;

/** Quita los duplicados y aplica todos los arreglos. Devuelve qué ha cambiado. */
function applyExerciseFixes(exercises) {
  const removed = exercises.filter(e => MERGED_INTO[e.id] !== undefined);
  const kept = exercises.filter(e => MERGED_INTO[e.id] === undefined);

  const fixed = [];
  for (const exercise of kept) {
    const next = {
      ...exercise,
      musclesPrimary: exercise.musclesPrimary.map(renameMuscle),
      musclesSecondary: exercise.musclesSecondary.map(renameMuscle),
      description: DESCRIPTION_ES[exercise.id] ?? cleanDescription(exercise.description),
      ...EXERCISE_FIXES[exercise.id],
    };
    if (JSON.stringify(next) === JSON.stringify(exercise)) continue;
    Object.assign(exercise, next);
    fixed.push(exercise);
  }

  return { exercises: kept, removed, fixed };
}

module.exports = { MERGED_INTO, EXERCISE_FIXES, MUSCLE_RENAMES, applyExerciseFixes };
