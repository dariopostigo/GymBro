/**
 * Imágenes de ejercicios que wger no ilustra, tomadas de free-exercise-db
 * (https://github.com/yuhonas/free-exercise-db, licencia Unlicense / dominio
 * público) y servidas por jsDelivr, igual que las de wger ya son URLs remotas.
 *
 * Es el mismo patrón que NAME_ES en exerciseNamesEs.js: el mapa vive aquí, así
 * que sobrevive al siguiente `npm run fetch:exercises` en vez de perderse.
 * Antes de existir este fichero, las 52 primeras correspondencias estaban
 * escritas a mano dentro de exercises.json y se borraban en cada descarga.
 *
 * Clave: id de ejercicio de wger. Valor: id de free-exercise-db.
 * Para aplicarlo al catálogo ya descargado: `npm run fix:exercise-images`.
 *
 * Criterio al emparejar: la foto tiene que enseñar **el mismo movimiento**.
 * Cuando el catálogo tiene varias variantes del mismo gesto (plancha, crunch,
 * zancada...) y free-exercise-db solo ilustra el gesto base, se reutiliza esa
 * misma foto en todas: enseña de qué va el ejercicio, que es para lo que está.
 * Lo que no se hace nunca es colgar la foto de otro ejercicio distinto; para
 * eso está SIN_EQUIVALENTE más abajo.
 */

