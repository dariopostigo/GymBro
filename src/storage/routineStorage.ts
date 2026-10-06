import AsyncStorage from '@react-native-async-storage/async-storage';
import { canonicalExerciseId } from '../data/exerciseCatalog';
import { SPLIT_PRESETS } from '../data/splitPresets';
import type { ActiveSplitState, DayOverrides, SlotOverride, Split } from '../types/routine';

const SPLITS_KEY = 'gymbro:splits';
const ACTIVE_SPLIT_KEY = 'gymbro:activeSplit';
const DAY_OVERRIDES_KEY = 'gymbro:dayOverrides';

export async function loadSplits(): Promise<Split[]> {
  const raw = await AsyncStorage.getItem(SPLITS_KEY);
  const presetIds = new Set(SPLIT_PRESETS.map(s => s.id));
  const customSplits = raw
    ? (JSON.parse(raw) as Split[])
        .filter(s => !presetIds.has(s.id))
        .map(s => ({
          ...s,
          days: s.days.map(d => ({
            ...d,
            exercises: d.exercises.map(slot => ({ ...slot, exerciseId: canonicalExerciseId(slot.exerciseId) })),
          })),
        }))
    : [];
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

export async function loadDayOverrides(): Promise<DayOverrides> {
  const raw = await AsyncStorage.getItem(DAY_OVERRIDES_KEY);
  if (!raw) return {};
  const stored = JSON.parse(raw) as Record<string, Record<string, SlotOverride | number>>;
  // La primera versión guardaba solo el exerciseId como número suelto.
  const toOverride = (value: SlotOverride | number): SlotOverride => {
    const override = typeof value === 'number' ? { exerciseId: value } : value;
    return override.exerciseId === undefined
      ? override
      : { ...override, exerciseId: canonicalExerciseId(override.exerciseId) };
  };
  return Object.fromEntries(
    Object.entries(stored).map(([dayKey, slots]) => [
      dayKey,
      Object.fromEntries(
        Object.entries(slots).map(([slotId, value]) => [slotId, toOverride(value)]),
      ),
    ]),
  );
}

export async function saveDayOverrides(overrides: DayOverrides): Promise<void> {
  await AsyncStorage.setItem(DAY_OVERRIDES_KEY, JSON.stringify(overrides));
}
