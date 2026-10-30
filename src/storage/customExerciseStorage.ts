import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CustomExercise } from '../types/exercise';

const CUSTOM_EXERCISES_KEY = 'gymbro:customExercises';

export async function loadCustomExercises(): Promise<CustomExercise[]> {
  const raw = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
  return raw ? (JSON.parse(raw) as CustomExercise[]) : [];
}

export async function saveCustomExercises(exercises: CustomExercise[]): Promise<void> {
  await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(exercises));
}
