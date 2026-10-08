import { CachesDirectoryPath, readFile, unlink, writeFile } from '@dr.pogodin/react-native-fs';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  saveDocuments,
  types,
} from '@react-native-documents/picker';
import { BackupError, backupFileName, createBackup, parseBackup, type BackupFile } from './backup';

const isCanceled = (error: unknown) =>
  isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED;

const removeQuietly = (path: string) => unlink(path).catch(() => {});

/**
 * Escribe la copia en caché y abre el "Guardar como" del sistema (Drive, Descargas...).
 * Devuelve false si se cancela.
 */
export async function exportBackupFile(): Promise<boolean> {
  const fileName = backupFileName();
  const path = `${CachesDirectoryPath}/${fileName}`;
  await writeFile(path, JSON.stringify(await createBackup()), 'utf8');
  try {
    const [result] = await saveDocuments({
      sourceUris: [`file://${path}`],
      fileName,
      mimeType: 'application/json',
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

/** Abre el selector de archivos y lee la copia elegida; `null` si se cancela. */
export async function pickBackupFile(): Promise<BackupFile | null> {
  let uri: string;
  let name: string | null;
  try {
    // Sin filtrar por tipo: Drive o Telegram no siempre marcan el .json como JSON.
    [{ uri, name }] = await pick({ type: [types.allFiles] });
  } catch (error) {
    if (isCanceled(error)) return null;
    throw error;
  }

  const [copy] = await keepLocalCopy({
    files: [{ uri, fileName: name ?? 'copia-gymbro.json' }],
    destination: 'cachesDirectory',
  });
  if (copy.status === 'error') throw new BackupError('No se pudo leer el archivo elegido.');

  const path = decodeURIComponent(copy.localUri.replace(/^file:\/\//, ''));
  try {
    return parseBackup(await readFile(path, 'utf8'));
  } finally {
    removeQuietly(path);
  }
}
