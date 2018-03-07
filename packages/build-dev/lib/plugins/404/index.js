'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _path = require('path');

var _fs = require('fs');

const EXTNAMES = ['.js', '.jsx', '.ts', '.tsx'];

function _default(api) {
  const paths = api.service.paths;
  const winPath = api.utils.winPath;

  function get404JS() {
    for (var _i = 0; _i < EXTNAMES.length; _i++) {
      const extname = EXTNAMES[_i];
      const filePath = winPath(
        (0, _path.join)(paths.absPagesPath, `404${extname}`),
      );

      if ((0, _fs.existsSync)(filePath)) {
        return filePath;
      }
    }
  }

  api.register('modifyRoutesContent', ({ memo }) => {
    const filePath = get404JS();

    if (filePath) {
      memo.push(`    <Route component={require('${filePath}').default} />`);
    }

    return memo;
  });
  api.register('beforeServer', ({ args: { devServer } }) => {
    function UMI_PLUGIN_404(req, res, next) {
      if (req.accepts('html')) {
        let pageContent = (0, _fs.readFileSync)(
          (0, _path.join)(__dirname, '../../../template/404.html'),
          'utf-8',
        );
        pageContent = pageContent
          .replace('<%= PAGES_PATH %>', paths.pagesPath)
          .replace(
            '<%= PAGES_LIST %>',
            api.service.routes
              .map(route => {
                return `<li><a href="${route.path}">${route.path}</a></li>`;
              })
              .join('\r\n'),
          );
        res.writeHead(404, {
          'Content-Type': 'text/html',
        });
        res.write(pageContent);
        res.end();
      } else {
        next();
      }
    }

    devServer.use(UMI_PLUGIN_404);
  });
}
