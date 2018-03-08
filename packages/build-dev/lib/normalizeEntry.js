"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

// 两个地方用到：
//
// 1. 生成 HTML 时注入 JS 和 CSS
// 2. 打包 JS 时动态 JS 的 chunkName
function _default(entry) {
  return entry.replace(/^.(\/|\\)/, '').replace(/(\/|\\)/g, '__').replace(/\.jsx?$/, '').replace(/\.tsx?$/, '');
}