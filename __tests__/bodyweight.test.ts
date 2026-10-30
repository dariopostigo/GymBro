/**
 * @format
 */

import { BODYWEIGHT_EXERCISES } from '../src/data/bodyweightExercises';
import { getExerciseById, isBodyweight } from '../src/data/exerciseCatalog';
import { formatLoad, suggestNextLoad } from '../src/utils/progression';
import { buildWorkoutSummary, describeRecord } from '../src/utils/workoutSummary';
import type { WorkoutSession } from '../src/types/session';

const DOMINADAS = 475;
const TARGET = { sets: 3, repsMin: 6, repsMax: 10 };

test('sabe qué ejercicios son con el peso del cuerpo', () => {
  expect(isBodyweight(DOMINADAS)).toBe(true);
  expect(isBodyweight(194)).toBe(true); // Fondos en paralelas
  expect(isBodyweight(355)).toBe(false); // Jalón al pecho
  for (const id of BODYWEIGHT_EXERCISES) expect(getExerciseById(id)).toBeDefined();
});

test('la carga se muestra como peso corporal, con o sin lastre', () => {
  expect(formatLoad(0, true)).toBe('PC');
  expect(formatLoad(10, true)).toBe('PC+10');
  expect(formatLoad(62.5, false)).toBe('62,5');
});

test('sin lastre y en el tope de reps no se sugiere cargar: se avisa', () => {
  const sets = [10, 10, 10].map(reps => ({ weight: 0, reps }));
  const suggestion = suggestNextLoad(sets, TARGET, 2.5, undefined, true);
  expect(suggestion).toMatchObject({ weight: 0, increase: false, atTop: true });
});

test('con lastre la progresión sube como siempre', () => {
  const sets = [10, 10, 10].map(reps => ({ weight: 10, reps }));
  const suggestion = suggestNextLoad(sets, TARGET, 2.5, undefined, true);
  expect(suggestion).toMatchObject({ weight: 12.5, increase: true });
});

test('sin lastre, más repeticiones que nunca es récord', () => {
  const session = (id: string, day: number, reps: number[]): WorkoutSession => ({
    id,
    date: new Date(2026, 9, day, 18).toISOString(),
    splitId: 'ppl',
    splitDayId: 'pull',
    dayName: 'Pull',
    completed: true,
    sets: reps.map((r, i) => ({
      id: `${id}-${i}`,
      exerciseId: DOMINADAS,
      positionInSession: 1,
      setNumber: i + 1,
      weight: 0,
      reps: r,
    })),
  });
  const before = session('a', 20, [8, 7, 6]);
  const today = session('b', 27, [9, 8, 7]);
  const [record] = buildWorkoutSummary(today, [before, today]).records;
  expect(record).toMatchObject({ kind: 'reps', value: 9, previous: 8 });
  expect(describeRecord(record)).toBe('9 reps (antes 8)');
});
