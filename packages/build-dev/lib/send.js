"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = send;
exports.BUILD_DONE = exports.PAGE_LIST = void 0;

const debug = require('debug')('umi-build-dev:send');

const PAGE_LIST = 'PAGE_LIST';
exports.PAGE_LIST = PAGE_LIST;
const BUILD_DONE = 'BUILD_DONE';
exports.BUILD_DONE = BUILD_DONE;

function send(message) {
  if (process.send) {
    debug(`send ${JSON.stringify(message)}`);
    process.send(message);
  }
}