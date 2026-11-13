import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useRoutine } from '../context/RoutineContext';
import { useSession } from '../context/SessionContext';
import MainWithDrawer from './MainWithDrawer';
import SplitSelectionScreen from '../screens/SplitSelectionScreen';
import CreateCustomSplitScreen from '../screens/CreateCustomSplitScreen';
import DayEditorScreen from '../screens/DayEditorScreen';
import ExercisePickerScreen from '../screens/ExercisePickerScreen';
import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import ExerciseHistoryScreen from '../screens/ExerciseHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import WorkoutSummaryScreen from '../screens/WorkoutSummaryScreen';
import EditWorkoutScreen from '../screens/EditWorkoutScreen';
import CustomExerciseScreen from '../screens/CustomExerciseScreen';
import AnimatedSplash from '../components/AnimatedSplash';
import type { RootStackParamList } from './types';
import { colors } from '../theme';

const splashManifest = require('../assets/bootsplash/manifest.json');
const splashLogo = require('../assets/bootsplash/logo.png');

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
  const { loading: sessionsLoading } = useSession();
  const [navigationReady, setNavigationReady] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  // El splash de arranque se queda hasta que la primera pantalla está montada y con los
  // entrenos cargados (así no se ve una pantalla a medio llenar) y luego sale animado.
  const splash = splashDone ? null : (
    <AnimatedSplash
      name="GymBro"
      manifest={splashManifest}
      logo={splashLogo}
      accent={colors.accent}
      textColor={colors.text}
      ready={navigationReady && !sessionsLoading}
      onDone={() => setSplashDone(true)}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} size="large" />
        {splash}
      </View>
    );
  }

  return (
    <>
      <NavigationContainer theme={navigationTheme} onReady={() => setNavigationReady(true)}>
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
            options={{
              title: 'Nuevo split',
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
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
            options={{ title: 'Ejercicio' }}
          />
          <Stack.Screen
            name="CustomExercise"
            component={CustomExerciseScreen}
            options={{ title: 'Nuevo ejercicio' }}
          />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
          <Stack.Screen
            name="WorkoutSummary"
            component={WorkoutSummaryScreen}
            options={{ headerShown: false, presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="EditWorkout"
            component={EditWorkoutScreen}
            options={{ title: 'Editar entreno' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      {splash}
    </>
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
