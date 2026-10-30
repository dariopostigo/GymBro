import AsyncStorage from '@react-native-async-storage/async-storage';
import { canonicalExerciseId } from '../data/exerciseCatalog';
import { DEFAULT_WEIGHT_STACKS } from '../data/defaultWeightStacks';
import type { WeightStack } from '../utils/weightStack';

const WEIGHT_STACKS_KEY = 'gymbro:weightStacks';

/**
 * Pilas de pesos guardadas a mano, por id de ejercicio. `null` es "esta
 * máquina no tiene pila": quita también la de por defecto.
 */
export type WeightStacks = Record<number, WeightStack | null>;

/** De dónde sale la pila de un ejercicio. */
export type StackSource = 'custom' | 'default' | 'none';

/** La pila que vale para un ejercicio: la guardada a mano o, si no hay, la de por defecto. */
export function resolveStack(
  saved: WeightStacks,
  exerciseId: number,
): { stack?: WeightStack; source: StackSource } {
  const id = canonicalExerciseId(exerciseId);
  if (id in saved) {
    const stack = saved[id];
    return stack ? { stack, source: 'custom' } : { source: 'none' };
  }
  const fallback = DEFAULT_WEIGHT_STACKS[id];
  return fallback ? { stack: fallback, source: 'default' } : { source: 'none' };
}

export async function loadWeightStacks(): Promise<WeightStacks> {
  const raw = await AsyncStorage.getItem(WEIGHT_STACKS_KEY);
  if (!raw) return {};
  const stored = JSON.parse(raw) as Record<string, WeightStack | null>;
  return Object.fromEntries(
    Object.entries(stored).map(([id, stack]) => [canonicalExerciseId(Number(id)), stack]),
  );
}

export async function saveWeightStacks(stacks: WeightStacks): Promise<void> {
  await AsyncStorage.setItem(WEIGHT_STACKS_KEY, JSON.stringify(stacks));
}
