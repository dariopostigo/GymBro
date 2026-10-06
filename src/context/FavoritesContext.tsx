import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadFavoriteExerciseIds, saveFavoriteExerciseIds } from '../storage/favoritesStorage';

interface FavoritesContextValue {
  favoriteIds: ReadonlySet<number>;
  isFavorite: (exerciseId: number) => boolean;
  toggleFavorite: (exerciseId: number) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

/** Ejercicios marcados con estrella: salen los primeros en los buscadores. */
export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<ReadonlySet<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const ids = await loadFavoriteExerciseIds();
      // Lo marcado antes de terminar la carga no se pisa con lo guardado.
      setFavoriteIds(prev => new Set([...ids, ...prev]));
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveFavoriteExerciseIds([...favoriteIds]);
  }, [favoriteIds, loaded]);

  const isFavorite = useCallback((exerciseId: number) => favoriteIds.has(exerciseId), [favoriteIds]);

  const toggleFavorite = useCallback((exerciseId: number) => {
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (next.has(exerciseId)) next.delete(exerciseId);
      else next.add(exerciseId);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ favoriteIds, isFavorite, toggleFavorite }),
    [favoriteIds, isFavorite, toggleFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites debe usarse dentro de FavoritesProvider');
  return ctx;
}
