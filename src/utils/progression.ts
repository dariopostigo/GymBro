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
  /**
   * Con el peso del cuerpo y sin lastre no se sugiere cargar sola: se avisa de que ya
   * se llega al tope para que cada uno decida (lastre, variante más dura o más reps).
   */
  atTop?: boolean;
  /** Se propone bajar el peso: lleva `stalls` sesiones seguidas sin progresar con él. */
  deload?: { stalls: number };
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
 * Series del ejercicio en las sesiones anteriores que lo tengan en la misma posición,
 * de la más reciente a la más antigua y sin contar la sesión en curso. Primero por
 * posición dentro del grupo muscular y, si no hay, por posición en la sesión.
 */
export function recentSessionSets(
  sessions: WorkoutSession[],
  exerciseId: number,
  position: SlotPosition,
  excludeSessionId?: string,
): SetEntry[][] {
  const previous = sessions
    .filter(s => s.id !== excludeSessionId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const find = (matches: (set: SetEntry) => boolean) =>
    previous
      .map(session => session.sets.filter(set => set.exerciseId === exerciseId && matches(set)))
      .filter(sets => sets.length > 0);

  const { positionInMuscleGroup, positionInSession } = position;
  const byGroup =
    positionInMuscleGroup !== undefined
      ? find(set => set.positionInMuscleGroup === positionInMuscleGroup)
      : [];
  return byGroup.length ? byGroup : find(set => set.positionInSession === positionInSession);
}

/** Series de la sesión más reciente con el ejercicio en la misma posición (ver arriba). */
export function lastSessionSets(
  sessions: WorkoutSession[],
  exerciseId: number,
  position: SlotPosition,
  excludeSessionId?: string,
): SetEntry[] {
  return recentSessionSets(sessions, exerciseId, position, excludeSessionId)[0] ?? [];
}

/** Evita arrastrar decimales de coma flotante (60 + 1.25 + 1.25...). */
function roundWeight(weight: number): number {
  return Math.round(weight * 100) / 100;
}

type Lift = Pick<SetEntry, 'weight' | 'reps' | 'rir'>;

/** Sesiones seguidas sin progresar con el mismo peso antes de proponer una descarga. */
export const STALL_SESSIONS = 3;
/** La descarga baja a este porcentaje del peso con el que se estancó. */
export const DELOAD_FACTOR = 0.9;
/**
 * Ni la descarga baja de aquí: con pesos pequeños el salto más cercano puede ser enorme
 * (de 7,5 a 5 kg es un 33 %) y entonces mejor seguir con el peso y buscar más reps.
 */
const DELOAD_MIN_FACTOR = 0.8;

/** Peso de trabajo de una sesión, sus reps y si tocaba subir (tope de reps o todo fácil). */
function workingSets(sets: Lift[], target: SlotTarget) {
  const weight = Math.max(...sets.map(set => set.weight));
  const working = sets.filter(set => set.weight === weight);
  const reps = working.map(set => set.reps);
  const allAtMax = reps.length >= target.sets && reps.every(r => r >= target.repsMax);
  // Solo cuenta si se apuntó el esfuerzo de todas las series de trabajo.
  const allEasy = working.every(set => set.rir !== undefined && set.rir >= EASY_RIR);
  const total = reps.reduce((sum, r) => sum + r, 0);
  return { weight, reps, allAtMax, allEasy, total };
}

/**
 * Cuántas de las últimas sesiones (`history`, la más reciente primero) llevan el mismo
 * peso sin progresar: ni llegaron al tope ni hicieron más reps en total que alguna
 * anterior con ese peso. Superar a la mejor anterior ya es progreso aunque no se llegue
 * al tope; si no, con un rango ancho saltaría la descarga mientras se va mejorando.
 */
export function stallCount(history: Lift[][], target: SlotTarget): number {
  const sessions = history.filter(sets => sets.length).map(sets => workingSets(sets, target));
  if (!sessions.length) return 0;
  const { weight } = sessions[0];
  let stalls = 0;
  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];
    if (session.weight !== weight || session.allAtMax || session.allEasy) break;
    const older: number[] = [];
    for (let j = i + 1; j < sessions.length && sessions[j].weight === weight; j++) {
      older.push(sessions[j].total);
    }
    if (older.length && session.total > Math.max(...older)) break;
    stalls++;
  }
  return stalls;
}

