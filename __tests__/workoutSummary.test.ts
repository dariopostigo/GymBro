import type { WorkoutSession } from '../src/types/session';
import { buildWorkoutSummary } from '../src/utils/workoutSummary';

const BENCH = 1;
const SQUAT = 2;
const ROW = 3;

/** Sesión con series [ejercicio, peso, reps] en orden. */
function session(
  id: string,
  date: string,
  sets: [number, number, number][],
  splitDayId = 'push',
): WorkoutSession {
  return {
    id,
    date: `2026-10-${date}T18:00:00.000Z`,
    splitId: 'ppl',
    splitDayId,
    dayName: 'Empuje',
    completed: true,
    sets: sets.map(([exerciseId, weight, reps], i) => ({
      id: `${id}-${i}`,
      exerciseId,
      positionInSession: exerciseId,
      setNumber: i + 1,
      weight,
      reps,
    })),
  };
}

const lastWeek = session('a', '01', [
  [BENCH, 80, 10],
  [BENCH, 80, 9],
  [SQUAT, 100, 5],
]);
const otherDay = session('b', '03', [[SQUAT, 100, 8]], 'legs');
const today = session('c', '08', [
  [BENCH, 82.5, 8],
  [BENCH, 80, 10],
  [BENCH, 80, 10],
  [SQUAT, 100, 6],
  [ROW, 50, 12],
]);

const summary = buildWorkoutSummary(today, [lastWeek, otherDay, today]);

test('totales de la sesión', () => {
  expect(summary.sets).toBe(5);
  expect(summary.volume).toBe(82.5 * 8 + 800 * 2 + 600 + 600);
  expect(summary.exercises.map(e => e.exerciseId)).toEqual([BENCH, SQUAT, ROW]);
});

test('compara con la última vez del mismo día del split', () => {
  const before = 800 + 720 + 500;
  expect(summary.comparison).toEqual({
    date: lastWeek.date,
    volumeChange: (summary.volume - before) / before,
    setsDiff: 2,
  });
});

test('la tendencia de cada ejercicio sale de la última vez que se hizo, sea el día que sea', () => {
  // Sentadilla: 100×6 hoy contra 100×8 en pierna (más reciente que el empuje de la semana pasada).
  expect(summary.exercises.map(e => e.trend)).toEqual(['up', 'down', 'new']);
});

test('récords: de peso si se superan los kilos y si no de 1RM estimado', () => {
  expect(summary.records).toEqual([
    { exerciseId: BENCH, kind: 'weight', value: 82.5, previous: 80 },
  ]);

  const moreReps = session('d', '10', [[SQUAT, 100, 10]]);
  expect(buildWorkoutSummary(moreReps, [lastWeek, otherDay, moreReps]).records).toEqual([
    { exerciseId: SQUAT, kind: 'orm', value: 133, previous: 127 },
  ]);
});

test('sin historial no hay comparación ni récords', () => {
  const first = buildWorkoutSummary(lastWeek, [lastWeek]);
  expect(first.comparison).toBeUndefined();
  expect(first.records).toEqual([]);
  expect(first.exercises.every(e => e.trend === 'new')).toBe(true);
});

test('las sesiones posteriores no cuentan', () => {
  expect(buildWorkoutSummary(lastWeek, [lastWeek, today]).records).toEqual([]);
});
