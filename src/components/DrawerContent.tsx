import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoutine } from '../context/RoutineContext';
import { useDrawer } from '../context/DrawerContext';
import {
  CalendarIcon,
  ChartIcon,
  DumbbellIcon,
  GridIcon,
  HomeIcon,
  PlusIcon,
  type IconProps,
} from './icons';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import { colors, overline, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const NAV_ITEMS: {
  route: keyof MainTabParamList;
  label: string;
  Icon: (props: IconProps) => React.JSX.Element;
}[] = [
  { route: 'Home', label: 'Inicio', Icon: HomeIcon },
  { route: 'Today', label: 'Hoy', Icon: DumbbellIcon },
  { route: 'Routine', label: 'Rutina', Icon: CalendarIcon },
  { route: 'Progress', label: 'Progreso', Icon: ChartIcon },
];

function NavRow({
  Icon,
  label,
  active,
  onPress,
}: {
  Icon: (props: IconProps) => React.JSX.Element;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.navRow, active && styles.navRowActive]}
      onPress={onPress}
    >
      <View style={[styles.navIcon, active && styles.navIconActive]}>
        <Icon size={18} color={active ? colors.onAccent : colors.textDim} />
      </View>
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function DrawerContent() {
  const navigation = useNavigation<Nav>();
  const { closeDrawer } = useDrawer();
  const { activeSplit, currentDay } = useRoutine();

  const activeTab = useNavigationState(state => {
    const mainRoute = state.routes.find(route => route.name === 'Main');
    return mainRoute?.state?.routes[mainRoute.state.index ?? 0]?.name ?? 'Home';
  });

  const goToTab = (route: keyof MainTabParamList) => {
    closeDrawer();
    navigation.navigate('Main', { screen: route });
  };

  const goToSplitSelection = () => {
    closeDrawer();
    navigation.navigate('SplitSelection');
  };

  const goToEditToday = () => {
    if (!activeSplit || !currentDay) return;
    closeDrawer();
    navigation.navigate('DayEditor', { splitId: activeSplit.id, dayId: currentDay.id });
  };

  const goToExerciseLibrary = () => {
    closeDrawer();
    navigation.navigate('ExerciseLibrary');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>GB</Text>
          </View>
          <View>
            <Text style={styles.brand}>GymBro</Text>
            <Text style={styles.brandMeta}>
              {activeSplit ? activeSplit.name : 'Sin split activo'}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Menú principal</Text>
        <View style={styles.navGroup}>
          {NAV_ITEMS.map(item => (
            <NavRow
              key={item.route}
              Icon={item.Icon}
              label={item.label}
              active={activeTab === item.route}
              onPress={() => goToTab(item.route)}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Biblioteca</Text>
        <View style={styles.navGroup}>
          <NavRow
            Icon={GridIcon}
            label="Ejercicios"
            active={false}
            onPress={goToExerciseLibrary}
          />
        </View>

        <Text style={styles.sectionTitle}>Rutina</Text>
        <View style={styles.navGroup}>
          {activeSplit && currentDay ? (
            <NavRow Icon={PlusIcon} label="Editar el día de hoy" active={false} onPress={goToEditToday} />
          ) : null}
          <NavRow
            Icon={CalendarIcon}
            label="Cambiar de split"
            active={false}
            onPress={goToSplitSelection}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.xxl, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.onAccent, fontWeight: '900', fontSize: 16, letterSpacing: 0.5 },
  brand: { color: colors.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  brandMeta: { color: colors.muted, fontSize: 12, marginTop: 2 },
  sectionTitle: { ...overline, fontSize: 10.5, color: colors.muted, marginLeft: spacing.xs },
  navGroup: { gap: 2 },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  navRowActive: { backgroundColor: colors.accentSoft },
  navIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconActive: { backgroundColor: colors.accent },
  navLabel: { color: colors.textDim, fontSize: 14.5, fontWeight: '700' },
  navLabelActive: { color: colors.text },
});
