'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _assert = _interopRequireDefault(require('assert'));

var _isPlainObject = _interopRequireDefault(require('is-plain-object'));

var _path = require('path');

var _fs = require('fs');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _default(api) {
  const cwd = api.service.paths.cwd;

  function getFiles(pages) {
    const files = [
      (0, _path.join)(__dirname, '../../../template/document.ejs'),
      (0, _path.join)(cwd, 'src/page/document.ejs'),
      (0, _path.join)(cwd, 'src/pages/document.ejs'),
      (0, _path.join)(cwd, 'pages/document.ejs'),
    ];

    if (pages) {
      Object.keys(pages).forEach(key => {
        const document = pages[key].document;

        if (document) {
          files.push((0, _path.join)(cwd, document));
        }
      });
    }

    return files;
  }

  return {
    name: 'pages',

    validate(pages) {
      (0, _assert.default)(
        (0, _isPlainObject.default)(pages),
        `"${
          api.relativeFile
        }" 的 "pages" 配置必须是 "Object 对象"，但你配置的是 ${pages.toString()} 。`,
      );
      Object.keys(pages).forEach(key => {
        const document = pages[key].document;

        if (document) {
          (0, _assert.default)(
            (0, _fs.existsSync)((0, _path.join)(cwd, document)),
            `"${
              api.relativeFile
            }" 文件中 "${key}" 的模板文件 "${document}" 并不存在。`,
          );
        }
      });
    },

    watch(pages) {
      if (!pages) {
        pages = api.config[this.name];
      }

      api.unwatch();
      const files = getFiles(pages);
      api.watch(files).on('all', type => {
        if (type === 'add') return;
        api.service.reload();
      });
    },

    onChange(newPages) {
      api.service.reload();
      this.watch(newPages);
    },
  };
}
