/**
 * @format
 */

import { volumeByWeek } from '../src/utils/stats';
import type { WorkoutSession } from '../src/types/session';

function sessionOn(date: Date, weight: number, reps: number): WorkoutSession {
  return {
    id: `s-${date.getTime()}`,
    date: date.toISOString(),
    splitId: 'split',
    splitDayId: 'day',
    dayName: 'Empuje',
    completed: true,
    sets: [{ id: 'set-1', exerciseId: 1, positionInSession: 1, setNumber: 1, weight, reps }],
  };
}

test('la semana se muestra de lunes a domingo', () => {
  const week = volumeByWeek([]);
  expect(week.map(day => day.label)).toEqual(['L', 'M', 'X', 'J', 'V', 'S', 'D']);
});

test('el volumen cae en el día que le toca y hoy queda marcado', () => {
  const today = new Date();
  const week = volumeByWeek([sessionOn(today, 50, 10)]);

  const marked = week.filter(day => day.isToday);
  expect(marked).toHaveLength(1);
  expect(marked[0].volume).toBe(500);
  expect(marked[0].isFuture).toBe(false);

  const total = week.reduce((sum, day) => sum + day.volume, 0);
  expect(total).toBe(500);
});

test('los días posteriores a hoy quedan marcados como futuros', () => {
  const week = volumeByWeek([]);
  const todayIndex = week.findIndex(day => day.isToday);

  week.forEach((day, index) => {
    expect(day.isFuture).toBe(index > todayIndex);
  });
});
