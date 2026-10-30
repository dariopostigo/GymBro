import { BODY_PARTS } from '../src/data/bodyPaths';
import { CATEGORIES } from '../src/data/exerciseCatalog';
import { CATEGORY_PARTS, musclesWorked } from '../src/utils/muscleMap';

const BENCH = 73; // Press de banca con barra: pecho; secundarios hombro y tríceps
const ROW = 81; // Remo con mancuernas: dorsales

describe('musclesWorked', () => {
  it('enciende los músculos principales y, aparte, los secundarios', () => {
    const levels = musclesWorked([BENCH]);
    expect(levels.get('chest')).toBe('primary');
    expect(levels.get('triceps')).toBe('secondary');
  });

  it('lo principal de un ejercicio manda sobre lo secundario de otro', () => {
    const levels = musclesWorked([ROW, BENCH]);
    expect(levels.get('upperBack')).toBe('primary');
    expect(levels.get('chest')).toBe('primary');
  });

  it('ignora ids que no están en el catálogo', () => {
    expect(musclesWorked([999999]).size).toBe(0);
  });
});

describe('iconos de categoría', () => {
  it('todas las categorías menos Cardio tienen silueta, y sus partes existen', () => {
    const slugs = {
      front: new Set(BODY_PARTS.front.map(p => p.slug)),
      back: new Set(BODY_PARTS.back.map(p => p.slug)),
    };
    for (const category of CATEGORIES.filter(c => c !== 'Cardio')) {
      const spec = CATEGORY_PARTS[category];
      expect(spec).toBeDefined();
      for (const part of spec.parts) expect(slugs[spec.side].has(part)).toBe(true);
    }
  });
});
