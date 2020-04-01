"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getModel = getModel;
exports.getGlobalModels = getGlobalModels;
exports.default = _default;

var _fs = require("fs");

var _path = require("path");

var _globby = _interopRequireDefault(require("globby"));

var _lodash = _interopRequireDefault(require("lodash.uniq"));

var _pathIsRoot = _interopRequireDefault(require("path-is-root"));

var _depotUtils = require("depot-utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function getModel(cwd, api) {
  const config = api.config,
        winPath = api.winPath;
  const modelJSPath = (0, _depotUtils.findJS)(cwd, 'model');

  if (modelJSPath) {
    return [winPath(modelJSPath)];
  }

  const stat = (0, _fs.lstatSync)(cwd);
  let configModels = [];

  if (stat.isDirectory()) {
    const moduleConfigAbsPath = (0, _path.join)(cwd, 'config.js');
    const moduleConfig = (0, _fs.existsSync)(moduleConfigAbsPath);

    if (moduleConfig) {
      const moduleConfigJson = require(moduleConfigAbsPath);

      if (moduleConfigJson && moduleConfigJson.depModel) {
        if (Array.isArray(moduleConfigJson.depModel)) {
          configModels = moduleConfigJson.depModel.map(pth => api.winPath((0, _path.join)(cwd, pth))).filter(T => T);
        } else {
          configModels.push(api.winPath((0, _path.join)(cwd, moduleConfigJson.depModel)));
        }
      }
    }
  }

  const pageModels = _globby.default.sync(`./${config.singular ? 'model' : 'models'}/**/*.{ts,tsx,js,jsx}`, {
    cwd
  }).filter(p => !p.endsWith('.d.ts') && !p.endsWith('.test.js') && !p.endsWith('.test.jsx') && !p.endsWith('.test.ts') && !p.endsWith('.test.tsx')).map(p => api.winPath((0, _path.join)(cwd, p)));

  return pageModels.concat(configModels);
}

function getModelsWithRoutes(routes, api) {
  const paths = api.paths;
  return routes.reduce((memo, route) => {
    return [...memo, ...(route.component && route.component.indexOf('() =>') !== 0 ? getPageModels((0, _path.join)(paths.cwd, route.component), api) : []), ...(route.routes ? getModelsWithRoutes(route.routes, api) : [])];
  }, []);
}

function getPageModels(cwd, api) {
  let models = [];

  while (!isSrcPath(cwd, api) && !(0, _pathIsRoot.default)(cwd)) {
    models = models.concat(getModel(cwd, api));
    cwd = (0, _path.dirname)(cwd);
  }

  return models;
}

function isSrcPath(path, api) {
  const paths = api.paths,
        winPath = api.winPath;
  return (0, _depotUtils.endWithSlash)(winPath(path)) === (0, _depotUtils.endWithSlash)(winPath(paths.absSrcPath));
}

function getGlobalModels(api, shouldImportDynamic) {
  const paths = api.paths,
        routes = api.routes;
  let models = getModel(paths.absSrcPath, api);

  if (!shouldImportDynamic) {
    // 不做按需加载时，还需要额外载入 page 路由的 models 文件
    models = [...models, ...getModelsWithRoutes(routes, api)]; // 去重

    models = (0, _lodash.default)(models);
  }

  return models;
}

