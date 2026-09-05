import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoutine } from '../context/RoutineContext';
import { useSession } from '../context/SessionContext';
import { TAB_BAR_SPACE } from '../components/MainTabBar';
import { DumbbellIcon, FlameIcon } from '../components/icons';
import FadeInView from '../components/FadeInView';
import MenuButton from '../components/MenuButton';
import { Card, Overline, PrimaryButton, ProgressBar, ScreenHeader, StatTile } from '../components/ui';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, overline, radius, spacing } from '../theme';
import { formatVolume, totalStats, volumeByWeek } from '../utils/stats';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const CHART_HEIGHT = 84;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Buenas noches';
  if (hour < 13) return 'Buenos días';
  if (hour < 21) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { activeSplit, currentDay } = useRoutine();
  const { sessions, getActiveSession } = useSession();

  const stats = useMemo(() => totalStats(sessions), [sessions]);
  const week = useMemo(() => volumeByWeek(sessions), [sessions]);
  const maxVolume = Math.max(1, ...week.map(d => d.volume));

  const activeSession =
    activeSplit && currentDay ? getActiveSession(activeSplit.id, currentDay.id) : null;

  const targetSets = currentDay?.exercises.reduce((sum, slot) => sum + slot.targetSets, 0) ?? 0;
  const doneSets = activeSession?.sets.length ?? 0;
  const progress = targetSets > 0 ? doneSets / targetSets : 0;

  const goToday = () => navigation.navigate('Today');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        overline={greeting()}
        title="GymBro"
        left={<MenuButton />}
        right={
          <View style={styles.streakPill}>
            <FlameIcon size={14} color={colors.accent} />
            <Text style={styles.streakText}>{stats.streak}</Text>
          </View>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView delay={70}>
          <Card style={styles.hero} elevated>
            <View style={styles.heroTop}>
              <View style={styles.heroTitleBlock}>
                <Overline>Entrenamiento de hoy</Overline>
                <Text style={styles.heroTitle}>{currentDay?.name ?? 'Sin día activo'}</Text>
                <Text style={styles.heroMeta}>
                  {activeSplit?.name ?? 'Elige un split para empezar'}
                  {currentDay ? ` · ${currentDay.exercises.length} ejercicios` : ''}
                </Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeValue}>{doneSets}</Text>
                <Text style={styles.heroBadgeLabel}>series</Text>
              </View>
            </View>

            <View style={styles.heroProgress}>
              <ProgressBar progress={progress} />
              <Text style={styles.heroProgressText}>
                {targetSets > 0
                  ? `${doneSets} de ${targetSets} series planificadas`
                  : 'Este día todavía no tiene ejercicios'}
              </Text>
            </View>

            <PrimaryButton
              label={doneSets > 0 ? 'Continuar entrenamiento' : 'Empezar entrenamiento'}
              icon={<DumbbellIcon size={18} color={colors.onAccent} />}
              onPress={goToday}
            />
          </Card>
        </FadeInView>

        <FadeInView delay={140} style={styles.statsRow}>
          <StatTile value={stats.sessions} label="Sesiones" />
          <StatTile value={stats.sets} label="Series" />
          <StatTile value={formatVolume(stats.volume)} unit="kg" label="Volumen" />
          <StatTile value={stats.streak} label="Racha" accent />
        </FadeInView>

        <FadeInView delay={210}>
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Overline>Esta semana</Overline>
              <TouchableOpacity onPress={() => navigation.navigate('Progress')}>
                <Text style={styles.linkText}>Ver progreso</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chart}>
              {week.map(day => (
                <View key={day.key} style={styles.chartColumn}>
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
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: TAB_BAR_SPACE,
    gap: spacing.lg,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentDim,
  },
  streakText: { color: colors.accent, fontWeight: '800', fontSize: 13 },
  hero: { gap: spacing.lg, paddingTop: spacing.xl, borderColor: colors.surfaceHigh },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  heroTitleBlock: { flex: 1, gap: 2 },
  heroTitle: { color: colors.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  heroMeta: { color: colors.muted, fontSize: 13 },
  heroBadge: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeValue: { color: colors.accent, fontWeight: '900', fontSize: 20 },
  heroBadgeLabel: { ...overline, fontSize: 8.5, color: colors.muted },
  heroProgress: { gap: 8 },
  heroProgressText: { color: colors.muted, fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: spacing.sm },
  chartCard: { gap: spacing.lg },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  linkText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  chartColumn: { flex: 1, alignItems: 'center', gap: 8 },
  chartTrack: { height: CHART_HEIGHT, justifyContent: 'flex-end' },
  chartBar: {
    width: 18,
    borderRadius: 6,
    backgroundColor: colors.surfaceHigh,
  },
  chartBarToday: { backgroundColor: colors.accent },
  chartBarFuture: { opacity: 0.45 },
  chartLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  chartLabelToday: { color: colors.accent },
  chartLabelFuture: { opacity: 0.5 },
});
