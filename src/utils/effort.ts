/**
 * Esfuerzo de cada serie. Se guarda siempre como RIR (repeticiones que
 * quedaban en reserva); el RPE es la misma escala vista al revés
 * (RPE = 10 - RIR), así que cambiar de una a otra en Ajustes no pierde nada.
 */
export type EffortMode = 'off' | 'rir' | 'rpe';

/** Valores de RIR que se pueden elegir; el último significa "ese o más". */
export const RIR_OPTIONS = [0, 1, 2, 3, 4] as const;
const MAX_RIR = RIR_OPTIONS[RIR_OPTIONS.length - 1];

/** Con este RIR o más en todas las series, el peso se ha quedado ligero. */
export const EASY_RIR = 3;

/** Texto corto del botón: "0".."4+" en RIR, "10".."6-" en RPE. */
export function effortOption(rir: number, mode: EffortMode): string {
  const isMax = rir >= MAX_RIR;
  if (mode === 'rpe') return `${10 - Math.min(rir, MAX_RIR)}${isMax ? '-' : ''}`;
  return `${Math.min(rir, MAX_RIR)}${isMax ? '+' : ''}`;
}

/** "RIR 2" o "RPE 8", para la lista de series. */
export function effortLabel(rir: number, mode: EffortMode): string {
  return `${mode === 'rpe' ? 'RPE' : 'RIR'} ${effortOption(rir, mode)}`;
}

/** Qué significa cada nivel, en palabras. */
export function effortDescription(rir: number): string {
  if (rir <= 0) return 'Al fallo: no salía ni una más';
  if (rir === 1) return 'Quedaba 1 repetición';
  if (rir === 2) return 'Quedaban 2 repeticiones';
  if (rir === 3) return 'Quedaban 3: cómodo';
  return 'Quedaban 4 o más: muy fácil';
}
