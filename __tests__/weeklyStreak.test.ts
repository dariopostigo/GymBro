import type { WorkoutSession } from '../src/types/session';
import { totalStats, weeklyStreak } from '../src/utils/stats';

/** Entreno el día `day` de noviembre de 2026 a las 18:00 (el 2/11/2026 es lunes). */
function on(day: number, sets = 1): WorkoutSession {
  return {
    id: `s-${day}-${sets}`,
    date: new Date(2026, 10, day, 18).toISOString(),
    splitId: 'split',
    splitDayId: 'day',
    dayName: 'Empuje',
    completed: true,
    sets: Array.from({ length: sets }, (_, i) => ({
      id: `set-${i}`,
      exerciseId: 1,
      positionInSession: 1,
      setNumber: i + 1,
      weight: 50,
      reps: 10,
    })),
  };
}

// Miércoles 25/11/2026; semanas: 2-8, 9-15, 16-22 y 23-29.
const NOW = new Date(2026, 10, 25, 12);

test('cuenta las semanas seguidas con el objetivo cumplido', () => {
  const sessions = [on(3), on(5), on(7), on(10), on(12), on(14), on(17), on(19), on(21)];
  expect(weeklyStreak(sessions, 3, NOW)).toEqual({ weeks: 3, daysThisWeek: 0 });
});

test('la semana en curso suma si ya se ha cumplido y no corta la racha si aún no', () => {
  const past = [on(17), on(19), on(21)];
  expect(weeklyStreak([...past, on(23)], 3, NOW)).toEqual({ weeks: 1, daysThisWeek: 1 });
  expect(weeklyStreak([...past, on(23), on(24), on(25)], 3, NOW)).toEqual({ weeks: 2, daysThisWeek: 3 });
});

test('una semana sin llegar al objetivo corta la racha', () => {
  const sessions = [on(3), on(5), on(7), on(10), on(17), on(19), on(21)];
  expect(weeklyStreak(sessions, 3, NOW).weeks).toBe(1);
  expect(weeklyStreak(sessions, 1, NOW).weeks).toBe(3);
});

test('dos entrenos el mismo día cuentan como un día; los vacíos no cuentan', () => {
  const sessions = [on(17), on(17, 2), on(19), on(21, 0)];
  expect(weeklyStreak(sessions, 3, NOW).weeks).toBe(0);
  expect(weeklyStreak(sessions, 2, NOW).weeks).toBe(1);
});

test('sin entrenos, la racha es 0', () => {
  expect(weeklyStreak([], 3, NOW)).toEqual({ weeks: 0, daysThisWeek: 0 });
  expect(totalStats([], 3).streak).toBe(0);
});
