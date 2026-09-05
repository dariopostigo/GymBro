import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useDrawer } from '../context/DrawerContext';
import { colors, radius } from '../theme';

/** Avatar "GB" que abre el sidebar de navegación principal. */
export default function MenuButton() {
  const { openDrawer } = useDrawer();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.avatar}
      onPress={openDrawer}
      accessibilityRole="button"
      accessibilityLabel="Abrir menú"
    >
      <Text style={styles.avatarText}>GB</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.onAccent, fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
});
