"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _postcssPluginPx2rem = _interopRequireDefault(require("postcss-plugin-px2rem"));

var _path = require("path");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _default(api, options = {}) {
  const paths = api.paths,
        findJS = api.findJS;
  api.modifyAFWebpackOpts(opts => {
    opts.theme = _objectSpread({}, opts.theme || {}, {
      '@hd': '2px'
    }, options.theme || {});
    opts.extraPostCSSPlugins = [...(opts.extraPostCSSPlugins || []), (0, _postcssPluginPx2rem.default)(_objectSpread({
      rootValue: 100,
      minPixelValue: 2
    }, options.px2rem || {}))];
    return opts;
  });
  api.addEntryImport(() => {
    return {
      source: (0, _path.relative)(paths.absTmpDirPath, findJS(paths.absSrcPath, 'hd') || (0, _path.join)(__dirname, '../template/index.js'))
    };
  });
  api.addPageWatcher([(0, _path.join)(paths.absSrcPath, 'hd.tsx'), (0, _path.join)(paths.absSrcPath, 'hd.ts'), (0, _path.join)(paths.absSrcPath, 'hd.jsx'), (0, _path.join)(paths.absSrcPath, 'hd.js')]);
}