import exercisesJson from './exercises.json';
import exerciseMerges from './exerciseMerges.json';
import { DEFAULT_BACKUPS } from './exerciseBackups';
import { BODYWEIGHT_EXERCISES } from './bodyweightExercises';
import { UNILATERAL_EXERCISES } from './unilateralExercises';
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

/** Plan B por defecto del ejercicio (ver exerciseBackups.ts), si existe y no es él mismo. */
export function defaultBackupId(id: number): number | undefined {
  const canonical = canonicalExerciseId(id);
  const backup = DEFAULT_BACKUPS[canonical] ?? DEFAULT_BACKUPS[id];
  if (backup === undefined) return undefined;
  const resolved = canonicalExerciseId(backup);
  return resolved !== canonical && exercisesById.has(resolved) ? resolved : undefined;
}

/** Ejercicio a un lado cada vez: las reps se apuntan por lado (ver unilateralExercises.ts). */
export function isUnilateral(id: number): boolean {
  return UNILATERAL_EXERCISES.has(canonicalExerciseId(id));
}

/** Con el peso del cuerpo: lo que se apunta es el lastre (ver bodyweightExercises.ts). */
export function isBodyweight(id: number): boolean {
  return BODYWEIGHT_EXERCISES.has(canonicalExerciseId(id));
}

/**
 * " · Isquiotibiales, Glúteos" para poner tras la categoría en las listas, sin
 * repetir el músculo que se llama como ella ("Pecho · Pecho"); vacío si no queda ninguno.
 */
export function primaryMusclesSuffix(exercise: Exercise): string {
  const muscles = exercise.musclesPrimary
    .map(m => m.name)
    .filter(name => name !== exercise.category.name);
  return muscles.length ? ` · ${muscles.join(', ')}` : '';
}

export const CATEGORIES = [...new Set(EXERCISES.map(e => e.category.name))].sort((a, b) =>
  a.localeCompare(b, 'es'),
);
