import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  LayoutAnimation,
  Pressable,
  Text,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

/**
 * Animaciones de las apps de CODEWIZARD (CestaBro, GymBro…): el mismo archivo
 * en todos los proyectos para que se muevan igual. Si cambias algo aquí,
 * cópialo a los demás.
 *
 * Todo con la API `Animated` de React Native (sin librerías nativas) y en el
 * hilo nativo cuando se puede. Si el móvil tiene activado "Quitar
 * animaciones", se muestra directamente el estado final.
 */

// En los tests, sin animaciones: todo aparece ya en su sitio.
let reduceMotion = !!(globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env?.JEST_WORKER_ID;
AccessibilityInfo.isReduceMotionEnabled?.()
  .then(value => {
    reduceMotion = reduceMotion || value;
  })
  .catch(() => undefined);
AccessibilityInfo.addEventListener?.('reduceMotionChanged', value => {
  reduceMotion = value;
});

// Lo que se anima al abrir la app espera a que el splash empiece a irse, para que se vea.
let splashPending = !reduceMotion;
const afterSplashQueue = new Set<() => void>();

/** El splash animado avisa de que ya se está yendo. */
export function splashLeaving() {
  splashPending = false;
  afterSplashQueue.forEach(run => run());
  afterSplashQueue.clear();
}

/** Ejecuta `run` ahora o, si el splash sigue delante, cuando se vaya. Devuelve cómo cancelarlo. */
export function afterSplash(run: () => void): () => void {
  if (!splashPending) {
    run();
    return () => undefined;
  }
  afterSplashQueue.add(run);
  return () => afterSplashQueue.delete(run);
}

/** Retraso entre un elemento y el siguiente al aparecer en cascada. */
const STAGGER = 55;
/** A partir de este puesto ya no se espera más (las listas largas no se hacen eternas). */
const MAX_STAGGER = 7;

interface FadeInProps {
  children: ReactNode;
  /** Puesto en la cascada (0 el primero). */
  index?: number;
  /** Al cambiar, se repite la animación (p. ej. al cambiar de mes o volver a la pestaña). */
  trigger?: unknown;
  /** Desde dónde llega: abajo (por defecto), izquierda o derecha. */
  from?: 'below' | 'left' | 'right';
  /** Retraso extra en ms (además del de la cascada). */
  delay?: number;
  /** Distancia que recorre al entrar (px). */
  offset?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

/** Aparece desvaneciéndose y deslizándose un poco. */
export function FadeIn({ children, index = 0, trigger, from = 'below', delay = 0, offset = 16, duration = 380, style }: FadeInProps) {
  const progress = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay: delay + Math.min(index, MAX_STAGGER) * STAGGER,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    const cancel = afterSplash(() => animation.start());
    return () => {
      cancel();
      animation.stop();
    };
  }, [progress, index, trigger, delay, duration]);

  const distance = from === 'below' ? offset : from === 'left' ? -offset * 1.75 : offset * 1.75;
  const shift = progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] });
  const transform = from === 'below' ? [{ translateY: shift }] : [{ translateX: shift }];
  return <Animated.View style={[style, { opacity: progress, transform }]}>{children}</Animated.View>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ScalePressableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Cuánto se encoge al pulsar (0.96 = un 4 %). */
  scaleTo?: number;
}

/** Botón que se hunde un poco al pulsarlo y rebota al soltarlo. */
export function ScalePressable({ style, scaleTo = 0.96, onPressIn, onPressOut, disabled, ...rest }: ScalePressableProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const springTo = (toValue: number) =>
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 40, bounciness: toValue === 1 ? 10 : 0 }).start();
  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e: GestureResponderEvent) => {
        if (!reduceMotion) {
          springTo(scaleTo);
        }
        onPressIn?.(e);
      }}
      onPressOut={(e: GestureResponderEvent) => {
        springTo(1);
        onPressOut?.(e);
      }}
      style={[style, { transform: [{ scale }] }]}
    />
  );
}

/** Rebote al cambiar `trigger` (p. ej. al pasar a "Cuadra ✓"). */
export function Pop({ children, trigger, style }: { children: ReactNode; trigger: unknown; style?: StyleProp<ViewStyle> }) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduceMotion) {
      return;
    }
    scale.setValue(0.85);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 14 }).start();
  }, [scale, trigger]);
  return <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>;
}

interface CountUpProps {
  value: number;
  format: (value: number) => string;
  style?: StyleProp<TextStyle>;
  /** Componente de texto (MonoText); por defecto Text. */
  as?: typeof Text | ((props: { style?: StyleProp<TextStyle>; children: string }) => ReactNode);
}

/** Número que sube hasta su valor (el gasto del mes, por ejemplo). */
export function CountUp({ value, format, style, as: As = Text }: CountUpProps) {
  const [shown, setShown] = useState(reduceMotion ? value : 0);
  const from = useRef(0);
  useEffect(() => {
    if (reduceMotion) {
      setShown(value);
      return;
    }
    const start = from.current;
    const progress = new Animated.Value(0);
    const id = progress.addListener(({ value: t }) => {
      const next = start + (value - start) * t;
      from.current = next;
      setShown(next);
    });
    const animation = Animated.timing(progress, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    const cancel = afterSplash(() => animation.start(() => setShown(value)));
    return () => {
      cancel();
      animation.stop();
      progress.removeListener(id);
    };
  }, [value]);
  return <As style={style}>{format(Math.round(shown * 100) / 100)}</As>;
}

/** La próxima vez que cambie la disposición (líneas que se abren, añaden o borran), que se mueva suave. */
export function animateNextLayout() {
  if (!reduceMotion) {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, LayoutAnimation.Types.easeInEaseOut, LayoutAnimation.Properties.opacity));
  }
}

/** Valor de 0 a 1 que se anima cada vez que cambia `trigger` (para las barras de las gráficas). */
export function useGrow(trigger: unknown, delay = 0): Animated.Value {
  const progress = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.spring(progress, { toValue: 1, delay, useNativeDriver: true, speed: 9, bounciness: 7 });
    const cancel = afterSplash(() => animation.start());
    return () => {
      cancel();
      animation.stop();
    };
  }, [progress, trigger, delay]);
  return progress;
}

/** Bucle suave de "respiración" para llamar la atención (el botón de escanear). */
export function usePulse(): Animated.Value {
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduceMotion) {
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(progress, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(2400),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);
  return progress;
}
