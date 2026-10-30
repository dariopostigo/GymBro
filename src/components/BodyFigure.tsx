import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BODY_PARTS, BODY_VIEW_BOXES, type BodySide } from '../data/bodyPaths';
import type { MuscleLevel } from '../utils/muscleMap';
import { colors, spacing } from '../theme';

/** Proporción ancho / alto de las siluetas (viewBox de 727 × 1280). */
const ASPECT = 727 / 1280;

export interface BodyPalette {
  base: string;
  primary: string;
  secondary: string;
}

const NO_LEVELS: ReadonlyMap<string, MuscleLevel> = new Map();

const DEFAULT_PALETTE: BodyPalette = {
  base: colors.surfaceHigh,
  primary: colors.accent,
  secondary: colors.accentDim,
};

/**
 * Una cara del cuerpo (de frente o de espaldas) con las partes indicadas
 * encendidas. `fills` da un color propio a cada parte (mapa de calor) y manda
 * sobre `levels`.
 */
export const BodyFigure = memo(function BodyFigureView({
  side,
  levels = NO_LEVELS,
  fills,
  height,
  palette = DEFAULT_PALETTE,
}: {
  side: BodySide;
  levels?: ReadonlyMap<string, MuscleLevel>;
  fills?: ReadonlyMap<string, string>;
  height: number;
  palette?: BodyPalette;
}) {
  return (
    <Svg width={height * ASPECT} height={height} viewBox={BODY_VIEW_BOXES[side]}>
      {BODY_PARTS[side].flatMap(part => {
        const level = levels.get(part.slug);
        const fill = fills?.get(part.slug) ?? (level ? palette[level] : palette.base);
        return part.paths.map((d, index) => (
          <Path key={`${part.slug}-${index}`} d={d} fill={fill} />
        ));
      })}
    </Svg>
  );
});

/**
 * Las dos caras del cuerpo con los músculos que se trabajan. `legend` añade
 * debajo qué significa cada color.
 */
export function BodyMap({
  levels,
  height,
  legend,
}: {
  levels: ReadonlyMap<string, MuscleLevel>;
  height: number;
  legend?: boolean;
}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.figures}>
        <BodyFigure side="front" levels={levels} height={height} />
        <BodyFigure side="back" levels={levels} height={height} />
      </View>
      {legend && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: DEFAULT_PALETTE.primary }]} />
            <Text style={styles.legendText}>Principal</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: DEFAULT_PALETTE.secondary }]} />
            <Text style={styles.legendText}>Secundario</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const hexToRgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

/** Color entre la silueta apagada (0) y el amarillo de la app (1). */
export function heatColor(intensity: number): string {
  const from = hexToRgb(DEFAULT_PALETTE.base);
  const to = hexToRgb(DEFAULT_PALETTE.primary);
  const t = Math.min(Math.max(intensity, 0), 1);
  const [r, g, b] = from.map((value, i) => Math.round(value + (to[i] - value) * t));
  return `rgb(${r}, ${g}, ${b})`;
}

/** Las dos caras del cuerpo pintadas por intensidad (0-1) de cada parte. */
export function BodyHeatMap({
  heat,
  height,
}: {
  heat: ReadonlyMap<string, number>;
  height: number;
}) {
  const fills = new Map([...heat].map(([part, intensity]) => [part, heatColor(intensity)]));
  return (
    <View style={styles.figures}>
      <BodyFigure side="front" fills={fills} height={height} />
      <BodyFigure side="back" fills={fills} height={height} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', gap: spacing.sm },
  figures: { flexDirection: 'row', gap: spacing.sm },
  legend: { flexDirection: 'row', gap: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
});
