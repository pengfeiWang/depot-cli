"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = build;

var _Service = _interopRequireDefault(require("./Service"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function build(opts = {}) {
  const service = new _Service.default(opts.cwd, opts);
  return service.build();
}