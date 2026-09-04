export interface MuscleRef {
  id: number;
  name: string;
}

export interface EquipmentRef {
  id: number;
  name: string;
}

export interface CategoryRef {
  id: number;
  name: string;
}

export interface Exercise {
  id: number;
  uuid: string;
  name: string;
  description: string;
  category: CategoryRef;
  musclesPrimary: MuscleRef[];
  musclesSecondary: MuscleRef[];
  equipment: EquipmentRef[];
  images: string[];
  videos: string[];
}
