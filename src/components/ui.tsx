import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { colors, overline, radius, shadow, spacing } from '../theme';

/** Etiqueta pequeña en mayúsculas que abre cada sección. */
export function Overline({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.overline, style]}>{children}</Text>;
}

export function ScreenHeader({
  overline: over,
  title,
  subtitle,
  left,
  right,
}: {
  overline?: string;
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      {left}
      <View style={styles.headerText}>
        {over ? <Overline>{over}</Overline> : null}
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Card({
  children,
  style,
  elevated,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
}) {
  return <View style={[styles.card, elevated && shadow.card, style]}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.primaryButton, shadow.accent, disabled && styles.disabled, style]}
    >
      {icon}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function GhostButton({
  label,
  onPress,
  style,
  dashed,
}: {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  dashed?: boolean;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.ghostButton, dashed && styles.ghostDashed, style]}
    >
      <Text style={styles.ghostButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function StatTile({
  value,
  label,
  unit,
  accent,
}: {
  value: string | number;
  label: string;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <View style={[styles.statTile, accent && styles.statTileAccent]}>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, accent && styles.statValueAccent]}>{value}</Text>
        {unit ? <Text style={[styles.statUnit, accent && styles.statUnitAccent]}>{unit}</Text> : null}
      </View>
      <Text style={[styles.statLabel, accent && styles.statLabelAccent]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ progress }: { progress: number }) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {hint ? <Text style={styles.emptyHint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  overline: { ...overline, color: colors.accent },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: { flex: 1, gap: 2 },
  headerTitle: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: colors.muted, marginTop: 2, lineHeight: 18 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: 16,
    paddingHorizontal: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: colors.onAccent,
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  disabled: { opacity: 0.35 },
  ghostButton: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  ghostDashed: { borderStyle: 'dashed', backgroundColor: 'transparent' },
  ghostButtonText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textDim, fontSize: 12.5, fontWeight: '700' },
  chipTextActive: { color: colors.onAccent },
  statTile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: 2,
  },
  statTileAccent: { backgroundColor: colors.accent, borderColor: colors.accent },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  statValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  statValueAccent: { color: colors.onAccent },
  statUnit: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  statUnitAccent: { color: colors.onAccent, opacity: 0.7 },
  statLabel: { ...overline, fontSize: 9.5, color: colors.muted },
  statLabelAccent: { color: colors.onAccent, opacity: 0.75 },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHigh,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.accent },
  empty: { alignItems: 'center', gap: 6, paddingVertical: 48, paddingHorizontal: spacing.xxl },
  emptyTitle: { color: colors.textDim, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  emptyHint: { color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 18 },
});
