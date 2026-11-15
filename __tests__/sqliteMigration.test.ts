import AsyncStorage from '@react-native-async-storage/async-storage';
import { withDb } from '../src/storage/db';
import { hasPreImportBackup, undoImport, BACKUP_VERSION } from '../src/storage/backup';
import { loadCustomExercises } from '../src/storage/customExerciseStorage';
import { loadFavoriteExerciseIds } from '../src/storage/favoritesStorage';
import { LEGACY_KEYS, SNAPSHOT_ASYNC_STORAGE } from '../src/storage/legacyImport';
import {
  loadActiveSplit,
  loadDayOverrides,
  loadSplits,
  migrateToRecommendedSplit,
} from '../src/storage/routineStorage';
import * as rows from '../src/storage/rows';
import { readSnapshot, readSplits } from '../src/storage/rows';
import { loadSessions, saveSessions } from '../src/storage/sessionStorage';
import { loadRestTimer, loadSettings } from '../src/storage/settingsStorage';
import { loadWeightStacks } from '../src/storage/weightStackStorage';
import type { WorkoutSession } from '../src/types/session';

const session = (id: string, sets: number, patch: Partial<WorkoutSession> = {}): WorkoutSession => ({
  id,
  date: '2026-10-01T10:00:00.000Z',
  splitId: 'mine',
  splitDayId: 'd1',
  dayName: 'Día 1',
  completed: true,
  sets: Array.from({ length: sets }, (_, i) => ({
    id: `${id}-${i}`,
    exerciseId: 73,
    positionInSession: 1,
    positionInMuscleGroup: 1,
    setNumber: i + 1,
    weight: 60 + i * 2.5,
    reps: 10 - i,
    ...(i === 0 && { rir: 2 }),
    ...(i === 1 && { perSide: true }),
    loggedAt: `2026-10-01T10:0${i}:00.000Z`,
  })),
  ...patch,
});

const mySplit = {
  id: 'mine',
  name: 'Mi split',
  type: 'custom',
  days: [
    {
      id: 'd1',
      name: 'Día 1',
      order: 0,
      exercises: [
        {
          id: 's1',
          exerciseId: 73,
          order: 0,
          targetSets: 3,
          targetRepsMin: 8,
          targetRepsMax: 12,
          restSeconds: 90,
          backupExerciseId: 129,
        },
      ],
    },
  ],
};

const customExercise = {
  id: 100001,
  uuid: 'custom-100001',
  name: 'Plancha con disco',
  description: 'Con un disco en la espalda',
  category: { id: 10, name: 'Abdominales' },
  musclesPrimary: [{ id: 6, name: 'Abdominales' }],
  musclesSecondary: [],
  equipment: [],
  images: ['file:///documents/custom-exercises/1.jpg'],
  videos: [],
  timed: true,
};

/** Lo que tendría en el móvil alguien que usa la 1.1.0. */
const legacy: Record<string, unknown> = {
  [LEGACY_KEYS.sessions]: [session('a', 4), session('b', 3), session('c', 0, { completed: false })],
  [LEGACY_KEYS.splits]: [mySplit],
  [LEGACY_KEYS.activeSplit]: { splitId: 'mine', currentDayIndex: 0 },
  [LEGACY_KEYS.dayOverrides]: { 'mine:d1': { s1: { targetSets: 4, collapsed: true } } },
  [LEGACY_KEYS.favorites]: [73, 129],
  [LEGACY_KEYS.customExercises]: [customExercise],
  [LEGACY_KEYS.weightStacks]: {
    1725: { kind: 'steps', start: 5, step: 5, max: 100 },
    73: { kind: 'list', weights: [4.5, 9, 13.5] },
    129: null,
  },
  [LEGACY_KEYS.settings]: { restSeconds: 120, weightIncrement: 1.25 },
  [LEGACY_KEYS.restTimer]: { endsAt: 123, duration: 90 },
  [LEGACY_KEYS.pplMigration]: '1',
};

async function seed(values: Record<string, unknown>) {
  for (const [key, value] of Object.entries(values)) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }
}

beforeEach(() => AsyncStorage.clear());

test('pasa a SQLite todo lo que había en AsyncStorage, sin perder nada', async () => {
  await seed(legacy);

  expect(await loadSessions()).toEqual(legacy[LEGACY_KEYS.sessions]);
  expect(await withDb(readSplits)).toEqual([mySplit]);
  expect((await loadSplits()).find(s => s.id === 'mine')).toEqual(mySplit);
  expect(await loadActiveSplit()).toEqual({ splitId: 'mine', currentDayIndex: 0 });
  expect(await loadDayOverrides()).toEqual(legacy[LEGACY_KEYS.dayOverrides]);
  expect(await loadFavoriteExerciseIds()).toEqual([73, 129]);
  expect(await loadCustomExercises()).toEqual([customExercise]);
  expect(await loadWeightStacks()).toEqual(legacy[LEGACY_KEYS.weightStacks]);
  expect((await loadSettings()).restSeconds).toBe(120);
  expect((await loadSettings()).weightIncrement).toBe(1.25);
  expect(await loadRestTimer()).toEqual({ endsAt: 123, duration: 90 });
});

