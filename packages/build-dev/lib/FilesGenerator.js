"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _assert = _interopRequireDefault(require("assert"));

var _path = require("path");

var _mkdirp = require("mkdirp");

var _fs = require("fs");

var _chokidar = _interopRequireDefault(require("chokidar"));

var _chalk = _interopRequireDefault(require("chalk"));

var _lodash = _interopRequireDefault(require("lodash.debounce"));

var _getRouteConfig = _interopRequireDefault(require("./getRouteConfig"));

var _requestCache = require("./requestCache");

var _winPath = _interopRequireDefault(require("./winPath"));

var _normalizeEntry = _interopRequireDefault(require("./normalizeEntry"));

var _constants = require("./constants");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = require('debug')('depot:FilesGenerator');

class FilesGenerator {
  constructor(service) {
    this.service = service;
    this.routesContent = null;
    this.hasRebuildError = false;
  }

  generate(opts = {}) {
    const paths = this.service.paths;
    const absTmpDirPath = paths.absTmpDirPath,
          tmpDirPath = paths.tmpDirPath;
    debug(`Mkdir tmp dir: ${tmpDirPath}`);
    (0, _mkdirp.sync)(absTmpDirPath);
    this.generateFiles();
    if (opts.onChange) opts.onChange();
  }

  createWatcher(path) {
    const watcher = _chokidar.default.watch(path, {
      ignored: /(^|[\/\\])\../,
      // ignore .dotfiles
      ignoreInitial: true
    });

    watcher.on('all', (0, _lodash.default)((event, path) => {
      debug(`${event} ${path}`);
      this.rebuild();
    }, 100));
    return watcher;
  }

  watch() {
    const paths = this.service.paths;
    const watcherPaths = this.service.applyPlugins('modifyPageWatchers', {
      initialValue: [paths.absPagesPath]
    });
    this.watchers = watcherPaths.map(p => {
      return this.createWatcher(p);
    });
    process.on('SIGINT', () => {
      this.unwatch();
    });
  }

  unwatch() {
    if (this.watchers) {
      this.watchers.forEach(watcher => {
        watcher.close();
      });
    }
  }

  rebuild() {
    const devServer = this.service.devServer;

    try {
      this.service.applyPlugins('generateFiles', {
        args: {
          isRebuild: true
        }
      }); // rebuild 时只生成 router.js

      this.generateRouterJS();
      if (this.onChange) this.onChange();

      if (this.hasRebuildError) {
        // 从出错中恢复时，刷新浏览器
        devServer.sockWrite(devServer.sockets, 'content-changed');
        this.hasRebuildError = false;
      }
    } catch (e) {
      // 向浏览器发送出错信息
      devServer.sockWrite(devServer.sockets, 'errors', [e.message]);
      this.hasRebuildError = true;
      this.routesContent = null; // why?

      debug(`Generate failed: ${e.message}`);
      debug(e);
      console.error(_chalk.default.red(e.message));
    }
  }

  generateFiles() {
    const _service = this.service,
          paths = _service.paths,
          entryJSTpl = _service.entryJSTpl,
          config = _service.config,
          libraryName = _service.libraryName;
    this.service.applyPlugins('generateFiles');
    this.generateRouterJS(); // Generate depot.js

    let entryContent = (0, _fs.readFileSync)(entryJSTpl || paths.defaultEntryTplPath, 'utf-8');
    entryContent = this.service.applyPlugins('modifyEntryFile', {
      initialValue: entryContent
    });
    entryContent = entryContent.replace(_constants.PLACEHOLDER_IMPORT, '').replace(_constants.PLACEHOLDER_HISTORY_MODIFIER, '').replace(/<%= libraryName %>/g, libraryName).replace(_constants.PLACEHOLDER_RENDER, `ReactDOM.render(React.createElement(require('./router').default), document.getElementById('root'));`);

    if (!config.disableServiceWorker) {
      entryContent = `${entryContent}
// Enable service worker
if (process.env.NODE_ENV === 'production') {
  require('./registerServiceWorker');
}
      `;
    }

    (0, _fs.writeFileSync)(paths.absLibraryJSPath, entryContent, 'utf-8'); // Generate registerServiceWorker.js

    (0, _fs.writeFileSync)(paths.absRegisterSWJSPath, (0, _fs.readFileSync)(paths.defaultRegisterSWTplPath), 'utf-8');
  }

