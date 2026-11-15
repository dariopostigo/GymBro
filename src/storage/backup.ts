import { SPLIT_PRESETS } from '../data/splitPresets';
import { loadCustomExercises } from './customExerciseStorage';
import { loadFavoriteExerciseIds } from './favoritesStorage';
import { withDb } from './db';
import { KV, SNAPSHOT_PRE_IMPORT } from './legacyImport';
import {
  loadActiveSplit,
  loadDayOverrides,
  loadSplits,
  writeActiveSplit,
  writeDayOverrides,
} from './routineStorage';
import {
  readKv,
  readSnapshot,
  writeAllSessions,
  writeCustomExercises,
  writeFavorites,
  writeKv,
  writeSnapshot,
  writeSplits,
  writeWeightStacks,
  type Executor,
} from './rows';
import { forgetStoredSessions, loadSessions } from './sessionStorage';
import { DEFAULT_SETTINGS, loadSettings, type Settings } from './settingsStorage';
import { loadWeightStacks, type WeightStacks } from './weightStackStorage';
import type { CustomExercise } from '../types/exercise';
import type { ActiveSplitState, DayOverrides, Split } from '../types/routine';
import type { WorkoutSession } from '../types/session';

/**
 * Copia de seguridad de todos los datos en un único JSON versionado.
 * Importar reemplaza lo que hay; antes se guarda lo actual para poder deshacerlo.
 */
export const BACKUP_VERSION = 1;

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
  /** Pesos de cada máquina. Las copias antiguas no lo traen. */
  weightStacks?: WeightStacks;
  /**
   * Ejercicios creados en la app, sin las fotos (son archivos aparte): en el
   * mismo móvil siguen ahí; en otro, quedan sin foto. Las copias antiguas no lo traen.
   */
  customExercises?: CustomExercise[];
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
  const [
    splits,
    activeSplit,
    dayOverrides,
    sessions,
    favorites,
    settings,
    weightStacks,
    customExercises,
  ] = await Promise.all([
    loadSplits(),
    loadActiveSplit(),
    loadDayOverrides(),
    loadSessions(),
    loadFavoriteExerciseIds(),
    loadSettings(),
    loadWeightStacks(),
    loadCustomExercises(),
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
      weightStacks,
      customExercises,
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
    (data.settings === undefined || isObject(data.settings)) &&
    (data.weightStacks === undefined || isObject(data.weightStacks)) &&
    (data.customExercises === undefined ||
      (Array.isArray(data.customExercises) &&
        data.customExercises.every(
          e => isObject(e) && typeof e.id === 'number' && typeof e.name === 'string',
        )));
  if (!valid) throw new BackupError('La copia de seguridad está incompleta o dañada.');

  return parsed as unknown as BackupFile;
}

/** Escribe los datos de la copia dentro de una transacción. Los ids se normalizan al cargar. */
async function writeBackupData(tx: Executor, data: BackupData): Promise<void> {
  const knownSplitIds = new Set([...SPLIT_PRESETS, ...data.splits].map(s => s.id));
  const activeSplit =
    data.activeSplit && knownSplitIds.has(data.activeSplit.splitId) ? data.activeSplit : null;
  const currentSettings = await readKv(tx, KV.settings);
  const settings: Settings = {
    ...DEFAULT_SETTINGS,
    ...(currentSettings ? (JSON.parse(currentSettings) as Partial<Settings>) : {}),
    ...data.settings,
  };
  await writeSplits(tx, data.splits);
  await writeActiveSplit(tx, activeSplit);
  await writeDayOverrides(tx, data.dayOverrides);
  await writeAllSessions(tx, data.sessions);
  await writeFavorites(tx, data.favorites);
  await writeKv(tx, KV.settings, JSON.stringify(settings));
  // Una copia antigua sin pesos de máquinas no borra los que ya hay.
  if (data.weightStacks) await writeWeightStacks(tx, data.weightStacks);
  // Igual con los ejercicios propios: una copia de antes de tenerlos no los borra.
  if (data.customExercises) await writeCustomExercises(tx, data.customExercises);
}

/**
 * Escribe todo en una sola transacción: o se aplica entera o no se toca nada.
 * `before` corre dentro de la misma transacción (p. ej. guardar lo de antes).
 */
function writeAll(data: BackupData, before?: (tx: Executor) => Promise<void>): Promise<void> {
  return withDb(async db => {
    forgetStoredSessions();
    await db.transaction(async tx => {
      await before?.(tx);
      await writeBackupData(tx, data);
    });
  });
}

/** Reemplaza los datos por los de la copia. */
export function restoreBackup({ data }: BackupFile): Promise<void> {
  return writeAll(data);
}

/** Reemplaza los datos por los de la copia, guardando antes los actuales. */
export async function importBackup(backup: BackupFile): Promise<void> {
  const current = JSON.stringify(await createBackup());
  await writeAll(backup.data, tx => writeSnapshot(tx, SNAPSHOT_PRE_IMPORT, current));
}

export async function hasPreImportBackup(): Promise<boolean> {
  return (await withDb(db => readSnapshot(db, SNAPSHOT_PRE_IMPORT))) !== null;
}

/** Vuelve a los datos que había antes de la última importación. */
export async function undoImport(): Promise<void> {
  const raw = await withDb(db => readSnapshot(db, SNAPSHOT_PRE_IMPORT));
  if (!raw) throw new BackupError('No hay ninguna importación que deshacer.');
  await writeAll(parseBackup(raw).data, tx => writeSnapshot(tx, SNAPSHOT_PRE_IMPORT, null));
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
