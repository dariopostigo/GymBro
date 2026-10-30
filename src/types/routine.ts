export type SplitType = 'ppl' | 'upper-lower' | 'bro-split' | 'custom';

export interface DayExerciseSlot {
  id: string;
  exerciseId: number;
  order: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  /** Descanso elegido a mano, en segundos. Sin él se calcula del rango de reps. */
  restSeconds?: number;
  /** Plan B por si la máquina está ocupada: en Hoy se cambia con un toque, con las mismas series y reps. */
  backupExerciseId?: number;
}

export interface SplitDay {
  id: string;
  name: string;
  order: number;
  exercises: DayExerciseSlot[];
  /** Día de una rutina predefinida que el usuario ha editado: no se pisa con la del código. */
  customized?: boolean;
}

export interface Split {
  id: string;
  name: string;
  type: SplitType;
  days: SplitDay[];
}

export interface ActiveSplitState {
  splitId: string;
  currentDayIndex: number;
}

/** Ajustes de un hueco del día que solo valen para la sesión en curso. */
export interface SlotOverride {
  exerciseId?: number;
  targetSets?: number;
  /**
   * Ejercicio añadido solo para hoy (no está en la plantilla): va después de
   * los del día y se borra con el resto de cambios al terminar.
   */
  extra?: { repsMin: number; repsMax: number };
  /**
   * Tarjeta plegada o desplegada a mano en Hoy. Solo se guarda cuando no
   * coincide con lo automático (plegada si está completa).
   */
  collapsed?: boolean;
}

/**
 * Cambios que solo valen para la sesión en curso, sin tocar la plantilla:
 * `${splitId}:${dayId}` → slotId → ajustes.
 */
export type DayOverrides = Record<string, Record<string, SlotOverride>>;
