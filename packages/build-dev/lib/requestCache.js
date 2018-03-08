"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRequest = setRequest;
exports.getRequest = getRequest;

var _assert = _interopRequireDefault(require("assert"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = require('debug')('umi-build-dev:requestCache'); // Urls user requested


const requested = {};

function setRequest(url, opts = {}) {
  (0, _assert.default)(typeof url === 'string', `request url must be string, but got ${url}`);
  debug(`request: ${url}`);
  const onChange = opts.onChange;

  if (!requested[url]) {
    requested[url] = 1;
    if (url === '/index.html') requested['/'] = 1;

    if (onChange) {
      onChange();
    }
  }
}

function getRequest() {
  return requested;
}