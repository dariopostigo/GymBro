import type { EffortMode } from '../utils/effort';
import { DEFAULT_BAR_WEIGHTS, DEFAULT_PLATES, type BarWeights } from '../utils/plates';
import type { RestTimer } from '../utils/restTimer';
import { inTransaction, withDb } from './db';
import { KV } from './legacyImport';
import { readKv, writeKv } from './rows';

export interface Settings {
  restTimerEnabled: boolean;
  /** El descanso depende de cada ejercicio (ver `restForSlot`) en vez de ser fijo. */
  autoRest: boolean;
  /** Duración por defecto del descanso, en segundos. */
  restSeconds: number;
  /** Pantalla encendida mientras se está en la pestaña Hoy. */
  keepScreenOn: boolean;
  /** Kilos que se suben al completar todas las series al máximo de reps. */
  weightIncrement: number;
  /** Apuntar el esfuerzo de cada serie como RIR, como RPE o no apuntarlo. */
  effortMode: EffortMode;
  /** Discos que hay en el gimnasio, para la calculadora de discos. */
  plates: number[];
  barWeights: BarWeights;
  /** Días por semana que cuentan para la racha (semanas seguidas cumpliéndolo). */
  weeklyGoal: number;
}

export const DEFAULT_SETTINGS: Settings = {
  restTimerEnabled: true,
  autoRest: true,
  restSeconds: 90,
  keepScreenOn: true,
  weightIncrement: 2.5,
  effortMode: 'rir',
  plates: DEFAULT_PLATES,
  barWeights: DEFAULT_BAR_WEIGHTS,
  weeklyGoal: 3,
};

export const WEIGHT_INCREMENTS = [1, 1.25, 2.5, 5];

export async function loadSettings(): Promise<Settings> {
  const raw = await withDb(db => readKv(db, KV.settings));
  // Los ajustes nuevos que no estaban guardados toman su valor por defecto.
  return raw
    ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
    : DEFAULT_SETTINGS;
}

export function saveSettings(settings: Settings): Promise<void> {
  return inTransaction(tx => writeKv(tx, KV.settings, JSON.stringify(settings)));
}

export async function loadRestTimer(): Promise<RestTimer | null> {
  const raw = await withDb(db => readKv(db, KV.restTimer));
  return raw ? (JSON.parse(raw) as RestTimer) : null;
}

export function saveRestTimer(timer: RestTimer | null): Promise<void> {
  return inTransaction(tx => writeKv(tx, KV.restTimer, timer && JSON.stringify(timer)));
}
