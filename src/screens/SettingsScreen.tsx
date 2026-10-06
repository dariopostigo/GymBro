import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { WEIGHT_INCREMENTS } from '../storage/settingsStorage';
import { Card, Chip, Overline, Stepper } from '../components/ui';
import {
  MAX_REST,
  MIN_REST,
  REST_PRESETS,
  REST_STEP,
  clampRestSeconds,
  formatRest,
} from '../utils/restTimer';
import { formatWeight } from '../utils/progression';
import { colors, spacing } from '../theme';

function SettingSwitch({
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
    <View style={styles.switchRow}>
      <View style={styles.switchText}>
        <Text style={styles.switchLabel}>{label}</Text>
        <Text style={styles.switchHint}>{hint}</Text>
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

export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();
  const setRest = (seconds: number) => updateSettings({ restSeconds: clampRestSeconds(seconds) });

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Overline>Entrenamiento</Overline>
      <Card style={styles.card}>
        <SettingSwitch
          label="Temporizador de descanso"
          hint="Arranca solo al apuntar una serie y vibra al terminar."
          value={settings.restTimerEnabled}
          onChange={restTimerEnabled => updateSettings({ restTimerEnabled })}
        />
        {settings.restTimerEnabled && (
          <View style={styles.restOptions}>
            <Stepper
              label="Duración"
              layout="inline"
              value={formatRest(settings.restSeconds * 1000)}
              minusDisabled={settings.restSeconds <= MIN_REST}
              plusDisabled={settings.restSeconds >= MAX_REST}
              onDecrease={() => setRest(settings.restSeconds - REST_STEP)}
              onIncrease={() => setRest(settings.restSeconds + REST_STEP)}
            />
            <View style={styles.presets}>
              {REST_PRESETS.map(seconds => (
                <Chip
                  key={seconds}
                  label={formatRest(seconds * 1000)}
                  active={settings.restSeconds === seconds}
                  onPress={() => setRest(seconds)}
                />
              ))}
            </View>
          </View>
        )}
        <View style={styles.divider} />
        <SettingSwitch
          label="Pantalla siempre encendida"
          hint="Mientras estás en la pestaña Hoy, para no tener que desbloquear el móvil."
          value={settings.keepScreenOn}
          onChange={keepScreenOn => updateSettings({ keepScreenOn })}
        />
      </Card>

      <Overline style={styles.sectionGap}>Progresión</Overline>
      <Card style={styles.card}>
        <View style={styles.switchText}>
          <Text style={styles.switchLabel}>Incremento de peso</Text>
          <Text style={styles.switchHint}>
            Lo que se sugiere subir cuando la última vez completaste todas las series al máximo de
            repeticiones.
          </Text>
        </View>
        <View style={styles.presets}>
          {WEIGHT_INCREMENTS.map(increment => (
            <Chip
              key={increment}
              label={`+${formatWeight(increment)} kg`}
              active={settings.weightIncrement === increment}
              onPress={() => updateSettings({ weightIncrement: increment })}
            />
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  card: { gap: spacing.lg },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  switchText: { flex: 1, gap: 2 },
  switchLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
  switchHint: { color: colors.muted, fontSize: 12.5, lineHeight: 17 },
  restOptions: { gap: spacing.md },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border },
  sectionGap: { marginTop: spacing.md },
});
