"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _serveStatic = _interopRequireDefault(require("serve-static"));

var _buildDll = _interopRequireDefault(require("./buildDll"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _default(api, opts = {}) {
  if (process.env.NODE_ENV !== 'development') return;
  const debug = api.debug,
        paths = api.paths;
  const dllDir = (0, _path.join)(paths.absNodeModulesPath, 'depot-dlls');
  const dllManifest = (0, _path.join)(dllDir, 'depot.json');
  api.register('_beforeDevServerAsync', () => {
    return new Promise((resolve, reject) => {
      (0, _buildDll.default)(_objectSpread({
        api,
        dllDir
      }, opts)).then(() => {
        debug('depot-plugin-dll done');
        resolve();
      }).catch(e => {
        console.log('[depot-plugin-dll] error', e);
        reject(e);
      });
    });
  });
  api.addMiddlewareAhead(() => {
    return (0, _serveStatic.default)(dllDir);
  });
  api.chainWebpackConfig(webpackConfig => {
    const webpack = require(api._resolveDeps('af-webpack/webpack')); // eslint-disable-line


    webpackConfig.plugin('dll-reference').use(webpack.DllReferencePlugin, [{
      context: paths.absSrcPath,
      manifest: dllManifest
    }]);
  });
  api.addHTMLHeadScript({
    src: '/depot.dll.js'
  });
}