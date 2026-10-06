import type { SetEntry, WorkoutSession } from '../src/types/session';
import { formatWeight, lastSessionSets, suggestNextLoad } from '../src/utils/progression';

const TARGET = { sets: 3, repsMin: 8, repsMax: 12 };

function sets(weight: number, reps: number[]) {
  return reps.map(r => ({ weight, reps: r }));
}

function session(id: string, date: string, entries: Partial<SetEntry>[]): WorkoutSession {
  return {
    id,
    date,
    splitId: 's',
    splitDayId: 'd',
    dayName: 'Día',
    completed: true,
    sets: entries.map((entry, i) => ({
      id: `${id}-${i}`,
      exerciseId: 1,
      positionInSession: 1,
      setNumber: i + 1,
      weight: 60,
      reps: 10,
      ...entry,
    })),
  };
}

describe('suggestNextLoad', () => {
  test('sube peso si todas las series llegaron al máximo de reps', () => {
    expect(suggestNextLoad(sets(60, [12, 12, 12]), TARGET, 2.5)).toEqual({
      weight: 62.5,
      reps: 8,
      increase: true,
      previous: { weight: 60, reps: [12, 12, 12] },
    });
  });

  test('mantiene el peso y propone las mejores reps si alguna serie se quedó corta', () => {
    expect(suggestNextLoad(sets(60, [12, 11, 9]), TARGET, 2.5)).toMatchObject({
      weight: 60,
      reps: 12,
      increase: false,
    });
  });

  test('no sube si se hicieron menos series de las objetivo', () => {
    expect(suggestNextLoad(sets(60, [12, 12]), TARGET, 2.5)?.increase).toBe(false);
  });

  test('solo cuentan las series con el peso de trabajo (el más alto)', () => {
    const mixed = [...sets(40, [12]), ...sets(60, [12, 12, 12])];
    expect(suggestNextLoad(mixed, TARGET, 2.5)).toMatchObject({
      weight: 62.5,
      previous: { weight: 60, reps: [12, 12, 12] },
    });
  });

  test('redondea sin arrastrar decimales y sin historial no sugiere nada', () => {
    expect(suggestNextLoad(sets(10.1, [12, 12, 12]), TARGET, 1.25)?.weight).toBe(11.35);
    expect(suggestNextLoad([], TARGET, 2.5)).toBeUndefined();
  });
});

describe('lastSessionSets', () => {
  const old = session('old', '2026-10-01T10:00:00Z', [{ reps: 8 }]);
  const recent = session('recent', '2026-10-03T10:00:00Z', [{ reps: 12 }, { reps: 11 }]);
  const today = { ...session('today', '2026-10-06T10:00:00Z', [{ reps: 5 }]), completed: false };

  test('toma la sesión más reciente sin contar la de hoy', () => {
    const result = lastSessionSets([old, today, recent], 1, { positionInSession: 1 }, 'today');
    expect(result.map(s => s.reps)).toEqual([12, 11]);
  });

  test('prefiere la posición en el grupo muscular y si no hay usa la de la sesión', () => {
    const grouped = session('grouped', '2026-10-02T10:00:00Z', [
      { positionInSession: 4, positionInMuscleGroup: 2, reps: 9 },
    ]);
    const all = [old, recent, grouped];
    expect(
      lastSessionSets(all, 1, { positionInSession: 1, positionInMuscleGroup: 2 }).map(s => s.reps),
    ).toEqual([9]);
    expect(
      lastSessionSets(all, 1, { positionInSession: 1, positionInMuscleGroup: 3 }).map(s => s.reps),
    ).toEqual([12, 11]);
  });
});

test('los pesos se muestran con coma decimal', () => {
  expect(formatWeight(62.5)).toBe('62,5');
  expect(formatWeight(60)).toBe('60');
});
