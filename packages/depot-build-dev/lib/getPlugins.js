"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;
exports.diffPlugins = diffPlugins;

var _resolve = _interopRequireDefault(require("resolve"));

var _assert = _interopRequireDefault(require("assert"));

var _chalk = _interopRequireDefault(require("chalk"));

var _path = require("path");

var _depotUtils = require("depot-utils");

var _registerBabel = _interopRequireWildcard(require("./registerBabel"));

var _isEqual = _interopRequireDefault(require("./isEqual"));

var _getCodeFrame = _interopRequireDefault(require("./utils/getCodeFrame"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

const debug = require('debug')('build-dev:getPlugin');

function _default(opts = {}) {
  const cwd = opts.cwd,
        _opts$plugins = opts.plugins,
        plugins = _opts$plugins === void 0 ? [] : _opts$plugins; // 内置插件

  const builtInPlugins = ['./plugins/commands/dev', './plugins/commands/build', './plugins/commands/cli', // './plugins/commands/inspect',
  './plugins/commands/test', './plugins/commands/help', './plugins/commands/version', './plugins/global-js', './plugins/global-css', './plugins/base', // './plugins/mountElementId',
  './plugins/mock', './plugins/dot-env', './plugins/dot-eslint', './plugins/proxy', './plugins/history', './plugins/afwebpack-config', './plugins/mountElementId', './plugins/404', // 404 must after mock
  // './plugins/atoolMonitor',
  './plugins/targets'];
  const pluginsObj = [// builtIn 的在最前面
  ...builtInPlugins.map(p => {
    let opts;

    if (Array.isArray(p)) {
      opts = p[1]; // eslint-disable-line

      p = p[0];
    }

    const apply = require(p); // eslint-disable-line


    return {
      id: p.replace(/^.\//, 'built-in:'),
      apply: apply.default || apply,
      opts
    };
  }), ...getUserPlugins(process.env.DEPOT_PLUGINS ? process.env.DEPOT_PLUGINS.split(',') : [], {
    cwd
  }), ...getUserPlugins(plugins, {
    cwd
  })];
  debug(`plugins: \n${pluginsObj.map(p => `  ${p.id}`).join('\n')}`);
  return pluginsObj;
}

function pluginToPath(plugins, {
  cwd
}) {
  return (plugins || []).map(p => {
    (0, _assert.default)(Array.isArray(p) || typeof p === 'string', `Plugin config should be String or Array, but got ${_chalk.default.red(typeof p)}`);

    if (typeof p === 'string') {
      p = [p];
    }

    let _p = p,
        _p2 = _slicedToArray(_p, 2),
        path = _p2[0],
        opts = _p2[1];

    let oldPath = path;

    try {
      if (path === 'depot-plugin-react') {
        opts = Object.assign({
          dva: true,
          antd: true,
          fastClick: true
        }, opts);
        return [_resolve.default.sync('depot-plugin-react', {
          basedir: (0, _path.join)(__dirname, '../')
        }), // winPath(join(__dirname, `../node_modules/${path}`))),
        opts];
      }

      return [_resolve.default.sync(path, {
        basedir: cwd
      }), opts];
    } catch (e) {
      throw new Error(`
Plugin ${_chalk.default.underline.cyan(oldPath)} can't be resolved

   Please try the following solutions:

     1. checkout the plugins config in your config file (.depotrc.js)
     ${path.charAt(0) !== '.' && path.charAt(0) !== '/' ? `2. install ${_chalk.default.underline.cyan(oldPath)} via npm/yarn` : ''}
`.trim());
    }
  });
}

function getUserPlugins(plugins, {
  cwd
}) {
  const pluginPaths = pluginToPath(plugins, {
    cwd
  }); // 用户给的插件需要做 babel 转换

  if (pluginPaths.length) {
    (0, _registerBabel.addBabelRegisterFiles)(pluginPaths.map(p => p[0]));
    (0, _registerBabel.default)({
      cwd
    });
  }

  return pluginPaths.map(p => {
    let _p3 = _slicedToArray(p, 2),
        path = _p3[0],
        opts = _p3[1];

    let apply;
    let oldPath = path;

    try {
      apply = require(path); // eslint-disable-line
    } catch (e) {
      throw new Error(`
Plugin ${_chalk.default.cyan.underline(oldPath)} require failed

${(0, _getCodeFrame.default)(e)}
      `.trim());
    }

    return {
      id: path.replace(makesureLastSlash(cwd), 'user:'),
      apply: apply.default || apply,
      opts
    };
  });
}

function resolveIdAndOpts({
  id,
  opts
}) {
  return {
    id,
    opts
  };
}

function toIdStr(plugins) {
  return plugins.map(p => p.id).join('^^');
}
/**
 * 返回结果：
 *   pluginsChanged: true | false
 *   optionChanged: [ 'a', 'b' ]
 */


function diffPlugins(newOption, oldOption, {
  cwd
}) {
  const newPlugins = getUserPlugins(newOption, {
    cwd
  }).map(resolveIdAndOpts);
  const oldPlugins = getUserPlugins(oldOption, {
    cwd
  }).map(resolveIdAndOpts);

  if (newPlugins.length !== oldPlugins.length) {
    return {
      pluginsChanged: true
    };
  } else if (toIdStr(newPlugins) !== toIdStr(oldPlugins)) {
    return {
      pluginsChanged: true
    };
  } else {
    return {
      optionChanged: newPlugins.filter((p, index) => {
        return !(0, _isEqual.default)(newPlugins[index].opts, oldPlugins[index].opts);
      })
    };
  }
}

function makesureLastSlash(path) {
  return path.slice(-1) === '/' ? path : `${path}/`;
}