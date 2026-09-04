import AsyncStorage from '@react-native-async-storage/async-storage';
import { SPLIT_PRESETS } from '../data/splitPresets';
import type { ActiveSplitState, Split } from '../types/routine';

const SPLITS_KEY = 'gymbro:splits';
const ACTIVE_SPLIT_KEY = 'gymbro:activeSplit';

export async function loadSplits(): Promise<Split[]> {
  const raw = await AsyncStorage.getItem(SPLITS_KEY);
  const presetIds = new Set(SPLIT_PRESETS.map(s => s.id));
  const customSplits = raw ? (JSON.parse(raw) as Split[]).filter(s => !presetIds.has(s.id)) : [];
  const merged = [...SPLIT_PRESETS, ...customSplits];
  await AsyncStorage.setItem(SPLITS_KEY, JSON.stringify(merged));
  return merged;
}

export async function saveSplits(splits: Split[]): Promise<void> {
  await AsyncStorage.setItem(SPLITS_KEY, JSON.stringify(splits));
}

export async function loadActiveSplit(): Promise<ActiveSplitState | null> {
  const raw = await AsyncStorage.getItem(ACTIVE_SPLIT_KEY);
  return raw ? (JSON.parse(raw) as ActiveSplitState) : null;
}

export async function saveActiveSplit(state: ActiveSplitState | null): Promise<void> {
  if (state === null) {
    await AsyncStorage.removeItem(ACTIVE_SPLIT_KEY);
    return;
  }
  await AsyncStorage.setItem(ACTIVE_SPLIT_KEY, JSON.stringify(state));
}
