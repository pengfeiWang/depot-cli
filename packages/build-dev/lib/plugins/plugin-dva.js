"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _fs = require("fs");

var _path = require("path");

var _globby = _interopRequireDefault(require("globby"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

// const ROUTE_FILES = ['page.js', 'page.ts', 'page.jsx', 'page.tsx'];
function _default(api) {
  const _api$placeholder = api.placeholder,
        RENDER = _api$placeholder.RENDER,
        ROUTER_MODIFIER = _api$placeholder.ROUTER_MODIFIER,
        IMPORT = _api$placeholder.IMPORT;
  const paths = api.service.paths;
  const winPath = api.utils.winPath;
  const dvaContainerPath = (0, _path.join)(paths.absTmpDirPath, 'DvaContainer.js');
  const isProduction = process.env.NODE_ENV === 'production';

  function getModels() {
    const pattern = [`${paths.absSrcPath}/models/*.{ts,js}`, `${paths.absSrcPath}/modules/*/models/*.{ts,js}`];

    const modelPaths = _globby.default.sync(pattern, {
      cwd: paths.absSrcPath
    });

    const mds = modelPaths.map(path => `
    app.model({ ...(require('${path}').default) });
  `.trim()).join('\r\n');
    return mds;
  }

  function getPageModels(pageJSFile) {
    const filePath = (0, _path.join)(paths.absTmpDirPath, pageJSFile); // const fileName = basename(filePath);
    // if (ROUTE_FILES.indexOf(fileName) > -1) {

    const root = (0, _path.dirname)(filePath);
    const modelPaths = _globby.default.sync('../models/*.{ts,js}', {
      cwd: root
    }) || [];
    return modelPaths.map(m => (0, _path.join)(root, m)); // } else {
    //   return [];
    // }
  }

  function getPlugins() {
    const pluginPaths = _globby.default.sync('../../plugins/*.js', {
      cwd: paths.absSrcPath
    });

    return pluginPaths.map(path => `
    app.use(require('../${path}').default);
  `.trim()).join('\r\n');
  }

  function stripFirstSlash(path) {
    if (path.charAt(0) === '/') {
      return path.slice(1);
    } else {
      return path;
    }
  }

  function chunkName(path) {
    return stripFirstSlash(winPath(path.replace(paths.cwd, ''))).replace(/\//g, '__');
  }

  api.register('generateFiles', () => {
    // const tpl = join(__dirname, '../template/DvaContainer.js');
    const tpl = (0, _path.join)(__dirname, '../../template/DvaContainer.js');
    let tplContent = (0, _fs.readFileSync)(tpl, 'utf-8');
    tplContent = tplContent.replace('<%= RegisterPlugins %>', getPlugins()).replace('<%= RegisterModels %>', getModels());
    (0, _fs.writeFileSync)(dvaContainerPath, tplContent, 'utf-8');
  });
  api.register('modifyRouterFile', ({
    memo
  }) => {
    return memo.replace(IMPORT, `
import { routerRedux } from 'dva/router';
${isProduction ? `import _dvaDynamic from 'dva/dynamic';` : ''}
${IMPORT}
      `.trim()).replace(ROUTER_MODIFIER, `
const { ConnectedRouter } = routerRedux;
Router = ConnectedRouter;
${ROUTER_MODIFIER}
      `.trim());
  });

  if (isProduction) {
    api.register('modifyRouteComponent', ({
      memo,
      args
    }) => {
      const pageJSFile = args.pageJSFile,
            webpackChunkName = args.webpackChunkName,
            config = args.config;
      let ret = `
_dvaDynamic({
  <%= MODELS %>
  /* webpackChunkName: '${webpackChunkName}' */
  component: () => import('${pageJSFile}'),
})
      `.trim();
      const models = getPageModels(pageJSFile);

      if (models && models.length) {
        ret = ret.replace('<%= MODELS %>', `
app: window.g_app,
models: () => [
  ${models.map(model => {
          return `/* webpackChunkName: '${chunkName(model)}' */
        import('${winPath((0, _path.relative)(paths.absTmpDirPath, model))}')`;
        }).join(',\r\n  ')}
],
      `.trim());
      }

      return ret.replace('<%= MODELS %>', '');
    });
  }

  api.register('modifyEntryFile', ({
    memo
  }) => {
    return memo.replace(RENDER, `
const DvaContainer = require('./DvaContainer').default;
ReactDOM.render(React.createElement(
  DvaContainer,
  null,
  React.createElement(require('./router').default)
), document.getElementById('root'));
      `.trim());
  });
  api.register('modifyAFWebpackOpts', ({
    memo
  }) => {
    memo.alias = _extends({}, memo.alias, {
      dva: (0, _path.dirname)(require.resolve('dva/package')),
      'dva-loading': require.resolve('dva-loading')
    });
    return memo;
  });
  api.register('modifyPageWatchers', ({
    memo
  }) => {
    return [...memo, (0, _path.join)(paths.absSrcPath, 'models'), (0, _path.join)(paths.absSrcPath, 'plugins')];
  });
}