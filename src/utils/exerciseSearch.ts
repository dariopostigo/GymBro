import type { Exercise } from '../types/exercise';

/**
 * Tabla explícita de tildes: no nos fiamos de `String.normalize`, que en
 * Hermes puede no estar disponible y dejaría el texto sin cambiar.
 */
const ACCENTS: Record<string, string> = {
  á: 'a', à: 'a', ä: 'a', â: 'a', ã: 'a',
  é: 'e', è: 'e', ë: 'e', ê: 'e',
  í: 'i', ì: 'i', ï: 'i', î: 'i',
  ó: 'o', ò: 'o', ö: 'o', ô: 'o', õ: 'o',
  ú: 'u', ù: 'u', ü: 'u', û: 'u',
  ñ: 'n', ç: 'c',
};

/**
 * Sin tildes, mayúsculas ni signos: "maquina" encuentra "Máquina" y
 * "perro pajaro" encuentra "Perro-pájaro".
 */
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '') // tildes sueltas (texto ya descompuesto)
    .replace(/[^\u0000-\u007f]/g, c => ACCENTS[c] ?? c)
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** En el catálogo todo se llama "máquina Smith", pero en el gimnasio se dice multipower. */
const SYNONYMS: Record<string, string> = { multipower: 'smith' };

/**
 * Filtra por categoría y por palabras del nombre (en cualquier orden), y
 * pone los favoritos delante. Dentro de cada grupo se respeta el orden del
 * catálogo (categoría y nombre).
 */
export function searchExercises(
  exercises: Exercise[],
  { search, category, favoriteIds }: { search: string; category: string | null; favoriteIds: ReadonlySet<number> },
): Exercise[] {
  const queryWords = normalize(search.trim())
    .split(/\s+/)
    .filter(Boolean)
    .map(word => SYNONYMS[word] ?? word);
  const matches = exercises.filter(e => {
    if (category && e.category.name !== category) return false;
    const name = normalize(e.name);
    return queryWords.every(word => name.includes(word));
  });
  return [
    ...matches.filter(e => favoriteIds.has(e.id)),
    ...matches.filter(e => !favoriteIds.has(e.id)),
  ];
}
