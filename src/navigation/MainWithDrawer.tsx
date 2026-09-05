import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import MainTabs from './MainTabs';
import DrawerContent from '../components/DrawerContent';
import { DrawerProvider, useDrawer } from '../context/DrawerContext';
import { colors } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = Math.min(320, SCREEN_WIDTH * 0.82);

function DrawerOverlay() {
  const { isOpen, closeDrawer } = useDrawer();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isOpen ? 1 : 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [isOpen, progress]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-DRAWER_WIDTH, 0] });

  return (
    <>
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: progress }]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>
      </Animated.View>
      <Animated.View
        style={[styles.panel, { width: DRAWER_WIDTH, transform: [{ translateX }] }]}
        pointerEvents={isOpen ? 'auto' : 'none'}
      >
        <DrawerContent />
      </Animated.View>
    </>
  );
}

export default function MainWithDrawer() {
  return (
    <DrawerProvider>
      <View style={styles.root}>
        <MainTabs />
        <DrawerOverlay />
      </View>
    </DrawerProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backdrop: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
});
