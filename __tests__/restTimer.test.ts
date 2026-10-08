import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, loadSettings } from '../src/storage/settingsStorage';
import {
  MAX_REST,
  MIN_REST,
  adjustRest,
  formatRest,
  remainingMs,
  restForReps,
  restForSlot,
  restProgress,
  startRest,
} from '../src/utils/restTimer';
import { SPLIT_PRESETS } from '../src/data/splitPresets';

const NOW = 1_000_000;

test('el descanso termina a los segundos pedidos y respeta los límites', () => {
  expect(startRest(90, NOW)).toEqual({ endsAt: NOW + 90_000, duration: 90 });
  expect(startRest(1, NOW).duration).toBe(MIN_REST);
  expect(startRest(10_000, NOW).duration).toBe(MAX_REST);
});

test('el tiempo restante sale de la hora de fin y no baja de cero', () => {
  const timer = startRest(60, NOW);
  expect(remainingMs(timer, NOW + 15_000)).toBe(45_000);
  expect(restProgress(timer, NOW + 15_000)).toBeCloseTo(0.25);
  expect(remainingMs(timer, NOW + 120_000)).toBe(0);
});

test('sumar y restar tiempo mueve el final; si no queda tiempo, el descanso acaba', () => {
  const timer = startRest(60, NOW);
  expect(adjustRest(timer, 15, NOW)).toEqual({ endsAt: NOW + 75_000, duration: 75 });
  expect(adjustRest(timer, -15, NOW)).toEqual({ endsAt: NOW + 45_000, duration: 45 });
  expect(adjustRest(timer, -15, NOW + 50_000)).toBeNull();
});

test('la cuenta atrás redondea hacia arriba', () => {
  expect(formatRest(90_000)).toBe('1:30');
  expect(formatRest(64_200)).toBe('1:05');
  expect(formatRest(400)).toBe('0:01');
  expect(formatRest(0)).toBe('0:00');
});

test('los ajustes guardados se completan con los valores por defecto', async () => {
  await AsyncStorage.setItem('gymbro:settings', JSON.stringify({ restTimerEnabled: false }));
  expect(await loadSettings()).toEqual({ ...DEFAULT_SETTINGS, restTimerEnabled: false });
});

test('el descanso automático sale del mínimo del rango de reps', () => {
  expect([6, 7, 8, 9, 10, 11, 12, 15].map(restForReps)).toEqual([
    150, 150, 120, 120, 90, 90, 60, 60,
  ]);
});

test('el descanso elegido a mano manda sobre el automático', () => {
  expect(restForSlot({ targetRepsMin: 12 })).toBe(60);
  expect(restForSlot({ targetRepsMin: 12, restSeconds: 105 })).toBe(105);
});

test('en el PPL los básicos descansan más que los aislamientos', () => {
  const pushA = SPLIT_PRESETS.find(s => s.id === 'ppl')!.days[0].exercises;
  // Press inclinado (6-10), press en máquina (8-12), tríceps (10-12) y laterales (12-15).
  expect([0, 1, 5, 3].map(i => restForSlot(pushA[i]))).toEqual([150, 120, 90, 60]);
});
