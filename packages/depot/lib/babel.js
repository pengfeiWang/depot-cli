"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _default(context, opts = {}) {
  const libraryName =
  /* opts.libraryName ||  */
  'depot';
  return {
    presets: [[require.resolve('babel-preset-umi'), _objectSpread({}, opts, {
      preact: true
    })]],
    plugins: [[require.resolve('babel-plugin-import'), {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: true
    }, 'antd'], [require.resolve('babel-plugin-import'), {
      libraryName: 'antd-mobile',
      libraryDirectory: 'es',
      style: true
    }, 'antd-mobile'], [require.resolve('babel-plugin-module-resolver'), {
      alias: {
        [`${libraryName}/dynamic`]: require.resolve('./dynamic'),
        [`${libraryName}/link`]: require.resolve('./link'),
        [`${libraryName}/navlink`]: require.resolve('./navlink'),
        [`${libraryName}/redirect`]: require.resolve('./redirect'),
        [`${libraryName}/router`]: require.resolve('./router'),
        [`${libraryName}/withRouter`]: require.resolve('./withRouter'),
        [`${libraryName}/_createHistory`]: require.resolve('./createHistory')
      }
    }]]
  };
}