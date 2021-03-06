"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _getRouteConfig = _interopRequireDefault(require("../../routes/getRouteConfig"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = require('debug')('depot-build-dev:getRouteManager');

function _default(service) {
  const paths = service.paths,
        config = service.config;
  return {
    routes: null,

    fetchRoutes() {
      debug('fetch routes');
      const routes = service.applyPlugins('modifyRoutes', {
        initialValue: (0, _getRouteConfig.default)(paths, config, route => {
          // Patch
          service.applyPlugins('onPatchRoute', {
            args: {
              route
            }
          });
        })
      });
      debug('fetch routes done');
      debug(routes);
      this.routes = routes;
      service.routes = routes;
    }

  };
}