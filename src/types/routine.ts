export type SplitType = 'ppl' | 'upper-lower' | 'bro-split' | 'custom';

export interface DayExerciseSlot {
  id: string;
  exerciseId: number;
  order: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
}

export interface SplitDay {
  id: string;
  name: string;
  order: number;
  exercises: DayExerciseSlot[];
}

export interface Split {
  id: string;
  name: string;
  type: SplitType;
  days: SplitDay[];
}

export interface ActiveSplitState {
  splitId: string;
  currentDayIndex: number;
}
