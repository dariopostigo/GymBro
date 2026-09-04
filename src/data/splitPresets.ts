import type { DayExerciseSlot, Split, SplitDay } from '../types/routine';

// Los IDs de ejercicio referencian src/data/exercises.json (catálogo de wger).
// Se prioriza incluir ejercicios que tengan imagen disponible.
interface ExerciseSpec {
  exerciseId: number;
  sets: number;
  repsMin: number;
  repsMax: number;
}

function ex(exerciseId: number, sets: number, repsMin: number, repsMax: number): ExerciseSpec {
  return { exerciseId, sets, repsMin, repsMax };
}

function slot(spec: ExerciseSpec, order: number): DayExerciseSlot {
  return {
    id: `slot-${spec.exerciseId}-${order}`,
    exerciseId: spec.exerciseId,
    order,
    targetSets: spec.sets,
    targetRepsMin: spec.repsMin,
    targetRepsMax: spec.repsMax,
  };
}

function day(id: string, name: string, order: number, specs: ExerciseSpec[]): SplitDay {
  return {
    id,
    name,
    order,
    exercises: specs.map((spec, index) => slot(spec, index)),
  };
}

const pplSplit: Split = {
  id: 'ppl',
  name: 'Push / Pull / Legs',
  type: 'ppl',
  days: [
    day('ppl-push-1', 'Push 1', 0, [
      ex(73, 3, 8, 12), // Press banca
      ex(537, 3, 8, 12), // Press inclinado
      ex(238, 3, 8, 12), // Aperturas
      ex(348, 3, 8, 12), // Elevaciones laterales
      ex(1900, 3, 8, 20), // Pushdown
      ex(1336, 3, 8, 20), // Extensión sobre la cabeza
    ]),
    day('ppl-pull-1', 'Pull 1', 1, [
      ex(355, 4, 8, 12), // Jalón al pecho
      ex(81, 3, 8, 12), // Remo con mancuerna
      ex(152, 3, 8, 12), // Dominadas (Chin Up)
      ex(572, 3, 8, 20), // Encogimientos de hombros
      ex(1448, 3, 8, 12), // Curl inclinado
      ex(1567, 3, 8, 12), // Curl martillo
      ex(465, 2, 8, 12), // Curl predicador
      ex(1639, 4, 8, 20), // Facepull
    ]),
    day('ppl-legs-1', 'Legs 1', 2, [
      ex(1414, 4, 8, 12), // Sentadilla Hack
      ex(206, 4, 8, 12), // Zancadas
      ex(1652, 4, 8, 12), // Peso muerto rumano
      ex(294, 4, 8, 12), // Hip Thrust
      ex(622, 4, 8, 20), // Elevaciones de talones
      ex(427, 4, 8, 20), // Abdominales declinados (crunch en banco declinado)
    ]),
    day('ppl-push-2', 'Push 2', 3, [
      ex(73, 3, 8, 12), // Press banca
      ex(237, 3, 8, 12), // Cables cruzados
      ex(194, 3, 8, 12), // Fondos
      ex(246, 4, 8, 12), // Press francés
      ex(418, 3, 8, 12), // Press militar
      ex(348, 3, 8, 12), // Elevaciones laterales
    ]),
    day('ppl-pull-2', 'Pull 2', 4, [
      ex(919, 4, 8, 12), // Remo en T
      ex(512, 3, 8, 12), // Remo Gironda
      ex(1972, 3, 8, 12), // Jalón unilateral (jalón al pecho a un brazo)
      ex(572, 4, 8, 20), // Encogimientos de hombros
      ex(465, 3, 8, 12), // Curl predicador
      ex(1567, 3, 8, 12), // Curl martillo
      ex(1709, 4, 8, 20), // Pájaros con mancuernas
    ]),
    day('ppl-legs-2', 'Legs 2', 5, [
      ex(1706, 3, 8, 12), // Sentadilla búlgara
      ex(294, 3, 8, 12), // Hip Thrust
      ex(364, 4, 8, 12), // Curl femoral
      ex(371, 4, 8, 12), // Prensa de pierna
      ex(622, 4, 8, 20), // Elevaciones de talones
      ex(427, 4, 8, 20), // Abdominales declinados (crunch en banco declinado)
    ]),
  ],
};

const upperLowerSplit: Split = {
  id: 'upper-lower',
  name: 'Torso / Pierna',
  type: 'upper-lower',
  days: [
    day('ul-upper', 'Torso', 0, [
      ex(73, 4, 8, 12),
      ex(475, 4, 8, 12),
      ex(566, 4, 8, 12),
      ex(91, 4, 8, 12),
      ex(50, 4, 8, 12),
    ]),
    day('ul-lower', 'Pierna', 1, [
      ex(1801, 4, 8, 12),
      ex(184, 4, 8, 12),
      ex(371, 4, 8, 12),
      ex(364, 4, 8, 12),
      ex(146, 4, 8, 12),
    ]),
  ],
};

const broSplit: Split = {
  id: 'bro-split',
  name: 'Bro Split',
  type: 'bro-split',
  days: [
    day('bro-chest', 'Pecho', 0, [ex(73, 4, 8, 12), ex(538, 4, 8, 12), ex(238, 4, 8, 12)]),
    day('bro-back', 'Espalda', 1, [ex(475, 4, 8, 12), ex(394, 4, 8, 12), ex(184, 4, 8, 12)]),
    day('bro-legs', 'Piernas', 2, [
      ex(1801, 4, 8, 12),
      ex(371, 4, 8, 12),
      ex(364, 4, 8, 12),
      ex(146, 4, 8, 12),
    ]),
    day('bro-shoulders', 'Hombros', 3, [ex(566, 4, 8, 12), ex(348, 4, 8, 12), ex(567, 4, 8, 12)]),
    day('bro-arms', 'Brazos', 4, [ex(91, 4, 8, 12), ex(50, 4, 8, 12)]),
  ],
};

export const SPLIT_PRESETS: Split[] = [pplSplit, upperLowerSplit, broSplit];
