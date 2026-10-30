import { UNILATERAL_EXERCISES } from '../src/data/unilateralExercises';
import { getExerciseById, isUnilateral } from '../src/data/exerciseCatalog';
import { sessionVolume, setVolume } from '../src/utils/stats';
import { setsByMuscleGroup } from '../src/utils/muscleMap';
import type { WorkoutSession } from '../src/types/session';

const BULGARA = 1706; // Sentadilla búlgara con mancuernas
const SENTADILLA = 615; // Sentadilla con barra

test('sabe qué ejercicios son a un lado', () => {
  expect(isUnilateral(BULGARA)).toBe(true);
  expect(isUnilateral(81)).toBe(true); // Remo con mancuernas
  expect(isUnilateral(SENTADILLA)).toBe(false);
  for (const id of UNILATERAL_EXERCISES) expect(getExerciseById(id)).toBeDefined();
});

test('las series por lado cuentan el volumen de los dos lados', () => {
  expect(setVolume({ weight: 30, reps: 10, perSide: true })).toBe(600);
  expect(setVolume({ weight: 30, reps: 10 })).toBe(300);
});

test('una serie por lado sigue siendo una serie para el músculo', () => {
  const date = new Date(2026, 9, 27, 18);
  const session: WorkoutSession = {
    id: 's',
    date: date.toISOString(),
    splitId: 'ppl',
    splitDayId: 'legs',
    dayName: 'Pierna',
    completed: true,
    sets: [
      {
        id: 'a',
        exerciseId: BULGARA,
        positionInSession: 1,
        setNumber: 1,
        weight: 20,
        reps: 10,
        perSide: true,
      },
    ],
  };
  expect(sessionVolume(session)).toBe(400);
  const week = setsByMuscleGroup([session], new Date(2026, 9, 26), new Date(2026, 10, 2));
  expect(week.get('Cuádriceps')).toBe(1);
});
