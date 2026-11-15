import { CachesDirectoryPath, exists, readFile, unlink } from '@dr.pogodin/react-native-fs';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  saveDocuments,
  types,
} from '@react-native-documents/picker';
import { BackupError, backupFileName, createBackup, parseBackup, type BackupFile } from './backup';
import {
  extractEntry,
  isArchive,
  listArchive,
  photoNameIn,
  readArchiveJson,
  writeArchive,
  type ArchiveEntry,
  type ArchiveFile,
} from './backupArchive';
import {
  customExercisePhotoName,
  customExercisePhotoPath,
  ensureCustomExercisePhotosDir,
} from './customExercisePhotos';

/** Carpeta de fotos dentro del zip. */
const FOLDER = 'custom-exercises';

const isCanceled = (error: unknown) =>
  isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED;

const removeQuietly = (path: string) => unlink(path).catch(() => {});

/** Las fotos de los ejercicios propios, con su ruta en el móvil. */
function photosOf({ data }: BackupFile): ArchiveFile[] {
  const names = (data.customExercises ?? []).flatMap(e =>
    e.images.map(customExercisePhotoName).filter((n): n is string => n !== null),
  );
  return [...new Set(names)].map(name => ({
    name: `photos/${FOLDER}/${name}`,
    path: customExercisePhotoPath(name),
  }));
}

/**
 * Las fotos apuntan a la carpeta de la app del móvil que hizo la copia; en
 * otro móvil (u otro nombre de paquete) la carpeta es otra: se reescriben.
 */
function withLocalPhotoPaths(backup: BackupFile): BackupFile {
  if (!backup.data.customExercises) return backup;
  return {
    ...backup,
    data: {
      ...backup.data,
      customExercises: backup.data.customExercises.map(exercise => ({
        ...exercise,
        images: exercise.images.map(uri => {
          const name = customExercisePhotoName(uri);
          return name ? `file://${customExercisePhotoPath(name)}` : uri;
        }),
      })),
    },
  };
}

/**
 * Escribe la copia (zip con el JSON y las fotos) en caché y abre el "Guardar
 * como" del sistema (Drive, Descargas...). Devuelve false si se cancela.
 */
export async function exportBackupFile(): Promise<boolean> {
  const fileName = backupFileName();
  const path = `${CachesDirectoryPath}/${fileName}`;
  const backup = await createBackup();
  try {
    await writeArchive(path, JSON.stringify(backup), photosOf(backup));
    const [result] = await saveDocuments({
      sourceUris: [`file://${path}`],
      fileName,
      mimeType: 'application/zip',
    });
    if (result.error) throw new BackupError(`No se pudo guardar la copia: ${result.error}`);
    return true;
  } catch (error) {
    if (isCanceled(error)) return false;
    throw error;
  } finally {
    removeQuietly(path);
  }
}

/** Copia elegida, lista para importar. Hay que llamar a `dispose` al acabar (se importe o no). */
export interface PickedBackup {
  backup: BackupFile;
  /** Fotos que trae (0 en una copia .json antigua). */
  photoCount: number;
  /** Deja las fotos en su carpeta. Va antes de importar. */
  restorePhotos: () => Promise<void>;
  dispose: () => Promise<void>;
}

/** Abre el selector de archivos y lee la copia elegida (zip o .json antiguo); `null` si se cancela. */
export async function pickBackupFile(): Promise<PickedBackup | null> {
  let uri: string;
  let name: string | null;
  try {
    // Sin filtrar por tipo: Drive o Telegram no siempre marcan bien el .zip o el .json.
    [{ uri, name }] = await pick({ type: [types.allFiles] });
  } catch (error) {
    if (isCanceled(error)) return null;
    throw error;
  }

  const [copy] = await keepLocalCopy({
    files: [{ uri, fileName: name ?? 'copia-gymbro' }],
    destination: 'cachesDirectory',
  });
  if (copy.status === 'error') throw new BackupError('No se pudo leer el archivo elegido.');

  const path = decodeURIComponent(copy.localUri.replace(/^file:\/\//, ''));
  const dispose = () => removeQuietly(path);
  try {
    if (!(await isArchive(path))) {
      // Copia .json de antes de la 1.3.0: sin fotos.
      const backup = withLocalPhotoPaths(parseBackup(await readFile(path, 'utf8')));
      await dispose();
      return { backup, photoCount: 0, restorePhotos: async () => {}, dispose: async () => {} };
    }
    const entries = await listArchive(path);
    const backup = withLocalPhotoPaths(parseBackup(await readArchiveJson(path, entries)));
    const photos = entries.flatMap(entry => {
      const photo = photoNameIn(entry, FOLDER);
      return photo ? [{ entry, dest: customExercisePhotoPath(photo) }] : [];
    });
    return {
      backup,
      photoCount: photos.length,
      restorePhotos: () => restorePhotos(path, photos),
      dispose,
    };
  } catch (error) {
    await dispose();
    throw error instanceof BackupError
      ? error
      : new BackupError(`La copia está dañada: ${String((error as Error).message ?? error)}`);
  }
}

/** Copia las fotos del zip a su carpeta. Las que ya están en el móvil no se tocan. */
async function restorePhotos(
  path: string,
  photos: Array<{ entry: ArchiveEntry; dest: string }>,
): Promise<void> {
  await ensureCustomExercisePhotosDir();
  for (const { entry, dest } of photos) {
    if (!(await exists(dest))) await extractEntry(path, entry, dest);
  }
}
