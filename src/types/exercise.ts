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

/**
 * Ejercicio creado en la app (ids desde 100001). En `images` va la foto, si la
 * tiene, como `file://` en la carpeta de la app. Lo que en el catálogo sale de
 * las listas a mano (peso del cuerpo, por tiempo, a un lado) aquí va en el propio ejercicio.
 */
export interface CustomExercise extends Exercise {
  bodyweight?: boolean;
  timed?: boolean;
  unilateral?: boolean;
}
