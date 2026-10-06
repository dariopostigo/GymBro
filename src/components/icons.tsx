import React from 'react';
import {
  CalendarDays,
  ChartNoAxesColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Dumbbell,
  Flame,
  History,
  House,
  LayoutGrid,
  Maximize2,
  Plus,
  SquarePlay,
  Star,
  X,
  type LucideIcon,
} from 'lucide-react-native';
import { colors } from '../theme';

/**
 * Iconos de Lucide (https://lucide.dev) envueltos con una API común:
 * todos aceptan tamaño y color, con valores por defecto del tema.
 */
export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const DEFAULT_SIZE = 22;
const DEFAULT_STROKE = 2;

function wrap(Icon: LucideIcon) {
  return function WrappedIcon({
    size = DEFAULT_SIZE,
    color = colors.text,
    strokeWidth = DEFAULT_STROKE,
  }: IconProps) {
    return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
  };
}

export const HomeIcon = wrap(House);
export const DumbbellIcon = wrap(Dumbbell);
export const CalendarIcon = wrap(CalendarDays);
export const ChartIcon = wrap(ChartNoAxesColumn);
export const FlameIcon = wrap(Flame);
export const PlusIcon = wrap(Plus);
/** Reloj con flecha: acceso al historial del ejercicio. */
export const HistoryIcon = wrap(History);
/** Ampliar imagen a pantalla completa. */
export const ExpandIcon = wrap(Maximize2);
/** Reproducir el vídeo del ejercicio. */
export const VideoIcon = wrap(SquarePlay);
/** Biblioteca de ejercicios. */
export const GridIcon = wrap(LayoutGrid);
export const CheckIcon = wrap(Check);
/** Cerrar modales / eliminar elementos. */
export const CloseIcon = wrap(X);

const CHEVRONS = {
  right: ChevronRight,
  left: ChevronLeft,
  up: ChevronUp,
  down: ChevronDown,
} as const;

export function ChevronIcon({
  direction = 'right',
  size = DEFAULT_SIZE,
  color = colors.text,
  strokeWidth = DEFAULT_STROKE,
}: IconProps & { direction?: keyof typeof CHEVRONS }) {
  const Icon = CHEVRONS[direction];
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}

/** Estrella de favorito: rellena cuando está marcada. */
export function StarIcon({
  filled = false,
  size = DEFAULT_SIZE,
  color = colors.text,
  strokeWidth = DEFAULT_STROKE,
}: IconProps & { filled?: boolean }) {
  return (
    <Star
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      fill={filled ? color : 'none'}
    />
  );
}
