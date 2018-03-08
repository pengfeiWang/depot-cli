"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _assert = _interopRequireDefault(require("assert"));

var _isPlainObject = _interopRequireDefault(require("is-plain-object"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _default(api) {
  return {
    name: 'context',

    validate(val) {
      (0, _assert.default)((0, _isPlainObject.default)(val), `"${api.relativeFile}" 的 "context" 配置必须是 "Object 对象"，但你配置的是 ${val.toString()} 。`);
    }

  };
}