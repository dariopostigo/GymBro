import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRoutine } from '../context/RoutineContext';
import type { WorkoutSession } from '../types/session';
import { monthCalendar, type CalendarDay } from '../utils/calendar';
import { formatSessionDate } from '../utils/stats';
import { colors, radius, spacing } from '../theme';
import { ChevronIcon } from './icons';
import { Card, Overline } from './ui';

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/** Un color por día de la rutina (por su orden), para ver cómo se van alternando. */
const DAY_COLORS = [colors.accent, '#5aa9ff', colors.success, '#ff8a5c', '#b48cff', '#2dd4bf'];

const sessionDayKey = (s: WorkoutSession) => `${s.splitId}:${s.splitDayId}`;

/**
 * Calendario del mes con los días entrenados: cada día lleva el color del día
 * de la rutina que se hizo y al tocarlo se abre su resumen.
 */
export default function TrainingCalendarCard({
  sessions,
  onOpenSession,
}: {
  sessions: WorkoutSession[];
  onOpenSession: (sessionId: string) => void;
}) {
  const { splits } = useRoutine();
  const now = new Date();
  const [shown, setShown] = useState({ year: now.getFullYear(), month: now.getMonth() });

  const calendar = useMemo(
    () => monthCalendar(sessions, shown.year, shown.month, new Date()),
    [sessions, shown],
  );

  // Se puede ir hacia atrás hasta el mes del primer entreno.
  const first = sessions.reduce<string | null>(
    (min, s) => (s.sets.length && (!min || s.date < min) ? s.date : min),
    null,
  );
  const firstDate = first ? new Date(first) : now;
  const canGoBack =
    shown.year * 12 + shown.month > firstDate.getFullYear() * 12 + firstDate.getMonth();
  const canGoForward = shown.year * 12 + shown.month < now.getFullYear() * 12 + now.getMonth();
  const move = (delta: number) =>
    setShown(({ year, month }) => {
      const date = new Date(year, month + delta, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });

  // Color y nombre de cada día de la rutina entrenado este mes, en el orden de la rutina.
  const legend = useMemo(() => {
    const monthSessions = calendar.weeks.flat().flatMap(day => day?.sessions ?? []);
    const entries = new Map<string, { order: number; name: string }>();
    for (const session of monthSessions) {
      const key = sessionDayKey(session);
      if (entries.has(key)) continue;
      const days = splits.find(s => s.id === session.splitId)?.days ?? [];
      const index = days.findIndex(d => d.id === session.splitDayId);
      entries.set(key, {
        order: index === -1 ? days.length + entries.size : index,
        name: days[index]?.name ?? session.dayName,
      });
    }
    return [...entries.entries()]
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([key, { name }], i) => ({ key, name, color: DAY_COLORS[i % DAY_COLORS.length] }));
  }, [calendar, splits]);
  const colorOf = (session: WorkoutSession) =>
    legend.find(item => item.key === sessionDayKey(session))?.color ?? colors.accent;

  const openDay = (day: CalendarDay) => {
    if (day.sessions.length === 1) {
      onOpenSession(day.sessions[0].id);
      return;
    }
    // Android admite tres botones: dos entrenos y cancelar.
    Alert.alert('¿Qué entreno quieres ver?', undefined, [
      ...day.sessions.slice(0, 2).map(session => ({
        text: session.dayName,
        onPress: () => onOpenSession(session.id),
      })),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);
  };

  const perWeek = calendar.perWeek.toFixed(1).replace('.', ',').replace(/,0$/, '');

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Overline>Entrenos · {calendar.title}</Overline>
        <View style={styles.nav}>
          <TouchableOpacity
            onPress={() => move(-1)}
            disabled={!canGoBack}
            hitSlop={8}
            accessibilityLabel="Mes anterior"
          >
            <ChevronIcon
              direction="left"
              size={18}
              color={canGoBack ? colors.text : colors.border}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => move(1)}
            disabled={!canGoForward}
            hitSlop={8}
            accessibilityLabel="Mes siguiente"
          >
            <ChevronIcon
              direction="right"
              size={18}
              color={canGoForward ? colors.text : colors.border}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.week}>
        {WEEKDAYS.map(label => (
          <Text key={label} style={styles.weekday}>
            {label}
          </Text>
        ))}
      </View>
      {calendar.weeks.map((week, index) => (
        <View key={index} style={styles.week}>
          {week.map((day, i) => {
            if (!day) return <View key={`empty-${i}`} style={styles.cell} />;
            const trained = day.sessions.length > 0;
            const color = trained ? colorOf(day.sessions[0]) : undefined;
            return (
              <TouchableOpacity
                key={day.key}
                style={styles.cell}
                disabled={!trained}
                onPress={() => openDay(day)}
                accessibilityLabel={
                  trained
                    ? `${day.sessions.map(s => s.dayName).join(' y ')}, ${formatSessionDate(
                        day.sessions[0],
                      )}`
                    : undefined
                }
              >
                <View
                  style={[
                    styles.circle,
                    day.isToday && styles.today,
                    trained && { backgroundColor: color, borderColor: color },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      day.isFuture && styles.future,
                      trained && styles.dayTrained,
                    ]}
                  >
                    {day.day}
                  </Text>
                </View>
                {day.sessions.length > 1 && <View style={styles.extra} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {legend.length > 0 && (
        <View style={styles.legend}>
          {legend.map(item => (
            <View key={item.key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.name}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.summary}>
        {calendar.workouts === 0
          ? 'Ningún entreno este mes.'
          : `${calendar.workouts} ${
              calendar.workouts === 1 ? 'entreno' : 'entrenos'
            } · ${perWeek} por semana de media`}
      </Text>
    </Card>
  );
}

const CIRCLE = 32;

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nav: { flexDirection: 'row', gap: spacing.lg },
  week: { flexDirection: 'row' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
  },
  cell: { flex: 1, alignItems: 'center', height: CIRCLE + 6 },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: { borderColor: colors.text },
  dayNumber: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  dayTrained: { color: colors.onAccent, fontWeight: '800' },
  future: { color: colors.border },
  extra: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 1,
    backgroundColor: colors.textDim,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: colors.textDim, fontSize: 12, fontWeight: '600' },
  summary: { color: colors.muted, fontSize: 12 },
});
