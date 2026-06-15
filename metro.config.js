const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Игнорируем битые временные папки worklets после неудачной установки npm
config.resolver.blockList = [
  /node_modules\/\.react-native-worklets-.*/,
];

config.watcher = {
  ...config.watcher,
  additionalExts: config.watcher?.additionalExts ?? [],
};

module.exports = config;
