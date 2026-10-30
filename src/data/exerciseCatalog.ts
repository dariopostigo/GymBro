import exercisesJson from './exercises.json';
import exerciseMerges from './exerciseMerges.json';
import { DEFAULT_BACKUPS } from './exerciseBackups';
import { BODYWEIGHT_EXERCISES } from './bodyweightExercises';
import { TIMED_EXERCISES } from './timedExercises';
import { UNILATERAL_EXERCISES } from './unilateralExercises';
import type { CustomExercise, Exercise } from '../types/exercise';

export const EXERCISES = exercisesJson as Exercise[];

const exercisesById = new Map(EXERCISES.map(e => [e.id, e]));

/** Los ejercicios propios empiezan aquí, lejos de los del catálogo (90001+ son los de scripts/). */
export const FIRST_CUSTOM_EXERCISE_ID = 100001;

// Los ejercicios creados en la app: los registra CustomExercisesContext al cargarlos.
let customExercises: CustomExercise[] = [];
let customById = new Map<number, CustomExercise>();

export function setCustomExercises(list: CustomExercise[]): void {
  customExercises = list;
  customById = new Map(list.map(e => [e.id, e]));
}

export function getCustomExercise(id: number): CustomExercise | undefined {
  return customById.get(id);
}

export function isCustomExercise(id: number): boolean {
  return id >= FIRST_CUSTOM_EXERCISE_ID;
}

/** Catálogo completo para los buscadores: los propios primero. */
export function allExercises(): Exercise[] {
  return [...customExercises, ...EXERCISES];
}

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
  return exercisesById.get(canonicalExerciseId(id)) ?? customById.get(id);
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
  return UNILATERAL_EXERCISES.has(canonicalExerciseId(id)) || !!customById.get(id)?.unilateral;
}

/** Con el peso del cuerpo: lo que se apunta es el lastre (ver bodyweightExercises.ts). */
export function isBodyweight(id: number): boolean {
  return BODYWEIGHT_EXERCISES.has(canonicalExerciseId(id)) || !!customById.get(id)?.bodyweight;
}

/** Se mide en segundos: las reps de cada serie son segundos (ver timedExercises.ts). */
export function isTimed(id: number): boolean {
  return TIMED_EXERCISES.has(canonicalExerciseId(id)) || !!customById.get(id)?.timed;
}

/** Rango con el que entra un ejercicio nuevo en un día: 8-12 reps o, por tiempo, 30-60 s. */
export function defaultRepRange(id: number): { targetRepsMin: number; targetRepsMax: number } {
  return isTimed(id)
    ? { targetRepsMin: 30, targetRepsMax: 60 }
    : { targetRepsMin: 8, targetRepsMax: 12 };
}

/**
 * Rango de un hueco al poner otro ejercicio en él: se queda el que había, salvo
 * que uno vaya por tiempo y el otro no (8-12 segundos no tiene sentido).
 */
export function repRangeFor(
  slot: { exerciseId: number; targetRepsMin: number; targetRepsMax: number },
  exerciseId: number,
): { targetRepsMin: number; targetRepsMax: number } {
  if (isTimed(slot.exerciseId) !== isTimed(exerciseId)) return defaultRepRange(exerciseId);
  return { targetRepsMin: slot.targetRepsMin, targetRepsMax: slot.targetRepsMax };
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

/** Categoría del catálogo por nombre, con su id, para los ejercicios propios. */
export const CATEGORY_REFS = new Map(EXERCISES.map(e => [e.category.name, e.category]));

/** Músculos del catálogo (id y nombre), ordenados por nombre, para elegirlos en los propios. */
export const MUSCLES = [
  ...new Map(
    EXERCISES.flatMap(e => [...e.musclesPrimary, ...e.musclesSecondary]).map(m => [m.id, m]),
  ).values(),
].sort((a, b) => a.name.localeCompare(b.name, 'es'));

export const CATEGORIES = [...new Set(EXERCISES.map(e => e.category.name))].sort((a, b) =>
  a.localeCompare(b, 'es'),
);
