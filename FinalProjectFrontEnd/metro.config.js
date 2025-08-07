const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

module.exports = mergeConfig(defaultConfig, {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    // Remove "svg" from assetExts so it doesn't treat SVGs as assets
    assetExts: defaultConfig.resolver.assetExts.filter(ext => ext !== 'svg'),
    // Add "svg" to sourceExts so they can be imported as modules
    sourceExts: [...defaultConfig.resolver.sourceExts, 'svg'],
  },
});
