import { NativeModules } from 'react-native';
import {
  DocumentDirectoryPath,
  copyFile,
  exists,
  mkdir,
  readDir,
  unlink,
} from '@dr.pogodin/react-native-fs';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';
import { withDb } from './db';

/** Fotos de los ejercicios propios, dentro de la app (no se borran con la caché). */
const PHOTOS_DIR = `${DocumentDirectoryPath}/custom-exercises`;
/** Tamaño al que se reducen las fotos: lado largo en px y calidad JPEG. */
const MAX_SIDE = 1200;
const QUALITY = 80;

const toPath = (uri: string) => decodeURIComponent(uri.replace(/^file:\/\//, ''));

/** Ruta en el móvil de una foto por su nombre de archivo (para la copia de seguridad). */
export const customExercisePhotoPath = (fileName: string) => `${PHOTOS_DIR}/${fileName}`;
export const ensureCustomExercisePhotosDir = () => mkdir(PHOTOS_DIR);

/** "file://…/custom-exercises/123.jpg" → "123.jpg"; null si no es una foto de esa carpeta. */
export function customExercisePhotoName(uri: string): string | null {
  const match = /\/custom-exercises\/([^/]+)$/.exec(toPath(uri));
  return match ? match[1] : null;
}

/**
 * Abre el selector del sistema (galería, archivos, Drive...) y copia la foto
 * elegida a la carpeta de la app. Devuelve su `file://` o `null` si se cancela.
 */
export async function pickExercisePhoto(): Promise<string | null> {
  let uri: string;
  let name: string | null;
  try {
    [{ uri, name }] = await pick({ type: [types.images] });
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) return null;
    throw error;
  }
  const [copy] = await keepLocalCopy({
    files: [{ uri, fileName: name ?? 'foto.jpg' }],
    destination: 'cachesDirectory',
  });
  if (copy.status === 'error') throw new Error('No se pudo leer la foto elegida.');

  await mkdir(PHOTOS_DIR);
  const cached = toPath(copy.localUri);
  try {
    if (NativeModules.PhotoResize?.saveResized) {
      // Reducida a JPEG: una foto de la cámara pasa de 3-5 MB a ~150 KB.
      const path = `${PHOTOS_DIR}/${Date.now()}.jpg`;
      await NativeModules.PhotoResize.saveResized(copy.localUri, path, MAX_SIDE, QUALITY);
      return `file://${path}`;
    }
    const extension = /\.\w+$/.exec(name ?? '')?.[0].toLowerCase() ?? '.jpg';
    const path = `${PHOTOS_DIR}/${Date.now()}${extension}`;
    await copyFile(cached, path);
    return `file://${path}`;
  } finally {
    unlink(cached).catch(() => {});
  }
}

/** Nombres de las fotos que salen en las copias internas (la de deshacer la importación...). */
async function photosInSnapshots(): Promise<Set<string>> {
  const { rows } = await withDb(db => db.execute('SELECT data FROM snapshots'));
  const names = new Set<string>();
  for (const row of rows) {
    for (const [, name] of String(row.data).matchAll(/\/custom-exercises\/([^/"\\]+)/g)) {
      names.add(name);
    }
  }
  return names;
}

/**
 * Quita las fotos que ya no usa ningún ejercicio (cambiadas, de uno borrado o sin
 * guardar). Las de la copia para deshacer la importación se quedan: si no, al
 * deshacer volverían los ejercicios sin sus fotos.
 */
export async function removeUnusedPhotos(used: string[]): Promise<void> {
  if (!(await exists(PHOTOS_DIR))) return;
  const keep = await photosInSnapshots();
  for (const uri of used) {
    const name = customExercisePhotoName(uri);
    if (name) keep.add(name);
  }
  for (const file of await readDir(PHOTOS_DIR)) {
    if (file.isFile() && !keep.has(file.name)) await unlink(file.path).catch(() => {});
  }
}

/** Las fotos que siguen en el móvil: tras importar una copia de otro, las suyas no están. */
export async function existingPhotos(uris: string[]): Promise<Set<string>> {
  const found = await Promise.all(
    uris.map(async uri => ((await exists(toPath(uri))) ? uri : null)),
  );
  return new Set(found.filter((uri): uri is string => uri !== null));
}
