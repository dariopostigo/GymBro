import AsyncStorage from '@react-native-async-storage/async-storage';
import { canonicalExerciseId } from '../data/exerciseCatalog';

const FAVORITES_KEY = 'gymbro:favoriteExercises';

export async function loadFavoriteExerciseIds(): Promise<number[]> {
  const raw = await AsyncStorage.getItem(FAVORITES_KEY);
  return raw ? (JSON.parse(raw) as number[]).map(canonicalExerciseId) : [];
}

export async function saveFavoriteExerciseIds(ids: number[]): Promise<void> {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}
