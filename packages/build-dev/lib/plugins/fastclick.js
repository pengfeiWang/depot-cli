"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default(api) {
  const IMPORT = api.placeholder.IMPORT;
  const libraryName = api.service.libraryName;
  api.register('modifyEntryFile', ({
    memo
  }) => {
    memo = memo.replace(IMPORT, `
import FastClick from '${libraryName}-fastclick';
${IMPORT}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    FastClick.attach(document.body);
  },
  false,
);
    `.trim());
    return memo;
  });
  api.register('modifyAFWebpackOpts', ({
    memo
  }) => {
    // 期一个带 前缀的别名，是为了后面可以修改他
    memo.alias[`${libraryName}-fastclick`] = require.resolve('fastclick');
    return memo;
  });
}