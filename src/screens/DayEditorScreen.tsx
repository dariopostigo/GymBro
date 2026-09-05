import React, { useMemo } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useRoutine } from '../context/RoutineContext';
import { getExerciseById } from '../data/exerciseCatalog';
import { getExerciseImageSources } from '../utils/exerciseImages';
import FadeInView from '../components/FadeInView';
import { ChevronIcon } from '../components/icons';
import { Card, EmptyState, GhostButton, Overline, ScreenHeader } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import type { DayExerciseSlot } from '../types/routine';
import { colors, overline, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DayEditor'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'DayEditor'>;

function reorder(exercises: DayExerciseSlot[]): DayExerciseSlot[] {
  return exercises.map((ex, index) => ({ ...ex, order: index }));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function Stepper({
  label,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <View style={styles.stepper}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity onPress={onDecrease} style={styles.stepperButton} activeOpacity={0.7}>
          <Text style={styles.stepperButtonText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepperValue}>{value}</Text>
        <TouchableOpacity onPress={onIncrease} style={styles.stepperButton} activeOpacity={0.7}>
          <Text style={styles.stepperButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DayEditorScreen({ route }: Props) {
  const { splitId, dayId } = route.params;
  const navigation = useNavigation<Nav>();
  const { splits, updateDayExercises } = useRoutine();

  const split = useMemo(() => splits.find(s => s.id === splitId), [splits, splitId]);
  const day = useMemo(() => split?.days.find(d => d.id === dayId), [split, dayId]);

  const exercises = useMemo(
    () => [...(day?.exercises ?? [])].sort((a, b) => a.order - b.order),
    [day],
  );

  if (!split || !day) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <EmptyState title="Día no encontrado" />
      </SafeAreaView>
    );
  }

  const persist = (next: DayExerciseSlot[]) => {
    updateDayExercises(splitId, dayId, reorder(next));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...exercises];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    persist(next);
  };

  const moveDown = (index: number) => {
    if (index === exercises.length - 1) return;
    const next = [...exercises];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    persist(next);
  };

  const removeExercise = (slotId: string) => {
    persist(exercises.filter(e => e.id !== slotId));
  };

  const updateSlot = (slotId: string, patch: Partial<DayExerciseSlot>) => {
    persist(exercises.map(e => (e.id === slotId ? { ...e, ...patch } : e)));
  };

  const changeSets = (slot: DayExerciseSlot, delta: number) => {
    updateSlot(slot.id, { targetSets: clamp(slot.targetSets + delta, 1, 10) });
  };

  const changeRepsMin = (slot: DayExerciseSlot, delta: number) => {
    updateSlot(slot.id, { targetRepsMin: clamp(slot.targetRepsMin + delta, 1, slot.targetRepsMax) });
  };

  const changeRepsMax = (slot: DayExerciseSlot, delta: number) => {
    updateSlot(slot.id, {
      targetRepsMax: clamp(slot.targetRepsMax + delta, slot.targetRepsMin, 50),
    });
  };

  const renderItem = ({ item, index }: { item: DayExerciseSlot; index: number }) => {
    const exercise = getExerciseById(item.exerciseId);
    const thumbnail = getExerciseImageSources(exercise)[0];
    const isFirst = index === 0;
    const isLast = index === exercises.length - 1;

    return (
      <FadeInView delay={Math.min(index, 4) * 60}>
        <Card style={styles.exerciseCard}>
          <View style={styles.exerciseRow}>
            {thumbnail ? (
              <Image source={thumbnail} style={styles.thumbnail} />
            ) : (
              <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                <Text style={styles.thumbnailPlaceholderText}>Sin{'\n'}imagen</Text>
              </View>
            )}

            <View style={styles.exerciseInfo}>
              <Text style={styles.exerciseName} numberOfLines={2}>
                {exercise?.name ?? `Ejercicio #${item.exerciseId}`}
              </Text>
              <Text style={styles.exerciseMeta} numberOfLines={1}>
                {exercise?.category.name}
                {exercise?.musclesPrimary.length
                  ? ` · ${exercise.musclesPrimary.map(m => m.name).join(', ')}`
                  : ''}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('ExercisePicker', {
                    mode: 'replace',
                    splitId,
                    dayId,
                    slotId: item.id,
                    currentExerciseId: item.exerciseId,
                  })
                }
              >
                <Text style={styles.replaceText}>Cambiar ejercicio</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.orderButtons}>
              <TouchableOpacity
                onPress={() => moveUp(index)}
                disabled={isFirst}
                style={[styles.orderButton, isFirst && styles.orderButtonDisabled]}
              >
                <ChevronIcon
                  direction="up"
                  size={14}
                  color={isFirst ? colors.border : colors.text}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => moveDown(index)}
                disabled={isLast}
                style={[styles.orderButton, isLast && styles.orderButtonDisabled]}
              >
                <ChevronIcon
                  direction="down"
                  size={14}
                  color={isLast ? colors.border : colors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.targetsRow}>
            <Stepper
              label="Series"
              value={item.targetSets}
              onDecrease={() => changeSets(item, -1)}
              onIncrease={() => changeSets(item, 1)}
            />
            <Stepper
              label="Reps min"
              value={item.targetRepsMin}
              onDecrease={() => changeRepsMin(item, -1)}
              onIncrease={() => changeRepsMin(item, 1)}
            />
            <Stepper
              label="Reps max"
              value={item.targetRepsMax}
              onDecrease={() => changeRepsMax(item, -1)}
              onIncrease={() => changeRepsMax(item, 1)}
            />
          </View>

          <TouchableOpacity onPress={() => removeExercise(item.id)} style={styles.removeButton}>
            <Text style={styles.removeButtonText}>Quitar del día</Text>
          </TouchableOpacity>
        </Card>
      </FadeInView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={exercises}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerBlock}>
            <ScreenHeader
              overline={split.name}
              title={day.name}
              subtitle={`${exercises.length} ejercicios · mantén el orden en el que los harás`}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Este día está vacío"
            hint="Añade los ejercicios que quieras entrenar en esta sesión."
          />
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Overline>Añadir</Overline>
            <GhostButton
              label="+ Añadir ejercicio"
              dashed
              onPress={() => navigation.navigate('ExercisePicker', { mode: 'add', splitId, dayId })}
            />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  list: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl, gap: spacing.md },
  headerBlock: { marginHorizontal: -spacing.xxl },
  exerciseCard: { gap: spacing.lg },
  exerciseRow: { flexDirection: 'row', gap: spacing.md },
  thumbnail: { width: 64, height: 64, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  thumbnailPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  thumbnailPlaceholderText: { color: colors.muted, fontSize: 10, textAlign: 'center' },
  exerciseInfo: { flex: 1, gap: 3 },
  exerciseName: { color: colors.text, fontWeight: '800', fontSize: 15 },
  exerciseMeta: { color: colors.muted, fontSize: 12 },
  replaceText: { color: colors.accent, fontSize: 12, fontWeight: '700', marginTop: 2 },
  orderButtons: { gap: 6 },
  orderButton: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderButtonDisabled: { opacity: 0.4 },
  targetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  stepper: { alignItems: 'center', gap: 6, flex: 1 },
  stepperLabel: { ...overline, fontSize: 9, color: colors.muted },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepperButton: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: { color: colors.accent, fontSize: 15, fontWeight: '800', lineHeight: 18 },
  stepperValue: { color: colors.text, fontWeight: '800', fontSize: 15, minWidth: 22, textAlign: 'center' },
  removeButton: { alignSelf: 'flex-start' },
  removeButtonText: { color: colors.danger, fontSize: 12, fontWeight: '700' },
  footer: { gap: spacing.sm, marginTop: spacing.xs },
});
