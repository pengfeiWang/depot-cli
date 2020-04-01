"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _assert = _interopRequireDefault(require("assert"));

var _path = require("path");

var _lodash = require("lodash");

var _depotUtils = require("depot-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _default = (routes, pagesPath = 'src/pages', parentRoutePath = '/') => {
  // cloneDeep 是为了避免 patch 多次
  const clonedRoutes = (0, _lodash.cloneDeep)(routes);
  patchRoutes(clonedRoutes, pagesPath, parentRoutePath);
  return clonedRoutes;
};

exports.default = _default;

function patchRoutes(routes, pagesPath, parentRoutePath) {
  (0, _assert.default)(Array.isArray(routes), `routes should be Array, but got ${routes}`);
  routes.forEach(route => {
    patchRoute(route, pagesPath, parentRoutePath);
  });
}

function patchRoute(route, pagesPath, parentRoutePath) {
  // route.component start from pages
  if (route.component) {
    route.component = resolveComponent(pagesPath, route.component);
  } // path patch must be before bigfish patch


  if (route.path && route.path.charAt(0) !== '/') {
    if ((0, _depotUtils.isUrl)(route.path)) {
      route.path = (0, _depotUtils.winPath)(route.path);
    } else {
      route.path = (0, _depotUtils.winPath)((0, _path.join)(parentRoutePath, route.path));
    }
  } // Compatible with bigfish


  if (process.env.BIGFISH_COMPAT) {
    if (route.childRoutes) {
      route.routes = route.childRoutes;
      delete route.childRoutes;
    }

    if (route.indexRoute) {
      if (route.indexRoute.redirect) {
        let redirect = route.indexRoute.redirect;

        if (redirect.charAt(0) !== '/') {
          redirect = (0, _depotUtils.winPath)((0, _path.join)(route.path, redirect));
        }

        if (route.indexRoute.component || route.routes) {
          if (!route.routes) {
            route.routes = [];
          }

          route.routes.unshift({
            path: route.path,
            redirect
          });
        } else {
          route.redirect = redirect;
        }
      }

      if (route.indexRoute.component) {
        if (!route.routes) {
          route.routes = [];
        }

        const parsedRoute = _objectSpread({}, route.indexRoute, {
          path: route.path,
          exact: true,
          component: route.indexRoute.component
        });

        delete parsedRoute.redirect;
        route.routes.unshift(parsedRoute);
      }

      delete route.indexRoute;
    }
  }

  if (route.redirect && route.redirect.charAt(0) !== '/') {
    route.redirect = (0, _depotUtils.winPath)((0, _path.join)(parentRoutePath, route.redirect));
  }

  if (route.routes) {
    patchRoutes(route.routes, pagesPath, route.path);
  } else if (!('exact' in route)) {
    route.exact = true;
  }

  return route;
}

function resolveComponent(pagesPath, component) {
  const ret = (0, _depotUtils.winPath)((0, _path.join)(pagesPath, component));

  if (ret.indexOf('./') !== 0) {
    return `./${ret}`;
  }
}