import { join, relative } from 'path';
import { existsSync } from 'fs';

export default function(api) {
  const { IMPORT } = api.placeholder;
  const { paths } = api.service;
  const { winPath } = api.utils;
  const layoutPath = relative(api.service.cwd, join(paths.absSrcPath, 'layouts/index.js'));

  api.register('modifyRouterFile', ({ memo }) => {
    if (existsSync(layoutPath)) {
      return memo.replace(
        `export default function() {`,
        `
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
        `.trim(),
      );
    } else {
      return memo;
    }
  });

//   api.register('modifyRouterContent', ({ memo }) => {
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

  api.register('modifyPageWatchers', ({ memo }) => {
    return [...memo, join(paths.absSrcPath, 'layouts/index.js')];
  });
}
