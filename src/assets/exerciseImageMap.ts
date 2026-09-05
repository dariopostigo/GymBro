import type { ImageSourcePropType } from 'react-native';

/**
 * Imágenes locales por ejercicio, indexadas por `uuid`.
 * Metro necesita rutas literales en `require`, así que cada imagen colocada
 * a mano en `src/assets/exercises/<uuid>/` se registra aquí una a una.
 *
 * Ejemplo:
 * '0305d98e-0887-4c0c-8992-7c220814efc2': [require('./exercises/0305d98e-0887-4c0c-8992-7c220814efc2/1.jpg')],
 */
export const EXERCISE_IMAGE_MAP: Record<string, ImageSourcePropType[]> = {
  '17593b54-1e4e-49d7-8f9f-3a706823a4c5': [require('./exercises-local/17593b54-1e4e-49d7-8f9f-3a706823a4c5/1.png')], // Puente con propio peso
  '48ee1385-47c5-4821-8b6a-57fac6130776': [require('./exercises-local/48ee1385-47c5-4821-8b6a-57fac6130776/1.png')], // Burpees
  '401989e0-64c3-459d-bc47-2c171ab4f41d': [require('./exercises-local/401989e0-64c3-459d-bc47-2c171ab4f41d/1.png')], // Abdominales en Máquina
  'dda69c96-62d4-4690-aa07-a4a0f6ceb63a': [require('./exercises-local/dda69c96-62d4-4690-aa07-a4a0f6ceb63a/1.png')], // Press de Banca Declinado con Mancuernas
  '43e85cb8-51d0-4892-b1bf-80a3cb111ff6': [require('./exercises-local/43e85cb8-51d0-4892-b1bf-80a3cb111ff6/1.png')], // Curl Inclinado con Mancuernas
  '17dd0986-5248-410d-89a4-9268282d103b': [require('./exercises-local/17dd0986-5248-410d-89a4-9268282d103b/1.png')], // Patadas traseras
  '55b9d286-c4cc-4a29-97ad-58cb13c2bb7e': [require('./exercises-local/55b9d286-c4cc-4a29-97ad-58cb13c2bb7e/1.png')], // Jalón con agarre ancho
  '9ccd53e0-8392-4e61-91aa-e4e5f4ea339c': [require('./exercises-local/9ccd53e0-8392-4e61-91aa-e4e5f4ea339c/1.png')], // Pullover
  '2e7ffff9-e603-4b28-98c8-31d1a6ce8cd9': [require('./exercises-local/2e7ffff9-e603-4b28-98c8-31d1a6ce8cd9/1.png')], // Peso muerto rumano con barra
  '6f79b381-98a4-40d5-8a45-3bb0558be6fe': [require('./exercises-local/6f79b381-98a4-40d5-8a45-3bb0558be6fe/1.png')], // Elevaciones Posteriores
  'a2f5b6ef-b780-49c0-8d96-fdaff23e27ce': [require('./exercises-local/a2f5b6ef-b780-49c0-8d96-fdaff23e27ce/1.png')], // Sentadillas
  '117df66c-bc8d-43cc-9903-0be2a0864486': [require('./exercises-local/117df66c-bc8d-43cc-9903-0be2a0864486/1.png')], // Press Banca Sentado
  '2ac901e6-f0c2-416f-998f-e01e00fe0aa1': [require('./exercises-local/2ac901e6-f0c2-416f-998f-e01e00fe0aa1/1.png')], // Crunch abdominal
  'c5015ed9-042b-42d3-9dac-13759ea9571e': [require('./exercises-local/c5015ed9-042b-42d3-9dac-13759ea9571e/1.png')], // Caminata lateral
  'f9a0a918-3c0c-464e-bbba-1bd309d4a519': [require('./exercises-local/f9a0a918-3c0c-464e-bbba-1bd309d4a519/1.png')], // Zancada con el peso corporal
  'dd9dcfd2-879f-422a-ad06-d2c187c58d1f': [require('./exercises-local/dd9dcfd2-879f-422a-ad06-d2c187c58d1f/1.png')], // Plancha frontal
  '2cd5e3c6-a8c0-456a-ab47-5e7b3a435407': [require('./exercises-local/2cd5e3c6-a8c0-456a-ab47-5e7b3a435407/1.png')], // Curl invertido
  '046fce45-69f2-46f7-a5b6-79a25a485af1': [require('./exercises-local/046fce45-69f2-46f7-a5b6-79a25a485af1/1.png')], // Extensión de Cuádriceps a una Pierna
  '3f8ad988-1aee-48ca-ad37-44e39ae1715d': [require('./exercises-local/3f8ad988-1aee-48ca-ad37-44e39ae1715d/1.png')], // Sentadilla en pared
  '6ce25688-ae91-4dc7-9b17-0b66a47151fa': [require('./exercises-local/6ce25688-ae91-4dc7-9b17-0b66a47151fa/1.png')], // Remo con barra (agarre prono)
  '957ca37c-b6d7-4c30-8ba9-9512b0fa2659': [require('./exercises-local/957ca37c-b6d7-4c30-8ba9-9512b0fa2659/1.png')], // Peso muerto rumano a una pierna
  'ac00021c-12f9-4827-8003-ea07de980b76': [require('./exercises-local/ac00021c-12f9-4827-8003-ea07de980b76/1.png')], // Cruce de poleas omni
  'f8d69dd4-3c35-49c7-8cbe-f0132eca4c52': [require('./exercises-local/f8d69dd4-3c35-49c7-8cbe-f0132eca4c52/1.png')], // Extensión de Tríceps a una Mano en Polea (simplyfitness: Extensión de tríceps con cable a una mano)
  'c9de4551-f1bc-4490-98f4-c9f87c2a2cac': [require('./exercises-local/c9de4551-f1bc-4490-98f4-c9f87c2a2cac/1.png')], // Jalón al pecho con agarre ancho (simplyfitness: Jalón con agarre ancho)
  'c146fa3c-35a4-4e6e-9000-e12a9ee19cbd': [require('./exercises-local/c146fa3c-35a4-4e6e-9000-e12a9ee19cbd/1.png')], // Elevación lateral y frontal con mancuernas (simplyfitness: Elevación frontal con mancuernas)
  'b144ac00-ec0c-4c43-898f-b2ac65048d98': [require('./exercises-local/b144ac00-ec0c-4c43-898f-b2ac65048d98/1.png')], // Abducción de cadera sentado (simplyfitness: Abducción de cadera con máquina de abducción de cadera)
  '0f5fc602-afb6-4500-87da-f115f3ef3f47': [require('./exercises-local/0f5fc602-afb6-4500-87da-f115f3ef3f47/1.png')], // Jalón con brazos rectos (agarre de barra) (simplyfitness: Jalón dorsal con brazos rectos)
  'd8ec22e5-8575-483f-bd66-5203fd4bfe84': [require('./exercises-local/d8ec22e5-8575-483f-bd66-5203fd4bfe84/1.png')], // Remo pesado a una mano (simplyfitness: Remo con mancuerna a una mano)
  '5aee8ae1-2752-4868-af62-e3c79954d811': [require('./exercises-local/5aee8ae1-2752-4868-af62-e3c79954d811/1.png')], // Press de tríceps en polea (simplyfitness: Extensión de tríceps en polea)
  '44afe80f-1ab2-4149-adbf-d8e0ece990ce': [require('./exercises-local/44afe80f-1ab2-4149-adbf-d8e0ece990ce/1.png')], // Sentadilla búlgara derecha (simplyfitness: Sentadilla búlgara con barra)
  '72129e4f-df97-4869-9561-33a1ba3c9186': [require('./exercises-local/72129e4f-df97-4869-9561-33a1ba3c9186/1.png')], // Peso muerto rumano con barra (RDL) (simplyfitness: Peso muerto rumano (piernas rectas) con barra)
  'abd2854b-114a-4584-8746-30bd40127863': [require('./exercises-local/abd2854b-114a-4584-8746-30bd40127863/1.png')], // Press de banca con pines (barra) (simplyfitness: Press de banca con barra)
  '8a356e9a-0058-4f60-b8d7-89147c3c371f': [require('./exercises-local/8a356e9a-0058-4f60-b8d7-89147c3c371f/1.png')], // Extensiones de tríceps tumbado (simplyfitness: Extensión de tríceps tumbado)
  '4b7cb037-0789-4014-ab6f-a451716b7538': [require('./exercises-local/4b7cb037-0789-4014-ab6f-a451716b7538/1.png')], // Remo maquina abierto (simplyfitness: Remo en máquina)
  'e7a964cd-e68e-4926-bc7c-577065137e18': [require('./exercises-local/e7a964cd-e68e-4926-bc7c-577065137e18/1.png')], // Peso Muerto con Déficit (simplyfitness: Peso muerto con barra)
  '64b50772-c73d-4833-8518-947a648fa623': [require('./exercises-local/64b50772-c73d-4833-8518-947a648fa623/1.png')], // Encogimiento Silverback con barra (simplyfitness: Encogimiento de hombros con barra)
  'd015a276-02ad-4c28-9d36-aedfbb431f53': [require('./exercises-local/d015a276-02ad-4c28-9d36-aedfbb431f53/1.png')], // Abducción de pie (simplyfitness: Abducción con polea)
  'f38e9c23-031d-44d0-ac27-7f1026212c73': [require('./exercises-local/f38e9c23-031d-44d0-ac27-7f1026212c73/1.png')], // Abdominales (simplyfitness: Abdominales en máquina)
  '6441ff9e-037e-48d9-8800-67b430dc8e37': [require('./exercises-local/6441ff9e-037e-48d9-8800-67b430dc8e37/1.png')], // Press de banca con pausa (simplyfitness: Press de banca con mancuernas)
  '99846da5-5dc8-4de1-ba55-ae2b4c03c30d': [require('./exercises-local/99846da5-5dc8-4de1-ba55-ae2b4c03c30d/1.png')], // Curl con mancuerna (simplyfitness: Curl concentrado con mancuerna)
  '3c2b5e2d-bd9d-43e8-8b5f-e6363331faa1': [require('./exercises-local/3c2b5e2d-bd9d-43e8-8b5f-e6363331faa1/1.png')], // Remo con barra (agarre supino) (simplyfitness: Remo inclinado con barra con agarre supinado)
  'd551f24d-44fe-4761-9448-edf14d627827': [require('./exercises-local/d551f24d-44fe-4761-9448-edf14d627827/1.png')], // Plancha a Flexión (simplyfitness: Plancha)
  'db4eaf0f-f4d4-4e63-b9fb-258985bc2858': [require('./exercises-local/db4eaf0f-f4d4-4e63-b9fb-258985bc2858/1.png')], // Elevación de gemelos, pierna izquierda (simplyfitness: Elevación de gemelos sentado)
  '30ac081b-fb79-4253-9457-8efc07568790': [require('./exercises-local/30ac081b-fb79-4253-9457-8efc07568790/1.png')], // Sentadilla con salto (squat thrust) (simplyfitness: Sentadilla con salto)
  '141bc870-56be-4749-a3b9-e56d5d5618b4': [require('./exercises-local/141bc870-56be-4749-a3b9-e56d5d5618b4/1.png')], // Press de hombros en multipower (simplyfitness: Press de hombros en máquina Smith)
  'f636ae1c-f678-48fe-96b3-1a9ae81f43ce': [require('./exercises-local/f636ae1c-f678-48fe-96b3-1a9ae81f43ce/1.png')], // Puente caminante (simplyfitness: Puente con bandas)
  '8b311259-4f67-4dbf-9574-8c38faa92160': [require('./exercises-local/8b311259-4f67-4dbf-9574-8c38faa92160/1.png')], // Kettlebell Swings (simplyfitness: Columpios con kettlebell)
  '2f7149c3-77ce-4313-a59c-aef82b5a730a': [require('./exercises-local/2f7149c3-77ce-4313-a59c-aef82b5a730a/1.png')], // Jalón con brazos rectos (agarre de cuerda) (simplyfitness: Jalón en polea con cuerda)
  '6b127132-cc0b-4b40-ac8c-177a28ccb6e2': [require('./exercises-local/6b127132-cc0b-4b40-ac8c-177a28ccb6e2/1.png')], // Puente de cadera (simplyfitness: Elevaciones de cadera con barra)
  '96f9d74a-7bf4-4ec1-9cd6-c62c13cf7b67': [require('./exercises-local/96f9d74a-7bf4-4ec1-9cd6-c62c13cf7b67/1.png')], // Sentadilla con pines (simplyfitness: Sentadilla)
  '1d610575-eed0-42cf-8737-29788a372af6': [require('./exercises-local/1d610575-eed0-42cf-8737-29788a372af6/1.png')], // Sentadillas Hindúes (simplyfitness: Sentadillas con propio peso)
  '5f514f9e-6bd9-408e-85b2-c25eb04af33b': [require('./exercises-local/5f514f9e-6bd9-408e-85b2-c25eb04af33b/1.png')], // Elevaciones de piernas de pie (simplyfitness: Elevaciones de rodilla)
  'c2078aac-e4e2-4103-a845-6252a3eb795e': [require('./exercises-local/c2078aac-e4e2-4103-a845-6252a3eb795e/1.png')], // Levantamiento de piernas (simplyfitness: Levantamiento de pierna acostado de lado)
  '541941e0-0fa5-4474-a382-9baf04948f8d': [require('./exercises-local/541941e0-0fa5-4474-a382-9baf04948f8d/1.png')], // Elevación de cadera tumbado (simplyfitness: Elevaciones de cadera con maquina Smith)
};
