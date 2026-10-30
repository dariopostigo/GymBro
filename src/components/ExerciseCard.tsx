import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  LayoutAnimation,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getExerciseById, primaryMusclesSuffix } from '../data/exerciseCatalog';
import { getExerciseMediaSources } from '../utils/exerciseImages';
import ExerciseThumbnail from './ExerciseThumbnail';
import ExerciseImageModal from './ExerciseImageModal';
import ExerciseVideoModal from './ExerciseVideoModal';
import FadeInView from './FadeInView';
import {
  CheckIcon,
  ChevronIcon,
  CloseIcon,
  ExpandIcon,
  HistoryIcon,
  PlusIcon,
  TrendingUpIcon,
  TrophyIcon,
  VideoIcon,
} from './icons';
import { Card, GhostButton, Stepper } from './ui';
import type { DayExerciseSlot } from '../types/routine';
import type { SetEntry } from '../types/session';
import { formatWeight, type LoadSuggestion } from '../utils/progression';
import { describeRecord, type PersonalRecord } from '../utils/workoutSummary';
import { stepWeight } from '../utils/weightStack';
import { BAR_LABELS, plateLoad, type BarType } from '../utils/plates';
import {
  RIR_OPTIONS,
  effortDescription,
  effortLabel,
  effortOption,
  type EffortMode,
} from '../utils/effort';
import { colors, overline, radius, spacing } from '../theme';

// Mismos límites que el editor del día, para que plantilla y "solo hoy" coincidan.
export const MIN_SETS = 1;
export const MAX_SETS = 10;

export interface ExerciseCardProps {
  slot: DayExerciseSlot;
  positionInSession: number;
  positionInMuscleGroup?: number;
  loggedSets: SetEntry[];
  /** Series de hoy que batieron la marca al apuntarlas, por id de serie. */
  records: Map<string, PersonalRecord>;
  suggested?: LoadSuggestion;
  /** Cambio de un toque al plan B del hueco (o de vuelta al ejercicio principal). */
  planB?: { label: string; onPress: () => void };
  /** Cómo se apunta el esfuerzo de cada serie (o si no se apunta). */
  effortMode: EffortMode;
  /** Pesos reales de la máquina, si se han configurado: el peso sube y baja por ellos. */
  weights?: number[];
  /** Ejercicio a un lado cada vez: las reps se apuntan por lado. */
  unilateral: boolean;
  /** Con qué se carga (barra, Smith, máquina de discos), para decir qué discos poner. */
  loading?: { type: BarType; bar: number; plates: number[] };
  /** Añadido solo para hoy: no está en la plantilla y se puede quitar. */
  extra: boolean;
  onAddSet: (weight: number, reps: number, rir?: number) => void;
  onUpdateSet: (setEntryId: string, weight: number, reps: number, rir?: number) => void;
  onRemoveSet: (setEntryId: string) => void;
  onRemoveExtra: () => void;
  /** Plegado a mano, si difiere de lo automático; se guarda con los cambios de hoy. */
  collapsedOverride?: boolean;
  onCollapsedChange: (collapsed: boolean | undefined) => void;
  onSwapToday: () => void;
  onSwapPermanent: () => void;
  onChangeSets: (delta: number) => void;
  onViewHistory: () => void;
  onInputFocus: () => void;
}

