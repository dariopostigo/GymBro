import React from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import ExerciseImageCarousel from './ExerciseImageCarousel';
import type { ExerciseMediaItem } from '../utils/exerciseImages';
import { CloseIcon } from './icons';
import { colors, radius, spacing } from '../theme';

interface Props {
  visible: boolean;
  media: ExerciseMediaItem[];
  onClose: () => void;
}

/** Visor a pantalla completa: mismo carrusel de imágenes que la tarjeta, pero a tamaño grande y
 * sin recortar (el vídeo se reproduce aparte en ExerciseVideoModal).
 * El fondo que cierra al tocar es un Pressable HERMANO del contenido, no un ancestro: si el
 * carrusel quedara anidado dentro de un Pressable, este compite por el gesto de swipe con el
 * FlatList interno y lo bloquea a partir del segundo swipe. */
export default function ExerciseImageModal({ visible, media, onClose }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const size = Math.min(windowWidth - spacing.xxl * 2, 420);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.content, { width: size }]}>
          <ExerciseImageCarousel
            media={media}
            style={[styles.image, { width: size, height: size }]}
            resizeMode="contain"
          />
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
            <CloseIcon size={18} color={colors.text} strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 5, 6, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  image: {
    backgroundColor: colors.surfaceAlt,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 14, 16, 0.82)',
  },
});
