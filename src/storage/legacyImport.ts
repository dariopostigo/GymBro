import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DB } from '@op-engineering/op-sqlite';
import {
  readCustomExercises,
  readFavorites,
  readKv,
  readSessions,
  readSplits,
  readWeightStacks,
  stableStringify,
  writeAllSessions,
  writeCustomExercises,
  writeFavorites,
  writeKv,
  writeSnapshot,
  writeSplits,
  writeWeightStacks,
  type Executor,
} from './rows';

/**
 * Hasta la 1.1.0 GymBro guardaba todo como JSON en AsyncStorage. La primera vez
 * que se abre la base se pasa todo a SQLite, con estas garantías:
 *
 * - Todo va en una sola transacción: o se pasa entero o no se pasa nada.
 * - Antes de confirmar se relee lo escrito y se compara con lo de AsyncStorage;
 *   si algo no coincide se deshace y se lanza un error (y se vuelve a intentar
 *   en el siguiente arranque).
 * - Se guarda una copia literal de todas las claves de AsyncStorage en
 *   `snapshots` ('asyncStorage') por si hiciera falta recuperar algo a mano.
 * - AsyncStorage NO se borra. Una versión futura podrá limpiarlo cuando esté
 *   claro que la migración ha ido bien en el móvil.
 */
export const LEGACY_KEYS = {
  sessions: 'gymbro:sessions',
  splits: 'gymbro:splits',
  activeSplit: 'gymbro:activeSplit',
  dayOverrides: 'gymbro:dayOverrides',
  favorites: 'gymbro:favoriteExercises',
  customExercises: 'gymbro:customExercises',
  weightStacks: 'gymbro:weightStacks',
  settings: 'gymbro:settings',
  restTimer: 'gymbro:restTimer',
  pplMigration: 'gymbro:migration:pplHypertrophyActive',
  preImport: 'gymbro:preImportBackup',
} as const;

/** Claves de `kv` en SQLite. Se copian tal cual desde AsyncStorage (mismo JSON). */
export const KV = {
  activeSplit: 'activeSplit',
  dayOverrides: 'dayOverrides',
  settings: 'settings',
  restTimer: 'restTimer',
  pplMigration: 'migration:pplHypertrophyActive',
  asyncStorageImported: 'migration:asyncStorageImported',
} as const;

export const SNAPSHOT_PRE_IMPORT = 'preImport';
export const SNAPSHOT_ASYNC_STORAGE = 'asyncStorage';

export class LegacyImportError extends Error {}

/** El JSON si se puede leer; `undefined` si no hay nada o está roto (queda en la copia literal). */
function parse(raw: string | null | undefined): unknown {
  if (raw === null || raw === undefined) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export async function importLegacyData(db: DB): Promise<void> {
  if ((await readKv(db, KV.asyncStorageImported)) !== null) return;

  const keys = await AsyncStorage.getAllKeys();
  const all = keys.length ? await AsyncStorage.getMany(keys) : {};
  const raw = (key: string) => all[key] ?? null;

  const sessions = parse(raw(LEGACY_KEYS.sessions));
  const splits = parse(raw(LEGACY_KEYS.splits));
  const favorites = parse(raw(LEGACY_KEYS.favorites));
  const customExercises = parse(raw(LEGACY_KEYS.customExercises));
  const weightStacks = parse(raw(LEGACY_KEYS.weightStacks));

  await db.transaction(async tx => {
    if (keys.length) {
      await writeSnapshot(tx, SNAPSHOT_ASYNC_STORAGE, JSON.stringify(all));
    }
    // Lo que la app ya lee como JSON suelto se copia sin tocarlo.
    const copies: Array<[string, string]> = [
      [KV.activeSplit, LEGACY_KEYS.activeSplit],
      [KV.dayOverrides, LEGACY_KEYS.dayOverrides],
      [KV.settings, LEGACY_KEYS.settings],
      [KV.restTimer, LEGACY_KEYS.restTimer],
      [KV.pplMigration, LEGACY_KEYS.pplMigration],
    ];
    for (const [kvKey, legacyKey] of copies) {
      await writeKv(tx, kvKey, raw(legacyKey));
    }
    await writeSnapshot(tx, SNAPSHOT_PRE_IMPORT, raw(LEGACY_KEYS.preImport));

    if (Array.isArray(sessions)) await writeAllSessions(tx, sessions);
    if (Array.isArray(splits)) await writeSplits(tx, splits);
    if (Array.isArray(favorites)) await writeFavorites(tx, favorites);
    if (Array.isArray(customExercises)) await writeCustomExercises(tx, customExercises);
    if (isObject(weightStacks)) await writeWeightStacks(tx, weightStacks as never);

    await verify(tx, [
      ['entrenamientos', Array.isArray(sessions) ? sessions : [], readSessions],
      ['rutinas', Array.isArray(splits) ? splits : [], readSplits],
      ['favoritos', Array.isArray(favorites) ? favorites : [], readFavorites],
      [
        'ejercicios propios',
        Array.isArray(customExercises) ? customExercises : [],
        readCustomExercises,
      ],
      ['pesos de máquinas', isObject(weightStacks) ? weightStacks : {}, readWeightStacks],
    ]);

    await writeKv(tx, KV.asyncStorageImported, new Date().toISOString());
  });
}

/** Relee lo escrito y lo compara con lo original; si algo no cuadra, se deshace todo. */
async function verify(
  tx: Executor,
  checks: Array<[string, unknown, (ex: Executor) => Promise<unknown>]>,
): Promise<void> {
  for (const [label, expected, read] of checks) {
    const actual = await read(tx);
    if (stableStringify(actual) !== stableStringify(expected)) {
      throw new LegacyImportError(
        `No se pudieron pasar los ${label} a la base de datos. Los datos siguen a salvo en el formato anterior.`,
      );
    }
  }
}
