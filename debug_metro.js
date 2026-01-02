const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
console.log('Asset Exts:', config.resolver.assetExts.join(', '));
