import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { defaultBackupId, getExerciseById } from '../data/exerciseCatalog';
import type { Exercise, MuscleRef } from '../types/exercise';
import { CategoryIcon } from './CategoryIcon';
import { ChevronIcon } from './icons';
import { Card, Overline } from './ui';
import { colors, radius, spacing } from '../theme';

/** Por encima de esto la descripción sale recortada, con "Ver más". */
const LONG_DESCRIPTION = 220;
const COLLAPSED_LINES = 4;

function MusclePills({ muscles, primary }: { muscles: MuscleRef[]; primary?: boolean }) {
  return (
    <View style={styles.pills}>
      {muscles.map(muscle => (
        <View key={muscle.id} style={[styles.pill, primary && styles.pillPrimary]}>
          <Text style={[styles.pillText, primary && styles.pillTextPrimary]}>{muscle.name}</Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Ficha del ejercicio: cómo se hace, músculos, equipamiento y su plan B por
 * defecto (que se abre con `onOpenExercise`).
 */
export default function ExerciseInfo({
  exercise,
  onOpenExercise,
}: {
  exercise: Exercise;
  onOpenExercise: (exerciseId: number) => void;
}) {
  const isLong = exercise.description.length > LONG_DESCRIPTION;
  const [expanded, setExpanded] = useState(false);
  const backupId = defaultBackupId(exercise.id);
  const backup = backupId === undefined ? undefined : getExerciseById(backupId);

  return (
    <Card style={styles.card}>
      {exercise.description ? (
        <View style={styles.section}>
          <Overline>Cómo se hace</Overline>
          <Text
            style={styles.description}
            numberOfLines={isLong && !expanded ? COLLAPSED_LINES : undefined}
          >
            {exercise.description}
          </Text>
          {isLong && (
            <TouchableOpacity onPress={() => setExpanded(e => !e)} hitSlop={8}>
              <Text style={styles.link}>{expanded ? 'Ver menos' : 'Ver más'}</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {exercise.musclesPrimary.length > 0 && (
        <View style={styles.section}>
          <Overline>Músculos principales</Overline>
          <MusclePills muscles={exercise.musclesPrimary} primary />
        </View>
      )}

      {exercise.musclesSecondary.length > 0 && (
        <View style={styles.section}>
          <Overline>Secundarios</Overline>
          <MusclePills muscles={exercise.musclesSecondary} />
        </View>
      )}

      {exercise.equipment.length > 0 && (
        <View style={styles.section}>
          <Overline>Equipamiento</Overline>
          <Text style={styles.equipment}>{exercise.equipment.map(e => e.name).join(' · ')}</Text>
        </View>
      )}

      {backup && (
        <View style={styles.section}>
          <Overline>Plan B si está ocupado</Overline>
          <TouchableOpacity
            style={styles.backupRow}
            activeOpacity={0.8}
            onPress={() => onOpenExercise(backup.id)}
            accessibilityLabel={`Ver ficha de ${backup.name}`}
          >
            <CategoryIcon category={backup.category.name} size={28} />
            <View style={styles.backupText}>
              <Text style={styles.backupName} numberOfLines={2}>
                {backup.name}
              </Text>
              <Text style={styles.backupMeta}>{backup.category.name}</Text>
            </View>
            <ChevronIcon size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.lg },
  section: { gap: spacing.sm },
  description: { color: colors.textDim, fontSize: 14, lineHeight: 20 },
  link: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillPrimary: { backgroundColor: colors.accentSoft, borderColor: colors.accentDim },
  pillText: { color: colors.textDim, fontSize: 12, fontWeight: '700' },
  pillTextPrimary: { color: colors.accent },
  equipment: { color: colors.textDim, fontSize: 13 },
  backupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  backupText: { flex: 1, gap: 2 },
  backupName: { color: colors.text, fontSize: 14, fontWeight: '800' },
  backupMeta: { color: colors.muted, fontSize: 12 },
});
