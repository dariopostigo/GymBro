/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import { withDb } from '../src/storage/db';

test('renders correctly', async () => {
  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  // Espera a que terminen las cargas de la base (van en fila) antes de desmontar.
  for (let i = 0; i < 5; i += 1) {
    await ReactTestRenderer.act(() => withDb(async () => {}));
  }
  await ReactTestRenderer.act(() => renderer!.unmount());
});
