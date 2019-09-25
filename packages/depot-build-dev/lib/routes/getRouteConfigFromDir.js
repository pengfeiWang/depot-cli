'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = getRouteConfigFromDir;

var _fs = require('fs');

var _path = require('path');

var _depotUtils = require('depot-utils');

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

// import assert from 'assert';
// import getYamlConfig from './getYamlConfig';
const debug = require('debug')('depot-build-dev:getRouteConfigFromDir');

const JS_EXTNAMES = ['.js', '.jsx', '.ts', '.tsx'];

function getRouteConfigFromDir(paths, config) {
  const cwd = paths.cwd,
    absPagesPath = paths.absPagesPath,
    absSrcPath = paths.absSrcPath,
    _paths$dirPath = paths.dirPath,
    dirPath = _paths$dirPath === void 0 ? '' : _paths$dirPath;
  const closeModules = config.closeModules;
  const absPath = (0, _path.join)(absPagesPath, dirPath);
  const files = (0, _fs.readdirSync)(absPath);
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
    .filter(file => {
      if (
        file.charAt(0) === '.' ||
        file.charAt(0) === '_' ||
        /\.(test|spec)\.(j|t)sx?$/.test(file)
      )
        return false;
      const absFile = (0, _path.join)(absPath, file);
      const stats = (0, _fs.statSync)(absFile);

      if (stats.isDirectory()) {
        if (closeModules.includes(file)) return false;
        return true;
      }

      return false;
    })
    .reduce(transformConfigToRoutes.bind(null, paths, absPath), []);

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
          exact: false,
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

function transformConfigToRoutes(paths, absPath, memo, file) {
  const cwd = paths.cwd,
    absPagesPath = paths.absPagesPath,
    absSrcPath = paths.absSrcPath,
    _paths$dirPath2 = paths.dirPath,
    dirPath = _paths$dirPath2 === void 0 ? '' : _paths$dirPath2;
  const absConfig = readConfig(absPath, file);

  if (absConfig) {
    addRoute(
      memo,
      toRoutes(
        _objectSpread({}, paths, {
          absPath,
          absConfig,
          dirPath: file,
        }),
      ),
    );
  }

  return memo;
}

function transform(cfg) {
  const cwd = cfg.cwd,
    absPath = cfg.absPath,
    absConfig = cfg.absConfig,
    absTmpDirPath = cfg.absTmpDirPath,
    dirPath = cfg.dirPath;
  const _absConfig$routePath = absConfig.routePath,
    routePath =
      _absConfig$routePath === void 0 ? 'index.js' : _absConfig$routePath,
    moduleLayout = absConfig.moduleLayout,
    modulePath = absConfig.modulePath,
    _absConfig$children = absConfig.children,
    children = _absConfig$children === void 0 ? [] : _absConfig$children;
  delete absConfig.routePath;
  delete absConfig.moduleLayout;
  delete absConfig.modulePath;
  delete absConfig.children;
  delete absConfig.depModel;

  const route = _objectSpread({}, absConfig, {
    path: normalizePath(routePath),
    component: modulePath,
    exact: true,
  });

  if (moduleLayout) {
    route.component = `./${(0, _depotUtils.winPath)(
      (0, _path.relative)(cwd, moduleLayout),
    )}`;
    route.exact = false;
    route.routes = [
      _objectSpread({}, absConfig, {
        path: normalizePath(routePath),
        component: modulePath,
        exact: true,
      }),
    ];
  }

  if (children.length) {
    route.routes = (route.routes || []).concat(
      ...children.map(it => {
        it.routePath = normalizePath(
          `${normalizePath(routePath)}/${it.routePath}`,
        );
        return toRoutes(
          _objectSpread({}, cfg, {
            absConfig: it,
            dirPath: `${dirPath}`,
          }),
        );
      }),
    );
  }

  return route;
}

function toRoutes(cfg) {
  const cwd = cfg.cwd,
    absTmpDirPath = cfg.absTmpDirPath,
    absPath = cfg.absPath,
    absConfig = cfg.absConfig,
    dirPath = cfg.dirPath;
  const moduleLayout = absConfig.moduleLayout,
    modulePath = absConfig.modulePath;
  if (moduleLayout)
    absConfig.moduleLayout = (0, _path.join)(
      absPath,
      dirPath,
      moduleLayout || '',
    );
  /* modulePath 为 undefined 时可能会出错 */

  absConfig.modulePath = `./${(0, _depotUtils.winPath)(
    (0, _path.relative)(
      cwd,
      (0, _path.join)(absPath, dirPath, modulePath || ''),
    ),
  )}`;
  return transform(cfg);
}

function readConfig(absPath, dir, fileName = 'config.js') {
  const absFilePath = (0, _path.join)(absPath, dir, fileName);

  if (
    (0, _fs.existsSync)(absFilePath) &&
    (0, _fs.statSync)(absFilePath).isFile()
  ) {
    delete require.cache[absFilePath];
    return require(absFilePath); // eslint-disable-line
  }

  return '';
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

  if (/^\/+/.test(newPath)) {
    newPath = newPath.replace(/^\/+/, '/');
  }

  return newPath;
}

function addRoute(
  memo,
  route,
  /* , { componentFile } */
) {
  // const code = readFileSync(componentFile, 'utf-8');
  // debug(`parse yaml from ${componentFile}`);
  // const config = getYamlConfig(code);
  // ['path', 'exact', 'component', 'routes'].forEach(key => {
  //   assert(!(key in config), `Unexpected key ${key} in file ${componentFile}`);
  // });
  memo.push(_objectSpread({}, route));
}

function isValidJS(file) {
  return JS_EXTNAMES.includes((0, _path.extname)(file));
}
