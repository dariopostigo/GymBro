import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSession } from '../context/SessionContext';
import { getExerciseById } from '../data/exerciseCatalog';
import FadeInView from '../components/FadeInView';
import { CheckIcon, DumbbellIcon, TrophyIcon } from '../components/icons';
import { Card, EmptyState, Overline, PrimaryButton, StatTile } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { formatWeight } from '../utils/progression';
import { formatFullDate, formatShortDate, formatVolume } from '../utils/stats';
import {
  buildWorkoutSummary,
  type DayComparison,
  type ExerciseTrend,
  type PersonalRecord,
} from '../utils/workoutSummary';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutSummary'>;

const TREND: Record<ExerciseTrend, { symbol: string; color: string; label: string }> = {
  up: { symbol: '↑', color: colors.success, label: 'Más volumen que la última vez' },
  down: { symbol: '↓', color: colors.muted, label: 'Menos volumen que la última vez' },
  same: { symbol: '=', color: colors.muted, label: 'Igual que la última vez' },
  new: { symbol: '★', color: colors.accent, label: 'Primera vez' },
};

const exerciseName = (exerciseId: number) =>
  getExerciseById(exerciseId)?.name ?? `Ejercicio #${exerciseId}`;

function describeComparison({ date, volumeChange, setsDiff }: DayComparison): string {
  const percent = Math.round(volumeChange * 100);
  const volume = `Volumen ${percent > 0 ? '+' : percent < 0 ? '−' : '±'}${Math.abs(percent)} %`;
  const count = Math.abs(setsDiff);
  const sets =
    setsDiff === 0
      ? 'mismas series'
      : `${count} ${count === 1 ? 'serie' : 'series'} ${setsDiff > 0 ? 'más' : 'menos'}`;
  return `${volume} · ${sets} que el ${formatShortDate(date)}`;
}

function describeRecord({ kind, value, previous }: PersonalRecord): string {
  return kind === 'weight'
    ? `${formatWeight(value)} kg (antes ${formatWeight(previous)})`
    : `1RM est. ${value} kg (antes ${previous})`;
}

/**
 * Resumen de un entreno: totales, comparación, récords y detalle por ejercicio.
 * Se abre al terminarlo y desde las sesiones recientes de Progreso.
 */
export default function WorkoutSummaryScreen({ route, navigation }: Props) {
  const { sessions } = useSession();
  const session = sessions.find(s => s.id === route.params.sessionId);
  const summary = useMemo(
    () => (session ? buildWorkoutSummary(session, sessions) : null),
    [session, sessions],
  );

  const done = () => navigation.goBack();

  if (!session || !summary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState title="No se encuentra este entrenamiento" />
        <PrimaryButton label="Volver" onPress={done} style={styles.doneButton} />
      </SafeAreaView>
    );
  }

  const improved = (summary.comparison?.volumeChange ?? 0) > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView>
          <View style={styles.hero}>
            <View style={[styles.heroIcon, !session.completed && styles.heroIconOpen]}>
              {session.completed ? (
                <CheckIcon size={28} color={colors.onAccent} strokeWidth={3} />
              ) : (
                <DumbbellIcon size={26} color={colors.accent} />
              )}
            </View>
            <Text style={styles.heroTitle}>
              {session.completed ? '¡Entrenamiento completado!' : 'Entrenamiento en curso'}
            </Text>
            <Text style={styles.heroMeta}>
              {session.dayName} · {formatFullDate(session.date)}
            </Text>
          </View>
        </FadeInView>

        <FadeInView delay={60}>
          <View style={styles.stats}>
            <StatTile value={summary.sets} label="Series" accent />
            <StatTile value={formatVolume(summary.volume)} unit="kg" label="Volumen" />
            <StatTile value={summary.exercises.length} label="Ejercicios" />
          </View>
          {summary.comparison && (
            <Text style={[styles.comparison, improved && styles.comparisonUp]}>
              {describeComparison(summary.comparison)}
            </Text>
          )}
        </FadeInView>

        {summary.records.length > 0 && (
          <FadeInView delay={120}>
            <Overline>Récords de hoy</Overline>
            <Card style={styles.records}>
              {summary.records.map(record => (
                <View key={record.exerciseId} style={styles.recordRow}>
                  <View style={styles.trophy}>
                    <TrophyIcon size={16} color={colors.onAccent} />
                  </View>
                  <View style={styles.recordText}>
                    <Text style={styles.recordName} numberOfLines={1}>
                      {exerciseName(record.exerciseId)}
                    </Text>
                    <Text style={styles.recordValue}>{describeRecord(record)}</Text>
                  </View>
                </View>
              ))}
            </Card>
          </FadeInView>
        )}

        <FadeInView delay={180}>
          <Overline>Ejercicios</Overline>
          <Card style={styles.exercises}>
            {summary.exercises.map((exercise, index) => {
              const trend = TREND[exercise.trend];
              return (
                <View
                  key={exercise.exerciseId}
                  style={[styles.exerciseRow, index > 0 && styles.exerciseRowBorder]}
                >
                  <View style={styles.exerciseText}>
                    <Text style={styles.exerciseName} numberOfLines={1}>
                      {exerciseName(exercise.exerciseId)}
                    </Text>
                    <Text style={styles.exerciseSets}>
                      {exercise.sets
                        .map(set => `${formatWeight(set.weight)}×${set.reps}`)
                        .join(' · ')}
                    </Text>
                  </View>
                  <Text
                    style={[styles.trend, { color: trend.color }]}
                    accessibilityLabel={trend.label}
                  >
                    {trend.symbol}
                  </Text>
                </View>
              );
            })}
          </Card>
        </FadeInView>
      </ScrollView>

      <PrimaryButton label="Hecho" onPress={done} style={styles.doneButton} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.xl, gap: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.md },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  heroIconOpen: { backgroundColor: colors.accentSoft },
  heroTitle: { color: colors.text, fontSize: 24, fontWeight: '900', letterSpacing: -0.4 },
  heroMeta: { color: colors.muted, fontSize: 13 },
  stats: { flexDirection: 'row', gap: spacing.sm },
  comparison: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  comparisonUp: { color: colors.success },
  records: { gap: spacing.md, marginTop: spacing.sm },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  trophy: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordText: { flex: 1, gap: 2 },
  recordName: { color: colors.text, fontSize: 14.5, fontWeight: '700' },
  recordValue: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  exercises: { marginTop: spacing.sm, paddingVertical: spacing.xs },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  exerciseRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  exerciseText: { flex: 1, gap: 3 },
  exerciseName: { color: colors.text, fontSize: 14.5, fontWeight: '700' },
  exerciseSets: { color: colors.textDim, fontSize: 13 },
  trend: { fontSize: 18, fontWeight: '900', width: 22, textAlign: 'center' },
  doneButton: { marginHorizontal: spacing.xxl, marginBottom: spacing.lg },
});
