/**
 * @format
 */

import { EXERCISES } from '../src/data/exerciseCatalog';
import { getExerciseImageSources } from '../src/utils/exerciseImages';

const { FREE_DB_IMAGES, SIN_EQUIVALENTE } = require('../scripts/exerciseImagesFree');

/**
 * Las fotos del catálogo se pierden solas: `fetch:exercises` reescribe
 * exercises.json entero, y hasta que existió scripts/exerciseImagesFree.js las
 * que se metían a mano desaparecían en la siguiente descarga. Estos tests fijan
 * el resultado para que esa regresión se vea aquí y no en el móvil.
 */
describe('imágenes del catálogo', () => {
  it('deja sin foto solo a los ejercicios revisados uno a uno', () => {
    const revisados = new Set<number>(SIN_EQUIVALENTE);
    const sinFoto = EXERCISES.filter(e => getExerciseImageSources(e).length === 0);

    expect(sinFoto.filter(e => !revisados.has(e.id)).map(e => `${e.id} ${e.name}`)).toEqual([]);
  });

  it('mantiene al menos el 90% del catálogo ilustrado', () => {
    const conFoto = EXERCISES.filter(e => getExerciseImageSources(e).length > 0);

    expect(conFoto.length / EXERCISES.length).toBeGreaterThanOrEqual(0.9);
  });

  it('no deja en el mapa ids que ya no estén en el catálogo', () => {
    const ids = new Set(EXERCISES.map(e => e.id));
    const huerfanos = [...Object.keys(FREE_DB_IMAGES).map(Number), ...SIN_EQUIVALENTE].filter(
      (id: number) => !ids.has(id),
    );

    expect(huerfanos).toEqual([]);
  });
});
