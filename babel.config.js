const parentBabelConfig = require('./node_modules/@helsenorge/core-build/config/babel.config.js');

module.exports = function(api) {
  api.cache(true);

  return {
    presets: parentBabelConfig.presets,
    plugins: parentBabelConfig.plugins,
  };
};
