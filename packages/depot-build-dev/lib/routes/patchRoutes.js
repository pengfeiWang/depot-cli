"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _depotUtils = require("depot-utils");

var _lodash = require("lodash");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

let redirects;

var _default = (routes, config = {}, isProduction, onPatchRoute) => {
  redirects = [];
  patchRoutes(routes, config, isProduction, onPatchRoute);

  if (!config.disableRedirectHoist) {
    routes.unshift(...redirects);
  }

  return routes;
};

exports.default = _default;

function patchRoutes(routes, config, isProduction, onPatchRoute) {
  let notFoundIndex = null;
  let rootIndex = null;
  routes.forEach((route, index) => {
    patchRoute(route, config, isProduction, onPatchRoute);

    if (route.path === '/404') {
      notFoundIndex = index;
    }

    if (config.exportStatic && route.path === '/' && route.exact) {
      rootIndex = index;
    }
  }); // Transform /404 to fallback route in production and exportStatic is not set

  if (notFoundIndex !== null && isProduction && !config.exportStatic) {
    const notFoundRoute = routes.slice(notFoundIndex, notFoundIndex + 1)[0];

    if (notFoundRoute.component) {
      routes.push({
        component: notFoundRoute.component
      });
    } else if (notFoundRoute.redirect) {
      routes.push({
        redirect: notFoundRoute.redirect
      });
    } else {
      throw new Error('Invalid route config for /404');
    }
  }

  if (rootIndex !== null) {
    routes.splice(rootIndex, 0, _objectSpread({}, routes[rootIndex], {
      path: '/index.html'
    }));
  }

  if (!config.disableRedirectHoist) {
    const removedRoutes = (0, _lodash.remove)(routes, route => {
      return route.redirect;
    });
    redirects = redirects.concat(removedRoutes);
  }
}

function patchRoute(route, config, isProduction, onPatchRoute) {
  const isDynamicRoute = route.path && route.path.indexOf('/:') > -1;

  if (config.exportStatic && isDynamicRoute) {
    throw new Error(`you should not use exportStatic with dynamic route: ${route.path}`);
  } // /path -> /path.html


  if (route.path && config.exportStatic && config.exportStatic.htmlSuffix) {
    route.path = addHtmlSuffix(route.path, !!route.routes);
  } // 权限路由
  // TODO: use config from config.routes


  if (config.pages && config.pages[route.path] && config.pages[route.path].Route) {
    route.Route = config.pages[route.path].Route;
  } // Compatible the meta.Route and warn deprecated


  if (route.meta && route.meta.Route) {
    (0, _depotUtils.deprecate)('route.meta.Route', 'use route.Route instead');
    route.Route = route.meta.Route;
    delete route.meta;
  }

  if (onPatchRoute) onPatchRoute(route);

  if (route.routes) {
    patchRoutes(route.routes, config, isProduction, onPatchRoute);
  }
}

function addHtmlSuffix(path, hasRoutes) {
  if (path === '/') return path;

  if (hasRoutes) {
    return path.endsWith('/') ? path : `${path}(.html)?`;
  } else {
    return path.endsWith('/') ? `${path.slice(0, -1)}.html` : `${path}.html`;
  }
}