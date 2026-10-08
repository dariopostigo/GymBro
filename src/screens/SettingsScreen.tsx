import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useReloadData } from '../context/DataReloadContext';
import { useSettings } from '../context/SettingsContext';
import { WEIGHT_INCREMENTS } from '../storage/settingsStorage';
import {
  describeBackup,
  hasPreImportBackup,
  importBackup,
  undoImport,
  type BackupFile,
} from '../storage/backup';
import { exportBackupFile, pickBackupFile } from '../storage/backupFiles';
import { Card, Chip, GhostButton, Overline, PrimaryButton, Stepper } from '../components/ui';
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

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Ha ocurrido un error inesperado.';

function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

/** Exportar e importar todos los datos en un archivo JSON. */
function BackupSection() {
  const reloadData = useReloadData();
  const [busy, setBusy] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    hasPreImportBackup().then(setCanUndo);
  }, []);

  // Tras importar o deshacer, la app se vuelve a montar con los datos nuevos.
  const run = async (task: () => Promise<void>) => {
    setBusy(true);
    try {
      await task();
    } catch (error) {
      Alert.alert('Copia de seguridad', errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const handleExport = () =>
    run(async () => {
      if (await exportBackupFile()) {
        Alert.alert('Copia guardada', 'Guárdala en un sitio seguro, como Drive.');
      }
    });

  const confirmImport = (backup: BackupFile) =>
    Alert.alert(
      'Importar copia',
      `Copia del ${formatDate(backup.exportedAt)}: ${describeBackup(backup)}.\n\n` +
        'Se reemplazarán tus rutinas, historial, favoritos y ajustes actuales. ' +
        'Podrás deshacerlo desde esta pantalla.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          style: 'destructive',
          onPress: () =>
            run(async () => {
              await importBackup(backup);
              reloadData();
              Alert.alert('Datos importados', 'La copia se ha restaurado correctamente.');
            }),
        },
      ],
    );

  const handleImport = () =>
    run(async () => {
      const backup = await pickBackupFile();
      if (backup) confirmImport(backup);
    });

  const handleUndo = () =>
    Alert.alert(
      'Deshacer importación',
      '¿Volver a los datos que tenías antes de importar la copia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deshacer',
          style: 'destructive',
          onPress: () =>
            run(async () => {
              await undoImport();
              reloadData();
            }),
        },
      ],
    );

  return (
    <Card style={styles.card}>
      <View style={styles.switchText}>
        <Text style={styles.switchLabel}>Copia de seguridad</Text>
        <Text style={styles.switchHint}>
          Rutinas, historial, favoritos y ajustes en un archivo. Guárdalo fuera del móvil para no
          perder nada si reinstalas la app o cambias de teléfono.
        </Text>
      </View>
      <PrimaryButton label="Exportar datos" onPress={handleExport} disabled={busy} />
      <GhostButton label="Importar datos" onPress={busy ? () => {} : handleImport} />
      {canUndo && (
        <GhostButton
          label="Deshacer la última importación"
          onPress={busy ? () => {} : handleUndo}
          dashed
        />
      )}
    </Card>
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
          <SettingSwitch
            label="Descanso según el ejercicio"
            hint={
              'Sale del rango de reps: 2:30 en básicos pesados (desde 6-7), 2:00 en básicos (8-9), ' +
              '1:30 en accesorios (10-11) y 1:00 en aislamientos (12 o más). ' +
              'Se puede cambiar por ejercicio en el editor del día.'
            }
            value={settings.autoRest}
            onChange={autoRest => updateSettings({ autoRest })}
          />
        )}
        {settings.restTimerEnabled && !settings.autoRest && (
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

      <Overline style={styles.sectionGap}>Datos</Overline>
      <BackupSection />
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
