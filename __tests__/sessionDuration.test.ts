/**
 * @format
 */

import { formatDuration, sessionDuration } from '../src/utils/stats';
import type { SetEntry, WorkoutSession } from '../src/types/session';

const START = Date.parse('2026-10-30T18:00:00.000Z');
const MIN = 60_000;

function session(minutes: (number | undefined)[]): WorkoutSession {
  const sets: SetEntry[] = minutes.map((m, i) => ({
    id: `set-${i}`,
    exerciseId: 1,
    positionInSession: 1,
    setNumber: i + 1,
    weight: 50,
    reps: 10,
    ...(m !== undefined && { loggedAt: new Date(START + m * MIN).toISOString() }),
  }));
  return {
    id: 's',
    date: new Date(START).toISOString(),
    splitId: 'split',
    splitDayId: 'day',
    dayName: 'Empuje',
    completed: true,
    sets,
  };
}

test('dura de la primera a la última serie apuntada', () => {
  expect(sessionDuration(session([0, 20, 52]))).toBe(52 * MIN);
});

test('las series sin hora (de antes) no dan duración', () => {
  expect(sessionDuration(session([undefined, undefined]))).toBeNull();
});

test('una sola serie o un entreno olvidado abierto no dan duración', () => {
  expect(sessionDuration(session([0]))).toBeNull();
  expect(sessionDuration(session([0, 7 * 60]))).toBeNull();
});

test('formato en minutos y en horas', () => {
  expect(formatDuration(45 * MIN)).toBe('45 min');
  expect(formatDuration(65 * MIN)).toBe('1 h 05 min');
});
