import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoutine } from '../context/RoutineContext';
import { useSession } from '../context/SessionContext';
import { getExerciseById } from '../data/exerciseCatalog';
import { computeMuscleGroupPositions } from '../utils/exerciseOrder';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { TAB_BAR_SPACE } from '../components/MainTabBar';
import FadeInView from '../components/FadeInView';
import { HistoryIcon, PlusIcon } from '../components/icons';
import { Card, EmptyState, GhostButton, Overline, PrimaryButton, ScreenHeader } from '../components/ui';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import type { DayExerciseSlot } from '../types/routine';
import type { SetEntry } from '../types/session';
import { colors, overline, radius, spacing } from '../theme';

type Props = BottomTabScreenProps<MainTabParamList, 'Today'>;
type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Today'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const noop = () => {};

interface ExerciseCardProps {
  slot: DayExerciseSlot;
  positionInSession: number;
  positionInMuscleGroup?: number;
  loggedSets: SetEntry[];
  suggested?: { weight: number; reps: number };
  onAddSet: (weight: number, reps: number) => void;
  onRemoveSet: (setEntryId: string) => void;
  onSwapToday: () => void;
  onSwapPermanent: () => void;
  onViewHistory: () => void;
  onInputFocus: () => void;
}

function ExerciseCard({
  slot,
  positionInSession,
  positionInMuscleGroup,
  loggedSets,
  suggested,
  onAddSet,
  onRemoveSet,
  onSwapToday,
  onSwapPermanent,
  onViewHistory,
  onInputFocus,
}: ExerciseCardProps) {
  const exercise = getExerciseById(slot.exerciseId);
  const thumbnail = exercise?.images[0];
  const [weightText, setWeightText] = useState(suggested ? String(suggested.weight) : '');
  const [repsText, setRepsText] = useState(suggested ? String(suggested.reps) : '');

  const handleAdd = () => {
    const weight = parseFloat(weightText.replace(',', '.'));
    const reps = parseInt(repsText, 10);
    if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(reps) || reps <= 0) {
      Alert.alert('Datos inválidos', 'Introduce un peso y unas repeticiones válidas.');
      return;
    }
    onAddSet(weight, reps);
  };

  const done = loggedSets.length;
  const isComplete = done >= slot.targetSets;

  return (
    <Card style={styles.card} elevated>
      <View style={styles.cardHead}>
        <View style={[styles.positionBadge, isComplete && styles.positionBadgeDone]}>
          <Text style={[styles.positionBadgeText, isComplete && styles.positionBadgeTextDone]}>
            {positionInSession}
          </Text>
        </View>
        <View style={styles.cardHeadText}>
          <Text style={styles.exerciseName} numberOfLines={2}>
            {exercise?.name ?? `Ejercicio #${slot.exerciseId}`}
          </Text>
          <Text style={styles.exerciseMeta} numberOfLines={1}>
            {exercise?.category.name}
            {positionInMuscleGroup && positionInMuscleGroup > 1
              ? ` · ${positionInMuscleGroup}º de ${exercise?.category.name}`
              : ''}
            {exercise?.musclesPrimary.length
              ? ` · ${exercise.musclesPrimary.map(m => m.name).join(', ')}`
              : ''}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onViewHistory}
          style={styles.iconButton}
          activeOpacity={0.8}
          accessibilityLabel="Ver historial de este ejercicio"
        >
          <HistoryIcon size={18} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.mediaWrapper}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.imagePlaceholderText}>Sin imagen disponible</Text>
          </View>
        )}
        <View style={styles.targetPill}>
          <Text style={styles.targetPillText}>
            {slot.targetSets} × {slot.targetRepsMin}-{slot.targetRepsMax}
          </Text>
        </View>
        <View style={[styles.donePill, isComplete && styles.donePillComplete]}>
          <Text style={[styles.donePillText, isComplete && styles.donePillTextComplete]}>
            {done}/{slot.targetSets}
          </Text>
        </View>
      </View>

      <View style={styles.swapRow}>
        <GhostButton label="Cambiar hoy" onPress={onSwapToday} style={styles.swapButton} />
        <GhostButton
          label="Cambiar en plantilla"
          onPress={onSwapPermanent}
          style={styles.swapButton}
        />
      </View>

      <View style={styles.divider} />

      <Overline>Series de hoy</Overline>
      {loggedSets.length === 0 ? (
        <Text style={styles.noSetsText}>Todavía no has registrado ninguna serie.</Text>
      ) : (
        <View style={styles.setList}>
          {loggedSets.map(set => (
            <FadeInView key={set.id} offset={10} duration={260}>
              <View style={styles.setRow}>
                <View style={styles.setNumber}>
                  <Text style={styles.setNumberText}>{set.setNumber}</Text>
                </View>
                <Text style={styles.setRowText}>
                  <Text style={styles.setRowStrong}>{set.weight}</Text> kg ×{' '}
                  <Text style={styles.setRowStrong}>{set.reps}</Text> reps
                </Text>
                <TouchableOpacity onPress={() => onRemoveSet(set.id)} hitSlop={8}>
                  <Text style={styles.removeSetText}>✕</Text>
                </TouchableOpacity>
              </View>
            </FadeInView>
          ))}
        </View>
      )}

      <View style={styles.addSetRow}>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Peso</Text>
          <TextInput
            value={weightText}
            onChangeText={setWeightText}
            onFocus={onInputFocus}
            placeholder="kg"
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            returnKeyType="done"
            style={styles.setInput}
          />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputLabel}>Reps</Text>
          <TextInput
            value={repsText}
            onChangeText={setRepsText}
            onFocus={onInputFocus}
            placeholder="reps"
            placeholderTextColor={colors.muted}
            keyboardType="number-pad"
            returnKeyType="done"
            style={styles.setInput}
          />
        </View>
        <TouchableOpacity style={styles.addSetButton} onPress={handleAdd} activeOpacity={0.85}>
          <PlusIcon size={20} color={colors.onAccent} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

