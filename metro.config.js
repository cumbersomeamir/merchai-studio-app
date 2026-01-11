const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig(__dirname);

// Check if react-native-svg-transformer is installed
let svgTransformerPath;
try {
  svgTransformerPath = require.resolve('react-native-svg-transformer');
} catch (e) {
  // SVG transformer not installed yet - will work after npm install
  svgTransformerPath = null;
}

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    ...(svgTransformerPath && {
      babelTransformerPath: svgTransformerPath,
    }),
  },
  resolver: {
    ...(svgTransformerPath && {
      assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
    }),
  },
};

module.exports = mergeConfig(defaultConfig, config);

