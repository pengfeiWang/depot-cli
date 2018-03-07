'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _postcssPluginPx2rem = _interopRequireDefault(
  require('postcss-plugin-px2rem'),
);

var _path = require('path');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

function _default(api) {
  const _api$service = api.service,
    config = _api$service.config,
    libraryName = _api$service.libraryName;
  api.register('modifyConfigPlugins', ({ memo }) => {
    memo.push(api => {
      return {
        name: 'hd',

        onChange() {
          api.service.restart(
            /* why */
            'Config hd Changed',
          );
        },
      };
    });
    return memo;
  });

  if (config.hd) {
    api.register('modifyAFWebpackOpts', ({ memo }) => {
      memo.theme = _extends({}, memo.theme || {}, {
        '@hd': '2px',
      });
      memo.extraPostCSSPlugins = [
        ...(memo.extraPostCSSPlugins || []),
        (0, _postcssPluginPx2rem.default)({
          rootValue: 100,
          minPixelValue: 2,
        }),
      ];
      const hdFile = (0, _path.join)(__dirname, './template/index.js');
      memo.entry[libraryName].unshift(hdFile);
      return memo;
    });
  }
}
