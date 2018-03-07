'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _HttpMock = _interopRequireDefault(require('./HttpMock'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _default(api) {
  api.register('beforeServer', ({ args: { devServer } }) => {
    new _HttpMock.default({
      devServer,
      cwd: api.service.cwd,
      api,
    });
  });
}
