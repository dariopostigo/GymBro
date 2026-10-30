import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoutineProvider, useRoutine } from '../src/context/RoutineContext';
import { loadDayOverrides } from '../src/storage/routineStorage';

type Routine = ReturnType<typeof useRoutine>;

const DAY = 'ppl:ppl-push-1';
const SLOT = 'slot-73-0';

async function renderRoutine(): Promise<{ current: () => Routine }> {
  let value: Routine | undefined;
  function Probe() {
    value = useRoutine();
    return null;
  }
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(
      <RoutineProvider>
        <Probe />
      </RoutineProvider>,
    );
  });
  return { current: () => value! };
}

const change = async (fn: () => void) => {
  await ReactTestRenderer.act(async () => fn());
};

beforeEach(() => AsyncStorage.clear());

test('una tarjeta plegada a mano se recuerda al volver a abrir la app', async () => {
  const routine = await renderRoutine();
  await change(() =>
    routine.current().setDayOverride('ppl', 'ppl-push-1', SLOT, { collapsed: true }),
  );

  expect((await loadDayOverrides())[DAY][SLOT]).toEqual({ collapsed: true });
});

test('al cambiar el ejercicio la tarjeta vuelve a plegarse sola', async () => {
  const routine = await renderRoutine();
  await change(() =>
    routine.current().setDayOverride('ppl', 'ppl-push-1', SLOT, { collapsed: false }),
  );
  await change(() =>
    routine.current().setDayOverride('ppl', 'ppl-push-1', SLOT, { exerciseId: 919 }),
  );

  expect(routine.current().getDayOverrides('ppl', 'ppl-push-1')[SLOT]).toEqual({
    exerciseId: 919,
  });
});

test('cambiar las series no olvida el plegado', async () => {
  const routine = await renderRoutine();
  await change(() =>
    routine.current().setDayOverride('ppl', 'ppl-push-1', SLOT, { collapsed: true }),
  );
  await change(() =>
    routine.current().setDayOverride('ppl', 'ppl-push-1', SLOT, { targetSets: 4 }),
  );

  expect(routine.current().getDayOverrides('ppl', 'ppl-push-1')[SLOT]).toEqual({
    collapsed: true,
    targetSets: 4,
  });
});
