/**
 * Nombres de ejercicio corregidos al español.
 *
 * wger devuelve muchos nombres sin traducir (o a medias): "T-Bar row",
 * "Hip thrust con barra", "Talons fesses"... Como la traducción no se puede
 * arreglar en origen, se sobreescribe aquí por id, igual que ya se hace con
 * CATEGORY_ES / MUSCLE_ES / EQUIPMENT_ES en fetch-exercises.js.
 *
 * Al vivir aquí, los nombres sobreviven al siguiente `npm run fetch:exercises`.
 * Para aplicarlos al JSON ya descargado sin volver a bajar el catálogo:
 * `npm run fix:exercise-names`.
 */

const NAME_ES = {
  // --- Nombre íntegramente en inglés (o francés) ---
  // Abdominales
  1572: 'Perro-pájaro',
  297: 'Sostenimiento hueco',
  1489: 'Plancha con saltos de tijera',
  1406: 'Plancha de antebrazos a manos',
  1287: 'Crunch con alcance',
  500: 'Plancha inversa',
  1292: 'Dominadas supinas',
  1105: 'Encogimiento de rodillas sentado',
  1776: 'Paseo del maletín',
  672: 'Rotación de tronco en polea',
  1474: 'Elevación en W',
  // Espalda
  919: 'Remo en T',
  1737: 'Dominadas supinas asistidas',
  1458: 'Elevación en Y cruzada en polea',
  1492: 'Remo alto',
  1138: 'Jalón tumbado en banco inclinado',
  1471: 'Remo Kroc',
  1537: 'Isometría en dominada',
  1473: 'Aperturas inversas en polea',
  1435: 'Jalones escapulares',
  922: 'Encogimiento en polea para trapecio medio',
  1098: 'Elevación de deltoides posterior sentado',
  562: 'Remo escopeta',
  695: 'Jalón con barra en V',
  1083: 'Elevaciones Y-W-T',
  // Piernas
  1312: 'Sentadilla con peso corporal',
  1751: 'Empuje de cadera en polea',
  1370: 'Peso muerto con mancuernas',
  1116: 'Paseo del granjero con mancuernas',
  1723: 'Patada de glúteo en máquina',
  1392: 'Buenos días con barra',
  1688: 'Peso muerto rumano en apoyo',
  1527: 'Sentadilla péndulo',
  614: 'Salto en sentadilla con apertura',
  627: 'Peso muerto con piernas rígidas',
  1100: 'Lanzamientos de balón a pared',
  // Hombros
  1472: 'Encogimiento en polea',
  1731: 'Elevación frontal en polea',
  289: 'Tirón alto',
  1439: 'Press militar desde pines',
  1755: 'Jalón en Y en polea',
  // Pecho
  1469: 'Aperturas en polea inclinado',
  1777: 'Flexiones con déficit',
  1551: 'Flexiones',
  // Brazos
  1481: 'Extensión de tríceps con arrastre',
  911: 'Press francés inclinado',
  // Cardio
  1373: 'Saltos al cajón',
  1314: 'Saltos de tijera',
  1093: 'Máquina de remo',
  1962: 'Apertura de piernas con paso',
  1285: 'Talones al glúteo',
  1104: 'Caminar',

  // --- Mezcla de español e inglés ---
  1467: 'Press de banca inclinado con agarre cerrado',
  1508: 'Press muy inclinado en máquina Smith',
  1470: 'Jalón al pecho a un brazo de rodillas',
  918: 'Elevación lateral sentado con mancuernas',
  1502: 'Curl martillo cruzado con mancuernas',
  1497: 'Press de banca supino con mancuernas',
  498: 'Press de banca con agarre supino',
  1366: 'Zancada estática con mancuernas',
  1740: 'Puente de glúteos a una pierna',
  1294: 'Curl femoral a una pierna',
  1374: 'Máquina de giro de torso',
  1372: 'Fondos de tríceps asistidos',
  1384: 'Pullover en máquina',
  1457: 'Press envolvente en polea',
  367: 'Curl femoral de pie',
  1485: 'Extensión de tríceps con balanceo',
  1512: 'Curl descendente',
  1511: 'Curl Kong',
  1483: 'Curl de bíceps triple',
  1224: 'Curl con arrastre con mancuernas',
  1639: 'Jalón a la cara inclinado con mancuernas',
  1732: 'Jalones a la cara con banda',
  294: 'Empuje de cadera con barra',
  1464: 'Sentadilla hack con pausa',
  397: 'Sentadilla a cajón bajo con apertura amplia',
  616: 'Burpee',
  1700: 'Peso muerto rumano con barra',
  1823: 'Almeja',
  1111: 'Flexiones inclinadas',
  1112: 'Flexiones declinadas',
  1716: 'Flexión escapular en banco inclinado',
  1137: 'Pullover en polea alta',
  1754: 'Elevaciones laterales a 45°',
  275: 'Bíceps concentrado martillo en polea',
  917: 'Elevación frontal en polea con barra Z',
  41: 'Rueda abdominal con barra',
  607: 'Abdominal cruzado con giro',
  1320: 'Fondos de tríceps en el suelo',

  // --- Español, pero traducción automática o incoherente con el resto ---
  655: 'Patada de tríceps con mancuernas',
  999: 'Zancadas hacia atrás',
  1482: 'Curl con trampeo con mancuernas',
  1478: 'Crunch de tronco superior',
};

module.exports = { NAME_ES };
