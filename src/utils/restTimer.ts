/**
 * Cálculos del temporizador de descanso. Se guarda la hora de fin y no un contador:
 * así la cuenta atrás no se desfasa al cambiar de pestaña o dejar la app un rato.
 */
export interface RestTimer {
  /** Momento (ms desde epoch) en que termina el descanso. */
  endsAt: number;
  /** Duración total en segundos, para pintar el progreso. */
  duration: number;
}

export const REST_PRESETS = [60, 90, 120, 180];
export const REST_STEP = 15;
export const MIN_REST = 15;
export const MAX_REST = 600;

export function clampRestSeconds(seconds: number): number {
  return Math.min(Math.max(Math.round(seconds), MIN_REST), MAX_REST);
}

export function startRest(seconds: number, now: number): RestTimer {
  const duration = clampRestSeconds(seconds);
  return { endsAt: now + duration * 1000, duration };
}

export function remainingMs(timer: RestTimer, now: number): number {
  return Math.max(0, timer.endsAt - now);
}

/** Fracción de descanso ya consumida, de 0 a 1. */
export function restProgress(timer: RestTimer, now: number): number {
  return 1 - remainingMs(timer, now) / (timer.duration * 1000);
}

/** Suma o resta segundos al descanso en curso; `null` si con eso ya no queda tiempo. */
export function adjustRest(timer: RestTimer, deltaSeconds: number, now: number): RestTimer | null {
  const endsAt = timer.endsAt + deltaSeconds * 1000;
  if (endsAt <= now) return null;
  return { endsAt, duration: Math.max(timer.duration + deltaSeconds, 1) };
}

/** "1:05", redondeando hacia arriba para que el 0:00 coincida con el final. */
export function formatRest(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