function _default(api, opts = {}) {
  const paths = api.paths,
        cwd = api.cwd,
        compatDirname = api.compatDirname,
        winPath = api.winPath;
  const isDev = process.env.NODE_ENV === 'development';
  const shouldImportDynamic = opts.dynamicImport;

  function getDvaJS() {
    const dvaJS = (0, _depotUtils.findJS)(paths.absSrcPath, 'dva');

    if (dvaJS) {
      return winPath(dvaJS);
    }
  }

  function getModelName(model) {
    const modelArr = winPath(model).split('/');
    return modelArr[modelArr.length - 1];
  }

  function exclude(models, excludes) {
    return models.filter(model => {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = excludes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          const exclude = _step.value;

          if (typeof exclude === 'function' && exclude(getModelName(model))) {
            return false;
          }

          if (exclude instanceof RegExp && exclude.test(getModelName(model))) {
            return false;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return true;
    });
  }

  function getGlobalModelContent() {
    return exclude(getGlobalModels(api, shouldImportDynamic), (0, _depotUtils.optsToArray)(opts.exclude)).map(path => `
    app.model({ namespace: '${(0, _path.basename)(path, (0, _path.extname)(path))}', ...(require('${path}').default) });
  `.trim()).join('\r\n');
  }

  function getPluginContent() {
    const pluginPaths = _globby.default.sync('plugins/**/*.{js,ts}', {
      cwd: paths.absSrcPath
    });

    const ret = pluginPaths.map(path => `
app.use(require('../../${path}').default);
  `.trim());

    if (opts.immer) {
      ret.push(`
app.use(require('${winPath(require.resolve('dva-immer'))}').default());
      `.trim());
    }

    return ret.join('\r\n');
  }

  function generateDvaContainer() {
    const tpl = (0, _path.join)(__dirname, '../template/DvaContainer.js');
    const tplContent = (0, _fs.readFileSync)(tpl, 'utf-8');
    api.writeTmpFile('DvaContainer.js', tplContent);
  }

  function generateInitDva() {
    const tpl = (0, _path.join)(__dirname, '../template/initDva.js');
    let tplContent = (0, _fs.readFileSync)(tpl, 'utf-8');
    const dvaJS = getDvaJS();

    if (dvaJS) {
      tplContent = tplContent.replace('<%= ExtendDvaConfig %>', `
...((require('${dvaJS}').config || (() => ({})))()),
        `.trim());
    }

    tplContent = tplContent.replace('<%= ExtendDvaConfig %>', '').replace('<%= EnhanceApp %>', '').replace('<%= RegisterPlugins %>', getPluginContent()).replace('<%= RegisterModels %>', getGlobalModelContent());
    api.writeTmpFile('initDva.js', tplContent);
  }

  api.onGenerateFiles(() => {
    generateDvaContainer();
    generateInitDva();
  });
  api.modifyRouterRootComponent(`require('dva/router').routerRedux.ConnectedRouter`);

  if (shouldImportDynamic) {
    api.addRouterImport({
      source: 'dva/dynamic',
      specifier: '_dvaDynamic'
    });
  }

  if (shouldImportDynamic) {
    api.modifyRouteComponent((memo, args) => {
      const importPath = args.importPath,
            webpackChunkName = args.webpackChunkName;

      if (!webpackChunkName) {
        return memo;
      }

      let loadingOpts = '';

      if (opts.dynamicImport.loadingComponent) {
        loadingOpts = `LoadingComponent: require('${winPath((0, _path.join)(paths.absSrcPath, opts.dynamicImport.loadingComponent))}').default,`;
      }

      let extendStr = '';

      if (opts.dynamicImport.webpackChunkName) {
        extendStr = `/* webpackChunkName: ^${webpackChunkName}^ */`;
      }

      let ret = `
_dvaDynamic({
  <%= MODELS %>
  component: () => import(${extendStr}'${importPath}'),
  ${loadingOpts}
})
      `.trim();
      const models = getPageModels((0, _path.join)(paths.absTmpDirPath, importPath), api);

      if (models && models.length) {
        ret = ret.replace('<%= MODELS %>', `
app: window.g_app,
models: () => [
  ${models.map(model => {
          return `import(${opts.dynamicImport.webpackChunkName ? `/* webpackChunkName: '${(0, _depotUtils.chunkName)(paths.cwd, model)}' */` : ''}'${model}').then(m => { return { namespace: '${(0, _path.basename)(model, (0, _path.extname)(model))}',...m.default}})`;
        }).join(',\r\n  ')}
],
      `.trim());
      }

      return ret.replace('<%= MODELS %>', '');
    });
  }

  const dvaDir = compatDirname('dva/package.json', cwd, (0, _path.dirname)(require.resolve('dva/package.json')));
  api.addVersionInfo([`dva@${require((0, _path.join)(dvaDir, 'package.json')).version} (${dvaDir})`, `dva-loading@${require('dva-loading/package').version}`, `dva-immer@${require('dva-immer/package').version}`, `path-to-regexp@${require('path-to-regexp/package').version}`]);
  api.modifyAFWebpackOpts(memo => {
    const alias = _objectSpread({}, memo.alias, {
      dva: dvaDir,
      'dva-loading': require.resolve('dva-loading'),
      'path-to-regexp': require.resolve('path-to-regexp'),
      'object-assign': require.resolve('object-assign')
    }, opts.immer ? {
      immer: require.resolve('immer')
    } : {});

    const extraBabelPlugins = [...(memo.extraBabelPlugins || []), ...(isDev && opts.hmr ? [require.resolve('babel-plugin-dva-hmr')] : [])];
    return _objectSpread({}, memo, {
      alias,
      extraBabelPlugins
    });
  });
  api.addPageWatcher([(0, _path.join)(paths.absSrcPath, 'models'), (0, _path.join)(paths.absSrcPath, 'plugins'), (0, _path.join)(paths.absSrcPath, 'model.js'), (0, _path.join)(paths.absSrcPath, 'model.jsx'), (0, _path.join)(paths.absSrcPath, 'model.ts'), (0, _path.join)(paths.absSrcPath, 'model.tsx'), (0, _path.join)(paths.absSrcPath, 'dva.js'), (0, _path.join)(paths.absSrcPath, 'dva.jsx'), (0, _path.join)(paths.absSrcPath, 'dva.ts'), (0, _path.join)(paths.absSrcPath, 'dva.tsx')]);
  api.registerGenerator('dva:model', {
    Generator: require('./model').default(api),
    resolved: (0, _path.join)(__dirname, './model')
  });
  api.addRuntimePlugin((0, _path.join)(__dirname, './runtime'));
  api.addRuntimePluginKey('dva');
  api.addEntryCodeAhead(`
require('@tmp/initDva');
  `.trim());
}