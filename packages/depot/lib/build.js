"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const debug = require('debug')('depot:build');

process.env.NODE_ENV = 'production';

function _default(opts = {}) {
  const extraResolveModules = opts.extraResolveModules;
  debug(`opts: ${JSON.stringify(opts)}`);
  delete opts.extraResolveModules;
  return require('../../build-dev/lib/build').default(_objectSpread({
    // eslint-disable-line
    babel: (0, _path.resolve)(__dirname, './babel'),
    extraResolveModules: [...(extraResolveModules || []), (0, _path.resolve)(__dirname, '../../node_modules')],
    hash: true
  }, opts));
}