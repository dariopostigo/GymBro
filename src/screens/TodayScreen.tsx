import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  LayoutAnimation,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
import { getExerciseById } from '../data/exerciseCatalog';
import { computeMuscleGroupPositions } from '../utils/exerciseOrder';
import { getExerciseMediaSources } from '../utils/exerciseImages';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { TAB_BAR_SPACE } from '../components/MainTabBar';
import { REST_BAR_SPACE } from '../components/RestTimerBar';
import { restForSlot } from '../utils/restTimer';
import ExerciseImageCarousel from '../components/ExerciseImageCarousel';
import { ExerciseImagePlaceholder } from '../components/ExerciseThumbnail';
import ExerciseImageModal from '../components/ExerciseImageModal';
import ExerciseVideoModal from '../components/ExerciseVideoModal';
import FadeInView from '../components/FadeInView';
import MenuButton from '../components/MenuButton';
import {
  CheckIcon,
  ChevronIcon,
  CloseIcon,
  ExpandIcon,
  HistoryIcon,
  PlusIcon,
  TrendingUpIcon,
  VideoIcon,
} from '../components/icons';
import {
  Card,
  EmptyState,
  GhostButton,
  Overline,
  PrimaryButton,
  ScreenHeader,
  Stepper,
} from '../components/ui';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';
import type { DayExerciseSlot } from '../types/routine';
import type { SetEntry } from '../types/session';
import {
  formatWeight,
  lastSessionSets,
  suggestNextLoad,
  type LoadSuggestion,
} from '../utils/progression';
import { colors, overline, radius, spacing } from '../theme';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Today'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const noop = () => {};

// Mismos límites que el editor del día, para que plantilla y "solo hoy" coincidan.
const MIN_SETS = 1;
const MAX_SETS = 10;

interface ExerciseCardProps {
  slot: DayExerciseSlot;
  positionInSession: number;
  positionInMuscleGroup?: number;
  loggedSets: SetEntry[];
  suggested?: LoadSuggestion;
  onAddSet: (weight: number, reps: number) => void;
  onRemoveSet: (setEntryId: string) => void;
  onSwapToday: () => void;
  onSwapPermanent: () => void;
  onChangeSets: (delta: number) => void;
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
  onChangeSets,
  onViewHistory,
  onInputFocus,
}: ExerciseCardProps) {
  const exercise = getExerciseById(slot.exerciseId);
  const media = getExerciseMediaSources(exercise);
  const video = media.find(item => item.type === 'video');
  const [weightText, setWeightText] = useState(suggested ? String(suggested.weight) : '');
  const [repsText, setRepsText] = useState(suggested ? String(suggested.reps) : '');
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);

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
  // Los completados arrancan plegados; al completarse se pliegan solos y al dejar de estarlo
  // (se borra una serie o se suben las objetivo) se despliegan. El usuario puede alternar.
  const [collapsed, setCollapsed] = useState(isComplete);
  const wasComplete = useRef(isComplete);

  useEffect(() => {
    if (wasComplete.current === isComplete) return;
    wasComplete.current = isComplete;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed(isComplete);
  }, [isComplete]);

  const toggleCollapsed = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsed(c => !c);
  };

  return (
    <Card style={[styles.card, collapsed && isComplete && styles.cardDone]} elevated>
      <TouchableOpacity
        style={styles.cardHead}
        onPress={toggleCollapsed}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: !collapsed }}
        accessibilityLabel={collapsed ? 'Desplegar ejercicio' : 'Plegar ejercicio'}
      >
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
        <ChevronIcon direction={collapsed ? 'down' : 'up'} size={20} color={colors.muted} />
      </TouchableOpacity>

      {collapsed ? (
        <View style={styles.collapsedRow}>
          {isComplete ? (
            <View style={styles.completedChip}>
              <CheckIcon size={12} color={colors.onAccent} strokeWidth={3} />
              <Text style={styles.completedChipText}>Completado</Text>
            </View>
          ) : (
            <View style={styles.pendingChip}>
              <Text style={styles.pendingChipText}>
                {done}/{slot.targetSets}
              </Text>
            </View>
          )}
          <Text style={styles.collapsedSets} numberOfLines={1}>
            {loggedSets.length > 0
              ? loggedSets.map(set => `${set.weight}×${set.reps}`).join(' · ')
              : `${slot.targetSets} × ${slot.targetRepsMin}-${slot.targetRepsMax}`}
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.mediaWrapper}>
            {media.length > 0 ? (
              <>
                <ExerciseImageCarousel media={media} style={styles.image} />
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
              </>
            ) : (
              <ExerciseImagePlaceholder style={styles.image} iconSize={44} />
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

          <Stepper
            label="Series objetivo"
            layout="inline"
            value={slot.targetSets}
            minusDisabled={slot.targetSets <= MIN_SETS}
            plusDisabled={slot.targetSets >= MAX_SETS}
            onDecrease={() => onChangeSets(-1)}
            onIncrease={() => onChangeSets(1)}
          />

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
                      <View style={styles.removeSetIcon}>
                        <CloseIcon size={14} color={colors.danger} strokeWidth={2.5} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </FadeInView>
              ))}
            </View>
          )}

          {suggested && (
            <View style={styles.suggestion}>
              {suggested.increase && <TrendingUpIcon size={16} color={colors.accent} />}
              <Text style={styles.suggestionText}>
                {suggested.increase ? (
                  <Text style={styles.suggestionStrong}>
                    Sube a {formatWeight(suggested.weight)} kg ·{' '}
                  </Text>
                ) : null}
                Última vez: {formatWeight(suggested.previous.weight)} kg ×{' '}
                {suggested.previous.reps.join(' · ')}
                {suggested.increase ? '' : ` · intenta llegar a ${slot.targetRepsMax} en todas`}
              </Text>
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
        </>
      )}
    </Card>
  );
}

