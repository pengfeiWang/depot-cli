'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _createBrowserHistory = _interopRequireDefault(
  require('history/createBrowserHistory'),
);

var _utils = require('./utils');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _default(opts) {
  var history = (0, _createBrowserHistory.default)(opts);

  if (__UMI_HTML_SUFFIX) {
    var oldPush = history.push;
    var oldReplace = history.replace;

    history.push = function(path, state) {
      oldPush((0, _utils.normalizePath)(path), state);
    };

    history.replace = function(path, state) {
      oldReplace((0, _utils.normalizePath)(path), state);
    };
  }

  return history;
}