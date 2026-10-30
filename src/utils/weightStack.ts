import { formatWeight } from './progression';

/**
 * Pesos que de verdad tiene una máquina (o un juego de mancuernas): de
 * `start` a `max` subiendo de `step` en `step`, o una lista a mano para las
 * que tienen saltos raros.
 */
export type WeightStack =
  | { kind: 'steps'; start: number; step: number; max: number }
  | { kind: 'list'; weights: number[] };

/** Tope de pesos por pila, para que un salto mal escrito (0,01) no genere miles. */
const MAX_WEIGHTS = 200;

const round = (weight: number) => Math.round(weight * 100) / 100;

/** Los pesos de la pila, ordenados y sin repetir. */
export function stackWeights(stack: WeightStack): number[] {
  if (stack.kind === 'list') {
    return [...new Set(stack.weights.filter(w => w > 0).map(round))]
      .sort((a, b) => a - b)
      .slice(0, MAX_WEIGHTS);
  }
  const { start, step, max } = stack;
  if (!(start > 0) || !(step > 0) || !(max >= start)) return [];
  const weights: number[] = [];
  for (let i = 0; weights.length < MAX_WEIGHTS; i += 1) {
    const weight = round(start + i * step);
    if (weight > max + 1e-9) break;
    weights.push(weight);
  }
  return weights;
}

/** El primer peso de la pila por encima de `current`, o nada si ya está en el tope. */
export function nextWeightUp(weights: number[], current: number): number | undefined {
  return weights.find(w => w > current + 1e-9);
}

/**
 * Un paso arriba (+1) o abajo (-1) por la pila desde `current`. Si `current`
 * no está en la pila, va al peso más cercano en esa dirección; en los
 * extremos se queda donde está.
 */
export function stepWeight(weights: number[], current: number, direction: 1 | -1): number {
  if (!weights.length) return current;
  if (!(current > 0)) return weights[0];
  if (direction === 1) return nextWeightUp(weights, current) ?? weights[weights.length - 1];
  const below = weights.filter(w => w < current - 1e-9);
  return below.length ? below[below.length - 1] : weights[0];
}

/** Lee "4,5 9 13,5 18" (también con punto y coma o saltos de línea) como lista de pesos. */
export function parseWeightList(text: string): number[] {
  return text
    .split(/[\s;]+/)
    .map(part => parseFloat(part.replace(',', '.')))
    .filter(weight => Number.isFinite(weight) && weight > 0);
}

/** "De 5 a 100 kg, de 5 en 5" o "4,5 · 9 · 13,5 … 54 kg (12 pesos)". */
export function describeStack(stack: WeightStack): string {
  const weights = stackWeights(stack);
  if (!weights.length) return 'Sin pesos válidos';
  if (stack.kind === 'steps') {
    return `De ${formatWeight(weights[0])} a ${formatWeight(
      weights[weights.length - 1],
    )} kg, de ${formatWeight(stack.step)} en ${formatWeight(stack.step)}`;
  }
  const shown =
    weights.length <= 6
      ? weights.map(formatWeight).join(' · ')
      : `${weights.slice(0, 3).map(formatWeight).join(' · ')} … ${formatWeight(
          weights[weights.length - 1],
        )}`;
  return `${shown} kg (${weights.length} pesos)`;
}
