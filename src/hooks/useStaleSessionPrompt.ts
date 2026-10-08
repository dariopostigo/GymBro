import { useCallback, useEffect, useRef } from 'react';
import { Alert, AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRoutine } from '../context/RoutineContext';
import { useSession } from '../context/SessionContext';
import type { RootStackParamList } from '../navigation/types';
import { describeSessionDay, findStaleSession } from '../utils/staleSession';

/**
 * Si se entrenó pero no se pulsó "Terminar entrenamiento", al volver días después
 * las series nuevas se sumarían a aquella sesión. Al abrir la app (o volver a ella)
 * se pregunta si terminarla y pasar al siguiente día o seguir con ella.
 */
export function useStaleSessionPrompt() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeSplit, currentDay, currentDayIndex, advanceToNextDay } = useRoutine();
  const { loading, sessions, finishSession } = useSession();
  // Sesiones por las que ya se preguntó: "Seguir con él" no vuelve a insistir hasta reabrir la app.
  const asked = useRef(new Set<string>());

  const check = useCallback(() => {
    if (loading || !activeSplit || !currentDay) return;
    const stale = findStaleSession(sessions, activeSplit.id, currentDay.id, Date.now());
    if (!stale || asked.current.has(stale.id)) return;
    asked.current.add(stale.id);

    const nextDay = activeSplit.days[(currentDayIndex + 1) % activeSplit.days.length];
    const series = stale.sets.length === 1 ? '1 serie' : `${stale.sets.length} series`;
    Alert.alert(
      'Entrenamiento sin terminar',
      `Tienes "${currentDay.name}" ${describeSessionDay(stale.date, Date.now())} sin terminar ` +
        `(${series}). ¿Lo das por terminado?`,
      [
        { text: 'Seguir con él', style: 'cancel' },
        {
          text: nextDay ? `Terminar y pasar a ${nextDay.name}` : 'Terminar',
          onPress: () => {
            finishSession(stale.id);
            advanceToNextDay();
            navigation.navigate('WorkoutSummary', { sessionId: stale.id });
          },
        },
      ],
    );
  }, [
    loading,
    activeSplit,
    currentDay,
    currentDayIndex,
    sessions,
    finishSession,
    advanceToNextDay,
    navigation,
  ]);

  useEffect(() => {
    check();
  }, [check]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') check();
    });
    return () => subscription.remove();
  }, [check]);
}
