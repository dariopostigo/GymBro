import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPLIT_PRESETS } from '../data/splitPresets';
import { loadFavoriteExerciseIds, saveFavoriteExerciseIds } from './favoritesStorage';
import {
  loadActiveSplit,
  loadDayOverrides,
  loadSplits,
  saveActiveSplit,
  saveDayOverrides,
  saveSplits,
} from './routineStorage';
import { loadSessions, saveSessions } from './sessionStorage';
import { loadSettings, saveSettings, type Settings } from './settingsStorage';
import type { ActiveSplitState, DayOverrides, Split } from '../types/routine';
import type { WorkoutSession } from '../types/session';

/**
 * Copia de seguridad de todos los datos en un único JSON versionado.
 * Importar reemplaza lo que hay; antes se guarda lo actual para poder deshacerlo.
 */
export const BACKUP_VERSION = 1;
const PRE_IMPORT_KEY = 'gymbro:preImportBackup';

export interface BackupData {
  /**
   * Los splits propios y las rutinas predefinidas con algún día personalizado;
   * el resto de lo predefinido sale del código.
   */
  splits: Split[];
  activeSplit: ActiveSplitState | null;
  dayOverrides: DayOverrides;
  sessions: WorkoutSession[];
  favorites: number[];
  settings: Partial<Settings>;
}

export interface BackupFile {
  app: 'gymbro';
  version: number;
  exportedAt: string;
  data: BackupData;
}

export class BackupError extends Error {}

export async function createBackup(now = new Date()): Promise<BackupFile> {
  const presetIds = new Set(SPLIT_PRESETS.map(s => s.id));
  const [splits, activeSplit, dayOverrides, sessions, favorites, settings] = await Promise.all([
    loadSplits(),
    loadActiveSplit(),
    loadDayOverrides(),
    loadSessions(),
    loadFavoriteExerciseIds(),
    loadSettings(),
  ]);
  return {
    app: 'gymbro',
    version: BACKUP_VERSION,
    exportedAt: now.toISOString(),
    data: {
      splits: splits.filter(s => !presetIds.has(s.id) || s.days.some(d => d.customized)),
      activeSplit,
      dayOverrides,
      sessions,
      favorites,
      settings,
    },
  };
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Comprueba que el texto es una copia de GymBro que esta versión sabe leer. */
export function parseBackup(text: string): BackupFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupError('El archivo no es un JSON válido.');
  }
  if (!isObject(parsed) || parsed.app !== 'gymbro' || !isObject(parsed.data)) {
    throw new BackupError('El archivo no es una copia de seguridad de GymBro.');
  }
  if (typeof parsed.version !== 'number' || parsed.version > BACKUP_VERSION) {
    throw new BackupError('La copia es de una versión más nueva de GymBro. Actualiza la app.');
  }

  const { data } = parsed;
  const valid =
    Array.isArray(data.splits) &&
    data.splits.every(s => isObject(s) && typeof s.id === 'string' && Array.isArray(s.days)) &&
    Array.isArray(data.sessions) &&
    data.sessions.every(s => isObject(s) && typeof s.id === 'string' && Array.isArray(s.sets)) &&
    Array.isArray(data.favorites) &&
    data.favorites.every(id => typeof id === 'number') &&
    isObject(data.dayOverrides) &&
    (data.activeSplit === null ||
      (isObject(data.activeSplit) && typeof data.activeSplit.splitId === 'string')) &&
    (data.settings === undefined || isObject(data.settings));
  if (!valid) throw new BackupError('La copia de seguridad está incompleta o dañada.');

  return parsed as unknown as BackupFile;
}

/** Guarda la copia en AsyncStorage. Los ids se normalizan al cargar, como siempre. */
export async function restoreBackup({ data }: BackupFile): Promise<void> {
  const knownSplitIds = new Set([...SPLIT_PRESETS, ...data.splits].map(s => s.id));
  const activeSplit =
    data.activeSplit && knownSplitIds.has(data.activeSplit.splitId) ? data.activeSplit : null;
  await Promise.all([
    saveSplits(data.splits),
    saveActiveSplit(activeSplit),
    saveDayOverrides(data.dayOverrides),
    saveSessions(data.sessions),
    saveFavoriteExerciseIds(data.favorites),
    saveSettings({ ...(await loadSettings()), ...data.settings }),
  ]);
}

/** Reemplaza los datos por los de la copia, guardando antes los actuales. */
export async function importBackup(backup: BackupFile): Promise<void> {
  await AsyncStorage.setItem(PRE_IMPORT_KEY, JSON.stringify(await createBackup()));
  await restoreBackup(backup);
}

export async function hasPreImportBackup(): Promise<boolean> {
  return (await AsyncStorage.getItem(PRE_IMPORT_KEY)) !== null;
}

/** Vuelve a los datos que había antes de la última importación. */
export async function undoImport(): Promise<void> {
  const raw = await AsyncStorage.getItem(PRE_IMPORT_KEY);
  if (!raw) throw new BackupError('No hay ninguna importación que deshacer.');
  await restoreBackup(parseBackup(raw));
  await AsyncStorage.removeItem(PRE_IMPORT_KEY);
}

/** "12 entrenamientos · 2 splits propios · 5 favoritos" para confirmar antes de importar. */
export function describeBackup({ data }: BackupFile): string {
  const presetIds = new Set(SPLIT_PRESETS.map(s => s.id));
  const ownSplits = data.splits.filter(s => !presetIds.has(s.id)).length;
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  return [
    plural(data.sessions.length, 'entrenamiento', 'entrenamientos'),
    plural(ownSplits, 'split propio', 'splits propios'),
    plural(data.favorites.length, 'favorito', 'favoritos'),
  ].join(' · ');
}

export function backupFileName(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `gymbro-copia-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}
