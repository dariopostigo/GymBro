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
import {
  CalendarIcon,
  ChartIcon,
  ChevronIcon,
  DumbbellIcon,
  FlameIcon,
  PlusIcon,
  type IconProps,
} from '../components/icons';
import FadeInView from '../components/FadeInView';
import { Card, Overline, PrimaryButton, ProgressBar, StatTile } from '../components/ui';
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

function MenuRow({
  Icon,
  title,
  subtitle,
  onPress,
}: {
  Icon: (props: IconProps) => React.JSX.Element;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Icon size={18} color={colors.accent} />
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <ChevronIcon size={18} color={colors.muted} />
    </TouchableOpacity>
  );
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView style={styles.topBar}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>GB</Text>
          </View>
          <View style={styles.topBarText}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.brand}>GymBro</Text>
          </View>
          <View style={styles.streakPill}>
            <FlameIcon size={14} color={colors.accent} />
            <Text style={styles.streakText}>{stats.streak}</Text>
          </View>
        </FadeInView>

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

        <Overline style={styles.sectionTitle}>Menú principal</Overline>
        <FadeInView delay={280}>
          <Card style={styles.menuCard}>
            <MenuRow
              Icon={DumbbellIcon}
              title="Entrenar hoy"
              subtitle={currentDay ? currentDay.name : 'Sin día activo'}
              onPress={goToday}
            />
            <View style={styles.menuDivider} />
            <MenuRow
              Icon={CalendarIcon}
              title="Mi rutina"
              subtitle={
                activeSplit
                  ? `${activeSplit.name} · ${activeSplit.days.length} días`
                  : 'Aún no hay split activo'
              }
              onPress={() => navigation.navigate('Routine')}
            />
            <View style={styles.menuDivider} />
            <MenuRow
              Icon={ChartIcon}
              title="Progreso"
              subtitle="Volumen, récords e historial"
              onPress={() => navigation.navigate('Progress')}
            />
            {activeSplit && currentDay ? (
              <>
                <View style={styles.menuDivider} />
                <MenuRow
                  Icon={PlusIcon}
                  title="Editar el día de hoy"
                  subtitle="Añadir, quitar o reordenar ejercicios"
                  onPress={() =>
                    navigation.navigate('DayEditor', {
                      splitId: activeSplit.id,
                      dayId: currentDay.id,
                    })
                  }
                />
              </>
            ) : null}
            <View style={styles.menuDivider} />
            <MenuRow
              Icon={CalendarIcon}
              title="Cambiar de split"
              subtitle="Elegir otra rutina o crear una nueva"
              onPress={() => navigation.navigate('SplitSelection')}
            />
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
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.onAccent, fontWeight: '900', fontSize: 15, letterSpacing: 0.5 },
  topBarText: { flex: 1 },
  greeting: { color: colors.muted, fontSize: 12, fontWeight: '600' },
  brand: { color: colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
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
  sectionTitle: { marginTop: spacing.xs, marginLeft: spacing.xs },
  menuCard: { padding: 0, overflow: 'hidden' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: { flex: 1, gap: 1 },
  menuTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  menuSubtitle: { color: colors.muted, fontSize: 12 },
  menuDivider: { height: 1, backgroundColor: colors.border, marginLeft: 68 },
});
