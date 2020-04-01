function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(source, true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function(key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key),
        );
      });
    }
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread()
  );
}

function _nonIterableSpread() {
  throw new TypeError('Invalid attempt to spread non-iterable instance');
}

function _iterableToArray(iter) {
  if (
    Symbol.iterator in Object(iter) ||
    Object.prototype.toString.call(iter) === '[object Arguments]'
  )
    return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
}

import { join } from 'path';
import rimraf from 'rimraf';
import { existsSync, readFileSync, writeFileSync } from 'fs';
export default function() {
  var opts =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var dllDir = opts.dllDir,
    api = opts.api,
    include = opts.include,
    exclude = opts.exclude;
  console.log('dllDir::', dllDir);
  var paths = api.paths,
    _resolveDeps = api._resolveDeps,
    _api$_ = api._,
    pullAll = _api$_.pullAll,
    uniq = _api$_.uniq;
  console.log('paths.cwd:::', paths.cwd);
  var pkgFile = join(paths.cwd, 'package.json');
  var pkg = existsSync(pkgFile) ? require(pkgFile) : {}; // eslint-disable-line

  var depNames = pullAll(
    uniq(Object.keys(pkg.dependencies || {}).concat(include || [])),
    exclude,
  ).filter(function(dep) {
    return dep !== 'depot' && !dep.startsWith('depot-plugin-');
  });
  console.log('depNames::', depNames);

  var webpack = require(_resolveDeps('af-webpack/webpack'));

  var files = uniq(
    [].concat(_toConsumableArray(depNames), [
      'depot/link',
      'depot/dynamic',
      'depot/navlink',
      'depot/redirect',
      'depot/router',
      'depot/withRouter',
      'depot/_renderRoutes',
      'depot/_createHistory',
      'react',
      'react-dom',
      'react-router-dom',
    ]),
  ).sort(function(a, b) {
    return a > b ? 1 : -1;
  });
  console.log('files:::', files);
  var filesInfoFile = join(dllDir, 'filesInfo.json');

  if (existsSync(filesInfoFile)) {
    if (
      JSON.parse(readFileSync(filesInfoFile, 'utf-8')).join(', ') ===
      files.join(', ')
    ) {
      console.log(
        "[depot-plugin-dll] File list is equal, don't generate the dll file.",
      );
      return Promise.resolve();
    }
  }

  var afWebpackOpts = api.applyPlugins('modifyAFWebpackOpts', {
    initialValue: {
      cwd: paths.cwd,
      disableBabelTransform: true,
      alias: {},
      babel: {},
    },
  });

  var afWebpackConfig = require(_resolveDeps('af-webpack/getConfig')).default(
    afWebpackOpts,
  );

  var webpackConfig = _objectSpread({}, afWebpackConfig, {
    entry: {
      depot: files,
    },
    output: {
      path: dllDir,
      filename: '[name].dll.js',
      library: '[name]',
      publicPath: api.webpackConfig.output.publicPath,
    },
    plugins: [].concat(
      _toConsumableArray(afWebpackConfig.plugins),
      _toConsumableArray(
        api.webpackConfig.plugins.filter(function(plugin) {
          return plugin instanceof webpack.DefinePlugin;
        }),
      ),
      [
        new webpack.DllPlugin({
          path: join(dllDir, '[name].json'),
          name: '[name]',
          context: paths.absSrcPath,
        }),
      ],
    ),
    resolve: _objectSpread({}, afWebpackConfig.resolve, {
      alias: _objectSpread(
        {},
        afWebpackConfig.resolve.alias,
        {},
        api.webpackConfig.resolve.alias,
      ),
    }),
  });

  return new Promise(function(resolve, reject) {
    require(_resolveDeps('af-webpack/build')).default({
      webpackConfig: webpackConfig,
      onSuccess: function onSuccess() {
        console.log('[depot-plugin-dll] Build dll done');
        writeFileSync(filesInfoFile, JSON.stringify(files), 'utf-8');
        resolve();
      },
      onFail: function onFail(_ref) {
        var err = _ref.err;
        rimraf.sync(dllDir);
        reject(err);
      },
    });
  });
}
