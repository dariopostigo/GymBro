/**
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadDayOverrides, saveDayOverrides } from '../src/storage/routineStorage';
import type { DayOverrides } from '../src/types/routine';

const KEY = 'gymbro:dayOverrides';
const DAY = 'ppl:ppl-push-1';
const SLOT = 'slot-73-0';

beforeEach(async () => {
  await AsyncStorage.removeItem(KEY);
});

test('sin nada guardado no hay ajustes de hoy', async () => {
  expect(await loadDayOverrides()).toEqual({});
});

test('los ajustes de hoy sobreviven al guardado', async () => {
  const overrides: DayOverrides = {
    [DAY]: { [SLOT]: { exerciseId: 919, targetSets: 5 } },
  };

  await saveDayOverrides(overrides);

  expect(await loadDayOverrides()).toEqual(overrides);
});

test('un ajuste solo de series se guarda sin tocar el ejercicio', async () => {
  await saveDayOverrides({ [DAY]: { [SLOT]: { targetSets: 2 } } });

  const loaded = await loadDayOverrides();
  expect(loaded[DAY][SLOT]).toEqual({ targetSets: 2 });
  expect(loaded[DAY][SLOT].exerciseId).toBeUndefined();
});

test('el formato antiguo (solo el id del ejercicio) se migra al leer', async () => {
  await AsyncStorage.setItem(KEY, JSON.stringify({ [DAY]: { [SLOT]: 919 } }));

  expect(await loadDayOverrides()).toEqual({ [DAY]: { [SLOT]: { exerciseId: 919 } } });
});

test('un ejercicio añadido solo para hoy se guarda y resuelve su id si se fusionó', async () => {
  const EXTRA = 'extra-1';
  await saveDayOverrides({
    [DAY]: { [EXTRA]: { exerciseId: 275, targetSets: 3, extra: { repsMin: 8, repsMax: 12 } } },
  });

  // 275 (curl martillo en polea duplicado) se fusionó en 90021.
  expect((await loadDayOverrides())[DAY][EXTRA]).toEqual({
    exerciseId: 90021,
    targetSets: 3,
    extra: { repsMin: 8, repsMax: 12 },
  });
});
