function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import { join } from 'path';
import serveStatic from 'serve-static';
import buildDll from './buildDll';
export default function (api) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (process.env.NODE_ENV !== 'development') return;
  var debug = api.debug,
      paths = api.paths;
  var dllDir = join(paths.absNodeModulesPath, 'depot-dlls');
  var dllManifest = join(dllDir, 'depot.json');
  api.register('_beforeDevServerAsync', function () {
    return new Promise(function (resolve, reject) {
      buildDll(_objectSpread({
        api: api,
        dllDir: dllDir
      }, opts)).then(function () {
        debug('depot-plugin-dll done');
        resolve();
      }).catch(function (e) {
        console.log('[depot-plugin-dll] error', e);
        reject(e);
      });
    });
  });
  api.addMiddlewareAhead(function () {
    return serveStatic(dllDir);
  });
  api.chainWebpackConfig(function (webpackConfig) {
    var webpack = require(api._resolveDeps('af-webpack/webpack')); // eslint-disable-line


    webpackConfig.plugin('dll-reference').use(webpack.DllReferencePlugin, [{
      context: paths.absSrcPath,
      manifest: dllManifest
    }]);
  });
  api.addHTMLHeadScript({
    src: '/depot.dll.js'
  });
}