  generateRouterJS() {
    const _service2 = this.service,
          paths = _service2.paths,
          config = _service2.config;
    const absRouterJSPath = paths.absRouterJSPath;
    const routes = (0, _getRouteConfig.default)(paths, config);
    this.service.applyPlugins('modifyRoutes', {
      initialValue: routes
    });
    this.service.setRoutes(routes);
    const routesContent = this.getRouterJSContent(); // 避免文件写入导致不必要的 webpack 编译

    if (this.routesContent !== routesContent) {
      (0, _fs.writeFileSync)(absRouterJSPath, routesContent, 'utf-8');
      this.routesContent = routesContent;
    }
  }

  getRouterJSContent() {
    const _service3 = this.service,
          routerTpl = _service3.routerTpl,
          paths = _service3.paths,
          libraryName = _service3.libraryName;
    const routerTplPath = routerTpl || paths.defaultRouterTplPath;
    (0, _assert.default)((0, _fs.existsSync)(routerTplPath), `routerTpl don't exists: ${routerTplPath}`);
    let tplContent = (0, _fs.readFileSync)(routerTplPath, 'utf-8');
    tplContent = this.service.applyPlugins('modifyRouterFile', {
      initialValue: tplContent
    });
    const routerContent = this.service.applyPlugins('modifyRouterContent', {
      initialValue: this.getRouterContent()
    });
    const routeContentString = tplContent.replace(_constants.PLACEHOLDER_IMPORT, '').replace(_constants.PLACEHOLDER_ROUTER_MODIFIER, '').replace(_constants.PLACEHOLDER_ROUTER, routerContent).replace(/<%= libraryName %>/g, libraryName);
    return routeContentString;
  }

  getRouterContent() {
    const _service4 = this.service,
          routes = _service4.routes,
          config = _service4.config,
          paths = _service4.paths;
    const routesByPath = routes.reduce((memo, {
      path,
      component
    }) => {
      memo[path] = component;
      return memo;
    }, {}); // 导出静态文件时，匹配 /index.html 到 /

    if (config.exportStatic && routesByPath['/']) {
      routesByPath['/index.html'] = routesByPath['/'];
    }

    const loading = config.loading;
    let loadingOpts = '';

    if (loading) {
      loadingOpts = `loading: require('${(0, _winPath.default)((0, _path.join)(paths.cwd, loading))}').default,`;
    }

    let routesContent = Object.keys(routesByPath).map(key => {
      const pageJSFile = (0, _winPath.default)((0, _path.relative)(paths.tmpDirPath, routesByPath[key]));
      debug(`requested: ${JSON.stringify((0, _requestCache.getRequest)())}`);
      const isDev = process.env.NODE_ENV === 'development';
      let component;
      let isCompiling = false;
      let webpackChunkName = null;
      const compilingPath = (0, _winPath.default)((0, _path.join)(__dirname, 'Compiling.js'));

      if (isDev && process.env.COMPILE_ON_DEMAND !== 'none') {
        if ((0, _requestCache.getRequest)()[key]) {
          component = `require('${pageJSFile}').default`;
        } else {
          component = `() => React.createElement(require('${compilingPath}').default, { route: '${key}' })`;
          isCompiling = true;
        }
      } else {
        webpackChunkName = (0, _normalizeEntry.default)(routesByPath[key]);
        component = `dynamic(() => import(/* webpackChunkName: '${webpackChunkName}' */'${pageJSFile}'), { ${loadingOpts} })`;
      }

      component = this.service.applyPlugins('modifyRouteComponent', {
        initialValue: component,
        args: {
          isCompiling,
          pageJSFile,
          webpackChunkName,
          config
        }
      });
      return `    <Route exact path="${key}" component={${component}} />`;
    });
    routesContent = this.service.applyPlugins('modifyRoutesContent', {
      initialValue: routesContent
    });
    return `
<Router history={window.g_history}>
  <Switch>
${routesContent.join('\n')}
  </Switch>
</Router>
    `.trim();
  }

}

exports.default = FilesGenerator;