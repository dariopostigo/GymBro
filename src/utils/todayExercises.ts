import { repRangeFor } from '../data/exerciseCatalog';
import type { DayExerciseSlot, SlotOverride, SplitDay } from '../types/routine';

/**
 * Ejercicios del día tal y como se hacen hoy: la plantilla con los cambios
 * "solo hoy" (otro ejercicio, otras series) y, al final, los añadidos solo para
 * hoy en el orden en que se añadieron. Lo usan Hoy e Inicio, para que cuenten lo mismo.
 */
export function todayExercises(
  day: SplitDay | null | undefined,
  overrides: Record<string, SlotOverride>,
): DayExerciseSlot[] {
  if (!day) return [];
  const template = [...day.exercises]
    .sort((a, b) => a.order - b.order)
    .map(slot => {
      const override = overrides[slot.id];
      if (!override) return slot;
      const exerciseId = override.exerciseId ?? slot.exerciseId;
      return {
        ...slot,
        exerciseId,
        // Cambiado hoy por uno que va por tiempo (o al revés): el rango de la plantilla no vale.
        ...repRangeFor(slot, exerciseId),
        targetSets: override.targetSets ?? slot.targetSets,
      };
    });
  const extras = Object.entries(overrides).flatMap(([slotId, override]) =>
    override.extra && override.exerciseId !== undefined
      ? [
          {
            id: slotId,
            exerciseId: override.exerciseId,
            order: Number.MAX_SAFE_INTEGER,
            targetSets: override.targetSets ?? 3,
            targetRepsMin: override.extra.repsMin,
            targetRepsMax: override.extra.repsMax,
          },
        ]
      : [],
  );
  return [...template, ...extras];
}
