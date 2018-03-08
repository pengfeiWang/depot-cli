"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _fs = require("fs");

var _path = require("path");

var _assert = _interopRequireDefault(require("assert"));

var _constants = require("./constants");

var _winPath = _interopRequireDefault(require("./winPath"));

var _getDirectoryRouteConfig = _interopRequireDefault(require("./getDirectoryRouteConfig"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DOT_JS = '.js';
const EXT_NAMES = ['.js', '.jsx', '.ts', '.tsx'];

function _default(paths, config = {}) {
  const routeConfigFile = routesConfigExists(paths.cwd);
  const directoryConfigRoute = config.directoryConfigRoute;
  let routes = [];

  if (directoryConfigRoute) {
    routes = [...(0, _getDirectoryRouteConfig.default)(paths, config)];
  } else {
    routes = routeConfigFile ? getRoutesByConfig(routeConfigFile) : getRoutesByPagesDir(paths);

    if (config.exportStatic) {
      routes.forEach(route => {
        if (route.path.indexOf(':') > -1) {
          throw new Error(`Variable path ${route.path} don\'t work with exportStatic`);
        }

        if (typeof config.exportStatic === 'object' && config.exportStatic.htmlSuffix) {
          route.path = addHtmlSuffix(route.path);
        }
      });
    }
  }

  return routes;
}

function routesConfigExists(root) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = _constants.ROUTES_CONFIG_FILE[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      const routeConfig = _step.value;

      if ((0, _fs.existsSync)((0, _path.join)(root, routeConfig))) {
        return (0, _path.join)(root, routeConfig);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return != null) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }
}

function addHtmlSuffix(path) {
  return path.slice(-1) === '/' ? path : `${path}.html`;
}

function getRoutesByConfig(routesConfigFile) {
  const routesConfig = JSON.parse((0, _fs.readFileSync)(routesConfigFile));
  (0, _assert.default)(Array.isArray(routesConfig), `router config must be Array, but got ${routesConfig}`);
  return routesConfig;
}

function variablePath(path) {
  return path.replace(/\$/g, ':');
}

function getRoutesByPagesDir(paths, dirPath = '') {
  const cwd = paths.cwd,
        absPagesPath = paths.absPagesPath;
  let ret = [];
  const path = (0, _path.join)(absPagesPath, dirPath);

  if ((0, _fs.existsSync)(path)) {
    const files = (0, _fs.readdirSync)(path);
    files.forEach(file => {
      // 包含 ., .., 以及其他 dotfile
      if (file.charAt(0) === '.') return; // TODO: move it to the plugins/404.js
      // TODO: prod 下且没有配 exportStatic 不生成
      // if (dirPath === '' && basename(file, extname(file)) === '404') return;

      const filePath = (0, _path.join)(path, file);
      const stats = (0, _fs.statSync)(filePath);
      const ext = (0, _path.extname)(file);

      if (stats.isFile() && EXT_NAMES.indexOf(ext) > -1) {
        const fullPath = (0, _path.join)(dirPath, (0, _path.basename)(file, ext));
        ret.push({
          path: (0, _winPath.default)(`/${variablePath(fullPath)}`).replace(/\/index$/, '/'),
          exact: true,
          component: `./${(0, _path.relative)(cwd, filePath)}`
        });
      } else if (stats.isDirectory()) {
        let routerFound = false;
        const fullPath = (0, _path.join)(dirPath, file);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = _constants.ROUTE_FILES[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            const routeFile = _step2.value;

            if ((0, _fs.existsSync)((0, _path.join)(absPagesPath, fullPath, routeFile))) {
              if ((0, _fs.existsSync)((0, _path.join)(absPagesPath, `${fullPath}${DOT_JS}`))) {
                throw new Error(`路由冲突，src/page 目录下同时存在 "${fullPath}${DOT_JS}" 和 "${(0, _path.join)(fullPath, routeFile)}"，两者指向同一路由。`);
              }

              ret.push({
                path: (0, _winPath.default)(`/${variablePath(fullPath)}`).replace(/\/index$/, '/'),
                exact: true,
                component: `./${(0, _path.relative)(cwd, (0, _path.join)(absPagesPath, fullPath, routeFile))}`
              });
              routerFound = true;
              break;
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        if (!routerFound) {
          ret = ret.concat(getRoutesByPagesDir(paths, fullPath));
        }
      }
    });
  }

  return ret;
}