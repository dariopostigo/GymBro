import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useRoutine } from '../context/RoutineContext';
import { CATEGORIES, EXERCISES, getExerciseById } from '../data/exerciseCatalog';
import { generateId } from '../utils/id';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { useFavorites } from '../context/FavoritesContext';
import { searchExercises } from '../utils/exerciseSearch';
import { ChevronIcon } from '../components/icons';
import ExerciseThumbnail from '../components/ExerciseThumbnail';
import FavoriteButton from '../components/FavoriteButton';
import { Chip, EmptyState } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import type { Exercise } from '../types/exercise';
import { colors, radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ExercisePicker'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'ExercisePicker'>;

const CHIP_OPTIONS = ['Todos', ...CATEGORIES];

/** Los chips no tienen ancho fijo: si el scroll inicial falla, no pasa nada. */
const noop = () => {};

export default function ExercisePickerScreen({ route }: Props) {
  const params = route.params;
  const navigation = useNavigation<Nav>();
  const { splits, updateDayExercises, setDayOverride } = useRoutine();
  const { ref: listContainerRef, inset } = useKeyboardInset();
  const chipsRef = useRef<FlatList<string>>(null);

  // Al cambiar un ejercicio se entra ya filtrado por su categoría (pecho, espalda...).
  const currentCategory = useMemo(() => {
    if (params.mode === 'add' || params.currentExerciseId == null) return null;
    return getExerciseById(params.currentExerciseId)?.category.name ?? null;
  }, [params]);

  const { favoriteIds } = useFavorites();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(currentCategory);

  useEffect(() => {
    if (!currentCategory) return;
    const index = CHIP_OPTIONS.indexOf(currentCategory);
    if (index < 0) return;
    // Sin animación: el filtro ya está aplicado al abrirse la pantalla.
    const task = requestAnimationFrame(() =>
      chipsRef.current?.scrollToIndex({ index, viewPosition: 0.5, animated: false }),
    );
    return () => cancelAnimationFrame(task);
  }, [currentCategory]);

  const filtered = useMemo(
    () => searchExercises(EXERCISES, { search, category, favoriteIds }),
    [search, category, favoriteIds],
  );

  const handleSelect = (exercise: Exercise) => {
    if (params.mode === 'today') {
      setDayOverride(params.splitId, params.dayId, params.slotId, { exerciseId: exercise.id });
      navigation.goBack();
      return;
    }

    const split = splits.find(s => s.id === params.splitId);
    const day = split?.days.find(d => d.id === params.dayId);
    if (!split || !day) return;

    if (params.mode === 'add') {
      const newSlot = {
        id: generateId(),
        exerciseId: exercise.id,
        order: day.exercises.length,
        targetSets: 4,
        targetRepsMin: 8,
        targetRepsMax: 12,
      };
      updateDayExercises(params.splitId, params.dayId, [...day.exercises, newSlot]);
    } else {
      updateDayExercises(
        params.splitId,
        params.dayId,
        day.exercises.map(slot =>
          slot.id === params.slotId ? { ...slot, exerciseId: exercise.id } : slot,
        ),
      );
      // Cambiar la plantilla manda sobre el cambio de ejercicio de hoy, pero las
      // series que hayas ajustado para hoy se respetan.
      setDayOverride(params.splitId, params.dayId, params.slotId, { exerciseId: undefined });
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.header}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar ejercicio..."
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
        <Text style={styles.resultCount}>
          {filtered.length} ejercicio{filtered.length === 1 ? '' : 's'}
        </Text>
      </View>

      <View style={styles.chipsWrapper}>
        <FlatList
          ref={chipsRef}
          data={CHIP_OPTIONS}
          horizontal
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsList}
          onScrollToIndexFailed={noop}
          renderItem={({ item }) => (
            <Chip
              label={item}
              active={item === 'Todos' ? category === null : category === item}
              onPress={() => setCategory(item === 'Todos' ? null : item)}
            />
          )}
        />
      </View>

      <View style={styles.listContainer} ref={listContainerRef}>
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={[styles.list, { paddingBottom: spacing.xxl + inset }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          renderItem={({ item }) => {
            return (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.row}
              onPress={() => handleSelect(item)}
            >
              <ExerciseThumbnail exercise={item} style={styles.thumbnail} />
              <View style={styles.rowInfo}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.rowMeta} numberOfLines={1}>
                  {item.category.name}
                  {item.musclesPrimary.length
                    ? ` · ${item.musclesPrimary.map(m => m.name).join(', ')}`
                    : ''}
                </Text>
              </View>
              <FavoriteButton exerciseId={item.id} />
              <ChevronIcon size={16} color={colors.muted} />
            </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              title="No hay ejercicios que coincidan"
              hint="Prueba con otro nombre o quita el filtro de categoría."
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.xxl, paddingTop: spacing.md, gap: 6 },
  searchInput: {
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
  resultCount: { color: colors.muted, fontSize: 11.5, marginLeft: 4 },
  chipsWrapper: { paddingVertical: spacing.md },
  chipsList: { paddingHorizontal: spacing.xxl, gap: spacing.sm },
  listContainer: { flex: 1 },
  list: { paddingHorizontal: spacing.xxl, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  thumbnail: { width: 84, height: 84, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  rowInfo: { flex: 1, gap: 2 },
  rowName: { color: colors.text, fontWeight: '700', fontSize: 15 },
  rowMeta: { color: colors.muted, fontSize: 12 },
});
