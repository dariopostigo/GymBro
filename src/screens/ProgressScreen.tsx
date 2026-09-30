import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSession } from '../context/SessionContext';
import { getExerciseById } from '../data/exerciseCatalog';
import { TAB_BAR_SPACE } from '../components/MainTabBar';
import ExerciseThumbnail from '../components/ExerciseThumbnail';
import FadeInView from '../components/FadeInView';
import MenuButton from '../components/MenuButton';
import TrendLine, { type TrendPoint } from '../components/TrendLine';
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
const CHART_VALUE_HEIGHT = 12;
const CHART_COLUMN_GAP = 6;
const RECENT_SESSIONS = 5;

const barHeight = (volume: number, maxVolume: number) =>
  Math.max(4, (volume / maxVolume) * CHART_HEIGHT);

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

  const [chartWidth, setChartWidth] = useState(0);

  // Puntos de la linea de tendencia: centro de cada columna, a la altura de la barra.
  // Los dias futuros se omiten para que la linea no caiga a cero antes de tiempo.
  const trendPoints = useMemo<TrendPoint[]>(() => {
    if (chartWidth <= 0) {
      return [];
    }
    const columnWidth = chartWidth / week.length;
    return week.flatMap((day, index) =>
      day.isFuture
        ? []
        : [
            {
              key: day.key,
              highlight: day.isToday,
              x: columnWidth * (index + 0.5),
              y: CHART_HEIGHT - barHeight(day.volume, maxVolume),
            },
          ],
    );
  }, [chartWidth, week, maxVolume]);

  const renderExercise = ({ item, index }: { item: ExerciseSummary; index: number }) => {
    const exercise = getExerciseById(item.exerciseId);
    return (
      <FadeInView delay={Math.min(index, 5) * 50}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.exerciseRow}
          onPress={() => navigation.navigate('ExerciseHistory', { exerciseId: item.exerciseId })}
        >
          <ExerciseThumbnail exercise={exercise} style={styles.thumbnail} />
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
      <ScreenHeader overline="Tu evolución" title="Progreso" left={<MenuButton />} />
      <FlatList
        data={summaries}
        keyExtractor={item => String(item.exerciseId)}
        renderItem={renderExercise}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ExerciseSeparator}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <View style={styles.statsRow}>
              <StatTile value={stats.sessions} label="Sesiones" />
              <StatTile value={stats.sets} label="Series" />
              <StatTile value={formatVolume(stats.volume)} unit="kg" label="Volumen" accent />
            </View>

            <Card style={styles.chartCard}>
              <Overline>Volumen · esta semana</Overline>
              <View style={styles.chartArea}>
                <View
                  style={styles.chart}
                  onLayout={event => setChartWidth(event.nativeEvent.layout.width)}
                >
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
                            { height: barHeight(day.volume, maxVolume) },
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
                <TrendLine points={trendPoints} style={styles.trendOverlay} />
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
  headerBlock: { gap: spacing.lg },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  chartCard: { gap: spacing.lg },
  chartArea: { position: 'relative' },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  chartColumn: { flex: 1, alignItems: 'center', gap: CHART_COLUMN_GAP },
  chartValue: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '700',
    height: CHART_VALUE_HEIGHT,
  },
  chartTrack: { height: CHART_HEIGHT, justifyContent: 'flex-end' },
  chartBar: { width: 18, borderRadius: 6, backgroundColor: colors.surfaceHigh },
  chartBarToday: { backgroundColor: colors.accent },
  chartBarFuture: { opacity: 0.45 },
  chartLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  chartLabelToday: { color: colors.accent },
  chartLabelFuture: { opacity: 0.5 },
  trendOverlay: { top: CHART_VALUE_HEIGHT + CHART_COLUMN_GAP, height: CHART_HEIGHT },
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
  exerciseInfo: { flex: 1, gap: 2 },
  exerciseName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  exerciseMeta: { color: colors.muted, fontSize: 12 },
  bestBadge: { alignItems: 'flex-end' },
  bestValue: { color: colors.accent, fontSize: 16, fontWeight: '800' },
  bestUnit: { ...overline, fontSize: 8.5, color: colors.muted },
});
