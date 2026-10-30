/**
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EXERCISES,
  canonicalExerciseId,
  defaultBackupId,
  getExerciseById,
} from '../src/data/exerciseCatalog';
import { DEFAULT_BACKUPS } from '../src/data/exerciseBackups';
import { loadSessions } from '../src/storage/sessionStorage';
import { loadDayOverrides, mergeSplits } from '../src/storage/routineStorage';
import { loadFavoriteExerciseIds } from '../src/storage/favoritesStorage';
import exerciseMerges from '../src/data/exerciseMerges.json';

const merges = Object.entries(exerciseMerges).map(([from, to]) => [Number(from), to] as const);
const ids = new Set(EXERCISES.map(e => e.id));

describe('ejercicios duplicados fusionados', () => {
  it('quita del catálogo los que sobran y conserva a dónde apuntan', () => {
    for (const [from, to] of merges) {
      expect(ids.has(from)).toBe(false);
      expect(ids.has(to)).toBe(true);
    }
  });

  it('resuelve los ids antiguos al ejercicio que se quedó', () => {
    for (const [from, to] of merges) {
      expect(canonicalExerciseId(from)).toBe(to);
      expect(getExerciseById(from)?.id).toBe(to);
    }
  });

  it('pasa al id nuevo lo guardado con el antiguo', async () => {
    await AsyncStorage.setItem(
      'gymbro:sessions',
      JSON.stringify([{ id: 's', date: '', splitId: 'a', splitDayId: 'b', dayName: '', completed: true, sets: [{ id: 'x', exerciseId: 1292, positionInSession: 1, setNumber: 1, weight: 0, reps: 8 }] }]),
    );
    await AsyncStorage.setItem('gymbro:dayOverrides', JSON.stringify({ 'a:b': { slot: 135, other: { targetSets: 3 } } }));
    await AsyncStorage.setItem('gymbro:favoriteExercises', JSON.stringify([1094, 73]));

    expect((await loadSessions())[0].sets[0].exerciseId).toBe(152);
    expect(await loadDayOverrides()).toEqual({ 'a:b': { slot: { exerciseId: 926 }, other: { targetSets: 3 } } });
    expect(await loadFavoriteExerciseIds()).toEqual([129, 73]);
  });

  it('también pasa al id nuevo el plan B de un hueco', () => {
    const [split] = mergeSplits([
      {
        id: 'mio',
        name: 'Mío',
        type: 'custom',
        days: [
          {
            id: 'd',
            name: 'Día',
            order: 0,
            exercises: [
              { id: 's', exerciseId: 73, order: 0, targetSets: 3, targetRepsMin: 8, targetRepsMax: 12, backupExerciseId: 1094 },
            ],
          },
        ],
      },
    ]).filter(s => s.id === 'mio');
    expect(split.days[0].exercises[0].backupExerciseId).toBe(129);
  });
});

describe('plan B por defecto', () => {
  it('todos los ejercicios del catálogo tienen uno, que existe y es otro ejercicio', () => {
    for (const exercise of EXERCISES) {
      const backup = defaultBackupId(exercise.id);
      expect(backup).toBeDefined();
      expect(backup).not.toBe(exercise.id);
      expect(getExerciseById(backup!)).toBeDefined();
    }
  });

  it('no hay entradas de ejercicios que ya no existen', () => {
    const missing = Object.keys(DEFAULT_BACKUPS)
      .map(Number)
      .filter(id => !getExerciseById(id));
    expect(missing).toEqual([]);
  });

  it('las máquinas de placas y de discos son plan B la una de la otra', () => {
    const PLACAS = 1725; // Remo sentado en máquina de placas
    const DISCOS = 90026; // Remo sentado en máquina de discos
    expect(defaultBackupId(PLACAS)).toBe(DISCOS);
    expect(defaultBackupId(DISCOS)).toBe(PLACAS);
  });

  it('resuelve los ids fusionados', () => {
    // 275 (curl martillo en polea duplicado) se fusionó en 90021.
    expect(defaultBackupId(275)).toBe(defaultBackupId(90021));
  });
});
