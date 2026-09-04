import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useRoutine } from '../context/RoutineContext';
import { ChevronIcon, DumbbellIcon } from '../components/icons';
import { GhostButton, ScreenHeader } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import type { Split } from '../types/routine';
import { colors, overline, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'SplitSelection'>;

export default function SplitSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const { splits, selectSplit } = useRoutine();

  const handleSelect = async (split: Split) => {
    await selectSplit(split.id);
    navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: 'Home' } }] });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {navigation.canGoBack() ? (
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
        >
          <ChevronIcon direction="left" size={16} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <DumbbellIcon size={18} color={colors.onAccent} />
          </View>
          <Text style={styles.brandText}>GymBro</Text>
        </View>
      )}

      <ScreenHeader
        overline="Paso 1"
        title="Elige tu split"
        subtitle="Se guardará como tu rutina activa. Podrás cambiarlo cuando quieras desde el menú principal."
      />

      <FlatList
        data={splits}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => handleSelect(item)}
          >
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.cardArrow}>
                <ChevronIcon size={16} color={colors.onAccent} />
              </View>
            </View>
            <Text style={styles.cardDays}>
              {item.days.length} día{item.days.length === 1 ? '' : 's'} por ciclo
            </Text>
            <View style={styles.dayChips}>
              {item.days.map(day => (
                <View key={day.id} style={styles.dayChip}>
                  <Text style={styles.dayChipText}>{day.name}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    marginLeft: spacing.xxl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginLeft: spacing.xxl,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { color: colors.text, fontWeight: '800', fontSize: 16, letterSpacing: -0.2 },
  list: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl, gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 19, fontWeight: '800', color: colors.text, flex: 1 },
  cardArrow: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDays: { ...overline, fontSize: 10, color: colors.muted },
  dayChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  dayChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
  },
  dayChipText: { color: colors.textDim, fontSize: 11.5, fontWeight: '700' },
  footerButton: { marginTop: spacing.xs },
});
