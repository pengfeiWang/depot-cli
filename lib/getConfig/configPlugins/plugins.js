'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _assert = _interopRequireDefault(require('assert'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _default(api) {
  return {
    name: 'plugins',

    validate(val) {
      (0, _assert.default)(
        Array.isArray(val),
        `Configure item plugins should be Array, but got ${val}.`,
      );
    },

    onChange() {
      api.service.restart(
        /* why */
        'Config plugins Changed',
      );
    },
  };
}