/**
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXERCISES, canonicalExerciseId, getExerciseById } from '../src/data/exerciseCatalog';
import { loadSessions } from '../src/storage/sessionStorage';
import { loadDayOverrides } from '../src/storage/routineStorage';
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
});
