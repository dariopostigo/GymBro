export interface SetEntry {
  id: string;
  exerciseId: number;
  positionInSession: number;
  /** Posición dentro de los ejercicios de la misma categoría en esta sesión. Ausente en series registradas antes de introducir este campo. */
  positionInMuscleGroup?: number;
  setNumber: number;
  weight: number;
  reps: number;
}

export interface WorkoutSession {
  id: string;
  date: string;
  splitId: string;
  splitDayId: string;
  dayName: string;
  completed: boolean;
  sets: SetEntry[];
}

export interface ExerciseHistoryEntry extends SetEntry {
  sessionId: string;
  sessionDate: string;
}
