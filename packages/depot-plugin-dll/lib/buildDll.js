"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _rimraf = _interopRequireDefault(require("rimraf"));

var _fs = require("fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _default(opts = {}) {
  const dllDir = opts.dllDir,
        api = opts.api,
        include = opts.include,
        exclude = opts.exclude;
  console.log('dllDir::', dllDir);
  const paths = api.paths,
        _resolveDeps = api._resolveDeps,
        _api$_ = api._,
        pullAll = _api$_.pullAll,
        uniq = _api$_.uniq;
  console.log('paths.cwd:::', paths.cwd);
  const pkgFile = (0, _path.join)(paths.cwd, 'package.json');
  const pkg = (0, _fs.existsSync)(pkgFile) ? require(pkgFile) : {}; // eslint-disable-line

  const depNames = pullAll(uniq(Object.keys(pkg.dependencies || {}).concat(include || [])), exclude).filter(dep => {
    return dep !== 'depot' && !dep.startsWith('depot-plugin-');
  });
  console.log('depNames::', depNames);

  const webpack = require(_resolveDeps('af-webpack/webpack'));

  const files = uniq([...depNames, 'depot/link', 'depot/dynamic', 'depot/navlink', 'depot/redirect', 'depot/router', 'depot/withRouter', 'depot/_renderRoutes', 'depot/_createHistory', 'react', 'react-dom', 'react-router-dom']).sort((a, b) => a > b ? 1 : -1);
  console.log('files:::', files);
  const filesInfoFile = (0, _path.join)(dllDir, 'filesInfo.json');

  if ((0, _fs.existsSync)(filesInfoFile)) {
    if (JSON.parse((0, _fs.readFileSync)(filesInfoFile, 'utf-8')).join(', ') === files.join(', ')) {
      console.log(`[depot-plugin-dll] File list is equal, don't generate the dll file.`);
      return Promise.resolve();
    }
  }

  const afWebpackOpts = api.applyPlugins('modifyAFWebpackOpts', {
    initialValue: {
      cwd: paths.cwd,
      disableBabelTransform: true,
      alias: {},
      babel: {}
    }
  });

  const afWebpackConfig = require(_resolveDeps('af-webpack/getConfig')).default(afWebpackOpts);

  const webpackConfig = _objectSpread({}, afWebpackConfig, {
    entry: {
      depot: files
    },
    output: {
      path: dllDir,
      filename: '[name].dll.js',
      library: '[name]',
      publicPath: api.webpackConfig.output.publicPath
    },
    plugins: [...afWebpackConfig.plugins, ...api.webpackConfig.plugins.filter(plugin => {
      return plugin instanceof webpack.DefinePlugin;
    }), new webpack.DllPlugin({
      path: (0, _path.join)(dllDir, '[name].json'),
      name: '[name]',
      context: paths.absSrcPath
    })],
    resolve: _objectSpread({}, afWebpackConfig.resolve, {
      alias: _objectSpread({}, afWebpackConfig.resolve.alias, {}, api.webpackConfig.resolve.alias)
    })
  });

  return new Promise((resolve, reject) => {
    require(_resolveDeps('af-webpack/build')).default({
      webpackConfig,

      onSuccess() {
        console.log('[depot-plugin-dll] Build dll done');
        (0, _fs.writeFileSync)(filesInfoFile, JSON.stringify(files), 'utf-8');
        resolve();
      },

      onFail({
        err
      }) {
        _rimraf.default.sync(dllDir);

        reject(err);
      }

    });
  });
}