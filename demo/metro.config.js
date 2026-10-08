const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// The library lives in the repo root (one level up) and has no node_modules of its own.
const root = path.resolve(__dirname, '..');

const config = {
  watchFolders: [root],
  resolver: {
    nodeModulesPaths: [path.join(__dirname, 'node_modules')],
    extraNodeModules: {
      'react-native-transparent-video': root,
    },
    blockList: [
      new RegExp(`^${root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/(example|node_modules)/.*$`),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
