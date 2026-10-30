import React from 'react';
import { HeartPulse } from 'lucide-react-native';
import { BodyFigure, type BodyPalette } from './BodyFigure';
import { CATEGORY_PARTS, type MuscleLevel } from '../utils/muscleMap';
import { colors } from '../theme';

/** Partes encendidas de cada categoría, creadas una vez para que BodyFigure no se repinte. */
const CATEGORY_LEVELS = new Map(
  Object.entries(CATEGORY_PARTS).map(([category, { parts }]) => [
    category,
    new Map<string, MuscleLevel>(parts.map(part => [part, 'primary'])),
  ]),
);

const PALETTE: BodyPalette = {
  base: 'rgba(255, 255, 255, 0.16)',
  primary: colors.accent,
  secondary: colors.accentDim,
};

// En el chip marcado el fondo es amarillo: el músculo pasa a oscuro para seguir viéndose.
const ACTIVE_PALETTE: BodyPalette = {
  base: 'rgba(16, 17, 20, 0.28)',
  primary: colors.onAccent,
  secondary: colors.onAccent,
};

/**
 * Icono de una categoría de ejercicios: la silueta (de frente o de espaldas)
 * con su músculo resaltado. `size` es el alto. Cardio no es un músculo: lleva
 * el corazón de Lucide. Si la categoría no tiene icono no pinta nada.
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

  const spec = CATEGORY_PARTS[category];
  const levels = CATEGORY_LEVELS.get(category);
  if (!spec || !levels) return null;

  return (
    <BodyFigure
      side={spec.side}
      levels={levels}
      height={size}
      palette={active ? ACTIVE_PALETTE : PALETTE}
    />
  );
}
