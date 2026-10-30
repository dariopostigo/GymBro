import { getExerciseById } from '../src/data/exerciseCatalog';
import { DEFAULT_PLATES, barTypeFor, plateLoad } from '../src/utils/plates';

describe('plateLoad', () => {
  test('discos por lado con los menos posibles', () => {
    expect(plateLoad(82.5, 20, DEFAULT_PLATES)).toEqual({ perSide: [25, 5, 1.25], exact: true });
    expect(plateLoad(100, 20, DEFAULT_PLATES)).toEqual({ perSide: [25, 15], exact: true });
  });

  test('la barra sola, o menos que la barra', () => {
    expect(plateLoad(20, 20, DEFAULT_PLATES)).toEqual({ perSide: [], exact: true });
    expect(plateLoad(15, 20, DEFAULT_PLATES)).toBeUndefined();
  });

  test('si no sale exacto da los totales más cercanos', () => {
    expect(plateLoad(83, 20, DEFAULT_PLATES)).toEqual({
      perSide: [],
      exact: false,
      lower: 82.5,
      upper: 85,
    });
  });

  test('sin discos pequeños, sube de 5 en 5', () => {
    const plates = [20, 10, 5];
    expect(plateLoad(62.5, 20, plates)).toMatchObject({ exact: false, lower: 60, upper: 70 });
  });

  test('no se fía de ir del más grande al más pequeño', () => {
    // Con 20 y 15, 30 por lado son dos de 15 (empezar por el de 20 deja 10, que no sale).
    expect(plateLoad(60, 0, [20, 15])).toEqual({ perSide: [15, 15], exact: true });
  });

  test('máquinas de discos: sin barra', () => {
    expect(plateLoad(90, 0, DEFAULT_PLATES)).toEqual({ perSide: [25, 20], exact: true });
  });
});

describe('barTypeFor', () => {
  const type = (id: number) => barTypeFor(getExerciseById(id));

  test('reconoce cada carga', () => {
    expect(type(73)).toBe('olympic'); // Press de banca con barra
    expect(type(184)).toBe('olympic'); // Peso muerto convencional
    expect(type(418)).toBe('olympic'); // Press militar
    expect(type(246)).toBe('ez'); // Press francés con barra Z
    expect(type(90001)).toBe('smith'); // Press de banca en máquina Smith
    expect(type(129)).toBe('machine'); // Press de pecho en máquina de discos
    expect(type(371)).toBe('machine'); // Prensa de piernas
  });

  test('sin discos: mancuernas, poleas aunque sean "con barra", máquinas de placas', () => {
    expect(type(75)).toBeUndefined(); // Press de banca con mancuernas
    expect(type(660)).toBeUndefined(); // Extensiones de tríceps en polea con barra
    expect(type(695)).toBeUndefined(); // Jalón con barra en V
    expect(type(1725)).toBeUndefined(); // Remo sentado en máquina de placas
    expect(type(979)).toBeUndefined(); // Elevaciones de piernas en barra
  });
});
