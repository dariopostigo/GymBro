import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useStartupFailure } from '../components/StartupGate';
import { saveInBackground } from '../storage/saveErrors';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type Settings,
} from '../storage/settingsStorage';

interface SettingsContextValue {
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/** Preferencias de la app que se cambian desde la pantalla de Ajustes. */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const fail = useStartupFailure();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadSettings();
      setSettings(stored);
      setLoaded(true);
    })().catch(fail);
  }, [fail]);

  useEffect(() => {
    if (!loaded) return;
    saveInBackground(saveSettings(settings));
  }, [settings, loaded]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(() => ({ settings, updateSettings }), [settings, updateSettings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings debe usarse dentro de SettingsProvider');
  return ctx;
}