export default function TodayScreen({ route }: Props) {
  const navigation = useNavigation<Nav>();
  const { activeSplit, currentDay, advanceToNextDay } = useRoutine();
  const {
    getActiveSession,
    addSet,
    removeSet,
    finishSession,
    getLastEntryForPosition,
    getLastEntryForMuscleGroupPosition,
  } = useSession();
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const { ref: listContainerRef, inset, visible: keyboardVisible } = useKeyboardInset();
  const listRef = useRef<FlatList<DayExerciseSlot>>(null);
  // Ejercicio cuyo input está enfocado; el "tick" repite el aviso en cada toque.
  const [focusRequest, setFocusRequest] = useState<{ index: number; tick: number } | null>(null);

  useEffect(() => {
    setOverrides({});
  }, [currentDay?.id]);

  useEffect(() => {
    if (!keyboardVisible) setFocusRequest(null);
  }, [keyboardVisible]);

  // Deja el ejercicio que se está editando justo por encima del teclado.
  useEffect(() => {
    if (!focusRequest || !keyboardVisible) return;
    const { index } = focusRequest;
    const task = requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index,
        viewPosition: 1,
        viewOffset: -(inset + spacing.md),
        animated: true,
      });
    });
    return () => cancelAnimationFrame(task);
  }, [focusRequest, keyboardVisible, inset]);

  useEffect(() => {
    const swap = route.params?.swap;
    if (!swap) return;
    setOverrides(prev => ({ ...prev, [swap.slotId]: swap.exerciseId }));
    navigation.setParams({ swap: undefined });
  }, [route.params?.swap, navigation]);

  const exercises = useMemo(() => {
    if (!currentDay) return [];
    return [...currentDay.exercises]
      .sort((a, b) => a.order - b.order)
      .map(slot => (overrides[slot.id] ? { ...slot, exerciseId: overrides[slot.id] } : slot));
  }, [currentDay, overrides]);

  const muscleGroupPositions = useMemo(
    () => computeMuscleGroupPositions(exercises),
    [exercises],
  );

  if (!activeSplit || !currentDay) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenHeader overline="Entrenamiento" title="Hoy" />
        <EmptyState
          title="No hay split activo"
          hint="Elige una rutina desde el menú principal para empezar a entrenar."
        />
      </SafeAreaView>
    );
  }

  const activeSession = getActiveSession(activeSplit.id, currentDay.id);
  const targetSets = currentDay.exercises.reduce((sum, slot) => sum + slot.targetSets, 0);
  const doneSets = activeSession?.sets.length ?? 0;

  const swapToday = (slot: DayExerciseSlot) => {
    navigation.navigate('ExercisePicker', {
      mode: 'today',
      dayId: currentDay.id,
      slotId: slot.id,
      currentExerciseId: slot.exerciseId,
    });
  };

  const swapPermanent = (slot: DayExerciseSlot) => {
    setOverrides(prev => {
      const next = { ...prev };
      delete next[slot.id];
      return next;
    });
    navigation.navigate('ExercisePicker', {
      mode: 'replace',
      splitId: activeSplit.id,
      dayId: currentDay.id,
      slotId: slot.id,
      currentExerciseId: slot.exerciseId,
    });
  };

  const handleFinish = () => {
    Alert.alert(
      'Terminar entrenamiento',
      `¿Marcar "${currentDay.name}" como completado y pasar al siguiente día del split?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Completar',
          onPress: () => {
            if (activeSession) finishSession(activeSession.id);
            advanceToNextDay();
          },
        },
      ],
    );
  };

  const renderItem = ({ item, index }: { item: DayExerciseSlot; index: number }) => {
    const positionInSession = index + 1;
    const positionInMuscleGroup = muscleGroupPositions.get(item.id);
    const loggedSets = (activeSession?.sets ?? []).filter(s => s.exerciseId === item.exerciseId);
    const suggestion =
      (positionInMuscleGroup !== undefined
        ? getLastEntryForMuscleGroupPosition(item.exerciseId, positionInMuscleGroup)
        : undefined) ?? getLastEntryForPosition(item.exerciseId, positionInSession);

    return (
      <FadeInView delay={Math.min(index, 4) * 60}>
        <ExerciseCard
          slot={item}
          positionInSession={positionInSession}
          positionInMuscleGroup={positionInMuscleGroup}
          loggedSets={loggedSets}
          suggested={suggestion ? { weight: suggestion.weight, reps: suggestion.reps } : undefined}
          onAddSet={(weight, reps) =>
            addSet({
              splitId: activeSplit.id,
              splitDayId: currentDay.id,
              dayName: currentDay.name,
              exerciseId: item.exerciseId,
              positionInSession,
              positionInMuscleGroup,
              weight,
              reps,
            })
          }
          onRemoveSet={setEntryId => activeSession && removeSet(activeSession.id, setEntryId)}
          onSwapToday={() => swapToday(item)}
          onSwapPermanent={() => swapPermanent(item)}
          onViewHistory={() =>
            navigation.navigate('ExerciseHistory', { exerciseId: item.exerciseId })
          }
          onInputFocus={() => setFocusRequest({ index, tick: Date.now() })}
        />
      </FadeInView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        overline={activeSplit.name}
        title={currentDay.name}
        subtitle={`${exercises.length} ejercicios · ${doneSets}/${targetSets} series registradas`}
        right={
          <TouchableOpacity
            style={styles.routineButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Routine')}
          >
            <Text style={styles.routineButtonText}>Rutina</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.listContainer} ref={listContainerRef}>
        <FlatList
          ref={listRef}
          data={exercises}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: TAB_BAR_SPACE + inset }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollToIndexFailed={noop}
          ListEmptyComponent={
            <View>
              <EmptyState
                title="Este día no tiene ejercicios todavía"
                hint="Añádelos desde el editor del día para empezar a registrar series."
              />
              <GhostButton
                label="+ Añadir ejercicios"
                dashed
                onPress={() =>
                  navigation.navigate('DayEditor', {
                    splitId: activeSplit.id,
                    dayId: currentDay.id,
                  })
                }
              />
            </View>
          }
          ListFooterComponent={
            exercises.length > 0 ? (
              <PrimaryButton
                label="Terminar entrenamiento"
                onPress={handleFinish}
                style={styles.finishButton}
              />
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  routineButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentDim,
  },
  routineButtonText: { color: colors.accent, fontWeight: '800', fontSize: 12 },
  listContainer: { flex: 1 },
  list: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
  },
  card: { gap: spacing.md },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  positionBadge: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBadgeDone: { backgroundColor: colors.accent },
  positionBadgeText: { color: colors.accent, fontWeight: '900', fontSize: 14 },
  positionBadgeTextDone: { color: colors.onAccent },
  cardHeadText: { flex: 1, gap: 2 },
  exerciseName: { color: colors.text, fontWeight: '800', fontSize: 17, letterSpacing: -0.2 },
  exerciseMeta: { color: colors.muted, fontSize: 12 },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaWrapper: { borderRadius: radius.md, overflow: 'hidden' },
  image: { width: '100%', height: 170, backgroundColor: colors.surfaceAlt },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imagePlaceholderText: { color: colors.muted, fontSize: 13 },
  targetPill: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(13, 14, 16, 0.82)',
  },
  targetPillText: { color: colors.text, fontWeight: '700', fontSize: 12 },
  donePill: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(13, 14, 16, 0.82)',
  },
  donePillComplete: { backgroundColor: colors.accent },
  donePillText: { color: colors.accent, fontWeight: '800', fontSize: 12 },
  donePillTextComplete: { color: colors.onAccent },
  swapRow: { flexDirection: 'row', gap: spacing.sm },
  swapButton: { flex: 1, paddingVertical: 11, paddingHorizontal: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border },
  noSetsText: { color: colors.muted, fontSize: 13 },
  setList: { gap: 6 },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  setNumber: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: { color: colors.accent, fontWeight: '800', fontSize: 11 },
  setRowText: { color: colors.textDim, fontSize: 14, flex: 1 },
  setRowStrong: { color: colors.text, fontWeight: '800' },
  removeSetText: { color: colors.danger, fontSize: 13, fontWeight: '700', paddingHorizontal: 4 },
  addSetRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' },
  inputWrapper: { flex: 1, gap: 4 },
  inputLabel: { ...overline, fontSize: 9.5, color: colors.muted, marginLeft: 2 },
  setInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  addSetButton: {
    width: 48,
    height: 46,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButton: { marginTop: spacing.xs },
});
