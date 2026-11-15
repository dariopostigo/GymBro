import type { Scalar } from '@op-engineering/op-sqlite';
import type { CustomExercise } from '../types/exercise';
import type { Split } from '../types/routine';
import type { WorkoutSession } from '../types/session';
import type { WeightStack } from '../utils/weightStack';

/**
 * Paso de los objetos de la app a filas de SQLite y vuelta, sin depender de la
 * conexión (vale la DB o una transacción).
 *
 * Cada campo conocido va en su columna. Lo que no encaja (un campo que no está
 * en la lista o un valor de otro tipo, p. ej. un `null` donde se espera un
 * número) va en la columna `extra` como JSON. Así leer lo escrito devuelve
 * siempre el mismo objeto: no se pierde nada aunque los datos sean raros.
 */
export interface Executor {
  execute: (query: string, params?: Scalar[]) => Promise<{ rows: Array<Record<string, Scalar>> }>;
}

type Row = Record<string, Scalar>;
type Kind = 'text' | 'number' | 'bool' | 'json';
/** [campo del objeto, columna, tipo] */
type Field = readonly [string, string, Kind];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** El valor como columna, o `undefined` si no es del tipo esperado (va a `extra`). */
function encode(value: unknown, kind: Kind): Scalar | undefined {
  switch (kind) {
    case 'text':
      return typeof value === 'string' ? value : undefined;
    case 'number':
      return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
    case 'bool':
      return typeof value === 'boolean' ? (value ? 1 : 0) : undefined;
    case 'json':
      return value === undefined ? undefined : JSON.stringify(value);
  }
}

/** Valores de las columnas (en el orden de `fields`) y el JSON de `extra`. */
function toRow(
  object: Record<string, unknown>,
  fields: readonly Field[],
  nested: readonly string[] = [],
): Scalar[] {
  const known = new Set([...fields.map(([key]) => key), ...nested]);
  const extra: Record<string, unknown> = {};
  const values = fields.map(([key, , kind]) => {
    if (!(key in object)) return null;
    const encoded = encode(object[key], kind);
    if (encoded === undefined) {
      extra[key] = object[key];
      return null;
    }
    return encoded;
  });
  for (const [key, value] of Object.entries(object)) {
    if (!known.has(key)) extra[key] = value;
  }
  const extraJson = JSON.stringify(extra);
  return [...values, extraJson === '{}' ? null : extraJson];
}

function fromRow(row: Row, fields: readonly Field[]): Record<string, unknown> {
  const object: Record<string, unknown> = {};
  for (const [key, column, kind] of fields) {
    const value = row[column];
    if (value === null || value === undefined) continue;
    object[key] =
      kind === 'bool' ? value !== 0 : kind === 'json' ? JSON.parse(String(value)) : value;
  }
  if (row.extra !== null && row.extra !== undefined) {
    Object.assign(object, JSON.parse(String(row.extra)));
  }
  return object;
}

const columns = (fields: readonly Field[]) => fields.map(([, column]) => column);
const placeholders = (n: number) => Array(n).fill('?').join(', ');

/** Un campo anidado solo se trata aparte si es una lista; si no, va a `extra` tal cual. */
const listOf = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const nestedIfList = (object: Record<string, unknown>, key: string) =>
  Array.isArray(object[key]) ? [key] : [];

