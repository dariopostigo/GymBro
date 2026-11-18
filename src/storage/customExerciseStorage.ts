import type { CustomExercise } from '../types/exercise';
import { inTransaction, withDb } from './db';
import { KV } from './legacyImport';
import { readCustomExercises, readKv, writeCustomExercises, writeKv } from './rows';

export function loadCustomExercises(): Promise<CustomExercise[]> {
  return withDb(readCustomExercises);
}

/** Último id dado a un ejercicio propio (0 si nunca se ha creado ninguno). */
export async function loadLastCustomExerciseId(): Promise<number> {
  const raw = await withDb(db => readKv(db, KV.lastCustomExerciseId));
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

/** Guarda los ejercicios propios y, si se pasa, el último id dado (en la misma transacción). */
export function saveCustomExercises(exercises: CustomExercise[], lastId?: number): Promise<void> {
  return inTransaction(async tx => {
    await writeCustomExercises(tx, exercises);
    if (lastId !== undefined) await writeKv(tx, KV.lastCustomExerciseId, String(lastId));
  });
}
