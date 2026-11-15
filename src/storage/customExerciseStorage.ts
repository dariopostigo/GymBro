import type { CustomExercise } from '../types/exercise';
import { inTransaction, withDb } from './db';
import { readCustomExercises, writeCustomExercises } from './rows';

export function loadCustomExercises(): Promise<CustomExercise[]> {
  return withDb(readCustomExercises);
}

export function saveCustomExercises(exercises: CustomExercise[]): Promise<void> {
  return inTransaction(tx => writeCustomExercises(tx, exercises));
}
