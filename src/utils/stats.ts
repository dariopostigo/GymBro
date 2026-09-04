import type { WorkoutSession } from '../types/session';

/** La semana empieza en lunes: el índice 0 es L y el 6 es D. */
const WEEKDAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/** Días transcurridos desde el lunes de la semana en curso (0 = lunes). */
function daysSinceMonday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Clave local YYYY-MM-DD para agrupar por día sin depender de la zona UTC. */
export function dayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

export function sessionVolume(session: WorkoutSession): number {
  return session.sets.reduce((total, set) => total + set.weight * set.reps, 0);
}

export interface TotalStats {
  sessions: number;
  sets: number;
  volume: number;
  streak: number;
}

/** Días consecutivos entrenando, contando desde hoy (o desde ayer si hoy aún no toca). */
export function trainingStreak(sessions: WorkoutSession[]): number {
  const days = new Set(sessions.filter(s => s.sets.length > 0).map(s => dayKey(s.date)));
  if (days.size === 0) return 0;

  const cursor = new Date();
  if (!days.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(dayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function totalStats(sessions: WorkoutSession[]): TotalStats {
  let sets = 0;
  let volume = 0;
  for (const session of sessions) {
    sets += session.sets.length;
    volume += sessionVolume(session);
  }
  return {
    sessions: sessions.filter(s => s.sets.length > 0).length,
    sets,
    volume,
    streak: trainingStreak(sessions),
  };
}

export interface DayVolume {
  key: string;
  label: string;
  volume: number;
  isToday: boolean;
  isFuture: boolean;
}

/** Volumen de la semana en curso, de lunes a domingo. */
export function volumeByWeek(sessions: WorkoutSession[]): DayVolume[] {
  const totals = new Map<string, number>();
  for (const session of sessions) {
    const key = dayKey(session.date);
    totals.set(key, (totals.get(key) ?? 0) + sessionVolume(session));
  }

  const today = new Date();
  const todayKey = dayKey(today);
  const todayIndex = daysSinceMonday(today);

  const monday = new Date(today);
  monday.setDate(today.getDate() - todayIndex);

  const result: DayVolume[] = [];
  for (let index = 0; index < 7; index += 1) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const key = dayKey(date);
    result.push({
      key,
      label: WEEKDAY_LABELS[index],
      volume: totals.get(key) ?? 0,
      isToday: key === todayKey,
      isFuture: index > todayIndex,
    });
  }
  return result;
}

export interface ExerciseSummary {
  exerciseId: number;
  totalSets: number;
  bestWeight: number;
  lastDate: string;
  sessions: number;
}

/** Resumen por ejercicio entrenado, del más reciente al más antiguo. */
export function exerciseSummaries(sessions: WorkoutSession[]): ExerciseSummary[] {
  const byExercise = new Map<number, ExerciseSummary & { sessionIds: Set<string> }>();

  for (const session of sessions) {
    for (const set of session.sets) {
      const existing = byExercise.get(set.exerciseId);
      if (!existing) {
        byExercise.set(set.exerciseId, {
          exerciseId: set.exerciseId,
          totalSets: 1,
          bestWeight: set.weight,
          lastDate: session.date,
          sessions: 1,
          sessionIds: new Set([session.id]),
        });
        continue;
      }
      existing.totalSets += 1;
      existing.bestWeight = Math.max(existing.bestWeight, set.weight);
      if (session.date > existing.lastDate) existing.lastDate = session.date;
      existing.sessionIds.add(session.id);
      existing.sessions = existing.sessionIds.size;
    }
  }

  return [...byExercise.values()]
    .map(({ sessionIds: _sessionIds, ...summary }) => summary)
    .sort((a, b) => b.lastDate.localeCompare(a.lastDate));
}

/** "12,4k" para números grandes, "840" para el resto. */
export function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1).replace('.', ',')}k`;
  }
  return String(Math.round(volume));
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
