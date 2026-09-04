import { getExerciseById } from '../data/exerciseCatalog';
import type { DayExerciseSlot } from '../types/routine';

/**
 * Para cada slot, cuántos ejercicios de su misma categoría ya se han hecho
 * antes en la sesión (1 = primero de su categoría). Los slots deben venir
 * ya ordenados por el orden real de ejecución. Un ejercicio sin categoría
 * resoluble (id inexistente en el catálogo) no recibe posición.
 */
export function computeMuscleGroupPositions(slots: DayExerciseSlot[]): Map<string, number> {
  const positions = new Map<string, number>();
  const countByCategory = new Map<number, number>();

  for (const slot of slots) {
    const categoryId = getExerciseById(slot.exerciseId)?.category.id;
    if (categoryId === undefined) continue;
    const count = (countByCategory.get(categoryId) ?? 0) + 1;
    countByCategory.set(categoryId, count);
    positions.set(slot.id, count);
  }

  return positions;
}
