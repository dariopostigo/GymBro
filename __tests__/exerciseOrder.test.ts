/**
 * @format
 */

import { computeMuscleGroupPositions } from '../src/utils/exerciseOrder';
import { EXERCISES } from '../src/data/exerciseCatalog';
import type { DayExerciseSlot } from '../src/types/routine';

function findByName(name: string) {
  const exercise = EXERCISES.find(e => e.name === name);
  if (!exercise) throw new Error(`Ejercicio de prueba no encontrado: ${name}`);
  return exercise;
}

function slot(id: string, exerciseName: string, order: number): DayExerciseSlot {
  return {
    id,
    exerciseId: findByName(exerciseName).id,
    order,
    targetSets: 3,
    targetRepsMin: 8,
    targetRepsMax: 12,
  };
}

test('cuenta la posición dentro de la misma categoría, ignorando otras categorías intercaladas', () => {
  const slots = [
    slot('a', 'Press de Banca', 1), // Pecho #1
    slot('b', 'Remo con mancuernas', 2), // Espalda #1
    slot('c', 'Aperturas con Mancuernas', 3), // Pecho #2
    slot('d', 'Cruce de Poleas para Pecho', 4), // Pecho #3
  ];

  const positions = computeMuscleGroupPositions(slots);

  expect(positions.get('a')).toBe(1);
  expect(positions.get('b')).toBe(1);
  expect(positions.get('c')).toBe(2);
  expect(positions.get('d')).toBe(3);
});

test('un único ejercicio de la sesión es siempre el 1º de su categoría', () => {
  const positions = computeMuscleGroupPositions([slot('a', 'Press de Banca', 1)]);
  expect(positions.get('a')).toBe(1);
});

test('un exerciseId inexistente en el catálogo no recibe posición', () => {
  const slots: DayExerciseSlot[] = [
    { id: 'x', exerciseId: -1, order: 1, targetSets: 3, targetRepsMin: 8, targetRepsMax: 12 },
  ];
  const positions = computeMuscleGroupPositions(slots);
  expect(positions.has('x')).toBe(false);
});

test('respeta el orden de la lista recibida, no el campo order de cada slot', () => {
  const slots = [
    slot('later', 'Aperturas con Mancuernas', 5),
    slot('earlier', 'Press de Banca', 1),
  ];
  const positions = computeMuscleGroupPositions(slots);
  expect(positions.get('later')).toBe(1);
  expect(positions.get('earlier')).toBe(2);
});
