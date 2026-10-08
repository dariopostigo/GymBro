import type { WorkoutSession } from '../types/session';

/**
 * Un entreno con series que lleva abierto más que esto se da por olvidado:
 * se pregunta si terminarlo antes de mezclar series de días distintos.
 */
export const STALE_SESSION_MS = 6 * 60 * 60 * 1000;

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const DAY_MS = 24 * 60 * 60 * 1000;

/** Entreno sin terminar del día que toca, con series y empezado hace horas. */
export function findStaleSession(
  sessions: WorkoutSession[],
  splitId: string,
  splitDayId: string,
  now: number,
): WorkoutSession | undefined {
  return sessions.find(
    s =>
      !s.completed &&
      s.splitId === splitId &&
      s.splitDayId === splitDayId &&
      s.sets.length > 0 &&
      now - Date.parse(s.date) > STALE_SESSION_MS,
  );
}

function startOfDay(time: number): number {
  const date = new Date(time);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** "de hoy", "de ayer", "del lunes" (última semana) o "del 28/9". */
export function describeSessionDay(isoDate: string, now: number): string {
  const date = new Date(isoDate);
  const daysAgo = Math.round((startOfDay(now) - startOfDay(date.getTime())) / DAY_MS);
  if (daysAgo <= 0) return 'de hoy';
  if (daysAgo === 1) return 'de ayer';
  if (daysAgo < 7) return `del ${WEEKDAYS[date.getDay()]}`;
  return `del ${date.getDate()}/${date.getMonth() + 1}`;
}
