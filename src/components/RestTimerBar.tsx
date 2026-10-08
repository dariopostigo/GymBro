import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRestTimer } from '../context/RestTimerContext';
import { useSettings } from '../context/SettingsContext';
import FadeInView from './FadeInView';
import { CheckIcon, CloseIcon } from './icons';
import { REST_PRESETS, REST_STEP, formatRest, remainingMs, restProgress } from '../utils/restTimer';
import { colors, overline, radius, shadow, spacing } from '../theme';

/** Alto de la barra de pestañas (pastilla de 46 + relleno y borde) más su margen inferior. */
const TAB_BAR_HEIGHT = 64 + 10;
/** Espacio extra que deben dejar las listas mientras la barra del descanso está visible. */
export const REST_BAR_SPACE = 76;

const SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE_EVENT = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
const TICK_MS = 250;

function useNow(active: boolean): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(interval);
  }, [active]);
  return now;
}

/** Barra flotante con la cuenta atrás del descanso, encima de las pestañas. */
export default function RestTimerBar() {
  const insets = useSafeAreaInsets();
  const { timer, finished, start, adjust, skip } = useRestTimer();
  const { settings, updateSettings } = useSettings();
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const now = useNow(timer !== null);

  useEffect(() => {
    const show = Keyboard.addListener(SHOW_EVENT, () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(HIDE_EVENT, () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (!timer) setPresetsOpen(false);
  }, [timer]);

  if ((!timer && !finished) || keyboardVisible) return null;

  const pickPreset = (seconds: number) => {
    // Con el descanso automático el atajo solo vale para este descanso.
    if (!settings.autoRest) updateSettings({ restSeconds: seconds });
    start(seconds);
    setPresetsOpen(false);
  };

  return (
    <View
      style={[styles.wrapper, { bottom: insets.bottom + TAB_BAR_HEIGHT + spacing.sm }]}
      pointerEvents="box-none"
    >
      <FadeInView offset={12} duration={220}>
        {timer ? (
          <View style={[styles.bar, shadow.card]}>
            {presetsOpen && (
              <View style={styles.presets}>
                {REST_PRESETS.map(seconds => {
                  const current = settings.autoRest ? timer.duration : settings.restSeconds;
                  const active = seconds === current;
                  return (
                    <TouchableOpacity
                      key={seconds}
                      style={[styles.preset, active && styles.presetActive]}
                      onPress={() => pickPreset(seconds)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.presetText, active && styles.presetTextActive]}>
                        {formatRest(seconds * 1000)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.timeBlock}
                onPress={() => setPresetsOpen(open => !open)}
                activeOpacity={0.7}
                accessibilityLabel="Cambiar la duración del descanso"
              >
                <Text style={styles.label}>Descanso</Text>
                <Text style={styles.time}>{formatRest(remainingMs(timer, now))}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stepButton}
                onPress={() => adjust(-REST_STEP)}
                activeOpacity={0.7}
                accessibilityLabel={`Quitar ${REST_STEP} segundos`}
              >
                <Text style={styles.stepText}>−{REST_STEP}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stepButton}
                onPress={() => adjust(REST_STEP)}
                activeOpacity={0.7}
                accessibilityLabel={`Añadir ${REST_STEP} segundos`}
              >
                <Text style={styles.stepText}>+{REST_STEP}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={skip}
                activeOpacity={0.7}
                accessibilityLabel="Saltar el descanso"
              >
                <CloseIcon size={16} color={colors.textDim} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${restProgress(timer, now) * 100}%` }]} />
            </View>
          </View>
        ) : (
          <View style={[styles.bar, styles.barFinished, shadow.card]}>
            <View style={styles.finishedRow}>
              <CheckIcon size={18} color={colors.onAccent} strokeWidth={3} />
              <Text style={styles.finishedText}>¡A por la siguiente!</Text>
            </View>
          </View>
        )}
      </FadeInView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: 18, right: 18 },
  bar: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.accentDim,
    overflow: 'hidden',
  },
  barFinished: { backgroundColor: colors.accent, borderColor: colors.accent },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
  },
  timeBlock: { flex: 1 },
  label: { ...overline, fontSize: 9.5, color: colors.accent },
  time: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  stepButton: {
    minWidth: 48,
    height: 38,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { color: colors.text, fontWeight: '800', fontSize: 13 },
  skipButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  track: { height: 3, backgroundColor: colors.surfaceHigh },
  fill: { height: 3, backgroundColor: colors.accent },
  presets: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  preset: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
  },
  presetActive: { backgroundColor: colors.accent },
  presetText: { color: colors.textDim, fontWeight: '800', fontSize: 13 },
  presetTextActive: { color: colors.onAccent },
  finishedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 18,
  },
  finishedText: { color: colors.onAccent, fontWeight: '900', fontSize: 16 },
});
