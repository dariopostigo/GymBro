import { repRangeFor } from '../data/exerciseCatalog';
import type { DayExerciseSlot, SlotOverride, SplitDay } from '../types/routine';

/**
 * Ejercicios del día tal y como se hacen hoy: la plantilla con los cambios
 * "solo hoy" (otro ejercicio, otras series) y, al final, los añadidos solo para
 * hoy en el orden en que se añadieron; si se ha cambiado el orden de hoy, en ese
 * orden. Lo usan Hoy e Inicio, para que cuenten lo mismo.
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
  const all = [...template, ...extras];
  // Sin orden de hoy (o añadido después de reordenar), detrás y en su orden de siempre.
  const key = (slot: DayExerciseSlot, index: number) =>
    overrides[slot.id]?.order ?? all.length + index;
  return all
    .map((slot, index) => ({ slot, key: key(slot, index) }))
    .sort((a, b) => a.key - b.key)
    .map(({ slot }) => slot);
}

/**
 * Ejercicios que ya ocupan el día, en la plantilla o hoy (cambiados o añadidos solo para hoy),
 * sin contar el hueco `exceptSlotId` (el que se está cambiando). Las series se guardan por
 * ejercicio, no por hueco: si uno sale dos veces, las dos tarjetas comparten series y los
 * totales se cuentan dos veces. Por eso no se deja elegir uno de estos.
 */
export function exercisesInDay(
  day: SplitDay | null | undefined,
  overrides: Record<string, SlotOverride>,
  exceptSlotId?: string,
): Set<number> {
  if (!day) return new Set();
  const slots = [...day.exercises, ...todayExercises(day, overrides)];
  return new Set(slots.filter(slot => slot.id !== exceptSlotId).map(slot => slot.exerciseId));
}
