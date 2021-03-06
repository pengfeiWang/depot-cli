"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createRouteMiddleware;

var _getHtmlGenerator = _interopRequireDefault(require("../getHtmlGenerator"));

var _chunksToMap = _interopRequireDefault(require("../build/chunksToMap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = require('debug')('depot-build-dev:createRouteMiddleware');

function createRouteMiddleware(service) {
  return (req, res, next) => {
    const path = req.path,
          method = req.method;

    function sendHtml() {
      if (!service.__chunks) {
        setTimeout(sendHtml, 300);
        return;
      }

      const chunksMap = (0, _chunksToMap.default)(service.__chunks);
      const htmlGenerator = (0, _getHtmlGenerator.default)(service, {
        chunksMap
      });
      const content = htmlGenerator.getMatchedContent(normalizePath(path, service.config.base));
      res.setHeader('Content-Type', 'text/html');
      res.send(content);
    }

    if (path === '/favicon.ico') {
      next();
    } else {
      debug(`[${method}] ${path}`);

      if (path === '/__depotDev/routes') {
        res.setHeader('Content-Type', 'text/json');
        res.send(JSON.stringify(service.routes));
      } else {
        sendHtml();
      }
    }
  };
}

function normalizePath(path, base = '/') {
  if (path.startsWith(base)) {
    path = path.replace(base, '/');
  }

  return path;
}