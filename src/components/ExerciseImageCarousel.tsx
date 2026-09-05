import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleProp,
  StyleSheet,
  View,
  type ImageResizeMode,
  type ImageStyle,
} from 'react-native';
import Video from 'react-native-video';
import type { ExerciseMediaItem } from '../utils/exerciseImages';
import { colors, radius } from '../theme';

interface Props {
  media: ExerciseMediaItem[];
  style: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
}

function toVideoResizeMode(resizeMode?: ImageResizeMode): 'cover' | 'contain' | 'stretch' {
  return resizeMode === 'contain' ? 'contain' : resizeMode === 'stretch' ? 'stretch' : 'cover';
}

function MediaItem({
  item,
  style,
  resizeMode,
  active,
  onVideoError,
}: {
  item: ExerciseMediaItem;
  style: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  active: boolean;
  onVideoError?: () => void;
}) {
  if (item.type === 'video') {
    return (
      // Sin controles nativos: capturan el gesto de swipe y bloquean el FlatList que lo contiene.
      <Video
        source={{ uri: item.uri }}
        style={style}
        resizeMode={toVideoResizeMode(resizeMode)}
        paused={!active}
        muted
        controls={false}
        repeat
        playInBackground={false}
        ignoreSilentSwitch="ignore"
        onError={onVideoError}
      />
    );
  }
  return <Image source={item.source} style={style} resizeMode={resizeMode} />;
}

/** Elemento único si solo hay uno; carrusel deslizable con puntos si hay varios. Vídeo antes que imágenes.
 * Algunos vídeos del catálogo (p. ej. .MOV en HEVC/Dolby Vision de iPhone) no se pueden decodificar en
 * muchos dispositivos Android: si el vídeo falla al cargar, se descarta y se cae a las imágenes. */
export default function ExerciseImageCarousel({ media, style, resizeMode }: Props) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());

  // Memoizado: si esto se recalculase en cada render (p. ej. al actualizar activeIndex tras cada
  // swipe), el FlatList recibiría un array "data" con una referencia nueva en cada scroll y
  // recalcularía sus métricas de scroll, dejando el carrusel bloqueado tras el primer swipe.
  const items = useMemo(
    () =>
      media
        .map((item, originalIndex) => ({ item, originalIndex }))
        .filter(({ originalIndex }) => !failedIndices.has(originalIndex)),
    [media, failedIndices],
  );

  const handleVideoError = (originalIndex: number) => {
    setFailedIndices(prev => (prev.has(originalIndex) ? prev : new Set(prev).add(originalIndex)));
  };

  if (items.length === 0) return null;

  if (items.length <= 1) {
    return (
      <MediaItem
        item={items[0].item}
        style={style}
        resizeMode={resizeMode}
        active
        onVideoError={() => handleVideoError(items[0].originalIndex)}
      />
    );
  }

  const handleLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!width) return;
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View onLayout={handleLayout}>
      {width > 0 && (
        <FlatList
          data={items}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={({ originalIndex }) => String(originalIndex)}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollEndDrag={handleMomentumScrollEnd}
          renderItem={({ item: { item, originalIndex }, index }) => (
            <MediaItem
              item={item}
              style={[style, { width }]}
              resizeMode={resizeMode}
              active={index === activeIndex}
              onVideoError={() => handleVideoError(originalIndex)}
            />
          )}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        />
      )}
      <View style={styles.dots} pointerEvents="none">
        {items.map((_, index) => (
          <View key={index} style={[styles.dot, index === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  dotActive: {
    backgroundColor: colors.text,
  },
});
