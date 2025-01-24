const { getDefaultConfig } = require('expo/metro-config');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);
  config.resolver.assetExts.push('csv'); // Add 'csv' to asset extensions
  return config;
})();
