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

/** Fotos de los ejercicios propios, dentro de la app (no se borran con la caché). */
const PHOTOS_DIR = `${DocumentDirectoryPath}/custom-exercises`;

const toPath = (uri: string) => decodeURIComponent(uri.replace(/^file:\/\//, ''));

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
  const extension = /\.\w+$/.exec(name ?? '')?.[0].toLowerCase() ?? '.jpg';
  const path = `${PHOTOS_DIR}/${Date.now()}${extension}`;
  const cached = toPath(copy.localUri);
  await copyFile(cached, path);
  unlink(cached).catch(() => {});
  return `file://${path}`;
}

/** Quita las fotos que ya no usa ningún ejercicio (cambiadas, de uno borrado o sin guardar). */
export async function removeUnusedPhotos(used: string[]): Promise<void> {
  if (!(await exists(PHOTOS_DIR))) return;
  const keep = new Set(used.map(toPath));
  for (const file of await readDir(PHOTOS_DIR)) {
    if (file.isFile() && !keep.has(file.path)) await unlink(file.path).catch(() => {});
  }
}

/** Las fotos que siguen en el móvil: tras importar una copia de otro, las suyas no están. */
export async function existingPhotos(uris: string[]): Promise<Set<string>> {
  const found = await Promise.all(
    uris.map(async uri => ((await exists(toPath(uri))) ? uri : null)),
  );
  return new Set(found.filter((uri): uri is string => uri !== null));
}