test('no borra AsyncStorage y guarda una copia literal de todas sus claves', async () => {
  await seed(legacy);
  await loadSessions();

  expect(await AsyncStorage.getItem(LEGACY_KEYS.sessions)).toBe(
    JSON.stringify(legacy[LEGACY_KEYS.sessions]),
  );
  const copy = JSON.parse((await withDb(db => readSnapshot(db, SNAPSHOT_ASYNC_STORAGE)))!);
  for (const [key, value] of Object.entries(legacy)) {
    expect(copy[key]).toBe(JSON.stringify(value));
  }
});

test('la migración del PPL ya hecha en AsyncStorage no vuelve a cambiar el split activo', async () => {
  await seed(legacy);
  await migrateToRecommendedSplit();
  expect(await loadActiveSplit()).toEqual({ splitId: 'mine', currentDayIndex: 0 });
});

test('solo migra una vez: lo de AsyncStorage después ya no cuenta', async () => {
  await seed(legacy);
  await loadSessions();
  await saveSessions([session('nueva', 1)]);
  await seed({ [LEGACY_KEYS.sessions]: [session('vieja', 1)] });
  expect((await loadSessions()).map(s => s.id)).toEqual(['nueva']);
});

test('conserva datos raros tal cual: nulos, tipos inesperados y campos desconocidos', async () => {
  const odd = [
    {
      ...session('raro', 2),
      completed: 1,
      notes: 'campo que no existe en el tipo',
      sets: [
        { ...session('x', 1).sets[0], weight: null, reps: '8', extraField: { a: [1, 2] } },
        { id: 'y', exerciseId: 73 },
      ],
    },
  ];
  await seed({ [LEGACY_KEYS.sessions]: odd });
  expect(await loadSessions()).toEqual(odd);
});

test('un JSON roto no bloquea la app y queda guardado en la copia literal', async () => {
  await AsyncStorage.setItem(LEGACY_KEYS.sessions, '[{"id": roto');
  await seed({ [LEGACY_KEYS.favorites]: [73] });

  expect(await loadSessions()).toEqual([]);
  expect(await loadFavoriteExerciseIds()).toEqual([73]);
  const copy = JSON.parse((await withDb(db => readSnapshot(db, SNAPSHOT_ASYNC_STORAGE)))!);
  expect(copy[LEGACY_KEYS.sessions]).toBe('[{"id": roto');
});

test('el "deshacer importación" de AsyncStorage sigue funcionando', async () => {
  const before = {
    app: 'gymbro',
    version: BACKUP_VERSION,
    exportedAt: '2026-10-08T10:00:00.000Z',
    data: {
      splits: [],
      activeSplit: null,
      dayOverrides: {},
      sessions: [session('antes', 1)],
      favorites: [],
      settings: {},
    },
  };
  await seed({ [LEGACY_KEYS.sessions]: [session('importada', 1)], [LEGACY_KEYS.preImport]: before });

  expect(await hasPreImportBackup()).toBe(true);
  await undoImport();
  expect((await loadSessions()).map(s => s.id)).toEqual(['antes']);
});

test('si lo releído no coincide, deshace todo y lo reintenta en el siguiente arranque', async () => {
  await seed(legacy);
  const spy = jest.spyOn(rows, 'readSessions').mockResolvedValueOnce([]);

  await expect(loadSessions()).rejects.toThrow(/siguen a salvo/);
  spy.mockRestore();
  // La marca de migración no quedó puesta: en el siguiente arranque se reintenta y entra todo.
  expect(await loadFavoriteExerciseIds()).toEqual([73, 129]);
  expect(await loadSessions()).toEqual(legacy[LEGACY_KEYS.sessions]);
});

describe('guardar entrenamientos', () => {
  test('solo cambia lo que cambia: editar, borrar, añadir y reordenar', async () => {
    const [a, b, c] = [session('a', 3), session('b', 2), session('c', 1)];
    await saveSessions([a, b, c]);
    expect(await loadSessions()).toEqual([a, b, c]);

    const b2 = { ...b, sets: [...b.sets.slice(1), { ...b.sets[0], weight: 99 }] };
    const d = session('d', 2);
    await saveSessions([c, b2, d]);
    expect(await loadSessions()).toEqual([c, b2, d]);
  });

  test('varios guardados seguidos sin esperar: se queda el último', async () => {
    const saves = [1, 2, 3, 4].map(n => saveSessions([session('a', n)]));
    await Promise.all(saves);
    expect((await loadSessions())[0].sets).toHaveLength(4);
  });
});
