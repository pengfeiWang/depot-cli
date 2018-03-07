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
  const layoutPath = (0, _path.relative)(
    api.service.cwd,
    (0, _path.join)(paths.absSrcPath, 'layouts/index.js'),
  );
  api.register('modifyRouterFile', ({ memo }) => {
    if ((0, _fs.existsSync)(layoutPath)) {
      return memo.replace(
        IMPORT,
        `
import Layout from '${winPath(
          (0, _path.relative)(paths.tmpDirPath, layoutPath),
        )}';
import menuData from './menu.js';
${IMPORT}
        `.trim(),
      );
    } else {
      return memo;
    }
  });
  api.register('modifyRouterContent', ({ memo }) => {
    if ((0, _fs.existsSync)(layoutPath)) {
      return memo
        .replace(
          '<Switch>',
          `<Layout menuData={menuData}>
    <Switch>`,
        )
        .replace(
          '</Switch>',
          ` </Switch>
  </Layout>`,
        );
    } else {
      return memo;
    }
  });
  api.register('modifyPageWatchers', ({ memo }) => {
    return [...memo, (0, _path.join)(paths.absSrcPath, 'layouts/index.js')];
  });
}
