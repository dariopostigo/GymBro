import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBackup, importBackup, parseBackup } from '../src/storage/backup';
import { DEFAULT_WEIGHT_STACKS } from '../src/data/defaultWeightStacks';
import { getExerciseById } from '../src/data/exerciseCatalog';
import {
  loadWeightStacks,
  resolveStack,
  saveWeightStacks,
} from '../src/storage/weightStackStorage';
import { suggestNextLoad } from '../src/utils/progression';
import {
  describeStack,
  nextWeightUp,
  parseWeightList,
  stackWeights,
  stepWeight,
} from '../src/utils/weightStack';

const STEPS = { kind: 'steps', start: 5, step: 5, max: 50 } as const;
const ODD = stackWeights({ kind: 'list', weights: [4.5, 9, 13.5, 18, 22.5] });

describe('pilas de pesos', () => {
  test('genera los pesos por saltos fijos', () => {
    expect(stackWeights(STEPS)).toEqual([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);
    expect(stackWeights({ kind: 'steps', start: 2.5, step: 1.25, max: 5 })).toEqual([2.5, 3.75, 5]);
  });

  test('una pila mal escrita no genera pesos', () => {
    expect(stackWeights({ kind: 'steps', start: 5, step: 0, max: 50 })).toEqual([]);
    expect(stackWeights({ kind: 'steps', start: 50, step: 5, max: 10 })).toEqual([]);
  });

  test('lee la lista con comas decimales y la ordena sin repetir', () => {
    expect(parseWeightList('9 4,5;  13.5\n9')).toEqual([9, 4.5, 13.5, 9]);
    expect(stackWeights({ kind: 'list', weights: [9, 4.5, 13.5, 9] })).toEqual([4.5, 9, 13.5]);
  });

  test('sube y baja por la pila, también desde un peso que no está en ella', () => {
    expect(nextWeightUp(ODD, 9)).toBe(13.5);
    expect(nextWeightUp(ODD, 22.5)).toBeUndefined();
    expect(stepWeight(ODD, 10, 1)).toBe(13.5);
    expect(stepWeight(ODD, 10, -1)).toBe(9);
    expect(stepWeight(ODD, 4.5, -1)).toBe(4.5);
    expect(stepWeight(ODD, NaN, 1)).toBe(4.5);
  });

  test('describe la pila', () => {
    expect(describeStack(STEPS)).toBe('De 5 a 50 kg, de 5 en 5');
    expect(describeStack({ kind: 'list', weights: [4.5, 9, 13.5] })).toBe(
      '4,5 · 9 · 13,5 kg (3 pesos)',
    );
  });
});

describe('sugerencia con la pila de la máquina', () => {
  const TARGET = { sets: 3, repsMin: 8, repsMax: 12 };
  const atMax = [13.5, 13.5, 13.5].map(weight => ({ weight, reps: 12 }));

  test('sube al siguiente peso que existe, no suma el incremento', () => {
    expect(suggestNextLoad(atMax, TARGET, 2.5, ODD)).toMatchObject({ weight: 18, increase: true });
  });

  test('en el tope de la pila no propone subir', () => {
    const top = [22.5, 22.5, 22.5].map(weight => ({ weight, reps: 12 }));
    expect(suggestNextLoad(top, TARGET, 2.5, ODD)).toMatchObject({ weight: 22.5, increase: false });
  });
});

describe('copia de seguridad', () => {
  beforeEach(() => AsyncStorage.clear());

  test('lleva los pesos de las máquinas', async () => {
    await saveWeightStacks({ 1725: STEPS });
    const backup = await createBackup();
    expect(parseBackup(JSON.stringify(backup)).data.weightStacks).toEqual({ 1725: STEPS });
  });

  test('una copia antigua sin pesos no borra los que hay', async () => {
    const old = await createBackup();
    delete old.data.weightStacks;
    await saveWeightStacks({ 1725: STEPS });
    await importBackup(old);
    expect(await loadWeightStacks()).toEqual({ 1725: STEPS });
  });
});

describe('pesos por defecto', () => {
  const REMO_PLACAS = 1725;
  const REMO_DISCOS = 90026;

  test('las máquinas de placas y las poleas traen pila; las de discos no', () => {
    expect(resolveStack({}, REMO_PLACAS)).toEqual({
      stack: DEFAULT_WEIGHT_STACKS[REMO_PLACAS],
      source: 'default',
    });
    expect(resolveStack({}, REMO_DISCOS)).toEqual({ source: 'none' });
  });

  test('lo guardado a mano manda, y null deja la máquina sin pila', () => {
    expect(resolveStack({ [REMO_PLACAS]: STEPS }, REMO_PLACAS)).toEqual({
      stack: STEPS,
      source: 'custom',
    });
    expect(resolveStack({ [REMO_PLACAS]: null }, REMO_PLACAS)).toEqual({ source: 'none' });
  });

  test('todas las pilas por defecto son de ejercicios que existen y dan pesos', () => {
    for (const [id, stack] of Object.entries(DEFAULT_WEIGHT_STACKS)) {
      expect(getExerciseById(Number(id))).toBeDefined();
      expect(stackWeights(stack).length).toBeGreaterThan(0);
    }
  });
});
