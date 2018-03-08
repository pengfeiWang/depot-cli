"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

// import assert from 'assert';
function _default(api) {
  return {
    name: 'directoryConfigRoute',

    onChange() {
      api.service.restart(
      /* why */
      'Config directoryConfigRoute Changed');
    }

  };
}