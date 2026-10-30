import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import KeepAwake from '@sayem314/react-native-keep-awake';
import { useRestTimer } from '../context/RestTimerContext';
import { useRoutine } from '../context/RoutineContext';
import { useSession } from '../context/SessionContext';
import { useSettings } from '../context/SettingsContext';
import { useWeightStacks } from '../context/WeightStacksContext';
import {
  defaultBackupId,
  getExerciseById,
  isBodyweight,
  isUnilateral,
} from '../data/exerciseCatalog';
import { computeMuscleGroupPositions } from '../utils/exerciseOrder';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { useTabScreenBottomSpace } from '../components/RestTimerBar';
import { restForSlot } from '../utils/restTimer';
import ExerciseCard, {
  MAX_SETS,
  MIN_SETS,
  type ExerciseCardProps,
} from '../components/ExerciseCard';
import FadeInView from '../components/FadeInView';
import MenuButton from '../components/MenuButton';
import { EmptyState, GhostButton, PrimaryButton, ScreenHeader } from '../components/ui';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import type { DayExerciseSlot } from '../types/routine';
import { recentSessionSets, suggestNextLoad } from '../utils/progression';
import { liveRecords, type PersonalRecord } from '../utils/workoutSummary';
import { barTypeFor, barWeightFor } from '../utils/plates';
import { colors, radius, spacing } from '../theme';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Today'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const noop = () => {};
const NO_RECORDS = new Map<string, PersonalRecord>();

