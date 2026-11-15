import { canonicalExerciseId } from '../data/exerciseCatalog';
import { SPLIT_PRESETS } from '../data/splitPresets';
import type {
  ActiveSplitState,
  DayOverrides,
  SlotOverride,
  Split,
  SplitDay,
} from '../types/routine';
import { inTransaction, withDb } from './db';
import { KV } from './legacyImport';
import {
  readKv,
  readSplits,
  stableStringify,
  writeKv,
  writeSplits,
  type Executor,
} from './rows';

function withCanonicalIds(day: SplitDay): SplitDay {
  return {
    ...day,
    exercises: day.exercises.map(slot => ({
      ...slot,
      exerciseId: canonicalExerciseId(slot.exerciseId),
      ...(slot.backupExerciseId !== undefined && {
        backupExerciseId: canonicalExerciseId(slot.backupExerciseId),
      }),
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

export function loadSplits(): Promise<Split[]> {
  return withDb(async db => {
    const stored = await readSplits(db);
    const merged = mergeSplits(stored);
    // Se guarda lo combinado (como antes), pero solo si ha cambiado algo.
    if (stableStringify(merged) !== stableStringify(stored)) {
      await db.transaction(tx => writeSplits(tx, merged));
    }
    return merged;
  });
}

export function saveSplits(splits: Split[]): Promise<void> {
  return inTransaction(tx => writeSplits(tx, splits));
}

/**
 * Migración única (8/10/2026): el PPL de hipertrofia pasa a ser el split activo,
 * empezando por Push A. Después se puede cambiar con normalidad desde el menú.
 */
export function migrateToRecommendedSplit(): Promise<void> {
  return withDb(async db => {
    if (await readKv(db, KV.pplMigration)) return;
    await db.transaction(async tx => {
      await writeActiveSplit(tx, { splitId: 'ppl', currentDayIndex: 0 });
      await writeKv(tx, KV.pplMigration, '1');
    });
  });
}

export async function loadActiveSplit(): Promise<ActiveSplitState | null> {
  const raw = await withDb(db => readKv(db, KV.activeSplit));
  return raw ? (JSON.parse(raw) as ActiveSplitState) : null;
}

export const writeActiveSplit = (tx: Executor, state: ActiveSplitState | null) =>
  writeKv(tx, KV.activeSplit, state && JSON.stringify(state));

export function saveActiveSplit(state: ActiveSplitState | null): Promise<void> {
  return inTransaction(tx => writeActiveSplit(tx, state));
}

export async function loadDayOverrides(): Promise<DayOverrides> {
  const raw = await withDb(db => readKv(db, KV.dayOverrides));
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

export const writeDayOverrides = (tx: Executor, overrides: DayOverrides) =>
  writeKv(tx, KV.dayOverrides, JSON.stringify(overrides));

export function saveDayOverrides(overrides: DayOverrides): Promise<void> {
  return inTransaction(tx => writeDayOverrides(tx, overrides));
}
