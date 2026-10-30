import React, { useLayoutEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCustomExercises } from '../context/CustomExercisesContext';
import { useRoutine } from '../context/RoutineContext';
import { useSession } from '../context/SessionContext';
import { CATEGORIES, CATEGORY_REFS, MUSCLES, getCustomExercise } from '../data/exerciseCatalog';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { pickExercisePhoto } from '../storage/customExercisePhotos';
import { PlusIcon } from '../components/icons';
import { Chip, Overline, PrimaryButton } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import type { MuscleRef } from '../types/exercise';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomExercise'>;

type MuscleLevel = 'primary' | 'secondary';

/** Músculo principal que se marca solo al elegir la categoría (Cardio no tiene). */
const CATEGORY_MUSCLE: Record<string, number> = {
  Abdominales: 6,
  Antebrazos: 16,
  Bíceps: 1,
  Cuádriceps: 10,
  Espalda: 12,
  Femoral: 11,
  Gemelos: 7,
  Glúteos: 8,
  Hombros: 2,
  Pecho: 4,
  Tríceps: 5,
};

/** Al tocar un músculo: nada → principal → secundario → nada. */
const NEXT_LEVEL: Record<MuscleLevel | 'none', MuscleLevel | undefined> = {
  none: 'primary',
  primary: 'secondary',
  secondary: undefined,
};

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceHigh, true: colors.accentDim }}
        thumbColor={value ? colors.accent : colors.muted}
        accessibilityLabel={label}
      />
    </View>
  );
}

