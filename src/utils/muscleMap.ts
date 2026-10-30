import { getExerciseById } from '../data/exerciseCatalog';
import type { BodySide } from '../data/bodyPaths';
import type { WorkoutSession } from '../types/session';

/** Cómo de trabajado sale un músculo en el mapa: principal manda sobre secundario. */
export type MuscleLevel = 'primary' | 'secondary';

/** Músculo del catálogo (ids de exerciseFixes.js) -> partes de las siluetas de MuscleMap. */
const MUSCLE_PARTS: Record<number, string[]> = {
  1: ['biceps'], // Bíceps
  2: ['deltoids'], // Hombros (deltoides)
  3: ['serratus'], // Serrato anterior
  4: ['chest'], // Pecho
  5: ['triceps'], // Tríceps
  6: ['abs'], // Abdominales
  7: ['calves'], // Gemelos
  8: ['gluteal'], // Glúteos
  9: ['trapezius'], // Trapecio
  10: ['quadriceps'], // Cuádriceps
  11: ['hamstring'], // Isquiotibiales
  12: ['upperBack'], // Dorsales
  13: ['biceps'], // Braquial
  14: ['obliques'], // Oblicuos
  15: ['calves'], // Sóleo
  16: ['forearm'], // Antebrazos
  17: ['tibialis'], // Tibial anterior
  18: ['adductors'], // Aductores
};

/** Categoría del catálogo -> qué cara de la figura y qué partes se resaltan en su icono. */
export const CATEGORY_PARTS: Record<string, { side: BodySide; parts: string[] }> = {
  Pecho: { side: 'front', parts: ['chest'] },
  Hombros: { side: 'front', parts: ['deltoids'] },
  Bíceps: { side: 'front', parts: ['biceps'] },
  Antebrazos: { side: 'front', parts: ['forearm'] },
  Abdominales: { side: 'front', parts: ['abs', 'obliques'] },
  Cuádriceps: { side: 'front', parts: ['quadriceps'] },
  Espalda: { side: 'back', parts: ['upperBack', 'trapezius', 'rhomboids'] },
  Tríceps: { side: 'back', parts: ['triceps'] },
  Glúteos: { side: 'back', parts: ['gluteal'] },
  Femoral: { side: 'back', parts: ['hamstring'] },
  Gemelos: { side: 'back', parts: ['calves'] },
};

/**
 * Partes del cuerpo que trabajan unos ejercicios: las de sus músculos
 * principales salen como `primary`, y las que solo son secundarias como
 * `secondary`. Los ids que no están en el catálogo se ignoran.
 */
export function musclesWorked(exerciseIds: number[]): Map<string, MuscleLevel> {
  const levels = new Map<string, MuscleLevel>();
  for (const id of exerciseIds) {
    const exercise = getExerciseById(id);
    if (!exercise) continue;
    for (const muscle of exercise.musclesPrimary) {
      for (const part of MUSCLE_PARTS[muscle.id] ?? []) levels.set(part, 'primary');
    }
    for (const muscle of exercise.musclesSecondary) {
      for (const part of MUSCLE_PARTS[muscle.id] ?? []) {
        if (!levels.has(part)) levels.set(part, 'secondary');
      }
    }
  }
  return levels;
}

/** Grupos musculares de las series semanales, en el orden en que se enseñan. */
export const MUSCLE_GROUPS = [
  'Pecho',
  'Espalda',
  'Hombros',
  'Bíceps',
  'Tríceps',
  'Cuádriceps',
  'Femoral',
  'Glúteos',
  'Gemelos',
  'Abdominales',
  'Antebrazos',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

/** Series semanales recomendadas por grupo para ganar músculo (referencia habitual). */
export const WEEKLY_SETS_TARGET = { min: 10, max: 20 };

/** Músculo del catálogo -> grupo (serrato y tibial no cuentan para ninguno). */
const MUSCLE_GROUP: Record<number, MuscleGroup> = {
  1: 'Bíceps',
  2: 'Hombros',
  4: 'Pecho',
  5: 'Tríceps',
  6: 'Abdominales',
  7: 'Gemelos',
  8: 'Glúteos',
  9: 'Espalda',
  10: 'Cuádriceps',
  11: 'Femoral',
  12: 'Espalda',
  13: 'Bíceps',
  14: 'Abdominales',
  15: 'Gemelos',
  16: 'Antebrazos',
  18: 'Glúteos',
};

/** Lunes a las 00:00 (hora local) de la semana de `date`. */
export function startOfWeek(date: Date): Date {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return monday;
}

/**
 * Series por grupo muscular entre `from` (incluido) y `to` (excluido). Cada
 * serie suma 1 a los grupos de sus músculos principales y 0,5 a los grupos
 * en los que solo trabaja como secundario; un ejercicio con dos principales
 * del mismo grupo (bíceps y braquial) suma 1, no 2.
 */
export function setsByMuscleGroup(
  sessions: WorkoutSession[],
  from: Date,
  to: Date,
): Map<MuscleGroup, number> {
  const totals = new Map<MuscleGroup, number>();
  for (const session of sessions) {
    const date = new Date(session.date);
    if (date < from || date >= to) continue;
    for (const set of session.sets) {
      const exercise = getExerciseById(set.exerciseId);
      if (!exercise) continue;
      const primary = new Set(exercise.musclesPrimary.map(m => MUSCLE_GROUP[m.id]));
      const secondary = new Set(exercise.musclesSecondary.map(m => MUSCLE_GROUP[m.id]));
      for (const group of primary) {
        if (group) totals.set(group, (totals.get(group) ?? 0) + 1);
      }
      for (const group of secondary) {
        if (group && !primary.has(group)) totals.set(group, (totals.get(group) ?? 0) + 0.5);
      }
    }
  }
  return totals;
}

export interface WeeklyMuscleSets {
  group: MuscleGroup;
  sets: number;
  previous: number;
}

/** Series de cada grupo esta semana (de lunes a hoy) y la semana anterior completa. */
export function weeklyMuscleSets(sessions: WorkoutSession[], now = new Date()): WeeklyMuscleSets[] {
  const thisWeek = startOfWeek(now);
  const nextWeek = new Date(thisWeek);
  nextWeek.setDate(thisWeek.getDate() + 7);
  const lastWeek = new Date(thisWeek);
  lastWeek.setDate(thisWeek.getDate() - 7);

  const current = setsByMuscleGroup(sessions, thisWeek, nextWeek);
  const previous = setsByMuscleGroup(sessions, lastWeek, thisWeek);
  return MUSCLE_GROUPS.map(group => ({
    group,
    sets: current.get(group) ?? 0,
    previous: previous.get(group) ?? 0,
  }));
}
