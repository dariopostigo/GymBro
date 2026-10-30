/**
 * Ejercicios que se hacen con un lado cada vez (zancadas, búlgaras, remo a
 * una mano...). En ellos las reps se apuntan por lado y el volumen cuenta los
 * dos lados; una serie con las dos piernas sigue siendo una serie.
 */
export const UNILATERAL_EXERCISES: ReadonlySet<number> = new Set([
  // --- Bíceps ---
  1109, // Bíceps concentrado
  1717, // Codo unilateral polea alta
  1567, // Curl alterno de martillo con mancuernas
  1012, // Curl de bíceps alterno
  584, // Curl en banco Scott a un brazo
  1502, // Curl martillo cruzado con mancuernas
  // --- Cuádriceps ---
  71, // Extensión de cuádriceps a una pierna
  1948, // Sentadilla a cajón a una pierna
  989, // Sentadilla búlgara
  1706, // Sentadilla búlgara con mancuernas
  1593, // Sentadilla split en máquina Smith
  981, // Subida a peldaño
  1324, // Zancada con el peso corporal
  1366, // Zancada estática con mancuernas
  1830, // Zancada hacia atrás con barra
  1651, // Zancada hacia atrás con mancuernas
  1604, // Zancada lateral deslizante
  802, // Zancadas caminando con barra
  206, // Zancadas caminando con mancuernas
  46, // Zancadas con barra
  205, // Zancadas con mancuernas
  999, // Zancadas hacia atrás
  987, // Sentadilla lateral
  1653, // Sentadilla lateral con mancuerna
  // --- Espalda ---
  1972, // Jalón al pecho a un brazo
  1659, // Jalón al pecho a un brazo cruzado
  1470, // Jalón al pecho a un brazo de rodillas
  1486, // Remo alto en polea alternado
  81, // Remo con mancuernas
  562, // Remo escopeta
  1471, // Remo Kroc
  1701, // Remo pesado a una mano
  1621, // Remo unilateral en polea
  // --- Femoral ---
  367, // Curl femoral de pie
  1736, // Peso muerto a una pierna con mancuerna
  1388, // Peso muerto rumano a una pierna
  // --- Glúteos ---
  1234, // Empuje de cadera a una pierna con mancuerna
  1735, // Gluteo en prensa de lado con una pierna
  1740, // Puente de glúteos a una pierna
  1616, // Patada de burro con mancuerna
  1613, // Patada de glúteo con banda elástica
  1723, // Patada de glúteo en máquina
  1131, // Extensión de glúteos en polea
  1724, // Aducción de pie (polea)
  1096, // Abducción de pie
  // --- Hombros ---
  1936, // Aperturas para deltoides posterior en polea (un brazo)
  1378, // Elevaciones laterales en polea (a un brazo)
  1795, // Jalón cruzado unilateral en polea
  346, // Landmine press
  1968, // Press de hombro con mancuerna a un brazo
  1729, // Rotación externa de hombro (polea)
  578, // Rotación externa tumbado de lado
  1728, // Rotación interna de hombro (polea)
  // --- Tríceps ---
  803, // Extensión de tríceps a una mano en polea
  1668, // Extensión de tríceps sobre la cabeza a una mano en polea
  655, // Patada de tríceps con mancuernas
  1509, // Patada de tríceps en polea
]);
