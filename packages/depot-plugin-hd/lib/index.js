function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import px2rem from 'postcss-plugin-px2rem';
import { join, relative } from 'path';
export default function (api) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var paths = api.paths,
      findJS = api.findJS;
  api.modifyAFWebpackOpts(function (opts) {
    opts.theme = _objectSpread({}, opts.theme || {}, {
      '@hd': '2px'
    }, options.theme || {});
    opts.extraPostCSSPlugins = [].concat(_toConsumableArray(opts.extraPostCSSPlugins || []), [px2rem(_objectSpread({
      rootValue: 100,
      minPixelValue: 2
    }, options.px2rem || {}))]);
    return opts;
  });
  api.addEntryImport(function () {
    return {
      source: relative(paths.absTmpDirPath, findJS(paths.absSrcPath, 'hd') || join(__dirname, '../template/index.js'))
    };
  });
  api.addPageWatcher([join(paths.absSrcPath, 'hd.tsx'), join(paths.absSrcPath, 'hd.ts'), join(paths.absSrcPath, 'hd.jsx'), join(paths.absSrcPath, 'hd.js')]);
}