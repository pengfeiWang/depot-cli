"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _fs = require("fs");

function test(path) {
  return (0, _fs.existsSync)(path) && (0, _fs.statSync)(path).isDirectory();
}

function template(path) {
  return (0, _path.join)(__dirname, '../template', path);
}

function _default(service) {
  const cwd = service.cwd,
        config = service.config;
  const outputPath = config.outputPath || './dist';
  let pagesPath = 'modules';

  if (process.env.PAGES_PATH) {
    pagesPath = process.env.PAGES_PATH;
  } else {
    if (test((0, _path.join)(cwd, 'src/modules'))) {
      pagesPath = 'src/modules';
    }

    if (test((0, _path.join)(cwd, 'modules'))) {
      pagesPath = 'modules';
    }
  }

  const absPagesPath = (0, _path.join)(cwd, pagesPath);
  const absSrcPath = (0, _path.join)(cwd, 'src');
  const envAffix = process.env.NODE_ENV === 'development' ? '' : `-production`;
  const tmpDirPath = `.depot${envAffix}`; // const tmpDirPath = `${pagesPath}/.depot${envAffix}`;
  // const tmpDirPath = join(cwd, `.depot${envAffix}`);

  const absTmpDirPath = (0, _path.join)(cwd, tmpDirPath);
  return {
    cwd,
    outputPath,
    absOutputPath: (0, _path.join)(cwd, outputPath),
    absNodeModulesPath: (0, _path.join)(cwd, 'node_modules'),
    pagesPath,
    absPagesPath,
    absSrcPath,
    tmpDirPath,
    absTmpDirPath,
    absRouterJSPath: (0, _path.join)(absTmpDirPath, 'router.js'),
    absLibraryJSPath: (0, _path.join)(absTmpDirPath, 'depot.js'),
    absRegisterSWJSPath: (0, _path.join)(absTmpDirPath, 'registerServiceWorker.js'),
    // absPageDocumentPath: join(absPagesPath, 'document.ejs'),
    absPageDocumentPath: (0, _path.join)(absSrcPath, 'document.ejs'),
    defaultEntryTplPath: template('entry.js.tpl'),
    defaultRouterTplPath: template('router.js.tpl'),
    defaultHistoryTplPath: template('history.js.tpl'),
    defaultRegisterSWTplPath: template('registerServiceWorker.js'),
    // defaultDocumentPath: template('document.ejs'),
    defaultDocumentPath: (0, _path.join)(cwd, 'src/index.ejs')
  };
}