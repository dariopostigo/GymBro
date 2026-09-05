import React, { useMemo, useRef, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { CATEGORIES, EXERCISES } from '../data/exerciseCatalog';
import { getExerciseImageSources } from '../utils/exerciseImages';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import { ChevronIcon } from '../components/icons';
import { Chip, EmptyState } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import type { Exercise } from '../types/exercise';
import { colors, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ExerciseLibrary'>;

const CHIP_OPTIONS = ['Todos', ...CATEGORIES];

/** Los chips no tienen ancho fijo: si el scroll inicial falla, no pasa nada. */
const noop = () => {};

export default function ExerciseLibraryScreen() {
  const navigation = useNavigation<Nav>();
  const { ref: listContainerRef, inset } = useKeyboardInset();
  const chipsRef = useRef<FlatList<string>>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const queryWords = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return EXERCISES.filter(e => {
      const matchesCategory = !category || e.category.name === category;
      const name = e.name.toLowerCase();
      const matchesSearch = queryWords.every(word => name.includes(word));
      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const handleSelect = (exercise: Exercise) => {
    navigation.navigate('ExerciseHistory', { exerciseId: exercise.id });
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
            const thumbnail = getExerciseImageSources(item)[0];
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.row}
                onPress={() => handleSelect(item)}
              >
                {thumbnail ? (
                  <Image source={thumbnail} style={styles.thumbnail} />
                ) : (
                  <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
                )}
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
  thumbnail: { width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  thumbnailPlaceholder: {},
  rowInfo: { flex: 1, gap: 2 },
  rowName: { color: colors.text, fontWeight: '700', fontSize: 14 },
  rowMeta: { color: colors.muted, fontSize: 12 },
});
