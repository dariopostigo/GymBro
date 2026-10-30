import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FIRST_CUSTOM_EXERCISE_ID, setCustomExercises } from '../data/exerciseCatalog';
import { loadCustomExercises, saveCustomExercises } from '../storage/customExerciseStorage';
import { existingPhotos, removeUnusedPhotos } from '../storage/customExercisePhotos';
import type { CustomExercise } from '../types/exercise';

export type CustomExerciseInput = Omit<CustomExercise, 'id' | 'uuid'>;

interface CustomExercisesContextValue {
  customExercises: CustomExercise[];
  /** Crea el ejercicio (sin `id`) o lo reemplaza; devuelve su id. */
  saveCustomExercise: (exercise: CustomExerciseInput, id?: number) => number;
  removeCustomExercise: (id: number) => void;
}

const CustomExercisesContext = createContext<CustomExercisesContextValue | null>(null);

const photosOf = (list: CustomExercise[]) => list.flatMap(e => e.images);

/**
 * Ejercicios creados en la app. Se registran en el catálogo antes de pintar nada,
 * para que `getExerciseById` los encuentre desde el primer render como a los demás.
 */
export function CustomExercisesProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<CustomExercise[] | null>(null);

  useEffect(() => {
    (async () => {
      let loaded: CustomExercise[] = [];
      try {
        loaded = await loadCustomExercises();
        // Una copia importada de otro móvil trae ejercicios sin sus fotos.
        const photos = await existingPhotos(photosOf(loaded));
        loaded = loaded.map(e => ({ ...e, images: e.images.filter(uri => photos.has(uri)) }));
        removeUnusedPhotos(photosOf(loaded)).catch(() => {});
      } finally {
        setCustomExercises(loaded);
        setList(loaded);
      }
    })();
  }, []);

  const update = useCallback((next: CustomExercise[]) => {
    setCustomExercises(next);
    setList(next);
    saveCustomExercises(next);
    removeUnusedPhotos(photosOf(next)).catch(() => {});
  }, []);

  const saveCustomExercise = useCallback(
    (exercise: CustomExerciseInput, id?: number) => {
      const current = list ?? [];
      const newId = id ?? Math.max(FIRST_CUSTOM_EXERCISE_ID - 1, ...current.map(e => e.id)) + 1;
      const saved: CustomExercise = { ...exercise, id: newId, uuid: `custom-${newId}` };
      update(
        current.some(e => e.id === newId)
          ? current.map(e => (e.id === newId ? saved : e))
          : [...current, saved],
      );
      return newId;
    },
    [list, update],
  );

  const removeCustomExercise = useCallback(
    (id: number) => update((list ?? []).filter(e => e.id !== id)),
    [list, update],
  );

  const value = useMemo(
    () => ({ customExercises: list ?? [], saveCustomExercise, removeCustomExercise }),
    [list, saveCustomExercise, removeCustomExercise],
  );

  if (!list) return null;
  return (
    <CustomExercisesContext.Provider value={value}>{children}</CustomExercisesContext.Provider>
  );
}

export function useCustomExercises(): CustomExercisesContextValue {
  const ctx = useContext(CustomExercisesContext);
  if (!ctx) throw new Error('useCustomExercises debe usarse dentro de CustomExercisesProvider');
  return ctx;
}
