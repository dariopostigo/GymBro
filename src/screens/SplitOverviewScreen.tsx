import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoutine } from '../context/RoutineContext';
import { useSession } from '../context/SessionContext';
import { useTabScreenBottomSpace } from '../components/RestTimerBar';
import { BodyMap } from '../components/BodyFigure';
import FadeInView from '../components/FadeInView';
import MenuButton from '../components/MenuButton';
import { ChevronIcon } from '../components/icons';
import { EmptyState, GhostButton, ScreenHeader } from '../components/ui';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import type { SplitDay } from '../types/routine';
import { musclesWorked } from '../utils/muscleMap';
import { colors, overline, radius, spacing } from '../theme';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Routine'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function SplitOverviewScreen() {
  const bottomSpace = useTabScreenBottomSpace();
  const navigation = useNavigation<Nav>();
  const { activeSplit, currentDay, currentDayIndex, clearActiveSplit, selectDay } = useRoutine();
  const { getActiveSession } = useSession();

  if (!activeSplit) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenHeader overline="Tu rutina" title="Rutina" left={<MenuButton />} />
        <EmptyState
          title="No hay split activo"
          hint="Elige una rutina para ver aquí todos tus días de entrenamiento."
        />
        <View style={styles.emptyAction}>
          <GhostButton label="Elegir split" onPress={() => navigation.navigate('SplitSelection')} />
        </View>
      </SafeAreaView>
    );
  }

  const todayIndex = currentDayIndex % activeSplit.days.length;

  const handleChangeSplit = async () => {
    await clearActiveSplit();
    navigation.navigate('SplitSelection');
  };

  const pickDay = async (item: SplitDay) => {
    await selectDay(item.id);
    navigation.navigate('Today');
  };

  // Con series ya apuntadas hoy, cambiar de día por un toque sin querer deja el entreno a medias.
  const handlePickDay = (item: SplitDay) => {
    const inProgress =
      currentDay && item.id !== currentDay.id
        ? getActiveSession(activeSplit.id, currentDay.id)
        : null;
    if (!currentDay || !inProgress?.sets.length) {
      pickDay(item);
      return;
    }
    Alert.alert(
      `¿Cambiar a ${item.name}?`,
      `Llevas ${inProgress.sets.length} series de ${currentDay.name} sin terminar. Seguirán guardadas y podrás volver a ese día desde aquí.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cambiar', onPress: () => pickDay(item) },
      ],
    );
  };

  const renderDay = ({ item, index }: { item: SplitDay; index: number }) => {
    const isToday = index === todayIndex;
    const muscles = musclesWorked(item.exercises.map(slot => slot.exerciseId));
    return (
      <FadeInView delay={Math.min(index, 5) * 55}>
        <View style={[styles.dayCard, isToday && styles.dayCardToday]}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.dayMain}
            onPress={() => handlePickDay(item)}
          >
            <View style={[styles.dayIndex, isToday && styles.dayIndexToday]}>
              <Text style={[styles.dayIndexText, isToday && styles.dayIndexTextToday]}>
                {index + 1}
              </Text>
            </View>
            <View style={styles.dayInfo}>
              <View style={styles.dayNameRow}>
                <Text style={styles.dayName} numberOfLines={1}>
                  {item.name}
                </Text>
                {isToday ? (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>Hoy</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.dayExerciseCount}>
                {item.exercises.length} ejercicio{item.exercises.length === 1 ? '' : 's'}
              </Text>
            </View>
            {muscles.size > 0 && <BodyMap levels={muscles} height={58} />}
            <ChevronIcon size={18} color={isToday ? colors.accent : colors.muted} />
          </TouchableOpacity>

          <View style={styles.dayFooter}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('DayEditor', { splitId: activeSplit.id, dayId: item.id })
              }
            >
              <Text style={styles.editDayText}>Editar ejercicios</Text>
            </TouchableOpacity>
          </View>
        </View>
      </FadeInView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        overline="Tu rutina"
        title={activeSplit.name}
        subtitle={`${activeSplit.days.length} días · día ${todayIndex + 1} en curso`}
        left={<MenuButton />}
        right={
          <TouchableOpacity
            style={styles.changeButton}
            activeOpacity={0.8}
            onPress={handleChangeSplit}
          >
            <Text style={styles.changeButtonText}>Cambiar</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={activeSplit.days}
        keyExtractor={item => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: bottomSpace }]}
        showsVerticalScrollIndicator={false}
        renderItem={renderDay}
        ListFooterComponent={
          <GhostButton
            label="+ Crear split personalizado"
            dashed
            onPress={() => navigation.navigate('CreateCustomSplit')}
            style={styles.footerButton}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  emptyAction: { paddingHorizontal: spacing.xxl },
  changeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentDim,
  },
  changeButtonText: { color: colors.accent, fontWeight: '800', fontSize: 12 },
  list: { paddingHorizontal: spacing.xxl, gap: spacing.md },
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dayCardToday: { borderColor: colors.accentDim, backgroundColor: colors.surfaceAlt },
  dayMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  dayIndex: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayIndexToday: { backgroundColor: colors.accent },
  dayIndexText: { color: colors.muted, fontWeight: '900', fontSize: 15 },
  dayIndexTextToday: { color: colors.onAccent },
  dayInfo: { flex: 1, gap: 3 },
  dayNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dayName: { color: colors.text, fontSize: 17, fontWeight: '800', flexShrink: 1 },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  todayBadgeText: { ...overline, fontSize: 9, color: colors.accent },
  dayExerciseCount: { color: colors.muted, fontSize: 12.5 },
  dayFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  editDayText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  footerButton: { marginTop: spacing.xs },
});
