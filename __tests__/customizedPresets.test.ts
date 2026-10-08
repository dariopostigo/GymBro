import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPLIT_PRESETS } from '../src/data/splitPresets';
import { createBackup, describeBackup } from '../src/storage/backup';
import {
  loadActiveSplit,
  loadSplits,
  mergeSplits,
  migrateToRecommendedSplit,
  presetDay,
  saveActiveSplit,
} from '../src/storage/routineStorage';
import type { Split } from '../src/types/routine';

const preset = SPLIT_PRESETS.find(s => s.id === 'ppl')!;
const [pushA, pullA] = preset.days;

/** La rutina predefinida guardada con Push A editado (un ejercicio menos, descanso a mano). */
const edited: Split = {
  ...preset,
  days: preset.days.map(day =>
    day.id === pushA.id
      ? {
          ...day,
          customized: true,
          exercises: day.exercises.slice(1).map(slot => ({ ...slot, restSeconds: 75 })),
        }
      : // Un día guardado sin marcar como editado: manda el código.
        { ...day, exercises: [] },
  ),
};

beforeEach(() => AsyncStorage.clear());

test('los días personalizados se respetan y el resto sale del código', () => {
  const merged = mergeSplits([edited]).find(s => s.id === 'ppl')!;
  const mergedPushA = merged.days.find(d => d.id === pushA.id)!;
  expect(mergedPushA.customized).toBe(true);
  expect(mergedPushA.exercises).toHaveLength(pushA.exercises.length - 1);
  expect(mergedPushA.exercises[0].restSeconds).toBe(75);
  expect(merged.days.find(d => d.id === pullA.id)).toEqual(pullA);
});

test('los cambios en una rutina predefinida sobreviven a reiniciar la app', async () => {
  await AsyncStorage.setItem('gymbro:splits', JSON.stringify([edited]));
  const loaded = (await loadSplits()).find(s => s.id === 'ppl')!;
  expect(loaded.days[0].exercises).toHaveLength(pushA.exercises.length - 1);
  // Y siguen ahí en la siguiente carga.
  const again = (await loadSplits()).find(s => s.id === 'ppl')!;
  expect(again.days[0].customized).toBe(true);
});

test('restaurar usa el día tal y como viene en el código', () => {
  expect(presetDay('ppl', pushA.id)).toEqual(pushA);
  expect(presetDay('mio', 'dia')).toBeUndefined();
});

test('la copia de seguridad incluye las rutinas predefinidas personalizadas', async () => {
  const own: Split = { id: 'mine', name: 'Mío', type: 'custom', days: [] };
  await AsyncStorage.setItem('gymbro:splits', JSON.stringify([edited, own]));
  const backup = await createBackup();
  expect(backup.data.splits.map(s => s.id)).toEqual(['ppl', 'mine']);
  // En el resumen solo cuentan los splits propios.
  expect(describeBackup(backup)).toContain('1 split propio');
});

test('la migración deja el PPL como split activo una sola vez', async () => {
  await saveActiveSplit({ splitId: 'upper-lower', currentDayIndex: 1 });
  await migrateToRecommendedSplit();
  expect(await loadActiveSplit()).toEqual({ splitId: 'ppl', currentDayIndex: 0 });

  // Si después se vuelve a elegir otro split, la migración no lo pisa.
  await saveActiveSplit({ splitId: 'upper-lower', currentDayIndex: 0 });
  await migrateToRecommendedSplit();
  expect(await loadActiveSplit()).toEqual({ splitId: 'upper-lower', currentDayIndex: 0 });
});
