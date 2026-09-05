import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRoutine } from '../context/RoutineContext';
import MainWithDrawer from './MainWithDrawer';
import SplitSelectionScreen from '../screens/SplitSelectionScreen';
import CreateCustomSplitScreen from '../screens/CreateCustomSplitScreen';
import DayEditorScreen from '../screens/DayEditorScreen';
import ExercisePickerScreen from '../screens/ExercisePickerScreen';
import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import ExerciseHistoryScreen from '../screens/ExerciseHistoryScreen';
import type { RootStackParamList } from './types';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

export default function RootNavigator() {
  const { loading, activeSplit } = useRoutine();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={activeSplit ? 'Main' : 'SplitSelection'}
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.accent,
          headerTitleStyle: { color: colors.text, fontWeight: '800', fontSize: 17 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
          animationDuration: 260,
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainWithDrawer}
          options={{ headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen
          name="SplitSelection"
          component={SplitSelectionScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateCustomSplit"
          component={CreateCustomSplitScreen}
          options={{ title: 'Nuevo split', presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="DayEditor"
          component={DayEditorScreen}
          options={{ title: 'Editar día' }}
        />
        <Stack.Screen
          name="ExercisePicker"
          component={ExercisePickerScreen}
          options={{
            title: 'Elegir ejercicio',
            // Elegir ejercicio es un paso puntual: entra como modal desde abajo.
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="ExerciseLibrary"
          component={ExerciseLibraryScreen}
          options={{ title: 'Ejercicios' }}
        />
        <Stack.Screen
          name="ExerciseHistory"
          component={ExerciseHistoryScreen}
          options={{ title: 'Historial' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
