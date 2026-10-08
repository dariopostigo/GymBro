import AsyncStorage from '@react-native-async-storage/async-storage';
import { canonicalExerciseId } from '../data/exerciseCatalog';
import { SPLIT_PRESETS } from '../data/splitPresets';
import type {
  ActiveSplitState,
  DayOverrides,
  SlotOverride,
  Split,
  SplitDay,
} from '../types/routine';

const SPLITS_KEY = 'gymbro:splits';
const ACTIVE_SPLIT_KEY = 'gymbro:activeSplit';
const DAY_OVERRIDES_KEY = 'gymbro:dayOverrides';
const RECOMMENDED_SPLIT_MIGRATION_KEY = 'gymbro:migration:pplHypertrophyActive';

function withCanonicalIds(day: SplitDay): SplitDay {
  return {
    ...day,
    exercises: day.exercises.map(slot => ({
      ...slot,
      exerciseId: canonicalExerciseId(slot.exerciseId),
    })),
  };
}

/** El día tal y como viene en el código, para "restaurar el día original". */
export function presetDay(splitId: string, dayId: string): SplitDay | undefined {
  return SPLIT_PRESETS.find(s => s.id === splitId)?.days.find(d => d.id === dayId);
}

/**
 * Las rutinas predefinidas salen del código, para que las mejoras lleguen solas,
 * salvo los días que el usuario ha editado (`customized`), que se respetan.
 */
export function mergeSplits(stored: Split[]): Split[] {
  const storedById = new Map(stored.map(s => [s.id, s]));
  const presets = SPLIT_PRESETS.map(preset => {
    const saved = storedById.get(preset.id);
    return {
      ...preset,
      days: preset.days.map(day => {
        const savedDay = saved?.days.find(d => d.id === day.id);
        return savedDay?.customized ? withCanonicalIds(savedDay) : day;
      }),
    };
  });
  const presetIds = new Set(SPLIT_PRESETS.map(s => s.id));
  const customSplits = stored
    .filter(s => !presetIds.has(s.id))
    .map(s => ({ ...s, days: s.days.map(withCanonicalIds) }));
  return [...presets, ...customSplits];
}

export async function loadSplits(): Promise<Split[]> {
  const raw = await AsyncStorage.getItem(SPLITS_KEY);
  const merged = mergeSplits(raw ? (JSON.parse(raw) as Split[]) : []);
  await AsyncStorage.setItem(SPLITS_KEY, JSON.stringify(merged));
  return merged;
}

export async function saveSplits(splits: Split[]): Promise<void> {
  await AsyncStorage.setItem(SPLITS_KEY, JSON.stringify(splits));
}

/**
 * Migración única (8/10/2026): el PPL de hipertrofia pasa a ser el split activo,
 * empezando por Push A. Después se puede cambiar con normalidad desde el menú.
 */
export async function migrateToRecommendedSplit(): Promise<void> {
  if (await AsyncStorage.getItem(RECOMMENDED_SPLIT_MIGRATION_KEY)) return;
  await saveActiveSplit({ splitId: 'ppl', currentDayIndex: 0 });
  await AsyncStorage.setItem(RECOMMENDED_SPLIT_MIGRATION_KEY, '1');
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
