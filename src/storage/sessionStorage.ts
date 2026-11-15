import { canonicalExerciseId } from '../data/exerciseCatalog';
import type { WorkoutSession } from '../types/session';
import { withDb } from './db';
import { deleteSession, readSessions, stableStringify, writeSession, type Executor } from './rows';

/**
 * Lo que hay escrito en la base: firma (posición + contenido) de cada sesión
 * por id. Con ella, al guardar solo se reescriben las sesiones que han
 * cambiado y no todo el historial en cada serie. `null` = no se sabe: la
 * próxima vez se reescribe todo.
 */
let stored: Map<string, string> | null = null;

/** Las sesiones que no cambian conservan el mismo objeto: su firma se calcula una vez. */
const contentCache = new WeakMap<WorkoutSession, string>();
function signature(session: WorkoutSession, position: number): string {
  let content = contentCache.get(session);
  if (content === undefined) {
    content = stableStringify(session);
    contentCache.set(session, content);
  }
  return `${position}|${content}`;
}

const signatures = (sessions: WorkoutSession[]) =>
  new Map(sessions.map((session, position) => [session.id, signature(session, position)]));

export async function loadSessions(): Promise<WorkoutSession[]> {
  const sessions = await withDb(async db => {
    const raw = await readSessions(db);
    stored = signatures(raw);
    return raw;
  });
  // El historial de un ejercicio duplicado se junta con el del que se quedó.
  return sessions.map(session => ({
    ...session,
    sets: session.sets.map(set => ({ ...set, exerciseId: canonicalExerciseId(set.exerciseId) })),
  }));
}

export function saveSessions(sessions: WorkoutSession[]): Promise<void> {
  return withDb(async db => {
    const previous = stored;
    // Si la transacción falla, no se sabe qué hay: la próxima vez se reescribe todo.
    stored = null;
    const next = signatures(sessions);
    await db.transaction(async tx => {
      await writeChanged(tx, sessions, next, previous);
    });
    stored = next;
  });
}

async function writeChanged(
  ex: Executor,
  sessions: WorkoutSession[],
  next: Map<string, string>,
  previous: Map<string, string> | null,
): Promise<void> {
  if (previous === null) {
    await ex.execute('DELETE FROM sets');
    await ex.execute('DELETE FROM sessions');
  } else {
    for (const id of previous.keys()) {
      if (!next.has(id)) await deleteSession(ex, id);
    }
  }
  for (const [position, session] of sessions.entries()) {
    if (previous?.get(session.id) !== next.get(session.id)) {
      await writeSession(ex, session, position);
    }
  }
}

/** Para escrituras de todo el historial fuera de aquí (importar una copia): olvida lo sabido. */
export function forgetStoredSessions(): void {
  stored = null;
}