/** Crear un ejercicio propio o editar uno ya creado (`exerciseId`). */
export default function CustomExerciseScreen({ route, navigation }: Props) {
  const editingId = route.params?.exerciseId;
  const original = editingId !== undefined ? getCustomExercise(editingId) : undefined;
  const { saveCustomExercise, removeCustomExercise } = useCustomExercises();
  const { sessions } = useSession();
  const { splits, activeSplit, getDayOverrides } = useRoutine();
  const { ref: containerRef, inset } = useKeyboardInset();

  const [name, setName] = useState(original?.name ?? '');
  const [category, setCategory] = useState(original?.category.name ?? '');
  const [muscles, setMuscles] = useState<Map<number, MuscleLevel>>(
    () =>
      new Map([
        ...(original?.musclesPrimary ?? []).map(m => [m.id, 'primary'] as const),
        ...(original?.musclesSecondary ?? []).map(m => [m.id, 'secondary'] as const),
      ]),
  );
  const [photo, setPhoto] = useState<string | undefined>(original?.images[0]);
  const [bodyweight, setBodyweight] = useState(original?.bodyweight ?? false);
  const [timed, setTimed] = useState(original?.timed ?? false);
  const [unilateral, setUnilateral] = useState(original?.unilateral ?? false);
  const [description, setDescription] = useState(original?.description ?? '');

  useLayoutEffect(() => {
    navigation.setOptions({ title: original ? 'Editar ejercicio' : 'Nuevo ejercicio' });
  }, [navigation, original]);

  const pickCategory = (next: string) => {
    setCategory(next);
    // Sin músculos marcados a mano, se pone el de la categoría.
    const muscle = CATEGORY_MUSCLE[next];
    const onlyDefault = [...muscles.keys()].every(id =>
      Object.values(CATEGORY_MUSCLE).includes(id),
    );
    if (muscles.size <= 1 && onlyDefault) {
      setMuscles(new Map(muscle ? [[muscle, 'primary']] : []));
    }
  };

  const toggleMuscle = (id: number) => {
    setMuscles(prev => {
      const next = new Map(prev);
      const level = NEXT_LEVEL[prev.get(id) ?? 'none'];
      if (level) next.set(id, level);
      else next.delete(id);
      return next;
    });
  };

  const choosePhoto = async () => {
    try {
      const uri = await pickExercisePhoto();
      if (uri) setPhoto(uri);
    } catch (error) {
      Alert.alert('Foto', error instanceof Error ? error.message : 'No se pudo usar esa foto.');
    }
  };

  const save = () => {
    const trimmed = name.trim();
    const categoryRef = CATEGORY_REFS.get(category);
    if (!trimmed || !categoryRef) {
      Alert.alert('Faltan datos', 'Ponle un nombre y elige su categoría.');
      return;
    }
    const byLevel = (level: MuscleLevel): MuscleRef[] =>
      MUSCLES.filter(m => muscles.get(m.id) === level);
    const id = saveCustomExercise(
      {
        name: trimmed,
        description: description.trim(),
        category: categoryRef,
        musclesPrimary: byLevel('primary'),
        musclesSecondary: byLevel('secondary'),
        equipment: [],
        images: photo ? [photo] : [],
        videos: [],
        bodyweight: bodyweight || undefined,
        timed: timed || undefined,
        unilateral: unilateral || undefined,
      },
      editingId,
    );
    // Desde la biblioteca, al crear se abre su ficha; desde un buscador, queda elegido en él.
    const then = original ? undefined : route.params?.then;
    if (then === 'open') navigation.replace('ExerciseHistory', { exerciseId: id });
    else if (then === 'pick') {
      navigation.popTo('ExercisePicker', { createdExerciseId: id } as never, { merge: true });
    } else navigation.goBack();
  };

  const inUse = (id: number) =>
    sessions.some(s => s.sets.some(set => set.exerciseId === id)) ||
    splits.some(split =>
      split.days.some(day =>
        day.exercises.some(slot => slot.exerciseId === id || slot.backupExerciseId === id),
      ),
    ) ||
    (activeSplit?.days ?? []).some(day =>
      Object.values(getDayOverrides(activeSplit?.id, day.id)).some(o => o.exerciseId === id),
    );

  const confirmRemove = () => {
    if (editingId === undefined) return;
    if (inUse(editingId)) {
      Alert.alert(
        'No se puede borrar',
        'Está en algún entreno o en una rutina. Puedes cambiarle el nombre o los datos.',
      );
      return;
    }
    Alert.alert('Borrar ejercicio', `¿Borrar "${original?.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: () => {
          removeCustomExercise(editingId);
          navigation.pop(2);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container} ref={containerRef}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl + inset }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.photoRow}>
            <TouchableOpacity
              onPress={choosePhoto}
              activeOpacity={0.8}
              style={styles.photo}
              accessibilityLabel={photo ? 'Cambiar la foto' : 'Añadir una foto'}
            >
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photoImage} />
              ) : (
                <PlusIcon size={26} color={colors.accent} />
              )}
            </TouchableOpacity>
            <View style={styles.photoText}>
              <Text style={styles.photoTitle}>{photo ? 'Foto' : 'Añadir foto'}</Text>
              <Text style={styles.hint}>
                De la galería o de tus archivos. Para una nueva, hazla antes con la cámara.
              </Text>
              {photo && (
                <TouchableOpacity onPress={() => setPhoto(undefined)} hitSlop={8}>
                  <Text style={styles.removePhoto}>Quitar foto</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <Overline>Nombre</Overline>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Press en máquina del gimnasio..."
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoFocus={!original}
            />
          </View>

          <View style={styles.section}>
            <Overline>Categoría</Overline>
            <View style={styles.chips}>
              {CATEGORIES.map(item => (
                <Chip
                  key={item}
                  label={item}
                  active={category === item}
                  onPress={() => pickCategory(item)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Overline>Músculos</Overline>
            <Text style={styles.hint}>
              Un toque, principal (cuenta 1 serie); otro, secundario (0,5); otro, nada.
            </Text>
            <View style={styles.chips}>
              {MUSCLES.map(muscle => {
                const level = muscles.get(muscle.id);
                return (
                  <TouchableOpacity
                    key={muscle.id}
                    onPress={() => toggleMuscle(muscle.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.muscle,
                      level === 'primary' && styles.musclePrimary,
                      level === 'secondary' && styles.muscleSecondary,
                    ]}
                    accessibilityState={{ selected: level !== undefined }}
                  >
                    <Text
                      style={[
                        styles.muscleText,
                        level === 'primary' && styles.muscleTextPrimary,
                        level === 'secondary' && styles.muscleTextSecondary,
                      ]}
                    >
                      {muscle.name}
                      {level === 'secondary' ? ' · 2º' : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Overline>Cómo se apunta</Overline>
            <ToggleRow
              label="Con el peso del cuerpo"
              hint="El peso que se apunta es el lastre; 0 vale."
              value={bodyweight}
              onChange={setBodyweight}
            />
            <ToggleRow
              label="Por tiempo"
              hint="Segundos en vez de repeticiones, con cronómetro."
              value={timed}
              onChange={setTimed}
            />
            <ToggleRow
              label="A un lado"
              hint="A una mano o a una pierna: se apunta por lado."
              value={unilateral}
              onChange={setUnilateral}
            />
          </View>

          <View style={styles.section}>
            <Overline>Descripción · opcional</Overline>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Cómo se hace, ajustes de la máquina..."
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.multiline]}
              multiline
            />
          </View>

          <PrimaryButton label={original ? 'Guardar' : 'Crear ejercicio'} onPress={save} />

          {original && (
            <TouchableOpacity onPress={confirmRemove} style={styles.delete}>
              <Text style={styles.deleteText}>Borrar el ejercicio</Text>
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
  content: { paddingHorizontal: spacing.xxl, paddingTop: spacing.md, gap: spacing.xl },
  section: { gap: spacing.sm },
  hint: { color: colors.muted, fontSize: 12.5, lineHeight: 17 },
  photoRow: { flexDirection: 'row', gap: spacing.lg, alignItems: 'center' },
  photo: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%' },
  photoText: { flex: 1, gap: 4 },
  photoTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  removePhoto: { color: colors.danger, fontSize: 12.5, fontWeight: '700', marginTop: 2 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  muscle: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  musclePrimary: { backgroundColor: colors.accent, borderColor: colors.accent },
  muscleSecondary: { backgroundColor: colors.accentSoft, borderColor: colors.accentDim },
  muscleText: { color: colors.textDim, fontSize: 13, fontWeight: '700' },
  muscleTextPrimary: { color: colors.onAccent },
  muscleTextSecondary: { color: colors.accent },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
  toggleHint: { color: colors.muted, fontSize: 12.5, lineHeight: 17 },
  delete: { alignItems: 'center', paddingVertical: spacing.md },
  deleteText: { color: colors.danger, fontSize: 14, fontWeight: '700' },
});
