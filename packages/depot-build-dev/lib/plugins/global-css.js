'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _path = require('path');

var _fs = require('fs');

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly)
      symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    keys.push.apply(keys, symbols);
  }
  return keys;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    if (i % 2) {
      ownKeys(source, true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function(key) {
        Object.defineProperty(
          target,
          key,
          Object.getOwnPropertyDescriptor(source, key),
        );
      });
    }
  }
  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true,
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

function _default(api) {
  const paths = api.paths,
    winPath = api.winPath;
  const cssFiles = [
    (0, _path.join)(paths.absSrcPath, 'global.sass'),
    (0, _path.join)(paths.absSrcPath, 'global.scss'),
    (0, _path.join)(paths.absSrcPath, 'global.less'),
    (0, _path.join)(paths.absSrcPath, 'global.css'),
  ];
  api.addEntryCode(
    `
${cssFiles
      .filter(f => (0, _fs.existsSync)(f))
      .slice(0, 1)
      .map(
        f =>
          `require('${winPath((0, _path.relative)(paths.absTmpDirPath, f))}');`,
      )
      .join('')}
    `.trim(),
  );
  api.addPageWatcher(cssFiles);
  api.modifyAFWebpackOpts(memo => {
    return _objectSpread({}, memo, {
      cssModulesExcludes: [...(memo.cssModulesExcludes || []), ...cssFiles],
    });
  });
}
