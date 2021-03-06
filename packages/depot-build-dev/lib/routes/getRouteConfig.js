"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _fs = require("fs");

var _getRouteConfigFromConfigFile = _interopRequireDefault(require("./getRouteConfigFromConfigFile"));

var _getRouteConfigFromDir = _interopRequireDefault(require("./getRouteConfigFromDir"));

var _patchRoutes = _interopRequireDefault(require("./patchRoutes"));

var _getRouteConfigFromConfig = _interopRequireDefault(require("./getRouteConfigFromConfig"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (paths, config = {}, onPatchRoute) => {
  let routes = null;
  routes = (0, _getRouteConfigFromDir.default)(paths, config);
  (0, _patchRoutes.default)(routes, config,
  /* isProduction */
  process.env.NODE_ENV === 'production', onPatchRoute);
  return routes; // 声明式

  const routeConfigFile = (0, _path.join)(paths.absSrcPath, '_routes.json');

  if (config.routes) {
    // 配置式
    routes = (0, _getRouteConfigFromConfig.default)(config.routes, paths.pagesPath);
  } else if ((0, _fs.existsSync)(routeConfigFile)) {
    routes = (0, _getRouteConfigFromConfigFile.default)(routeConfigFile);
  } else {
    // 约定式
    routes = (0, _getRouteConfigFromDir.default)(paths);
  }

  (0, _patchRoutes.default)(routes, config,
  /* isProduction */
  process.env.NODE_ENV === 'production', onPatchRoute);
  return routes;
};

exports.default = _default;