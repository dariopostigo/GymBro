/**
 * @format
 */

import { EXERCISES, getExerciseById, primaryMusclesSuffix } from '../src/data/exerciseCatalog';

test('ningún músculo es a la vez principal y secundario', () => {
  const repeated = EXERCISES.filter(e =>
    e.musclesSecondary.some(s => e.musclesPrimary.some(p => p.id === s.id)),
  ).map(e => `${e.id} ${e.name}`);
  expect(repeated).toEqual([]);
});

test('el subtítulo no repite el músculo que se llama como la categoría', () => {
  const press = getExerciseById(537)!; // Press inclinado con mancuernas: Pecho · Pecho
  expect(press.category.name).toBe('Pecho');
  expect(primaryMusclesSuffix(press)).toBe('');

  const legPress = getExerciseById(371)!; // Prensa: Cuádriceps · Isquiotibiales, ...
  expect(primaryMusclesSuffix(legPress)).toMatch(/^ · /);
  expect(primaryMusclesSuffix(legPress)).not.toContain('Cuádriceps');
});
