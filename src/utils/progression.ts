import type { SetEntry, WorkoutSession } from '../types/session';

/**
 * Sobrecarga progresiva: a partir de la última vez que se hizo el ejercicio,
 * propone subir peso si se completaron todas las series al máximo de reps.
 */
export interface LoadSuggestion {
  weight: number;
  reps: number;
  /** true si se propone subir peso respecto a la última vez. */
  increase: boolean;
  /** Peso de trabajo de la última vez y las reps de cada serie con ese peso. */
  previous: { weight: number; reps: number[] };
}

export interface SlotTarget {
  sets: number;
  repsMin: number;
  repsMax: number;
}

export interface SlotPosition {
  positionInSession: number;
  positionInMuscleGroup?: number;
}

/**
 * Series del ejercicio en la sesión más reciente que lo tenga en la misma posición,
 * sin contar la sesión en curso. Primero por posición dentro del grupo muscular y,
 * si no hay, por posición en la sesión (como la sugerencia de siempre).
 */
export function lastSessionSets(
  sessions: WorkoutSession[],
  exerciseId: number,
  position: SlotPosition,
  excludeSessionId?: string,
): SetEntry[] {
  const previous = sessions
    .filter(s => s.id !== excludeSessionId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const find = (matches: (set: SetEntry) => boolean) => {
    for (const session of previous) {
      const sets = session.sets.filter(set => set.exerciseId === exerciseId && matches(set));
      if (sets.length) return sets;
    }
    return [];
  };

  const { positionInMuscleGroup, positionInSession } = position;
  const byGroup =
    positionInMuscleGroup !== undefined
      ? find(set => set.positionInMuscleGroup === positionInMuscleGroup)
      : [];
  return byGroup.length ? byGroup : find(set => set.positionInSession === positionInSession);
}

/** Evita arrastrar decimales de coma flotante (60 + 1.25 + 1.25...). */
function roundWeight(weight: number): number {
  return Math.round(weight * 100) / 100;
}

export function suggestNextLoad(
  sets: Pick<SetEntry, 'weight' | 'reps'>[],
  target: SlotTarget,
  increment: number,
): LoadSuggestion | undefined {
  if (!sets.length) return undefined;
  const weight = Math.max(...sets.map(set => set.weight));
  const reps = sets.filter(set => set.weight === weight).map(set => set.reps);
  const previous = { weight, reps };

  const allAtMax = reps.length >= target.sets && reps.every(r => r >= target.repsMax);
  if (allAtMax) {
    return {
      weight: roundWeight(weight + increment),
      reps: target.repsMin,
      increase: true,
      previous,
    };
  }
  return { weight, reps: Math.max(...reps), increase: false, previous };
}

/** "62,5": los pesos se muestran con coma decimal. */
export function formatWeight(weight: number): string {
  return String(weight).replace('.', ',');
}
