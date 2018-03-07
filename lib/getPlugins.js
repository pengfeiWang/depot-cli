'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _resolve = _interopRequireDefault(require('resolve'));

var _assert = _interopRequireDefault(require('assert'));

var _registerBabel = _interopRequireWildcard(require('./registerBabel'));

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          var desc =
            Object.defineProperty && Object.getOwnPropertyDescriptor
              ? Object.getOwnPropertyDescriptor(obj, key)
              : {};
          if (desc.get || desc.set) {
            Object.defineProperty(newObj, key, desc);
          } else {
            newObj[key] = obj[key];
          }
        }
      }
    }
    newObj.default = obj;
    return newObj;
  }
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _sliceIterator(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;
  try {
    for (
      var _i = arr[Symbol.iterator](), _s;
      !(_n = (_s = _i.next()).done);
      _n = true
    ) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i['return'] != null) _i['return']();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}

function _slicedToArray(arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (Symbol.iterator in Object(arr)) {
    return _sliceIterator(arr, i);
  } else {
    throw new TypeError('Invalid attempt to destructure non-iterable instance');
  }
}

const debug = require('debug')('umi-build-dev:getPlugin');

function _default(opts = {}) {
  const _opts$configPlugins = opts.configPlugins,
    configPlugins = _opts$configPlugins === void 0 ? [] : _opts$configPlugins,
    _opts$pluginsFromOpts = opts.pluginsFromOpts,
    pluginsFromOpts =
      _opts$pluginsFromOpts === void 0 ? [] : _opts$pluginsFromOpts,
    babel = opts.babel,
    cwd = opts.cwd;

  function pluginToPath(plugins) {
    return plugins.map(p => {
      (0, _assert.default)(
        Array.isArray(p) || typeof p === 'string',
        `Plugin config should be String or Array, but got ${p}`,
      );

      if (typeof p === 'string') {
        p = [p];
      }

      const _p = p,
        _p2 = _slicedToArray(_p, 2),
        path = _p2[0],
        opts = _p2[1];

      try {
        return [
          _resolve.default.sync(path, {
            basedir: cwd,
          }),
          opts,
        ];
      } catch (e) {
        throw new Error(`Plugin ${p} don't exists.`);
      }
    });
  } // 拿到绝对路径

  const pluginPaths = [
    ...pluginToPath(configPlugins),
    ...pluginToPath(pluginsFromOpts),
  ]; // 用户给的插件需要做 babel 转换

  if (pluginPaths.length) {
    (0, _registerBabel.addBabelRegisterFiles)(pluginPaths.map(p => p[0]));
    (0, _registerBabel.default)(babel, {
      cwd,
    });
  } // 内置插件

  const builtInPlugins = [
    './plugins/global-css',
    './plugins/layout',
    './plugins/fastclick',
    './plugins/hd',
    './plugins/mock',
    './plugins/hash-history',
    './plugins/plugin-dva',
    './plugins/plugin-generator-menu',
    './plugins/404',
  ];
  const plugins = [
    // builtIn 的在最前面
    ...builtInPlugins.map(p => {
      const apply = require(p); // eslint-disable-line

      let opts;

      if (Array.isArray(p)) {
        opts = p[1]; // eslint-disable-line

        p = [0];
      }

      return {
        id: p.replace(/^.\//, 'built-in:'),
        apply: apply.default || apply,
        opts,
      };
    }),
    ...pluginPaths.map(p => {
      const _p3 = _slicedToArray(p, 2),
        path = _p3[0],
        opts = _p3[1];

      const apply = require(path); // eslint-disable-line

      return {
        id: path.replace(cwd, 'user:'),
        apply: apply.default || apply,
        opts,
      };
    }),
  ];
  debug(`plugins: ${plugins.map(p => p.id)}`);
  return plugins;
}
