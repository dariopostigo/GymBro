import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme';

export const TREND_THICKNESS = 2;
export const TREND_DOT = 6;

export interface TrendPoint {
  key: string;
  /** Centro horizontal de la barra, en px desde el borde izquierdo de la capa. */
  x: number;
  /** Altura de la cima de la barra, en px desde el borde superior de la capa. */
  y: number;
  /** Marca el punto actual (hoy, o la última sesión) con más contraste. */
  highlight?: boolean;
}

/**
 * Une las cimas de un gráfico de barras con una polilínea.
 *
 * El proyecto no usa react-native-svg, así que cada tramo es una View fina
 * rotada sobre su centro: colocamos un rectángulo del largo del segmento en el
 * punto medio entre las dos cimas y lo giramos el ángulo que las separa.
 *
 * Se posiciona en absoluto, por lo que el contenedor padre debe cubrir
 * exactamente el área de las barras.
 */
export default function TrendLine({
  points,
  style,
}: {
  points: TrendPoint[];
  style?: StyleProp<ViewStyle>;
}) {
  const segments = useMemo(
    () =>
      points.slice(1).map((point, index) => {
        const prev = points[index];
        const dx = point.x - prev.x;
        const dy = point.y - prev.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        return {
          key: point.key,
          width: length,
          left: (prev.x + point.x) / 2 - length / 2,
          top: (prev.y + point.y) / 2 - TREND_THICKNESS / 2,
          angle: `${(Math.atan2(dy, dx) * 180) / Math.PI}deg`,
        };
      }),
    [points],
  );

  if (points.length === 0) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.overlay, style]}>
      {segments.map(segment => (
        <View
          key={segment.key}
          style={[
            styles.segment,
            {
              width: segment.width,
              left: segment.left,
              top: segment.top,
              transform: [{ rotate: segment.angle }],
            },
          ]}
        />
      ))}
      {points.map(point => (
        <View
          key={point.key}
          style={[
            styles.dot,
            point.highlight && styles.dotHighlight,
            { left: point.x - TREND_DOT / 2, top: point.y - TREND_DOT / 2 },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', left: 0, right: 0 },
  segment: {
    position: 'absolute',
    height: TREND_THICKNESS,
    borderRadius: TREND_THICKNESS / 2,
    backgroundColor: colors.textDim,
    opacity: 0.55,
  },
  dot: {
    position: 'absolute',
    width: TREND_DOT,
    height: TREND_DOT,
    borderRadius: TREND_DOT / 2,
    backgroundColor: colors.textDim,
  },
  dotHighlight: { backgroundColor: colors.text },
});