/**
 * Peso de la descarga: lo más cerca posible del ~90 % del actual entre lo que se puede
 * cargar (la pila de la máquina o los saltos de `increment`), siempre por debajo del
 * actual y sin bajar más de un 20 %. Si no hay ninguno así, no hay descarga.
 */
function deloadWeight(weight: number, increment: number, weights?: number[]) {
  const goal = weight * DELOAD_FACTOR;
  const options = weights?.length
    ? weights
    : [
        roundWeight(Math.floor(goal / increment) * increment),
        roundWeight(Math.ceil(goal / increment) * increment),
      ];
  const lower = options.filter(w => w >= weight * DELOAD_MIN_FACTOR - 1e-9 && w < weight - 1e-9);
  if (!lower.length) return undefined;
  return lower.reduce((best, w) => (Math.abs(w - goal) < Math.abs(best - goal) ? w : best));
}

/**
 * `weights` son los pesos reales de la máquina, si se han configurado: subir
 * es ir al siguiente de la lista en vez de sumar `increment`. Con `bodyweight`
 * (dominadas, fondos...) y sin lastre no se propone añadirlo. `earlier` son las
 * sesiones anteriores a `sets` (la más reciente primero), para ver si está estancado.
 */
export function suggestNextLoad(
  sets: Lift[],
  target: SlotTarget,
  increment: number,
  weights?: number[],
  bodyweight = false,
  earlier: Lift[][] = [],
): LoadSuggestion | undefined {
  if (!sets.length) return undefined;
  const { weight, reps, allAtMax, allEasy } = workingSets(sets, target);
  const previous = { weight, reps };

  const next = weights?.length
    ? weights.find(w => w > weight + 1e-9)
    : roundWeight(weight + increment);
  if ((allAtMax || allEasy) && bodyweight && weight === 0) {
    return { weight, reps: Math.max(...reps), increase: false, atTop: true, previous };
  }
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
  const stalls = stallCount([sets, ...earlier], target);
  const lighter =
    weight > 0 && stalls >= STALL_SESSIONS && deloadWeight(weight, increment, weights);
  if (lighter) {
    // Con menos peso se apunta al tope del rango para volver a subir desde ahí.
    return { weight: lighter, reps: target.repsMax, increase: false, deload: { stalls }, previous };
  }
  return { weight, reps: Math.max(...reps), increase: false, previous };
}

/** "62,5": los pesos se muestran con coma decimal. */
export function formatWeight(weight: number): string {
  return String(weight).replace('.', ',');
}

/**
 * Carga de una serie para mostrarla: en los ejercicios con el peso del cuerpo
 * "PC" sin lastre y "PC+10" con él; en el resto, el peso ("62,5").
 */
export function formatLoad(weight: number, bodyweight: boolean): string {
  if (!bodyweight) return formatWeight(weight);
  return weight > 0 ? `PC+${formatWeight(weight)}` : 'PC';
}

/** Segundos de una serie por tiempo: "45 s" o, desde el minuto, "1:30". */
export function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

/** Reps de una serie o, si el ejercicio va por tiempo, sus segundos. */
export function formatReps(reps: number, timed: boolean): string {
  return timed ? formatSeconds(reps) : String(reps);
}

/**
 * Una serie en corto: "80×10", "PC+10×8"; por tiempo "PC · 45 s" o "32 · 1:00".
 * La plancha sin lastre queda en "45 s": "PC" no aporta nada.
 */
export function formatSet(weight: number, reps: number, bodyweight: boolean, timed: boolean) {
  if (!timed) return `${formatLoad(weight, bodyweight)}×${reps}`;
  const time = formatSeconds(reps);
  return bodyweight && weight === 0 ? time : `${formatLoad(weight, bodyweight)} · ${time}`;
}
