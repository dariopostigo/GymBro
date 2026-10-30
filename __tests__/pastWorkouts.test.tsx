import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionProvider, useSession } from '../src/context/SessionContext';
import { loadSessions } from '../src/storage/sessionStorage';

type Session = ReturnType<typeof useSession>;

async function renderSession(): Promise<{ current: () => Session }> {
  let value: Session | undefined;
  function Probe() {
    value = useSession();
    return null;
  }
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    );
  });
  return { current: () => value! };
}

const act = (fn: () => void) => ReactTestRenderer.act(async () => fn());

beforeEach(() => AsyncStorage.clear());

test('apuntar un entreno hecho sin la app: terminado, con sus series numeradas y sin hora', async () => {
  const session = await renderSession();
  const date = new Date(2026, 9, 20, 18).toISOString();
  let id = '';
  await act(() => {
    id = session.current().createPastSession({
      splitId: 'ppl',
      splitDayId: 'pull',
      dayName: 'Pull A',
      date,
    });
  });
  for (const reps of [10, 8]) {
    await act(() =>
      session.current().addSetToSession(id, {
        exerciseId: 475,
        positionInSession: 1,
        weight: 0,
        reps,
      }),
    );
  }
  const saved = session.current().sessions.find(s => s.id === id)!;
  expect(saved).toMatchObject({ completed: true, date, dayName: 'Pull A' });
  expect(saved.sets.map(s => [s.setNumber, s.reps])).toEqual([
    [1, 10],
    [2, 8],
  ]);
  expect(saved.sets[0].loggedAt).toBeUndefined();
  // Uno terminado no se confunde con el entreno en curso de ese día.
  expect(session.current().getActiveSession('ppl', 'pull')).toBeNull();
  expect((await loadSessions())[0].sets).toHaveLength(2);
});

test('mover un entreno de día mueve también la hora de cada serie', async () => {
  const session = await renderSession();
  await act(() =>
    session.current().addSet({
      splitId: 'ppl',
      splitDayId: 'push',
      dayName: 'Push A',
      exerciseId: 73,
      positionInSession: 1,
      weight: 80,
      reps: 8,
    }),
  );
  const before = session.current().getActiveSession('ppl', 'push')!;
  await act(() => session.current().moveSession(before.id, -2));
  const after = session.current().sessions[0];

  const day = (iso: string) => new Date(iso).getDate();
  const expected = new Date(before.date);
  expected.setDate(expected.getDate() - 2);
  expect(day(after.date)).toBe(expected.getDate());
  expect(new Date(after.date).getHours()).toBe(new Date(before.date).getHours());
  expect(Date.parse(after.sets[0].loggedAt!) - Date.parse(after.date)).toBe(
    Date.parse(before.sets[0].loggedAt!) - Date.parse(before.date),
  );
});

test('cambiar el día de la rutina y borrar el entreno', async () => {
  const session = await renderSession();
  let id = '';
  await act(() => {
    id = session.current().createPastSession({
      splitId: 'ppl',
      splitDayId: 'push',
      dayName: 'Push A',
      date: new Date(2026, 9, 20, 18).toISOString(),
    });
  });
  await act(() =>
    session
      .current()
      .updateSessionDay(id, { splitId: 'ppl', splitDayId: 'legs', dayName: 'Legs A' }),
  );
  expect(session.current().sessions[0]).toMatchObject({ splitDayId: 'legs', dayName: 'Legs A' });

  await act(() => session.current().deleteSession(id));
  expect(session.current().sessions).toHaveLength(0);
  expect(await loadSessions()).toHaveLength(0);
});

test('al reordenar hoy, las series ya apuntadas pasan a la posición nueva', async () => {
  const session = await renderSession();
  let id = '';
  await act(() => {
    id = session.current().createPastSession({
      splitId: 'ppl',
      splitDayId: 'legs',
      dayName: 'Legs',
      date: new Date(2026, 9, 30, 18).toISOString(),
    });
  });
  // Se hizo el 3º (sentadilla búlgara) antes que el 2º.
  await act(() =>
    session.current().addSetToSession(id, {
      exerciseId: 989,
      positionInSession: 3,
      positionInMuscleGroup: 3,
      weight: 20,
      reps: 10,
    }),
  );
  await act(() =>
    session
      .current()
      .setSetPositions(id, new Map([[989, { positionInSession: 2, positionInMuscleGroup: 2 }]])),
  );
  const [set] = session.current().sessions.find(s => s.id === id)!.sets;
  expect(set).toMatchObject({ positionInSession: 2, positionInMuscleGroup: 2, reps: 10 });
});
