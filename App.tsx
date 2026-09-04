/**
 * GymBro
 *
 * @format
 */

import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RoutineProvider } from './src/context/RoutineContext';
import { SessionProvider } from './src/context/SessionContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme';

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <RoutineProvider>
          <SessionProvider>
            <RootNavigator />
          </SessionProvider>
        </RoutineProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});

export default App;
