/**
 * Ejercicios que wger no tiene pero que están en cualquier gimnasio (máquina
 * Smith, prensas de pecho inclinada/declinada...). Se mezclan con el catálogo
 * de wger igual que NAME_ES: el fichero vive aquí, así que sobrevive al
 * siguiente `npm run fetch:exercises` en vez de perderse.
 *
 * Los ids empiezan en 90001 para no chocar nunca con los de wger (que van por
 * los 2.000). No se reutilizan: las rutinas y sesiones guardadas los apuntan.
 *
 * Las fotos no van aquí: se emparejan en FREE_DB_IMAGES (exerciseImagesFree.js)
 * como las de cualquier otro ejercicio.
 *
 * Para meterlos en el catálogo ya descargado: `npm run fix:custom-exercises`
 * y después `npm run fix:exercise-images`.
 */

const BRAZOS = { id: 8, name: 'Brazos' };
const PIERNAS = { id: 9, name: 'Piernas' };
const ABDOMINALES = { id: 10, name: 'Abdominales' };
const PECHO = { id: 11, name: 'Pecho' };
const ESPALDA = { id: 12, name: 'Espalda' };
const HOMBROS = { id: 13, name: 'Hombros' };
const GEMELOS = { id: 14, name: 'Gemelos' };
const CARDIO = { id: 15, name: 'Cardio' };

const M_PECHO = { id: 4, name: 'Pecho' };
const M_HOMBRO = { id: 2, name: 'Hombros (deltoides)' };
const M_TRICEPS = { id: 5, name: 'Tríceps' };
const M_DORSALES = { id: 12, name: 'Dorsales' };
const M_SERRATO = { id: 3, name: 'Serrato anterior' };
const M_BICEPS = { id: 1, name: 'Bíceps' };
const M_BRAQUIAL = { id: 13, name: 'Braquial' };
const M_ABDOMINALES = { id: 6, name: 'Abdominales' };
const M_GEMELOS = { id: 7, name: 'Gemelos' };
const M_GLUTEOS = { id: 8, name: 'Glúteos' };
const M_TRAPECIO = { id: 9, name: 'Trapecio' };
const M_CUADRICEPS = { id: 10, name: 'Cuádriceps' };
const M_ISQUIOS = { id: 11, name: 'Isquiotibiales' };
const M_SOLEO = { id: 15, name: 'Sóleo' };

const BARRA = { id: 1, name: 'Barra' };
const BANCO = { id: 8, name: 'Banco' };
const BANCO_INCLINADO = { id: 9, name: 'Banco inclinado' };
const MANCUERNA = { id: 3, name: 'Mancuerna' };
const BARRA_DOMINADAS = { id: 6, name: 'Barra de dominadas' };
const PESO_CORPORAL = { id: 7, name: 'Ninguno (peso corporal)' };
const KETTLEBELL = { id: 10, name: 'Kettlebell' };

function exercise({ id, uuid, name, description, category = PECHO, primary, secondary = [], equipment = [] }) {
  return {
    id,
    uuid,
    name,
    description,
    category,
    musclesPrimary: primary,
    musclesSecondary: secondary,
    equipment,
    images: [],
    videos: [],
  };
}

