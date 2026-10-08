import type { WorkoutSession } from '../src/types/session';
import { describeSessionDay, findStaleSession } from '../src/utils/staleSession';

// Miércoles 7 de octubre de 2026, 18:00 (hora local).
const NOW = new Date(2026, 9, 7, 18, 0).getTime();
const HOUR = 60 * 60 * 1000;

function session(overrides: Partial<WorkoutSession>): WorkoutSession {
  return {
    id: 'a',
    date: new Date(NOW - 48 * HOUR).toISOString(),
    splitId: 'split',
    splitDayId: 'legs',
    dayName: 'Pierna',
    completed: false,
    sets: [{ id: 's', exerciseId: 1, positionInSession: 1, setNumber: 1, weight: 60, reps: 10 }],
    ...overrides,
  };
}

describe('findStaleSession', () => {
  test('encuentra el entreno sin terminar del día que toca empezado hace horas', () => {
    expect(findStaleSession([session({})], 'split', 'legs', NOW)?.id).toBe('a');
  });

  test('ignora el entreno en curso, los terminados, los vacíos y los de otro día', () => {
    const cases = [
      session({ date: new Date(NOW - HOUR).toISOString() }),
      session({ completed: true }),
      session({ sets: [] }),
      session({ splitDayId: 'push' }),
    ];
    for (const s of cases) expect(findStaleSession([s], 'split', 'legs', NOW)).toBeUndefined();
  });
});

test('describe el día del entreno de forma natural', () => {
  const daysAgo = (n: number) => new Date(2026, 9, 7 - n, 19, 0).toISOString();
  expect(describeSessionDay(daysAgo(0), NOW)).toBe('de hoy');
  expect(describeSessionDay(daysAgo(1), NOW)).toBe('de ayer');
  expect(describeSessionDay(daysAgo(2), NOW)).toBe('del lunes');
  expect(describeSessionDay(daysAgo(9), NOW)).toBe('del 28/9');
});
