const fs = require('fs');
const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// Imágenes con copyright que no se suben a git (ver .gitignore). En un clon
// limpio no existen, así que en vez de romper el bundle se resuelven a un
// módulo vacío y la app tira de las imágenes remotas del catálogo.
const LOCAL_IMAGES_DIR = path.join(__dirname, 'src', 'assets', 'exercises-local');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName.startsWith('.')) {
        const target = path.resolve(path.dirname(context.originModulePath), moduleName);
        if (target.startsWith(LOCAL_IMAGES_DIR + path.sep) && !fs.existsSync(target)) {
          return { type: 'empty' };
        }
      }
      return context.resolveRequest(context, moduleName, platform);
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
