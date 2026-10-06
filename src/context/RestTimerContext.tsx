import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Vibration } from 'react-native';
import { useSettings } from './SettingsContext';
import { loadRestTimer, saveRestTimer } from '../storage/settingsStorage';
import { adjustRest, startRest, type RestTimer } from '../utils/restTimer';

/** Dos pulsos cortos: se nota en el bolsillo sin ser una alarma. */
const FINISH_VIBRATION = [0, 350, 180, 350];
/** Si la app estaba parada y el aviso llega con más retraso que esto, no se vibra. */
const LATE_VIBRATION_MS = 3000;
/** Tiempo que se queda el mensaje de "descanso terminado" antes de ocultarse. */
const FINISHED_BANNER_MS = 2500;

interface RestTimerContextValue {
  timer: RestTimer | null;
  /** Acaba de terminar un descanso: la barra muestra el aviso unos segundos. */
  finished: boolean;
  /** Arranca (o reinicia) el descanso; sin segundos usa la duración de Ajustes. */
  start: (seconds?: number) => void;
  adjust: (deltaSeconds: number) => void;
  skip: () => void;
}

const RestTimerContext = createContext<RestTimerContextValue | null>(null);

export function RestTimerProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [timer, setTimer] = useState<RestTimer | null>(null);
  const [finished, setFinished] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadRestTimer();
      // Un descanso que terminó con la app cerrada ya no se muestra.
      setTimer(prev => prev ?? (stored && stored.endsAt > Date.now() ? stored : null));
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveRestTimer(timer);
  }, [timer, loaded]);

  // Al desactivarlo en Ajustes se corta el descanso en curso.
  useEffect(() => {
    if (settings.restTimerEnabled) return;
    setTimer(null);
    setFinished(false);
  }, [settings.restTimerEnabled]);

  useEffect(() => {
    if (!timer) return;
    const timeout = setTimeout(() => {
      if (Date.now() - timer.endsAt < LATE_VIBRATION_MS) Vibration.vibrate(FINISH_VIBRATION);
      setTimer(null);
      setFinished(true);
    }, Math.max(0, timer.endsAt - Date.now()));
    return () => clearTimeout(timeout);
  }, [timer]);

  useEffect(() => {
    if (!finished) return;
    const timeout = setTimeout(() => setFinished(false), FINISHED_BANNER_MS);
    return () => clearTimeout(timeout);
  }, [finished]);

  const start = useCallback(
    (seconds?: number) => {
      if (!settings.restTimerEnabled) return;
      setFinished(false);
      setTimer(startRest(seconds ?? settings.restSeconds, Date.now()));
    },
    [settings.restTimerEnabled, settings.restSeconds],
  );

  const adjust = useCallback((deltaSeconds: number) => {
    setTimer(prev => (prev ? adjustRest(prev, deltaSeconds, Date.now()) : prev));
  }, []);

  const skip = useCallback(() => {
    setTimer(null);
    setFinished(false);
  }, []);

  const value = useMemo(
    () => ({ timer, finished, start, adjust, skip }),
    [timer, finished, start, adjust, skip],
  );

  return <RestTimerContext.Provider value={value}>{children}</RestTimerContext.Provider>;
}

export function useRestTimer(): RestTimerContextValue {
  const ctx = useContext(RestTimerContext);
  if (!ctx) throw new Error('useRestTimer debe usarse dentro de RestTimerProvider');
  return ctx;
}
