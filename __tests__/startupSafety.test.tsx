/**
 * Arreglos del repaso de la 1.3.4: fotos al deshacer una importación, pantalla
 * de error si la base no abre y aviso si un guardado falla.
 */
import React from 'react';
import { Alert, Text } from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import { readDir, unlink } from '@dr.pogodin/react-native-fs';
import { StartupGate } from '../src/components/StartupGate';
import { importBackup, createBackup } from '../src/storage/backup';
import { removeUnusedPhotos } from '../src/storage/customExercisePhotos';
import { saveCustomExercises } from '../src/storage/customExerciseStorage';
import * as db from '../src/storage/db';
import { saveInBackground } from '../src/storage/saveErrors';
import type { CustomExercise } from '../src/types/exercise';

const DIR = '/documents/custom-exercises';
const file = (name: string) => ({ name, path: `${DIR}/${name}`, isFile: () => true });

const exercise = (id: number, photo: string): CustomExercise =>
  ({
    id,
    uuid: `custom-${id}`,
    name: `Propio ${id}`,
    images: [`file://${DIR}/${photo}`],
  }) as unknown as CustomExercise;

describe('fotos de los ejercicios propios', () => {
  beforeEach(() => {
    (unlink as jest.Mock).mockClear();
    (readDir as jest.Mock).mockResolvedValue([file('antes.jpg'), file('nueva.jpg'), file('suelta.jpg')]);
  });

  test('las de la copia para deshacer no se borran al limpiar', async () => {
    await saveCustomExercises([exercise(100001, 'antes.jpg')]);
    const imported = await createBackup();
    imported.data.customExercises = [exercise(100001, 'nueva.jpg')];
    await importBackup(imported);

    // Lo que hace el contexto al recargar: solo usa la foto de la copia importada.
    await removeUnusedPhotos([`file://${DIR}/nueva.jpg`]);

    const removed = (unlink as jest.Mock).mock.calls.map(([path]) => path);
    expect(removed).toEqual([`${DIR}/suelta.jpg`]);
  });

  test('sin copia para deshacer, se borran las que no usa nadie', async () => {
    await removeUnusedPhotos([`file://${DIR}/nueva.jpg`]);
    const removed = (unlink as jest.Mock).mock.calls.map(([path]) => path).sort();
    expect(removed).toEqual([`${DIR}/antes.jpg`, `${DIR}/suelta.jpg`]);
  });
});

describe('arranque', () => {
  afterEach(() => jest.restoreAllMocks());

  test('si la base no abre, enseña el error y se puede reintentar', async () => {
    const open = jest
      .spyOn(db, 'openDb')
      .mockRejectedValueOnce(new Error('disco roto'))
      .mockResolvedValueOnce();
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <StartupGate>
          <Text>la app</Text>
        </StartupGate>,
      );
    });
    const texts = () => renderer.root.findAllByType(Text).map(t => t.props.children);
    expect(texts()).toContain('disco roto');
    expect(texts()).not.toContain('la app');

    const retry = renderer.root.findByProps({ accessibilityRole: 'button' });
    await ReactTestRenderer.act(async () => retry.props.onPress());
    expect(open).toHaveBeenCalledTimes(2);
    expect(texts()).toEqual(['la app']);
    await ReactTestRenderer.act(() => renderer.unmount());
  });
});

test('un guardado que falla avisa una sola vez aunque fallen varios', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  saveInBackground(Promise.reject(new Error('sin espacio')));
  saveInBackground(Promise.reject(new Error('sin espacio')));
  await new Promise<void>(resolve => setImmediate(() => resolve()));
  expect(alert).toHaveBeenCalledTimes(1);
  expect(alert.mock.calls[0][0]).toBe('No se ha podido guardar');
  warn.mockRestore();
  alert.mockRestore();
});
