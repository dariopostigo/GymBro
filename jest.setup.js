/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

// AsyncStorage v3 no registra su mock automáticamente: hay que enlazarlo a mano.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

// Sin este mock el SafeAreaProvider nunca recibe un layout en tests y no pinta hijos.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);

// react-test-renderer no es Fabric y el driver nativo de Animated revienta al
// buscar el nodo de la vista. Se usan los componentes reales con las
// animaciones de mentira de RN: saltan directas al valor final.
jest.mock('react-native/Libraries/Animated/Animated', () => {
  const actual = jest.requireActual('react-native/Libraries/Animated/Animated').default;
  const mocked = jest.requireActual('react-native/Libraries/Animated/AnimatedMock').default;
  return { __esModule: true, default: { ...actual, ...mocked } };
});
