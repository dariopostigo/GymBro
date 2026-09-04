/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../App';
import { SPLIT_PRESETS } from '../src/data/splitPresets';

type Node = ReactTestRenderer.ReactTestRendererJSON | string | null;

/** Todos los textos renderizados, recorriendo el árbol serializado. */
function textContent(node: Node | Node[]): string[] {
  if (node == null) return [];
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(textContent);
  return (node.children ?? []).flatMap(textContent);
}

test('con un split activo entra en el menú principal con sus pestañas', async () => {
  await AsyncStorage.setItem(
    'gymbro:activeSplit',
    JSON.stringify({ splitId: SPLIT_PRESETS[0].id, currentDayIndex: 0 }),
  );

  let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });
  // La rutina y las sesiones se cargan de AsyncStorage en varios ticks.
  for (let i = 0; i < 5; i += 1) {
    await ReactTestRenderer.act(async () => {
      await new Promise<void>(resolve => setImmediate(() => resolve()));
    });
  }

  const texts = textContent(renderer!.toJSON());
  expect(texts).toContain('Menú principal');
  expect(texts).toContain('Entrenar hoy');
  expect(texts).toContain('Inicio');
});
