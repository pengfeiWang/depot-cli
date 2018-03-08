"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createRouteMiddleware;
exports.setConfig = setConfig;

var _matchPath = _interopRequireDefault(require("react-router-dom/matchPath"));

var _requestCache = require("./requestCache");

var _HtmlGenerator = _interopRequireDefault(require("./HtmlGenerator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let config = null;
const COMPILING_PREFIX = '/__umi_dev/compiling';

function handleUmiDev(req, res, service, opts) {
  const path = req.path;
  const routePath = path.replace(COMPILING_PREFIX, '');
  const route = service.routes.filter(r => {
    return (0, _matchPath.default)(routePath, r);
  })[0];

  if (route) {
    // 尝试解决 Compiling... 不消失的问题
    (0, _requestCache.setRequest)(route.path, {
      onChange: opts.rebuildEntry
    });
  }

  res.end('done');
}

function createRouteMiddleware(service, opts = {}) {
  config = service.config;
  return (req, res, next) => {
    const path = req.path;

    if (path.startsWith(COMPILING_PREFIX)) {
      return handleUmiDev(req, res, service, opts);
    }

    const route = service.routes.filter(r => {
      return (0, _matchPath.default)(path, r);
    })[0];

    if (route) {
      service.applyPlugins('onRouteRequest', {
        args: {
          route,
          req
        }
      });
      const htmlGenerator = new _HtmlGenerator.default(service);
      const gcOpts = config.exportStatic ? {
        pageConfig: (config.pages || {})[path],
        route
      } : {};
      const content = htmlGenerator.getContent(gcOpts);
      res.setHeader('Content-Type', 'text/html');
      res.send(content);
    } else {
      next();
    }
  };
}

function setConfig(_config) {
  config = _config;
}