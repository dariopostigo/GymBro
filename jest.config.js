module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  moduleNameMapper: {
    '/exercises-local/.+\\.(png|jpe?g|webp)$': '<rootDir>/__mocks__/localExerciseImageStub.js',
    // Jest no transforma .mjs: usamos el build CommonJS de Lucide.
    '^lucide-react-native$': '<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native' +
      '|@react-native(-community)?' +
      '|@react-native-async-storage' +
      '|@react-navigation' +
      '|react-native-screens' +
      '|react-native-gesture-handler' +
      '|react-native-reanimated' +
      '|react-native-worklets' +
      '|react-native-safe-area-context' +
      '|react-native-svg)/)',
  ],
};