/** JSON con las claves ordenadas: sirve para comparar objetos sin que importe el orden. */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (isObject(value)) {
    const entries = Object.keys(value)
      .filter(key => value[key] !== undefined)
      .sort()
      .map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

// ── Clave-valor (ajustes, split activo, cambios de hoy, marcas de migración) ──

export async function readKv(ex: Executor, key: string): Promise<string | null> {
  const { rows } = await ex.execute('SELECT value FROM kv WHERE key = ?', [key]);
  return rows.length ? String(rows[0].value) : null;
}

export async function writeKv(ex: Executor, key: string, value: string | null): Promise<void> {
  if (value === null) {
    await ex.execute('DELETE FROM kv WHERE key = ?', [key]);
    return;
  }
  await ex.execute('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)', [key, value]);
}

// ── Copias internas (los datos de antes de importar, lo que había en AsyncStorage) ──

export async function readSnapshot(ex: Executor, name: string): Promise<string | null> {
  const { rows } = await ex.execute('SELECT data FROM snapshots WHERE name = ?', [name]);
  return rows.length ? String(rows[0].data) : null;
}

export async function writeSnapshot(ex: Executor, name: string, data: string | null) {
  if (data === null) {
    await ex.execute('DELETE FROM snapshots WHERE name = ?', [name]);
    return;
  }
  await ex.execute('INSERT OR REPLACE INTO snapshots (name, created_at, data) VALUES (?, ?, ?)', [
    name,
    new Date().toISOString(),
    data,
  ]);
}

// ── Entrenamientos y series ──

const SESSION_FIELDS: readonly Field[] = [
  ['id', 'id', 'text'],
  ['date', 'date', 'text'],
  ['splitId', 'split_id', 'text'],
  ['splitDayId', 'split_day_id', 'text'],
  ['dayName', 'day_name', 'text'],
  ['completed', 'completed', 'bool'],
];

const SET_FIELDS: readonly Field[] = [
  ['id', 'id', 'text'],
  ['exerciseId', 'exercise_id', 'number'],
  ['positionInSession', 'position_in_session', 'number'],
  ['positionInMuscleGroup', 'position_in_muscle_group', 'number'],
  ['setNumber', 'set_number', 'number'],
  ['weight', 'weight', 'number'],
  ['reps', 'reps', 'number'],
  ['rir', 'rir', 'number'],
  ['perSide', 'per_side', 'bool'],
  ['loggedAt', 'logged_at', 'text'],
];

const INSERT_SESSION = `INSERT OR REPLACE INTO sessions (position, ${columns(SESSION_FIELDS)}, extra)
  VALUES (${placeholders(SESSION_FIELDS.length + 2)})`;
const INSERT_SET = `INSERT INTO sets (session_id, position, ${columns(SET_FIELDS)}, extra)
  VALUES (${placeholders(SET_FIELDS.length + 3)})`;

/** Escribe una sesión con sus series (borrando antes las que tuviera). */
export async function writeSession(ex: Executor, session: WorkoutSession, position: number) {
  const object = session as unknown as Record<string, unknown>;
  await ex.execute('DELETE FROM sets WHERE session_id = ?', [session.id]);
  await ex.execute(INSERT_SESSION, [
    position,
    ...toRow(object, SESSION_FIELDS, nestedIfList(object, 'sets')),
  ]);
  for (const [index, set] of listOf(object.sets).entries()) {
    await ex.execute(INSERT_SET, [
      session.id,
      index,
      ...toRow(isObject(set) ? set : { value: set }, SET_FIELDS),
    ]);
  }
}

export async function deleteSession(ex: Executor, id: string): Promise<void> {
  await ex.execute('DELETE FROM sets WHERE session_id = ?', [id]);
  await ex.execute('DELETE FROM sessions WHERE id = ?', [id]);
}

export async function writeAllSessions(ex: Executor, sessions: WorkoutSession[]) {
  await ex.execute('DELETE FROM sets');
  await ex.execute('DELETE FROM sessions');
  for (const [position, session] of sessions.entries()) {
    await writeSession(ex, session, position);
  }
}

export async function readSessions(ex: Executor): Promise<WorkoutSession[]> {
  const [{ rows: sessionRows }, { rows: setRows }] = [
    await ex.execute('SELECT * FROM sessions ORDER BY position'),
    await ex.execute('SELECT * FROM sets ORDER BY session_id, position'),
  ];
  const setsBySession = new Map<string, unknown[]>();
  for (const row of setRows) {
    const id = String(row.session_id);
    const list = setsBySession.get(id) ?? [];
    list.push(fromRow(row, SET_FIELDS));
    setsBySession.set(id, list);
  }
  return sessionRows.map(row => {
    const session = fromRow(row, SESSION_FIELDS);
    // Si `sets` no era una lista, ya viene tal cual en `extra`.
    if (!('sets' in session)) session.sets = setsBySession.get(String(row.id)) ?? [];
    return session as unknown as WorkoutSession;
  });
}

// ── Rutinas: split → días → huecos ──

const SPLIT_FIELDS: readonly Field[] = [
  ['id', 'id', 'text'],
  ['name', 'name', 'text'],
  ['type', 'type', 'text'],
];

const DAY_FIELDS: readonly Field[] = [
  ['id', 'id', 'text'],
  ['name', 'name', 'text'],
  ['order', 'day_order', 'number'],
  ['customized', 'customized', 'bool'],
];

const SLOT_FIELDS: readonly Field[] = [
  ['id', 'id', 'text'],
  ['exerciseId', 'exercise_id', 'number'],
  ['order', 'slot_order', 'number'],
  ['targetSets', 'target_sets', 'number'],
  ['targetRepsMin', 'target_reps_min', 'number'],
  ['targetRepsMax', 'target_reps_max', 'number'],
  ['restSeconds', 'rest_seconds', 'number'],
  ['backupExerciseId', 'backup_exercise_id', 'number'],
];

export async function writeSplits(ex: Executor, splits: Split[]): Promise<void> {
  await ex.execute('DELETE FROM split_slots');
  await ex.execute('DELETE FROM split_days');
  await ex.execute('DELETE FROM splits');
  for (const [splitPos, split] of splits.entries()) {
    const splitObj = split as unknown as Record<string, unknown>;
    await ex.execute(
      `INSERT INTO splits (position, ${columns(SPLIT_FIELDS)}, extra)
       VALUES (${placeholders(SPLIT_FIELDS.length + 2)})`,
      [splitPos, ...toRow(splitObj, SPLIT_FIELDS, nestedIfList(splitObj, 'days'))],
    );
    for (const [dayPos, day] of listOf(splitObj.days).entries()) {
      const dayObj = isObject(day) ? day : { value: day };
      await ex.execute(
        `INSERT INTO split_days (split_position, position, ${columns(DAY_FIELDS)}, extra)
         VALUES (${placeholders(DAY_FIELDS.length + 3)})`,
        [splitPos, dayPos, ...toRow(dayObj, DAY_FIELDS, nestedIfList(dayObj, 'exercises'))],
      );
      for (const [slotPos, slot] of listOf(dayObj.exercises).entries()) {
        await ex.execute(
          `INSERT INTO split_slots (split_position, day_position, position, ${columns(SLOT_FIELDS)}, extra)
           VALUES (${placeholders(SLOT_FIELDS.length + 4)})`,
          [splitPos, dayPos, slotPos, ...toRow(isObject(slot) ? slot : { value: slot }, SLOT_FIELDS)],
        );
      }
    }
  }
}

export async function readSplits(ex: Executor): Promise<Split[]> {
  const { rows: splitRows } = await ex.execute('SELECT * FROM splits ORDER BY position');
  const { rows: dayRows } = await ex.execute(
    'SELECT * FROM split_days ORDER BY split_position, position',
  );
  const { rows: slotRows } = await ex.execute(
    'SELECT * FROM split_slots ORDER BY split_position, day_position, position',
  );
  const slotsByDay = new Map<string, unknown[]>();
  for (const row of slotRows) {
    const key = `${row.split_position}:${row.day_position}`;
    slotsByDay.set(key, [...(slotsByDay.get(key) ?? []), fromRow(row, SLOT_FIELDS)]);
  }
  const daysBySplit = new Map<number, unknown[]>();
  for (const row of dayRows) {
    const day = fromRow(row, DAY_FIELDS);
    if (!('exercises' in day)) {
      day.exercises = slotsByDay.get(`${row.split_position}:${row.position}`) ?? [];
    }
    const splitPos = Number(row.split_position);
    daysBySplit.set(splitPos, [...(daysBySplit.get(splitPos) ?? []), day]);
  }
  return splitRows.map(row => {
    const split = fromRow(row, SPLIT_FIELDS);
    if (!('days' in split)) split.days = daysBySplit.get(Number(row.position)) ?? [];
    return split as unknown as Split;
  });
}

// ── Favoritos ──

const FAVORITE_FIELDS: readonly Field[] = [['exerciseId', 'exercise_id', 'number']];

export async function writeFavorites(ex: Executor, ids: number[]): Promise<void> {
  await ex.execute('DELETE FROM favorites');
  for (const [position, id] of ids.entries()) {
    await ex.execute('INSERT INTO favorites (position, exercise_id, extra) VALUES (?, ?, ?)', [
      position,
      ...toRow({ exerciseId: id }, FAVORITE_FIELDS),
    ]);
  }
}

export async function readFavorites(ex: Executor): Promise<number[]> {
  const { rows } = await ex.execute('SELECT * FROM favorites ORDER BY position');
  return rows.map(row => fromRow(row, FAVORITE_FIELDS).exerciseId as number);
}

// ── Ejercicios propios ──

const CUSTOM_EXERCISE_FIELDS: readonly Field[] = [
  ['id', 'id', 'number'],
  ['uuid', 'uuid', 'text'],
  ['name', 'name', 'text'],
  ['description', 'description', 'text'],
  ['category', 'category', 'json'],
  ['musclesPrimary', 'muscles_primary', 'json'],
  ['musclesSecondary', 'muscles_secondary', 'json'],
  ['equipment', 'equipment', 'json'],
  ['images', 'images', 'json'],
  ['videos', 'videos', 'json'],
  ['bodyweight', 'bodyweight', 'bool'],
  ['timed', 'timed', 'bool'],
  ['unilateral', 'unilateral', 'bool'],
];

export async function writeCustomExercises(ex: Executor, exercises: CustomExercise[]) {
  await ex.execute('DELETE FROM custom_exercises');
  for (const [position, exercise] of exercises.entries()) {
    await ex.execute(
      `INSERT INTO custom_exercises (position, ${columns(CUSTOM_EXERCISE_FIELDS)}, extra)
       VALUES (${placeholders(CUSTOM_EXERCISE_FIELDS.length + 2)})`,
      [position, ...toRow(exercise as unknown as Record<string, unknown>, CUSTOM_EXERCISE_FIELDS)],
    );
  }
}

export async function readCustomExercises(ex: Executor): Promise<CustomExercise[]> {
  const { rows } = await ex.execute('SELECT * FROM custom_exercises ORDER BY position');
  return rows.map(row => fromRow(row, CUSTOM_EXERCISE_FIELDS) as unknown as CustomExercise);
}

// ── Pesos de cada máquina (por id de ejercicio; `null` = sin pila) ──

const STACK_FIELDS: readonly Field[] = [
  ['kind', 'kind', 'text'],
  ['start', 'start', 'number'],
  ['step', 'step', 'number'],
  ['max', 'max', 'number'],
  ['weights', 'weights', 'json'],
];
/** Un valor que no es ni pila ni `null` (no debería pasar) se guarda entero aquí. */
const RAW = '$raw';

export async function writeWeightStacks(
  ex: Executor,
  stacks: Record<string, WeightStack | null>,
): Promise<void> {
  await ex.execute('DELETE FROM weight_stacks');
  for (const [position, [key, stack]] of Object.entries(stacks).entries()) {
    const values =
      stack === null
        ? [...STACK_FIELDS.map(() => null), null]
        : isObject(stack)
        ? toRow(stack, STACK_FIELDS)
        : [...STACK_FIELDS.map(() => null), JSON.stringify({ [RAW]: stack })];
    await ex.execute(
      `INSERT INTO weight_stacks (exercise_key, position, no_stack, ${columns(STACK_FIELDS)}, extra)
       VALUES (${placeholders(STACK_FIELDS.length + 4)})`,
      [key, position, stack === null ? 1 : 0, ...values],
    );
  }
}

export async function readWeightStacks(
  ex: Executor,
): Promise<Record<string, WeightStack | null>> {
  const { rows } = await ex.execute('SELECT * FROM weight_stacks ORDER BY position');
  return Object.fromEntries(
    rows.map(row => {
      if (row.no_stack) return [String(row.exercise_key), null];
      const stack = fromRow(row, STACK_FIELDS);
      return [String(row.exercise_key), RAW in stack ? stack[RAW] : stack];
    }),
  ) as Record<string, WeightStack | null>;
}
