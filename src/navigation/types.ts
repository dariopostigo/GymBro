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
  /** `currentExerciseId` preselecciona el filtro por la categoría del ejercicio que se cambia. */
  ExercisePicker:
    | { mode: 'add'; splitId: string; dayId: string }
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
      };
};
