/* eslint-disable no-bitwise -- base64, CRC-32 y cabeceras zip son operaciones de bits */
import { appendFile, exists, read, stat, writeFile } from '@dr.pogodin/react-native-fs';
import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';

/**
 * Copia de seguridad con fotos: un .zip con `backup.json` y las fotos en
 * `photos/<carpeta>/<archivo>`. Mismo archivo en CestaBro y GymBro (si se
 * cambia, copiarlo).
 *
 * Se escribe y se lee foto a foto, sin cargar el zip entero en memoria: al
 * escribir, cada foto se añade al final del archivo; al leer, se salta a cada
 * una con el índice (directorio central) que va al final del zip. Las fotos
 * van sin comprimir (los JPEG ya lo están) y el JSON, comprimido.
 *
 * Es un zip normal: se puede abrir en el ordenador para ver las fotos.
 */
export const BACKUP_JSON = 'backup.json';

export interface ArchiveFile {
  /** Nombre dentro del zip, p. ej. "photos/tickets/t-123.jpg". */
  name: string;
  /** Ruta del archivo en el móvil. */
  path: string;
}

export interface ArchiveEntry {
  name: string;
  method: number;
  crc: number;
  compressedSize: number;
  size: number;
  headerOffset: number;
}

export class ArchiveError extends Error {}

// ── base64 ⇄ bytes (react-native-fs lee y escribe binario en base64) ──

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOOKUP = new Uint8Array(128);
for (let i = 0; i < ALPHABET.length; i++) {
  LOOKUP[ALPHABET.charCodeAt(i)] = i;
}

export function toBase64(bytes: Uint8Array): string {
  let out = '';
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out += ALPHABET[n >> 18] + ALPHABET[(n >> 12) & 63] + ALPHABET[(n >> 6) & 63] + ALPHABET[n & 63];
  }
  if (i < bytes.length) {
    const n = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8);
    out += ALPHABET[n >> 18] + ALPHABET[(n >> 12) & 63];
    out += i + 1 < bytes.length ? ALPHABET[(n >> 6) & 63] + '=' : '==';
  }
  return out;
}

export function fromBase64(text: string): Uint8Array {
  const clean = text.replace(/[^A-Za-z0-9+/]/g, '');
  const bytes = new Uint8Array(Math.floor((clean.length * 3) / 4));
  let j = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const n =
      (LOOKUP[clean.charCodeAt(i)] << 18) |
      (LOOKUP[clean.charCodeAt(i + 1)] << 12) |
      (LOOKUP[clean.charCodeAt(i + 2)] << 6) |
      LOOKUP[clean.charCodeAt(i + 3)];
    bytes[j++] = n >> 16;
    if (i + 2 < clean.length) bytes[j++] = (n >> 8) & 255;
    if (i + 3 < clean.length) bytes[j++] = n & 255;
  }
  return bytes.subarray(0, j);
}

// ── CRC-32 (obligatorio en cada entrada del zip) ──

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 255] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ── Cabeceras ──

const LOCAL_SIG = 0x04034b50;
const CENTRAL_SIG = 0x02014b50;
const END_SIG = 0x06054b50;
const UTF8_NAMES = 0x0800;
const STORED = 0;
const DEFLATED = 8;

