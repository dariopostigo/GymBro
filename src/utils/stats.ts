import { isTimed } from '../data/exerciseCatalog';
import type { SetEntry, WorkoutSession } from '../types/session';
import { STALE_SESSION_MS } from './staleSession';

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

/**
 * Kilos movidos en una serie; las series por lado cuentan los dos lados. Las de
 * un ejercicio por tiempo no suman: kilos por segundos no es volumen.
 */
export function setVolume(
  set: Pick<SetEntry, 'weight' | 'reps' | 'perSide'> & { exerciseId?: number },
): number {
  if (set.exerciseId !== undefined && isTimed(set.exerciseId)) return 0;
  return set.weight * set.reps * (set.perSide ? 2 : 1);
}

export function sessionVolume(session: WorkoutSession): number {
  return session.sets.reduce((total, set) => total + setVolume(set), 0);
}

/**
 * Lo que duró un entreno, de la primera a la última serie apuntada (la sesión
 * empieza al apuntar la primera). Sin dato si las series son de antes de
 * guardar la hora, si solo hay una o si duró tanto que se quedó abierto.
 */
export function sessionDuration(session: WorkoutSession): number | null {
  const times = session.sets.flatMap(set => (set.loggedAt ? [Date.parse(set.loggedAt)] : []));
  if (!times.length) return null;
  const duration = Math.max(...times) - Date.parse(session.date);
  return duration >= 60_000 && duration <= STALE_SESSION_MS ? duration : null;
}

/** "45 min" o "1 h 05 min". */
export function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min`;
}

/**
 * 1RM estimado con la fórmula de Epley: peso * (1 + reps / 30).
 *
 * Sirve para comparar sesiones donde cambian peso y repeticiones a la vez:
 * 80x5 y 70x10 rinden 93 y 93, así que subir reps cuenta como progreso igual
 * que subir kilos. La fórmula pierde fiabilidad por encima de ~10 reps, donde
 * tiende a sobreestimar.
 */
export function estimatedOneRepMax(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 30));
}

export interface TotalStats {
  sessions: number;
  sets: number;
  volume: number;
  /** Semanas seguidas cumpliendo el objetivo de días (ver `weeklyStreak`). */
  streak: number;
  /** Días entrenados esta semana (de lunes a hoy). */
  daysThisWeek: number;
}

/** Clave del lunes de la semana de `date`. */
function weekKey(date: Date): string {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - daysSinceMonday(monday));
  return dayKey(monday);
}

/**
 * Racha en semanas (de lunes a domingo): cuántas semanas seguidas has entrenado
 * al menos `goal` días distintos. La semana en curso suma si ya lo has cumplido,
 * pero no corta la racha mientras no haya terminado.
 */
export function weeklyStreak(
  sessions: WorkoutSession[],
  goal: number,
  now = new Date(),
): { weeks: number; daysThisWeek: number } {
  const daysByWeek = new Map<string, Set<string>>();
  for (const session of sessions) {
    if (session.sets.length === 0) continue;
    const date = new Date(session.date);
    const key = weekKey(date);
    daysByWeek.set(key, (daysByWeek.get(key) ?? new Set()).add(dayKey(date)));
  }
  const done = (key: string) => (daysByWeek.get(key)?.size ?? 0) >= Math.max(1, goal);

  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  cursor.setDate(cursor.getDate() - daysSinceMonday(cursor));
  const daysThisWeek = daysByWeek.get(dayKey(cursor))?.size ?? 0;
  let weeks = 0;
  if (done(dayKey(cursor))) weeks += 1;
  for (;;) {
    cursor.setDate(cursor.getDate() - 7);
    if (!done(dayKey(cursor))) break;
    weeks += 1;
  }
  return { weeks, daysThisWeek };
}

export function totalStats(sessions: WorkoutSession[], weeklyGoal: number): TotalStats {
  let sets = 0;
  let volume = 0;
  for (const session of sessions) {
    sets += session.sets.length;
    volume += sessionVolume(session);
  }
  const { weeks, daysThisWeek } = weeklyStreak(sessions, weeklyGoal);
  return {
    sessions: sessions.filter(s => s.sets.length > 0).length,
    sets,
    volume,
    streak: weeks,
    daysThisWeek,
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

/**
 * Volumen listo para mostrar con su unidad: "840 kg" o, desde una tonelada,
 * "136,6 t" (antes salía "136,6k kg", que no se entendía).
 */
export function volumeParts(volume: number): { value: string; unit: 'kg' | 't' } {
  if (Math.round(volume) >= 1000) {
    return { value: (volume / 1000).toFixed(1).replace('.', ','), unit: 't' };
  }
  return { value: String(Math.round(volume)), unit: 'kg' };
}

/** "840 kg", "136,6 t". */
export function formatVolume(volume: number): string {
  const { value, unit } = volumeParts(volume);
  return `${value} ${unit}`;
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

/** "30 oct 2026 · 52 min": fecha del entreno y, si se sabe, lo que duró. */
export function formatSessionDate(session: WorkoutSession): string {
  const duration = sessionDuration(session);
  const date = formatFullDate(session.date);
  return duration ? `${date} · ${formatDuration(duration)}` : date;
}
