import type { SetEntry, WorkoutSession } from '../types/session';
import { estimatedOneRepMax, sessionVolume } from './stats';

/** Cómo fue un ejercicio respecto a la última vez que se hizo (por volumen). */
export type ExerciseTrend = 'up' | 'down' | 'same' | 'new';

export interface ExerciseResult {
  exerciseId: number;
  sets: Pick<SetEntry, 'weight' | 'reps'>[];
  volume: number;
  trend: ExerciseTrend;
}

export interface PersonalRecord {
  exerciseId: number;
  /** `weight`: más kilos que nunca; `orm`: mejor 1RM estimado sin superar el peso. */
  kind: 'weight' | 'orm';
  value: number;
  previous: number;
}

export interface DayComparison {
  /** Fecha de la última vez que se hizo este mismo día del split. */
  date: string;
  /** Cambio relativo de volumen: 0.08 = +8 %. */
  volumeChange: number;
  setsDiff: number;
}

export interface WorkoutSummary {
  sets: number;
  volume: number;
  exercises: ExerciseResult[];
  records: PersonalRecord[];
  comparison?: DayComparison;
}

const exerciseVolume = (sets: Pick<SetEntry, 'weight' | 'reps'>[]) =>
  sets.reduce((total, set) => total + set.weight * set.reps, 0);

/** Resumen de una sesión comparada con todo lo entrenado antes que ella. */
export function buildWorkoutSummary(
  session: WorkoutSession,
  sessions: WorkoutSession[],
): WorkoutSummary {
  // Más reciente primero, para encontrar rápido "la última vez".
  const earlier = sessions
    .filter(s => s.id !== session.id && s.date < session.date)
    .sort((a, b) => b.date.localeCompare(a.date));

  // Ejercicios en el orden en que se hicieron.
  const byExercise = new Map<number, SetEntry[]>();
  for (const set of [...session.sets].sort((a, b) => a.positionInSession - b.positionInSession)) {
    byExercise.set(set.exerciseId, [...(byExercise.get(set.exerciseId) ?? []), set]);
  }

  const exercises: ExerciseResult[] = [];
  const records: PersonalRecord[] = [];

  for (const [exerciseId, sets] of byExercise) {
    const volume = exerciseVolume(sets);
    const lastTime = earlier.find(s => s.sets.some(set => set.exerciseId === exerciseId));
    let trend: ExerciseTrend = 'new';
    if (lastTime) {
      const before = exerciseVolume(lastTime.sets.filter(set => set.exerciseId === exerciseId));
      trend = volume > before ? 'up' : volume < before ? 'down' : 'same';
    }
    exercises.push({
      exerciseId,
      sets: sets.map(({ weight, reps }) => ({ weight, reps })),
      volume,
      trend,
    });

    // La primera vez que se hace un ejercicio no hay marca que batir.
    const history = earlier.flatMap(s => s.sets.filter(set => set.exerciseId === exerciseId));
    if (!history.length) continue;
    const bestWeight = Math.max(...sets.map(set => set.weight));
    const previousWeight = Math.max(...history.map(set => set.weight));
    if (bestWeight > previousWeight) {
      records.push({ exerciseId, kind: 'weight', value: bestWeight, previous: previousWeight });
      continue;
    }
    const bestOrm = Math.max(...sets.map(set => estimatedOneRepMax(set.weight, set.reps)));
    const previousOrm = Math.max(...history.map(set => estimatedOneRepMax(set.weight, set.reps)));
    if (bestOrm > previousOrm) {
      records.push({ exerciseId, kind: 'orm', value: bestOrm, previous: previousOrm });
    }
  }

  const volume = sessionVolume(session);
  const lastSameDay = earlier.find(
    s => s.splitId === session.splitId && s.splitDayId === session.splitDayId && s.sets.length,
  );
  const previousVolume = lastSameDay ? sessionVolume(lastSameDay) : 0;
  const comparison =
    lastSameDay && previousVolume > 0
      ? {
          date: lastSameDay.date,
          volumeChange: (volume - previousVolume) / previousVolume,
          setsDiff: session.sets.length - lastSameDay.sets.length,
        }
      : undefined;

  return { sets: session.sets.length, volume, exercises, records, comparison };
}