const CUSTOM_EXERCISES = [
  exercise({
    id: 90001,
    uuid: '1ee3aac1-c9e7-4665-af25-a8e4f3bb0cfc',
    name: 'Press de banca en máquina Smith',
    description:
      'Túmbate en un banco plano colocado bajo la barra de la máquina Smith, de forma que la barra quede a la altura de la parte media del pecho. Agarra la barra algo más abierto que el ancho de hombros, desbloquéala girando las muñecas y bájala controlada hasta rozar el pecho. Empuja hasta extender los brazos sin bloquear los codos.',
    primary: [M_PECHO],
    secondary: [M_HOMBRO, M_TRICEPS],
    equipment: [BANCO],
  }),
  exercise({
    id: 90002,
    uuid: '6c1c0f76-4b27-406f-9907-c61972361061',
    name: 'Press inclinado en máquina Smith',
    description:
      'Coloca un banco inclinado a 30-45 grados bajo la máquina Smith, de forma que la barra baje a la parte alta del pecho. Agarra la barra algo más abierto que el ancho de hombros, desbloquéala y bájala controlada hasta la clavícula. Empuja hasta extender los brazos sin bloquear los codos.',
    primary: [M_PECHO],
    secondary: [M_HOMBRO, M_TRICEPS],
    equipment: [BANCO_INCLINADO],
  }),
  exercise({
    id: 90003,
    uuid: '57cd9c93-4089-4da8-b203-1fd7ef4c72f8',
    name: 'Press declinado en máquina Smith',
    description:
      'Coloca un banco declinado bajo la máquina Smith y sujeta bien los pies en los rodillos. La barra debe bajar a la parte baja del pecho. Agarra la barra algo más abierto que el ancho de hombros, desbloquéala, bájala controlada y empuja hasta extender los brazos.',
    primary: [M_PECHO],
    secondary: [M_TRICEPS],
    equipment: [BANCO],
  }),
  exercise({
    id: 90004,
    uuid: '40dcb1e3-2e92-4375-9dcf-a552d79c3579',
    name: 'Press inclinado en máquina',
    description:
      'Siéntate en la máquina de press inclinado con la espalda bien apoyada en el respaldo y ajusta el asiento para que los agarres queden a la altura de la parte alta del pecho. Empuja hacia arriba y hacia delante hasta extender los brazos y vuelve despacio hasta notar el estiramiento del pecho.',
    primary: [M_PECHO],
    secondary: [M_HOMBRO, M_TRICEPS],
  }),
  exercise({
    id: 90005,
    uuid: 'fb251a63-0d7a-4414-add9-7a23ac7c9de6',
    name: 'Press declinado en máquina',
    description:
      'Siéntate en la máquina de press declinado con la espalda apoyada y ajusta el asiento para que los agarres queden a la altura de la parte baja del pecho. Empuja hacia delante y hacia abajo hasta extender los brazos y vuelve controlando el peso.',
    primary: [M_PECHO],
    secondary: [M_TRICEPS],
  }),
  exercise({
    id: 90006,
    uuid: '8bc704c1-e973-4263-83c7-bbc20c7313ad',
    name: 'Press de pecho en polea de pie',
    description:
      'Coloca las dos poleas a la altura del pecho y ponte de espaldas a la máquina, con un pie adelantado. Con los codos a la altura de los hombros, empuja los agarres hacia delante hasta juntar las manos delante del pecho y vuelve despacio hasta notar el estiramiento.',
    primary: [M_PECHO],
    secondary: [M_HOMBRO, M_TRICEPS],
  }),
  exercise({
    id: 90007,
    uuid: 'db100f1b-84a0-4938-8dd1-b9083829457e',
    name: 'Pullover con barra',
    description:
      'Túmbate en un banco plano con la barra sujeta con los brazos estirados sobre el pecho y los codos ligeramente flexionados. Baja la barra en arco por detrás de la cabeza hasta notar el estiramiento del pecho y los dorsales, y vuelve por el mismo camino hasta encima del pecho.',
    primary: [M_PECHO, M_DORSALES],
    secondary: [M_SERRATO, M_TRICEPS],
    equipment: [BARRA, BANCO],
  }),
  exercise({
    id: 90008,
    uuid: 'c8c1eaf9-ef21-4271-8090-15949fc3fdfe',
    name: 'Press Svend con disco',
    description:
      'De pie, sujeta un disco entre las palmas de las manos a la altura del pecho, apretándolo con fuerza. Sin dejar de apretar, extiende los brazos hacia delante y vuelve al pecho. La clave es mantener la presión de las manos sobre el disco durante todo el movimiento.',
    primary: [M_PECHO],
    secondary: [M_HOMBRO],
  }),
  // --- Piernas ---
  exercise({
    id: 90009,
    uuid: '63cb8f57-9765-4584-8273-eadc01e5cf36',
    name: 'Sentadilla goblet',
    category: PIERNAS,
    description:
      'De pie con los pies algo más abiertos que la cadera, sujeta una mancuerna (o kettlebell) en vertical pegada al pecho. Baja en sentadilla manteniendo el pecho alto y los codos por dentro de las rodillas hasta que los muslos queden paralelos al suelo, y sube empujando con todo el pie.',
    primary: [M_CUADRICEPS, M_GLUTEOS],
    secondary: [M_ISQUIOS, M_ABDOMINALES],
    equipment: [MANCUERNA],
  }),
  exercise({
    id: 90010,
    uuid: 'cc03fcf2-b39a-4035-a0ce-a89ffd68993b',
    name: 'Peso muerto rumano en máquina Smith',
    category: PIERNAS,
    description:
      'De pie frente a la barra de la máquina Smith, agárrala al ancho de los hombros y desbloquéala. Con las rodillas ligeramente flexionadas, lleva la cadera hacia atrás bajando la barra pegada a las piernas hasta notar el estiramiento de los isquiotibiales, con la espalda recta. Sube empujando la cadera hacia delante.',
    primary: [M_ISQUIOS, M_GLUTEOS],
    secondary: [],
  }),
  exercise({
    id: 90011,
    uuid: '292efa90-707f-468c-b84c-104734185d9a',
    name: 'Curl nórdico',
    category: PIERNAS,
    description:
      'De rodillas sobre una esterilla con los talones sujetos (por un compañero, una máquina o una barra). Con el cuerpo recto de rodillas a cabeza, déjate caer hacia delante lo más lento posible frenando con los isquiotibiales. Apóyate con las manos al llegar abajo y vuelve a subir.',
    primary: [M_ISQUIOS],
    secondary: [M_GLUTEOS],
    equipment: [PESO_CORPORAL],
  }),
  exercise({
    id: 90012,
    uuid: 'f0908ee3-309b-4a14-b695-5286ac8e59b7',
    name: 'Hip thrust en máquina',
    category: PIERNAS,
    description:
      'Siéntate en la máquina de hip thrust con la parte alta de la espalda apoyada en el respaldo y el cinturón o rodillo sobre la cadera. Con los pies apoyados al ancho de la cadera, empuja la cadera hacia arriba hasta alinearla con el tronco, aprieta los glúteos arriba y baja controlando.',
    primary: [M_GLUTEOS],
    secondary: [M_ISQUIOS],
  }),
  exercise({
    id: 90013,
    uuid: '7ee8dda4-f00b-4c34-a526-cf385d452b94',
    name: 'Swing con kettlebell',
    category: PIERNAS,
    description:
      'De pie con los pies algo más abiertos que la cadera y la kettlebell delante. Agárrala, llévala hacia atrás entre las piernas flexionando la cadera con la espalda recta y, con un golpe de cadera explosivo, impúlsala hacia delante hasta la altura del pecho. Deja que caiga y encadena la siguiente repetición.',
    primary: [M_GLUTEOS, M_ISQUIOS],
    secondary: [M_ABDOMINALES],
    equipment: [KETTLEBELL],
  }),

  // --- Gemelos ---
  exercise({
    id: 90014,
    uuid: 'cb935efd-e8d1-4515-804f-e31c91f6f2d7',
    name: 'Elevación de gemelos en máquina Smith',
    category: GEMELOS,
    description:
      'Coloca un step o disco bajo la barra de la máquina Smith y apoya la punta de los pies en el borde, con la barra sobre los trapecios. Desbloquéala, baja los talones hasta notar el estiramiento de los gemelos y sube todo lo posible sobre la punta de los pies.',
    primary: [M_GEMELOS],
    secondary: [M_SOLEO],
  }),
  exercise({
    id: 90015,
    uuid: 'f2a0d28c-9b9c-41ad-8a18-b1328cd160a9',
    name: 'Elevación de gemelos de pie con mancuernas',
    category: GEMELOS,
    description:
      'De pie con una mancuerna en cada mano y la punta de los pies sobre un step o disco. Baja los talones hasta notar el estiramiento de los gemelos y sube todo lo posible sobre la punta de los pies, haciendo una pausa arriba.',
    primary: [M_GEMELOS],
    secondary: [M_SOLEO],
    equipment: [MANCUERNA],
  }),

  // --- Espalda ---
  exercise({
    id: 90016,
    uuid: '0ccac5b8-3e16-468d-a094-0be2fb44f501',
    name: 'Remo en máquina Smith',
    category: ESPALDA,
    description:
      'De pie frente a la barra de la máquina Smith, inclina el tronco hacia delante con la espalda recta y las rodillas algo flexionadas. Agarra la barra algo más abierto que los hombros, desbloquéala y llévala hacia el abdomen juntando los omóplatos. Bájala controlada hasta estirar los brazos.',
    primary: [M_DORSALES],
    secondary: [M_BICEPS, M_TRAPECIO],
  }),
  exercise({
    id: 90017,
    uuid: '2f8c0744-c552-4910-967c-e44ddc29e193',
    name: 'Remo alto en máquina',
    category: ESPALDA,
    description:
      'Siéntate en la máquina de remo alto (tipo Hammer) con las rodillas sujetas bajo los rodillos y agarra las asas por encima de la cabeza. Tira de ellas hacia abajo y hacia atrás llevando los codos pegados al cuerpo y juntando los omóplatos, y vuelve despacio hasta estirar los brazos.',
    primary: [M_DORSALES],
    secondary: [M_BICEPS, M_TRAPECIO],
  }),
  exercise({
    id: 90018,
    uuid: '104fcd8f-c7e9-4a25-a4d0-c2472b6e5e4a',
    name: 'Dominadas lastradas',
    category: ESPALDA,
    description:
      'Cuélgate un disco o una mancuerna del cinturón de lastre (o sujeta una mancuerna entre los pies) y agárrate a la barra con agarre prono algo más abierto que los hombros. Sube hasta pasar la barbilla por encima de la barra y baja controlado hasta estirar los brazos.',
    primary: [M_DORSALES],
    secondary: [M_BICEPS, M_TRAPECIO],
    equipment: [BARRA_DOMINADAS],
  }),

  // --- Hombros ---
  exercise({
    id: 90019,
    uuid: '094a4112-b15d-4433-a9a4-45db35e135ea',
    name: 'Encogimientos de hombros en máquina',
    category: HOMBROS,
    description:
      'Colócate en la máquina de encogimientos (o en la de gemelos de pie) con los hombros bajo las almohadillas o agarrando las asas con los brazos estirados. Sube los hombros hacia las orejas todo lo posible, aguanta un segundo arriba y baja despacio.',
    primary: [M_TRAPECIO],
  }),

  // --- Brazos ---
  exercise({
    id: 90020,
    uuid: '96f11291-510a-4a88-ac50-3019cb45d743',
    name: 'Curl de bíceps en máquina',
    category: BRAZOS,
    description:
      'Siéntate en la máquina de curl con la parte de atrás de los brazos bien apoyada en el cojín y ajusta el asiento para que los codos queden alineados con el eje de la máquina. Flexiona los codos hasta llevar los agarres a los hombros y baja despacio hasta casi estirar los brazos.',
    primary: [M_BICEPS],
    secondary: [M_BRAQUIAL],
  }),
  exercise({
    id: 90021,
    uuid: 'ef62b96c-1a4c-46cc-88b1-5b5a83a259cf',
    name: 'Curl martillo en polea con cuerda',
    category: BRAZOS,
    description:
      'De pie frente a una polea baja con la cuerda enganchada, agarra un extremo con cada mano con las palmas mirándose. Con los codos pegados al cuerpo, sube la cuerda hasta los hombros sin girar las muñecas y bájala controlada.',
    primary: [M_BICEPS, M_BRAQUIAL],
  }),
  exercise({
    id: 90022,
    uuid: '89eafe8f-4f84-4516-903d-e4fb85b73df7',
    name: 'Fondos en máquina',
    category: BRAZOS,
    description:
      'Siéntate en la máquina de fondos con la espalda apoyada y agarra las asas a los lados del cuerpo con los codos flexionados. Empuja hacia abajo hasta extender los brazos sin bloquear los codos y vuelve despacio hasta que los codos formen unos 90 grados.',
    primary: [M_TRICEPS],
    secondary: [M_PECHO, M_HOMBRO],
  }),

  // --- Abdominales ---
  exercise({
    id: 90023,
    uuid: '1631338d-deea-4d63-bff9-9bcd362ffd9c',
    name: 'Elevación de rodillas en paralelas (silla del capitán)',
    category: ABDOMINALES,
    description:
      'Apoya los antebrazos en los cojines de la silla del capitán (o sujétate en las paralelas) con la espalda pegada al respaldo y las piernas colgando. Sube las rodillas hacia el pecho redondeando un poco la parte baja de la espalda y baja despacio sin balancearte.',
    primary: [M_ABDOMINALES],
    equipment: [PESO_CORPORAL],
  }),

  // --- Cardio ---
  exercise({
    id: 90024,
    uuid: '3e2fd3fc-4ccd-4982-87ca-276aba05d573',
    name: 'Bicicleta reclinada',
    category: CARDIO,
    description:
      'Siéntate en la bicicleta reclinada con la espalda apoyada en el respaldo y ajusta el asiento para que la rodilla quede ligeramente flexionada con el pedal en el punto más lejano. Pedalea a ritmo constante ajustando la resistencia a la intensidad que busques.',
    primary: [M_CUADRICEPS],
    secondary: [M_GLUTEOS, M_GEMELOS],
  }),
  exercise({
    id: 90025,
    uuid: 'e9f659e7-2e09-46ab-a99d-ae7fb883cc55',
    name: 'Cuerdas de batalla',
    category: CARDIO,
    description:
      'De pie con las rodillas algo flexionadas, agarra un extremo de la cuerda con cada mano. Mueve los brazos arriba y abajo de forma alterna (o a la vez) para crear ondas en la cuerda, a ritmo rápido, durante el tiempo que marque la serie.',
    primary: [M_HOMBRO],
    secondary: [M_ABDOMINALES],
  }),
];

module.exports = { CUSTOM_EXERCISES };
