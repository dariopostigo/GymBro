import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, type ImageRequireSource } from 'react-native';
import BootSplash, { type Manifest } from 'react-native-bootsplash';
import { splashLeaving } from './motion';

interface Props {
  /** Nombre de la app que asoma debajo del logo. */
  name: string;
  /** Lo que genera `react-native-bootsplash generate` en src/assets/bootsplash. */
  manifest: Manifest;
  logo: ImageRequireSource;
  /** Color de la onda (el de acento de la app). */
  accent: string;
  /** Color del nombre. */
  textColor: string;
  /** La app ya está lista debajo (tickets cargados y primera pantalla montada). */
  ready: boolean;
  onDone: () => void;
}

/**
 * Salida del splash, igual en todas las apps de CODEWIZARD (mismo archivo; si
 * cambias algo, cópialo a los demás proyectos): el splash nativo se cambia sin
 * que se note por esta copia en React y el logo coge impulso (asoma el nombre),
 * salta y desaparece mientras una onda del color de la app sale del centro y el
 * fondo se desvanece dejando ver la primera pantalla.
 */
export default function AnimatedSplash({ name: appName, manifest, logo, accent, textColor, ready, onDone }: Props) {
  const [opacity] = useState(() => new Animated.Value(1));
  const [jump] = useState(() => new Animated.Value(0));
  const [squash] = useState(() => new Animated.Value(0));
  const [ring] = useState(() => new Animated.Value(0));
  const [name] = useState(() => new Animated.Value(0));
  const done = useRef(false);

  const { container, logo: logoProps } = BootSplash.useHideAnimation({
    manifest,
    logo,
    ready,
    animate: () => {
      const finish = () => {
        if (!done.current) {
          done.current = true;
          onDone();
        }
      };
      AccessibilityInfo.isReduceMotionEnabled()
        .catch(() => false)
        .then(reduce => {
          if (reduce) {
            splashLeaving();
            Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(finish);
            return;
          }
          // 1. coge impulso (y asoma el nombre)
          Animated.sequence([
            Animated.parallel([
              Animated.timing(squash, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: true }),
              Animated.timing(name, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }),
            ]),
            Animated.delay(120),
          ]).start(() => {
            // 2. salta y se va; la onda sale, el fondo se desvanece y el Inicio entra por debajo
            splashLeaving();
            Animated.parallel([
              Animated.timing(jump, { toValue: 1, duration: 420, easing: Easing.in(Easing.back(1.6)), useNativeDriver: true }),
              Animated.timing(name, { toValue: 0, duration: 200, useNativeDriver: true }),
              Animated.timing(ring, { toValue: 1, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
              Animated.sequence([
                Animated.delay(180),
                Animated.timing(opacity, { toValue: 0, duration: 380, easing: Easing.out(Easing.quad), useNativeDriver: true }),
              ]),
            ]).start(finish);
          });
        });
    },
  });

  // Por si el splash nativo no llegara a avisar: nunca dejar la app tapada.
  useEffect(() => {
    if (!ready) {
      return;
    }
    const timer = setTimeout(() => {
      splashLeaving();
      if (!done.current) {
        done.current = true;
        onDone();
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [ready, onDone]);

  const logoScale = Animated.add(
    squash.interpolate({ inputRange: [0, 1], outputRange: [1, 0.86] }),
    jump.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }),
  );

  return (
    <Animated.View {...container} style={[container.style, { opacity }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.ring,
          {
            borderColor: accent,
            opacity: ring.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.6, 0] }),
            transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 4] }) }],
          },
        ]}
      />
      <Animated.Image
        {...logoProps}
        style={[
          logoProps.style,
          {
            opacity: jump.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateY: jump.interpolate({ inputRange: [0, 1], outputRange: [0, -90] }) },
              { rotate: jump.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-10deg'] }) },
              { scaleX: logoScale },
              { scaleY: Animated.add(logoScale, squash.interpolate({ inputRange: [0, 1], outputRange: [0, -0.06] })) },
            ],
          },
        ]}
      />
      <Animated.Text
        style={[
          styles.name,
          {
            color: textColor,
            opacity: name,
            transform: [{ translateY: name.interpolate({ inputRange: [0, 1], outputRange: [92, 82] }) }],
          },
        ]}
      >
        {appName}
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  name: {
    position: 'absolute',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
