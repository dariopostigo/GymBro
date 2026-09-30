import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { generateId } from '../utils/id';
import {
  loadActiveSplit,
  loadDayOverrides,
  loadSplits,
  saveActiveSplit,
  saveDayOverrides,
  saveSplits,
} from '../storage/routineStorage';
import type {
  ActiveSplitState,
  DayExerciseSlot,
  DayOverrides,
  SlotOverride,
  Split,
  SplitDay,
} from '../types/routine';

interface RoutineContextValue {
  loading: boolean;
  splits: Split[];
  activeSplit: Split | null;
  currentDay: SplitDay | null;
  currentDayIndex: number;
  selectSplit: (splitId: string) => Promise<void>;
  clearActiveSplit: () => Promise<void>;
  advanceToNextDay: () => Promise<void>;
  selectDay: (dayId: string) => Promise<void>;
  updateDayExercises: (splitId: string, dayId: string, exercises: DayExerciseSlot[]) => Promise<void>;
  createCustomSplit: (name: string, dayNames: string[]) => Promise<Split>;
  /** Cambios "solo por hoy" (ejercicio, series...): slotId → ajustes de ese día del split. */
  getDayOverrides: (splitId?: string, dayId?: string) => Record<string, SlotOverride>;
  /** Fusiona `patch` con el override del hueco. Un campo a `undefined` lo elimina. */
  setDayOverride: (
    splitId: string,
    dayId: string,
    slotId: string,
    patch: SlotOverride,
  ) => void;
  clearDayOverrides: (splitId: string, dayId: string) => void;
}

const RoutineContext = createContext<RoutineContextValue | null>(null);

const NO_OVERRIDES: Record<string, SlotOverride> = {};
const dayOverridesKey = (splitId: string, dayId: string) => `${splitId}:${dayId}`;

/** Quita las claves a `undefined` para no dejar overrides vacíos ocupando sitio. */
function prune(override: SlotOverride): SlotOverride {
  return Object.fromEntries(
    Object.entries(override).filter(([, value]) => value !== undefined),
  ) as SlotOverride;
}

