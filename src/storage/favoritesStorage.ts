import { canonicalExerciseId } from '../data/exerciseCatalog';
import { inTransaction, withDb } from './db';
import { readFavorites, writeFavorites } from './rows';

export async function loadFavoriteExerciseIds(): Promise<number[]> {
  return (await withDb(readFavorites)).map(canonicalExerciseId);
}

export function saveFavoriteExerciseIds(ids: number[]): Promise<void> {
  return inTransaction(tx => writeFavorites(tx, ids));
}
