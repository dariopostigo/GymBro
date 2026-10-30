import { BODY_PARTS } from '../src/data/bodyPaths';
import { CATEGORIES } from '../src/data/exerciseCatalog';
import type { WorkoutSession } from '../src/types/session';
import {
  CATEGORY_PARTS,
  musclesWorked,
  startOfWeek,
  weeklyMuscleSets,
} from '../src/utils/muscleMap';

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

/** Sesión del día `date` (local) con `count` series de cada ejercicio. */
function session(date: Date, exercises: number[], count = 1): WorkoutSession {
  return {
    id: date.toISOString(),
    date: date.toISOString(),
    splitId: 'ppl',
    splitDayId: 'd',
    dayName: 'Día',
    completed: true,
    sets: exercises.flatMap((exerciseId, i) =>
      Array.from({ length: count }, (_, n) => ({
        id: `${i}-${n}`,
        exerciseId,
        positionInSession: i + 1,
        setNumber: n + 1,
        weight: 50,
        reps: 10,
      })),
    ),
  };
}

describe('weeklyMuscleSets', () => {
  const THURSDAY = new Date(2026, 9, 29, 18); // jueves 29/10/2026
  const CURL = 1109; // Bíceps concentrado: bíceps y braquial como principales
  const byGroup = (sessions: WorkoutSession[]) =>
    Object.fromEntries(weeklyMuscleSets(sessions, THURSDAY).map(r => [r.group, r]));

  it('la semana empieza el lunes', () => {
    expect(startOfWeek(THURSDAY)).toEqual(new Date(2026, 9, 26));
  });

  it('cuenta 1 por serie en los principales y 0,5 en los secundarios', () => {
    const week = byGroup([session(new Date(2026, 9, 27, 18), [BENCH], 4)]);
    expect(week.Pecho.sets).toBe(4);
    expect(week.Tríceps.sets).toBe(2);
    expect(week.Hombros.sets).toBe(2);
    expect(week.Espalda.sets).toBe(0);
  });

  it('dos principales del mismo grupo suman una sola serie', () => {
    expect(byGroup([session(new Date(2026, 9, 27, 18), [CURL], 3)]).Bíceps.sets).toBe(3);
  });

  it('separa esta semana de la anterior y no cuenta las de antes', () => {
    const week = byGroup([
      session(new Date(2026, 9, 26, 0, 30), [BENCH], 3), // lunes de esta semana
      session(new Date(2026, 9, 25, 23, 30), [BENCH], 5), // domingo anterior
      session(new Date(2026, 9, 12, 18), [BENCH], 7), // hace dos semanas
    ]);
    expect(week.Pecho.sets).toBe(3);
    expect(week.Pecho.previous).toBe(5);
  });
});

