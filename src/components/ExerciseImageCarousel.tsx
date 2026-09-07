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
import type { ExerciseMediaItem } from '../utils/exerciseImages';
import { colors, radius } from '../theme';

interface Props {
  media: ExerciseMediaItem[];
  style: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
}

/** Elemento único si solo hay una imagen; carrusel deslizable con puntos si hay varias.
 * Los vídeos no se muestran aquí: se reproducen aparte en ExerciseVideoModal. */
export default function ExerciseImageCarousel({ media, style, resizeMode }: Props) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const images = useMemo(
    () =>
      media.filter(
        (item): item is Extract<ExerciseMediaItem, { type: 'image' }> => item.type === 'image',
      ),
    [media],
  );

  if (images.length === 0) return null;

  if (images.length === 1) {
    return <Image source={images[0].source} style={style} resizeMode={resizeMode} />;
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
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => String(index)}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onScrollEndDrag={handleMomentumScrollEnd}
          renderItem={({ item }) => (
            <Image source={item.source} style={[style, { width }]} resizeMode={resizeMode} />
          )}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        />
      )}
      <View style={styles.dots} pointerEvents="none">
        {images.map((_, index) => (
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
