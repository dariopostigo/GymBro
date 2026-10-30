import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Today: undefined;
  Routine: undefined;
  Progress: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  SplitSelection: undefined;
  CreateCustomSplit: undefined;
  DayEditor: { splitId: string; dayId: string };
  ExerciseLibrary: undefined;
  ExerciseHistory: { exerciseId: number };
  Settings: undefined;
  WorkoutSummary: { sessionId: string };
  /** `addExerciseId` lo devuelve el buscador al añadir un ejercicio al entreno. */
  EditWorkout: { sessionId: string; addExerciseId?: number };
  /** `currentExerciseId` preselecciona el filtro por la categoría del ejercicio que se cambia. */
  ExercisePicker:
    | { mode: 'add'; splitId: string; dayId: string }
    /** Añadir un ejercicio solo para la sesión de hoy, sin tocar la plantilla. */
    | { mode: 'todayAdd'; splitId: string; dayId: string }
    | {
        mode: 'replace';
        splitId: string;
        dayId: string;
        slotId: string;
        currentExerciseId?: number;
      }
    | {
        mode: 'today';
        splitId: string;
        dayId: string;
        slotId: string;
        currentExerciseId?: number;
      }
    /** Añadir un ejercicio a un entreno guardado que se está corrigiendo. */
    | { mode: 'sessionAdd'; sessionId: string }
    | {
        /** Elegir el plan B de un hueco; `currentExerciseId` es el ejercicio principal. */
        mode: 'backup';
        splitId: string;
        dayId: string;
        slotId: string;
        currentExerciseId?: number;
      };
};
