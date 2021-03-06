"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _getHtmlGenerator = _interopRequireDefault(require("./getHtmlGenerator"));

var _chunksToMap = _interopRequireDefault(require("./build/chunksToMap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = service => {
  return class {
    apply(compiler) {
      compiler.hooks.emit.tap('generate-html-files', compilation => {
        const chunksMap = (0, _chunksToMap.default)(compilation.chunks);
        const hg = (0, _getHtmlGenerator.default)(service, {
          chunksMap
        });

        try {
          hg.generate().forEach(({
            filePath,
            content
          }) => {
            compilation.assets[filePath] = {
              source: () => content,
              size: () => content.length
            };
          });
        } catch (e) {
          compilation.errors.push(e);
        }
      });
    }

  };
};

exports.default = _default;