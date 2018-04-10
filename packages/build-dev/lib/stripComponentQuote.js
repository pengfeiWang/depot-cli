"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default(jsonStr) {
  return jsonStr.replace(/\"component\": (\"(.+?)\")/g, `"component": $2`).replace(/\\r\\n/g, '\r\n').replace(/\\n/g, '\r\n');
}