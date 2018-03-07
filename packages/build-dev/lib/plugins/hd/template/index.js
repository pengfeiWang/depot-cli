"use strict";

var _vw = _interopRequireDefault(require("./vw.js"));

var _flex = _interopRequireDefault(require("./flex.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (document.documentElement.clientWidth >= 750) {
  (0, _vw.default)(100, 750);
} else {
  (0, _flex.default)();
} // hd solution for antd-mobile@2
// ref: https://mobile.ant.design/docs/react/upgrade-notes-cn#%E9%AB%98%E6%B8%85%E6%96%B9%E6%A1%88


document.documentElement.setAttribute('data-scale', true);