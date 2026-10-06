/**
 * @format
 */

import { EXERCISES } from '../src/data/exerciseCatalog';
import { searchExercises } from '../src/utils/exerciseSearch';

const names = (list: { name: string }[]) => list.map(e => e.name);

describe('searchExercises', () => {
  it('ignora tildes y mayúsculas', () => {
    const result = searchExercises(EXERCISES, { search: 'press MAQUINA smith', category: null, favoriteIds: new Set() });

    expect(names(result)).toContain('Press de banca en máquina Smith');
  });

  it('encuentra con tildes aunque el nombre no las lleve y al revés', () => {
    const conTilde = searchExercises(EXERCISES, { search: 'máquína SMÍTH', category: null, favoriteIds: new Set() });
    const ñ = searchExercises(EXERCISES, { search: 'muneca', category: null, favoriteIds: new Set() });

    expect(names(conTilde)).toContain('Press de banca en máquina Smith');
    expect(names(ñ)).toContain('Curl de muñeca con barra (agarre supino)');
  });

  it('ignora guiones, paréntesis y otros signos', () => {
    const search = (text: string) => names(searchExercises(EXERCISES, { search: text, category: null, favoriteIds: new Set() }));

    expect(search('perro pajaro')).toContain('Perro-pájaro');
    expect(search('piernas colgado')).toContain('Elevaciones de piernas (colgado)');
    expect(search('comba estandar')).toContain('Saltar a la comba – estándar');
    expect(search('laterales 45º')).toContain('Elevaciones laterales a 45°');
  });

  it('encuentra la máquina Smith buscando "multipower"', () => {
    const result = searchExercises(EXERCISES, { search: 'sentadilla multipower', category: null, favoriteIds: new Set() });

    expect(names(result)).toContain('Sentadilla en máquina Smith');
  });

  it('pone los favoritos delante sin perder el resto', () => {
    const all = searchExercises(EXERCISES, { search: '', category: 'Pecho', favoriteIds: new Set() });
    const last = all[all.length - 1];

    const result = searchExercises(EXERCISES, { search: '', category: 'Pecho', favoriteIds: new Set([last.id]) });

    expect(result[0].id).toBe(last.id);
    expect(result).toHaveLength(all.length);
  });

  it('no saca favoritos que no coinciden con la búsqueda', () => {
    const fondos = EXERCISES.find(e => e.name === 'Fondos en paralelas')!;

    const result = searchExercises(EXERCISES, { search: 'aperturas', category: null, favoriteIds: new Set([fondos.id]) });

    expect(result.some(e => e.id === fondos.id)).toBe(false);
  });
});
