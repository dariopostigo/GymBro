import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  BACKUP_VERSION,
  BackupError,
  backupFileName,
  createBackup,
  describeBackup,
  hasPreImportBackup,
  importBackup,
  parseBackup,
  undoImport,
  type BackupFile,
} from '../src/storage/backup';
import { SPLIT_PRESETS } from '../src/data/splitPresets';
import { loadSessions } from '../src/storage/sessionStorage';
import { loadSettings } from '../src/storage/settingsStorage';
import type { Split } from '../src/types/routine';
import type { WorkoutSession } from '../src/types/session';

const customSplit: Split = { id: 'mine', name: 'Mi split', type: 'custom', days: [] };

const workout = (id: string): WorkoutSession => ({
  id,
  date: '2026-10-01T10:00:00.000Z',
  splitId: 'mine',
  splitDayId: 'd1',
  dayName: 'Día 1',
  completed: true,
  sets: [
    { id: `${id}-1`, exerciseId: 1, positionInSession: 1, setNumber: 1, weight: 60, reps: 10 },
  ],
});

function backupWith(data: Partial<BackupFile['data']>): BackupFile {
  return {
    app: 'gymbro',
    version: BACKUP_VERSION,
    exportedAt: '2026-10-08T10:00:00.000Z',
    data: {
      splits: [customSplit],
      activeSplit: { splitId: 'mine', currentDayIndex: 2 },
      dayOverrides: {},
      sessions: [workout('w1')],
      favorites: [1, 2],
      settings: { restSeconds: 120 },
      ...data,
    },
  };
}

beforeEach(() => AsyncStorage.clear());

test('la copia lleva solo los splits propios y todo lo demás', async () => {
  await AsyncStorage.setItem('gymbro:splits', JSON.stringify([...SPLIT_PRESETS, customSplit]));
  await AsyncStorage.setItem('gymbro:sessions', JSON.stringify([workout('w1')]));
  await AsyncStorage.setItem('gymbro:favoriteExercises', JSON.stringify([7]));

  const backup = await createBackup(new Date('2026-10-08T10:00:00Z'));
  expect(backup.data.splits).toEqual([customSplit]);
  expect(backup.data.sessions).toHaveLength(1);
  expect(backup.data.favorites).toEqual([7]);
  // Lo exportado se puede volver a leer tal cual.
  expect(parseBackup(JSON.stringify(backup))).toEqual(backup);
});

test('importar reemplaza los datos y deshacer recupera los anteriores', async () => {
  await AsyncStorage.setItem('gymbro:sessions', JSON.stringify([workout('before')]));
  expect(await hasPreImportBackup()).toBe(false);

  await importBackup(backupWith({ sessions: [workout('w1'), workout('w2')] }));
  expect((await loadSessions()).map(s => s.id)).toEqual(['w1', 'w2']);
  expect((await loadSettings()).restSeconds).toBe(120);
  expect(await hasPreImportBackup()).toBe(true);

  await undoImport();
  expect((await loadSessions()).map(s => s.id)).toEqual(['before']);
  expect(await hasPreImportBackup()).toBe(false);
});

test('un split activo que no existe en la copia se descarta', async () => {
  await importBackup(backupWith({ activeSplit: { splitId: 'borrado', currentDayIndex: 0 } }));
  expect(await AsyncStorage.getItem('gymbro:activeSplit')).toBeNull();
});

describe('parseBackup rechaza', () => {
  const rejects = (text: string, message: RegExp) => {
    expect(() => parseBackup(text)).toThrow(BackupError);
    expect(() => parseBackup(text)).toThrow(message);
  };

  test('texto que no es JSON', () => rejects('no soy json', /JSON válido/));
  test('JSON de otra app', () => rejects('{"app":"otra","data":{}}', /no es una copia/));
  test('copias de una versión más nueva', () =>
    rejects(JSON.stringify({ ...backupWith({}), version: BACKUP_VERSION + 1 }), /más nueva/));
  test('copias dañadas', () =>
    rejects(JSON.stringify(backupWith({ sessions: 'nada' as never })), /dañada/));
});

test('resumen y nombre de archivo', () => {
  expect(describeBackup(backupWith({}))).toBe('1 entrenamiento · 1 split propio · 2 favoritos');
  expect(backupFileName(new Date(2026, 9, 8))).toBe('gymbro-copia-2026-10-08.json');
});
