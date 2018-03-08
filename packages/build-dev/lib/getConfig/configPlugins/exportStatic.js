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
    name: 'exportStatic',

    validate(val) {
      (0, _assert.default)((0, _isPlainObject.default)(val) || typeof val === 'boolean', `"${api.relativeFile}" 的 "exportStatic" 配置必须是 "对象" 或者 "布尔值"，但你配置的是 ${val.toString()} 。`);
    }

  };
}