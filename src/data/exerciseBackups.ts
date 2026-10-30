/**
 * Plan B por defecto de cada ejercicio del catálogo: lo que se hace si la
 * máquina (o la barra, el banco...) está ocupada. Mismo movimiento con otro
 * equipamiento siempre que existe: placas <-> discos, barra <-> mancuernas,
 * dominadas <-> jalón...
 *
 * Se usa cuando el hueco del día no tiene un plan B elegido a mano; el elegido
 * en el editor del día manda sobre este.
 *
 * Clave: id del ejercicio. Valor: id de su plan B. Los ids fusionados se
 * resuelven al consultarlo (ver defaultBackupId en exerciseCatalog.ts).
 */
export const DEFAULT_BACKUPS: Record<number, number> = {
  // --- Abdominales ---
  1479: 145, // Abdominal con golpe de codo → Leñadores en Polea
  607: 145, // Abdominal cruzado con giro → Leñadores en Polea
  1476: 145, // Abdominal mariposa → Leñadores en Polea
  1415: 1648, // Abdominales con mancuerna → Crunch con peso
  171: 172, // Abdominales en banco inclinado → Abdominales en máquina
  1412: 172, // Abdominales en bicicleta → Abdominales en máquina
  165: 172, // Abdominales en bola de estabilidad → Abdominales en máquina
  172: 173, // Abdominales en máquina → Encogimientos abdominales en polea
  976: 172, // Abdominales en V con balón medicinal → Abdominales en máquina
  1193: 145, // Abdominales rusas → Leñadores en Polea
  1823: 1842, // Almeja → Almeja con banda
  178: 1572, // Bicho muerto → Perro-pájaro
  1909: 172, // Círculos con las piernas → Abdominales en máquina
  1933: 172, // Crunch abdominal → Abdominales en máquina
  1287: 145, // Crunch con alcance → Leñadores en Polea
  1648: 145, // Crunch con peso → Leñadores en Polea
  505: 172, // Crunch en silla romana → Abdominales en máquina
  1772: 172, // Crunch inverso → Abdominales en máquina
  1426: 145, // Crunch lateral de pie → Leñadores en Polea
  427: 172, // Crunches negativos → Abdominales en máquina
  1889: 377, // Elevación de piernas en banco declinado → Elevaciones de piernas tumbado
  90023: 283, // Elevación de rodillas en paralelas (silla del capitán) → Elevaciones de piernas (colgado)
  1474: 145, // Elevación en W → Leñadores en Polea
  283: 90023, // Elevaciones de piernas (colgado) → Elevación de rodillas en paralelas (silla del capitán)
  378: 377, // Elevaciones de piernas de pie → Elevaciones de piernas tumbado
  979: 90023, // Elevaciones de piernas en barra → Elevación de rodillas en paralelas (silla del capitán)
  377: 1772, // Elevaciones de piernas tumbado → Crunch inverso
  978: 90023, // Elevaciones de rodillas en barra → Elevación de rodillas en paralelas (silla del capitán)
  1105: 173, // Encogimiento de rodillas sentado → Encogimientos abdominales en polea
  173: 172, // Encogimientos abdominales en polea → Abdominales en máquina
  174: 173, // Encogimientos con piernas elevadas → Encogimientos abdominales en polea
  577: 1776, // Flexión lateral del tronco con mancuerna → Paseo del maletín
  1377: 172, // Giro de torso → Abdominales en máquina
  145: 672, // Leñadores en Polea → Rotación de tronco en polea
  1743: 145, // Limpiaparabrisas → Leñadores en Polea
  1374: 145, // Máquina de giro de torso → Leñadores en Polea
  1776: 577, // Paseo del maletín → Flexión lateral del tronco con mancuerna
  235: 145, // Patadas de aleteo → Leñadores en Polea
  1572: 178, // Perro-pájaro → Bicho muerto
  1091: 1001, // Plancha a una mano alterna → Plancha alta
  1001: 1307, // Plancha alta → Plancha frontal
  1766: 1307, // Plancha con extensión de brazo → Plancha frontal
  1489: 1001, // Plancha con saltos de tijera → Plancha alta
  458: 1307, // Plancha de antebrazo → Plancha frontal
  1406: 1001, // Plancha de antebrazos a manos → Plancha alta
  1019: 1288, // Plancha de lado derecho → Plancha lateral dinámica
  1307: 458, // Plancha frontal → Plancha de antebrazo
  312: 1307, // Plancha inclinada con toque alterno al suelo → Plancha frontal
  500: 172, // Plancha inversa → Abdominales en máquina
  1288: 1019, // Plancha lateral dinámica → Plancha de lado derecho
  1827: 172, // Presión abdominal con ambas piernas → Abdominales en máquina
  1194: 145, // Press Pallof → Leñadores en Polea
  1103: 172, // Puente caminante → Abdominales en máquina
  1779: 145, // Rotación con landmine → Leñadores en Polea
  1912: 145, // Rotación de core → Leñadores en Polea
  672: 145, // Rotación de tronco en polea → Leñadores en Polea
  1966: 145, // Rotación torácica en media rodilla → Leñadores en Polea
  1573: 41, // Rueda abdominal → Rueda abdominal con barra
  41: 1573, // Rueda abdominal con barra → Rueda abdominal
  1477: 145, // Sacacorchos sentado → Leñadores en Polea
  297: 145, // Sostenimiento hueco → Leñadores en Polea
  545: 172, // Tijeras → Abdominales en máquina
  1425: 172, // Toques de pie alternados → Abdominales en máquina
  1411: 145, // Toques de talón → Leñadores en Polea
  // --- Antebrazos ---
  51: 1771, // Curl de muñeca con barra (agarre supino) → Curl de muñeca en polea
  1205: 1771, // Curl de muñeca con mancuernas → Curl de muñeca en polea
  1771: 1205, // Curl de muñeca en polea → Curl de muñeca con mancuernas
  48: 1771, // Curl de muñeca inverso con barra → Curl de muñeca en polea
  1881: 1771, // Extensión de muñeca con mancuernas → Curl de muñeca en polea
  // --- Bíceps ---
  1109: 584, // Bíceps concentrado → Curl en banco Scott a un brazo
  1717: 95, // Codo unilateral polea alta → Curl de bíceps en polea
  1567: 272, // Curl alterno de martillo con mancuernas → Curl martillo
  1465: 465, // Curl araña → Curl en banco Scott
  1493: 204, // Curl bayesiano en polea → Curl inclinado con mancuernas
  1224: 91, // Curl con arrastre con mancuernas → Curl con barra
  91: 94, // Curl con barra → Curl de bíceps con barra Z
  1666: 91, // Curl con el hombro elevado → Curl con barra
  208: 465, // Curl con mancuernas en banco Scott → Curl en banco Scott
  1482: 91, // Curl con trampeo con mancuernas → Curl con barra
  1012: 92, // Curl de bíceps alterno → Curl de bíceps con mancuerna
  94: 91, // Curl de bíceps con barra Z → Curl con barra
  92: 1012, // Curl de bíceps con mancuerna → Curl de bíceps alterno
  1226: 92, // Curl de bíceps con press de hombros con mancuernas → Curl de bíceps con mancuerna
  90020: 465, // Curl de bíceps en máquina → Curl en banco Scott
  95: 91, // Curl de bíceps en polea → Curl con barra
  1424: 92, // Curl de bíceps sentado → Curl de bíceps con mancuerna
  1483: 91, // Curl de bíceps triple → Curl con barra
  1512: 91, // Curl descendente → Curl con barra
  465: 90032, // Curl en banco Scott → Curl en banco Scott en polea
  1658: 465, // Curl en banco Scott - rotación externa → Curl en banco Scott
  584: 208, // Curl en banco Scott a un brazo → Curl con mancuernas en banco Scott
  1657: 465, // Curl en banco Scott con rotación interna → Curl en banco Scott
  90032: 465, // Curl en banco Scott en polea → Curl en banco Scott
  913: 914, // Curl en banco Scott inverso → Curl Inverso con Barra EZ en Polea
  912: 91, // Curl en polea con barra recta → Curl con barra
  204: 1493, // Curl inclinado con mancuernas → Curl bayesiano en polea
  914: 913, // Curl Inverso con Barra EZ en Polea → Curl en banco Scott inverso
  495: 914, // Curl invertido → Curl Inverso con Barra EZ en Polea
  1511: 91, // Curl Kong → Curl con barra
  272: 90021, // Curl martillo → Curl martillo en polea con cuerda
  1502: 272, // Curl martillo cruzado con mancuernas → Curl martillo
  90021: 272, // Curl martillo en polea con cuerda → Curl martillo
  1683: 272, // Curl Zottman → Curl martillo
  1530: 204, // Curls con mancuernas tumbado → Curl inclinado con mancuernas
  1225: 91, // Curls de bíceps abiertos con mancuernas → Curl con barra
  1971: 95, // Jalón Mentzer → Curl de bíceps en polea
  // --- Cardio ---
  1962: 1314, // Apertura de piernas con paso → Saltos de tijera
  90024: 1618, // Bicicleta reclinada → Cardio en bicicleta estática
  1104: 530, // Caminar → Correr en cinta
  1618: 90024, // Cardio en bicicleta estática → Bicicleta reclinada
  530: 962, // Correr en cinta → Elíptica
  90025: 1526, // Cuerdas de batalla → Máquina de esquí
  962: 530, // Elíptica → Correr en cinta
  1449: 530, // Escaladora → Correr en cinta
  1525: 1526, // Lanzamientos de balón → Máquina de esquí
  1526: 1093, // Máquina de esquí → Máquina de remo
  1093: 1526, // Máquina de remo → Máquina de esquí
  983: 1285, // Rodillas elevadas → Talones al glúteo
  595: 1314, // Saltar a la comba – estándar → Saltos de tijera
  1373: 595, // Saltos al cajón → Saltar a la comba – estándar
  285: 595, // Saltos al pecho → Saltar a la comba – estándar
  1314: 595, // Saltos de tijera → Saltar a la comba – estándar
  1285: 983, // Talones al glúteo → Rodillas elevadas
  // --- Cuádriceps ---
  718: 1312, // Asiento en pared → Sentadilla con peso corporal
  616: 1314, // Burpee → Saltos de tijera
  71: 369, // Extensión de cuádriceps a una pierna → Extensión de cuádriceps en máquina
  369: 71, // Extensión de cuádriceps en máquina → Extensión de cuádriceps a una pierna
  1100: 616, // Lanzamientos de balón a pared → Burpee
  630: 1088, // Peso muerto sumo → Peso muerto sumo con mancuerna
  1088: 630, // Peso muerto sumo con mancuerna → Peso muerto sumo
  371: 90037, // Prensa de piernas → Prensa de piernas horizontal
  373: 371, // Prensa de piernas cerrada → Prensa de piernas
  90037: 371, // Prensa de piernas horizontal → Prensa de piernas
  374: 371, // Press de piernas abierto → Prensa de piernas
  614: 1312, // Salto en sentadilla con apertura → Sentadilla con peso corporal
  1948: 1706, // Sentadilla a cajón a una pierna → Sentadilla búlgara con mancuernas
  397: 632, // Sentadilla a cajón bajo con apertura amplia → Sentadillas sumo
  989: 1706, // Sentadilla búlgara → Sentadilla búlgara con mancuernas
  1706: 989, // Sentadilla búlgara con mancuernas → Sentadilla búlgara
  615: 1747, // Sentadilla con barra → Sentadilla en máquina Smith
  1803: 615, // Sentadilla con barra hexagonal → Sentadilla con barra
  1829: 615, // Sentadilla con barra landmine y press → Sentadilla con barra
  203: 90009, // Sentadilla con disco → Sentadilla goblet
  124: 90009, // Sentadilla con disco al frente → Sentadilla goblet
  1312: 90009, // Sentadilla con peso corporal → Sentadilla goblet
  1437: 615, // Sentadilla con pines → Sentadilla con barra
  1208: 1312, // Sentadilla del prisionero → Sentadilla con peso corporal
  90038: 1414, // Sentadilla en máquina (V-squat / cinturón) → Sentadilla hack en máquina
  1747: 615, // Sentadilla en máquina Smith → Sentadilla con barra
  257: 1640, // Sentadilla frontal → Sentadilla frontal con mancuernas
  1640: 257, // Sentadilla frontal con mancuernas → Sentadilla frontal
  90009: 1640, // Sentadilla goblet → Sentadilla frontal con mancuernas
  43: 1414, // Sentadilla hack con barra → Sentadilla hack en máquina
  1464: 1414, // Sentadilla hack con pausa → Sentadilla hack en máquina
  1414: 1527, // Sentadilla hack en máquina → Sentadilla péndulo
  1733: 718, // Sentadilla isometrica al fallo → Asiento en pared
  987: 1653, // Sentadilla lateral → Sentadilla lateral con mancuerna
  1653: 987, // Sentadilla lateral con mancuerna → Sentadilla lateral
  1963: 615, // Sentadilla lenta → Sentadilla con barra
  1527: 1414, // Sentadilla péndulo → Sentadilla hack en máquina
  1801: 1747, // Sentadilla profunda con barra → Sentadilla en máquina Smith
  1593: 1706, // Sentadilla split en máquina Smith → Sentadilla búlgara con mancuernas
  632: 90009, // Sentadillas sumo → Sentadilla goblet
  981: 1706, // Subida a peldaño → Sentadilla búlgara con mancuernas
  1324: 205, // Zancada con el peso corporal → Zancadas con mancuernas
  1366: 205, // Zancada estática con mancuernas → Zancadas con mancuernas
  1830: 1651, // Zancada hacia atrás con barra → Zancada hacia atrás con mancuernas
  1651: 1830, // Zancada hacia atrás con mancuernas → Zancada hacia atrás con barra
  1604: 987, // Zancada lateral deslizante → Sentadilla lateral
  802: 206, // Zancadas caminando con barra → Zancadas caminando con mancuernas
  206: 802, // Zancadas caminando con mancuernas → Zancadas caminando con barra
  46: 205, // Zancadas con barra → Zancadas con mancuernas
  205: 46, // Zancadas con mancuernas → Zancadas con barra
  999: 1651, // Zancadas hacia atrás → Zancada hacia atrás con mancuernas
  // --- Espalda ---
  1215: 1732, // Ángel de nieve invertido → Jalones a la cara con banda
  1380: 822, // Aperturas con banda elástica → Aperturas posteriores en polea
  1487: 636, // Combinación hiperextensión Y-W → Superman
  1929: 355, // Dominada asistida → Jalón al pecho
  475: 355, // Dominadas → Jalón al pecho
  1695: 723, // Dominadas (agarre ancho) → Jalón con agarre ancho
  1696: 1136, // Dominadas (agarre neutro) → Jalón al pecho con agarre neutro
  1219: 394, // Dominadas australianas (remo invertido) → Remo con polea
  152: 1927, // Dominadas con agarre supino → Jalón al pecho con agarre supino
  90018: 475, // Dominadas lastradas → Dominadas
  1737: 1927, // Dominadas supinas asistidas → Jalón al pecho con agarre supino
  1458: 1433, // Elevación en Y cruzada en polea → Leñador inverso
  1834: 1732, // Elevación Trap-3 → Jalones a la cara con banda
  1083: 1732, // Elevaciones Y-W-T → Jalones a la cara con banda
  922: 572, // Encogimiento en polea para trapecio medio → Encogimientos de hombros con mancuernas
  301: 636, // Hiperextensiones → Superman
  1537: 475, // Isometría en dominada → Dominadas
  1639: 222, // Jalón a la cara inclinado con mancuernas → Jalón a la cara (face pull)
  355: 1929, // Jalón al pecho → Dominada asistida
  354: 355, // Jalón al pecho (inclinado) → Jalón al pecho
  1972: 355, // Jalón al pecho a un brazo → Jalón al pecho
  1659: 355, // Jalón al pecho a un brazo cruzado → Jalón al pecho
  1470: 355, // Jalón al pecho a un brazo de rodillas → Jalón al pecho
  158: 695, // Jalón al pecho con agarre cerrado → Jalón con barra en V
  1136: 1696, // Jalón al pecho con agarre neutro → Dominadas (agarre neutro)
  1927: 1737, // Jalón al pecho con agarre supino → Dominadas supinas asistidas
  90034: 355, // Jalón al pecho en máquina de discos → Jalón al pecho
  723: 1695, // Jalón con agarre ancho → Dominadas (agarre ancho)
  695: 1136, // Jalón con barra en V → Jalón al pecho con agarre neutro
  628: 1727, // Jalón con brazos rectos (agarre de barra) → Jalón lateral con brazo recto (polea)
  629: 1727, // Jalón con brazos rectos (agarre de cuerda) → Jalón lateral con brazo recto (polea)
  1727: 628, // Jalón lateral con brazo recto (polea) → Jalón con brazos rectos (agarre de barra)
  1138: 355, // Jalón tumbado en banco inclinado → Jalón al pecho
  1732: 1433, // Jalones a la cara con banda → Leñador inverso
  1435: 1732, // Jalones escapulares → Jalones a la cara con banda
  1433: 1732, // Leñador inverso → Jalones a la cara con banda
  1116: 1776, // Paseo del granjero con mancuernas → Paseo del maletín
  189: 184, // Peso muerto con déficit → Peso muerto convencional
  184: 1370, // Peso muerto convencional → Peso muerto con mancuernas
  484: 184, // Peso muerto en rack → Peso muerto convencional
  1384: 1137, // Pullover en máquina → Pullover en polea alta
  1137: 1384, // Pullover en polea alta → Pullover en máquina
  1492: 1718, // Remo alto → Remo alto desde polea
  1718: 1492, // Remo alto desde polea → Remo alto
  90017: 90035, // Remo alto en máquina de discos → Remo alto en máquina de placas
  90035: 90017, // Remo alto en máquina de placas → Remo alto en máquina de discos
  1486: 1492, // Remo alto en polea alternado → Remo alto
  81: 1621, // Remo con mancuernas → Remo unilateral en polea
  310: 90027, // Remo con mancuernas en banco inclinado → Remo en T con apoyo en el pecho
  394: 1725, // Remo con polea → Remo sentado en máquina de placas
  508: 90026, // Remo en máquina agarre abierto → Remo sentado en máquina de discos
  1119: 394, // Remo en máquina agarre estrecho → Remo con polea
  1120: 394, // Remo en máquina agarre estrecho supino → Remo con polea
  90016: 83, // Remo en máquina Smith → Remo inclinado con barra (agarre prono)
  395: 394, // Remo sentado en polea con agarre en V → Remo con polea
  919: 90027, // Remo en T → Remo en T con apoyo en el pecho
  90027: 919, // Remo en T con apoyo en el pecho → Remo en T
  562: 1621, // Remo escopeta → Remo unilateral en polea
  512: 394, // Remo Gironda → Remo con polea
  1117: 394, // Remo gironda agarre cerrado → Remo con polea
  1501: 81, // Remo gorila alternativo con mancuernas → Remo con mancuernas
  1303: 310, // Remo Helms → Remo con mancuernas en banco inclinado
  84: 83, // Remo inclinado con agarre invertido → Remo inclinado con barra (agarre prono)
  83: 90016, // Remo inclinado con barra (agarre prono) → Remo en máquina Smith
  1082: 394, // Remo inclinado con rotación externa → Remo con polea
  1471: 81, // Remo Kroc → Remo con mancuernas
  1304: 919, // Remo Meadows → Remo en T
  448: 83, // Remo Pendlay → Remo inclinado con barra (agarre prono)
  1701: 81, // Remo pesado a una mano → Remo con mancuernas
  490: 81, // Remo renegado → Remo con mancuernas
  90026: 1725, // Remo sentado en máquina de discos → Remo sentado en máquina de placas
  1725: 90026, // Remo sentado en máquina de placas → Remo sentado en máquina de discos
  1621: 81, // Remo unilateral en polea → Remo con mancuernas
  1877: 1433, // Retracción escapular con banda → Leñador inverso
  468: 1732, // Retracción escapular en prono – brazos en cruz → Jalones a la cara con banda
  636: 301, // Superman → Hiperextensiones
  // --- Femoral ---
  1392: 1700, // Buenos días con barra → Peso muerto rumano con barra
  365: 366, // Curl de piernas (tumbado) → Curl femoral sentado
  364: 366, // Curl femoral → Curl femoral sentado
  367: 365, // Curl femoral de pie → Curl de piernas (tumbado)
  366: 365, // Curl femoral sentado → Curl de piernas (tumbado)
  90011: 365, // Curl nórdico → Curl de piernas (tumbado)
  1809: 301, // Hiperextensión inversa → Hiperextensiones
  1387: 365, // Patadas de isquiotibiales → Curl de piernas (tumbado)
  1736: 1388, // Peso muerto a una pierna con mancuerna → Peso muerto rumano a una pierna
  1370: 1652, // Peso muerto con mancuernas → Peso muerto rumano con mancuernas
  627: 1700, // Peso muerto con piernas rígidas → Peso muerto rumano con barra
  1388: 1736, // Peso muerto rumano a una pierna → Peso muerto a una pierna con mancuerna
  1700: 1652, // Peso muerto rumano con barra → Peso muerto rumano con mancuernas
  1652: 1700, // Peso muerto rumano con mancuernas → Peso muerto rumano con barra
  1688: 1652, // Peso muerto rumano en apoyo → Peso muerto rumano con mancuernas
  90010: 1700, // Peso muerto rumano en máquina Smith → Peso muerto rumano con barra
  90013: 1652, // Swing con kettlebell → Peso muerto rumano con mancuernas
  // --- Gemelos ---
  90015: 622, // Elevación de gemelos de pie con mancuernas → Elevación de gemelos de pie en máquina
  622: 90014, // Elevación de gemelos de pie en máquina → Elevación de gemelos en máquina Smith
  148: 622, // Elevación de gemelos en máquina hack → Elevación de gemelos de pie en máquina
  90014: 622, // Elevación de gemelos en máquina Smith → Elevación de gemelos de pie en máquina
  1620: 590, // Elevación de gemelos sentado con mancuerna → Elevación de gemelos sentado en máquina
  590: 1620, // Elevación de gemelos sentado en máquina → Elevación de gemelos sentado con mancuerna
  1243: 90015, // Elevación de talones a dos piernas → Elevación de gemelos de pie con mancuernas
  1200: 1243, // Elevación tibial anterior → Elevación de talones a dos piernas
  146: 622, // Gemelos en prensa → Elevación de gemelos de pie en máquina
  // --- Glúteos ---
  1202: 1748, // Abducción de cadera en decúbito lateral → Abducción en máquina
  1886: 1748, // Abducción de cadera en supino → Abducción en máquina
  1096: 1748, // Abducción de pie → Abducción en máquina
  1748: 1096, // Abducción en máquina → Abducción de pie
  12: 1724, // Aducción de cadera en máquina → Aducción de pie (polea)
  1724: 12, // Aducción de pie (polea) → Aducción de cadera en máquina
  2449: 1748, // Almeja a almeja inversa → Abducción en máquina
  1842: 1096, // Almeja con banda → Abducción de pie
  2448: 1748, // Almeja inversa → Abducción en máquina
  1234: 1740, // Empuje de cadera a una pierna con mancuerna → Puente de glúteos a una pierna
  294: 90012, // Empuje de cadera con barra → Hip thrust en máquina
  1642: 294, // Empuje de cadera con mancuerna → Empuje de cadera con barra
  1751: 294, // Empuje de cadera en polea → Empuje de cadera con barra
  1132: 1131, // Extensión de glúteo en máquina → Extensión de glúteos en polea
  1131: 1132, // Extensión de glúteos en polea → Extensión de glúteo en máquina
  1735: 1723, // Gluteo en prensa de lado con una pierna → Patada de glúteo en máquina
  90012: 294, // Hip thrust en máquina → Empuje de cadera con barra
  1616: 1723, // Patada de burro con mancuerna → Patada de glúteo en máquina
  1613: 1131, // Patada de glúteo con banda elástica → Extensión de glúteos en polea
  1723: 1131, // Patada de glúteo en máquina → Extensión de glúteos en polea
  1410: 1613, // Plancha con elevación de pierna → Patada de glúteo con banda elástica
  265: 294, // Puente de glúteos → Empuje de cadera con barra
  1740: 1234, // Puente de glúteos a una pierna → Empuje de cadera a una pierna con mancuerna
  // --- Hombros ---
  1826: 222, // Apertura con banda y rotación externa → Jalón a la cara (face pull)
  1936: 82, // Aperturas para deltoides posterior en polea (un brazo) → Elevaciones posteriores con mancuernas
  822: 139, // Aperturas posteriores en polea → Contractora inversa (pec deck)
  139: 822, // Contractora inversa (pec deck) → Aperturas posteriores en polea
  1098: 82, // Elevación de deltoides posterior sentado → Elevaciones posteriores con mancuernas
  1879: 1755, // Elevación en Y con mancuernas en banco inclinado → Jalón en Y en polea
  1731: 256, // Elevación frontal en polea → Elevaciones frontales
  917: 1731, // Elevación frontal en polea con barra Z → Elevación frontal en polea
  348: 1378, // Elevación lateral con mancuernas → Elevaciones laterales en polea (a un brazo)
  1744: 1378, // Elevación lateral en máquina → Elevaciones laterales en polea (a un brazo)
  918: 348, // Elevación lateral sentado con mancuernas → Elevación lateral con mancuernas
  1443: 348, // Elevación lateral y frontal con mancuernas → Elevación lateral con mancuernas
  256: 1731, // Elevaciones frontales → Elevación frontal en polea
  254: 256, // Elevaciones frontales con disco → Elevaciones frontales
  1754: 348, // Elevaciones laterales a 45° → Elevación lateral con mancuernas
  1378: 1744, // Elevaciones laterales en polea (a un brazo) → Elevación lateral en máquina
  82: 139, // Elevaciones posteriores con mancuernas → Contractora inversa (pec deck)
  570: 572, // Encogimiento de hombros → Encogimientos de hombros con mancuernas
  1472: 572, // Encogimiento en polea → Encogimientos de hombros con mancuernas
  1925: 571, // Encogimiento Silverback con barra → Encogimientos de hombros con barra
  571: 572, // Encogimientos de hombros con barra → Encogimientos de hombros con mancuernas
  572: 571, // Encogimientos de hombros con mancuernas → Encogimientos de hombros con barra
  90019: 572, // Encogimientos de hombros en máquina → Encogimientos de hombros con mancuernas
  454: 567, // Flexiones de pica → Press militar sentado con mancuernas
  222: 139, // Jalón a la cara (face pull) → Contractora inversa (pec deck)
  79: 1755, // Jalón alto inclinado con mancuernas → Jalón en Y en polea
  1795: 1755, // Jalón cruzado unilateral en polea → Jalón en Y en polea
  1755: 1602, // Jalón en Y en polea → Scaption con mancuernas
  346: 567, // Landmine press → Press militar sentado con mancuernas
  1709: 139, // Pájaro de pie → Contractora inversa (pec deck)
  20: 567, // Press Arnold → Press militar sentado con mancuernas
  1893: 567, // Press de barra por encima de la cabeza → Press militar sentado con mancuernas
  1968: 567, // Press de hombro con mancuerna a un brazo → Press militar sentado con mancuernas
  478: 543, // Press de hombro con mancuernas → Press de hombros en máquina de placas
  566: 567, // Press de hombros con barra → Press militar sentado con mancuernas
  90029: 543, // Press de hombros en máquina de discos → Press de hombros en máquina de placas
  543: 90029, // Press de hombros en máquina de placas → Press de hombros en máquina de discos
  569: 567, // Press de hombros en máquina Smith → Press militar sentado con mancuernas
  90030: 567, // Press de hombros en polea → Press militar sentado con mancuernas
  1581: 567, // Press de trapecio → Press militar sentado con mancuernas
  193: 567, // Press diagonal para hombros → Press militar sentado con mancuernas
  418: 567, // Press militar → Press militar sentado con mancuernas
  1439: 566, // Press militar desde pines → Press de hombros con barra
  1441: 567, // Press militar en banco inclinado con mancuernas → Press militar sentado con mancuernas
  567: 543, // Press militar sentado con mancuernas → Press de hombros en máquina de placas
  693: 90031, // Remo al mentón con barra → Remo al mentón en polea
  694: 693, // Remo al mentón con mancuernas → Remo al mentón con barra
  691: 693, // Remo al mentón en máquina Smith → Remo al mentón con barra
  90031: 693, // Remo al mentón en polea → Remo al mentón con barra
  1729: 578, // Rotación externa de hombro (polea) → Rotación externa tumbado de lado
  578: 1729, // Rotación externa tumbado de lado → Rotación externa de hombro (polea)
  1728: 1582, // Rotación interna de hombro (polea) → Rotación interna tumbado de lado
  1582: 1728, // Rotación interna tumbado de lado → Rotación interna de hombro (polea)
  1429: 1755, // Rotaciones de hombro con mancuerna → Jalón en Y en polea
  1602: 1755, // Scaption con mancuernas → Jalón en Y en polea
  31: 348, // Sostenimiento lateral isométrico → Elevación lateral con mancuernas
  289: 693, // Tirón alto → Remo al mentón con barra
  915: 254, // Volante → Elevaciones frontales con disco
  // --- Pecho ---
  238: 926, // Aperturas con mancuernas → Aperturas en máquina (contractora)
  239: 1691, // Aperturas con mancuernas en banco declinado → Aperturas en polea para el pecho inferior
  308: 1690, // Aperturas con mancuernas en banco inclinado → Aperturas en polea para el pecho superior
  1922: 926, // Aperturas de pecho en polea sentado → Aperturas en máquina (contractora)
  926: 323, // Aperturas en máquina (contractora) → Aperturas en polea
  323: 926, // Aperturas en polea → Aperturas en máquina (contractora)
  1469: 308, // Aperturas en polea inclinado → Aperturas con mancuernas en banco inclinado
  1691: 239, // Aperturas en polea para el pecho inferior → Aperturas con mancuernas en banco declinado
  1689: 926, // Aperturas en polea para el pecho medio → Aperturas en máquina (contractora)
  1690: 308, // Aperturas en polea para el pecho superior → Aperturas con mancuernas en banco inclinado
  1296: 308, // Cruce de poleas bajas → Aperturas con mancuernas en banco inclinado
  1964: 1551, // Flexión con manos abiertas → Flexiones
  1554: 1551, // Flexión con palmada → Flexiones
  1716: 1551, // Flexión escapular en banco inclinado → Flexiones
  1551: 75, // Flexiones → Press de banca con mancuernas
  1086: 386, // Flexiones con agarre estrecho → Flexiones diamante
  1777: 1551, // Flexiones con déficit → Flexiones
  801: 1551, // Flexiones con mancuernas → Flexiones
  1902: 1551, // Flexiones con peso → Flexiones
  583: 1551, // Flexiones de lado a lado → Flexiones
  1218: 1551, // Flexiones de rodillas → Flexiones
  1112: 1551, // Flexiones declinadas → Flexiones
  386: 1086, // Flexiones diamante → Flexiones con agarre estrecho
  1111: 1551, // Flexiones inclinadas → Flexiones
  194: 90022, // Fondos en paralelas → Fondos en máquina
  498: 1497, // Press de banca con agarre supino → Press de banca supino con mancuernas
  73: 75, // Press de banca con barra → Press de banca con mancuernas
  75: 73, // Press de banca con mancuernas → Press de banca con barra
  445: 73, // Press de banca con pausa → Press de banca con barra
  1436: 73, // Press de banca con pines (barra) → Press de banca con barra
  185: 186, // Press de banca declinado con barra → Press de banca declinado con mancuernas
  186: 185, // Press de banca declinado con mancuernas → Press de banca declinado con barra
  90001: 73, // Press de banca en máquina Smith → Press de banca con barra
  538: 537, // Press de banca inclinado → Press inclinado con mancuernas
  1497: 498, // Press de banca supino con mancuernas → Press de banca con agarre supino
  1461: 75, // Press de pecho con mancuernas sin impulso de piernas → Press de banca con mancuernas
  129: 90028, // Press de pecho en máquina de discos → Press de pecho en máquina de placas
  90028: 129, // Press de pecho en máquina de placas → Press de pecho en máquina de discos
  1656: 186, // Press de pecho en polea - declinado → Press de banca declinado con mancuernas
  90006: 90028, // Press de pecho en polea de pie → Press de pecho en máquina de placas
  1660: 537, // Press de pecho en polea inclinado → Press inclinado con mancuernas
  1084: 75, // Press de suelo con mancuernas → Press de banca con mancuernas
  90005: 90003, // Press declinado en máquina de discos → Press declinado en máquina Smith
  90003: 185, // Press declinado en máquina Smith → Press de banca declinado con barra
  1457: 75, // Press envolvente en polea → Press de banca con mancuernas
  1353: 75, // Press hex con mancuernas → Press de banca con mancuernas
  537: 538, // Press inclinado con mancuernas → Press de banca inclinado
  90004: 90036, // Press inclinado en máquina de discos → Press inclinado en máquina de placas
  90036: 90004, // Press inclinado en máquina de placas → Press inclinado en máquina de discos
  90002: 538, // Press inclinado en máquina Smith → Press de banca inclinado
  925: 90002, // Press inclinado ligero en máquina Smith → Press inclinado en máquina Smith
  1546: 73, // Press Larsen → Press de banca con barra
  1508: 90002, // Press muy inclinado en máquina Smith → Press inclinado en máquina Smith
  90008: 1353, // Press Svend con disco → Press hex con mancuernas
  90007: 161, // Pullover con barra → Pullover con mancuerna
  161: 90007, // Pullover con mancuerna → Pullover con barra
  1693: 308, // Sostenimiento estático en banco inclinado → Aperturas con mancuernas en banco inclinado
  1496: 537, // Variación con mancuerna para el pecho superior → Press inclinado con mancuernas
  // --- Tríceps ---
  50: 1513, // Extensión de triceps → Extensión de tríceps sobre la cabeza en polea
  803: 1185, // Extensión de tríceps a una mano en polea → Extensión de tríceps en polea con cuerda
  1481: 1185, // Extensión de tríceps con arrastre → Extensión de tríceps en polea con cuerda
  1485: 1185, // Extensión de tríceps con balanceo → Extensión de tríceps en polea con cuerda
  1298: 1185, // Extensión de tríceps cruzada en polea alta → Extensión de tríceps en polea con cuerda
  90033: 660, // Extensión de tríceps en polea con agarre supino → Extensiones de tríceps en polea con barra
  1185: 660, // Extensión de tríceps en polea con cuerda → Extensiones de tríceps en polea con barra
  1662: 1185, // Extensión de tríceps en polea con rotación interna → Extensión de tríceps en polea con cuerda
  1519: 1513, // Extensión de tríceps por encima de la cabeza → Extensión de tríceps sobre la cabeza en polea
  1336: 1513, // Extensión de tríceps sobre la cabeza (mancuerna) → Extensión de tríceps sobre la cabeza en polea
  1668: 1336, // Extensión de tríceps sobre la cabeza a una mano en polea → Extensión de tríceps sobre la cabeza (mancuerna)
  1513: 1336, // Extensión de tríceps sobre la cabeza en polea → Extensión de tríceps sobre la cabeza (mancuerna)
  660: 1185, // Extensiones de tríceps en polea con barra → Extensión de tríceps en polea con cuerda
  1209: 386, // Flexión a tres puntos al ancho de los hombros → Flexiones diamante
  985: 386, // Flexiones a rotación → Flexiones diamante
  1000: 90022, // Fondos → Fondos en máquina
  1372: 90022, // Fondos de tríceps asistidos → Fondos en máquina
  1320: 197, // Fondos de tríceps en el suelo → Fondos entre Bancos
  90022: 1000, // Fondos en máquina → Fondos
  1774: 197, // Fondos en silla → Fondos entre Bancos
  197: 90022, // Fondos entre Bancos → Fondos en máquina
  1302: 246, // JM Press → Press francés con barra Z
  655: 1509, // Patada de tríceps con mancuernas → Patada de tríceps en polea
  1509: 655, // Patada de tríceps en polea → Patada de tríceps con mancuernas
  1490: 655, // Patada de tríceps tumbado → Patada de tríceps con mancuernas
  112: 386, // Plancha a flexión → Flexiones diamante
  76: 1228, // Press de banca con agarre cerrado → Press de banca con agarre cerrado con mancuernas
  1228: 76, // Press de banca con agarre cerrado con mancuernas → Press de banca con agarre cerrado
  598: 76, // Press de banca con agarre cerrado en máquina Smith → Press de banca con agarre cerrado
  1467: 76, // Press de banca inclinado con agarre cerrado → Press de banca con agarre cerrado
  549: 661, // Press de tríceps sentado → Tríceps en máquina
  246: 245, // Press francés con barra Z → Press francés con mancuernas
  245: 246, // Press francés con mancuernas → Press francés con barra Z
  1468: 246, // Press francés en el suelo → Press francés con barra Z
  911: 246, // Press francés inclinado → Press francés con barra Z
  1824: 245, // Tate press con mancuernas → Press francés con mancuernas
  661: 1185, // Tríceps en máquina → Extensión de tríceps en polea con cuerda
};
