import React, { useEffect, useRef } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';

interface FadeInViewProps {
  children: React.ReactNode;
  /** Retardo en ms, útil para encadenar la entrada de varias secciones. */
  delay?: number;
  /** Píxeles que sube el contenido mientras aparece. */
  offset?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

/** Entrada suave (fundido + desplazamiento) del contenido que se monta en pantalla. */
export default function FadeInView({
  children,
  delay = 0,
  offset = 14,
  duration = 320,
  style,
}: FadeInViewProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, delay, duration]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [offset, 0],
  });

  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
