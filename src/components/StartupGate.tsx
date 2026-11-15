import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BootSplash from 'react-native-bootsplash';
import { SafeAreaView } from 'react-native-safe-area-context';
import { openDb } from '../storage/db';
import { colors, spacing } from '../theme';
import { PrimaryButton } from './ui';

type State = { status: 'opening' } | { status: 'ready' } | { status: 'failed'; message: string };

const StartupFailureContext = createContext<(error: unknown) => void>(error =>
  console.error(error),
);

/**
 * Para los contextos: si no pueden leer sus datos, se enseña la pantalla de
 * error en vez de seguir con datos vacíos (que se guardarían encima de los buenos).
 */
export function useStartupFailure(): (error: unknown) => void {
  return useContext(StartupFailureContext);
}

const messageOf = (error: unknown) =>
  error instanceof Error && error.message ? error.message : String(error);

/**
 * Abre la base de datos antes de montar la app. Si falla (o falla la lectura
 * de algún contexto), enseña el error con un botón para reintentar en lugar de
 * quedarse para siempre en la pantalla de carga.
 */
export function StartupGate({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({ status: 'opening' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ status: 'opening' });
    openDb().then(
      () => alive && setState({ status: 'ready' }),
      error => alive && setState({ status: 'failed', message: messageOf(error) }),
    );
    return () => {
      alive = false;
    };
  }, [attempt]);

  const fail = useCallback(
    (error: unknown) => setState({ status: 'failed', message: messageOf(error) }),
    [],
  );

  const failed = state.status === 'failed';
  useEffect(() => {
    if (failed) BootSplash.hide({ fade: true }).catch(() => {});
  }, [failed]);

  if (state.status === 'failed') {
    return (
      <SafeAreaView style={styles.error}>
        <Text style={styles.title}>No se han podido abrir tus datos</Text>
        <Text style={styles.message}>{state.message}</Text>
        <Text style={styles.hint}>
          No se ha borrado nada. Vuelve a intentarlo; si sigue fallando, cierra la app del todo o
          reinicia el móvil.
        </Text>
        <PrimaryButton label="Reintentar" onPress={() => setAttempt(a => a + 1)} />
      </SafeAreaView>
    );
  }

  if (state.status === 'opening') {
    // El splash nativo sigue tapando la pantalla mientras tanto.
    return <View style={styles.blank} />;
  }

  return (
    <StartupFailureContext.Provider value={fail}>
      <React.Fragment key={attempt}>{children}</React.Fragment>
    </StartupFailureContext.Provider>
  );
}

const styles = StyleSheet.create({
  blank: { flex: 1, backgroundColor: colors.background },
  error: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
  },
  title: { color: colors.text, fontSize: 20, fontWeight: '800' },
  message: { color: colors.text, fontSize: 14, lineHeight: 20 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 18 },
});
