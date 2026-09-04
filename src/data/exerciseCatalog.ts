import exercisesJson from './exercises.json';
import type { Exercise } from '../types/exercise';

export const EXERCISES = exercisesJson as Exercise[];

const exercisesById = new Map(EXERCISES.map(e => [e.id, e]));

export function getExerciseById(id: number): Exercise | undefined {
  return exercisesById.get(id);
}

export const CATEGORIES = [...new Set(EXERCISES.map(e => e.category.name))].sort((a, b) =>
  a.localeCompare(b, 'es'),
);
