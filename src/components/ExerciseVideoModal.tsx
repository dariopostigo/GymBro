import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Video from 'react-native-video';
import { colors, radius, spacing } from '../theme';

interface Props {
  visible: boolean;
  uri: string | undefined;
  onClose: () => void;
}

/** Visor a pantalla completa del vídeo del ejercicio, con controles nativos de reproducción.
 * A diferencia del carrusel de imágenes no hay gesto de swipe que proteger, así que aquí sí
 * pueden estar activos los controles nativos de react-native-video. */
export default function ExerciseVideoModal({ visible, uri, onClose }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const size = Math.min(windowWidth - spacing.xxl * 2, 420);

  if (!uri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.content, { width: size }]}>
          <Video
            source={{ uri }}
            style={[styles.video, { width: size, height: size }]}
            resizeMode="contain"
            controls
            paused={!visible}
            repeat
          />
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
            <Text style={styles.closeText}>✕</Text>
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
  video: {
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
  closeText: { color: colors.text, fontSize: 16, fontWeight: '700' },
});