export default function TodayScreen() {
  const navigation = useNavigation<Nav>();
  const { activeSplit, currentDay, advanceToNextDay, getDayOverrides, setDayOverride } =
    useRoutine();
  const {
    getActiveSession,
    addSet,
    removeSet,
    finishSession,
    sessions,
  } = useSession();
  // Los cambios "solo por hoy" viven en el contexto: sobreviven a remontajes y al cierre de la app.
  const overrides = getDayOverrides(activeSplit?.id, currentDay?.id);
  const { settings } = useSettings();
  const { timer: restTimer, start: startRest } = useRestTimer();
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
    return [...currentDay.exercises]
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
    // La sesión de hoy no cuenta: la sugerencia no cambia a mitad del entreno.
    const suggestion = suggestNextLoad(
      lastSessionSets(
        sessions,
        item.exerciseId,
        { positionInSession, positionInMuscleGroup },
        activeSession?.id,
      ),
      { sets: item.targetSets, repsMin: item.targetRepsMin, repsMax: item.targetRepsMax },
      settings.weightIncrement,
    );

    return (
      <FadeInView delay={Math.min(index, 4) * 60}>
        <ExerciseCard
          slot={item}
          positionInSession={positionInSession}
          positionInMuscleGroup={positionInMuscleGroup}
          loggedSets={loggedSets}
          suggested={suggestion}
          onAddSet={(weight, reps) => {
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
            });
          }}
          onRemoveSet={setEntryId => activeSession && removeSet(activeSession.id, setEntryId)}
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
          contentContainerStyle={[
            styles.list,
            { paddingBottom: TAB_BAR_SPACE + (restTimer ? REST_BAR_SPACE : 0) + inset },
          ]}
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
  cardDone: { borderColor: colors.accentDim },
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
  exerciseName: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: -0.2,
  },
  exerciseMeta: { color: colors.muted, fontSize: 12 },
  collapsedRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  completedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  completedChipText: {
    color: colors.onAccent,
    fontWeight: '800',
    fontSize: 11,
  },
  pendingChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  pendingChipText: { color: colors.accent, fontWeight: '800', fontSize: 11 },
  collapsedSets: {
    flex: 1,
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '600',
  },
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
  removeSetIcon: { paddingHorizontal: 4 },
  suggestion: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  suggestionText: { flex: 1, color: colors.muted, fontSize: 12.5, lineHeight: 17 },
  suggestionStrong: { color: colors.accent, fontWeight: '800' },
  addSetRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' },
  inputWrapper: { flex: 1, gap: 4 },
  inputLabel: {
    ...overline,
    fontSize: 9.5,
    color: colors.muted,
    marginLeft: 2,
  },
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
