import React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import { HeartPulse } from 'lucide-react-native';
import { colors } from '../theme';

/**
 * Silueta de lámina de gimnasio con el músculo de la categoría resaltado.
 * Solo se dibuja la mitad izquierda (x < 30) de cada figura; la otra mitad
 * es la misma reflejada.
 */
const FRONT = {
  head: 'M30 1.5 C26.5 1.5 24.5 4.5 24.5 8 C24.5 11.5 26.8 14 30 14 Z',
  neck: 'M27 13 L30 14.5 L30 17.5 L25.5 17.5 C26.5 16 27 14.5 27 13 Z',
  delts:
    'M24 17.6 C18.5 17 14 19.5 13.2 25.5 C14 27.5 15.8 27.6 17 26 C17.6 22.5 19.8 20.2 23.4 19.4 Z',
  chest: 'M29.6 19 L24.2 19.2 C20.5 20 18.3 22.6 17.6 26.8 C19.5 30.6 24 32 29.6 31 Z',
  biceps:
    'M16.8 27.4 C14.6 28.4 12.8 29 12.3 32 C11.9 35 12.1 37.6 12.7 39.4 L16.6 39.4 C17.6 36 18 31.5 16.8 27.4 Z',
  forearms:
    'M12.6 40.4 L16.6 40.4 C16.5 45 15.6 49.6 14.2 53.6 L11.6 53.6 C10.6 49.6 10.9 44.6 12.6 40.4 Z',
  hand: 'M11.5 54.6 L14.3 54.6 C15 57 14.6 59.5 13 60.5 C11.4 59.5 10.9 57 11.5 54.6 Z',
  abs: 'M29.6 32.4 C27.6 32.8 25.8 33 24.6 33.2 C24.1 39 24.2 45 25.2 50.2 L29.6 52.4 Z',
  obliques:
    'M23.8 33 C21.6 32.6 19.6 31.8 18.2 31 C18 37 18.6 43.4 20.6 49 L24.4 50.2 C23.4 44.4 23.3 38.6 23.8 33 Z',
  hips: 'M20.6 50 L29.6 53.4 L29.6 57 C26.4 55.4 22.4 54.6 19.8 56 C19.9 53.8 20.1 51.8 20.6 50 Z',
  quads:
    'M29.2 57.6 C26.2 55.8 22.2 55.2 19.8 56.8 C18.4 63.6 18.8 72.2 20.6 78.4 L25.2 79.2 C27.4 74 28.8 66 29.2 57.6 Z',
  knee: 'M20.8 79.4 L25.2 80.2 C25.6 81.2 25.6 82.4 25.4 83 L20.8 82.6 C20.5 81.6 20.5 80.4 20.8 79.4 Z',
  shins: 'M20.6 83.6 L25.4 84 C25.6 89.6 24.9 95 24 98.6 L22 98.6 C20.6 94.6 20 88.8 20.6 83.6 Z',
  foot: 'M21.6 99.4 L24.2 99.4 C24.6 100.8 24.4 102 23.4 102.6 L19.8 102.6 C19.8 101.4 20.6 100.2 21.6 99.4 Z',
};

const BACK = {
  head: FRONT.head,
  neck: 'M27 13 L30 14.5 L30 16 C28.5 16.4 27 16.8 25.5 17.5 C26.5 16 27 14.5 27 13 Z',
  traps: 'M30 15.2 C28 16.6 25.4 17.6 22.2 18.6 C24.4 19.6 25.8 20.8 26.6 22.6 L30 34.6 Z',
  delts: FRONT.delts,
  lats: 'M25.9 22.6 C22.6 21.6 19.6 21.4 17.8 22.6 C17.4 28.6 18.8 36.4 22.6 43.2 L29.6 46.4 L29.6 36.2 Z',
  triceps: FRONT.biceps,
  forearms: FRONT.forearms,
  hand: FRONT.hand,
  lowerBack: 'M22.6 44.2 L29.6 47.4 L29.6 51.6 L21.2 51 C21.2 48.6 21.8 46.2 22.6 44.2 Z',
  glutes: 'M29.6 52.6 L21 52 C19.2 55.2 19.2 59.4 20.4 62.4 C23.8 64.2 27.4 63.6 29.6 61.2 Z',
  hamstrings:
    'M20.4 63.4 C18.8 69.4 19.4 75.2 20.8 79.4 L25.2 80.2 C27.4 75.2 28.8 69.2 29.2 62.4 C26.8 64.4 23.4 64.8 20.4 63.4 Z',
  knee: FRONT.knee,
  calves:
    'M20.6 83.6 L25.4 84 C26.4 87.2 26.2 91 24.6 94.2 L21.6 94.2 C19.8 91 19.6 86.8 20.6 83.6 Z',
  ankle: 'M21.8 95 L24.4 95 C24.4 96.4 24.2 97.6 24 98.6 L22 98.6 C21.8 97.4 21.7 96.2 21.8 95 Z',
  foot: FRONT.foot,
};

type Figure = Record<string, string>;

/** Categoría del catálogo -> figura y músculos que se resaltan. */
const MUSCLES: Record<string, { figure: Figure; highlight: string[] }> = {
  Pecho: { figure: FRONT, highlight: ['chest'] },
  Hombros: { figure: FRONT, highlight: ['delts'] },
  Bíceps: { figure: FRONT, highlight: ['biceps'] },
  Antebrazos: { figure: FRONT, highlight: ['forearms'] },
  Abdominales: { figure: FRONT, highlight: ['abs', 'obliques'] },
  Cuádriceps: { figure: FRONT, highlight: ['quads'] },
  Espalda: { figure: BACK, highlight: ['traps', 'lats'] },
  Tríceps: { figure: BACK, highlight: ['triceps'] },
  Glúteos: { figure: BACK, highlight: ['glutes'] },
  Femoral: { figure: BACK, highlight: ['hamstrings'] },
  Gemelos: { figure: BACK, highlight: ['calves'] },
};

const MIRROR = 'matrix(-1 0 0 1 60 0)';

/**
 * Icono de una categoría de ejercicios. `size` es el alto (la figura mide la
 * mitad de ancho). `active` lo adapta al fondo amarillo del chip marcado.
 * Cardio no es un músculo: lleva el corazón de Lucide. Si la categoría no
 * tiene icono no pinta nada.
 */
export function CategoryIcon({
  category,
  size = 26,
  active = false,
}: {
  category: string;
  size?: number;
  active?: boolean;
}) {
  if (category === 'Cardio') {
    return (
      <HeartPulse
        size={size * 0.7}
        color={active ? colors.onAccent : colors.accent}
        strokeWidth={2.2}
      />
    );
  }

  const muscles = MUSCLES[category];
  if (!muscles) return null;

  const highlight = active ? colors.onAccent : colors.accent;
  const base = active ? 'rgba(16, 17, 20, 0.28)' : colors.surfaceHigh;
  const gap = active ? colors.accent : colors.surfaceAlt;
  const paths = Object.entries(muscles.figure).map(([part, d]) => (
    <Path
      key={part}
      d={d}
      fill={muscles.highlight.includes(part) ? highlight : base}
      stroke={gap}
      strokeWidth={0.7}
      strokeLinejoin="round"
    />
  ));

  return (
    <Svg width={size / 2} height={size} viewBox="5 0 50 104">
      <G>{paths}</G>
      <G transform={MIRROR}>{paths}</G>
    </Svg>
  );
}

export function hasCategoryIcon(category: string): boolean {
  return category === 'Cardio' || category in MUSCLES;
}
