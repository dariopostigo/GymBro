import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { generateId } from '../utils/id';
import { loadSessions, saveSessions } from '../storage/sessionStorage';
import type { ExerciseHistoryEntry, WorkoutSession } from '../types/session';

interface AddSetParams {
  splitId: string;
  splitDayId: string;
  dayName: string;
  exerciseId: number;
  positionInSession: number;
  positionInMuscleGroup?: number;
  weight: number;
  reps: number;
}

interface SessionContextValue {
  loading: boolean;
  sessions: WorkoutSession[];
  getActiveSession: (splitId: string, splitDayId: string) => WorkoutSession | null;
  addSet: (params: AddSetParams) => void;
  removeSet: (sessionId: string, setEntryId: string) => void;
  finishSession: (sessionId: string) => void;
  getEntriesForExercise: (exerciseId: number) => ExerciseHistoryEntry[];
  getLastEntryForPosition: (
    exerciseId: number,
    positionInSession: number,
  ) => ExerciseHistoryEntry | undefined;
  getLastEntryForMuscleGroupPosition: (
    exerciseId: number,
    positionInMuscleGroup: number,
  ) => ExerciseHistoryEntry | undefined;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    (async () => {
      const loaded = await loadSessions();
      setSessions(loaded);
      setLoading(false);
    })();
  }, []);

  const getActiveSession = useCallback(
    (splitId: string, splitDayId: string) =>
      sessions.find(s => !s.completed && s.splitId === splitId && s.splitDayId === splitDayId) ??
      null,
    [sessions],
  );

  const addSet = useCallback((params: AddSetParams) => {
    setSessions(prev => {
      const existing = prev.find(
        s => !s.completed && s.splitId === params.splitId && s.splitDayId === params.splitDayId,
      );

      const session: WorkoutSession = existing ?? {
        id: generateId(),
        date: new Date().toISOString(),
        splitId: params.splitId,
        splitDayId: params.splitDayId,
        dayName: params.dayName,
        completed: false,
        sets: [],
      };

      const setNumber = session.sets.filter(s => s.exerciseId === params.exerciseId).length + 1;
      const updatedSession: WorkoutSession = {
        ...session,
        sets: [
          ...session.sets,
          {
            id: generateId(),
            exerciseId: params.exerciseId,
            positionInSession: params.positionInSession,
            positionInMuscleGroup: params.positionInMuscleGroup,
            setNumber,
            weight: params.weight,
            reps: params.reps,
          },
        ],
      };

      const next = existing
        ? prev.map(s => (s.id === updatedSession.id ? updatedSession : s))
        : [...prev, updatedSession];

      saveSessions(next);
      return next;
    });
  }, []);

  const removeSet = useCallback((sessionId: string, setEntryId: string) => {
    setSessions(prev => {
      const next = prev.map(s =>
        s.id !== sessionId ? s : { ...s, sets: s.sets.filter(e => e.id !== setEntryId) },
      );
      saveSessions(next);
      return next;
    });
  }, []);

  const finishSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const next = prev.map(s => (s.id === sessionId ? { ...s, completed: true } : s));
      saveSessions(next);
      return next;
    });
  }, []);

  const getEntriesForExercise = useCallback(
    (exerciseId: number): ExerciseHistoryEntry[] => {
      const entries: ExerciseHistoryEntry[] = [];
      for (const session of sessions) {
        for (const set of session.sets) {
          if (set.exerciseId === exerciseId) {
            entries.push({ ...set, sessionId: session.id, sessionDate: session.date });
          }
        }
      }
      return entries.sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));
    },
    [sessions],
  );

  const getLastEntryForPosition = useCallback(
    (exerciseId: number, positionInSession: number) => {
      const matches = getEntriesForExercise(exerciseId).filter(
        e => e.positionInSession === positionInSession,
      );
      return matches.length ? matches[matches.length - 1] : undefined;
    },
    [getEntriesForExercise],
  );

  const getLastEntryForMuscleGroupPosition = useCallback(
    (exerciseId: number, positionInMuscleGroup: number) => {
      const matches = getEntriesForExercise(exerciseId).filter(
        e => e.positionInMuscleGroup === positionInMuscleGroup,
      );
      return matches.length ? matches[matches.length - 1] : undefined;
    },
    [getEntriesForExercise],
  );

  const value: SessionContextValue = {
    loading,
    sessions,
    getActiveSession,
    addSet,
    removeSet,
    finishSession,
    getEntriesForExercise,
    getLastEntryForPosition,
    getLastEntryForMuscleGroupPosition,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider');
  return ctx;
}
