"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _assert = _interopRequireDefault(require("assert"));

var _ejs = _interopRequireDefault(require("ejs"));

var _uppercamelcase = _interopRequireDefault(require("uppercamelcase"));

var _path = require("path");

var _fs = require("fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function directoryExists(path) {
  return (0, _fs.existsSync)(path) && (0, _fs.statSync)(path).isDirectory();
}

function fileExists(path) {
  return (0, _fs.existsSync)(path) && (0, _fs.statSync)(path).isFile();
}

function stripEmptyLine(content) {
  const ret = content.trim() // 两行 -> 一行
  .replace(/\n\n/g, '\n'); // 结尾空行

  return `${ret}\n`;
}

function _default(opts = {}) {
  const file = opts.file;
  (0, _assert.default)(!('isDirectory' in opts) || typeof opts.isDirectory === 'boolean', 'opts.isDirectory should be boolean');
  (0, _assert.default)(!('useClass' in opts) || typeof opts.useClass === 'boolean', 'opts.useClass should be boolean');
  const isDirectory = opts.isDirectory || false;
  const cwd = opts.cwd || process.cwd();
  console.log(`[DEBUG] generate page ${file} with isDirectory ${isDirectory}`);
  let cssTargetPath;
  let jsTargetPath;

  if (isDirectory) {
    (0, _assert.default)(!directoryExists((0, _path.join)(cwd, 'src', 'page', file)), `directory src/page/${file} exists`);
    jsTargetPath = (0, _path.join)(cwd, 'src', 'page', file, 'page.js');
    cssTargetPath = (0, _path.join)(cwd, 'src', 'page', file, 'page.css');
  } else {
    jsTargetPath = (0, _path.join)(cwd, 'src', 'page', `${file}.js`);
    cssTargetPath = (0, _path.join)(cwd, 'src', 'page', `${file}.css`);
  }

  (0, _assert.default)(!fileExists(jsTargetPath), `file src/page/${file} exists`);
  (0, _assert.default)(!fileExists(cssTargetPath), `file src/page/${file} exists`);
  const jsTpl = (0, _fs.readFileSync)((0, _path.join)(__dirname, '../../template/page.js'), 'utf-8');
  const cssTpl = (0, _fs.readFileSync)((0, _path.join)(__dirname, '../../template/page.css'), 'utf-8');
  const fileName = (0, _path.basename)(file);
  const componentName = (0, _uppercamelcase.default)(fileName);

  const jsContent = _ejs.default.render(jsTpl, {
    useClass: opts.useClass,
    fileName,
    componentName
  }, {
    _with: false,
    localsName: 'umi'
  });

  const cssContent = _ejs.default.render(cssTpl, {}, {
    _with: false,
    localsName: 'umi'
  });

  (0, _fs.writeFileSync)(jsTargetPath, stripEmptyLine(jsContent), 'utf-8');
  (0, _fs.writeFileSync)(cssTargetPath, stripEmptyLine(cssContent), 'utf-8');
}