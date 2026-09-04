import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useRoutine } from '../context/RoutineContext';
import { useKeyboardInset } from '../hooks/useKeyboardInset';
import FadeInView from '../components/FadeInView';
import { GhostButton, Overline, PrimaryButton } from '../components/ui';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CreateCustomSplit'>;

export default function CreateCustomSplitScreen() {
  const navigation = useNavigation<Nav>();
  const { createCustomSplit, selectSplit } = useRoutine();
  const { ref: scrollContainerRef, inset } = useKeyboardInset();
  const [name, setName] = useState('');
  const [dayNames, setDayNames] = useState<string[]>(['Día 1']);

  const updateDayName = (index: number, value: string) => {
    setDayNames(prev => prev.map((d, i) => (i === index ? value : d)));
  };

  const addDay = () => setDayNames(prev => [...prev, `Día ${prev.length + 1}`]);

  const removeDay = (index: number) => setDayNames(prev => prev.filter((_, i) => i !== index));

  const canCreate = name.trim().length > 0 && dayNames.every(d => d.trim().length > 0);

  const handleCreate = async () => {
    if (!canCreate) return;
    const split = await createCustomSplit(
      name.trim(),
      dayNames.map(d => d.trim()),
    );
    await selectSplit(split.id);
    navigation.reset({ index: 0, routes: [{ name: 'Main', params: { screen: 'Routine' } }] });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.scrollContainer} ref={scrollContainerRef}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: spacing.xxl + inset }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <FadeInView style={styles.intro}>
            <Overline>Split personalizado</Overline>
            <Text style={styles.title}>Diseña tu rutina</Text>
            <Text style={styles.subtitle}>
              Ponle nombre y define los días del ciclo. Después podrás añadir los ejercicios de cada
              día.
            </Text>
          </FadeInView>

          <FadeInView delay={60} style={styles.field}>
            <Overline>Nombre del split</Overline>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ej. Mi rutina de fuerza"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </FadeInView>

          <FadeInView delay={120} style={styles.field}>
            <Overline>Días del ciclo</Overline>
            {dayNames.map((d, index) => (
              <View key={index} style={styles.dayRow}>
                <View style={styles.dayIndex}>
                  <Text style={styles.dayIndexText}>{index + 1}</Text>
                </View>
                <TextInput
                  value={d}
                  onChangeText={value => updateDayName(index, value)}
                  placeholder={`Día ${index + 1}`}
                  placeholderTextColor={colors.muted}
                  style={[styles.input, styles.dayInput]}
                />
                {dayNames.length > 1 && (
                  <TouchableOpacity onPress={() => removeDay(index)} style={styles.removeButton}>
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <GhostButton label="+ Añadir día" dashed onPress={addDay} style={styles.addDayButton} />
          </FadeInView>

          <PrimaryButton
            label="Crear split"
            onPress={handleCreate}
            disabled={!canCreate}
            style={styles.createButton}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { flex: 1 },
  content: { padding: spacing.xxl, gap: spacing.xl },
  intro: { gap: 4 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  subtitle: { fontSize: 13, color: colors.muted, lineHeight: 19, marginTop: 2 },
  field: { gap: spacing.sm },
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
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dayIndex: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayIndexText: { color: colors.accent, fontWeight: '800', fontSize: 12 },
  dayInput: { flex: 1 },
  removeButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: { color: colors.danger, fontSize: 15, fontWeight: '700' },
  addDayButton: { marginTop: spacing.xs },
  createButton: { marginTop: spacing.sm },
});
