import exercisesJson from './exercises.json';
import exerciseMerges from './exerciseMerges.json';
import type { Exercise } from '../types/exercise';

export const EXERCISES = exercisesJson as Exercise[];

const exercisesById = new Map(EXERCISES.map(e => [e.id, e]));

const mergedInto = new Map(Object.entries(exerciseMerges).map(([from, to]) => [Number(from), to]));

/**
 * Los duplicados del catálogo se fusionaron en uno solo (ver
 * scripts/exerciseFixes.js): lo guardado con el id que sobraba apunta ahora al
 * que se quedó.
 */
export function canonicalExerciseId(id: number): number {
  return mergedInto.get(id) ?? id;
}

export function getExerciseById(id: number): Exercise | undefined {
  return exercisesById.get(canonicalExerciseId(id));
}

export const CATEGORIES = [...new Set(EXERCISES.map(e => e.category.name))].sort((a, b) =>
  a.localeCompare(b, 'es'),
);
