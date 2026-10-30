/**
 * Ejercicios con el propio peso del cuerpo (dominadas, fondos, flexiones...).
 * En ellos el peso que se apunta es el lastre (un cinturón, un disco a la
 * espalda...): 0 es lo normal y se muestra como "PC" (peso corporal).
 *
 * Las planchas y demás isometrías también están, y además se miden en tiempo
 * (ver timedExercises.ts). Fuera quedan el cardio y los asistidos (en esos el
 * peso de la máquina resta).
 */
export const BODYWEIGHT_EXERCISES: ReadonlySet<number> = new Set([
  // --- Abdominales ---
  1479, // Abdominal con golpe de codo
  1476, // Abdominal mariposa
  1412, // Abdominales en bicicleta
  1909, // Círculos con las piernas
  1287, // Crunch con alcance
  1772, // Crunch inverso
  1426, // Crunch lateral de pie
  90023, // Elevación de rodillas en paralelas (silla del capitán)
  1474, // Elevación en W
  283, // Elevaciones de piernas (colgado)
  979, // Elevaciones de piernas en barra
  978, // Elevaciones de rodillas en barra
  1105, // Encogimiento de rodillas sentado
  1377, // Giro de torso
  1743, // Limpiaparabrisas
  1572, // Perro-pájaro
  1827, // Presión abdominal con ambas piernas
  1103, // Puente caminante
  1573, // Rueda abdominal
  1477, // Sacacorchos sentado
  1425, // Toques de pie alternados
  1411, // Toques de talón
  1001, // Plancha alta
  458, // Plancha de antebrazo
  1307, // Plancha frontal
  1019, // Plancha de lado derecho
  500, // Plancha inversa
  297, // Sostenimiento hueco
  // --- Cuádriceps ---
  616, // Burpee
  1948, // Sentadilla a cajón a una pierna
  989, // Sentadilla búlgara
  1312, // Sentadilla con peso corporal
  1208, // Sentadilla del prisionero
  987, // Sentadilla lateral
  1963, // Sentadilla lenta
  632, // Sentadillas sumo
  1324, // Zancada con el peso corporal
  718, // Asiento en pared
  1733, // Sentadilla isometrica al fallo
  999, // Zancadas hacia atrás
  // --- Espalda ---
  1215, // Ángel de nieve invertido
  475, // Dominadas
  1695, // Dominadas (agarre ancho)
  1696, // Dominadas (agarre neutro)
  1219, // Dominadas australianas (remo invertido)
  152, // Dominadas con agarre supino
  90018, // Dominadas lastradas
  1537, // Isometría en dominada
  1435, // Jalones escapulares
  301, // Hiperextensiones
  1487, // Combinación hiperextensión Y-W
  // --- Femoral ---
  90011, // Curl nórdico
  1387, // Patadas de isquiotibiales
  1388, // Peso muerto rumano a una pierna
  // --- Gemelos ---
  1243, // Elevación de talones a dos piernas
  1200, // Elevación tibial anterior
  // --- Glúteos ---
  1202, // Abducción de cadera en decúbito lateral
  1096, // Abducción de pie
  2449, // Almeja a almeja inversa
  2448, // Almeja inversa
  265, // Puente de glúteos
  1740, // Puente de glúteos a una pierna
  1809, // Hiperextensión inversa
  // --- Hombros ---
  454, // Flexiones de pica
  // --- Pecho ---
  1964, // Flexión con manos abiertas
  1554, // Flexión con palmada
  1551, // Flexiones
  1086, // Flexiones con agarre estrecho
  1777, // Flexiones con déficit
  1902, // Flexiones con peso
  1218, // Flexiones de rodillas
  1112, // Flexiones declinadas
  386, // Flexiones diamante
  1111, // Flexiones inclinadas
  583, // Flexiones de lado a lado
  194, // Fondos en paralelas
  // --- Tríceps ---
  1209, // Flexión a tres puntos al ancho de los hombros
  985, // Flexiones a rotación
  1000, // Fondos
  1320, // Fondos de tríceps en el suelo
  1774, // Fondos en silla
  197, // Fondos entre Bancos
  112, // Plancha a flexión
]);
