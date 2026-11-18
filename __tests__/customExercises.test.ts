/**
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CATEGORY_REFS,
  FIRST_CUSTOM_EXERCISE_ID,
  MUSCLES,
  allExercises,
  defaultRepRange,
  getExerciseById,
  isBodyweight,
  isCustomExercise,
  isTimed,
  isUnilateral,
  nextCustomExerciseId,
  setCustomExercises,
} from '../src/data/exerciseCatalog';
import { createBackup, importBackup, parseBackup } from '../src/storage/backup';
import {
  loadCustomExercises,
  loadLastCustomExerciseId,
  saveCustomExercises,
} from '../src/storage/customExerciseStorage';
import type { BackupFile } from '../src/storage/backup';
import type { CustomExercise } from '../src/types/exercise';

const ID = FIRST_CUSTOM_EXERCISE_ID;

const custom = (patch: Partial<CustomExercise> = {}): CustomExercise => ({
  id: ID,
  uuid: `custom-${ID}`,
  name: 'Plancha con disco en la espalda',
  description: '',
  category: CATEGORY_REFS.get('Abdominales')!,
  musclesPrimary: MUSCLES.filter(m => m.id === 6),
  musclesSecondary: [],
  equipment: [],
  images: [],
  videos: [],
  ...patch,
});

beforeEach(async () => {
  setCustomExercises([]);
  await AsyncStorage.clear();
});

test('un ejercicio propio se encuentra como los del catálogo, con sus marcas', () => {
  expect(getExerciseById(ID)).toBeUndefined();
  setCustomExercises([custom({ bodyweight: true, timed: true })]);
  expect(getExerciseById(ID)?.name).toBe('Plancha con disco en la espalda');
  expect(isCustomExercise(ID)).toBe(true);
  expect(isCustomExercise(475)).toBe(false);
  expect(isBodyweight(ID)).toBe(true);
  expect(isTimed(ID)).toBe(true);
  expect(isUnilateral(ID)).toBe(false);
  expect(defaultRepRange(ID)).toEqual({ targetRepsMin: 30, targetRepsMax: 60 });
  // En los buscadores, los propios primero.
  expect(allExercises()[0].id).toBe(ID);
});

test('las categorías y los músculos para elegir salen del catálogo', () => {
  expect(CATEGORY_REFS.get('Pecho')).toEqual({ id: 11, name: 'Pecho' });
  expect(MUSCLES.find(m => m.id === 4)?.name).toBe('Pecho');
  expect(new Set(MUSCLES.map(m => m.id)).size).toBe(MUSCLES.length);
});

test('la copia de seguridad lleva los ejercicios propios y los restaura', async () => {
  await AsyncStorage.setItem('gymbro:customExercises', JSON.stringify([custom()]));
  const backup = await createBackup();
  expect(backup.data.customExercises).toEqual([custom()]);
  expect(parseBackup(JSON.stringify(backup))).toEqual(backup);

  await AsyncStorage.clear();
  await importBackup(backup);
  expect(await loadCustomExercises()).toEqual([custom()]);
});

test('una copia antigua sin ejercicios propios no borra los que hay', async () => {
  await AsyncStorage.setItem('gymbro:customExercises', JSON.stringify([custom()]));
  const old = await createBackup();
  await importBackup({ ...old, data: { ...old.data, customExercises: undefined } } as BackupFile);
  expect(await loadCustomExercises()).toEqual([custom()]);
});

test('el nombre de la foto sale de su ruta, sea del móvil que sea', () => {
  const { customExercisePhotoName } = require('../src/storage/customExercisePhotos');
  expect(
    customExercisePhotoName('file:///data/user/0/com.gymbro.app/files/custom-exercises/1731.jpg'),
  ).toBe('1731.jpg');
  expect(
    customExercisePhotoName('file:///data/user/0/app.tubro.gym/files/custom-exercises/a%20b.png'),
  ).toBe('a b.png');
  expect(customExercisePhotoName('https://ejemplo.com/foto.jpg')).toBeNull();
});

test('el id de un ejercicio propio borrado no se vuelve a dar', async () => {
  expect(nextCustomExerciseId(0, [])).toBe(ID);
  expect(nextCustomExerciseId(0, [{ id: ID }, { id: ID + 1 }])).toBe(ID + 2);
  // Se borró el ID + 2: el siguiente es el ID + 3, no otra vez el ID + 2
  expect(nextCustomExerciseId(ID + 2, [{ id: ID }, { id: ID + 1 }])).toBe(ID + 3);
  // Una copia importada con ids más altos manda
  expect(nextCustomExerciseId(ID + 2, [{ id: ID + 9 }])).toBe(ID + 10);

  expect(await loadLastCustomExerciseId()).toBe(0);
  await saveCustomExercises([custom()], ID + 2);
  await saveCustomExercises([]);
  expect(await loadLastCustomExerciseId()).toBe(ID + 2);
});
