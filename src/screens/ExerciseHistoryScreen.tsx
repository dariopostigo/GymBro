import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSession } from '../context/SessionContext';
import { useSettings } from '../context/SettingsContext';
import { getExerciseById, isBodyweight, isCustomExercise, isTimed } from '../data/exerciseCatalog';
import { useCustomExercises } from '../context/CustomExercisesContext';
import { getExerciseMediaSources } from '../utils/exerciseImages';
import ExerciseImageCarousel from '../components/ExerciseImageCarousel';
import ExerciseInfo from '../components/ExerciseInfo';
import WeightStackCard from '../components/WeightStackCard';
import ExerciseImageModal from '../components/ExerciseImageModal';
import ExerciseVideoModal from '../components/ExerciseVideoModal';
import { ExpandIcon, VideoIcon } from '../components/icons';
import TrendLine, { type TrendPoint } from '../components/TrendLine';
import { Card, Chip, EmptyState, GhostButton, Overline, StatTile } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import type { ExerciseHistoryEntry } from '../types/session';
import { colors, radius, spacing } from '../theme';
import { effortLabel } from '../utils/effort';
import { formatLoad, formatReps, formatSeconds, formatWeight } from '../utils/progression';
import { estimatedOneRepMax, formatFullDate, formatShortDate, setVolume } from '../utils/stats';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciseHistory'>;

const CHART_HEIGHT = 130;
const BAR_WIDTH = 34;
const BAR_GAP = spacing.md;
const BAR_VALUE_HEIGHT = 14;
const BAR_DETAIL_HEIGHT = 12;
const BAR_COLUMN_GAP = 6;

/** Distancia desde el techo de la columna hasta el techo del area de barras. */
const CHART_TOP_OFFSET = BAR_VALUE_HEIGHT + BAR_COLUMN_GAP + BAR_DETAIL_HEIGHT + BAR_COLUMN_GAP;

/** Métrica que dibujan las barras. Una cada vez: kg y reps no comparten escala. */
type Metric = 'weight' | 'reps' | 'orm';

const METRIC_CHIPS: { value: Metric; label: string }[] = [
  { value: 'weight', label: 'Peso máx' },
  { value: 'reps', label: 'Reps' },
  { value: 'orm', label: '1RM est.' },
];

const METRIC_TITLES: Record<Metric, string> = {
  weight: 'Peso máximo',
  reps: 'Repeticiones',
  orm: '1RM estimado',
};

/** Por tiempo, "reps" son segundos y no hay 1RM que estimar. */
const TIMED_METRIC_CHIPS: { value: Metric; label: string }[] = [
  { value: 'weight', label: 'Peso máx' },
  { value: 'reps', label: 'Segundos' },
];

const TIMED_METRIC_TITLES: Record<Metric, string> = { ...METRIC_TITLES, reps: 'Segundos' };

const TIMED_METRIC_HINTS: Record<Metric, string> = {
  weight: 'La serie más pesada de cada sesión, con los segundos que aguantaste con ese peso.',
  reps: 'Segundos totales del ejercicio en cada sesión, y cuántas series fueron.',
  orm: '',
};

const METRIC_HINTS: Record<Metric, string> = {
  weight: 'La serie más pesada de cada sesión, con las reps que hiciste a ese peso.',
  reps: 'Repeticiones totales del ejercicio en cada sesión, y cuántas series fueron.',
  orm: 'Peso teórico a 1 repetición (Epley). Sube tanto si añades kilos como si añades reps, así que es la mejor vista para ver si progresas.',
};

interface SessionBar {
  sessionId: string;
  date: string;
  /** Serie más pesada de la sesión y las reps que aguantó con ese peso. */
  maxWeight: number;
  repsAtMaxWeight: number;
  totalReps: number;
  setCount: number;
  /** Mejor 1RM estimado de la sesión, y la serie que lo produjo. */
  oneRepMax: number;
  ormWeight: number;
  ormReps: number;
}

const barHeight = (value: number, maxValue: number) =>
  Math.max(6, (value / maxValue) * CHART_HEIGHT);

function metricValue(bar: SessionBar, metric: Metric): number {
  if (metric === 'weight') return bar.maxWeight;
  if (metric === 'reps') return bar.totalReps;
  return bar.oneRepMax;
}

/** La cifra de cada barra: kilos o, por tiempo, los segundos ("3:00"). */
function formatMetric(bar: SessionBar, metric: Metric, timed: boolean): string {
  const value = metricValue(bar, metric);
  return timed && metric === 'reps' ? formatSeconds(value) : formatWeight(value);
}

