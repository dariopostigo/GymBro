import React, { useMemo } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSession } from '../context/SessionContext';
import { getExerciseById } from '../data/exerciseCatalog';
import { TAB_BAR_SPACE } from '../components/MainTabBar';
import FadeInView from '../components/FadeInView';
import { ChevronIcon } from '../components/icons';
import { Card, EmptyState, Overline, ScreenHeader, StatTile } from '../components/ui';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, overline, radius, spacing } from '../theme';
import {
  exerciseSummaries,
  formatFullDate,
  formatVolume,
  sessionVolume,
  totalStats,
  volumeByWeek,
  type ExerciseSummary,
} from '../utils/stats';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Progress'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const CHART_HEIGHT = 96;
const RECENT_SESSIONS = 5;

const ExerciseSeparator = () => <View style={styles.separator} />;

export default function ProgressScreen() {
  const navigation = useNavigation<Nav>();
  const { sessions } = useSession();

  const stats = useMemo(() => totalStats(sessions), [sessions]);
  const week = useMemo(() => volumeByWeek(sessions), [sessions]);
  const summaries = useMemo(() => exerciseSummaries(sessions), [sessions]);
  const recent = useMemo(
    () =>
      [...sessions]
        .filter(s => s.sets.length > 0)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, RECENT_SESSIONS),
    [sessions],
  );

  const maxVolume = Math.max(1, ...week.map(d => d.volume));

  const renderExercise = ({ item, index }: { item: ExerciseSummary; index: number }) => {
    const exercise = getExerciseById(item.exerciseId);
    const thumbnail = exercise?.images[0];
    return (
      <FadeInView delay={Math.min(index, 5) * 50}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.exerciseRow}
          onPress={() => navigation.navigate('ExerciseHistory', { exerciseId: item.exerciseId })}
        >
          {thumbnail ? (
            <Image source={{ uri: thumbnail }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
          )}
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName} numberOfLines={1}>
              {exercise?.name ?? `Ejercicio #${item.exerciseId}`}
            </Text>
            <Text style={styles.exerciseMeta}>
              {item.sessions} sesion{item.sessions === 1 ? '' : 'es'} · {item.totalSets} series
            </Text>
          </View>
          <View style={styles.bestBadge}>
            <Text style={styles.bestValue}>{item.bestWeight}</Text>
            <Text style={styles.bestUnit}>kg</Text>
          </View>
          <ChevronIcon size={16} color={colors.muted} />
        </TouchableOpacity>
      </FadeInView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={summaries}
        keyExtractor={item => String(item.exerciseId)}
        renderItem={renderExercise}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ExerciseSeparator}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <ScreenHeader overline="Tu evolución" title="Progreso" />

            <View style={styles.statsRow}>
              <StatTile value={stats.sessions} label="Sesiones" />
              <StatTile value={stats.sets} label="Series" />
              <StatTile value={formatVolume(stats.volume)} unit="kg" label="Volumen" accent />
            </View>

            <Card style={styles.chartCard}>
              <Overline>Volumen · esta semana</Overline>
              <View style={styles.chart}>
                {week.map(day => (
                  <View key={day.key} style={styles.chartColumn}>
                    <Text style={styles.chartValue}>
                      {day.volume > 0 ? formatVolume(day.volume) : ''}
                    </Text>
                    <View style={styles.chartTrack}>
                      <View
                        style={[
                          styles.chartBar,
                          day.isToday && styles.chartBarToday,
                          day.isFuture && styles.chartBarFuture,
                          { height: Math.max(4, (day.volume / maxVolume) * CHART_HEIGHT) },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.chartLabel,
                        day.isToday && styles.chartLabelToday,
                        day.isFuture && styles.chartLabelFuture,
                      ]}
                    >
                      {day.label}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>

            {recent.length > 0 ? (
              <>
                <Overline style={styles.sectionTitle}>Sesiones recientes</Overline>
                <Card style={styles.sessionsCard}>
                  {recent.map((session, index) => (
                    <View key={session.id}>
                      {index > 0 ? <View style={styles.sessionDivider} /> : null}
                      <View style={styles.sessionRow}>
                        <View style={styles.sessionInfo}>
                          <Text style={styles.sessionName}>{session.dayName}</Text>
                          <Text style={styles.sessionMeta}>{formatFullDate(session.date)}</Text>
                        </View>
                        <View style={styles.sessionStats}>
                          <Text style={styles.sessionVolume}>
                            {formatVolume(sessionVolume(session))} kg
                          </Text>
                          <Text style={styles.sessionMeta}>{session.sets.length} series</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </Card>
              </>
            ) : null}

            {summaries.length > 0 ? (
              <Overline style={styles.sectionTitle}>Ejercicios entrenados</Overline>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Todavía no hay datos de progreso"
            hint="Registra tus primeras series en la pestaña Hoy y aquí verás tu volumen, tus récords y el historial de cada ejercicio."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: spacing.xxl, paddingBottom: TAB_BAR_SPACE },
  headerBlock: { gap: spacing.lg, marginHorizontal: -spacing.xxl, paddingHorizontal: spacing.xxl },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  chartCard: { gap: spacing.lg },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  chartColumn: { flex: 1, alignItems: 'center', gap: 6 },
  chartValue: { color: colors.muted, fontSize: 9, fontWeight: '700', height: 12 },
  chartTrack: { height: CHART_HEIGHT, justifyContent: 'flex-end' },
  chartBar: { width: 18, borderRadius: 6, backgroundColor: colors.surfaceHigh },
  chartBarToday: { backgroundColor: colors.accent },
  chartBarFuture: { opacity: 0.45 },
  chartLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  chartLabelToday: { color: colors.accent },
  chartLabelFuture: { opacity: 0.5 },
  sectionTitle: { marginTop: spacing.xs, marginLeft: spacing.xs },
  sessionsCard: { padding: 0, marginBottom: spacing.xs },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  sessionDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg },
  sessionInfo: { gap: 2 },
  sessionName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  sessionMeta: { color: colors.muted, fontSize: 12 },
  sessionStats: { alignItems: 'flex-end', gap: 2 },
  sessionVolume: { color: colors.accent, fontSize: 15, fontWeight: '800' },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  separator: { height: spacing.sm },
  thumbnail: { width: 46, height: 46, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  thumbnailPlaceholder: {},
  exerciseInfo: { flex: 1, gap: 2 },
  exerciseName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  exerciseMeta: { color: colors.muted, fontSize: 12 },
  bestBadge: { alignItems: 'flex-end' },
  bestValue: { color: colors.accent, fontSize: 16, fontWeight: '800' },
  bestUnit: { ...overline, fontSize: 8.5, color: colors.muted },
});
