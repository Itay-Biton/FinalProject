module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Reanimated plugin MUST go last in the root plugins array
    'react-native-worklets/plugin',
  ],
  env: {
    production: {
      // Paper's plugin only in production to tree-shake unused components
      plugins: ['react-native-paper/babel'],
    },
  },
};
