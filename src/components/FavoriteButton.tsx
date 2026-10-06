import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useFavorites } from '../context/FavoritesContext';
import { StarIcon } from './icons';
import { colors } from '../theme';

/** Estrella para marcar un ejercicio como favorito desde las listas de búsqueda. */
export default function FavoriteButton({ exerciseId }: { exerciseId: number }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(exerciseId);
  return (
    <TouchableOpacity
      onPress={() => toggleFavorite(exerciseId)}
      hitSlop={10}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={favorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      accessibilityState={{ selected: favorite }}
    >
      <StarIcon size={22} filled={favorite} color={favorite ? colors.accent : colors.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { padding: 4 },
});
