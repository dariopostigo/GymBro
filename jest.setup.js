/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

// AsyncStorage v3 no registra su mock automáticamente: hay que enlazarlo a mano.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

// Reanimated arrastra react-native-worklets, que necesita su módulo nativo y
// revienta al importarse en Jest (su propio /mock también lo importa). La app
// solo usa Animated.View con `layout`, así que basta con este doble de cuerda.
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const layoutTransition = { duration: () => layoutTransition, delay: () => layoutTransition };
  return {
    __esModule: true,
    default: { View, createAnimatedComponent: component => component },
    LinearTransition: layoutTransition,
  };
});

// Módulo nativo (TurboModule) sin implementación en Jest.
jest.mock('@sayem314/react-native-keep-awake', () => ({
  __esModule: true,
  default: () => null,
  useKeepAwake: () => {},
  activateKeepAwake: () => {},
  deactivateKeepAwake: () => {},
}));

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

// Módulos nativos de la copia de seguridad: en Jest solo hace falta que importen.
jest.mock('@dr.pogodin/react-native-fs', () => ({
  CachesDirectoryPath: '/cache',
  readFile: jest.fn(),
  writeFile: jest.fn(),
  unlink: jest.fn(() => Promise.resolve()),
}));
jest.mock('@react-native-documents/picker', () => ({
  errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
  isErrorWithCode: () => false,
  keepLocalCopy: jest.fn(),
  pick: jest.fn(),
  saveDocuments: jest.fn(),
  types: { allFiles: '*/*' },
}));
