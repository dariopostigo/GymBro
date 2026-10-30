export interface SetEntry {
  id: string;
  exerciseId: number;
  positionInSession: number;
  /** Posición dentro de los ejercicios de la misma categoría en esta sesión. Ausente en series registradas antes de introducir este campo. */
  positionInMuscleGroup?: number;
  setNumber: number;
  weight: number;
  reps: number;
  /** Repeticiones que quedaban en reserva (RIR). Opcional: solo si se apuntó el esfuerzo. */
  rir?: number;
  /** Las reps son de cada lado (ejercicio a una mano o a una pierna): el volumen cuenta los dos. */
  perSide?: boolean;
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
