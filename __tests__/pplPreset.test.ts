/**
 * @format
 */

import { SPLIT_PRESETS } from '../src/data/splitPresets';
import { getExerciseById } from '../src/data/exerciseCatalog';

/**
 * Rutina PPL de hipertrofia acordada el 8/10/2026, escrita con los nombres
 * reales del catálogo. Si un id apunta a otro ejercicio, salta aquí.
 */
const PPL_ROUTINE: Record<string, [string, string][]> = {
  'Push A': [
    ['Press inclinado con mancuernas', '4x6-10'],
    ['Press de banca sentado en máquina', '4x8-12'],
    ['Press de hombros en máquina', '3x8-12'],
    ['Elevación lateral con mancuernas', '4x12-15'],
    ['Elevaciones laterales en polea (a un brazo)', '3x12-15'],
    ['Extensión de tríceps en polea con cuerda', '4x10-12'],
    ['Extensión de tríceps sobre la cabeza (mancuerna)', '3x10-12'],
  ],
  'Pull A': [
    ['Jalón al pecho con agarre neutro', '4x6-10'],
    ['Remo sentado (máquina)', '4x8-12'],
    ['Remo con mancuernas', '3x8-12'],
    ['Jalón a la cara (face pull)', '3x12-15'],
    ['Curl inclinado con mancuernas', '4x10-12'],
    ['Curl Martillo', '3x10-12'],
  ],
  'Legs A': [
    ['Sentadilla hack en máquina', '4x6-10'],
    ['Curl femoral sentado', '5x10-12'],
    ['Prensa de piernas', '3x10-12'],
    ['Extensión de cuádriceps en máquina', '3x12-15'],
    ['Elevación de gemelos de pie en máquina', '5x10-15'],
  ],
  'Push B': [
    ['Press de banca con mancuernas', '4x6-10'],
    ['Press inclinado con mancuernas', '3x8-12'],
    ['Press de banca sentado en máquina', '3x8-12'],
    ['Elevación lateral en máquina', '4x12-15'],
    ['Elevaciones laterales en polea (a un brazo)', '3x12-15'],
    ['Extensión de tríceps sobre la cabeza (mancuerna)', '4x10-12'],
    ['Extensión de tríceps en polea con cuerda', '3x10-12'],
  ],
  'Pull B': [
    ['Remo con mancuernas', '4x6-10'],
    ['Jalón al pecho', '4x8-12'],
    ['Remo sentado (máquina)', '3x8-12'],
    ['Contractora inversa (pec deck)', '3x12-15'],
    ['Curl Martillo', '4x10-12'],
    ['Curl inclinado con mancuernas', '3x10-12'],
  ],
  'Legs B': [
    ['Curl de piernas (tumbado)', '5x8-12'],
    ['Prensa de piernas', '4x6-10'],
    ['Sentadilla búlgara con mancuernas', '3x8-12'],
    ['Empuje de cadera con barra', '3x8-12'],
    ['Extensión de cuádriceps en máquina', '3x12-15'],
    ['Elevación de gemelos sentado en máquina', '5x12-15'],
  ],
};

const ppl = SPLIT_PRESETS.find(split => split.id === 'ppl');

test('el split por defecto es el PPL de hipertrofia', () => {
  expect(SPLIT_PRESETS[0].id).toBe('ppl');
  expect(ppl!.days.map(day => day.name)).toEqual(Object.keys(PPL_ROUTINE));
});

test('cada día del PPL reproduce la rutina acordada', () => {
  for (const day of ppl!.days) {
    const actual = [...day.exercises]
      .sort((a, b) => a.order - b.order)
      .map(exerciseSlot => [
        getExerciseById(exerciseSlot.exerciseId)?.name ?? `#${exerciseSlot.exerciseId} no existe`,
        `${exerciseSlot.targetSets}x${exerciseSlot.targetRepsMin}-${exerciseSlot.targetRepsMax}`,
      ]);
    expect([day.name, actual]).toEqual([day.name, PPL_ROUTINE[day.name]]);
  }
});

test('todos los presets apuntan a ejercicios que existen en el catálogo', () => {
  const missing = SPLIT_PRESETS.flatMap(split =>
    split.days.flatMap(day =>
      day.exercises
        .filter(exerciseSlot => !getExerciseById(exerciseSlot.exerciseId))
        .map(exerciseSlot => `${split.name} · ${day.name} · #${exerciseSlot.exerciseId}`),
    ),
  );
  expect(missing).toEqual([]);
});

test('los huecos de cada día tienen ids únicos', () => {
  for (const day of ppl!.days) {
    const ids = day.exercises.map(exerciseSlot => exerciseSlot.id);
    expect(new Set(ids).size).toBe(ids.length);
  }
});
