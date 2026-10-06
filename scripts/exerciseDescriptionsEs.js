/**
 * Descripciones de ejercicio reescritas en español.
 *
 * wger trae algunas en inglés y otras que son apenas una nota ("Keep legs
 * straight", "Jump wide, then close"). Igual que NAME_ES, se sobreescriben
 * aquí por id para que sobrevivan al siguiente `npm run fetch:exercises`.
 * Para aplicarlas al catálogo ya descargado: `npm run fix:exercise-catalog`.
 */

const DESCRIPTION_ES = {
  // --- Abdominales ---
  1105: 'Siéntate en el suelo o en una esterilla con las manos apoyadas un poco por detrás de la cadera y el tronco ligeramente inclinado hacia atrás. Con los pies en el aire, estira las piernas hacia delante y vuelve a recoger las rodillas hacia el pecho contrayendo el abdomen.',
  1374: 'Siéntate en la máquina de giro de torso con las piernas sujetas y el pecho contra el apoyo. Gira el tronco hacia un lado de forma lenta y controlada usando los oblicuos, y vuelve al centro sin dejar que el peso te arrastre. No uses demasiado peso: el movimiento tiene que ser lento y sin tirones.',
  1776: 'Coge una mancuerna o kettlebell pesada con una sola mano y camina hacia delante y hacia atrás con el cuerpo totalmente recto. El objetivo es no inclinarte hacia el lado del peso: los oblicuos y el core trabajan para mantenerte erguido. Repite con la otra mano.',
  1489: 'Colócate en plancha alta con las manos bajo los hombros y el cuerpo en línea recta. Separa y junta los pies con pequeños saltos, como en un salto de tijera, sin que la cadera suba ni baje.',
  1406: 'Empieza en plancha de antebrazos con el cuerpo en línea recta. Apoya una mano y luego la otra para subir a plancha alta, y baja de nuevo apoyando un antebrazo y después el otro. Alterna el brazo con el que empiezas y evita que la cadera se balancee.',
  500: 'Siéntate en el suelo con las piernas estiradas y las manos apoyadas detrás de la cadera. Eleva la cadera hasta que el cuerpo forme una línea recta de los talones a los hombros, con el abdomen mirando al techo, y mantén la posición apretando glúteos y abdomen.',
  672: 'Siéntate de lado a una polea colocada a la altura del pecho y sujeta el agarre con las dos manos y los brazos estirados delante del cuerpo. Gira el tronco alejándote de la polea manteniendo la cadera quieta y vuelve despacio al punto de partida. Haz las repeticiones y cambia de lado.',

  // --- Brazos ---
  1493: 'De espaldas a una polea baja, coge el agarre con una mano y da un paso adelante para que el brazo quede estirado por detrás del cuerpo. Sin mover el codo, flexiona el brazo hasta llevar el agarre al hombro y baja despacio hasta notar el estiramiento del bíceps.',
  1717: 'De espaldas a una polea alta, sujeta el agarre con una mano por detrás de la cabeza con el codo apuntando al techo. Sin mover el codo, extiende el brazo hacia delante y arriba hasta estirarlo y vuelve despacio. Haz las repeticiones y cambia de brazo.',
  1502: 'De pie con una mancuerna en cada mano y las palmas mirando hacia el cuerpo. Sube una mancuerna cruzándola por delante del cuerpo hacia el hombro contrario, sin girar la muñeca, y bájala controlada. Alterna los brazos. Trabaja sobre todo el braquial y el bíceps.',
  1372: 'Sube a la máquina de fondos asistidos, apoya las rodillas en la plataforma y agarra las paralelas. Con el cuerpo vertical para cargar el tríceps, baja flexionando los codos hasta unos 90 grados y empuja hasta estirar los brazos. Cuanto más contrapeso pongas, más fácil es.',
  1467: 'Túmbate en un banco inclinado y agarra la barra con las manos algo más juntas que en el press de banca normal, justo por fuera del ancho de los hombros. Baja la barra a la parte alta del pecho con los codos pegados al cuerpo y empuja hasta estirar los brazos.',
  911: 'Túmbate en un banco inclinado a unos 45 grados con una mancuerna en cada mano y los brazos estirados por encima de la cabeza. Sin mover los codos, flexiónalos para bajar las mancuernas hacia los lados de la cabeza y vuelve a estirar los brazos.',
  1824: 'Túmbate boca arriba con una mancuerna en cada mano y los brazos estirados sobre el pecho, con las mancuernas juntas y las palmas hacia los pies. Sin mover la parte superior del brazo, flexiona los codos abriéndolos hacia los lados hasta tocar suavemente el pecho con las mancuernas. Empuja con fuerza para volver a estirar los brazos.',

  // --- Cardio ---
  1104: 'Camina a paso ligero, en la calle o en cinta, manteniendo un ritmo de al menos 100 pasos por minuto. Mantén el tronco erguido y deja que los brazos acompañen el movimiento.',
  1093: 'Siéntate en la máquina de remo con los pies sujetos y la espalda recta. Empuja primero con las piernas, después inclina ligeramente el tronco hacia atrás y termina tirando del agarre hacia el abdomen. Vuelve en orden inverso: brazos, tronco y piernas.',
  1285: 'Corre en el sitio o avanzando llevando los talones a tocar los glúteos en cada zancada. Mantén el tronco recto y un ritmo rápido.',

  // --- Espalda ---
  1737: 'Sube a la máquina de dominadas asistidas, apoya las rodillas en la plataforma y agarra la barra con las palmas mirando hacia ti, al ancho de los hombros. Sube hasta pasar la barbilla por encima de la barra y baja controlado. Cuanto más contrapeso pongas, más fácil es.',
  1537: 'Cuélgate de la barra de dominadas, sube hasta la posición que quieras trabajar (arriba, a media altura o casi abajo) y mantenla el mayor tiempo posible apretando la espalda.',
  1470: 'Engancha un agarre de una mano a una polea alta y ponte de rodillas delante. Con el brazo estirado, tira del agarre hacia abajo llevando el codo hacia la cadera con el dorsal, y vuelve despacio hasta estirar el brazo. Haz las repeticiones y cambia de lado.',
  695: 'Siéntate en la máquina de jalón con la barra en V (agarre estrecho y neutro) y las rodillas sujetas. Tira del agarre hacia la parte alta del pecho inclinando ligeramente el tronco hacia atrás y juntando los omóplatos, y vuelve despacio hasta estirar los brazos.',
  1138: 'Túmbate boca abajo en un banco inclinado colocado frente a una polea alta y agarra la barra con los brazos estirados. Tira de ella hacia abajo llevando los codos hacia los costados y vuelve despacio. Al tener el pecho apoyado, no puedes ayudarte con el impulso del cuerpo.',
  1435: 'Cuélgate de la barra de dominadas con los brazos estirados. Sin flexionar los codos, junta y baja los omóplatos para que el cuerpo suba unos centímetros, y vuelve a relajarlos despacio.',
  1384: 'Siéntate en la máquina de pullover con los codos apoyados en las almohadillas y la espalda pegada al respaldo. Lleva los codos hacia abajo en arco hasta los costados usando los dorsales y vuelve despacio hasta notar el estiramiento.',
  1492: 'De rodillas sobre una pierna junto a una polea alta, agarra el agarre con la mano del lado contrario a la rodilla apoyada. Tira hacia abajo llevando el codo hacia el costado y el dorsal, y vuelve despacio hasta estirar el brazo.',
  1718: 'Sentado frente a una polea alta con el pecho apoyado, coge el agarre con una mano. Tira hacia ti y hacia abajo llevando el codo atrás y pegado al cuerpo, juntando el omóplato, y vuelve despacio hasta estirar el brazo. Haz las repeticiones y cambia de lado.',
  508: 'Siéntate en la máquina de remo (o en la polea baja) con una barra ancha y las palmas hacia arriba. Con la espalda recta, tira de la barra hacia el abdomen juntando los omóplatos y vuelve despacio hasta estirar los brazos.',
  1119: 'Siéntate en la máquina de remo con el pecho apoyado y agarra las asas con agarre estrecho. Tira hacia ti llevando los codos pegados al cuerpo y juntando los omóplatos, y vuelve despacio hasta estirar los brazos.',
  1120: 'Siéntate en la máquina de remo (o en la polea baja) y agarra la barra con agarre estrecho y las palmas hacia arriba. Tira hacia el abdomen con los codos pegados al cuerpo, juntando los omóplatos, y vuelve despacio hasta estirar los brazos.',
  919: 'Colócate sobre la barra en T con las rodillas algo flexionadas y el tronco inclinado hacia delante con la espalda recta. Agarra el maneral en triángulo (agarre neutro) y tira de la barra hacia el pecho juntando los omóplatos. Bájala controlada hasta estirar los brazos.',
  1471: 'Remo con mancuerna a una mano, apoyando la otra mano en un banco, con mucho peso y una técnica algo más suelta que el remo normal: se permite un poco de impulso del tronco para mover más carga. Haz series largas y cambia de lado.',
  1473: 'Coloca las dos poleas en posición alta con un agarre de una mano en cada una. Coge el cable izquierdo con la mano derecha y el derecho con la izquierda, de forma que se crucen delante de ti. Con los brazos casi estirados, ábrelos hacia los lados y atrás juntando los omóplatos, y vuelve despacio.',
  1098: 'Sentado en el borde de un banco, inclina el tronco unos 45 grados hacia delante con una mancuerna en cada mano. Con los brazos estirados, súbelos hacia los lados hasta la altura de los hombros y bájalos despacio.',
  1458: 'Engancha un agarre de una mano a una polea baja y colócate de lado. Coge el agarre con la mano más alejada y llévalo en diagonal cruzando el cuerpo hasta por encima de la cabeza, como si desenvainaras una espada, formando una Y. Vuelve despacio y cambia de lado.',
  922: 'Siéntate frente a una polea a la altura del pecho con la espalda recta y los brazos estirados. Sin flexionar los codos, junta los omóplatos llevando los hombros hacia atrás, aguanta un segundo arriba y vuelve despacio.',

  // --- Gemelos ---
  1200: 'De pie con la espalda apoyada en la pared y los talones a un palmo de ella. Levanta la punta de los pies todo lo que puedas, apoyándote solo en los talones, y bájala despacio sin llegar a apoyarla del todo.',

  // --- Hombros ---
  1731: 'De pie de espaldas a una polea baja, con el cable pasando entre las piernas y el agarre en una mano. Sube el brazo estirado por delante del cuerpo en un arco suave hasta la altura de los hombros y bájalo despacio. No balancees el tronco para empezar la repetición.',
  917: 'De pie de espaldas a una polea baja, con el cable pasando entre las piernas y una barra Z enganchada. Sube la barra con los brazos estirados por delante hasta la altura de los hombros y bájala controlada.',
  918: 'Siéntate en el borde de un banco con una mancuerna en cada mano y el tronco ligeramente inclinado hacia delante. Sube los brazos hacia los lados, con los codos un poco flexionados, hasta la altura de los hombros, y bájalos despacio.',
  1754: 'De pie con una mancuerna en cada mano. Sube los brazos en diagonal, a medio camino entre una elevación frontal y una lateral (unos 45 grados por delante del cuerpo), hasta la altura de los hombros, y bájalos despacio.',
  1472: 'Engancha un agarre a cada una de las dos poleas bajas y colócate entre ellas con un agarre en cada mano. Con los brazos estirados, sube los hombros hacia las orejas usando el trapecio, aguanta un segundo y bájalos despacio.',
  1755: 'Coloca las dos poleas a la altura de la cara y cruza los cables: coge el izquierdo con la mano derecha y el derecho con la izquierda. Tira de ellos llevando los codos hacia arriba y hacia fuera, cerca del cuerpo, hasta que los brazos formen una Y, y vuelve despacio.',
  1439: 'Coloca los pines de seguridad del rack a la altura de la barbilla y apoya la barra en ellos. Con la barra en los pines y sin perder la tensión, empújala por encima de la cabeza hasta estirar los brazos y vuelve a dejarla sobre los pines en cada repetición.',

  // --- Pecho ---
  1469: 'Coloca las poleas en posición baja y siéntate o túmbate en un banco inclinado entre ellas, con el tronco a unos 105 grados. Con los codos ligeramente flexionados, junta los agarres por encima del pecho en un arco amplio y vuelve despacio hasta notar el estiramiento.',
  1777: 'Colócate en posición de flexión con las manos sobre dos discos, agarres o bloques. Al bajar, deja que el pecho descienda por debajo del nivel de las manos para estirar más el pecho, y empuja hasta estirar los brazos.',
  1546: 'Press de banca con barra pero con las piernas estiradas y levantadas (o apoyadas en otro banco), de forma que no puedes impulsarte con ellas. Baja la barra al pecho de forma controlada y empuja manteniendo la espalda apoyada en el banco.',
  498: 'Túmbate en un banco plano y agarra la barra con las palmas mirando hacia ti, algo más abierto que los hombros. Baja la barra a la parte baja del pecho con los codos pegados al cuerpo y empuja hasta estirar los brazos. Trabaja sobre todo la parte alta del pecho y el tríceps.',
  538: 'Túmbate en un banco inclinado a 30-45 grados y agarra la barra algo más abierto que el ancho de los hombros. Bájala controlada hasta la parte alta del pecho y empuja hasta estirar los brazos sin bloquear los codos.',
  1508: 'Coloca un banco inclinado a 45-60 grados bajo la máquina Smith. Desbloquea la barra, bájala hasta tocar la parte alta del pecho y empuja hasta estirar los brazos.',

  // --- Piernas ---
  1100: 'De pie frente a una pared con un balón medicinal a la altura del pecho y los pies al ancho de los hombros. Baja en sentadilla y, al subir, lanza el balón lo más alto que puedas contra la pared. Recógelo y encadena la siguiente repetición.',
  1116: 'Coge una mancuerna pesada en cada mano (como referencia, la mitad de tu peso corporal en cada una) y camina con pasos cortos, la espalda recta y los hombros hacia atrás, durante la distancia o el tiempo marcados.',
  1723: 'Colócate en la máquina de patada de glúteo con el pie apoyado en la plataforma. Empuja hacia atrás y arriba con el talón, no con la punta, para cargar el glúteo, y vuelve despacio. No arquees la zona lumbar al final del movimiento.',
  1370: 'De pie con una mancuerna en cada mano delante de los muslos. Con la espalda recta, flexiona caderas y rodillas para bajar las mancuernas pegadas a las piernas hasta media espinilla, y sube empujando el suelo con los pies. Hazlo lento y sin impulso.',
  627: 'De pie con la barra delante de los muslos. Con las piernas estiradas (o muy ligeramente flexionadas) y la espalda recta, lleva la cadera hacia atrás y baja la barra pegada a las piernas hasta notar el estiramiento de los isquiotibiales. Sube empujando la cadera hacia delante.',
  1688: 'Peso muerto rumano a una pierna, pero apoyando la punta del pie de la pierna que no trabaja detrás de ti para ayudarte con el equilibrio. Lleva la cadera hacia atrás con la espalda recta hasta notar el estiramiento del isquiotibial de la pierna de apoyo y vuelve a subir.',
  1410: 'En posición de plancha alta con el cuerpo en línea recta, levanta una pierna estirada unos centímetros, aguanta un momento y bájala. Alterna las piernas sin que la cadera gire ni se hunda.',
  1740: 'Túmbate boca arriba con una rodilla flexionada y el pie apoyado, y la otra pierna estirada en el aire. Empuja con el talón apoyado para subir la cadera hasta alinearla con el tronco, aprieta el glúteo arriba y baja despacio. Haz las repeticiones y cambia de pierna.',
  614: 'De pie con los pies juntos, salta abriendo las piernas y cae en sentadilla con los pies más abiertos que los hombros. Salta de nuevo para volver a juntar los pies y encadena las repeticiones.',
  1527: 'Colócate en la máquina de sentadilla péndulo con los hombros bajo las almohadillas y los pies en el centro de la plataforma, al ancho de los hombros. Con el tronco firme y el cuello relajado, baja flexionando las rodillas todo lo que puedas y sube empujando con todo el pie.',
  981: 'De pie frente a un cajón, banco o step. Sube apoyando un pie entero y empujando con esa pierna hasta quedar de pie arriba, y baja controlando. Alterna las piernas o haz todas las repeticiones con una y luego con la otra.',
  1366: 'De pie con una mancuerna en cada mano, da un paso largo hacia delante y quédate en esa posición. Baja flexionando las dos rodillas hasta que la de atrás casi toque el suelo y sube sin mover los pies. Hazlo lento y sin impulso, y cambia de pierna.',
  203: 'De pie con los pies al ancho de los hombros, sujeta un disco con las dos manos pegado al pecho. Baja en sentadilla con el pecho alto hasta que los muslos queden paralelos al suelo y sube empujando con todo el pie. Una variante más exigente es sujetar el disco por encima de la cabeza.',
};

module.exports = { DESCRIPTION_ES };
