import { open, type DB, type Transaction } from '@op-engineering/op-sqlite';
import { importLegacyData } from './legacyImport';

/**
 * Base de datos SQLite de GymBro (op-sqlite, en el propio móvil), como las de
 * CestaBro y NutriBro.
 *
 * Esquema versionado con PRAGMA user_version: cada entrada de MIGRATIONS
 * lleva la base de la versión i a la i+1. Para cambiar el esquema se añade
 * una entrada nueva al final; nunca se editan las anteriores.
 *
 * Las listas se guardan con su `position` para devolverlas en el mismo orden.
 * Lo que no encaja en las columnas va en `extra` (JSON), ver `rows.ts`.
 */
const DB_NAME = 'gymbro.sqlite';

export const MIGRATIONS: string[][] = [
  // v1 (GymBro 1.2.0): todo lo que había en AsyncStorage.
  [
    // Ajustes, descanso en marcha, split activo, cambios de hoy y marcas de migración (JSON).
    'CREATE TABLE kv (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL)',
    `CREATE TABLE sessions (
      id           TEXT PRIMARY KEY NOT NULL,
      position     INTEGER NOT NULL,
      date         TEXT,
      split_id     TEXT,
      split_day_id TEXT,
      day_name     TEXT,
      completed    INTEGER,
      extra        TEXT
    )`,
    'CREATE INDEX idx_sessions_position ON sessions (position)',
    `CREATE TABLE sets (
      session_id               TEXT NOT NULL REFERENCES sessions (id) ON DELETE CASCADE,
      position                 INTEGER NOT NULL,
      id                       TEXT,
      exercise_id              INTEGER,
      position_in_session      INTEGER,
      position_in_muscle_group INTEGER,
      set_number               INTEGER,
      weight                   REAL,
      reps                     REAL,
      rir                      REAL,
      per_side                 INTEGER,
      logged_at                TEXT,
      extra                    TEXT,
      PRIMARY KEY (session_id, position)
    )`,
    'CREATE INDEX idx_sets_exercise ON sets (exercise_id)',
    `CREATE TABLE splits (
      position INTEGER PRIMARY KEY NOT NULL,
      id       TEXT,
      name     TEXT,
      type     TEXT,
      extra    TEXT
    )`,
    `CREATE TABLE split_days (
      split_position INTEGER NOT NULL,
      position       INTEGER NOT NULL,
      id             TEXT,
      name           TEXT,
      day_order      INTEGER,
      customized     INTEGER,
      extra          TEXT,
      PRIMARY KEY (split_position, position)
    )`,
    `CREATE TABLE split_slots (
      split_position     INTEGER NOT NULL,
      day_position       INTEGER NOT NULL,
      position           INTEGER NOT NULL,
      id                 TEXT,
      exercise_id        INTEGER,
      slot_order         INTEGER,
      target_sets        INTEGER,
      target_reps_min    INTEGER,
      target_reps_max    INTEGER,
      rest_seconds       INTEGER,
      backup_exercise_id INTEGER,
      extra              TEXT,
      PRIMARY KEY (split_position, day_position, position)
    )`,
    `CREATE TABLE favorites (
      position    INTEGER PRIMARY KEY NOT NULL,
      exercise_id INTEGER,
      extra       TEXT
    )`,
    // Ejercicios creados en la app. Categoría, músculos, equipamiento y fotos van en JSON.
    `CREATE TABLE custom_exercises (
      position          INTEGER PRIMARY KEY NOT NULL,
      id                INTEGER,
      uuid              TEXT,
      name              TEXT,
      description       TEXT,
      category          TEXT,
      muscles_primary   TEXT,
      muscles_secondary TEXT,
      equipment         TEXT,
      images            TEXT,
      videos            TEXT,
      bodyweight        INTEGER,
      timed             INTEGER,
      unilateral        INTEGER,
      extra             TEXT
    )`,
    // Pesos de cada máquina: no_stack = 1 es "esta máquina no tiene pila".
    `CREATE TABLE weight_stacks (
      exercise_key TEXT PRIMARY KEY NOT NULL,
      position     INTEGER NOT NULL,
      no_stack     INTEGER NOT NULL,
      kind         TEXT,
      start        REAL,
      step         REAL,
      max          REAL,
      weights      TEXT,
      extra        TEXT
    )`,
    // Copias internas: los datos de antes de importar y lo que había en AsyncStorage.
    `CREATE TABLE snapshots (
      name       TEXT PRIMARY KEY NOT NULL,
      created_at TEXT NOT NULL,
      data       TEXT NOT NULL
    )`,
  ],
];

let ready: Promise<DB> | null = null;
let queue: Promise<unknown> = Promise.resolve();

/** Conexión abierta, con el esquema al día y los datos de AsyncStorage ya pasados. */
function getDb(): Promise<DB> {
  if (!ready) {
    ready = init().catch(error => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

async function init(): Promise<DB> {
  const db = open({ name: DB_NAME });
  await db.execute('PRAGMA foreign_keys = ON');
  await migrate(db);
  await importLegacyData(db);
  return db;
}

async function migrate(db: DB): Promise<void> {
  const { rows } = await db.execute('PRAGMA user_version');
  const current = Number(rows[0]?.user_version ?? 0);
  for (let version = current; version < MIGRATIONS.length; version++) {
    await db.transaction(async tx => {
      for (const statement of MIGRATIONS[version]) {
        await tx.execute(statement);
      }
      await tx.execute(`PRAGMA user_version = ${version + 1}`);
    });
  }
}

/**
 * Todas las lecturas y escrituras pasan por aquí, una detrás de otra y en el
 * orden en que se piden. Los contextos guardan sin esperar (`saveSessions(next)`)
 * y a veces varias veces seguidas: así el último guardado es siempre el que queda.
 *
 * Ojo: dentro de `fn` no se puede volver a llamar a `withDb` (se quedaría esperando).
 */
export function withDb<T>(fn: (db: DB) => Promise<T>): Promise<T> {
  const result = queue.then(getDb).then(fn);
  queue = result.catch(() => undefined);
  return result;
}

/** Una escritura entera o nada. */
export function inTransaction(fn: (tx: Transaction) => Promise<void>): Promise<void> {
  return withDb(db => db.transaction(fn));
}

/** Solo para los tests: la próxima operación abre una base nueva (en memoria). */
export function resetDbForTests(): void {
  ready = null;
  queue = Promise.resolve();
}
