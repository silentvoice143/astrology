// const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

// // metro.config.js
// const {
//   wrapWithReanimatedMetroConfig,
// } = require('react-native-reanimated/metro-config');

// /**
//  * Metro configuration
//  * https://reactnative.dev/docs/metro
//  *
//  * @type {import('@react-native/metro-config').MetroConfig}
//  */
// const config = {};

// module.exports = wrapWithReanimatedMetroConfig(
//   mergeConfig(getDefaultConfig(__dirname), config),
// );

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { wrapWithReanimatedMetroConfig } = require('react-native-reanimated/metro-config');

// Get the default config
const defaultConfig = getDefaultConfig(__dirname);

// Add custom aliases
defaultConfig.resolver.alias = {
  ...(defaultConfig.resolver.alias || {}),
  crypto: 'react-native-crypto',
  stream: 'stream-browserify',
  buffer: '@craftzdog/react-native-buffer',
};

// Your custom config (you can add other things here too if needed)
const customConfig = {};

// Merge and wrap with reanimated config
const mergedConfig = mergeConfig(defaultConfig, customConfig);

module.exports = wrapWithReanimatedMetroConfig(mergedConfig);
