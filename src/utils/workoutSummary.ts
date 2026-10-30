import type { SetEntry, WorkoutSession } from '../types/session';
import { formatWeight } from './progression';
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

type Lift = Pick<SetEntry, 'weight' | 'reps'>;

const exerciseVolume = (sets: Lift[]) =>
  sets.reduce((total, set) => total + set.weight * set.reps, 0);

/**
 * Si `sets` superan la mejor marca de `history`: primero por kilos y, sin
 * superarlos, por 1RM estimado. La primera vez que se hace un ejercicio no
 * hay marca que batir.
 */
function beatsRecord(exerciseId: number, sets: Lift[], history: Lift[]): PersonalRecord | null {
  if (!history.length) return null;
  const bestWeight = Math.max(...sets.map(set => set.weight));
  const previousWeight = Math.max(...history.map(set => set.weight));
  if (bestWeight > previousWeight) {
    return { exerciseId, kind: 'weight', value: bestWeight, previous: previousWeight };
  }
  const bestOrm = Math.max(...sets.map(set => estimatedOneRepMax(set.weight, set.reps)));
  const previousOrm = Math.max(...history.map(set => estimatedOneRepMax(set.weight, set.reps)));
  if (bestOrm > previousOrm) {
    return { exerciseId, kind: 'orm', value: bestOrm, previous: previousOrm };
  }
  return null;
}

/**
 * Series de un ejercicio en la sesión que batieron la marca en el momento de
 * apuntarlas: cada una se compara con las sesiones anteriores y con las series
 * de hoy que vinieron antes. Clave: id de la serie.
 */
export function liveRecords(
  exerciseId: number,
  session: WorkoutSession,
  sessions: WorkoutSession[],
): Map<string, PersonalRecord> {
  const history: Lift[] = sessions
    .filter(s => s.id !== session.id && s.date < session.date)
    .flatMap(s => s.sets.filter(set => set.exerciseId === exerciseId));

  const records = new Map<string, PersonalRecord>();
  // Las series se guardan en el orden en que se apuntan.
  for (const set of session.sets) {
    if (set.exerciseId !== exerciseId) continue;
    const record = beatsRecord(exerciseId, [set], history);
    if (record) records.set(set.id, record);
    history.push(set);
  }
  return records;
}

/** "85 kg (antes 82,5)" o "1RM est. 98 kg (antes 95)". */
export function describeRecord({ kind, value, previous }: PersonalRecord): string {
  return kind === 'weight'
    ? `${formatWeight(value)} kg (antes ${formatWeight(previous)})`
    : `1RM est. ${value} kg (antes ${previous})`;
}

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

    const history = earlier.flatMap(s => s.sets.filter(set => set.exerciseId === exerciseId));
    const record = beatsRecord(exerciseId, sets, history);
    if (record) records.push(record);
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
