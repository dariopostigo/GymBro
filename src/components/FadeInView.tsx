import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { FadeIn } from './motion';

interface FadeInViewProps {
  children: React.ReactNode;
  /** Retardo en ms, útil para encadenar la entrada de varias secciones. */
  delay?: number;
  /** Píxeles que sube el contenido mientras aparece. */
  offset?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Entrada suave (fundido + desplazamiento) del contenido que se monta en pantalla.
 * Usa la animación común de las apps (`motion.tsx`): espera a que se vaya el splash
 * y respeta "Quitar animaciones".
 */
export default function FadeInView({ children, delay, offset, duration, style }: FadeInViewProps) {
  return (
    <FadeIn delay={delay} offset={offset} duration={duration} style={style}>
      {children}
    </FadeIn>
  );
}
