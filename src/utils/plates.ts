import type { Exercise } from '../types/exercise';

/**
 * Calculadora de discos: qué poner en cada lado de la barra (o de la máquina
 * de discos) para llegar a un peso total.
 */
export type BarType = 'olympic' | 'ez' | 'smith' | 'machine';

/** Discos que suele haber en un gimnasio; en Ajustes se marcan los que hay. */
export const PLATE_OPTIONS = [25, 20, 15, 10, 5, 2.5, 2, 1.25, 1, 0.5];

export const DEFAULT_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

/** Peso de cada barra. Las máquinas de discos no tienen: solo cuentan los discos. */
export interface BarWeights {
  olympic: number;
  ez: number;
  smith: number;
}

export const DEFAULT_BAR_WEIGHTS: BarWeights = { olympic: 20, ez: 10, smith: 0 };

export const BAR_LABELS: Record<BarType, string> = {
  olympic: 'barra olímpica',
  ez: 'barra Z',
  smith: 'Smith',
  machine: 'máquina de discos',
};

export function barWeightFor(type: BarType, weights: BarWeights): number {
  return type === 'machine' ? 0 : weights[type];
}

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Máquinas que se cargan con discos (no tienen pila de pesos). */
const PLATE_MACHINE =
  /discos|prensa de piernas$|prensa de piernas cerrada|press de piernas abierto|hack|pendulo|v-squat|gemelos en prensa|remo en t con apoyo/;

/** Donde la regla por nombre y equipamiento se equivoca (`null`: no lleva discos). */
const BAR_OVERRIDES: Record<number, BarType | null> = {
  979: null, // Elevaciones de piernas en barra (la barra de colgarse)
  978: null, // Elevaciones de rodillas en barra
  41: null, // Rueda abdominal con barra
  1582: null, // Rotación interna tumbado de lado
  1604: null, // Zancada lateral deslizante
  1388: null, // Peso muerto rumano a una pierna
  50: 'ez', // Extensión de tríceps (con barra por encima de la cabeza)
  418: 'olympic', // Press militar
};

/**
 * Con qué se carga el ejercicio, o nada si no lleva discos (mancuernas,
 * poleas, máquinas de placas, peso corporal...).
 */
export function barTypeFor(exercise: Exercise | undefined): BarType | undefined {
  if (!exercise) return undefined;
  if (exercise.id in BAR_OVERRIDES) return BAR_OVERRIDES[exercise.id] ?? undefined;
  const name = normalize(exercise.name);
  // "Con barra" en la polea o el jalón es el agarre, no una barra con discos; el
  // landmine se carga por un solo extremo.
  if (/polea|cable|jalon|dominada|banda|kettlebell|landmine/.test(name)) return undefined;
  if (/smith|multipower/.test(name)) return 'smith';
  if (PLATE_MACHINE.test(name)) return 'machine';
  const equipment = exercise.equipment.map(e => e.id);
  if (/barra z|barra ez|press frances con barra/.test(name) || equipment.includes(2)) return 'ez';
  if (/mancuerna|maquina/.test(name)) return undefined;
  if (/barra|peso muerto|remo en t\b|remo pendlay|press militar$|buenos dias/.test(name)) {
    return 'olympic';
  }
  return equipment.includes(1) ? 'olympic' : undefined;
}

export interface PlateLoad {
  /** Discos de un lado, de mayor a menor. Vacío si va la barra sola. */
  perSide: number[];
  exact: boolean;
  /** Si no sale exacto: los totales más cercanos que sí salen. */
  lower?: number;
  upper?: number;
}

/** Los discos se cuentan en centésimas de kilo para no arrastrar decimales. */
const UNIT = 100;
const toUnits = (kg: number) => Math.round(kg * UNIT);
const toKg = (units: number) => units / UNIT;

/**
 * Discos por lado para `total` con una barra de `bar` kilos, usando los menos
 * discos posibles (hay de sobra de cada uno). Nada si `total` no llega a la
 * barra o no hay discos.
 */
export function plateLoad(total: number, bar: number, plates: number[]): PlateLoad | undefined {
  const sizes = [...new Set(plates.map(toUnits))].filter(p => p > 0).sort((a, b) => b - a);
  const perSideUnits = (toUnits(total) - toUnits(bar)) / 2;
  if (!sizes.length || !(perSideUnits >= 0)) return undefined;

  // fewest[w] = menos discos para sumar w en un lado; -1 si no se puede.
  const limit = Math.ceil(perSideUnits) + sizes[0];
  const fewest = new Array<number>(limit + 1).fill(-1);
  const lastPlate = new Array<number>(limit + 1).fill(0);
  fewest[0] = 0;
  for (let w = 1; w <= limit; w += 1) {
    for (const size of sizes) {
      if (
        size <= w &&
        fewest[w - size] >= 0 &&
        (fewest[w] < 0 || fewest[w - size] + 1 < fewest[w])
      ) {
        fewest[w] = fewest[w - size] + 1;
        lastPlate[w] = size;
      }
    }
  }

  const reachable = (w: number) => Number.isInteger(w) && w >= 0 && w <= limit && fewest[w] >= 0;
  if (reachable(perSideUnits)) {
    const perSide: number[] = [];
    for (let w = perSideUnits; w > 0; w -= lastPlate[w]) perSide.push(toKg(lastPlate[w]));
    return { perSide: perSide.sort((a, b) => b - a), exact: true };
  }

  const totalFor = (w: number) => toKg(toUnits(bar) + 2 * w);
  let lower: number | undefined;
  for (let w = Math.floor(perSideUnits); w >= 0; w -= 1) {
    if (reachable(w)) {
      lower = totalFor(w);
      break;
    }
  }
  let upper: number | undefined;
  for (let w = Math.ceil(perSideUnits); w <= limit; w += 1) {
    if (reachable(w)) {
      upper = totalFor(w);
      break;
    }
  }
  return { perSide: [], exact: false, lower, upper };
}
