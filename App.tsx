/**
 * GymBro
 *
 * @format
 */

import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DataReloadProvider } from './src/context/DataReloadContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { RestTimerProvider } from './src/context/RestTimerContext';
import { RoutineProvider } from './src/context/RoutineContext';
import { SessionProvider } from './src/context/SessionContext';
import { SettingsProvider } from './src/context/SettingsContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <DataReloadProvider>
          <SettingsProvider>
            <RestTimerProvider>
              <RoutineProvider>
                <SessionProvider>
                  <FavoritesProvider>
                    <RootNavigator />
                  </FavoritesProvider>
                </SessionProvider>
              </RoutineProvider>
            </RestTimerProvider>
          </SettingsProvider>
        </DataReloadProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});

export default App;
