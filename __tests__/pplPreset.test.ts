/**
 * @format
 */

import { SPLIT_PRESETS } from '../src/data/splitPresets';
import { getExerciseById } from '../src/data/exerciseCatalog';

/**
 * La rutina PPL de referencia (la hoja de entrenamiento original), escrita con
 * los nombres reales del catálogo. Si un id apunta a otro ejercicio, salta aquí.
 */
const PPL_ROUTINE: Record<string, [string, string][]> = {
  'Push 1': [
    ['Press de Banca', '3x8-12'],
    ['Press inclinado con mancuernas', '3x8-12'],
    ['Aperturas con Mancuernas', '3x8-12'],
    ['Elevación lateral con mancuernas', '3x8-12'],
    ['Extensiones de tríceps con cuerda en polea', '3x8-20'],
    ['Extensión de tríceps sobre la cabeza (mancuerna)', '3x8-20'],
  ],
  'Pull 1': [
    ['Jalón al pecho', '4x8-12'],
    ['Remo con mancuernas', '3x8-12'],
    ['Dominadas con Agarre Supino', '3x8-12'],
    ['Encogimientos de hombros con mancuernas', '3x8-20'],
    ['Curl inclinado con mancuernas', '3x8-12'],
    ['Curl alterno de martillo con mancuernas', '3x8-12'],
    ['Curl en banco Scott', '2x8-12'],
    ['Face pull inclinado con mancuernas', '4x8-20'],
  ],
  'Legs 1': [
    ['Sentadillas Hack', '4x8-12'],
    ['Zancadas Caminando con Mancuernas', '4x8-12'],
    ['Peso muerto rumano con mancuernas', '4x8-12'],
    ['Hip thrust con barra', '4x8-12'],
    ['Elevación de talón de pie', '4x8-20'],
    ['Crunches negativos', '4x8-20'],
  ],
  'Push 2': [
    ['Press de Banca', '3x8-12'],
    ['Cruce de Poleas para Pecho', '3x8-12'],
    ['Fondos en Paralelas', '3x8-12'],
    ['Press Francés con Barra SZ', '4x8-12'],
    ['Press militar', '3x8-12'],
    ['Elevación lateral con mancuernas', '3x8-12'],
  ],
  'Pull 2': [
    ['T-Bar row', '4x8-12'],
    ['Remo Gironda', '3x8-12'],
    ['Jalón al pecho a un brazo', '3x8-12'],
    ['Encogimientos de hombros con mancuernas', '4x8-20'],
    ['Curl en banco Scott', '3x8-12'],
    ['Curl alterno de martillo con mancuernas', '3x8-12'],
    ['Pájaro de pie', '4x8-20'],
  ],
  'Legs 2': [
    ['Sentadilla búlgara con mancuernas', '3x8-12'],
    ['Hip thrust con barra', '3x8-12'],
    ['Curl femoral', '4x8-12'],
    ['Prensa de piernas', '4x8-12'],
    ['Elevación de talón de pie', '4x8-20'],
    ['Crunches negativos', '4x8-20'],
  ],
};

const ppl = SPLIT_PRESETS.find(split => split.id === 'ppl');

test('el split por defecto es el PPL de 6 días', () => {
  expect(ppl).toBeDefined();
  expect(SPLIT_PRESETS[0].id).toBe('ppl');
  expect(ppl!.days.map(day => day.name)).toEqual(Object.keys(PPL_ROUTINE));
});

test('cada día del PPL reproduce la rutina original', () => {
  for (const day of ppl!.days) {
    const actual = [...day.exercises]
      .sort((a, b) => a.order - b.order)
      .map(exerciseSlot => [
        getExerciseById(exerciseSlot.exerciseId)?.name ?? `#${exerciseSlot.exerciseId} no existe`,
        `${exerciseSlot.targetSets}x${exerciseSlot.targetRepsMin}-${exerciseSlot.targetRepsMax}`,
      ]);
    expect([day.name, actual]).toEqual([day.name, PPL_ROUTINE[day.name]]);
  }
});

test('todos los presets apuntan a ejercicios que existen en el catálogo', () => {
  const missing = SPLIT_PRESETS.flatMap(split =>
    split.days.flatMap(day =>
      day.exercises
        .filter(exerciseSlot => !getExerciseById(exerciseSlot.exerciseId))
        .map(exerciseSlot => `${split.name} · ${day.name} · #${exerciseSlot.exerciseId}`),
    ),
  );
  expect(missing).toEqual([]);
});
