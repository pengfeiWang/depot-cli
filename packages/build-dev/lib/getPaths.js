"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _fs = require("fs");

var _constants = require("./constants");

function test(path) {
  return (0, _fs.existsSync)(path) && (0, _fs.statSync)(path).isDirectory();
}

function template(path) {
  return (0, _path.join)(__dirname, '../template', path);
}

function _default(service) {
  const cwd = service.cwd,
        tmpDirectory = service.tmpDirectory,
        outputPath = service.outputPath,
        libraryName = service.libraryName;
  let pagesPath = _constants.PAGES_FILE_NAME;

  if (process.env.PAGES_PATH) {
    pagesPath = process.env.PAGES_PATH;
  }

  if (test((0, _path.join)(cwd, `src/${_constants.PAGES_FILE_NAME}`))) {
    pagesPath = `src/${_constants.PAGES_FILE_NAME}`;
  } // if (test(join(cwd, 'src/pages'))) {
  //   pagesPath = 'src/pages';
  // }


  const absPagesPath = (0, _path.join)(cwd, pagesPath);
  const absSrcPath = (0, _path.join)(cwd, './src');
  const envAffix = process.env.NODE_ENV === 'development' ? '' : `-production`; // const tmpDirPath = `${pagesPath}/${tmpDirectory}${envAffix}`;

  const tmpDirPath = `${tmpDirectory}${envAffix}`;
  const absTmpDirPath = (0, _path.join)(cwd, tmpDirPath);
  return {
    cwd,
    outputPath,
    absOutputPath: (0, _path.join)(cwd, outputPath),
    pagesPath,
    absPagesPath,
    absSrcPath,
    tmpDirPath,
    absTmpDirPath,
    absGlobalStyle: (0, _path.join)(absSrcPath, _constants.GLOBAL_LESS),
    absRouterJSPath: (0, _path.join)(absTmpDirPath, 'router.js'),
    absLibraryJSPath: (0, _path.join)(absTmpDirPath, `${libraryName}.js`),
    absRegisterSWJSPath: (0, _path.join)(absTmpDirPath, 'registerServiceWorker.js'),
    absPageDocumentPath: (0, _path.join)(absPagesPath, 'document.ejs'),
    defaultEntryTplPath: template('entry.js.tpl'),
    defaultRouterTplPath: template('router.js.tpl'),
    defaultRegisterSWTplPath: template('registerServiceWorker.js'),
    defaultDocumentPath: template('document.ejs')
  };
}