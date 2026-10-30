/**
 * @format
 */

import { monthCalendar } from '../src/utils/calendar';
import type { WorkoutSession } from '../src/types/session';

function sessionOn(date: Date, id: string, sets = 1): WorkoutSession {
  return {
    id,
    date: date.toISOString(),
    splitId: 'split',
    splitDayId: 'day',
    dayName: 'Empuje',
    completed: true,
    sets: Array.from({ length: sets }, (_, i) => ({
      id: `${id}-${i}`,
      exerciseId: 1,
      positionInSession: 1,
      setNumber: i + 1,
      weight: 50,
      reps: 10,
    })),
  };
}

// Octubre de 2026 empieza en jueves y tiene 31 días.
const NOW = new Date(2026, 9, 30, 12);

test('el mes empieza en su día de la semana y las semanas van de lunes a domingo', () => {
  const { title, weeks } = monthCalendar([], 2026, 9, NOW);
  expect(title).toBe('Octubre 2026');
  expect(weeks[0].slice(0, 3)).toEqual([null, null, null]);
  expect(weeks[0][3]?.day).toBe(1);
  expect(weeks.every(week => week.length === 7)).toBe(true);
  expect(weeks.flat().filter(Boolean)).toHaveLength(31);
});

test('cada día lleva sus entrenos; los vacíos y los de otro mes no cuentan', () => {
  const sessions = [
    sessionOn(new Date(2026, 9, 7, 18), 'a'),
    sessionOn(new Date(2026, 9, 7, 20), 'b'),
    sessionOn(new Date(2026, 9, 9, 18), 'vacio', 0),
    sessionOn(new Date(2026, 8, 30, 18), 'septiembre'),
  ];
  const { weeks, workouts } = monthCalendar(sessions, 2026, 9, NOW);
  const days = weeks.flat();
  expect(days.find(d => d?.day === 7)?.sessions.map(s => s.id)).toEqual(['a', 'b']);
  expect(days.find(d => d?.day === 9)?.sessions).toEqual([]);
  expect(workouts).toBe(2);
});

test('hoy queda marcado y la media por semana solo cuenta los días ya pasados', () => {
  const sessions = [7, 14, 21, 28].map(day => sessionOn(new Date(2026, 9, day, 18), `s${day}`));
  const { weeks, perWeek } = monthCalendar(sessions, 2026, 9, NOW);
  const days = weeks.flat();
  expect(days.find(d => d?.isToday)?.day).toBe(30);
  expect(days.find(d => d?.day === 31)?.isFuture).toBe(true);
  expect(perWeek).toBeCloseTo(4 / (30 / 7));
});
