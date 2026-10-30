import { getExerciseById } from '../data/exerciseCatalog';
import type { BodySide } from '../data/bodyPaths';

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
