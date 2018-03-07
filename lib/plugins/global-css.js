'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _path = require('path');

var _fs = require('fs');

function _default(api) {
  const IMPORT = api.placeholder.IMPORT;
  const paths = api.service.paths;
  const winPath = api.utils.winPath;
  api.register('modifyRouterFile', ({ memo }) => {
    const cssImports = [paths.absGlobalStyle]
      .filter(f => (0, _fs.existsSync)(f))
      .map(
        f => `import('${winPath((0, _path.relative)(paths.tmpDirPath, f))}');`,
      );

    if (cssImports.length) {
      return memo.replace(
        IMPORT,
        `
${cssImports.join('\r\n')}
${IMPORT}
          `.trim(),
      );
    } else {
      return memo;
    }
  });
  api.register('modifyPageWatchers', ({ memo }) => {
    return [...memo, paths.absGlobalStyle];
  });
}
