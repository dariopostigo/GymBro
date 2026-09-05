import type { ImageSourcePropType } from 'react-native';
import { EXERCISE_IMAGE_MAP } from '../assets/exerciseImageMap';
import type { Exercise } from '../types/exercise';

export type ExerciseMediaItem =
  | { type: 'video'; uri: string }
  | { type: 'image'; source: ImageSourcePropType };

/** Imágenes locales primero (si las hay), luego las remotas del catálogo. */
export function getExerciseImageSources(exercise: Exercise | undefined | null): ImageSourcePropType[] {
  if (!exercise) return [];
  const local = EXERCISE_IMAGE_MAP[exercise.uuid] ?? [];
  const remote = exercise.images.map(uri => ({ uri }));
  return [...local, ...remote];
}

/** Vídeo primero (si el ejercicio tiene alguno), luego las imágenes en el mismo orden que arriba. */
export function getExerciseMediaSources(exercise: Exercise | undefined | null): ExerciseMediaItem[] {
  if (!exercise) return [];
  const images: ExerciseMediaItem[] = getExerciseImageSources(exercise).map(source => ({
    type: 'image',
    source,
  }));
  const videoUri = exercise.videos[0];
  return videoUri ? [{ type: 'video', uri: videoUri }, ...images] : images;
}
