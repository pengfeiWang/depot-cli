'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = getRouteConfigFromDir;

var _fs = require('fs');

var _path = require('path');

var _depotUtils = require('depot-utils');

var _assert = _interopRequireDefault(require('assert'));

var _getYamlConfig = _interopRequireDefault(require('./getYamlConfig'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

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

const debug = require('debug')('depot-build-dev:getRouteConfigFromDir');

const JS_EXTNAMES = ['.js', '.jsx', '.ts', '.tsx'];

function getRouteConfigFromDir(paths) {
  const cwd = paths.cwd,
    absPagesPath = paths.absPagesPath,
    absSrcPath = paths.absSrcPath,
    _paths$dirPath = paths.dirPath,
    dirPath = _paths$dirPath === void 0 ? '' : _paths$dirPath;
  const absPath = (0, _path.join)(absPagesPath, dirPath);
  const files = (0, _fs.readdirSync)(absPath);
  const absLayoutFile = (0, _depotUtils.findJS)(absPagesPath, '_layout');

  if (absLayoutFile) {
    throw new Error(
      'root _layout.js is not supported, use layouts/index.js instead',
    );
  }

  const routes = files
    .filter(file => {
      if (
        file.charAt(0) === '.' ||
        file.charAt(0) === '_' ||
        /\.(test|spec)\.(j|t)sx?$/.test(file)
      )
        return false;
      return true;
    })
    .sort(a => (a.charAt(0) === '$' ? 1 : -1))
    .reduce(handleFile.bind(null, paths, absPath), [])
    .sort((a, b) => {
      if (a._sorted || b._sorted) return 0;
      if (a.isParamsRoute !== b.isParamsRoute) return a.isParamsRoute ? 1 : -1;
      if (a.exact !== b.exact) return !a.exact ? 1 : -1;

      if (a.path && b.path) {
        return a.path > b.path ? 1 : -1;
      }

      return 0;
    })
    .map(a => {
      delete a._sorted;
      delete a.isParamsRoute;
      return a;
    });
  /**
   * dirPath 为空 absSrcPath 为真, 处理 layout
   */

  if (dirPath === '' && absSrcPath) {
    const globalLayoutFile =
      (0, _depotUtils.findJS)(absSrcPath, 'layouts/index') ||
      (0, _depotUtils.findJS)(absSrcPath, 'layout/index');

    if (globalLayoutFile) {
      const wrappedRoutes = [];
      addRoute(
        wrappedRoutes,
        {
          path: '/',
          component: `./${(0, _path.relative)(cwd, globalLayoutFile)}`,
          routes,
        },
        {
          componentFile: globalLayoutFile,
        },
      );
      return wrappedRoutes;
    }
  }

  return routes;
}

function handleFile(paths, absPath, memo, file) {
  const cwd = paths.cwd,
    absPagesPath = paths.absPagesPath,
    _paths$dirPath2 = paths.dirPath,
    dirPath = _paths$dirPath2 === void 0 ? '' : _paths$dirPath2;
  const absFilePath = (0, _path.join)(absPath, file);
  const stats = (0, _fs.statSync)(absFilePath);
  const isParamsRoute = file.charAt(0) === '$';

  if (stats.isDirectory()) {
    const newDirPath = (0, _path.join)(dirPath, file); // routes & _layout

    const routes = getRouteConfigFromDir(
      _objectSpread({}, paths, {
        dirPath: newDirPath,
      }),
    );
    const absLayoutFile = (0, _depotUtils.findJS)(
      (0, _path.join)(absPagesPath, newDirPath),
      '_layout',
    );

    if (absLayoutFile) {
      addRoute(
        memo,
        {
          path: normalizePath(newDirPath),
          exact: false,
          component: `./${(0, _depotUtils.winPath)(
            (0, _path.relative)(cwd, absLayoutFile),
          )}`,
          routes,
          isParamsRoute,
        },
        {
          componentFile: absLayoutFile,
        },
      );
    } else {
      memo = memo.concat(
        routes.map(route => {
          return _objectSpread({}, route, {
            _sorted: true,
          });
        }),
      );
    }
  } else if (stats.isFile() && isValidJS(file)) {
    const bName = (0, _path.basename)(file, (0, _path.extname)(file));
    const path = normalizePath((0, _path.join)(dirPath, bName));
    addRoute(
      memo,
      {
        path,
        exact: true,
        component: `./${(0, _depotUtils.winPath)(
          (0, _path.relative)(cwd, absFilePath),
        )}`,
        isParamsRoute,
      },
      {
        componentFile: absFilePath,
      },
    );
  }

  return memo;
}

function normalizePath(path) {
  let newPath = `/${(0, _depotUtils.winPath)(path)
    .split('/')
    .map(path => path.replace(/^\$/, ':').replace(/\$$/, '?'))
    .join('/')}`; // /index/index -> /

  if (newPath === '/index/index') {
    newPath = '/';
  } // /xxxx/index -> /xxxx/

  newPath = newPath.replace(/\/index$/, '/'); // remove the last slash
  // e.g. /abc/ -> /abc

  if (newPath !== '/' && newPath.slice(-1) === '/') {
    newPath = newPath.slice(0, -1);
  }

  return newPath;
}

function addRoute(memo, route, { componentFile }) {
  const code = (0, _fs.readFileSync)(componentFile, 'utf-8');
  debug(`parse yaml from ${componentFile}`);
  const config = (0, _getYamlConfig.default)(code);
  ['path', 'exact', 'component', 'routes'].forEach(key => {
    (0, _assert.default)(
      !(key in config),
      `Unexpected key ${key} in file ${componentFile}`,
    );
  });
  memo.push(_objectSpread({}, route, {}, config));
}

function isValidJS(file) {
  return JS_EXTNAMES.includes((0, _path.extname)(file));
}
