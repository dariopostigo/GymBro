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

beforeEach(() => AsyncStorage.clear());

test('corregir una serie cambia peso, reps y esfuerzo y lo guarda', async () => {
  const session = await renderSession();
  await ReactTestRenderer.act(async () => {
    session.current().addSet({
      splitId: 'ppl',
      splitDayId: 'push',
      dayName: 'Empuje',
      exerciseId: 73,
      positionInSession: 1,
      weight: 80,
      reps: 8,
      rir: 2,
    });
  });
  const active = session.current().getActiveSession('ppl', 'push')!;
  const [set] = active.sets;

  await ReactTestRenderer.act(async () => {
    session.current().updateSet(active.id, set.id, { weight: 82.5, reps: 7 });
  });

  const updated = session.current().getActiveSession('ppl', 'push')!.sets[0];
  expect(updated).toMatchObject({ id: set.id, setNumber: 1, weight: 82.5, reps: 7 });
  expect('rir' in updated).toBe(false);
  expect((await loadSessions())[0].sets[0]).toMatchObject({ weight: 82.5, reps: 7 });
});

test('deshacer un borrado devuelve la serie a su sitio, con su id y su hora', async () => {
  const session = await renderSession();
  for (const reps of [10, 9, 8]) {
    await ReactTestRenderer.act(async () => {
      session.current().addSet({
        splitId: 'ppl',
        splitDayId: 'push',
        dayName: 'Empuje',
        exerciseId: 73,
        positionInSession: 1,
        weight: 80,
        reps,
      });
    });
  }
  const active = session.current().getActiveSession('ppl', 'push')!;
  const middle = active.sets[1];

  await ReactTestRenderer.act(async () => {
    session.current().removeSet(active.id, middle.id);
  });
  expect(session.current().getActiveSession('ppl', 'push')!.sets).toHaveLength(2);

  await ReactTestRenderer.act(async () => {
    session.current().restoreSet(active.id, middle, 1);
  });
  const sets = session.current().getActiveSession('ppl', 'push')!.sets;
  expect(sets.map(s => s.reps)).toEqual([10, 9, 8]);
  expect(sets[1]).toEqual(middle);
  expect((await loadSessions())[0].sets.map(s => s.reps)).toEqual([10, 9, 8]);

  // Restaurar dos veces no la duplica.
  await ReactTestRenderer.act(async () => {
    session.current().restoreSet(active.id, middle, 1);
  });
  expect(session.current().getActiveSession('ppl', 'push')!.sets).toHaveLength(3);
});
