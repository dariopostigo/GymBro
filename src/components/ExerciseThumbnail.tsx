import React from 'react';
import { Image, StyleSheet, View, type ImageStyle, type StyleProp } from 'react-native';
import { colors, radius } from '../theme';
import { DumbbellIcon } from './icons';
import { getExerciseImageSources } from '../utils/exerciseImages';
import type { Exercise } from '../types/exercise';

/**
 * Hueco para los ejercicios que ni wger ni free-exercise-db ilustran (unos 40
 * del catálogo, los más raros). Antes era un cuadro gris vacío distinto en cada
 * pantalla; así al menos se lee como "aquí va la foto de un ejercicio".
 */
export function ExerciseImagePlaceholder({
  style,
  iconSize,
}: {
  style?: StyleProp<ImageStyle>;
  iconSize?: number;
}) {
  const flat = StyleSheet.flatten(style) as ImageStyle | undefined;
  const width = typeof flat?.width === 'number' ? flat.width : undefined;
  const height = typeof flat?.height === 'number' ? flat.height : undefined;
  const side = Math.min(width ?? 56, height ?? 56);

  // El estilo de quien lo usa manda: cada pantalla trae su tamaño y su radio.
  return (
    <View style={[styles.placeholder, style]}>
      <DumbbellIcon size={iconSize ?? Math.max(16, Math.round(side * 0.42))} color={colors.muted} />
    </View>
  );
}

/** Miniatura del ejercicio, con el hueco de arriba cuando no hay ninguna imagen. */
export default function ExerciseThumbnail({
  exercise,
  style,
}: {
  exercise: Exercise | undefined | null;
  style?: StyleProp<ImageStyle>;
}) {
  const source = getExerciseImageSources(exercise)[0];
  if (!source) return <ExerciseImagePlaceholder style={style} />;
  return <Image source={source} style={style} />;
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
  },
});
