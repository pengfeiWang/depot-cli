"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _fs = require("fs");

function _default(api) {
  const IMPORT = api.placeholder.IMPORT;
  const paths = api.service.paths;
  const winPath = api.utils.winPath;
  const layoutPath = (0, _path.relative)(api.service.cwd, (0, _path.join)(paths.absSrcPath, 'layouts/index.js'));
  api.register('modifyRouterFile', ({
    memo
  }) => {
    if ((0, _fs.existsSync)(layoutPath)) {
      return memo.replace(`export default function() {`, `
function renderRoutes(
  routes,
  extraProps = {},
  switchProps = {},
) {
  return routes ? (
    <Switch {...switchProps}>
      {routes.map((route, i) => {
        return (
          <Route
            key={route.key || i}
            path={route.path}
            exact={route.exact}
            strict={route.strict}
            render={props => {
              return (
                <route.component {...props} {...extraProps} route={route}>
                  {renderRoutes(route.routes)}
                </route.component>
              );
            }}
          />
        );
      })}
    </Switch>
  ) : null;
}

export default function() {
        `.trim());
    } else {
      return memo;
    }
  }); //   api.register('modifyRouterContent', ({ memo }) => {
  //     console.log('memo:::', memo);
  //     if (existsSync(layoutPath)) {
  //       return memo
  //         .replace('<% Switch %>',
  // `<Layout menuData={menuData}>`,
  //       )
  //         .replace('<%/ Switch %>',
  // `</Layout>`,
  //       );
  //     } else {
  //       return memo;
  //     }
  //   });

  api.register('modifyPageWatchers', ({
    memo
  }) => {
    return [...memo, (0, _path.join)(paths.absSrcPath, 'layouts/index.js')];
  });
}