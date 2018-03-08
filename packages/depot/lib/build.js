"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const debug = require('debug')('depot:build');

process.env.NODE_ENV = 'production';

function _default(opts = {}) {
  const extraResolveModules = opts.extraResolveModules;
  debug(`opts: ${JSON.stringify(opts)}`);
  delete opts.extraResolveModules;
  return require('../../build-dev/lib/build').default(_extends({
    // eslint-disable-line
    babel: (0, _path.resolve)(__dirname, './babel'),
    extraResolveModules: [...(extraResolveModules || []), (0, _path.resolve)(__dirname, '../../node_modules')],
    hash: true
  }, opts));
}