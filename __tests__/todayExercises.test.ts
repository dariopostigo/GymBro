/**
 * @format
 */

import { todayExercises } from '../src/utils/todayExercises';
import type { SplitDay } from '../src/types/routine';

const day: SplitDay = {
  id: 'legs',
  name: 'Legs',
  order: 0,
  exercises: [
    { id: 'b', exerciseId: 1312, order: 1, targetSets: 3, targetRepsMin: 10, targetRepsMax: 15 },
    { id: 'a', exerciseId: 989, order: 0, targetSets: 4, targetRepsMin: 8, targetRepsMax: 12 },
  ],
};

test('sin cambios de hoy es la plantilla en su orden', () => {
  expect(todayExercises(day, {}).map(slot => slot.id)).toEqual(['a', 'b']);
  expect(todayExercises(null, {})).toEqual([]);
});

test('aplica los cambios de hoy y pone los añadidos al final', () => {
  const exercises = todayExercises(day, {
    b: { exerciseId: 1307, targetSets: 2 }, // Plancha frontal, por tiempo
    extra1: { exerciseId: 475, targetSets: 3, extra: { repsMin: 6, repsMax: 10 } },
  });
  expect(exercises.map(slot => slot.exerciseId)).toEqual([989, 1307, 475]);
  expect(exercises[1]).toMatchObject({ targetSets: 2, targetRepsMin: 30, targetRepsMax: 60 });
  expect(exercises.reduce((sum, slot) => sum + slot.targetSets, 0)).toBe(9);
});

test('con el orden de hoy cambiado, va en ese orden y lo nuevo detrás', () => {
  const exercises = todayExercises(day, {
    a: { order: 1 },
    b: { order: 0 },
    extra1: { exerciseId: 475, extra: { repsMin: 6, repsMax: 10 } },
  });
  expect(exercises.map(slot => slot.id)).toEqual(['b', 'a', 'extra1']);
});
