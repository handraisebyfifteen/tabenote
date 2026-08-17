// Replit のワークスペース直下にはシステム用フォルダ(.cache 等)があり、
// Metro のファイル監視がその中の一時ファイルを追って落ちるため除外する
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const blockedDirs = /\/(\.cache|\.local|\.config|\.agents|attached_assets)\//;

config.resolver.blockList = [blockedDirs];
config.watcher = {
  ...config.watcher,
  ignore: [blockedDirs],
};

module.exports = config;
