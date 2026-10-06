import AsyncStorage from '@react-native-async-storage/async-storage';
import { canonicalExerciseId } from '../data/exerciseCatalog';
import type { WorkoutSession } from '../types/session';

const SESSIONS_KEY = 'gymbro:sessions';

export async function loadSessions(): Promise<WorkoutSession[]> {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY);
  if (!raw) return [];
  // El historial de un ejercicio duplicado se junta con el del que se quedó.
  return (JSON.parse(raw) as WorkoutSession[]).map(session => ({
    ...session,
    sets: session.sets.map(set => ({ ...set, exerciseId: canonicalExerciseId(set.exerciseId) })),
  }));
}

export async function saveSessions(sessions: WorkoutSession[]): Promise<void> {
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}
