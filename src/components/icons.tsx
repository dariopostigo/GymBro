/* eslint-disable react-native/no-inline-styles -- los iconos se dibujan en función del tamaño y color recibidos */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';

/**
 * Iconos dibujados con Views para no arrastrar ninguna dependencia nativa
 * (react-native-svg / vector-icons). Todos aceptan tamaño y color.
 */
export interface IconProps {
  size?: number;
  color?: string;
}

const DEFAULT_SIZE = 22;

function useIcon({ size = DEFAULT_SIZE, color = colors.text }: IconProps) {
  return { s: size, c: color };
}

export function HomeIcon(props: IconProps) {
  const { s, c } = useIcon(props);
  return (
    <View style={[styles.box, { width: s, height: s }]}>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: s * 0.45,
          borderRightWidth: s * 0.45,
          borderBottomWidth: s * 0.36,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor: c,
        }}
      />
      <View
        style={{
          width: s * 0.62,
          height: s * 0.4,
          backgroundColor: c,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
        }}
      />
    </View>
  );
}

export function DumbbellIcon(props: IconProps) {
  const { s, c } = useIcon(props);
  const plate = { width: s * 0.16, height: s * 0.62, borderRadius: 3, backgroundColor: c };
  const capsule = { width: s * 0.12, height: s * 0.38, borderRadius: 2, backgroundColor: c };
  return (
    <View style={[styles.row, { width: s, height: s }]}>
      <View style={capsule} />
      <View style={plate} />
      <View style={{ width: s * 0.18, height: s * 0.16, backgroundColor: c }} />
      <View style={plate} />
      <View style={capsule} />
    </View>
  );
}

export function CalendarIcon(props: IconProps) {
  const { s, c } = useIcon(props);
  return (
    <View style={[styles.box, { width: s, height: s }]}>
      <View style={[styles.row, { width: s * 0.6, height: s * 0.16 }]}>
        <View style={{ width: 2, height: s * 0.16, backgroundColor: c, borderRadius: 1 }} />
        <View style={{ width: 2, height: s * 0.16, backgroundColor: c, borderRadius: 1 }} />
      </View>
      <View
        style={{
          width: s * 0.86,
          height: s * 0.74,
          borderWidth: 2,
          borderColor: c,
          borderRadius: 5,
          overflow: 'hidden',
        }}
      >
        <View style={{ height: s * 0.16, backgroundColor: c }} />
        <View style={[styles.row, { flex: 1, gap: s * 0.12 }]}>
          <View style={{ width: s * 0.14, height: s * 0.14, backgroundColor: c, borderRadius: 1 }} />
          <View style={{ width: s * 0.14, height: s * 0.14, backgroundColor: c, borderRadius: 1 }} />
        </View>
      </View>
    </View>
  );
}

export function ChartIcon(props: IconProps) {
  const { s, c } = useIcon(props);
  const bar = (h: number) => ({
    width: s * 0.2,
    height: s * h,
    backgroundColor: c,
    borderRadius: 2,
  });
  return (
    <View style={[styles.rowBottom, { width: s, height: s, gap: s * 0.1 }]}>
      <View style={bar(0.42)} />
      <View style={bar(0.72)} />
      <View style={bar(0.95)} />
    </View>
  );
}

export function FlameIcon(props: IconProps) {
  const { s, c } = useIcon(props);
  return (
    <View style={[styles.box, { width: s, height: s }]}>
      <View
        style={{
          width: s * 0.62,
          height: s * 0.62,
          backgroundColor: c,
          borderTopLeftRadius: s * 0.34,
          borderTopRightRadius: 2,
          borderBottomRightRadius: s * 0.34,
          borderBottomLeftRadius: s * 0.34,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

export function PlusIcon(props: IconProps) {
  const { s, c } = useIcon(props);
  const thickness = Math.max(2, s * 0.12);
  return (
    <View style={[styles.box, { width: s, height: s }]}>
      <View
        style={{
          position: 'absolute',
          width: s * 0.72,
          height: thickness,
          borderRadius: thickness,
          backgroundColor: c,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: thickness,
          height: s * 0.72,
          borderRadius: thickness,
          backgroundColor: c,
        }}
      />
    </View>
  );
}

export function ChevronIcon({ direction = 'right', ...props }: IconProps & { direction?: 'right' | 'left' | 'up' | 'down' }) {
  const { s, c } = useIcon(props);
  const rotation = { right: '45deg', left: '-135deg', up: '-45deg', down: '135deg' }[direction];
  return (
    <View style={[styles.box, { width: s, height: s }]}>
      <View
        style={{
          width: s * 0.42,
          height: s * 0.42,
          borderTopWidth: 2,
          borderRightWidth: 2,
          borderColor: c,
          transform: [{ rotate: rotation }],
        }}
      />
    </View>
  );
}

/** Reloj: acceso al historial del ejercicio. */
export function HistoryIcon(props: IconProps) {
  const { s, c } = useIcon(props);
  const thickness = Math.max(1.5, s * 0.09);
  const hand = { borderRadius: thickness, backgroundColor: c } as const;
  return (
    <View style={[styles.box, { width: s, height: s }]}>
      <View
        style={[
          styles.box,
          {
            width: s * 0.88,
            height: s * 0.88,
            borderRadius: s * 0.44,
            borderWidth: 2,
            borderColor: c,
          },
        ]}
      >
        {/* Agujas ancladas al centro de la esfera: marcan las 3 en punto. */}
        <View
          style={[hand, { position: 'absolute', bottom: '50%', width: thickness, height: s * 0.24 }]}
        />
        <View
          style={[hand, { position: 'absolute', left: '50%', width: s * 0.2, height: thickness }]}
        />
      </View>
    </View>
  );
}

export function CheckIcon(props: IconProps) {
  const { s, c } = useIcon(props);
  return (
    <View style={[styles.box, { width: s, height: s }]}>
      <View
        style={{
          width: s * 0.34,
          height: s * 0.62,
          borderBottomWidth: 2,
          borderRightWidth: 2,
          borderColor: c,
          transform: [{ rotate: '40deg' }],
          marginTop: -s * 0.1,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2 },
  rowBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' },
});
