import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRoutine } from '../context/RoutineContext';
import { useSession } from '../context/SessionContext';
import { getExerciseById, isBodyweight, isTimed, isUnilateral } from '../data/exerciseCatalog';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { CheckIcon, ChevronIcon, CloseIcon } from '../components/icons';
import { Card, Chip, EmptyState, GhostButton, Overline } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import type { SetEntry, WorkoutSession } from '../types/session';
import { formatLoad, formatReps, formatWeight } from '../utils/progression';
import { dayKey, formatFullDate } from '../utils/stats';
import { colors, overline, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'EditWorkout'>;

/** Un ejercicio del entreno con sus series, en el orden en que se hizo. */
interface ExerciseGroup {
  exerciseId: number;
  positionInSession: number;
  positionInMuscleGroup?: number;
  sets: SetEntry[];
}

function groupByExercise(session: WorkoutSession): ExerciseGroup[] {
  const groups = new Map<number, ExerciseGroup>();
  for (const set of session.sets) {
    const group = groups.get(set.exerciseId);
    if (group) group.sets.push(set);
    else
      groups.set(set.exerciseId, {
        exerciseId: set.exerciseId,
        positionInSession: set.positionInSession,
        positionInMuscleGroup: set.positionInMuscleGroup,
        sets: [set],
      });
  }
  return [...groups.values()].sort((a, b) => a.positionInSession - b.positionInSession);
}

const parseWeight = (text: string) => parseFloat(text.replace(',', '.'));

/** Peso y reps (o segundos) de una serie: para corregir una o para añadir otra. */
function SetForm({
  bodyweight,
  timed,
  initial,
  onSave,
  onCancel,
}: {
  bodyweight: boolean;
  timed: boolean;
  initial?: { weight: number; reps: number };
  onSave: (weight: number, reps: number) => void;
  onCancel: () => void;
}) {
  const [weightText, setWeightText] = useState(
    initial ? formatWeight(initial.weight) : bodyweight ? '0' : '',
  );
  const [repsText, setRepsText] = useState(initial ? String(initial.reps) : '');

  const save = () => {
    const weight = parseWeight(weightText);
    const reps = parseInt(repsText, 10);
    const validWeight = Number.isFinite(weight) && (bodyweight ? weight >= 0 : weight > 0);
    if (!validWeight || !Number.isFinite(reps) || reps <= 0) {
      Alert.alert(
        'Datos inválidos',
        timed
          ? 'Introduce un peso y unos segundos válidos.'
          : 'Introduce un peso y unas repeticiones válidas.',
      );
      return;
    }
    onSave(weight, reps);
  };

  return (
    <View style={styles.form}>
      <TextInput
        value={weightText}
        onChangeText={setWeightText}
        placeholder={bodyweight ? 'lastre' : 'kg'}
        placeholderTextColor={colors.muted}
        keyboardType="decimal-pad"
        style={styles.input}
        accessibilityLabel={bodyweight ? 'Lastre en kilos' : 'Peso en kilos'}
      />
      <Text style={styles.formTimes}>{timed ? '·' : '×'}</Text>
      <TextInput
        value={repsText}
        onChangeText={setRepsText}
        placeholder={timed ? 'seg' : 'reps'}
        placeholderTextColor={colors.muted}
        keyboardType="number-pad"
        style={styles.input}
        autoFocus={!initial}
        accessibilityLabel={timed ? 'Segundos' : 'Repeticiones'}
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={save}
        activeOpacity={0.85}
        accessibilityLabel="Guardar la serie"
      >
        <CheckIcon size={18} color={colors.onAccent} strokeWidth={3} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onCancel} hitSlop={8} accessibilityLabel="Cancelar">
        <CloseIcon size={16} color={colors.muted} />
      </TouchableOpacity>
    </View>
  );
}

/**
 * Corregir un entreno ya guardado o apuntar uno hecho sin la app: series, ejercicios,
 * qué día de la rutina fue y en qué fecha. Los récords y el progreso salen solos del
 * historial corregido.
 */
