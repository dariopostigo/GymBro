import type { SetEntry, WorkoutSession } from '../types/session';
import { EASY_RIR } from './effort';

/**
 * Sobrecarga progresiva: a partir de la última vez que se hizo el ejercicio,
 * propone subir peso si se completaron todas las series al máximo de reps, o
 * si en todas sobraban muchas repeticiones (RIR alto).
 */
export interface LoadSuggestion {
  weight: number;
  reps: number;
  /** true si se propone subir peso respecto a la última vez. */
  increase: boolean;
  /** Por qué se sube: se llegó al máximo de reps o el peso se quedó ligero (RIR alto). */
  reason?: 'reps' | 'easy';
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

/**
 * `weights` son los pesos reales de la máquina, si se han configurado: subir
 * es ir al siguiente de la lista en vez de sumar `increment`.
 */
export function suggestNextLoad(
  sets: Pick<SetEntry, 'weight' | 'reps' | 'rir'>[],
  target: SlotTarget,
  increment: number,
  weights?: number[],
): LoadSuggestion | undefined {
  if (!sets.length) return undefined;
  const weight = Math.max(...sets.map(set => set.weight));
  const working = sets.filter(set => set.weight === weight);
  const reps = working.map(set => set.reps);
  const previous = { weight, reps };

  const allAtMax = reps.length >= target.sets && reps.every(r => r >= target.repsMax);
  // Solo cuenta si se apuntó el esfuerzo de todas las series de trabajo.
  const allEasy = working.every(set => set.rir !== undefined && set.rir >= EASY_RIR);
  const next = weights?.length
    ? weights.find(w => w > weight + 1e-9)
    : roundWeight(weight + increment);
  // En el tope de la pila no hay a dónde subir: se sigue con el mismo peso.
  if ((allAtMax || allEasy) && next !== undefined) {
    return {
      weight: next,
      reps: target.repsMin,
      increase: true,
      reason: allAtMax ? 'reps' : 'easy',
      previous,
    };
  }
  return { weight, reps: Math.max(...reps), increase: false, previous };
}

/** "62,5": los pesos se muestran con coma decimal. */
export function formatWeight(weight: number): string {
  return String(weight).replace('.', ',');
}
