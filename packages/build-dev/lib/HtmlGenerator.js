"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _ejs = _interopRequireDefault(require("ejs"));

var _mkdirp = require("mkdirp");

var _assert = _interopRequireDefault(require("assert"));

var _fs = require("fs");

var _htmlMinifier = require("html-minifier");

var _normalizeEntry = _interopRequireDefault(require("./normalizeEntry"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

const debug = require('debug')('depot:HtmlGenerator');

class HtmlGenerator {
  constructor(service, opts = {}) {
    this.service = service;
    this.chunksMap = opts.chunksMap;
  }
  /*
  // e.g.
  //
  // path  no htmlSuffix     with htmlSuffix
  // ---
  // /     /index.html       /index.html
  // /a    /a/index.html     /a.html
  // /a/   /a/index.html     /a.html
  // /a/b  /a/b/index.html   /a/b.html
  */


  getHtmlPath(path) {
    const config = this.service.config;
    const htmlSuffix = config.exportStatic && typeof config.exportStatic === 'object' && config.exportStatic.htmlSuffix;
    path = path.slice(1);

    if (path === '') {
      return 'index.html';
    } // remove last slash


    path = path.replace(/\/$/, '');

    if (htmlSuffix) {
      return path;
    } else {
      return `${path}/index.html`;
    }
  } // 仅在 build 时调用


  generate() {
    const _service = this.service,
          config = _service.config,
          routes = _service.routes,
          paths = _service.paths;

    if (config.exportStatic) {
      const pagesConfig = config.pages || {};
      routes.forEach(route => {
        const path = route.path;
        const content = this.getContent({
          route,
          pageConfig: pagesConfig[path]
        });
        const outputPath = (0, _path.join)(paths.absOutputPath, this.getHtmlPath(path));
        (0, _mkdirp.sync)((0, _path.dirname)(outputPath));
        (0, _fs.writeFileSync)(outputPath, content, 'utf-8');
      });
    } else {
      // const content = this.getContent();
      const content = this.service.applyPlugins('modifyHTML', {
        initialValue: this.getContent()
      });
      const outputPath = (0, _path.join)(paths.absOutputPath, 'index.html');
      (0, _fs.writeFileSync)(outputPath, content, 'utf-8');
    }
  }

  getContent(opts = {}) {
    const _opts$pageConfig = opts.pageConfig,
          pageConfig = _opts$pageConfig === void 0 ? {} : _opts$pageConfig,
          _opts$route = opts.route,
          route = _opts$route === void 0 ? {} : _opts$route,
          ct = opts.context;
    const _service2 = this.service,
          paths = _service2.paths,
          webpackConfig = _service2.webpackConfig;
    const document = pageConfig.document,
          context = pageConfig.context; // e.g.
    // path: /user.html
    // component: ./user/page.js
    // entry: ./user

    const path = route.path,
          component = route.component;
    const customDocPath = document ? (0, _path.join)(paths.cwd, document) : paths.absPageDocumentPath;
    let docPath = (0, _fs.existsSync)(customDocPath) ? customDocPath : paths.defaultDocumentPath || (0, _path.join)(__dirname, '../template', 'document.ejs'); // 再次判断下文件是否存在

    docPath = (0, _fs.existsSync)(paths.defaultDocumentPath) ? paths.defaultDocumentPath : (0, _path.join)(__dirname, '../template', 'document.ejs');
    const tpl = (0, _fs.readFileSync)(docPath, 'utf-8');

    let html = _ejs.default.render(tpl, _extends({}, context || ct), {
      _with: false,
      localsName: 'context'
    });

    let relPath = path ? new Array(path.slice(1).split(_path.sep).length).join('../') : '';
    relPath = relPath === '' ? './' : relPath; // set publicPath

    let publicPath = webpackConfig.output.publicPath;
    publicPath = makeSureHaveLastSlash(publicPath);
    let resourceBaseUrl = `'${publicPath}'`;
    let pathToScript = publicPath;
    debug(`publicPath: ${publicPath}`);

    if (!(publicPath.charAt(0) === '/' || publicPath.indexOf('http://') === 0 || publicPath.indexOf('https://') === 0 ||
    /* 变量 */
    publicPath === '{{ publicPath }}')) {
      // 相对路径时需和 routerBase 匹配使用，否则子文件夹路由会出错
      resourceBaseUrl = `location.origin + window.routerBase + '${stripFirstSlash(publicPath)}'`;
      pathToScript = `${relPath}${publicPath}`;
    }

    function getAssetsPath(file) {
      return `${pathToScript}${stripFirstSlash(file)}`.replace(/^\.\/\.\//, './');
    }

    let routerBase;

    if (process.env.BASE_URL) {
      routerBase = JSON.stringify(process.env.BASE_URL);
    } else {
      routerBase = path ? `location.pathname.split('/').slice(0, -${path.split('/').length - 1}).concat('').join('/')` : `'/'`;
    }

    let inlineScriptContent = `
<script>
  window.routerBase = ${routerBase};
  window.resourceBaseUrl = ${resourceBaseUrl};
</script>
    `.trim();
    inlineScriptContent = this.service.applyPlugins('modifyHTMLScript', {
      initialValue: inlineScriptContent
    });
    const isDev = process.env.NODE_ENV === 'development';
    const cssFiles = isDev ? [] : this.getCSSFiles(component);
    const cssContent = cssFiles.map(file => `<link rel="stylesheet" href="${getAssetsPath(file)}" />`).join('\r\n');
    const jsFiles = this.getJSFiles(component);
    const jsContent = jsFiles.map(file => `<script src="${getAssetsPath(file)}"></script>`).join('\r\n');
    const injectContent = `
${cssContent}
${inlineScriptContent}
${jsContent}
    `.trim();
    html = html.replace('</body>', `${injectContent}\r\n</body>`); // 插件最后处理一遍 HTML

    html = this.service.applyPlugins('modifyHTML', {
      initialValue: html,
      args: {
        route
      }
    }); // Minify html content

    if (process.env.NODE_ENV === 'production' && process.env.COMPRESS !== 'none') {
      html = (0, _htmlMinifier.minify)(html, {
        removeAttributeQuotes: true,
        collapseWhitespace: true
      });
    }

    return `${html}\r\n`;
  }

  getJSFiles(component) {
    const _service3 = this.service,
          libraryName = _service3.libraryName,
          config = _service3.config;
    const files = [];

    try {
      files.push(this.getFile(libraryName, '.js'));
    } catch (e) {// do nothing
    }

    const isDev = process.env.NODE_ENV === 'development';

    if (!isDev && config.exportStatic) {
      try {
        files.push(this.getFile(`__common-${libraryName}`, '.js'));
      } catch (e) {// do nothing
      }

      try {
        if (component) {
          files.push(this.getFile((0, _normalizeEntry.default)(component), '.js'));
        }
      } catch (e) {// do nothing
      }
    }

    return files;
  }

  getCSSFiles(component) {
    const libraryName = this.service.libraryName;
    const files = [];

    try {
      files.push(this.getFile(libraryName, '.css'));
    } catch (e) {// do nothing
    }

    try {
      if (component) {
        files.push(this.getFile((0, _normalizeEntry.default)(component), '.css'));
      }
    } catch (e) {// do nothing
    }

    return files;
  }

  getFile(name, type) {
    if (!this.chunksMap) {
      return [name, type].join('');
    }

    const files = this.chunksMap[name];
    (0, _assert.default)(files, `name ${name} don't exists in chunksMap ${JSON.stringify(this.chunksMap)}`);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        const file = _step.value;

        if ((0, _path.extname)(file) === type) {
          return file;
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

    throw new Error(`getFile failed:\nmap: ${JSON.stringify(this.chunksMap)}\nname: ${name}\ntype: ${type}`);
  }

}

exports.default = HtmlGenerator;

function stripFirstSlash(str) {
  return str.replace(/^\//, '');
}

function makeSureHaveLastSlash(str) {
  if (str === '{{ publicPath }}' || str.slice(-1) === '/') {
    return str;
  } else {
    return `${str}/`;
  }
}