import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, radius, shadow } from '../theme';
import { CalendarIcon, ChartIcon, DumbbellIcon, HomeIcon, type IconProps } from './icons';

/** Espacio que hay que dejar libre al final de cada pantalla con tabs. */
export const TAB_BAR_SPACE = 104;

const SHOW_EVENT = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE_EVENT = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

const TAB_META: Record<string, { label: string; Icon: (props: IconProps) => React.JSX.Element }> = {
  Home: { label: 'Inicio', Icon: HomeIcon },
  Today: { label: 'Hoy', Icon: DumbbellIcon },
  Routine: { label: 'Rutina', Icon: CalendarIcon },
  Progress: { label: 'Progreso', Icon: ChartIcon },
};

interface TabItemProps {
  focused: boolean;
  label: string;
  Icon: (props: IconProps) => React.JSX.Element;
  onPress: () => void;
  onLongPress: () => void;
}

function TabItem({ focused, label, Icon, onPress, onLongPress }: TabItemProps) {
  // 0 = pastilla pequeña e inactiva, 1 = pastilla amarilla con etiqueta.
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    const animation = Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      friction: 8,
      tension: 90,
      // flexGrow y backgroundColor son props de layout/color: sin driver nativo.
      useNativeDriver: false,
    });
    animation.start();
    return () => animation.stop();
  }, [focused, progress]);

  // El muelle rebasa el 1, así que todas las interpolaciones van recortadas.
  const backgroundColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.surfaceAlt, colors.accent],
    extrapolate: 'clamp',
  });
  const iconScale = progress.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [1, 1.18, 1],
    extrapolate: 'clamp',
  });
  const inactiveOpacity = progress.interpolate({
    inputRange: [0, 0.6],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const labelWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 90],
    extrapolate: 'clamp',
  });
  const labelSpace = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={[styles.item, { flexGrow: progress, backgroundColor }]}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={focused ? { selected: true } : {}}
        accessibilityLabel={label}
        activeOpacity={0.85}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.itemTouchable}
      >
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: iconScale }] }]}>
          <Animated.View style={{ opacity: inactiveOpacity }}>
            <Icon size={20} color={colors.muted} />
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, styles.iconTop, { opacity: progress }]}>
            <Icon size={20} color={colors.onAccent} />
          </Animated.View>
        </Animated.View>
        <Animated.View
          style={[styles.labelWrap, { maxWidth: labelWidth, marginLeft: labelSpace }]}
        >
          <Text style={styles.itemLabel} numberOfLines={1}>
            {label}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
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
    animation.start();
    return () => animation.stop();
  }, [hidden, keyboardVisible]);

  useEffect(() => {
    const show = Keyboard.addListener(SHOW_EVENT, () => setKeyboardVisible(true));
    const hide = Keyboard.addListener(HIDE_EVENT, () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const translateY = hidden.interpolate({ inputRange: [0, 1], outputRange: [0, 160] });
  const opacity = hidden.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 10 }]} pointerEvents="box-none">
      <Animated.View
        style={[styles.bar, shadow.card, { opacity, transform: [{ translateY }] }]}
        pointerEvents={keyboardVisible ? 'none' : 'auto'}
      >
        {state.routes.map((route, index) => {
          const meta = TAB_META[route.name];
          if (!meta) return null;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              focused={isFocused}
              label={meta.label}
              Icon={meta.Icon}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
            />
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 18,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    padding: 8,
    gap: 4,
  },
  item: {
    flexGrow: 0,
    flexShrink: 1,
    height: 46,
    borderRadius: radius.pill,
    // La etiqueta se recorta mientras la pastilla crece.
    overflow: 'hidden',
  },
  itemTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  iconWrap: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  iconTop: { alignItems: 'center', justifyContent: 'center' },
  labelWrap: { overflow: 'hidden' },
  itemLabel: { color: colors.onAccent, fontWeight: '800', fontSize: 13, letterSpacing: 0.2 },
});
