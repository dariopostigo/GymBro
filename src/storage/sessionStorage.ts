import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WorkoutSession } from '../types/session';

const SESSIONS_KEY = 'gymbro:sessions';

export async function loadSessions(): Promise<WorkoutSession[]> {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY);
  return raw ? (JSON.parse(raw) as WorkoutSession[]) : [];
}

export async function saveSessions(sessions: WorkoutSession[]): Promise<void> {
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}
