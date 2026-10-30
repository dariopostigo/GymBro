/**
 * @format
 */

import { TIMED_EXERCISES } from '../src/data/timedExercises';
import {
  defaultRepRange,
  getExerciseById,
  isBodyweight,
  isTimed,
  repRangeFor,
} from '../src/data/exerciseCatalog';
import { formatSeconds, formatSet, suggestNextLoad } from '../src/utils/progression';
import { setVolume } from '../src/utils/stats';
import { buildWorkoutSummary, describeRecord } from '../src/utils/workoutSummary';
import type { WorkoutSession } from '../src/types/session';

const PLANCHA = 1307;
const GRANJERO = 1116;
const SENTADILLA = 1312; // Sentadilla con peso corporal, por reps
const TARGET = { sets: 3, repsMin: 30, repsMax: 60 };

const session = (
  id: string,
  day: number,
  exerciseId: number,
  sets: [number, number][],
): WorkoutSession => ({
  id,
  date: new Date(2026, 9, day, 18).toISOString(),
  splitId: 'ppl',
  splitDayId: 'legs',
  dayName: 'Legs',
  completed: true,
  sets: sets.map(([weight, reps], i) => ({
    id: `${id}-${i}`,
    exerciseId,
    positionInSession: 1,
    setNumber: i + 1,
    weight,
    reps,
  })),
});

test('sabe qué ejercicios van por tiempo', () => {
  expect(isTimed(PLANCHA)).toBe(true);
  expect(isBodyweight(PLANCHA)).toBe(true);
  expect(isTimed(GRANJERO)).toBe(true);
  expect(isBodyweight(GRANJERO)).toBe(false);
  expect(isTimed(SENTADILLA)).toBe(false);
  for (const id of TIMED_EXERCISES) expect(getExerciseById(id)).toBeDefined();
});

test('los segundos se muestran en segundos o en minutos', () => {
  expect(formatSeconds(45)).toBe('45 s');
  expect(formatSeconds(90)).toBe('1:30');
  expect(formatSeconds(60)).toBe('1:00');
  expect(formatSet(0, 45, true, true)).toBe('45 s');
  expect(formatSet(10, 45, true, true)).toBe('PC+10 · 45 s');
  expect(formatSet(32, 60, false, true)).toBe('32 · 1:00');
  expect(formatSet(80, 10, false, false)).toBe('80×10');
});

test('una serie por tiempo no suma volumen', () => {
  expect(setVolume({ exerciseId: GRANJERO, weight: 32, reps: 40 })).toBe(0);
  expect(setVolume({ exerciseId: SENTADILLA, weight: 20, reps: 10 })).toBe(200);
});

test('la plancha sin lastre en el tope de segundos avisa en vez de cargar', () => {
  const sets = [60, 60, 60].map(reps => ({ weight: 0, reps }));
  const suggestion = suggestNextLoad(sets, TARGET, 2.5, undefined, true);
  expect(suggestion).toMatchObject({ weight: 0, increase: false, atTop: true });
});

test('más segundos con el mismo peso es récord, sin 1RM', () => {
  const before = session('a', 20, GRANJERO, [
    [32, 40],
    [32, 35],
  ]);
  const today = session('b', 27, GRANJERO, [
    [32, 50],
    [30, 70],
  ]);
  const summary = buildWorkoutSummary(today, [before, today]);
  const [record] = summary.records;
  // Los 70 s con 30 kg no cuentan: con menos peso no se compara.
  expect(record).toMatchObject({ kind: 'time', value: 50, previous: 40 });
  expect(describeRecord(record)).toBe('50 s (antes 40 s)');
  expect(summary.volume).toBe(0);
  expect(summary.exercises[0].trend).toBe('up');
});

test('al cambiar a un ejercicio por tiempo el rango pasa a segundos', () => {
  expect(defaultRepRange(PLANCHA)).toEqual({ targetRepsMin: 30, targetRepsMax: 60 });
  expect(defaultRepRange(SENTADILLA)).toEqual({ targetRepsMin: 8, targetRepsMax: 12 });
  const squatSlot = { exerciseId: SENTADILLA, targetRepsMin: 10, targetRepsMax: 15 };
  expect(repRangeFor(squatSlot, PLANCHA)).toEqual({ targetRepsMin: 30, targetRepsMax: 60 });
  expect(repRangeFor(squatSlot, 1324)).toEqual({ targetRepsMin: 10, targetRepsMax: 15 });
  const plankSlot = { exerciseId: PLANCHA, targetRepsMin: 20, targetRepsMax: 45 };
  expect(repRangeFor(plankSlot, 458)).toEqual({ targetRepsMin: 20, targetRepsMax: 45 });
});
