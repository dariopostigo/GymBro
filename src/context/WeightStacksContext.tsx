import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  loadWeightStacks,
  resolveStack,
  saveWeightStacks,
  type StackSource,
  type WeightStacks,
} from '../storage/weightStackStorage';
import { stackWeights, type WeightStack } from '../utils/weightStack';

interface WeightStacksContextValue {
  /** La pila que vale para el ejercicio y si es tuya, la de por defecto o ninguna. */
  getStack: (exerciseId: number) => { stack?: WeightStack; source: StackSource };
  /** Pesos de la pila del ejercicio, o nada si no tiene. */
  getWeights: (exerciseId: number) => number[] | undefined;
  /** Una pila la guarda; `null` deja la máquina sin pila; `undefined` vuelve a la de por defecto. */
  setStack: (exerciseId: number, stack: WeightStack | null | undefined) => void;
}

const WeightStacksContext = createContext<WeightStacksContextValue | null>(null);

/** Pesos reales de cada máquina, para sugerir y elegir solo pesos que existen. */
export function WeightStacksProvider({ children }: { children: React.ReactNode }) {
  const [stacks, setStacks] = useState<WeightStacks>({});

  useEffect(() => {
    (async () => {
      const loaded = await loadWeightStacks();
      // Lo configurado antes de terminar la carga no se pisa con lo guardado.
      setStacks(prev => ({ ...loaded, ...prev }));
    })();
  }, []);

  const getStack = useCallback((exerciseId: number) => resolveStack(stacks, exerciseId), [stacks]);

  const getWeights = useCallback(
    (exerciseId: number) => {
      const { stack } = resolveStack(stacks, exerciseId);
      const weights = stack ? stackWeights(stack) : [];
      return weights.length ? weights : undefined;
    },
    [stacks],
  );

  const setStack = useCallback((exerciseId: number, stack: WeightStack | null | undefined) => {
    setStacks(prev => {
      const next = { ...prev };
      if (stack === undefined) delete next[exerciseId];
      else next[exerciseId] = stack;
      saveWeightStacks(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ getStack, getWeights, setStack }),
    [getStack, getWeights, setStack],
  );

  return <WeightStacksContext.Provider value={value}>{children}</WeightStacksContext.Provider>;
}

export function useWeightStacks(): WeightStacksContextValue {
  const ctx = useContext(WeightStacksContext);
  if (!ctx) throw new Error('useWeightStacks debe usarse dentro de WeightStacksProvider');
  return ctx;
}
