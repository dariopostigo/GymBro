import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { generateId } from '../utils/id';
import { loadSessions, saveSessions } from '../storage/sessionStorage';
import type { ExerciseHistoryEntry, SetEntry, WorkoutSession } from '../types/session';

interface AddSetParams {
  splitId: string;
  splitDayId: string;
  dayName: string;
  exerciseId: number;
  positionInSession: number;
  positionInMuscleGroup?: number;
  weight: number;
  reps: number;
  rir?: number;
  perSide?: boolean;
}

/** Serie añadida a mano a un entreno ya guardado (no lleva hora: no se hizo ahora). */
export interface PastSetParams {
  exerciseId: number;
  positionInSession: number;
  positionInMuscleGroup?: number;
  weight: number;
  reps: number;
  rir?: number;
  perSide?: boolean;
}

export type SetPosition = Pick<SetEntry, 'positionInSession' | 'positionInMuscleGroup'>;

interface SessionContextValue {
  loading: boolean;
  sessions: WorkoutSession[];
  getActiveSession: (splitId: string, splitDayId: string) => WorkoutSession | null;
  addSet: (params: AddSetParams) => void;
  removeSet: (sessionId: string, setEntryId: string) => void;
  /** Vuelve a poner una serie borrada (con su id y su hora) en la posición `index`. */
  restoreSet: (sessionId: string, set: SetEntry, index: number) => void;
  /** Corrige peso, reps y esfuerzo de una serie ya apuntada. */
  updateSet: (
    sessionId: string,
    setEntryId: string,
    values: { weight: number; reps: number; rir?: number },
  ) => void;
  finishSession: (sessionId: string) => void;
  /** Crea un entreno terminado y vacío en `date`, para apuntar uno hecho sin la app. */
  createPastSession: (
    session: Pick<WorkoutSession, 'splitId' | 'splitDayId' | 'dayName' | 'date'>,
  ) => string;
  /** Añade una serie a un entreno concreto (uno pasado que se está corrigiendo). */
  addSetToSession: (sessionId: string, set: PastSetParams) => void;
  /** Cambia qué día de la rutina fue un entreno. */
  updateSessionDay: (
    sessionId: string,
    day: Pick<WorkoutSession, 'splitId' | 'splitDayId' | 'dayName'>,
  ) => void;
  /** Mueve un entreno `days` días (la hora de cada serie se mueve con él). */
  moveSession: (sessionId: string, days: number) => void;
  deleteSession: (sessionId: string) => void;
  /**
   * Cambia la posición de las series ya apuntadas de cada ejercicio (por id de
   * ejercicio), al reordenar el entreno de hoy: se guardan en el orden real.
   */
  setSetPositions: (sessionId: string, positions: Map<number, SetPosition>) => void;
  getEntriesForExercise: (exerciseId: number) => ExerciseHistoryEntry[];
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

      const now = new Date().toISOString();
      const session: WorkoutSession = existing ?? {
        id: generateId(),
        date: now,
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
            ...(params.rir !== undefined && { rir: params.rir }),
            ...(params.perSide && { perSide: true }),
            loggedAt: now,
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

  const restoreSet = useCallback((sessionId: string, set: SetEntry, index: number) => {
    setSessions(prev => {
      const next = prev.map(s => {
        if (s.id !== sessionId || s.sets.some(e => e.id === set.id)) return s;
        const sets = [...s.sets];
        sets.splice(Math.min(index, sets.length), 0, set);
        return { ...s, sets };
      });
      saveSessions(next);
      return next;
    });
  }, []);

  const updateSet = useCallback(
    (
      sessionId: string,
      setEntryId: string,
      { weight, reps, rir }: { weight: number; reps: number; rir?: number },
    ) => {
      setSessions(prev => {
        const next = prev.map(s =>
          s.id !== sessionId
            ? s
            : {
                ...s,
                sets: s.sets.map(set => {
                  if (set.id !== setEntryId) return set;
                  const updated = { ...set, weight, reps, rir };
                  // Sin esfuerzo no se guarda la clave, igual que al apuntar la serie.
                  if (rir === undefined) delete updated.rir;
                  return updated;
                }),
              },
        );
        saveSessions(next);
        return next;
      });
    },
    [],
  );

  const finishSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const next = prev.map(s => (s.id === sessionId ? { ...s, completed: true } : s));
      saveSessions(next);
      return next;
    });
  }, []);

  // Cambia una sesión y guarda; el resto se queda igual.
  const editSession = useCallback(
    (sessionId: string, edit: (session: WorkoutSession) => WorkoutSession) => {
      setSessions(prev => {
        const next = prev.map(s => (s.id === sessionId ? edit(s) : s));
        saveSessions(next);
        return next;
      });
    },
    [],
  );

  const setSetPositions = useCallback(
    (sessionId: string, positions: Map<number, SetPosition>) =>
      editSession(sessionId, s => ({
        ...s,
        sets: s.sets.map(set => {
          const position = positions.get(set.exerciseId);
          return position ? { ...set, ...position } : set;
        }),
      })),
    [editSession],
  );

  const createPastSession = useCallback(
    (session: Pick<WorkoutSession, 'splitId' | 'splitDayId' | 'dayName' | 'date'>) => {
      const id = generateId();
      setSessions(prev => {
        const next = [...prev, { ...session, id, completed: true, sets: [] }];
        saveSessions(next);
        return next;
      });
      return id;
    },
    [],
  );

  const addSetToSession = useCallback(
    (sessionId: string, set: PastSetParams) =>
      editSession(sessionId, s => ({
        ...s,
        sets: [
          ...s.sets,
          {
            id: generateId(),
            exerciseId: set.exerciseId,
            positionInSession: set.positionInSession,
            positionInMuscleGroup: set.positionInMuscleGroup,
            setNumber: s.sets.filter(e => e.exerciseId === set.exerciseId).length + 1,
            weight: set.weight,
            reps: set.reps,
            ...(set.rir !== undefined && { rir: set.rir }),
            ...(set.perSide && { perSide: true }),
          },
        ],
      })),
    [editSession],
  );

  const updateSessionDay = useCallback(
    (sessionId: string, day: Pick<WorkoutSession, 'splitId' | 'splitDayId' | 'dayName'>) =>
      editSession(sessionId, s => ({ ...s, ...day })),
    [editSession],
  );

  const moveSession = useCallback(
    (sessionId: string, days: number) => {
      // Por días de calendario, no por 24 h: así el cambio de hora no descuadra nada.
      const shift = (iso: string) => {
        const date = new Date(iso);
        date.setDate(date.getDate() + days);
        return date.toISOString();
      };
      editSession(sessionId, s => ({
        ...s,
        date: shift(s.date),
        sets: s.sets.map(set => (set.loggedAt ? { ...set, loggedAt: shift(set.loggedAt) } : set)),
      }));
    },
    [editSession],
  );

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== sessionId);
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

  const value: SessionContextValue = {
    loading,
    sessions,
    getActiveSession,
    addSet,
    removeSet,
    restoreSet,
    updateSet,
    finishSession,
    createPastSession,
    addSetToSession,
    updateSessionDay,
    moveSession,
    deleteSession,
    setSetPositions,
    getEntriesForExercise,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession debe usarse dentro de SessionProvider');
  return ctx;
}