export default function ExerciseCard({
  slot,
  positionInSession,
  positionInMuscleGroup,
  loggedSets,
  records,
  suggested,
  planB,
  effortMode,
  weights,
  unilateral,
  loading,
  extra,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onRemoveExtra,
  collapsedOverride,
  onCollapsedChange,
  onSwapToday,
  onSwapPermanent,
  onChangeSets,
  onViewHistory,
  onInputFocus,
}: ExerciseCardProps) {
  const exercise = getExerciseById(slot.exerciseId);
  const media = getExerciseMediaSources(exercise);
  const video = media.find(item => item.type === 'video');
  const [weightText, setWeightText] = useState(suggested ? formatWeight(suggested.weight) : '');
  const [repsText, setRepsText] = useState(suggested ? String(suggested.reps) : '');
  // Opcional y para una sola serie: tras apuntarla se vuelve a dejar sin marcar.
  const [rir, setRir] = useState<number | undefined>(undefined);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  // Serie que se está corrigiendo; al acabar, los campos vuelven a lo que había.
  const [editing, setEditing] = useState<{
    id: string;
    setNumber: number;
    restore: { weightText: string; repsText: string; rir?: number };
  } | null>(null);

  const startEdit = (set: SetEntry) => {
    setEditing(prev => ({
      id: set.id,
      setNumber: set.setNumber,
      restore: prev?.restore ?? { weightText, repsText, rir },
    }));
    setWeightText(formatWeight(set.weight));
    setRepsText(String(set.reps));
    setRir(set.rir);
  };

  const stopEdit = () => {
    if (!editing) return;
    setWeightText(editing.restore.weightText);
    setRepsText(editing.restore.repsText);
    setRir(editing.restore.rir);
    setEditing(null);
  };

  const removeSet = (setEntryId: string) => {
    if (editing?.id === setEntryId) stopEdit();
    onRemoveSet(setEntryId);
  };

  const plateHint = useMemo(() => {
    if (!loading) return undefined;
    const total = parseFloat(weightText.replace(',', '.'));
    if (!(total > 0)) return undefined;
    const { type, bar, plates } = loading;
    const barText = type === 'machine' ? '' : ` · ${BAR_LABELS[type]} ${formatWeight(bar)} kg`;
    if (total < bar) return `Menos que la barra (${formatWeight(bar)} kg)`;
    const load = plateLoad(total, bar, plates);
    if (!load) return 'Marca en Ajustes los discos que hay en tu gimnasio';
    if (!load.exact) {
      const options = [load.lower, load.upper].filter((w): w is number => w !== undefined);
      return `No sale exacto con tus discos: ${options.map(formatWeight).join(' o ')} kg`;
    }
    if (!load.perSide.length) return type === 'machine' ? 'Sin discos' : `Solo la barra${barText}`;
    return `Por lado: ${load.perSide.map(formatWeight).join(' · ')}${barText}`;
  }, [loading, weightText]);

  const stepStack = (direction: 1 | -1) => {
    if (!weights) return;
    const current = parseFloat(weightText.replace(',', '.'));
    setWeightText(formatWeight(stepWeight(weights, current, direction)));
  };

  const handleAdd = () => {
    const weight = parseFloat(weightText.replace(',', '.'));
    const reps = parseInt(repsText, 10);
    if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(reps) || reps <= 0) {
      Alert.alert('Datos inválidos', 'Introduce un peso y unas repeticiones válidas.');
      return;
    }
    const effort = effortMode === 'off' ? undefined : rir;
    if (editing) {
      onUpdateSet(editing.id, weight, reps, effort);
      stopEdit();
      return;
    }
    onAddSet(weight, reps, effort);
    setRir(undefined);
  };

  const done = loggedSets.length;
  const isComplete = done >= slot.targetSets;
  // Los completados van plegados; al completarse se pliegan solos y al dejar de estarlo
  // (se borra una serie o se suben las objetivo) se despliegan. Lo que el usuario pliegue o
  // despliegue a mano se recuerda hasta que cambie el estado de completado.
  const collapsed = collapsedOverride ?? isComplete;
  const wasComplete = useRef(isComplete);

  useEffect(() => {
    if (wasComplete.current === isComplete) return;
    wasComplete.current = isComplete;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (collapsedOverride !== undefined) onCollapsedChange(undefined);
  }, [isComplete, collapsedOverride, onCollapsedChange]);

  const [optionsOpen, setOptionsOpen] = useState(false);
  const toggleOptions = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOptionsOpen(open => !open);
  };

  const toggleCollapsed = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = !collapsed;
    onCollapsedChange(next === isComplete ? undefined : next);
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
            {extra && <Text style={styles.extraTag}>Solo hoy · </Text>}
            {positionInMuscleGroup && positionInMuscleGroup > 1
              ? `${positionInMuscleGroup}º de ${exercise?.category.name}`
              : exercise?.category.name}
            {exercise && primaryMusclesSuffix(exercise)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onViewHistory}
          style={styles.iconButton}
          activeOpacity={0.8}
          accessibilityLabel="Ver ficha e historial de este ejercicio"
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
              ? loggedSets.map(set => `${formatWeight(set.weight)}×${set.reps}`).join(' · ')
              : `${slot.targetSets} × ${slot.targetRepsMin}-${slot.targetRepsMax}`}
          </Text>
        </View>
      ) : (
        <>
          {/* Lo de un vistazo arriba: foto pequeña (se amplía al tocarla), objetivo y la última
              vez. La foto grande ocupaba media pantalla y dejaba lo de apuntar al final. */}
          <View style={styles.summaryRow}>
            <TouchableOpacity
              onPress={() => setImageModalVisible(true)}
              disabled={media.length === 0}
              activeOpacity={0.8}
              accessibilityLabel="Ampliar imagen del ejercicio"
            >
              <ExerciseThumbnail exercise={exercise} style={styles.thumbnail} />
              {media.length > 0 && (
                <View style={styles.thumbnailExpand}>
                  <ExpandIcon size={11} color={colors.text} />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.summaryText}>
              <View style={styles.targetRow}>
                <Text style={styles.targetText}>
                  {slot.targetSets} × {slot.targetRepsMin}-{slot.targetRepsMax}
                </Text>
                <View style={[styles.donePill, isComplete && styles.donePillComplete]}>
                  <Text style={[styles.donePillText, isComplete && styles.donePillTextComplete]}>
                    {done}/{slot.targetSets}
                  </Text>
                </View>
                {video && (
                  <TouchableOpacity
                    onPress={() => setVideoModalVisible(true)}
                    style={styles.videoButton}
                    hitSlop={8}
                    activeOpacity={0.8}
                    accessibilityLabel="Ver vídeo del ejercicio"
                  >
                    <VideoIcon size={16} color={colors.accent} />
                  </TouchableOpacity>
                )}
              </View>
              {suggested && (
                <View style={styles.suggestion}>
                  {suggested.increase && <TrendingUpIcon size={14} color={colors.accent} />}
                  <Text style={styles.suggestionText}>
                    {suggested.increase ? (
                      <Text style={styles.suggestionStrong}>
                        Sube a {formatWeight(suggested.weight)} kg ·{' '}
                      </Text>
                    ) : null}
                    Última vez: {formatWeight(suggested.previous.weight)} kg ×{' '}
                    {suggested.previous.reps.join(' · ')}
                    {suggested.increase
                      ? suggested.reason === 'easy'
                        ? ' · te sobraban reps'
                        : ''
                      : ` · intenta llegar a ${slot.targetRepsMax} en todas`}
                  </Text>
                </View>
              )}
            </View>
            {media.length > 0 && (
              <ExerciseImageModal
                visible={imageModalVisible}
                media={media}
                onClose={() => setImageModalVisible(false)}
              />
            )}
            {video && (
              <ExerciseVideoModal
                visible={videoModalVisible}
                uri={video.type === 'video' ? video.uri : undefined}
                onClose={() => setVideoModalVisible(false)}
              />
            )}
          </View>

          {loggedSets.length > 0 && (
            <View style={styles.setList}>
              {loggedSets.map(set => {
                const record = records.get(set.id);
                const isEditing = editing?.id === set.id;
                return (
                  <FadeInView key={set.id} offset={10} duration={260}>
                    <View
                      style={[
                        styles.setRow,
                        record && styles.setRowRecord,
                        isEditing && styles.setRowEditing,
                      ]}
                    >
                      <View style={[styles.setNumber, record && styles.setNumberRecord]}>
                        {record ? (
                          <TrophyIcon size={12} color={colors.onAccent} strokeWidth={2.5} />
                        ) : (
                          <Text style={styles.setNumberText}>{set.setNumber}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        style={styles.setRowBody}
                        onPress={() => (isEditing ? stopEdit() : startEdit(set))}
                        activeOpacity={0.7}
                        accessibilityLabel={`Corregir la serie ${set.setNumber}`}
                      >
                        <Text style={styles.setRowText}>
                          <Text style={styles.setRowStrong}>{formatWeight(set.weight)}</Text> kg ×{' '}
                          <Text style={styles.setRowStrong}>{set.reps}</Text> reps
                          {set.perSide ? ' por lado' : ''}
                          {set.rir !== undefined && effortMode !== 'off' && (
                            <Text style={[styles.setEffort, set.rir <= 0 && styles.setEffortHard]}>
                              {'  ·  '}
                              {effortLabel(set.rir, effortMode)}
                            </Text>
                          )}
                        </Text>
                        {record && (
                          <Text style={styles.recordText} numberOfLines={1}>
                            ¡Récord! {describeRecord(record)}
                          </Text>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => removeSet(set.id)} hitSlop={8}>
                        <View style={styles.removeSetIcon}>
                          <CloseIcon size={14} color={colors.danger} strokeWidth={2.5} />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </FadeInView>
                );
              })}
            </View>
          )}

          {editing ? (
            <View style={styles.editingBanner}>
              <Text style={styles.editingText}>Corrigiendo la serie {editing.setNumber}</Text>
              <TouchableOpacity onPress={stopEdit} hitSlop={8}>
                <Text style={styles.editingCancel}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : loggedSets.length > 0 ? (
            <Text style={styles.editHint}>Toca una serie para corregirla.</Text>
          ) : null}

          {effortMode !== 'off' && (
            <View style={styles.effortBlock}>
              <View style={styles.effortHeader}>
                <Text style={styles.inputLabel}>
                  {effortMode === 'rpe' ? 'RPE' : 'Reps en reserva (RIR)'} · opcional
                </Text>
                {rir !== undefined && (
                  <Text style={styles.effortHint} numberOfLines={1}>
                    {effortDescription(rir)}
                  </Text>
                )}
              </View>
              <View style={styles.effortRow}>
                {RIR_OPTIONS.map(option => {
                  const selected = rir === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      style={[styles.effortButton, selected && styles.effortButtonSelected]}
                      onPress={() => setRir(selected ? undefined : option)}
                      activeOpacity={0.8}
                      accessibilityLabel={effortDescription(option)}
                      accessibilityState={{ selected }}
                    >
                      <Text
                        style={[
                          styles.effortButtonText,
                          selected && styles.effortButtonTextSelected,
                        ]}
                      >
                        {effortOption(option, effortMode)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.addSetRow}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Peso</Text>
              <View style={styles.weightRow}>
                {weights && (
                  <TouchableOpacity
                    style={styles.stackButton}
                    onPress={() => stepStack(-1)}
                    activeOpacity={0.8}
                    accessibilityLabel="Bajar al peso anterior de la máquina"
                  >
                    <Text style={styles.stackButtonText}>−</Text>
                  </TouchableOpacity>
                )}
                <TextInput
                  value={weightText}
                  onChangeText={setWeightText}
                  onFocus={onInputFocus}
                  placeholder="kg"
                  placeholderTextColor={colors.muted}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  style={[styles.setInput, styles.weightInput]}
                />
                {weights && (
                  <TouchableOpacity
                    style={styles.stackButton}
                    onPress={() => stepStack(1)}
                    activeOpacity={0.8}
                    accessibilityLabel="Subir al siguiente peso de la máquina"
                  >
                    <Text style={styles.stackButtonText}>+</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>{unilateral ? 'Reps por lado' : 'Reps'}</Text>
              <TextInput
                value={repsText}
                onChangeText={setRepsText}
                onFocus={onInputFocus}
                placeholder={unilateral ? 'por lado' : 'reps'}
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
                returnKeyType="done"
                style={styles.setInput}
              />
            </View>
            <TouchableOpacity
              style={styles.addSetButton}
              onPress={handleAdd}
              activeOpacity={0.85}
              accessibilityLabel={editing ? 'Guardar la corrección' : 'Apuntar serie'}
            >
              {editing ? (
                <CheckIcon size={20} color={colors.onAccent} strokeWidth={3} />
              ) : (
                <PlusIcon size={20} color={colors.onAccent} />
              )}
            </TouchableOpacity>
          </View>
          {plateHint && <Text style={styles.plateHint}>{plateHint}</Text>}

          {/* Lo que casi no se toca en pleno entreno, plegado al final. */}
          <TouchableOpacity
            style={styles.optionsToggle}
            onPress={toggleOptions}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityState={{ expanded: optionsOpen }}
          >
            <Text style={styles.optionsToggleText} numberOfLines={1}>
              {planB ? 'Plan B, cambiar ejercicio, series' : 'Cambiar ejercicio, series'}
            </Text>
            <ChevronIcon direction={optionsOpen ? 'up' : 'down'} size={16} color={colors.muted} />
          </TouchableOpacity>
          {optionsOpen && (
            <>
              {planB && (
                <GhostButton
                  label={planB.label}
                  onPress={planB.onPress}
                  style={styles.planBButton}
                />
              )}
              <View style={styles.swapRow}>
                <GhostButton label="Cambiar hoy" onPress={onSwapToday} style={styles.swapButton} />
                {extra ? (
                  <GhostButton
                    label="Quitar de hoy"
                    onPress={onRemoveExtra}
                    style={styles.swapButton}
                  />
                ) : (
                  <GhostButton
                    label="Cambiar en plantilla"
                    onPress={onSwapPermanent}
                    style={styles.swapButton}
                  />
                )}
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
            </>
          )}
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
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
  summaryRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  thumbnail: { width: 76, height: 76, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  thumbnailExpand: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 14, 16, 0.82)',
  },
  summaryText: { flex: 1, gap: 6 },
  targetRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  targetText: { color: colors.text, fontWeight: '800', fontSize: 15 },
  videoButton: {
    marginLeft: 'auto',
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  donePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  donePillComplete: { backgroundColor: colors.accent },
  donePillText: { color: colors.accent, fontWeight: '800', fontSize: 12 },
  donePillTextComplete: { color: colors.onAccent },
  planBButton: { paddingVertical: 11, borderColor: colors.accentDim },
  swapRow: { flexDirection: 'row', gap: spacing.sm },
  swapButton: { flex: 1, paddingVertical: 11, paddingHorizontal: spacing.sm },
  optionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  optionsToggleText: { flex: 1, color: colors.muted, fontSize: 12.5, fontWeight: '700' },
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
  setRowRecord: {
    borderWidth: 1,
    borderColor: colors.accentDim,
    backgroundColor: colors.accentSoft,
  },
  setNumberRecord: { backgroundColor: colors.accent },
  setRowBody: { flex: 1, gap: 2 },
  setRowText: { color: colors.textDim, fontSize: 14 },
  plateHint: { color: colors.accent, fontSize: 12.5, fontWeight: '700', marginTop: -4 },
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  weightInput: { flex: 1, textAlign: 'center' },
  stackButton: {
    width: 30,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stackButtonText: { color: colors.accent, fontSize: 18, fontWeight: '800' },
  setEffort: { color: colors.muted, fontWeight: '700', fontSize: 12.5 },
  setEffortHard: { color: colors.danger },
  effortBlock: { gap: 6 },
  effortHeader: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  effortHint: {
    flex: 1,
    color: colors.accent,
    fontSize: 11.5,
    fontWeight: '700',
    textAlign: 'right',
  },
  effortRow: { flexDirection: 'row', gap: 6 },
  effortButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  effortButtonSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  effortButtonText: { color: colors.textDim, fontWeight: '800', fontSize: 13 },
  effortButtonTextSelected: { color: colors.onAccent },
  recordText: { color: colors.accent, fontSize: 12, fontWeight: '800' },
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
  extraTag: { color: colors.accent, fontWeight: '800' },
  setRowEditing: { borderWidth: 1, borderColor: colors.accent },
  editHint: { color: colors.muted, fontSize: 11.5, marginTop: -4 },
  editingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
  },
  editingText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  editingCancel: { color: colors.text, fontSize: 13, fontWeight: '700' },
});