const FREE_DB_IMAGES = {
  // --- Abdominales ---
  607: 'Oblique_Crunches', // Abdominal cruzado con giro
  1476: 'Sit-Up', // Abdominal mariposa
  167: 'Crunches', // Abdominales
  1415: 'Crunches', // Abdominales con mancuerna
  171: 'Decline_Crunch', // Abdominales en Banco Inclinado
  165: 'Exercise_Ball_Crunch', // Abdominales en Bola de Estabilidad
  1412: 'Air_Bike', // Abdominales en bicicleta
  178: 'Dead_Bug', // Bicho Muerto
  1287: 'Toe_Touchers', // Crunch con alcance
  1478: 'Crunches', // Crunch de tronco superior
  1772: 'Reverse_Crunch', // Crunch inverso
  1292: 'Chin-Up', // Dominadas supinas
  283: 'Hanging_Leg_Raise', // Elevaciones de Piernas (Colgado)
  377: 'Flat_Bench_Lying_Leg_Raise', // Elevaciones de piernas tumbado
  1105: 'Seated_Leg_Tucks', // Encogimiento de rodillas sentado
  173: 'Cable_Crunch', // Encogimientos abdominales en polea
  174: 'Crunches', // Encogimientos con Piernas Elevadas
  577: 'Dumbbell_Side_Bend', // Flexión lateral del tronco con mancuerna
  145: 'Standing_Cable_Wood_Chop', // Leñadores en Polea
  1743: 'Isometric_Wipers', // Limpiaparabrisas
  1374: 'Torso_Rotation', // Máquina de giro de torso
  1776: 'Farmers_Walk', // Paseo del maletín
  235: 'Flutter_Kicks', // Patadas de Aleteo
  1766: 'Plank', // Plancha con extensión de brazo
  1489: 'Plank', // Plancha con saltos de tijera
  1406: 'Plank', // Plancha de antebrazos a manos
  1019: 'Side_Bridge', // Plancha de lado derecho
  312: 'Plank', // Plancha inclinada con toque alterno al suelo
  1288: 'Side_Bridge', // Plancha lateral dinámica
  1779: 'Landmine_180s', // Rotación con landmine
  672: 'Cable_Russian_Twists', // Rotación de tronco en polea
  1573: 'Ab_Roller', // Rueda abdominal
  545: 'Scissor_Kick', // Tijeras
  1411: 'Alternate_Heel_Touchers', // Toques de Talón

  // --- Brazos ---
  1493: 'Standing_Biceps_Cable_Curl', // Bayesian Curl
  275: 'Cable_Hammer_Curls_-_Rope_Attachment', // Bíceps concentrado martillo en polea
  1465: 'Spider_Curl', // Curl Araña
  1224: 'Drag_Curl', // Curl con arrastre con mancuernas
  91: 'Barbell_Curl', // Curl con barra
  208: 'Two-Arm_Dumbbell_Preacher_Curl', // Curl con Mancuernas en Banco Scott
  1482: 'Dumbbell_Bicep_Curl', // Curl con trampeo con mancuernas
  92: 'Dumbbell_Bicep_Curl', // Curl de bíceps con mancuerna
  95: 'Standing_Biceps_Cable_Curl', // Curl de Bíceps en Polea
  1424: 'Machine_Bicep_Curl', // Curl de bíceps sentado
  1205: 'Seated_Dumbbell_Palms-Up_Wrist_Curl', // Curl de muñeca con mancuernas
  1771: 'Cable_Wrist_Curl', // Curl de muñeca en polea
  48: 'Seated_Palms-Down_Barbell_Wrist_Curl', // Curl de Muñeca Inverso con Barra
  913: 'Reverse_Barbell_Preacher_Curls', // Curl de Predicador Inverso
  1658: 'Preacher_Curl', // Curl en banco Scott - rotación externa
  584: 'One_Arm_Dumbbell_Preacher_Curl', // Curl en banco Scott a un brazo
  1657: 'Preacher_Curl', // Curl en banco Scott con rotación interna
  914: 'Reverse_Cable_Curl', // Curl Inverso con Barra EZ en Polea
  272: 'Hammer_Curls', // Curl Martillo
  1502: 'Cross_Body_Hammer_Curl', // Curl martillo cruzado con mancuernas
  1683: 'Zottman_Curl', // Curl Zottman
  1530: 'Lying_Supine_Dumbbell_Curl', // Curls con mancuernas tumbado
  1219: 'Inverted_Row', // Dominadas australianas (remo invertido)
  1881: 'Seated_Dumbbell_Palms-Down_Wrist_Curl', // Extensión de muñeca con mancuernas
  1481: 'Triceps_Pushdown', // Extensión de tríceps con arrastre
  1485: 'Triceps_Pushdown', // Extensión de tríceps con balanceo
  1662: 'Triceps_Pushdown', // Extensión de tríceps en polea con rotación interna
  1668: 'Cable_One_Arm_Tricep_Extension', // Extensión de tríceps sobre la cabeza a una mano en polea
  1513: 'Cable_Rope_Overhead_Triceps_Extension', // Extensión de tríceps sobre la cabeza en polea
  660: 'Triceps_Pushdown_-_V-Bar_Attachment', // Extensiones de tríceps en polea con barra
  1209: 'Single-Arm_Push-Up', // Flexión a tres puntos al ancho de los hombros
  985: 'Push_Up_to_Side_Plank', // Flexiones a rotación
  1218: 'Pushups', // Flexiones de rodillas
  1372: 'Dips_-_Triceps_Version', // Fondos de tríceps asistidos
  1320: 'Bench_Dips', // Fondos de tríceps en el suelo
  197: 'Bench_Dips', // Fondos entre Bancos
  1302: 'JM_Press', // JM Press
  655: 'Tricep_Dumbbell_Kickback', // Patada de tríceps con mancuernas
  1509: 'Tricep_Dumbbell_Kickback', // Patada de tríceps en polea
  1490: 'Tricep_Dumbbell_Kickback', // Patada de tríceps tumbado
  76: 'Close-Grip_Barbell_Bench_Press', // Press de Banca con Agarre Cerrado
  1228: 'Close-Grip_Dumbbell_Press', // Press de banca con agarre cerrado con mancuernas
  598: 'Smith_Machine_Close-Grip_Bench_Press', // Press de banca con agarre cerrado en multipower
  1467: 'Close-Grip_Barbell_Bench_Press', // Press de banca inclinado con agarre cerrado
  549: 'Seated_Triceps_Press', // Press de tríceps sentado
  246: 'EZ-Bar_Skullcrusher', // Press Francés con Barra SZ
  245: 'Lying_Dumbbell_Tricep_Extension', // Press Francés con Mancuernas
  1468: 'EZ-Bar_Skullcrusher', // Press francés en el suelo
  911: 'EZ-Bar_Skullcrusher', // Press francés inclinado
  1824: 'Tate_Press', // Tate press con mancuernas
  661: 'Machine_Triceps_Extension', // Tríceps en máquina

  // --- Cardio ---
  1104: 'Walking_Treadmill', // Caminar
  530: 'Running_Treadmill', // Correr en cinta
  1449: 'Stairmaster', // Escaladora
  962: 'Elliptical_Trainer', // La Elíptica
  1525: 'Overhead_Slam', // Lanzamientos de balón
  1093: 'Rowing_Stationary', // Máquina de remo
  595: 'Rope_Jumping', // Saltar a la comba – estándar
  1373: 'Front_Box_Jump', // Saltos al cajón

  // --- Espalda ---
  1380: 'Band_Pull_Apart', // Aperturas con banda elástica
  1473: 'Cable_Rear_Delt_Fly', // Aperturas inversas en polea
  1294: 'Standing_Leg_Curl', // Curl femoral a una pierna
  365: 'Lying_Leg_Curls', // Curl de piernas (tumbado)
  367: 'Standing_Leg_Curl', // Curl femoral de pie
  366: 'Seated_Leg_Curl', // Curl femoral sentado
  1929: 'Band_Assisted_Pull-Up', // Dominada asistida
  475: 'Pullups', // Dominadas
  1695: 'Wide-Grip_Rear_Pull-Up', // Dominadas (agarre ancho)
  1696: 'V-Bar_Pullup', // Dominadas (agarre neutro)
  152: 'Chin-Up', // Dominadas con Agarre Supino
  1737: 'Chin-Up', // Dominadas supinas asistidas
  922: 'Cable_Shrugs', // Encogimiento en polea para trapecio medio
  301: 'Hyperextensions_Back_Extensions', // Hiperextensiones
  1537: 'Pullups', // Isometría en dominada
  355: 'Wide-Grip_Lat_Pulldown', // Jalón al pecho
  354: 'Wide-Grip_Lat_Pulldown', // Jalón al pecho (inclinado)
  1972: 'One_Arm_Lat_Pulldown', // Jalón al pecho a un brazo
  1659: 'One_Arm_Lat_Pulldown', // Jalón al pecho a un brazo cruzado
  1470: 'Kneeling_Single-Arm_High_Pulley_Row', // Jalón al pecho a un brazo de rodillas
  1927: 'Underhand_Cable_Pulldowns', // Jalón al pecho con agarre supino
  695: 'V-Bar_Pulldown', // Jalón con barra en V
  1727: 'Straight-Arm_Pulldown', // Jalón lateral con brazo recto (polea)
  1435: 'Scapular_Pull-Up', // Jalones escapulares
  1433: 'Standing_Cable_Wood_Chop', // Leñador inverso
  484: 'Rack_Pulls', // Peso muerto en rack
  1384: 'Straight-Arm_Dumbbell_Pullover', // Pullover en máquina
  1492: 'Leverage_High_Row', // Remo alto
  1718: 'Elevated_Cable_Rows', // Remo alto desde polea
  81: 'One-Arm_Dumbbell_Row', // Remo con mancuernas
  310: 'Dumbbell_Incline_Row', // Remo con mancuernas en banco inclinado
  394: 'Seated_Cable_Rows', // Remo con polea
  919: 'T-Bar_Row_with_Handle', // Remo en T
  395: 'Seated_Cable_Rows', // Remo en polea baja, agarre estrecho
  562: 'Shotgun_Row', // Remo escopeta
  1501: 'Alternating_Kettlebell_Row', // Remo gorila alternativo con mancuernas
  1303: 'Dumbbell_Incline_Row', // Remo Helms
  84: 'Reverse_Grip_Bent-Over_Rows', // Remo inclinado con agarre invertido
  83: 'Bent_Over_Barbell_Row', // Remo Inclinado con Barra (agarre prono)
  1082: 'Bent_Over_Two-Dumbbell_Row', // Remo inclinado con rotación externa
  1471: 'One-Arm_Dumbbell_Row', // Remo Kroc
  1304: 'Bent_Over_One-Arm_Long_Bar_Row', // Remo Meadows
  448: 'Bent_Over_Barbell_Row', // Remo Pendlay
  490: 'Alternating_Renegade_Row', // Remo renegado
  1928: 'Seated_Cable_Rows', // Remo sentado con agarre en V
  636: 'Superman', // Superman

  // --- Gemelos ---
  148: 'Smith_Machine_Calf_Raise', // Elevación de Pantorrillas en Hack
  590: 'Seated_Calf_Raise', // Elevación de talón sentados

  // --- Hombros ---
  1826: 'External_Rotation_with_Band', // Apertura con banda y rotación externa
  822: 'Cable_Rear_Delt_Fly', // Aperturas Posteriores en Polea
  1936: 'Cable_Rear_Delt_Fly', // Aperturas para deltoides posterior en polea (un brazo)
  406: 'External_Rotation', // Ejercicio del manguito rotador tumbado
  1879: 'Front_Incline_Dumbbell_Raise', // Elevación en Y con mancuernas en banco inclinado
  1731: 'Front_Cable_Raise', // Elevación frontal en polea
  917: 'Front_Cable_Raise', // Elevación frontal en polea con barra Z
  348: 'Side_Lateral_Raise', // Elevación lateral con mancuernas
  918: 'Seated_Side_Lateral_Raise', // Elevación lateral sentado con mancuernas
  254: 'Front_Plate_Raise', // Elevaciones Frontales con Disco
  256: 'Front_Dumbbell_Raise', // Elevaciones frontales
  1754: 'Side_Lateral_Raise', // Elevaciones laterales a 45°
  1378: 'One-Arm_Side_Laterals', // Elevaciones laterales en polea (a un brazo)
  570: 'Dumbbell_Shrug', // Encogimiento de hombros
  1472: 'Cable_Shrugs', // Encogimiento en polea
  571: 'Barbell_Shrug', // Encogimientos de hombros con barra
  1774: 'Bench_Dips', // Fondos en silla
  222: 'Face_Pull', // Jalón a la Cara
  346: 'Landmine_Linear_Jammer', // Landmine press
  1709: 'Cable_Rear_Delt_Fly', // Pájaro de pie
  139: 'Reverse_Machine_Flyes', // Pec-Deck Inverso
  20: 'Arnold_Dumbbell_Press', // Press Arnold
  543: 'Machine_Shoulder_Military_Press', // Press de hombro con maquina
  566: 'Seated_Barbell_Military_Press', // Press de hombros con barra
  193: 'Dumbbell_Shoulder_Press', // Press Diagonal para Hombros
  1439: 'Barbell_Shoulder_Press', // Press militar desde pines
  1441: 'Seated_Dumbbell_Press', // Press militar en banco inclinado con mancuernas
  567: 'Seated_Dumbbell_Press', // Press Militar mancuerna
  691: 'Smith_Machine_Upright_Row', // Remo al mentón en multipower
  1729: 'External_Rotation_with_Cable', // Rotación externa de hombro (polea)
  1715: 'External_Rotation', // Rotación externa de hombro con mancuerna
  578: 'External_Rotation', // Rotación externa tumbado de lado
  1728: 'Cable_Internal_Rotation', // Rotación interna de hombro (polea)
  1602: 'Dumbbell_Scaption', // Scaption con mancuernas
  289: 'Upright_Barbell_Row', // Tirón alto

  // --- Pecho ---
  238: 'Dumbbell_Flyes', // Aperturas con Mancuernas
  239: 'Decline_Dumbbell_Flyes', // Aperturas con Mancuernas Declinadas
  308: 'Incline_Dumbbell_Flyes', // Aperturas con mancuernas en banco inclinado
  135: 'Butterfly', // Aperturas en máquina
  323: 'Low_Cable_Crossover', // Aperturas en polea
  1270: 'Low_Cable_Crossover', // Aperturas en polea baja
  1469: 'Incline_Cable_Flye', // Aperturas en polea inclinado
  1691: 'Cable_Crossover', // Aperturas en polea para el pecho inferior
  1689: 'Cable_Crossover', // Aperturas en polea para el pecho medio
  1690: 'Low_Cable_Crossover', // Aperturas en polea para el pecho superior
  237: 'Cable_Crossover', // Cruce de Poleas para Pecho
  1554: 'Plyo_Push-up', // Flexión con palmada
  1964: 'Push-Up_Wide', // Flexión con manos abiertas
  1777: 'Pushups', // Flexiones con déficit
  801: 'Close-Grip_Push-Up_off_of_a_Dumbbell', // Flexiones con mancuernas
  583: 'Pushups', // Flexiones de lado a lado
  386: 'Push-Ups_-_Close_Triceps_Position', // Flexiones diamante
  1111: 'Incline_Push-Up', // Flexiones inclinadas
  194: 'Parallel_Bar_Dip', // Fondos en Paralelas
  1546: 'Barbell_Bench_Press_-_Medium_Grip', // Larsen Press
  137: 'Butterfly', // Pectoral en Máquina
  1001: 'Plank', // Plancha Alta
  73: 'Barbell_Bench_Press_-_Medium_Grip', // Press de Banca
  498: 'Reverse_Triceps_Bench_Press', // Press de banca con agarre supino
  185: 'Decline_Barbell_Bench_Press', // Press de Banca Declinado con Barra
  1497: 'Dumbbell_Bench_Press', // Press de banca supino con mancuernas
  1461: 'Dumbbell_Bench_Press', // Press de pecho con mancuernas sin impulso de piernas
  1656: 'Cable_Chest_Press', // Press de pecho en polea - declinado
  1660: 'Incline_Cable_Chest_Press', // Press de pecho en polea inclinado
  1457: 'Standing_Cable_Chest_Press', // Press envolvente en polea
  1508: 'Smith_Machine_Incline_Bench_Press', // Press muy inclinado en máquina Smith
  1496: 'Incline_Dumbbell_Press', // Variación con mancuerna para el pecho superior

  // --- Piernas ---
  1724: 'Cable_Hip_Adduction', // Aducción de pie (polea)
  1392: 'Good_Morning', // Buenos días con barra
  1234: 'Barbell_Hip_Thrust', // Empuje de cadera a una pierna con mancuerna
  294: 'Barbell_Hip_Thrust', // Empuje de cadera con barra
  1751: 'Pull_Through', // Empuje de cadera en polea
  1132: 'Glute_Kickback', // Extensión de glúteo en máquina
  1809: 'Reverse_Hyperextension', // Hiperextensión inversa
  1116: 'Farmers_Walk', // Paseo del granjero con mancuernas
  1723: 'One-Legged_Cable_Kickback', // Patada de glúteo en máquina
  1370: 'Stiff-Legged_Dumbbell_Deadlift', // Peso muerto con mancuernas
  627: 'Stiff-Legged_Barbell_Deadlift', // Peso muerto con piernas rígidas
  1688: 'Romanian_Deadlift', // Peso muerto rumano en apoyo
  1410: 'Plank', // Plancha con elevación de pierna
  374: 'Leg_Press', // Press de piernas abierto
  265: 'Butt_Lift_Bridge', // Puente de glúteos
  1740: 'Single_Leg_Glute_Bridge', // Puente de glúteos a una pierna
  614: 'Freehand_Jump_Squat', // Salto en sentadilla con apertura
  1948: 'Single-Leg_High_Box_Squat', // Sentadilla a cajón a una pierna
  397: 'Box_Squat', // Sentadilla a cajón bajo con apertura amplia
  1803: 'Trap_Bar_Deadlift', // Sentadilla con barra hexagonal
  124: 'Goblet_Squat', // Sentadilla con Disco al Frente
  1312: 'Bodyweight_Squat', // Sentadilla con peso corporal
  987: 'Split_Squats', // Sentadilla de lado derecho
  1208: 'Bodyweight_Squat', // Sentadilla del prisionero
  257: 'Front_Barbell_Squat', // Sentadilla Frontal
  43: 'Barbell_Hack_Squat', // Sentadilla Hack con Barra
  1464: 'Hack_Squat', // Sentadilla hack con pausa
  1414: 'Hack_Squat', // Sentadillas Hack
  632: 'Plie_Dumbbell_Squat', // Sentadillas sumo
  981: 'Step-up_with_Knee_Raise', // Subida a peldaño
  1366: 'Split_Squat_with_Dumbbells', // Zancada estática con mancuernas
  802: 'Barbell_Walking_Lunge', // Zancadas Caminando con Barra
  206: 'Dumbbell_Lunges', // Zancadas Caminando con Mancuernas
  46: 'Barbell_Lunge', // Zancadas con Barra
  205: 'Dumbbell_Lunges', // Zancadas con Mancuernas
};

