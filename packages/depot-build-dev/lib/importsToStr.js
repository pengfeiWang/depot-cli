"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _depotUtils = require("depot-utils");

function _default(imports) {
  return imports.map(imp => {
    const source = imp.source,
          specifier = imp.specifier;

    if (specifier) {
      return `import ${specifier} from '${(0, _depotUtils.winPath)(source)}'`;
    } else {
      return `import '${(0, _depotUtils.winPath)(source)}';`;
    }
  });
}