/** Contexto bajo cada barra: lo que la cifra principal por sí sola esconde. */
function metricDetail(bar: SessionBar, metric: Metric, timed: boolean): string {
  if (metric === 'weight') {
    return timed ? formatSeconds(bar.repsAtMaxWeight) : `×${bar.repsAtMaxWeight}`;
  }
  if (metric === 'reps') return `${bar.setCount} ser.`;
  return `${formatWeight(bar.ormWeight)}×${bar.ormReps}`;
}

export default function ExerciseHistoryScreen({ route, navigation }: Props) {
  const { exerciseId } = route.params;
  const { getEntriesForExercise } = useSession();
  const { settings } = useSettings();
  // Al editar un ejercicio propio, la ficha se vuelve a pintar con lo nuevo.
  useCustomExercises();
  const exercise = getExerciseById(exerciseId);
  const entries = getEntriesForExercise(exerciseId);
  const media = useMemo(() => getExerciseMediaSources(exercise), [exercise]);
  const video = media.find(item => item.type === 'video');
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

  const positions = useMemo(
    () => [...new Set(entries.map(e => e.positionInSession))].sort((a, b) => a - b),
    [entries],
  );

  const muscleGroupPositions = useMemo(
    () =>
      [
        ...new Set(
          entries.map(e => e.positionInMuscleGroup).filter((p): p is number => p !== undefined),
        ),
      ].sort((a, b) => a - b),
    [entries],
  );

  const [filterMode, setFilterMode] = useState<'session' | 'muscleGroup'>(
    muscleGroupPositions.length > 0 ? 'muscleGroup' : 'session',
  );

  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [selectedMuscleGroupPosition, setSelectedMuscleGroupPosition] = useState<number | null>(
    null,
  );
  const activePosition = selectedPosition ?? positions[0] ?? null;
  const activeMuscleGroupPosition = selectedMuscleGroupPosition ?? muscleGroupPositions[0] ?? null;

  const filteredEntries = useMemo(
    () =>
      filterMode === 'session'
        ? entries.filter(e => e.positionInSession === activePosition)
        : entries.filter(e => e.positionInMuscleGroup === activeMuscleGroupPosition),
    [entries, filterMode, activePosition, activeMuscleGroupPosition],
  );

  const sessionBars: SessionBar[] = useMemo(() => {
    const bySession = new Map<string, SessionBar>();
    for (const entry of filteredEntries) {
      const bar = bySession.get(entry.sessionId) ?? {
        sessionId: entry.sessionId,
        date: entry.sessionDate,
        maxWeight: 0,
        repsAtMaxWeight: 0,
        totalReps: 0,
        setCount: 0,
        oneRepMax: 0,
        ormWeight: 0,
        ormReps: 0,
      };

      // A igualdad de peso nos quedamos con la serie de más repeticiones.
      if (
        entry.weight > bar.maxWeight ||
        (entry.weight === bar.maxWeight && entry.reps > bar.repsAtMaxWeight)
      ) {
        bar.maxWeight = entry.weight;
        bar.repsAtMaxWeight = entry.reps;
      }

      // El mejor 1RM no tiene por qué venir de la serie más pesada: una serie
      // más ligera a muchas reps puede estimar más alto.
      const orm = estimatedOneRepMax(entry.weight, entry.reps);
      if (orm > bar.oneRepMax) {
        bar.oneRepMax = orm;
        bar.ormWeight = entry.weight;
        bar.ormReps = entry.reps;
      }

      bar.totalReps += entry.reps;
      bar.setCount += 1;
      bySession.set(entry.sessionId, bar);
    }
    return [...bySession.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredEntries]);

  const bodyweight = isBodyweight(exerciseId);
  const timed = isTimed(exerciseId);
  const metricChips = timed ? TIMED_METRIC_CHIPS : METRIC_CHIPS;
  const metricTitles = timed ? TIMED_METRIC_TITLES : METRIC_TITLES;
  const metricHints = timed ? TIMED_METRIC_HINTS : METRIC_HINTS;
  // Sin lastre el peso máximo es siempre 0: lo que dice algo son las reps.
  const [metric, setMetric] = useState<Metric>(bodyweight ? 'reps' : 'weight');

  const maxValue = Math.max(1, ...sessionBars.map(bar => metricValue(bar, metric)));

  const trendPoints = useMemo<TrendPoint[]>(
    () =>
      sessionBars.map((bar, index) => ({
        key: bar.sessionId,
        highlight: index === sessionBars.length - 1,
        x: index * (BAR_WIDTH + BAR_GAP) + BAR_WIDTH / 2,
        y: CHART_HEIGHT - barHeight(metricValue(bar, metric), maxValue),
      })),
    [sessionBars, metric, maxValue],
  );

  const record = entries.length ? Math.max(...entries.map(e => e.weight)) : 0;
  // Con el peso del cuerpo y sin lastre nunca, el récord son las reps (o segundos) de la mejor serie.
  const repsRecord = entries.length ? Math.max(...entries.map(e => e.reps)) : 0;
  const totalSessions = new Set(entries.map(e => e.sessionId)).size;

  const groupedForTable = useMemo(() => {
    const bySession = new Map<string, ExerciseHistoryEntry[]>();
    for (const entry of filteredEntries) {
      const list = bySession.get(entry.sessionId) ?? [];
      list.push(entry);
      bySession.set(entry.sessionId, list);
    }
    return [...bySession.entries()]
      .map(([sessionId, list]) => ({
        sessionId,
        date: list[0].sessionDate,
        sets: [...list].sort((a, b) => a.setNumber - b.setNumber),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredEntries]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <Overline>{exercise?.category.name ?? 'Ejercicio'}</Overline>
          <Text style={styles.title}>{exercise?.name ?? `Ejercicio #${exerciseId}`}</Text>
        </View>

        {exercise && isCustomExercise(exerciseId) && (
          <GhostButton
            label="Editar ejercicio"
            onPress={() => navigation.navigate('CustomExercise', { exerciseId })}
          />
        )}

        {media.length > 0 && (
          <View style={styles.mediaWrapper}>
            <ExerciseImageCarousel media={media} style={styles.media} />
            {video && (
              <TouchableOpacity
                onPress={() => setVideoModalVisible(true)}
                style={styles.videoButton}
                activeOpacity={0.8}
                accessibilityLabel="Ver vídeo del ejercicio"
              >
                <VideoIcon size={16} color={colors.text} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => setImageModalVisible(true)}
              style={styles.expandButton}
              activeOpacity={0.8}
              accessibilityLabel="Ampliar imagen del ejercicio"
            >
              <ExpandIcon size={16} color={colors.text} />
            </TouchableOpacity>
            <ExerciseImageModal
              visible={imageModalVisible}
              media={media}
              onClose={() => setImageModalVisible(false)}
            />
            <ExerciseVideoModal
              visible={videoModalVisible}
              uri={video?.type === 'video' ? video.uri : undefined}
              onClose={() => setVideoModalVisible(false)}
            />
          </View>
        )}

        {exercise && (
          <ExerciseInfo
            exercise={exercise}
            onOpenExercise={id => navigation.push('ExerciseHistory', { exerciseId: id })}
          />
        )}

        {exercise && <WeightStackCard exerciseId={exercise.id} />}

        {entries.length === 0 ? (
          <EmptyState
            title="Sin datos todavía"
            hint="Cuando registres series de este ejercicio verás aquí tu progresión."
          />
        ) : (
          <>
            <View style={styles.statsRow}>
              {bodyweight && record === 0 ? (
                <StatTile
                  value={formatReps(repsRecord, timed)}
                  unit={timed ? undefined : 'reps'}
                  label="Récord"
                  accent
                />
              ) : (
                <StatTile value={formatLoad(record, bodyweight)} unit="kg" label="Récord" accent />
              )}
              <StatTile value={entries.length} label="Series" />
              <StatTile value={totalSessions} label="Sesiones" />
            </View>

            <View style={styles.section}>
              <Overline>Orden dentro del entrenamiento</Overline>
              <Text style={styles.hint}>
                Cansado mueves menos: compara solo las veces que lo hiciste en el mismo lugar.
              </Text>
              {muscleGroupPositions.length > 0 && (
                <View style={styles.modeRow}>
                  <Chip
                    label={`En ${exercise?.category.name ?? 'su categoría'}`}
                    active={filterMode === 'muscleGroup'}
                    onPress={() => setFilterMode('muscleGroup')}
                  />
                  <Chip
                    label="En la sesión"
                    active={filterMode === 'session'}
                    onPress={() => setFilterMode('session')}
                  />
                </View>
              )}
              <View style={styles.chipsRow}>
                {filterMode === 'session'
                  ? positions.map(pos => (
                      <Chip
                        key={pos}
                        label={`${pos}º del entreno`}
                        active={activePosition === pos}
                        onPress={() => setSelectedPosition(pos)}
                      />
                    ))
                  : muscleGroupPositions.map(pos => (
                      <Chip
                        key={pos}
                        label={`${pos}º de ${exercise?.category.name ?? 'categoría'}`}
                        active={activeMuscleGroupPosition === pos}
                        onPress={() => setSelectedMuscleGroupPosition(pos)}
                      />
                    ))}
              </View>
            </View>

            <Card style={styles.chartCard}>
              <Overline>
                {metricTitles[metric]} ·{' '}
                {filterMode === 'session'
                  ? `${activePosition}º del entreno`
                  : `${activeMuscleGroupPosition}º de ${exercise?.category.name ?? 'categoría'}`}
              </Overline>
              <View style={styles.metricRow}>
                {metricChips.map(chip => (
                  <Chip
                    key={chip.value}
                    label={chip.label}
                    active={metric === chip.value}
                    onPress={() => setMetric(chip.value)}
                  />
                ))}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chartArea}>
                  <View style={styles.chart}>
                    {sessionBars.map((bar, index) => {
                      const isLast = index === sessionBars.length - 1;
                      return (
                        <View key={bar.sessionId} style={styles.barColumn}>
                          <Text style={[styles.barValue, isLast && styles.barValueLast]}>
                            {formatMetric(bar, metric, timed)}
                          </Text>
                          <Text style={styles.barDetail}>{metricDetail(bar, metric, timed)}</Text>
                          <View style={styles.barTrack}>
                            <View
                              style={[
                                styles.bar,
                                isLast && styles.barLast,
                                { height: barHeight(metricValue(bar, metric), maxValue) },
                              ]}
                            />
                          </View>
                          <Text style={styles.barDate}>{formatShortDate(bar.date)}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <TrendLine points={trendPoints} style={styles.trendOverlay} />
                </View>
              </ScrollView>
              <Text style={styles.chartHint}>{metricHints[metric]}</Text>
            </Card>

            <Overline style={styles.sectionTitle}>Historial detallado</Overline>
            {groupedForTable.map(group => (
              <Card key={group.sessionId} style={styles.tableGroup}>
                <Text style={styles.tableDate}>{formatFullDate(group.date)}</Text>
                {group.sets.map(set => (
                  <View key={set.id} style={styles.tableRow}>
                    <View style={styles.setNumber}>
                      <Text style={styles.setNumberText}>{set.setNumber}</Text>
                    </View>
                    <Text style={styles.tableRowText}>
                      <Text style={styles.tableRowStrong}>
                        {formatLoad(set.weight, bodyweight)}
                      </Text>
                      {set.weight > 0 ? ' kg' : ''}
                    </Text>
                    <Text style={styles.tableRowText}>
                      <Text style={styles.tableRowStrong}>{formatReps(set.reps, timed)}</Text>
                      {timed ? (set.perSide ? ' /lado' : '') : set.perSide ? ' reps/lado' : ' reps'}
                    </Text>
                    {set.rir !== undefined && settings.effortMode !== 'off' && (
                      <Text style={styles.tableRowEffort}>
                        {effortLabel(set.rir, settings.effortMode)}
                      </Text>
                    )}
                    {set.weight > 0 && !timed && (
                      <Text style={styles.tableRowVolume}>
                        {formatWeight(setVolume(set))} kg vol.
                      </Text>
                    )}
                  </View>
                ))}
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xxl, gap: spacing.lg },
  titleBlock: { gap: 2 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  mediaWrapper: { borderRadius: radius.md, overflow: 'hidden' },
  media: { width: '100%', height: 200, backgroundColor: colors.surfaceAlt },
  expandButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 14, 16, 0.82)',
  },
  videoButton: {
    position: 'absolute',
    top: 10,
    right: 46,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 14, 16, 0.82)',
  },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  section: { gap: spacing.sm },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  modeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: 2 },
  chartCard: { gap: spacing.md },
  metricRow: { flexDirection: 'row', gap: spacing.sm },
  chartArea: { position: 'relative', paddingTop: spacing.xs },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: BAR_GAP, paddingBottom: 2 },
  barColumn: { alignItems: 'center', width: BAR_WIDTH, gap: BAR_COLUMN_GAP },
  barValue: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    height: BAR_VALUE_HEIGHT,
    lineHeight: BAR_VALUE_HEIGHT,
  },
  barValueLast: { color: colors.accent },
  barDetail: {
    color: colors.muted,
    fontSize: 9,
    height: BAR_DETAIL_HEIGHT,
    lineHeight: BAR_DETAIL_HEIGHT,
    opacity: 0.8,
  },
  barTrack: { height: CHART_HEIGHT, justifyContent: 'flex-end' },
  bar: { width: BAR_WIDTH, backgroundColor: colors.surfaceHigh, borderRadius: 6 },
  barLast: { backgroundColor: colors.accent },
  barDate: { color: colors.muted, fontSize: 10 },
  trendOverlay: { top: spacing.xs + CHART_TOP_OFFSET, height: CHART_HEIGHT },
  chartHint: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  sectionTitle: { marginLeft: spacing.xs },
  tableGroup: { gap: spacing.sm },
  tableDate: { color: colors.text, fontWeight: '800', fontSize: 13 },
  tableRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  setNumber: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: { color: colors.accent, fontWeight: '800', fontSize: 11 },
  tableRowText: { color: colors.textDim, fontSize: 13, minWidth: 62 },
  tableRowStrong: { color: colors.text, fontWeight: '800' },
  tableRowEffort: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  tableRowVolume: { color: colors.muted, fontSize: 12, marginLeft: 'auto' },
});
