"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _getUserConfigPlugins = _interopRequireDefault(require("af-webpack/getUserConfigPlugins"));

var _depotUtils = require("depot-utils");

var _path = require("path");

var _reactDevUtils = require("af-webpack/react-dev-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const plugins = (0, _getUserConfigPlugins.default)();

function noop() {
  return true;
}

const excludes = ['entry', 'outputPath'];

function _default(api) {
  const debug = api.debug,
        cwd = api.cwd,
        config = api.config,
        paths = api.paths; // 把 af-webpack 的配置插件转化为 depot-build-dev 的

  api._registerConfig(() => {
    return plugins.filter(p => !excludes.includes(p.name)).map(({
      name,
      validate = noop
    }) => {
      return api => ({
        name,
        validate,

        onChange(newConfig) {
          try {
            debug(`Config ${name} changed to ${JSON.stringify(newConfig[name])}`);
          } catch (e) {}

          if (name === 'proxy') {
            global.g_depot_reloadProxy(newConfig[name]);
          } else {
            api.service.restart(`${name} changed`);
          }
        }

      });
    });
  });

  const reactDir = (0, _depotUtils.compatDirname)('react/package.json', cwd, (0, _path.dirname)(require.resolve('react/package.json')));
  const reactDOMDir = (0, _depotUtils.compatDirname)('react-dom/package.json', cwd, (0, _path.dirname)(require.resolve('react-dom/package.json')));
  const reactRouterDir = (0, _depotUtils.compatDirname)('react-router/package.json', cwd, (0, _path.dirname)(require.resolve('react-router/package.json')));
  const reactRouterDOMDir = (0, _depotUtils.compatDirname)('react-router-dom/package.json', cwd, (0, _path.dirname)(require.resolve('react-router-dom/package.json')));
  const reactRouterConfigDir = (0, _depotUtils.compatDirname)('react-router-config/package.json', cwd, (0, _path.dirname)(require.resolve('react-router-config/package.json')));
  api.chainWebpackConfig(webpackConfig => {
    webpackConfig.resolve.alias.set('react', reactDir).set('react-dom', reactDOMDir).set('react-router', reactRouterDir).set('react-router-dom', reactRouterDOMDir).set('react-router-config', reactRouterConfigDir).set('history', (0, _depotUtils.compatDirname)('depot-history/package.json', cwd, (0, _path.dirname)(require.resolve('depot-history/package.json')))).set('@', paths.absSrcPath).set('@tmp', paths.absTmpDirPath).set('depot/link', (0, _path.join)(process.env.DEPOT_DIR, 'lib/link.js')).set('depot/dynamic', (0, _path.join)(process.env.DEPOT_DIR, 'lib/dynamic.js')).set('depot/navlink', (0, _path.join)(process.env.DEPOT_DIR, 'lib/navlink.js')).set('depot/redirect', (0, _path.join)(process.env.DEPOT_DIR, 'lib/redirect.js')).set('depot/prompt', (0, _path.join)(process.env.DEPOT_DIR, 'lib/prompt.js')).set('depot/router', (0, _path.join)(process.env.DEPOT_DIR, 'lib/router.js')).set('depot/withRouter', (0, _path.join)(process.env.DEPOT_DIR, 'lib/withRouter.js')).set('depot/_renderRoutes', (0, _path.join)(process.env.DEPOT_DIR, 'lib/renderRoutes.js')).set('depot/_createHistory', (0, _path.join)(process.env.DEPOT_DIR, 'lib/createHistory.js')).set('depot/_runtimePlugin', (0, _path.join)(process.env.DEPOT_DIR, 'lib/runtimePlugin.js'));
  });
  api.addVersionInfo([`react@${require((0, _path.join)(reactDir, 'package.json')).version} (${reactDir})`, `react-dom@${require((0, _path.join)(reactDOMDir, 'package.json')).version} (${reactDOMDir})`, `react-router@${require((0, _path.join)(reactRouterDir, 'package.json')).version} (${reactRouterDir})`, `react-router-dom@${require((0, _path.join)(reactRouterDOMDir, 'package.json')).version} (${reactRouterDOMDir})`, `react-router-config@${require((0, _path.join)(reactRouterConfigDir, 'package.json')).version} (${reactRouterConfigDir})`]);
  api.modifyAFWebpackOpts(memo => {
    const isDev = process.env.NODE_ENV === 'development';
    const entryScript = (0, _path.join)(cwd, `./${paths.tmpDirPath}/depot.js`);
    const setPublicPathFile = (0, _path.join)(__dirname, '../../template/setPublicPath.js');
    const setPublicPath = config.runtimePublicPath || config.exportStatic && config.exportStatic.dynamicRoot;
    const entry = isDev ? {
      depot: [...(process.env.HMR === 'none' ? [] : [_reactDevUtils.webpackHotDevClientPath]), ...(setPublicPath ? [setPublicPathFile] : []), entryScript]
    } : {
      depot: [...(setPublicPath ? [setPublicPathFile] : []), entryScript]
    };

    const targets = _objectSpread({
      chrome: 49,
      firefox: 64,
      safari: 10,
      edge: 13,
      ios: 10
    }, config.targets || {}); // Transform targets to browserslist for autoprefixer


    const browserslist = config.browserslist || targets.browsers || Object.keys(targets).filter(key => {
      return !['node', 'esmodules'].includes(key);
    }).map(key => {
      return `${key} >= ${targets[key]}`;
    });
    return _objectSpread({}, memo, config, {
      cwd,
      browserslist,
      entry,
      outputPath: paths.absOutputPath,
      disableDynamicImport: true,
      babel: config.babel || {
        presets: [[require.resolve('depot-babel-preset'), {
          targets,
          env: _objectSpread({
            useBuiltIns: 'entry'
          }, config.treeShaking ? {
            modules: false
          } : {})
        }]]
      },
      define: _objectSpread({
        'process.env.BASE_URL': config.base || '/',
        __DEPOT_BIGFISH_COMPAT: process.env.BIGFISH_COMPAT,
        __DEPOT_HTML_SUFFIX: !!(config.exportStatic && typeof config.exportStatic === 'object' && config.exportStatic.htmlSuffix)
      }, config.define || {}),
      publicPath: isDev ? '/' : config.publicPath != null ? config.publicPath : '/'
    });
  });
}