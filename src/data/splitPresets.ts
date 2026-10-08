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

/**
 * Push / Pull / Legs orientado a hipertrofia (acordado el 8/10/2026). Los 6 días
 * rotan en orden sin depender del calendario, pensado para 3-4 días por semana.
 * Básicos a 6-10 reps, secundarios a 8-12 y aislamientos a 10-15 para que la
 * sugerencia de progresión suba peso a menudo. Sin peso muerto rumano ni abdominales.
 */
const pplSplit: Split = {
  id: 'ppl',
  name: 'Push / Pull / Legs',
  type: 'ppl',
  days: [
    day('ppl-push-a', 'Push A', 0, [
      ex(537, 4, 6, 10), // Press inclinado con mancuernas
      ex(129, 4, 8, 12), // Press de banca sentado en máquina
      ex(543, 3, 8, 12), // Press de hombros en máquina
      ex(348, 4, 12, 15), // Elevación lateral con mancuernas
      ex(1378, 3, 12, 15), // Elevaciones laterales en polea (a un brazo)
      ex(1185, 4, 10, 12), // Extensión de tríceps en polea con cuerda
      ex(1336, 3, 10, 12), // Extensión de tríceps sobre la cabeza (mancuerna)
    ]),
    day('ppl-pull-a', 'Pull A', 1, [
      ex(1136, 4, 6, 10), // Jalón al pecho con agarre neutro
      ex(1725, 4, 8, 12), // Remo sentado (máquina)
      ex(81, 3, 8, 12), // Remo con mancuernas
      ex(222, 3, 12, 15), // Jalón a la cara (face pull)
      ex(204, 4, 10, 12), // Curl inclinado con mancuernas
      ex(272, 3, 10, 12), // Curl martillo
    ]),
    day('ppl-legs-a', 'Legs A', 2, [
      ex(1414, 4, 6, 10), // Sentadilla hack en máquina
      ex(366, 5, 10, 12), // Curl femoral sentado
      ex(371, 3, 10, 12), // Prensa de piernas
      ex(369, 3, 12, 15), // Extensión de cuádriceps en máquina
      ex(622, 5, 10, 15), // Elevación de gemelos de pie en máquina
    ]),
    day('ppl-push-b', 'Push B', 3, [
      ex(75, 4, 6, 10), // Press de banca con mancuernas
      ex(537, 3, 8, 12), // Press inclinado con mancuernas
      ex(129, 3, 8, 12), // Press de banca sentado en máquina
      ex(1744, 4, 12, 15), // Elevación lateral en máquina
      ex(1378, 3, 12, 15), // Elevaciones laterales en polea (a un brazo)
      ex(1336, 4, 10, 12), // Extensión de tríceps sobre la cabeza (mancuerna)
      ex(1185, 3, 10, 12), // Extensión de tríceps en polea con cuerda
    ]),
    day('ppl-pull-b', 'Pull B', 4, [
      ex(81, 4, 6, 10), // Remo con mancuernas
      ex(355, 4, 8, 12), // Jalón al pecho
      ex(1725, 3, 8, 12), // Remo sentado (máquina)
      ex(139, 3, 12, 15), // Contractora inversa (pec deck)
      ex(272, 4, 10, 12), // Curl martillo
      ex(204, 3, 10, 12), // Curl inclinado con mancuernas
    ]),
    day('ppl-legs-b', 'Legs B', 5, [
      ex(365, 5, 8, 12), // Curl de piernas (tumbado)
      ex(371, 4, 6, 10), // Prensa de piernas
      ex(1706, 3, 8, 12), // Sentadilla búlgara con mancuernas
      ex(294, 3, 8, 12), // Empuje de cadera con barra
      ex(369, 3, 12, 15), // Extensión de cuádriceps en máquina
      ex(590, 5, 12, 15), // Elevación de gemelos sentado en máquina
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
