import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BodyHeatMap } from './BodyFigure';
import { Card, Overline } from './ui';
import {
  CATEGORY_PARTS,
  WEEKLY_SETS_TARGET,
  weeklyMuscleSets,
  type WeeklyMuscleSets,
} from '../utils/muscleMap';
import { formatWeight } from '../utils/progression';
import type { WorkoutSession } from '../types/session';
import { colors, radius, spacing } from '../theme';

const { min: TARGET_MIN, max: TARGET_MAX } = WEEKLY_SETS_TARGET;

/** Las barras llegan como mínimo hasta aquí, para que la franja 10-20 no ocupe todo. */
const MIN_SCALE = 25;

/** Por debajo del mínimo el músculo se ve a medias; llegar al mínimo ya es amarillo pleno. */
const heatIntensity = (sets: number) =>
  sets <= 0 ? 0 : 0.25 + 0.75 * Math.min(sets / TARGET_MIN, 1);

function status(sets: number): { label: string; color: string } {
  if (sets < TARGET_MIN) return { label: 'Bajo', color: colors.muted };
  if (sets > TARGET_MAX) return { label: 'Alto', color: colors.textDim };
  return { label: 'En rango', color: colors.accent };
}

function MuscleRow({ row, scale }: { row: WeeklyMuscleSets; scale: number }) {
  const diff = row.sets - row.previous;
  const { label, color } = status(row.sets);
  const pct = (value: number) => `${(Math.min(value, scale) / scale) * 100}%` as const;
  return (
    <View style={styles.row}>
      <Text style={styles.group} numberOfLines={1}>
        {row.group}
      </Text>
      <View style={styles.track}>
        <View
          style={[styles.band, { left: pct(TARGET_MIN), width: pct(TARGET_MAX - TARGET_MIN) }]}
        />
        <View
          style={[
            styles.fill,
            row.sets >= TARGET_MIN && styles.fillInRange,
            { width: pct(row.sets) },
          ]}
        />
      </View>
      <View style={styles.values}>
        <Text style={styles.sets}>{formatWeight(row.sets)}</Text>
        <Text style={[styles.status, { color }]}>
          {label}
          {diff !== 0 ? ` · ${diff > 0 ? '▲' : '▼'}${formatWeight(Math.abs(diff))}` : ''}
        </Text>
      </View>
    </View>
  );
}

/**
 * Series por grupo muscular esta semana: mapa de calor sobre la silueta y una
 * barra por grupo con la franja recomendada (10-20) y el cambio respecto a la
 * semana pasada.
 */
export default function WeeklyMusclesCard({ sessions }: { sessions: WorkoutSession[] }) {
  const rows = useMemo(() => weeklyMuscleSets(sessions), [sessions]);
  const heat = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of rows) {
      for (const part of CATEGORY_PARTS[row.group]?.parts ?? []) {
        map.set(part, Math.max(map.get(part) ?? 0, heatIntensity(row.sets)));
      }
    }
    return map;
  }, [rows]);

  const scale = Math.max(MIN_SCALE, ...rows.map(r => r.sets));
  const trained = rows.some(r => r.sets > 0);

  return (
    <Card style={styles.card}>
      <Overline>Series por músculo · esta semana</Overline>
      <BodyHeatMap heat={heat} height={150} />
      <Text style={styles.hint}>
        {trained
          ? `Cada serie cuenta 1 para sus músculos principales y 0,5 para los secundarios. Lo recomendado para ganar músculo es ${TARGET_MIN}-${TARGET_MAX} series por semana (franja marcada).`
          : 'Todavía no has entrenado esta semana. Aquí verás cuántas series hace cada músculo.'}
      </Text>
      {trained && (
        <View style={styles.rows}>
          {rows.map(row => (
            <MuscleRow key={row.group} row={row} scale={scale} />
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, alignItems: 'stretch' },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  rows: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  group: { width: 84, color: colors.textDim, fontSize: 12.5, fontWeight: '700' },
  track: {
    flex: 1,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  band: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: colors.accentSoft,
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accentDim },
  fillInRange: { backgroundColor: colors.accent },
  values: { width: 86, alignItems: 'flex-end' },
  sets: { color: colors.text, fontSize: 13, fontWeight: '800' },
  status: { fontSize: 10.5, fontWeight: '700' },
});
