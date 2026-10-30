import type { WeightStack } from '../utils/weightStack';

/**
 * Pesos por defecto de las máquinas de placas y las poleas, para que la
 * sugerencia de subir peso y los botones − / + de Hoy funcionen sin
 * configurar nada. Son los de una máquina típica, no los de un gimnasio en
 * concreto: lo que se guarde a mano en la ficha del ejercicio manda sobre esto.
 *
 * Las máquinas de discos, la Smith y la prensa de 45° no están: se cargan con
 * discos, no tienen pila de pesos.
 */
const POLEA: WeightStack = { kind: 'steps', start: 2.5, step: 2.5, max: 90 };
const MAQUINA: WeightStack = { kind: 'steps', start: 5, step: 5, max: 100 };
const MAQUINA_PIERNA: WeightStack = { kind: 'steps', start: 5, step: 5, max: 150 };
const PRENSA: WeightStack = { kind: 'steps', start: 10, step: 10, max: 250 };

export const DEFAULT_WEIGHT_STACKS: Record<number, WeightStack> = {
  // --- Poleas ---
  173: POLEA, // Encogimientos abdominales en polea
  145: POLEA, // Leñadores en Polea
  672: POLEA, // Rotación de tronco en polea
  1771: POLEA, // Curl de muñeca en polea
  1717: POLEA, // Codo unilateral polea alta
  1493: POLEA, // Curl bayesiano en polea
  95: POLEA, // Curl de bíceps en polea
  90032: POLEA, // Curl en banco Scott en polea
  912: POLEA, // Curl en polea con barra recta
  914: POLEA, // Curl Inverso con Barra EZ en Polea
  90021: POLEA, // Curl martillo en polea con cuerda
  1458: POLEA, // Elevación en Y cruzada en polea
  922: POLEA, // Encogimiento en polea para trapecio medio
  355: POLEA, // Jalón al pecho
  354: POLEA, // Jalón al pecho (inclinado)
  1972: POLEA, // Jalón al pecho a un brazo
  1659: POLEA, // Jalón al pecho a un brazo cruzado
  1470: POLEA, // Jalón al pecho a un brazo de rodillas
  158: POLEA, // Jalón al pecho con agarre cerrado
  1136: POLEA, // Jalón al pecho con agarre neutro
  1927: POLEA, // Jalón al pecho con agarre supino
  723: POLEA, // Jalón con agarre ancho
  695: POLEA, // Jalón con barra en V
  628: POLEA, // Jalón con brazos rectos (agarre de barra)
  629: POLEA, // Jalón con brazos rectos (agarre de cuerda)
  1727: POLEA, // Jalón lateral con brazo recto (polea)
  1138: POLEA, // Jalón tumbado en banco inclinado
  1137: POLEA, // Pullover en polea alta
  1718: POLEA, // Remo alto desde polea
  1486: POLEA, // Remo alto en polea alternado
  394: POLEA, // Remo con polea
  395: POLEA, // Remo en polea baja, agarre estrecho
  1621: POLEA, // Remo unilateral en polea
  1724: POLEA, // Aducción de pie (polea)
  1751: POLEA, // Empuje de cadera en polea
  1131: POLEA, // Extensión de glúteos en polea
  1473: POLEA, // Aperturas inversas en polea
  1936: POLEA, // Aperturas para deltoides posterior en polea (un brazo)
  822: POLEA, // Aperturas posteriores en polea
  1731: POLEA, // Elevación frontal en polea
  917: POLEA, // Elevación frontal en polea con barra Z
  1378: POLEA, // Elevaciones laterales en polea (a un brazo)
  1472: POLEA, // Encogimiento en polea
  222: POLEA, // Jalón a la cara (face pull)
  1795: POLEA, // Jalón cruzado unilateral en polea
  1755: POLEA, // Jalón en Y en polea
  90030: POLEA, // Press de hombros en polea
  90031: POLEA, // Remo al mentón en polea
  1729: POLEA, // Rotación externa de hombro (polea)
  1728: POLEA, // Rotación interna de hombro (polea)
  1922: POLEA, // Aperturas de pecho en polea sentado
  323: POLEA, // Aperturas en polea
  1270: POLEA, // Aperturas en polea baja
  1469: POLEA, // Aperturas en polea inclinado
  1691: POLEA, // Aperturas en polea para el pecho inferior
  1689: POLEA, // Aperturas en polea para el pecho medio
  1690: POLEA, // Aperturas en polea para el pecho superior
  1296: POLEA, // Cruce de poleas bajas
  237: POLEA, // Cruce de poleas para pecho
  1656: POLEA, // Press de pecho en polea - declinado
  90006: POLEA, // Press de pecho en polea de pie
  1660: POLEA, // Press de pecho en polea inclinado
  1457: POLEA, // Press envolvente en polea
  803: POLEA, // Extensión de tríceps a una mano en polea
  1298: POLEA, // Extensión de tríceps cruzada en polea alta
  90033: POLEA, // Extensión de tríceps en polea con agarre supino
  1185: POLEA, // Extensión de tríceps en polea con cuerda
  1662: POLEA, // Extensión de tríceps en polea con rotación interna
  1668: POLEA, // Extensión de tríceps sobre la cabeza a una mano en polea
  1513: POLEA, // Extensión de tríceps sobre la cabeza en polea
  660: POLEA, // Extensiones de tríceps en polea con barra
  1509: POLEA, // Patada de tríceps en polea
  // --- Máquinas de placas (tren superior, abdominales, glúteo, abductores) ---
  172: MAQUINA, // Abdominales en máquina
  1374: MAQUINA, // Máquina de giro de torso
  90020: MAQUINA, // Curl de bíceps en máquina
  90035: MAQUINA, // Remo alto en máquina de placas
  508: MAQUINA, // Remo en máquina agarre abierto
  1119: MAQUINA, // Remo en máquina agarre estrecho
  1120: MAQUINA, // Remo en máquina agarre estrecho supino
  1725: MAQUINA, // Remo sentado en máquina de placas
  139: MAQUINA, // Contractora inversa (pec deck)
  1744: MAQUINA, // Elevación lateral en máquina
  543: MAQUINA, // Press de hombros en máquina de placas
  926: MAQUINA, // Aperturas en máquina (contractora)
  90028: MAQUINA, // Press de pecho en máquina de placas
  90036: MAQUINA, // Press inclinado en máquina de placas
  90022: MAQUINA, // Fondos en máquina
  661: MAQUINA, // Tríceps en máquina
  1748: MAQUINA, // Abducción en máquina
  12: MAQUINA, // Aducción de cadera en máquina
  1132: MAQUINA, // Extensión de glúteo en máquina
  1723: MAQUINA, // Patada de glúteo en máquina
  // --- Máquinas de pierna: cuádriceps, femoral y gemelos ---
  369: MAQUINA_PIERNA, // Extensión de cuádriceps en máquina
  71: MAQUINA_PIERNA, // Extensión de cuádriceps a una pierna
  364: MAQUINA_PIERNA, // Curl femoral
  365: MAQUINA_PIERNA, // Curl de piernas (tumbado)
  366: MAQUINA_PIERNA, // Curl femoral sentado
  367: MAQUINA_PIERNA, // Curl femoral de pie
  1294: MAQUINA_PIERNA, // Curl femoral a una pierna
  622: MAQUINA_PIERNA, // Elevación de gemelos de pie en máquina
  590: MAQUINA_PIERNA, // Elevación de gemelos sentado en máquina
  // --- Prensa horizontal de placas ---
  90037: PRENSA, // Prensa de piernas horizontal
};