export default function TodayScreen() {
  const bottomSpace = useTabScreenBottomSpace();
  const navigation = useNavigation<Nav>();
  const { activeSplit, currentDay, advanceToNextDay, getDayOverrides, setDayOverride } =
    useRoutine();
  const { getActiveSession, addSet, removeSet, updateSet, finishSession, sessions } = useSession();
  // Los cambios "solo por hoy" viven en el contexto: sobreviven a remontajes y al cierre de la app.
  const overrides = getDayOverrides(activeSplit?.id, currentDay?.id);
  const { settings } = useSettings();
  const { start: startRest } = useRestTimer();
  const { getWeights } = useWeightStacks();
  const isFocused = useIsFocused();
  const { ref: listContainerRef, inset, visible: keyboardVisible } = useKeyboardInset();
  const listRef = useRef<FlatList<DayExerciseSlot>>(null);
  // Ejercicio cuyo input está enfocado; el "tick" repite el aviso en cada toque.
  const [focusRequest, setFocusRequest] = useState<{
    index: number;
    tick: number;
  } | null>(null);

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

  const exercises = useMemo(() => {
    if (!currentDay) return [];
    const template = [...currentDay.exercises]
      .sort((a, b) => a.order - b.order)
      .map(slot => {
        const override = overrides[slot.id];
        if (!override) return slot;
        return {
          ...slot,
          exerciseId: override.exerciseId ?? slot.exerciseId,
          targetSets: override.targetSets ?? slot.targetSets,
        };
      });
    // Los añadidos solo para hoy van al final, en el orden en que se añadieron.
    const extras = Object.entries(overrides).flatMap(([slotId, override]) =>
      override.extra && override.exerciseId !== undefined
        ? [
            {
              id: slotId,
              exerciseId: override.exerciseId,
              order: Number.MAX_SAFE_INTEGER,
              targetSets: override.targetSets ?? 3,
              targetRepsMin: override.extra.repsMin,
              targetRepsMax: override.extra.repsMax,
            },
          ]
        : [],
    );
    return [...template, ...extras];
  }, [currentDay, overrides]);

  const muscleGroupPositions = useMemo(() => computeMuscleGroupPositions(exercises), [exercises]);

  if (!activeSplit || !currentDay) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScreenHeader overline="Entrenamiento" title="Hoy" left={<MenuButton />} />
        <EmptyState
          title="No hay split activo"
          hint="Elige una rutina desde el menú principal para empezar a entrenar."
        />
      </SafeAreaView>
    );
  }

  const activeSession = getActiveSession(activeSplit.id, currentDay.id);
  // Con los ajustes de hoy aplicados: el objetivo del encabezado es el de la sesión real.
  const targetSets = exercises.reduce((sum, slot) => sum + slot.targetSets, 0);
  const doneSets = activeSession?.sets.length ?? 0;

  const swapToday = (slot: DayExerciseSlot) => {
    navigation.navigate('ExercisePicker', {
      mode: 'today',
      splitId: activeSplit.id,
      dayId: currentDay.id,
      slotId: slot.id,
      currentExerciseId: slot.exerciseId,
    });
  };

  const swapPermanent = (slot: DayExerciseSlot) => {
    navigation.navigate('ExercisePicker', {
      mode: 'replace',
      splitId: activeSplit.id,
      dayId: currentDay.id,
      slotId: slot.id,
      currentExerciseId: slot.exerciseId,
    });
  };

  const changeSets = (slot: DayExerciseSlot, delta: number) => {
    const next = Math.min(Math.max(slot.targetSets + delta, MIN_SETS), MAX_SETS);
    if (next === slot.targetSets) return;
    // Volver al valor de la plantilla borra el ajuste en vez de guardarlo repetido.
    const template = currentDay.exercises.find(s => s.id === slot.id)?.targetSets;
    setDayOverride(activeSplit.id, currentDay.id, slot.id, {
      targetSets: next === template ? undefined : next,
    });
  };

  // El plan B es el de la plantilla (o el de por defecto del ejercicio); usarlo hoy es un
  // cambio "solo hoy" que se deshace igual.
  const planBFor = (slot: DayExerciseSlot): ExerciseCardProps['planB'] => {
    const template = currentDay.exercises.find(s => s.id === slot.id);
    if (!template) return undefined;
    const backupId = template.backupExerciseId ?? defaultBackupId(template.exerciseId);
    if (backupId === undefined) return undefined;
    if (slot.exerciseId === backupId) {
      const main = getExerciseById(template.exerciseId);
      return {
        label: `Volver a ${main?.name ?? 'el ejercicio principal'}`,
        onPress: () =>
          setDayOverride(activeSplit.id, currentDay.id, slot.id, { exerciseId: undefined }),
      };
    }
    const backup = getExerciseById(backupId);
    return {
      label: `Plan B: ${backup?.name ?? `Ejercicio #${backupId}`}`,
      onPress: () =>
        setDayOverride(activeSplit.id, currentDay.id, slot.id, { exerciseId: backupId }),
    };
  };

  // Las series que ya tenga se quedan en la sesión; solo deja de salir en Hoy.
  const removeExtra = (slot: DayExerciseSlot) => {
    const exercise = getExerciseById(slot.exerciseId);
    const name = exercise?.name ?? 'este ejercicio';
    Alert.alert('Quitar de hoy', `¿Quitar "${name}" del entreno de hoy?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Quitar',
        style: 'destructive',
        onPress: () =>
          setDayOverride(activeSplit.id, currentDay.id, slot.id, {
            exerciseId: undefined,
            targetSets: undefined,
            extra: undefined,
            collapsed: undefined,
          }),
      },
    ]);
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
            if (activeSession?.sets.length) {
              navigation.navigate('WorkoutSummary', { sessionId: activeSession.id });
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item, index }: { item: DayExerciseSlot; index: number }) => {
    const positionInSession = index + 1;
    const positionInMuscleGroup = muscleGroupPositions.get(item.id);
    const loggedSets = (activeSession?.sets ?? []).filter(s => s.exerciseId === item.exerciseId);
    const records = activeSession
      ? liveRecords(item.exerciseId, activeSession, sessions)
      : NO_RECORDS;
    const planB = planBFor(item);
    const weights = getWeights(item.exerciseId);
    const bodyweight = isBodyweight(item.exerciseId);
    // Con el peso del cuerpo no hay barra ni discos que calcular.
    const barType = bodyweight ? undefined : barTypeFor(getExerciseById(item.exerciseId));
    const loading = barType && {
      type: barType,
      bar: barWeightFor(barType, settings.barWeights),
      plates: settings.plates,
    };
    // La sesión de hoy no cuenta: la sugerencia no cambia a mitad del entreno.
    const [lastTime = [], ...earlier] = recentSessionSets(
      sessions,
      item.exerciseId,
      { positionInSession, positionInMuscleGroup },
      activeSession?.id,
    );
    const suggestion = suggestNextLoad(
      lastTime,
      { sets: item.targetSets, repsMin: item.targetRepsMin, repsMax: item.targetRepsMax },
      settings.weightIncrement,
      weights,
      bodyweight,
      earlier,
    );

    return (
      <FadeInView delay={Math.min(index, 4) * 60}>
        <ExerciseCard
          slot={item}
          positionInSession={positionInSession}
          positionInMuscleGroup={positionInMuscleGroup}
          loggedSets={loggedSets}
          records={records}
          suggested={suggestion}
          planB={planB}
          effortMode={settings.effortMode}
          weights={weights}
          unilateral={isUnilateral(item.exerciseId)}
          bodyweight={bodyweight}
          loading={loading}
          onAddSet={(weight, reps, rir) => {
            startRest(settings.autoRest ? restForSlot(item) : undefined);
            addSet({
              splitId: activeSplit.id,
              splitDayId: currentDay.id,
              dayName: currentDay.name,
              exerciseId: item.exerciseId,
              positionInSession,
              positionInMuscleGroup,
              weight,
              reps,
              rir,
              perSide: isUnilateral(item.exerciseId),
            });
          }}
          extra={Boolean(overrides[item.id]?.extra)}
          onUpdateSet={(setEntryId, weight, reps, rir) =>
            activeSession && updateSet(activeSession.id, setEntryId, { weight, reps, rir })
          }
          onRemoveSet={setEntryId => activeSession && removeSet(activeSession.id, setEntryId)}
          onRemoveExtra={() => removeExtra(item)}
          collapsedOverride={overrides[item.id]?.collapsed}
          onCollapsedChange={collapsed =>
            setDayOverride(activeSplit.id, currentDay.id, item.id, { collapsed })
          }
          onSwapToday={() => swapToday(item)}
          onSwapPermanent={() => swapPermanent(item)}
          onChangeSets={delta => changeSets(item, delta)}
          onViewHistory={() =>
            navigation.navigate('ExerciseHistory', {
              exerciseId: item.exerciseId,
            })
          }
          onInputFocus={() => setFocusRequest({ index, tick: Date.now() })}
        />
      </FadeInView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {settings.keepScreenOn && isFocused && <KeepAwake />}
      <ScreenHeader
        overline={activeSplit.name}
        title={currentDay.name}
        subtitle={`${exercises.length} ejercicios · ${doneSets}/${targetSets} series registradas`}
        left={<MenuButton />}
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
          // El ejercicio entra en la key: al cambiarlo, la tarjeta se rehace con su sugerencia.
          keyExtractor={item => `${item.id}:${item.exerciseId}`}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: bottomSpace + inset }]}
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
              <View style={styles.footer}>
                <GhostButton
                  label="+ Añadir ejercicio solo para hoy"
                  dashed
                  onPress={() =>
                    navigation.navigate('ExercisePicker', {
                      mode: 'todayAdd',
                      splitId: activeSplit.id,
                      dayId: currentDay.id,
                    })
                  }
                />
                <PrimaryButton label="Terminar entrenamiento" onPress={handleFinish} />
              </View>
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
  footer: { gap: spacing.md, marginTop: spacing.xs },
});
