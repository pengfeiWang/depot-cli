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

var _reactRouterConfig = require("react-router-config");

var _constants = require("./constants");

var _stripComponentQuote = _interopRequireDefault(require("./stripComponentQuote"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return _sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const debug = require('debug')('depot:FilesGenerator');

class FilesGenerator {
  constructor(service) {
    this.service = service;
    this.routesContent = null;
    this.hasRebuildError = false;
    this.layoutDirectoryName = service.config.singular ? 'layout' : 'layouts';
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
    }); // 新增

    let routes = this.getRoutesJSON({
      env: process.env.NODE_ENV,
      requested: (0, _requestCache.getRequest)()
    });
    routes = (0, _stripComponentQuote.default)(routes);
    const routerContent = this.service.applyPlugins('modifyRouterContent', {
      initialValue: this.getRouterContent()
    });
    const routeContentString = tplContent.replace(_constants.PLACEHOLDER_IMPORT, '').replace(_constants.PLACEHOLDER_ROUTER_MODIFIER, '').replace('<%= ROUTES %>', routes).replace(_constants.PLACEHOLDER_ROUTER, routerContent).replace(/<%= libraryName %>/g, libraryName);
    return routeContentString;
  }

  getLayoutFile() {
    const paths = this.service.paths; // for (const ext of EXT_LIST) {

    const filePath = (0, _path.join)(paths.absSrcPath, `${this.layoutDirectoryName}/index.js`);

    if ((0, _fs.existsSync)(filePath)) {
      return (0, _winPath.default)(filePath);
    } // }


    return (0, _winPath.default)((0, _path.join)(__dirname, './DefaultLayout.js'));
  }

  markRouteWithSuffix(routes, webpackChunkName) {
    return routes.map(route => {
      const ret = _extends({}, route, {
        component: `${route.component}^^${webpackChunkName}^^${route.path}`
      });

      if (ret.routes) {
        ret.routes = this.markRouteWithSuffix(route.routes, webpackChunkName);
      }

      return ret;
    });
  }

  getRequestedRoutes(requested) {
    const routes = this.service.routes;
    return Object.keys(requested).reduce((memo, pathname) => {
      (0, _reactRouterConfig.matchRoutes)(routes, pathname).forEach(({
        route
      }) => {
        memo[route.path] = 1;
      });
      return memo;
    }, {});
  }

  getRoutesJSON(opts = {}) {
    const _opts$env = opts.env,
          env = _opts$env === void 0 ? 'production' : _opts$env,
          _opts$requested = opts.requested,
          requested = _opts$requested === void 0 ? {} : _opts$requested;
    const _service4 = this.service,
          paths = _service4.paths,
          _service4$config = _service4.config,
          config = _service4$config === void 0 ? {} : _service4$config;
    const routes = [...this.service.routes]; // const rootRoute = routes.filter(route => route.path === '/')[0];
    // if (rootRoute) {
    //   routes.unshift({
    //     ...rootRoute,
    //     path: '/index.html',
    //   });
    // }

    const loading = config.loading;
    let loadingOpts = '';

    if (loading) {
      loadingOpts = `loading: require('${(0, _winPath.default)((0, _path.join)(paths.cwd, loading))}').default,`;
    } // 只在一级路由做按需编译


    routes.forEach(route => {
      const webpackChunkName = (0, _normalizeEntry.default)(route.component);
      route.component = `${route.component}^^${webpackChunkName}^^${route.path}`;

      if (route.routes) {
        route.routes = this.markRouteWithSuffix(route.routes, webpackChunkName);
      }
    }); // if (
    //   process.env.NODE_ENV === 'production' &&
    //   config.exportStatic &&
    //   config.exportStatic.htmlSuffix
    // ) {
    //   // 为 layout 组件加 (.html)? 兼容
    //   this.fixHtmlSuffix(routes);
    // }
    // 添加 layout wrapper

    const layoutFile = this.getLayoutFile();
    const wrappedRoutes = [{
      component: layoutFile,
      routes
    }];
    const requestedPaths = this.getRequestedRoutes(requested); // const compilingPath = winPath(join(__dirname, 'Compiling.js'));
    // console.log('wrappedRoutes::', wrappedRoutes);

    let ret = JSON.stringify(wrappedRoutes, (key, value) => {
      if (key === 'component') {
        const _value$split = value.split('^^'),
              _value$split2 = _slicedToArray(_value$split, 3),
              component = _value$split2[0],
              webpackChunkName = _value$split2[1],
              path = _value$split2[2];

        const importPath = value.charAt(0) === '/' ? value : (0, _winPath.default)((0, _path.relative)(paths.tmpDirPath, component));
        let ret;
        let isCompiling = false;

        if (value === layoutFile) {
          ret = `require('${importPath}').default`;
        } else if (env === 'production' && !config.disableDynamicImport) {
          // 按需加载
          ret = `dynamic(() => import(/* webpackChunkName: ${webpackChunkName} */'${importPath}'), {${loadingOpts}})`;
        } else {
          // 非按需加载
          if (env === 'production' || process.env.COMPILE_ON_DEMAND === 'none' || requestedPaths[path]) {
            ret = `require('${importPath}').default`;
          } else {
            isCompiling = true; // ret = `() => React.createElement(require('${compilingPath}').default, { route: '${path}' })`;

            ret = `require('${importPath}').default`;
          }
        }

        ret = this.service.applyPlugins('modifyRouteComponent', {
          initialValue: ret,
          args: {
            isCompiling,
            pageJSFile: importPath,
            importPath,
            webpackChunkName,
            config
          }
        });
        return ret;
      } else {
        return value;
      }
    }, 2);
    return ret;
  }

  getRouterContent() {
    return `
<Router history={window.g_history}>
  { renderRoutes(routes) }
</Router>
        `.trim(); //     const { routes, config, paths } = this.service;
    //     const routesByPath = routes.reduce((memo, { path, component }) => {
    //       memo[path] = component;
    //       return memo;
    //     }, {});
    //     // 导出静态文件时，匹配 /index.html 到 /
    //     if (config.exportStatic && routesByPath['/']) {
    //       routesByPath['/index.html'] = routesByPath['/'];
    //     }
    //     const { loading } = config;
    //     let loadingOpts = '';
    //     if (loading) {
    //       loadingOpts = `loading: require('${winPath(
    //         join(paths.cwd, loading),
    //       )}').default,`;
    //     }
    //     let routesContent = Object.keys(routesByPath).map(key => {
    //       const pageJSFile = winPath(relative(paths.tmpDirPath, routesByPath[key]));
    //       debug(`requested: ${JSON.stringify(getRequest())}`);
    //       const isDev = process.env.NODE_ENV === 'development';
    //       let component;
    //       let isCompiling = false;
    //       let webpackChunkName = null;
    //       const compilingPath = winPath(join(__dirname, 'Compiling.js'));
    //       if (isDev && process.env.COMPILE_ON_DEMAND !== 'none') {
    //         if (getRequest()[key]) {
    //           component = `require('${pageJSFile}').default`;
    //         } else {
    //           component = `() => React.createElement(require('${compilingPath}').default, { route: '${key}' })`;
    //           isCompiling = true;
    //         }
    //       } else {
    //         webpackChunkName = normalizeEntry(routesByPath[key]);
    //         component = `dynamic(() => import(/* webpackChunkName: '${webpackChunkName}' */'${pageJSFile}'), { ${loadingOpts} })`;
    //       }
    //       component = this.service.applyPlugins('modifyRouteComponent', {
    //         initialValue: component,
    //         args: {
    //           isCompiling,
    //           pageJSFile,
    //           webpackChunkName,
    //           config,
    //         },
    //       });
    //       return `    <Route exact path="${key}" component={${component}} />`;
    //     });
    //     routesContent = this.service.applyPlugins('modifyRoutesContent', {
    //       initialValue: routesContent,
    //     });
    //     return `
    // <Router history={window.g_history}>
    //   <Switch>
    // ${routesContent.join('\n')}
    //   </Switch>
    // </Router>
    //     `.trim();
  }

}

exports.default = FilesGenerator;