export function RoutineProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [splits, setSplits] = useState<Split[]>([]);
  const [activeSplitState, setActiveSplitState] = useState<ActiveSplitState | null>(null);
  const [dayOverrides, setDayOverrides] = useState<DayOverrides>({});

  useEffect(() => {
    (async () => {
      const [loadedSplits, loadedActive, loadedOverrides] = await Promise.all([
        loadSplits(),
        loadActiveSplit(),
        loadDayOverrides(),
      ]);
      setSplits(loadedSplits);
      setActiveSplitState(loadedActive);
      setDayOverrides(loadedOverrides);
      setLoading(false);
    })();
  }, []);

  const activeSplit = useMemo(
    () => splits.find(s => s.id === activeSplitState?.splitId) ?? null,
    [splits, activeSplitState],
  );

  const currentDayIndex = activeSplitState?.currentDayIndex ?? 0;

  const currentDay = useMemo(() => {
    if (!activeSplit || activeSplit.days.length === 0) return null;
    return activeSplit.days[currentDayIndex % activeSplit.days.length];
  }, [activeSplit, currentDayIndex]);

  const getDayOverrides = useCallback(
    (splitId?: string, dayId?: string) =>
      splitId && dayId ? dayOverrides[dayOverridesKey(splitId, dayId)] ?? NO_OVERRIDES : NO_OVERRIDES,
    [dayOverrides],
  );

  const setDayOverride = useCallback(
    (splitId: string, dayId: string, slotId: string, patch: SlotOverride) => {
      setDayOverrides(prev => {
        const key = dayOverridesKey(splitId, dayId);
        const merged = prune({ ...prev[key]?.[slotId], ...patch });
        const slots = Object.fromEntries(
          Object.entries(prev[key] ?? {}).filter(([id]) => id !== slotId),
        );
        if (Object.keys(merged).length > 0) slots[slotId] = merged;
        const next = { ...prev, [key]: slots };
        saveDayOverrides(next);
        return next;
      });
    },
    [],
  );

  const clearDayOverrides = useCallback((splitId: string, dayId: string) => {
    setDayOverrides(prev => {
      const key = dayOverridesKey(splitId, dayId);
      if (!prev[key]) return prev;
      const next = Object.fromEntries(Object.entries(prev).filter(([id]) => id !== key));
      saveDayOverrides(next);
      return next;
    });
  }, []);

  const selectSplit = useCallback(async (splitId: string) => {
    const next: ActiveSplitState = { splitId, currentDayIndex: 0 };
    setActiveSplitState(next);
    await saveActiveSplit(next);
  }, []);

  const clearActiveSplit = useCallback(async () => {
    setActiveSplitState(null);
    await saveActiveSplit(null);
  }, []);

  const advanceToNextDay = useCallback(async () => {
    // Los cambios "solo por hoy" mueren con la sesión que se acaba de cerrar.
    if (activeSplit && currentDay) clearDayOverrides(activeSplit.id, currentDay.id);
    setActiveSplitState(prev => {
      if (!prev) return prev;
      const next = { ...prev, currentDayIndex: prev.currentDayIndex + 1 };
      saveActiveSplit(next);
      return next;
    });
  }, [activeSplit, currentDay, clearDayOverrides]);

  const selectDay = useCallback(
    async (dayId: string) => {
      if (!activeSplit) return;
      const dayIndex = activeSplit.days.findIndex(d => d.id === dayId);
      if (dayIndex === -1) return;
      setActiveSplitState(prev => {
        if (!prev) return prev;
        const next = { ...prev, currentDayIndex: dayIndex };
        saveActiveSplit(next);
        return next;
      });
    },
    [activeSplit],
  );

  const updateDayExercises = useCallback(
    async (splitId: string, dayId: string, exercises: DayExerciseSlot[]) => {
      setSplits(prev => {
        const next = prev.map(split =>
          split.id !== splitId
            ? split
            : {
                ...split,
                days: split.days.map(d => (d.id !== dayId ? d : { ...d, exercises })),
              },
        );
        saveSplits(next);
        return next;
      });
      // Un slot que ya no existe en la plantilla no puede seguir teniendo cambio de hoy.
      setDayOverrides(prev => {
        const key = dayOverridesKey(splitId, dayId);
        const current = prev[key];
        if (!current) return prev;
        const slotIds = new Set(exercises.map(slot => slot.id));
        const kept = Object.fromEntries(
          Object.entries(current).filter(([slotId]) => slotIds.has(slotId)),
        );
        if (Object.keys(kept).length === Object.keys(current).length) return prev;
        const next = { ...prev, [key]: kept };
        saveDayOverrides(next);
        return next;
      });
    },
    [],
  );

  const createCustomSplit = useCallback(async (name: string, dayNames: string[]) => {
    const newSplit: Split = {
      id: generateId(),
      name,
      type: 'custom',
      days: dayNames.map((dayName, index) => ({
        id: generateId(),
        name: dayName,
        order: index,
        exercises: [],
      })),
    };
    setSplits(prev => {
      const next = [...prev, newSplit];
      saveSplits(next);
      return next;
    });
    return newSplit;
  }, []);

  const value: RoutineContextValue = {
    loading,
    splits,
    activeSplit,
    currentDay,
    currentDayIndex,
    selectSplit,
    clearActiveSplit,
    advanceToNextDay,
    selectDay,
    updateDayExercises,
    createCustomSplit,
    getDayOverrides,
    setDayOverride,
    clearDayOverrides,
  };

  return <RoutineContext.Provider value={value}>{children}</RoutineContext.Provider>;
}

export function useRoutine(): RoutineContextValue {
  const ctx = useContext(RoutineContext);
  if (!ctx) throw new Error('useRoutine debe usarse dentro de RoutineProvider');
  return ctx;
}
