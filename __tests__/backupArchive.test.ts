/* eslint-disable no-bitwise -- bytes de prueba y zip dañado a propósito */
import { strToU8 } from 'fflate';
import {
  ArchiveError,
  extractEntry,
  fromBase64,
  isArchive,
  listArchive,
  photoNameIn,
  readArchiveJson,
  toBase64,
  writeArchive,
} from '../src/storage/backupArchive';

// Sistema de archivos en memoria con la API de react-native-fs que usa el zip.
const mockFiles = new Map<string, Uint8Array>();
jest.mock('@dr.pogodin/react-native-fs', () => {
  const b64 = require('../src/storage/backupArchive');
  const concat = (a: Uint8Array, b: Uint8Array) => {
    const out = new Uint8Array(a.length + b.length);
    out.set(a);
    out.set(b, a.length);
    return out;
  };
  return {
    writeFile: async (path: string, data: string) => {
      mockFiles.set(path, b64.fromBase64(data));
    },
    appendFile: async (path: string, data: string) => {
      mockFiles.set(path, concat(mockFiles.get(path) ?? new Uint8Array(0), b64.fromBase64(data)));
    },
    read: async (path: string, length: number, position: number) =>
      b64.toBase64(mockFiles.get(path)!.subarray(position, position + length)),
    stat: async (path: string) => ({ size: mockFiles.get(path)!.length }),
    exists: async (path: string) => mockFiles.has(path),
  };
});

const bytes = (n: number, seed: number) => Uint8Array.from({ length: n }, (_, i) => (i * 31 + seed) & 255);

beforeEach(() => mockFiles.clear());

test('base64 de ida y vuelta, con cualquier longitud', () => {
  for (const n of [0, 1, 2, 3, 4, 5, 1000, 1001, 1002]) {
    expect(fromBase64(toBase64(bytes(n, n)))).toEqual(bytes(n, n));
  }
  expect(toBase64(new Uint8Array([77, 97, 110]))).toBe('TWFu');
  expect(toBase64(new Uint8Array([77]))).toBe('TQ==');
});

test('escribe y lee el JSON y las fotos; las que faltan se saltan', async () => {
  mockFiles.set('/fotos/a.jpg', bytes(5000, 1));
  mockFiles.set('/fotos/b.jpg', bytes(1, 2));
  const json = JSON.stringify({ app: 'gymbro', texto: 'año, ñ y € también' });

  const count = await writeArchive('/out.zip', json, [
    { name: 'photos/tickets/a.jpg', path: '/fotos/a.jpg' },
    { name: 'photos/products/b.jpg', path: '/fotos/b.jpg' },
    { name: 'photos/tickets/borrada.jpg', path: '/fotos/borrada.jpg' },
  ]);
  expect(count).toBe(2);
  expect(await isArchive('/out.zip')).toBe(true);

  const entries = await listArchive('/out.zip');
  expect(entries.map(e => e.name)).toEqual(['backup.json', 'photos/tickets/a.jpg', 'photos/products/b.jpg']);
  expect(await readArchiveJson('/out.zip', entries)).toBe(json);

  await extractEntry('/out.zip', entries[1], '/restaurada/a.jpg');
  expect(mockFiles.get('/restaurada/a.jpg')).toEqual(bytes(5000, 1));

});

test('un .json no es un zip', async () => {
  mockFiles.set('/copia.json', strToU8('{"app":"gymbro"}'));
  expect(await isArchive('/copia.json')).toBe(false);
});

test('una foto dañada dentro del zip se detecta (CRC)', async () => {
  mockFiles.set('/fotos/a.jpg', bytes(300, 7));
  await writeArchive('/out.zip', '{}', [{ name: 'photos/tickets/a.jpg', path: '/fotos/a.jpg' }]);
  const entries = await listArchive('/out.zip');
  const zip = mockFiles.get('/out.zip')!;
  zip[entries[1].headerOffset + 30 + entries[1].name.length + 10] ^= 0xff;
  await expect(extractEntry('/out.zip', entries[1], '/x.jpg')).rejects.toThrow(ArchiveError);
  expect(mockFiles.has('/x.jpg')).toBe(false);
});

test('un archivo que no es zip da un error claro', async () => {
  mockFiles.set('/raro.bin', bytes(100, 3));
  await expect(listArchive('/raro.bin')).rejects.toThrow(/no es un zip/);
});

test('las fotos nunca se escriben fuera de su carpeta', () => {
  const entry = (name: string) => ({ name, method: 0, crc: 0, compressedSize: 0, size: 0, headerOffset: 0 });
  expect(photoNameIn(entry('photos/tickets/t-1.jpg'), 'tickets')).toBe('t-1.jpg');
  expect(photoNameIn(entry('photos/tickets/../../db.sqlite'), 'tickets')).toBeNull();
  expect(photoNameIn(entry('photos/tickets/sub/a.jpg'), 'tickets')).toBeNull();
  expect(photoNameIn(entry('photos/tickets/..'), 'tickets')).toBeNull();
  expect(photoNameIn(entry('photos/products/a.jpg'), 'tickets')).toBeNull();
});
