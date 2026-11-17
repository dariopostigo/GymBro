import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../navigation/types';
import { colors } from '../theme';
import {
  CalendarIcon,
  ChartIcon,
  DumbbellIcon,
  GridIcon,
  HomeIcon,
  type IconProps,
} from './icons';
import { afterSplash, ScalePressable, usePulse } from './motion';

/** Alto de la barra sin la zona segura de abajo (relleno + pestaña de 48). */
export const TAB_BAR_HEIGHT = 64;
/** Lo que sobresale el botón de Entrenar por encima de la barra. */
export const CENTER_BUTTON_RISE = 26;
/** Espacio que hay que dejar libre al final de cada pantalla con tabs (más la zona segura). */
export const TAB_BAR_SPACE = TAB_BAR_HEIGHT + 24;

/** La pestaña que va en el botón grande del centro, no en la fila. */
const CENTER_TAB: keyof MainTabParamList = 'Today';

const ICONS: Record<Exclude<keyof MainTabParamList, 'Today'>, (props: IconProps) => React.JSX.Element> = {
  Home: HomeIcon,
  Routine: CalendarIcon,
  Progress: ChartIcon,
  Exercises: GridIcon,
};

const SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE_EVENT = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

/** Icono de pestaña que da un saltito al seleccionarla. */
function TabIcon({
  Icon,
  color,
  focused,
}: {
  Icon: (props: IconProps) => React.JSX.Element;
  color: string;
  focused: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (focused) {
      scale.setValue(0.7);
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 16 }).start();
    }
  }, [focused, scale]);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Icon size={22} color={color} strokeWidth={focused ? 2.2 : 1.9} />
    </Animated.View>
  );
}

/**
 * Barra inferior con 4 pestañas y el botón de Entrenar en el centro,
 * con la misma línea que NutriBro y CestaBro. Se esconde con el teclado abierto.
 */
export default function MainTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const pulse = usePulse();
  // 1 = fuera de pantalla (al montar y mientras el teclado está abierto).
  const hidden = useRef(new Animated.Value(1)).current;
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const animation = Animated.spring(hidden, {
      toValue: keyboardVisible ? 1 : 0,
      friction: 9,
      tension: 70,
      useNativeDriver: true,
    });
    // Al abrir la app, la barra sube cuando el splash ya se está yendo.
    const cancel = afterSplash(() => animation.start());
    return () => {
      cancel();
      animation.stop();
    };
  }, [hidden, keyboardVisible]);

  useEffect(() => {
    const show = Keyboard.addListener(SHOW_EVENT, () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(HIDE_EVENT, () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const goTo = (route: (typeof state.routes)[number], focused: boolean) => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  const centerIndex = state.routes.findIndex(route => route.name === CENTER_TAB);
  const centerRoute = state.routes[centerIndex];
  const centerFocused = state.index === centerIndex;

  const tabs = state.routes.flatMap((route, index) => {
    if (route.name === CENTER_TAB) return [];
    const Icon = ICONS[route.name as keyof typeof ICONS];
    if (!Icon) return [];
    const focused = state.index === index;
    const color = focused ? colors.accent : colors.label;
    return [
      <Pressable
        key={route.key}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        onPress={() => goTo(route, focused)}
        style={styles.tab}
      >
        <TabIcon Icon={Icon} color={color} focused={focused} />
        <Text style={[styles.label, { color }, focused && styles.labelFocused]}>
          {descriptors[route.key].options.title}
        </Text>
      </Pressable>,
    ];
  });

  const middle = Math.ceil(tabs.length / 2);
  const translateY = hidden.interpolate({ inputRange: [0, 1], outputRange: [0, 160] });

  return (
    <Animated.View
      style={[styles.bar, { paddingBottom: insets.bottom + 8, transform: [{ translateY }] }]}
      pointerEvents={keyboardVisible ? 'none' : 'auto'}
    >
      {tabs.slice(0, middle)}
      {centerRoute && (
        <View style={styles.centerSlot}>
          {/* Onda que sale del botón de vez en cuando para invitar a entrenar */}
          {!centerFocused && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.centerRing,
                {
                  opacity: pulse.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.45, 0] }),
                  transform: [
                    { scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1.45] }) },
                  ],
                },
              ]}
            />
          )}
          <ScalePressable
            accessibilityRole="tab"
            accessibilityLabel="Entrenar"
            accessibilityState={{ selected: centerFocused }}
            onPress={() => goTo(centerRoute, centerFocused)}
            scaleTo={0.88}
            style={styles.center}
          >
            <DumbbellIcon size={28} color={colors.onAccent} strokeWidth={2.4} />
          </ScalePressable>
        </View>
      )}
      {tabs.slice(middle)}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    // Flota sobre las pantallas: así se puede esconder con el teclado sin mover el contenido.
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 3, minHeight: 48, justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '500' },
  labelFocused: { fontWeight: '700' },
  centerSlot: { flex: 1, alignItems: 'center' },
  center: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -34,
    borderWidth: 4,
    borderColor: colors.background,
  },
  centerRing: {
    position: 'absolute',
    top: -30,
    width: 54,
    height: 54,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.accent,
  },
});
