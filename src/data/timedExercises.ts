/**
 * Ejercicios que se miden en segundos en vez de en repeticiones: planchas,
 * isometrías y paseos con carga. En ellos `reps` guarda los segundos y el rango
 * de la rutina (30-60) también es de segundos.
 *
 * Los que van con el peso del cuerpo están además en bodyweightExercises.ts
 * (el peso es el lastre); el resto se apuntan con los kilos que se llevan.
 * El cardio se queda fuera: va por minutos o distancia, no por series.
 */
export const TIMED_EXERCISES: ReadonlySet<number> = new Set([
  // --- Con el peso del cuerpo ---
  1001, // Plancha alta
  458, // Plancha de antebrazo
  1307, // Plancha frontal
  1019, // Plancha de lado derecho
  500, // Plancha inversa
  297, // Sostenimiento hueco
  718, // Asiento en pared
  1733, // Sentadilla isometrica al fallo
  1537, // Isometría en dominada
  // --- Con carga ---
  1116, // Paseo del granjero con mancuernas
  1776, // Paseo del maletín
  31, // Sostenimiento lateral isométrico
  1693, // Sostenimiento estático en banco inclinado
]);