function header(size: number, fill: (view: DataView) => void): Uint8Array {
  const bytes = new Uint8Array(size);
  fill(new DataView(bytes.buffer));
  return bytes;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** Fecha y hora en formato MS-DOS, la que guarda el zip. */
function dosDateTime(date: Date): [number, number] {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const day = ((Math.max(date.getFullYear(), 1980) - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return [time, day];
}

// ── Escribir ──

/**
 * Escribe el zip en `outPath`: primero `backup.json` y después cada archivo.
 * Los que ya no existen en el móvil se saltan. Devuelve cuántos archivos entraron.
 */
export async function writeArchive(
  outPath: string,
  json: string,
  files: ArchiveFile[],
  now = new Date(),
): Promise<number> {
  const [time, day] = dosDateTime(now);
  const central: Uint8Array[] = [];
  let offset = 0;
  let count = 0;
  await writeFile(outPath, '', 'base64');

  const add = async (name: string, data: Uint8Array, size: number, crc: number, method: number) => {
    const nameBytes = strToU8(name);
    const local = header(30, v => {
      v.setUint32(0, LOCAL_SIG, true);
      v.setUint16(4, 20, true);
      v.setUint16(6, UTF8_NAMES, true);
      v.setUint16(8, method, true);
      v.setUint16(10, time, true);
      v.setUint16(12, day, true);
      v.setUint32(14, crc, true);
      v.setUint32(18, data.length, true);
      v.setUint32(22, size, true);
      v.setUint16(26, nameBytes.length, true);
      v.setUint16(28, 0, true);
    });
    central.push(
      header(46, v => {
        v.setUint32(0, CENTRAL_SIG, true);
        v.setUint16(4, 20, true);
        v.setUint16(6, 20, true);
        v.setUint16(8, UTF8_NAMES, true);
        v.setUint16(10, method, true);
        v.setUint16(12, time, true);
        v.setUint16(14, day, true);
        v.setUint32(16, crc, true);
        v.setUint32(20, data.length, true);
        v.setUint32(24, size, true);
        v.setUint16(28, nameBytes.length, true);
        v.setUint32(42, offset, true);
      }),
      nameBytes,
    );
    const entry = concat([local, nameBytes, data]);
    await appendFile(outPath, toBase64(entry), 'base64');
    offset += entry.length;
  };

  const jsonBytes = strToU8(json);
  await add(BACKUP_JSON, deflateSync(jsonBytes, { level: 6 }), jsonBytes.length, crc32(jsonBytes), DEFLATED);

  for (const file of files) {
    if (!(await exists(file.path))) {
      continue;
    }
    const data = fromBase64(await read(file.path, (await stat(file.path)).size, 0, 'base64'));
    await add(file.name, data, data.length, crc32(data), STORED);
    count++;
  }

  const directory = concat(central);
  const end = header(22, v => {
    v.setUint32(0, END_SIG, true);
    v.setUint16(8, count + 1, true);
    v.setUint16(10, count + 1, true);
    v.setUint32(12, directory.length, true);
    v.setUint32(16, offset, true);
  });
  await appendFile(outPath, toBase64(concat([directory, end])), 'base64');
  return count;
}

// ── Leer ──

const readBytes = async (path: string, length: number, position: number) =>
  length ? fromBase64(await read(path, length, position, 'base64')) : new Uint8Array(0);

/** El archivo empieza como un zip ("PK\3\4")? Si no, será una copia .json antigua. */
export async function isArchive(path: string): Promise<boolean> {
  const head = await readBytes(path, 4, 0);
  return head.length === 4 && new DataView(head.buffer, head.byteOffset).getUint32(0, true) === LOCAL_SIG;
}

/** Lee el índice del zip (al final del archivo) sin cargar el resto. */
export async function listArchive(path: string): Promise<ArchiveEntry[]> {
  const size = (await stat(path)).size;
  const tailLength = Math.min(size, 22 + 0xffff);
  const tail = await readBytes(path, tailLength, size - tailLength);
  const tailView = new DataView(tail.buffer, tail.byteOffset, tail.length);
  let end = -1;
  for (let i = tail.length - 22; i >= 0; i--) {
    if (tailView.getUint32(i, true) === END_SIG) {
      end = i;
      break;
    }
  }
  if (end < 0) {
    throw new ArchiveError('El archivo no es un zip válido.');
  }
  const total = tailView.getUint16(end + 10, true);
  const dirSize = tailView.getUint32(end + 12, true);
  const dirOffset = tailView.getUint32(end + 16, true);
  const dir = await readBytes(path, dirSize, dirOffset);
  const view = new DataView(dir.buffer, dir.byteOffset, dir.length);
  const entries: ArchiveEntry[] = [];
  let p = 0;
  for (let i = 0; i < total; i++) {
    if (p + 46 > dir.length || view.getUint32(p, true) !== CENTRAL_SIG) {
      throw new ArchiveError('El índice del zip está dañado.');
    }
    const nameLength = view.getUint16(p + 28, true);
    const extraLength = view.getUint16(p + 30, true);
    const commentLength = view.getUint16(p + 32, true);
    entries.push({
      name: strFromU8(dir.subarray(p + 46, p + 46 + nameLength)),
      method: view.getUint16(p + 10, true),
      crc: view.getUint32(p + 16, true),
      compressedSize: view.getUint32(p + 20, true),
      size: view.getUint32(p + 24, true),
      headerOffset: view.getUint32(p + 42, true),
    });
    p += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}

/** Los bytes de una entrada, descomprimidos y con el CRC comprobado. */
export async function readEntry(path: string, entry: ArchiveEntry): Promise<Uint8Array> {
  const local = await readBytes(path, 30, entry.headerOffset);
  const view = new DataView(local.buffer, local.byteOffset, local.length);
  if (local.length < 30 || view.getUint32(0, true) !== LOCAL_SIG) {
    throw new ArchiveError(`La entrada ${entry.name} del zip está dañada.`);
  }
  const dataOffset = entry.headerOffset + 30 + view.getUint16(26, true) + view.getUint16(28, true);
  const raw = await readBytes(path, entry.compressedSize, dataOffset);
  let data: Uint8Array;
  if (entry.method === STORED) {
    data = raw;
  } else if (entry.method === DEFLATED) {
    data = inflateSync(raw);
  } else {
    throw new ArchiveError(`La entrada ${entry.name} usa una compresión que no se conoce.`);
  }
  if (data.length !== entry.size || crc32(data) !== entry.crc) {
    throw new ArchiveError(`La entrada ${entry.name} del zip está dañada.`);
  }
  return data;
}

export async function readArchiveJson(path: string, entries: ArchiveEntry[]): Promise<string> {
  const entry = entries.find(e => e.name === BACKUP_JSON);
  if (!entry) {
    throw new ArchiveError(`Al zip le falta ${BACKUP_JSON}.`);
  }
  return strFromU8(await readEntry(path, entry));
}

/** Escribe una entrada en `destPath` (comprobando antes el CRC). */
export async function extractEntry(path: string, entry: ArchiveEntry, destPath: string): Promise<void> {
  await writeFile(destPath, toBase64(await readEntry(path, entry)), 'base64');
}

/**
 * Nombre de archivo seguro de una entrada `photos/<carpeta>/<archivo>`, o null
 * si no es de esa carpeta o trae algo raro ("..", subcarpetas): nunca se
 * escribe fuera de la carpeta de fotos.
 */
export function photoNameIn(entry: ArchiveEntry, folder: string): string | null {
  const prefix = `photos/${folder}/`;
  if (!entry.name.startsWith(prefix)) {
    return null;
  }
  const name = entry.name.slice(prefix.length);
  return /^[A-Za-z0-9._-]+$/.test(name) && name !== '.' && name !== '..' ? name : null;
}
