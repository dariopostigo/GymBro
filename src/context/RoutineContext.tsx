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
  loadSplits,
  saveActiveSplit,
  saveSplits,
} from '../storage/routineStorage';
import type { ActiveSplitState, DayExerciseSlot, Split, SplitDay } from '../types/routine';

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
}

const RoutineContext = createContext<RoutineContextValue | null>(null);

export function RoutineProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [splits, setSplits] = useState<Split[]>([]);
  const [activeSplitState, setActiveSplitState] = useState<ActiveSplitState | null>(null);

  useEffect(() => {
    (async () => {
      const [loadedSplits, loadedActive] = await Promise.all([loadSplits(), loadActiveSplit()]);
      setSplits(loadedSplits);
      setActiveSplitState(loadedActive);
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
    setActiveSplitState(prev => {
      if (!prev) return prev;
      const next = { ...prev, currentDayIndex: prev.currentDayIndex + 1 };
      saveActiveSplit(next);
      return next;
    });
  }, []);

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
  };

  return <RoutineContext.Provider value={value}>{children}</RoutineContext.Provider>;
}

export function useRoutine(): RoutineContextValue {
  const ctx = useContext(RoutineContext);
  if (!ctx) throw new Error('useRoutine debe usarse dentro de RoutineProvider');
  return ctx;
}
