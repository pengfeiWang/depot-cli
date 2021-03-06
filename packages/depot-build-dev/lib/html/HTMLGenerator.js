"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _assert = _interopRequireDefault(require("assert"));

var _path = require("path");

var _fs = require("fs");

var _lodash = require("lodash");

var _ejs = _interopRequireDefault(require("ejs"));

var _htmlMinifier = require("html-minifier");

var _reactRouterConfig = require("react-router-config");

var _cheerio = _interopRequireDefault(require("cheerio"));

var _formatChunksMap = _interopRequireDefault(require("./formatChunksMap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class HTMLGenerator {
  constructor(opts = {}) {
    Object.keys(opts).forEach(key => {
      this[key] = opts[key];
    });

    if (this.chunksMap) {
      this.chunksMap = (0, _formatChunksMap.default)(this.chunksMap);
    }

    if (!this.env) {
      this.env = process.env.NODE_ENV;
    }

    if (!('minify' in this)) {
      this.minify = this.env === 'production' && process.env.COMPRESS !== 'none';
    }
  }

  generate() {
    (0, _assert.default)(this.env === 'production', `HtmlGenerator.generate() should only be used in depot build`);
    const flatRoutes = this.getFlatRoutes(this.routes);
    (0, _assert.default)(flatRoutes.length, 'no valid routes found');
    const routes = this.config.exportStatic ? flatRoutes : [{
      path: '/'
    }];
    return routes.map(route => {
      return {
        filePath: this.getHtmlPath(route.path),
        content: this.getContent(route)
      };
    });
  }

  routeWithoutRoutes(route) {
    const newRoute = _objectSpread({}, route);

    delete newRoute.routes;
    return newRoute;
  }

  getFlatRoutes(routes) {
    return routes.reduce((memo, route) => {
      if (route.routes) {
        return memo.concat(this.routeWithoutRoutes(route)).concat(this.getFlatRoutes(route.routes));
      } else {
        if (route.path) {
          memo.push(route);
        }

        return memo;
      }
    }, []);
  }

  getHtmlPath(path) {
    const exportStatic = this.config.exportStatic;
    const htmlSuffix = exportStatic && (0, _lodash.isPlainObject)(exportStatic) && exportStatic.htmlSuffix;

    if (path === '/') {
      return 'index.html';
    } // remove first and last slash


    path = path.replace(/^\//, '');
    path = path.replace(/\/$/, '');

    if (htmlSuffix || path === 'index.html') {
      return `${path}`;
    } else {
      return `${path}/index.html`;
    }
  }

  getMatchedContent(path) {
    const config = this.config;

    if (config.exportStatic) {
      const branch = (0, _reactRouterConfig.matchRoutes)(this.routes, path).filter(r => r.route.path);
      const route = branch.length ? branch[branch.length - 1].route : {
        path
      };
      return this.getContent(route);
    } else {
      const flatRoutes = this.getFlatRoutes(this.routes);
      (0, _assert.default)(flatRoutes.length, `routes should not be empty`);
      return this.getContent(flatRoutes[0]);
    }
  } // 获取顺序：
  // route.document > pages/document.ejs > built-in document.ejs


  getDocumentTplPath(route) {
    const _this$paths = this.paths,
          cwd = _this$paths.cwd,
          absPageDocumentPath = _this$paths.absPageDocumentPath,
          defaultDocumentPath = _this$paths.defaultDocumentPath;

    if (route.document) {
      const docPath = (0, _path.join)(cwd, route.document);
      (0, _assert.default)((0, _fs.existsSync)(docPath), `document ${route.document} don't exists.`);
      return docPath;
    }

    if ((0, _fs.existsSync)(absPageDocumentPath)) {
      return absPageDocumentPath;
    }

    return defaultDocumentPath;
  }

  getStylesContent(styles) {
    return styles.map((_ref) => {
      let content = _ref.content,
          attrs = _objectWithoutProperties(_ref, ["content"]);

      attrs = Object.keys(attrs).reduce((memo, key) => {
        return memo.concat(`${key}="${attrs[key]}"`);
      }, []);
      return [`<style${attrs.length ? ' ' : ''}${attrs.join(' ')}>`, content.split('\n').map(line => `  ${line}`).join('\n'), '</style>'].join('\n');
    }).join('\n');
  }

  getLinksContent(links) {
    return links.map(link => {
      return ['<link', ...Object.keys(link).reduce((memo, key) => {
        return memo.concat(`${key}="${link[key]}"`);
      }, []), '/>'].join(' ');
    }).join('\n');
  }

  getMetasContent(metas) {
    return metas.map(meta => {
      return ['<meta', ...Object.keys(meta).reduce((memo, key) => {
        return memo.concat(`${key}="${meta[key]}"`);
      }, []), '/>'].join(' ');
    }).join('\n');
  }

  getScriptsContent(scripts) {
    return scripts.map((_ref2) => {
      let content = _ref2.content,
          attrs = _objectWithoutProperties(_ref2, ["content"]);

      if (content && !attrs.src) {
        attrs = Object.keys(attrs).reduce((memo, key) => {
          return memo.concat(`${key}="${attrs[key]}"`);
        }, []);
        return [`<script${attrs.length ? ' ' : ''}${attrs.join(' ')}>`, content.split('\n').map(line => `  ${line}`).join('\n'), '</script>'].join('\n');
      } else {
        attrs = Object.keys(attrs).reduce((memo, key) => {
          return memo.concat(`${key}="${attrs[key]}"`);
        }, []);
        return `<script ${attrs.join(' ')}></script>`;
      }
    }).join('\n');
  }

  getHashedFileName(filename) {
    // css is optional
    if ((0, _path.extname)(filename) === '.js') {
      (0, _assert.default)(this.chunksMap[filename], `file ${filename} don't exists in chunksMap ${JSON.stringify(this.chunksMap)}`);
    }

    return this.chunksMap[filename];
  }

  getContent(route) {
    const cwd = this.paths.cwd;
    const _this$config = this.config,
          exportStatic = _this$config.exportStatic,
          runtimePublicPath = _this$config.runtimePublicPath;

    let context = _objectSpread({
      route,
      config: this.config,
      publicPath: this.publicPath
    }, this.config.context || {}, {
      env: this.env
    });

    if (this.modifyContext) context = this.modifyContext(context, {
      route
    });
    const tplPath = this.getDocumentTplPath(route);
    const relTplPath = (0, _path.relative)(cwd, tplPath);
    const tpl = (0, _fs.readFileSync)(tplPath, 'utf-8');
    (0, _assert.default)(tpl.includes('<head>') && tpl.includes('</head>'), `Document ${relTplPath} must contain <head> and </head>`);
    (0, _assert.default)(tpl.includes('<body') && tpl.includes('</body>'), `Document ${relTplPath} must contain <body> and </body>`);

    let html = _ejs.default.render(tpl, context, {
      _with: false,
      localsName: 'context'
    }); // validate tpl


    const $ = _cheerio.default.load(html);

    (0, _assert.default)($(`#${this.config.mountElementId}`).length === 1, `Document ${relTplPath} must contain <div id="${this.config.mountElementId}"></div>`);
    let metas = [];
    let links = [];
    let scripts = [];
    let styles = [];
    let headScripts = [];
    let chunks = ['depot'];
    if (this.modifyChunks) chunks = this.modifyChunks(chunks, {
      route
    });
    chunks = chunks.map(chunk => {
      return (0, _lodash.isPlainObject)(chunk) ? chunk : {
        name: chunk
      };
    });
    let routerBaseStr = JSON.stringify(this.config.base || '/');
    const publicPath = this.publicPath || '/';
    let publicPathStr = JSON.stringify(publicPath);

    if (exportStatic && exportStatic.dynamicRoot) {
      routerBaseStr = `location.pathname.split('/').slice(0, -${route.path.split('/').length - 1}).concat('').join('/')`;
      publicPathStr = `location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '') + window.routerBase`;
    }

    if (this.modifyRouterBaseStr) {
      routerBaseStr = this.modifyRouterBaseStr(routerBaseStr, {
        route
      });
    }

    if (this.modifyPublicPathStr) {
      publicPathStr = this.modifyPublicPathStr(publicPathStr);
    }

    const setPublicPath = runtimePublicPath || exportStatic && exportStatic.dynamicRoot;
    headScripts.push({
      content: [`window.routerBase = ${routerBaseStr};`, ...(setPublicPath ? [`window.publicPath = ${publicPathStr};`] : [])].join('\n')
    });

    const getChunkPath = fileName => {
      const hashedFileName = this.getHashedFileName(fileName);

      if (hashedFileName) {
        return `__PATH_TO_PUBLIC_PATH__${hashedFileName}`;
      } else {
        return null;
      }
    };

    chunks.forEach(({
      name,
      headScript
    }) => {
      const chunkPath = getChunkPath(`${name}.js`);

      if (chunkPath) {
        (headScript ? headScripts : scripts).push({
          src: chunkPath
        });
      }
    });
    if (this.modifyMetas) metas = this.modifyMetas(metas, {
      route
    });
    if (this.modifyLinks) links = this.modifyLinks(links, {
      route
    });
    if (this.modifyScripts) scripts = this.modifyScripts(scripts, {
      route
    });
    if (this.modifyStyles) styles = this.modifyStyles(styles, {
      route
    });

    if (this.modifyHeadScripts) {
      headScripts = this.modifyHeadScripts(headScripts, {
        route
      });
    } // depot.css should be the last stylesheet


    chunks.forEach(({
      name
    }) => {
      const chunkPath = getChunkPath(`${name}.css`);

      if (chunkPath) {
        links.push({
          rel: 'stylesheet',
          href: chunkPath
        });
      }
    }); // insert tags

    html = html.replace('<head>', `
<head>
${metas.length ? this.getMetasContent(metas) : ''}
${links.length ? this.getLinksContent(links) : ''}
${styles.length ? this.getStylesContent(styles) : ''}
    `.trim() + '\n');
    html = html.replace('</head>', `
${headScripts.length ? this.getScriptsContent(headScripts) : ''}
</head>
    `.trim());
    html = html.replace('</body>', `
${scripts.length ? this.getScriptsContent(scripts) : ''}
</body>
    `.trim());
    const relPathToPublicPath = this.getRelPathToPublicPath(route.path);
    const pathToPublicPath = exportStatic && exportStatic.dynamicRoot ? relPathToPublicPath : publicPath;
    html = html.replace(/__PATH_TO_PUBLIC_PATH__/g, pathToPublicPath).replace(/<%= PUBLIC_PATH %>/g, pathToPublicPath);

    if (this.modifyHTML) {
      html = this.modifyHTML(html, {
        route,
        getChunkPath
      });
    } // Since this.modifyHTML will produce new __PATH_TO_PUBLIC_PATH__


    html = html.replace(/__PATH_TO_PUBLIC_PATH__/g, pathToPublicPath);

    if (this.minify) {
      html = (0, _htmlMinifier.minify)(html, {
        removeAttributeQuotes: false,
        // site don't support no quote attributes
        collapseWhitespace: true
      });
    }

    return html;
  }

  getRelPathToPublicPath(path) {
    const htmlPath = this.getHtmlPath(path);
    const len = htmlPath.split('/').length;
    return Array(len).join('../') || './';
  }

}

exports.default = HTMLGenerator;