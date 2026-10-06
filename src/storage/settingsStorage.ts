import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RestTimer } from '../utils/restTimer';

const SETTINGS_KEY = 'gymbro:settings';
const REST_TIMER_KEY = 'gymbro:restTimer';

export interface Settings {
  restTimerEnabled: boolean;
  /** Duración por defecto del descanso, en segundos. */
  restSeconds: number;
  /** Pantalla encendida mientras se está en la pestaña Hoy. */
  keepScreenOn: boolean;
  /** Kilos que se suben al completar todas las series al máximo de reps. */
  weightIncrement: number;
}

export const DEFAULT_SETTINGS: Settings = {
  restTimerEnabled: true,
  restSeconds: 90,
  keepScreenOn: true,
  weightIncrement: 2.5,
};

export const WEIGHT_INCREMENTS = [1, 1.25, 2.5, 5];

export async function loadSettings(): Promise<Settings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  // Los ajustes nuevos que no estaban guardados toman su valor por defecto.
  return raw
    ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
    : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function loadRestTimer(): Promise<RestTimer | null> {
  const raw = await AsyncStorage.getItem(REST_TIMER_KEY);
  return raw ? (JSON.parse(raw) as RestTimer) : null;
}

export async function saveRestTimer(timer: RestTimer | null): Promise<void> {
  if (timer === null) {
    await AsyncStorage.removeItem(REST_TIMER_KEY);
    return;
  }
  await AsyncStorage.setItem(REST_TIMER_KEY, JSON.stringify(timer));
}