export default function EditWorkoutScreen({ route, navigation }: Props) {
  const { sessionId, addExerciseId } = route.params;
  const {
    sessions,
    addSetToSession,
    updateSet,
    removeSet,
    updateSessionDay,
    moveSession,
    deleteSession,
  } = useSession();
  const { activeSplit } = useRoutine();
  const { ref: containerRef, inset } = useKeyboardInset();
  const session = sessions.find(s => s.id === sessionId);

  const splitDays = activeSplit && activeSplit.id === session?.splitId ? activeSplit.days : [];
  const dayExercises = (dayId?: string) =>
    [...(splitDays.find(d => d.id === dayId)?.exercises ?? [])]
      .sort((a, b) => a.order - b.order)
      .map(slot => slot.exerciseId);

  // Ejercicios añadidos que aún no tienen series (en el historial solo existen las series).
  // Un entreno nuevo arranca con los de su día de la rutina, para ir rellenándolos.
  const [pending, setPending] = useState<number[]>(() =>
    session?.sets.length === 0 ? dayExercises(session.splitDayId) : [],
  );
  // Qué se está editando: una serie (`setId`) o una nueva para un ejercicio (`addTo`).
  const [editing, setEditing] = useState<{ setId: string } | { addTo: number } | null>(null);

  const groups = useMemo(() => (session ? groupByExercise(session) : []), [session]);
  const logged = new Set(groups.map(g => g.exerciseId));
  const pendingIds = pending.filter(id => !logged.has(id));

  // El buscador devuelve aquí el ejercicio elegido.
  useEffect(() => {
    if (addExerciseId === undefined) return;
    setPending(prev => (prev.includes(addExerciseId) ? prev : [...prev, addExerciseId]));
    setEditing({ addTo: addExerciseId });
    navigation.setParams({ addExerciseId: undefined });
  }, [addExerciseId, navigation]);

  // Un entreno nuevo que se deja sin ninguna serie no se queda guardado vacío. Al salir de
  // la pantalla de verdad, no al abrir el buscador de ejercicios encima.
  const latest = useRef(session);
  latest.current = session;
  useEffect(
    () =>
      navigation.addListener('beforeRemove', () => {
        if (latest.current && latest.current.sets.length === 0) deleteSession(latest.current.id);
      }),
    [navigation, deleteSession],
  );

  if (!session) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <EmptyState title="No se encuentra este entrenamiento" />
      </SafeAreaView>
    );
  }

  const today = dayKey(new Date());
  const canMoveForward = dayKey(new Date(Date.parse(session.date) + 86_400_000)) <= today;
  const pickDay = (dayId: string) => {
    const day = splitDays.find(d => d.id === dayId);
    if (!day || day.id === session.splitDayId) return;
    updateSessionDay(session.id, {
      splitId: session.splitId,
      splitDayId: day.id,
      dayName: day.name,
    });
    // En un entreno nuevo, el día elegido trae sus ejercicios para ir rellenándolos.
    if (session.sets.length === 0) {
      setPending(dayExercises(day.id));
      setEditing(null);
    }
  };

  const addSet = (exerciseId: number, weight: number, reps: number) => {
    const group = groups.find(g => g.exerciseId === exerciseId);
    if (group) {
      addSetToSession(session.id, {
        exerciseId,
        positionInSession: group.positionInSession,
        positionInMuscleGroup: group.positionInMuscleGroup,
        weight,
        reps,
        perSide: isUnilateral(exerciseId),
      });
    } else {
      // Ejercicio nuevo en el entreno: va detrás de los que ya tienen series.
      const category = getExerciseById(exerciseId)?.category.id;
      const sameCategory = groups.filter(
        g => getExerciseById(g.exerciseId)?.category.id === category,
      ).length;
      addSetToSession(session.id, {
        exerciseId,
        positionInSession: Math.max(0, ...groups.map(g => g.positionInSession)) + 1,
        positionInMuscleGroup: sameCategory + 1,
        weight,
        reps,
        perSide: isUnilateral(exerciseId),
      });
    }
    setEditing(null);
  };

  const confirmRemoveSet = (set: SetEntry) =>
    Alert.alert('¿Borrar la serie?', undefined, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => removeSet(session.id, set.id) },
    ]);

  const confirmRemoveExercise = (group: ExerciseGroup) =>
    Alert.alert(
      '¿Quitar el ejercicio?',
      group.sets.length === 1
        ? 'Se borra su serie de este entreno.'
        : `Se borran sus ${group.sets.length} series de este entreno.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: () => group.sets.forEach(set => removeSet(session.id, set.id)),
        },
      ],
    );

  const confirmDeleteSession = () =>
    Alert.alert('¿Borrar el entreno?', 'Se borran todas sus series. No se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => {
          deleteSession(session.id);
          navigation.popTo('Main');
        },
      },
    ]);

  const renderExercise = (exerciseId: number, sets: SetEntry[], group?: ExerciseGroup) => {
    const exercise = getExerciseById(exerciseId);
    const bodyweight = isBodyweight(exerciseId);
    const timed = isTimed(exerciseId);
    const adding = editing && 'addTo' in editing && editing.addTo === exerciseId;
    const last = sets[sets.length - 1];
    return (
      <Card key={exerciseId} style={styles.exerciseCard}>
        <View style={styles.exerciseHead}>
          <Text style={styles.exerciseName} numberOfLines={2}>
            {exercise?.name ?? `Ejercicio #${exerciseId}`}
          </Text>
          {group && (
            <TouchableOpacity
              onPress={() => confirmRemoveExercise(group)}
              hitSlop={8}
              accessibilityLabel="Quitar el ejercicio del entreno"
            >
              <Text style={styles.removeExercise}>Quitar</Text>
            </TouchableOpacity>
          )}
        </View>

        {sets.map(set =>
          editing && 'setId' in editing && editing.setId === set.id ? (
            <SetForm
              key={set.id}
              bodyweight={bodyweight}
              timed={timed}
              initial={set}
              onSave={(weight, reps) => {
                updateSet(session.id, set.id, { weight, reps, rir: set.rir });
                setEditing(null);
              }}
              onCancel={() => setEditing(null)}
            />
          ) : (
            <View key={set.id} style={styles.setRow}>
              <View style={styles.setNumber}>
                <Text style={styles.setNumberText}>{set.setNumber}</Text>
              </View>
              <TouchableOpacity
                style={styles.setBody}
                onPress={() => setEditing({ setId: set.id })}
                activeOpacity={0.7}
                accessibilityLabel={`Corregir la serie ${set.setNumber}`}
              >
                <Text style={styles.setText}>
                  <Text style={styles.setStrong}>{formatLoad(set.weight, bodyweight)}</Text>
                  {set.weight > 0 ? ' kg' : ''}
                  {timed ? ' · ' : ' × '}
                  <Text style={styles.setStrong}>{formatReps(set.reps, timed)}</Text>
                  {timed ? '' : ' reps'}
                  {set.perSide ? ' por lado' : ''}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => confirmRemoveSet(set)}
                hitSlop={8}
                accessibilityLabel={`Borrar la serie ${set.setNumber}`}
              >
                <CloseIcon size={14} color={colors.danger} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          ),
        )}

        {adding ? (
          <SetForm
            bodyweight={bodyweight}
            timed={timed}
            initial={last && { weight: last.weight, reps: last.reps }}
            onSave={(weight, reps) => addSet(exerciseId, weight, reps)}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <TouchableOpacity
            onPress={() => setEditing({ addTo: exerciseId })}
            activeOpacity={0.7}
            style={styles.addSet}
          >
            <Text style={styles.addSetText}>+ Añadir serie</Text>
          </TouchableOpacity>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container} ref={containerRef}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl + inset }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Card style={styles.dateCard}>
            <TouchableOpacity
              onPress={() => moveSession(session.id, -1)}
              hitSlop={10}
              accessibilityLabel="Un día antes"
            >
              <ChevronIcon direction="left" size={20} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.dateText}>
              <Overline>Fecha</Overline>
              <Text style={styles.date}>{formatFullDate(session.date)}</Text>
            </View>
            <TouchableOpacity
              onPress={() => moveSession(session.id, 1)}
              disabled={!canMoveForward}
              hitSlop={10}
              accessibilityLabel="Un día después"
            >
              <ChevronIcon
                direction="right"
                size={20}
                color={canMoveForward ? colors.text : colors.border}
              />
            </TouchableOpacity>
          </Card>

          {splitDays.length > 0 && (
            <View style={styles.section}>
              <Overline>Día de la rutina</Overline>
              <View style={styles.chips}>
                {splitDays.map(day => (
                  <Chip
                    key={day.id}
                    label={day.name}
                    active={day.id === session.splitDayId}
                    onPress={() => pickDay(day.id)}
                  />
                ))}
              </View>
            </View>
          )}

          {groups.length === 0 && pendingIds.length === 0 && (
            <Text style={styles.hint}>
              Elige qué día de la rutina fue para traer sus ejercicios, o añádelos uno a uno.
            </Text>
          )}

          {groups.map(group => renderExercise(group.exerciseId, group.sets, group))}
          {pendingIds.map(id => renderExercise(id, []))}

          <GhostButton
            label="+ Añadir ejercicio"
            dashed
            onPress={() => navigation.navigate('ExercisePicker', { mode: 'sessionAdd', sessionId })}
          />

          {session.sets.length > 0 && (
            <TouchableOpacity onPress={confirmDeleteSession} style={styles.deleteSession}>
              <Text style={styles.deleteSessionText}>Borrar el entreno</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.xxl, paddingTop: spacing.md, gap: spacing.lg },
  dateCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  dateText: { flex: 1, alignItems: 'center', gap: 2 },
  date: { color: colors.text, fontSize: 17, fontWeight: '800' },
  section: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  exerciseCard: { gap: spacing.sm },
  exerciseHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  exerciseName: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '800' },
  removeExercise: { color: colors.danger, fontSize: 12.5, fontWeight: '700' },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  setNumber: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberText: { color: colors.accent, fontWeight: '800', fontSize: 11 },
  setBody: { flex: 1 },
  setText: { color: colors.textDim, fontSize: 14 },
  setStrong: { color: colors.text, fontWeight: '800' },
  form: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  formTimes: { color: colors.muted, fontSize: 15, fontWeight: '700' },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 10,
  },
  saveButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSet: { paddingVertical: 6 },
  addSetText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  deleteSession: { alignItems: 'center', paddingVertical: spacing.md },
  deleteSessionText: { ...overline, color: colors.danger },
});
