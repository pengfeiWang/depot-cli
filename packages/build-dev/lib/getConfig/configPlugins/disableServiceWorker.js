"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default(api) {
  return {
    name: 'disableServiceWorker',

    onChange() {
      api.service.restart(
      /* why */
      'Config disableServiceWorker Changed');
    }

  };
}