/**
 * Ejercicios repasados uno a uno para los que free-exercise-db **no** tiene
 * nada equivalente. Están aquí para no repetir la búsqueda cada vez y para que
 * `fix:exercise-images` pueda avisar de los que entren nuevos en el catálogo
 * (esos sí hay que mirarlos). Se quedan sin foto a propósito.
 */
const SIN_EQUIVALENTE = [
  // Abdominales
  1823, // Almeja
  1909, // Círculos con las piernas
  505, // Crunch en silla romana
  1426, // Crunch lateral de pie
  1474, // Elevación en W
  500, // Plancha inversa
  1827, // Presión abdominal con ambas piernas
  1912, // Rotación de core
  1966, // Rotación torácica en media rodilla
  1477, // Sacacorchos sentado
  1425, // Toques de pie alternados
  // Brazos
  1717, // Codo unilateral polea alta
  1666, // Curl con el hombro elevado
  1483, // Curl de bíceps triple
  1512, // Curl descendente
  1511, // Curl Kong
  // Cardio
  1526, // Máquina de esquí
  1314, // Saltos de tijera
  // Espalda
  1215, // Ángel de nieve invertido
  1487, // Combinación hiperextensión Y-W
  1458, // Elevación en Y cruzada en polea
  1834, // Elevación Trap-3
  1083, // Elevaciones Y-W-T
  1486, // Remo alto en polea alternado
  1877, // Retracción escapular con banda
  468, // Retracción escapular en prono – brazos en cruz
  // Gemelos
  1200, // Elevación tibial anterior
  // Hombros
  1795, // Jalón cruzado unilateral en polea
  1755, // Jalón en Y en polea
  1429, // Rotaciones de hombro con mancuerna
  // Pecho
  1716, // Flexión escapular en banco inclinado
  1693, // Sostenimiento estático en banco inclinado
  // Piernas
  1202, // Abducción de cadera en decúbito lateral
  1886, // Abducción de cadera en supino
  2449, // Almeja a almeja inversa
  1842, // Almeja con banda
  2448, // Almeja inversa
  718, // Asiento en pared
  1829, // Sentadilla con barra landmine y press
  1527, // Sentadilla péndulo
];

module.exports = { FREE_DB_IMAGES, SIN_EQUIVALENTE };
