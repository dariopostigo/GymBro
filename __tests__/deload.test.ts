/**
 * @format
 */

import { recentSessionSets, stallCount, suggestNextLoad } from '../src/utils/progression';
import type { WorkoutSession } from '../src/types/session';

const TARGET = { sets: 3, repsMin: 8, repsMax: 12 };
const sets = (weight: number, reps: number[]) => reps.map(r => ({ weight, reps: r }));

test('tres sesiones con el mismo peso sin mejorar proponen bajar un 10 %', () => {
  const [last, ...earlier] = [sets(80, [10, 9, 8]), sets(80, [10, 9, 8]), sets(80, [10, 9, 8])];
  expect(suggestNextLoad(last, TARGET, 2.5, undefined, false, earlier)).toMatchObject({
    weight: 72.5,
    reps: 12,
    increase: false,
    deload: { stalls: 3 },
  });
});

test('hacer más reps que antes con el mismo peso es progreso, aunque no llegue al tope', () => {
  const history = [sets(80, [11, 10, 9]), sets(80, [10, 9, 8]), sets(80, [10, 9, 8])];
  expect(stallCount(history, TARGET)).toBe(0);
  const [last, ...earlier] = history;
  expect(suggestNextLoad(last, TARGET, 2.5, undefined, false, earlier)?.deload).toBeUndefined();
});

test('solo cuentan las sesiones seguidas con el peso de ahora', () => {
  // Las dos de 77,5 kg son de antes de subir: no cuentan para el estancamiento de 80.
  const history = [sets(80, [9, 9, 8]), sets(80, [10, 9, 8]), sets(77.5, [10, 9, 8])];
  expect(stallCount(history, TARGET)).toBe(2);
});

test('con la pila de la máquina baja al peso que existe', () => {
  const stack = [40, 45, 50, 55, 60];
  const history = [sets(55, [9, 8, 8]), sets(55, [9, 8, 8]), sets(55, [9, 8, 8])];
  const [last, ...earlier] = history;
  // 90 % de 55 son 49,5: el de la pila más cercano es 50.
  expect(suggestNextLoad(last, TARGET, 2.5, stack, false, earlier)?.weight).toBe(50);
});

test('sin lastre (peso corporal) no hay descarga posible', () => {
  const history = [sets(0, [8, 7, 6]), sets(0, [8, 7, 6]), sets(0, [8, 7, 6])];
  const [last, ...earlier] = history;
  expect(suggestNextLoad(last, TARGET, 2.5, undefined, true, earlier)?.deload).toBeUndefined();
});

test('las sesiones anteriores salen de la más reciente a la más antigua y sin la de hoy', () => {
  const session = (id: string, day: number, reps: number): WorkoutSession => ({
    id,
    date: new Date(2026, 9, day, 18).toISOString(),
    splitId: 's',
    splitDayId: 'd',
    dayName: 'Día',
    completed: true,
    sets: [{ id: `${id}-0`, exerciseId: 1, positionInSession: 1, setNumber: 1, weight: 60, reps }],
  });
  const all = [
    session('a', 1, 8),
    session('c', 20, 10),
    session('b', 10, 9),
    session('hoy', 30, 11),
  ];
  const recent = recentSessionSets(all, 1, { positionInSession: 1 }, 'hoy');
  expect(recent.map(s => s[0].reps)).toEqual([10, 9, 8]);
});

test('con pesos pequeños no se propone una descarga desproporcionada', () => {
  // De 7,5 a 5 kg sería bajar un 33 %: mejor seguir con 7,5 y buscar más reps.
  const history = [sets(7.5, [10, 10, 7]), sets(7.5, [10, 10, 7]), sets(7.5, [10, 10, 7])];
  const [last, ...earlier] = history;
  const suggestion = suggestNextLoad(last, TARGET, 2.5, undefined, false, earlier);
  expect(suggestion?.weight).toBe(7.5);
  expect(suggestion?.deload).toBeUndefined();
});
