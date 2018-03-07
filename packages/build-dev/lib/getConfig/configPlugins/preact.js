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
    name: 'preact',

    validate(val) {
      (0, _assert.default)(
        val === true || val === false,
        `Configure item preact should be true or false, but got ${val}.`,
      );
    },

    onChange() {
      api.service.restart(
        /* why */
        'Configure item preact Changed.',
      );
    },
  };
}
