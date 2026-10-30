import type { WorkoutSession } from '../types/session';
import { dayKey } from './stats';

const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export interface CalendarDay {
  key: string;
  day: number;
  /** Entrenos con series de ese día, del primero al último. */
  sessions: WorkoutSession[];
  isToday: boolean;
  isFuture: boolean;
}

export interface MonthCalendar {
  /** "Octubre 2026". */
  title: string;
  /** Semanas de lunes a domingo; `null` son los huecos antes del día 1 y después del último. */
  weeks: (CalendarDay | null)[][];
  /** Entrenos con series en el mes. */
  workouts: number;
  /** Entrenos por semana en lo que va de mes (el mes entero si ya pasó). */
  perWeek: number;
}

/** Mes `month` (0-11) de `year` con los entrenos de cada día. */
export function monthCalendar(
  sessions: WorkoutSession[],
  year: number,
  month: number,
  now: Date,
): MonthCalendar {
  const byDay = new Map<string, WorkoutSession[]>();
  for (const session of [...sessions].sort((a, b) => a.date.localeCompare(b.date))) {
    if (!session.sets.length) continue;
    const key = dayKey(session.date);
    byDay.set(key, [...(byDay.get(key) ?? []), session]);
  }

  const today = dayKey(now);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Huecos hasta el día de la semana del 1 (la semana empieza en lunes).
  const cells: (CalendarDay | null)[] = Array((new Date(year, month, 1).getDay() + 6) % 7).fill(
    null,
  );

  let workouts = 0;
  let elapsedDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const key = dayKey(new Date(year, month, day));
    const daySessions = byDay.get(key) ?? [];
    const isFuture = key > today;
    workouts += daySessions.length;
    if (!isFuture) elapsedDays++;
    cells.push({ key, day, sessions: daySessions, isToday: key === today, isFuture });
  }
  while (cells.length % 7) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return {
    title: `${MONTHS[month]} ${year}`,
    weeks,
    workouts,
    perWeek: elapsedDays ? workouts / (elapsedDays / 7) : 0,
  };
}
