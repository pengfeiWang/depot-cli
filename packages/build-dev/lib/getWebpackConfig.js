"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _fs = require("fs");

var _getConfig = _interopRequireDefault(require("af-webpack/getConfig"));

var _reactDevUtils = require("af-webpack/react-dev-utils");

var _browsers = _interopRequireDefault(require("./defaultConfigs/browsers"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const debug = require('debug')('build-dev:getWebpackConfig');

function _default(service = {}) {
  const cwd = service.cwd,
        config = service.config,
        webpackRCConfig = service.webpackRCConfig,
        babel = service.babel,
        hash = service.hash,
        routes = service.routes,
        libraryName = service.libraryName,
        staticDirectory = service.staticDirectory,
        extraResolveModules = service.extraResolveModules,
        paths = service.paths,
        preact = service.preact;
  const isDev = process.env.NODE_ENV === 'development'; // entry

  const entryScript = (0, _path.join)(cwd, `./${paths.tmpDirPath}/${libraryName}.js`);
  const setPublicPathFile = (0, _path.join)(__dirname, '../template/setPublicPath.js');
  const entry = isDev ? {
    [libraryName]: [...(process.env.HMR === 'none' ? [] : [_reactDevUtils.webpackHotDevClientPath]), entryScript]
  } : {
    [libraryName]: [setPublicPathFile, entryScript]
  };
  const pageCount = isDev ? null : Object.keys(routes).length;
  debug(`pageCount: ${pageCount}`);
  debug(`config: ${JSON.stringify(config)}`); // default react, support config with preact
  // 优先级：用户配置 > preact argument > default (React)

  const preactAlias = {
    react: require.resolve('preact-compat'),
    'react-dom': require.resolve('preact-compat'),
    'create-react-class': require.resolve('preact-compat/lib/create-react-class')
  };
  const reactAlias = {
    react: require.resolve('react'),
    'react-dom': require.resolve('react-dom')
  };
  let preactOrReactAlias = preact ? preactAlias : reactAlias;

  if (config.preact === true) {
    preactOrReactAlias = preactAlias;
  }

  if (config.preact === false) {
    preactOrReactAlias = reactAlias;
  } // 关于为啥放 webpack 而不放 babel-plugin-module-resolver 里
  // 详见：https://tinyletter.com/sorrycc/letters/babel


  const libAlias = {
    'antd-mobile': (0, _path.dirname)(require.resolve('antd-mobile/package')),
    antd: (0, _path.dirname)(require.resolve('antd/package')),
    'react-router-dom': (0, _path.dirname)(require.resolve('react-router-dom/package')),
    history: (0, _path.dirname)(require.resolve('history/package'))
  }; // 支持用户指定 antd 和 antd-mobile 的版本
  // TODO: 出错处理，用户可能指定了依赖，但未指定 npm install

  const pkgPath = (0, _path.join)(cwd, 'package.json');

  if ((0, _fs.existsSync)(pkgPath)) {
    const _require = require(pkgPath),
          _require$dependencies = _require.dependencies,
          dependencies = _require$dependencies === void 0 ? {} : _require$dependencies; // eslint-disable-line


    if (dependencies.antd) {
      libAlias.antd = (0, _path.dirname)(require.resolve((0, _path.join)(cwd, 'node_modules/antd/package')));
    }

    if (dependencies['antd-mobile']) {
      libAlias['antd-mobile'] = (0, _path.dirname)(require.resolve((0, _path.join)(cwd, 'node_modules/antd-mobile/package')));
    }
  }

  const browserslist = webpackRCConfig.browserslist || _browsers.default;

  let afWebpackOpts = _extends({
    cwd
  }, webpackRCConfig, {
    // 不允许配置
    entry,
    outputPath: (0, _path.join)(paths.absOutputPath, staticDirectory),
    hash: !isDev && hash,
    // 扩展
    babel: webpackRCConfig.babel || {
      presets: [[babel, {
        browsers: browserslist
      }]]
    },
    browserslist,
    extraResolveModules: [...(webpackRCConfig.extraResolveModules || []), ...(extraResolveModules || [])],
    cssModulesExcludes: [...(webpackRCConfig.cssModulesExcludes || []), paths.absGlobalStyle],
    define: _extends({
      // 禁用 antd-mobile 升级提醒
      'process.env.DISABLE_ANTD_MOBILE_UPGRADE': true,
      // For registerServiceWorker.js
      'process.env.BASE_URL': process.env.BASE_URL,
      __UMI_HTML_SUFFIX: !!(config.exportStatic && typeof config.exportStatic === 'object' && config.exportStatic.htmlSuffix)
    }, webpackRCConfig.define || {}),
    alias: _extends({}, preactOrReactAlias, libAlias, webpackRCConfig.alias || {})
  }, isDev ? {
    // 生产环境的 publicPath 是服务端把 assets 发布到 cdn 后配到 HTML 里的
    // 开发环境的 publicPath 写死 /static/
    publicPath: `/`
  } : _extends({
    publicPath: webpackRCConfig.publicPath || `./${staticDirectory}/`,
    commons: webpackRCConfig.commons || [{
      async: 'common',
      children: true,

      minChunks(module, count) {
        if (pageCount <= 2) {
          return count >= pageCount;
        }

        return count >= pageCount * 0.5;
      }

    }]
  }, config.disableServiceWorker ? {} : {
    serviceworker: _extends({}, webpackRCConfig.serviceworker || {})
  }));

  afWebpackOpts = service.applyPlugins('modifyAFWebpackOpts', {
    initialValue: afWebpackOpts
  });
  debug(`afWebpackOpts: ${JSON.stringify(afWebpackOpts)}`);
  let webpackConfig = (0, _getConfig.default)(afWebpackOpts);
  webpackConfig = service.applyPlugins('modifyWebpackConfig', {
    initialValue: webpackConfig
  });
  return webpackConfig;
}