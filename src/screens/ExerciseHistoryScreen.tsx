import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSession } from '../context/SessionContext';
import { getExerciseById } from '../data/exerciseCatalog';
import { Card, Chip, EmptyState, Overline, StatTile } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import type { ExerciseHistoryEntry } from '../types/session';
import { colors, radius, spacing } from '../theme';
import { formatFullDate, formatShortDate } from '../utils/stats';

type Props = NativeStackScreenProps<RootStackParamList, 'ExerciseHistory'>;

const CHART_HEIGHT = 130;
const BAR_WIDTH = 34;

interface SessionBar {
  sessionId: string;
  date: string;
  maxWeight: number;
}

export default function ExerciseHistoryScreen({ route }: Props) {
  const { exerciseId } = route.params;
  const { getEntriesForExercise } = useSession();
  const exercise = getExerciseById(exerciseId);
  const entries = getEntriesForExercise(exerciseId);

  const positions = useMemo(
    () => [...new Set(entries.map(e => e.positionInSession))].sort((a, b) => a - b),
    [entries],
  );

  const muscleGroupPositions = useMemo(
    () =>
      [...new Set(entries.map(e => e.positionInMuscleGroup).filter((p): p is number => p !== undefined))].sort(
        (a, b) => a - b,
      ),
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
    const bySession = new Map<string, { date: string; maxWeight: number }>();
    for (const entry of filteredEntries) {
      const existing = bySession.get(entry.sessionId);
      if (!existing || entry.weight > existing.maxWeight) {
        bySession.set(entry.sessionId, { date: entry.sessionDate, maxWeight: entry.weight });
      }
    }
    return [...bySession.entries()]
      .map(([sessionId, v]) => ({ sessionId, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredEntries]);

  const maxWeight = Math.max(1, ...sessionBars.map(b => b.maxWeight));
  const record = entries.length ? Math.max(...entries.map(e => e.weight)) : 0;
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

        {entries.length === 0 ? (
          <EmptyState
            title="Sin datos todavía"
            hint="Cuando registres series de este ejercicio verás aquí tu progresión."
          />
        ) : (
          <>
            <View style={styles.statsRow}>
              <StatTile value={record} unit="kg" label="Récord" accent />
              <StatTile value={entries.length} label="Series" />
              <StatTile value={totalSessions} label="Sesiones" />
            </View>

            <View style={styles.section}>
              <Overline>Orden dentro del entrenamiento</Overline>
              <Text style={styles.hint}>
                El peso que puedes levantar depende de si haces el ejercicio de primero, de
                segundo... por eso el historial se segmenta por posición. Elige si comparar por
                posición absoluta en la sesión o por posición dentro de{' '}
                {exercise?.category.name ?? 'su categoría'}, aunque hayas reordenado el resto de
                ejercicios.
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
                        label={`Como #${pos}`}
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
                Peso máximo ·{' '}
                {filterMode === 'session'
                  ? `posición #${activePosition}`
                  : `${activeMuscleGroupPosition}º de ${exercise?.category.name ?? 'categoría'}`}
              </Overline>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chart}>
                  {sessionBars.map((bar, index) => {
                    const isLast = index === sessionBars.length - 1;
                    return (
                      <View key={bar.sessionId} style={styles.barColumn}>
                        <Text style={[styles.barValue, isLast && styles.barValueLast]}>
                          {bar.maxWeight}
                        </Text>
                        <View
                          style={[
                            styles.bar,
                            isLast && styles.barLast,
                            { height: Math.max(6, (bar.maxWeight / maxWeight) * CHART_HEIGHT) },
                          ]}
                        />
                        <Text style={styles.barDate}>{formatShortDate(bar.date)}</Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
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
                      <Text style={styles.tableRowStrong}>{set.weight}</Text> kg
                    </Text>
                    <Text style={styles.tableRowText}>
                      <Text style={styles.tableRowStrong}>{set.reps}</Text> reps
                    </Text>
                    <Text style={styles.tableRowVolume}>{set.weight * set.reps} kg vol.</Text>
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
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  section: { gap: spacing.sm },
  hint: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  modeRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: 2 },
  chartCard: { gap: spacing.lg },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.md, paddingBottom: 2 },
  barColumn: { alignItems: 'center', width: BAR_WIDTH, gap: 6 },
  barValue: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  barValueLast: { color: colors.accent },
  bar: { width: BAR_WIDTH, backgroundColor: colors.surfaceHigh, borderRadius: 6 },
  barLast: { backgroundColor: colors.accent },
  barDate: { color: colors.muted, fontSize: 10 },
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
  tableRowVolume: { color: colors.muted, fontSize: 12, marginLeft: 'auto' },
});
