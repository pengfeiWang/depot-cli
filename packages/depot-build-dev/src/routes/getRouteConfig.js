import { join } from 'path';
import { existsSync } from 'fs';
import getRouteConfigFromConfigFile from './getRouteConfigFromConfigFile';
import getRouteConfigFromDir from './getRouteConfigFromDir';
import patchRoutes from './patchRoutes';
import getRouteConfigFromConfig from './getRouteConfigFromConfig';

export default (paths, config = {}, onPatchRoute) => {
  let routes = null;
  routes = getRouteConfigFromDir(paths, config);
  patchRoutes(
    routes,
    config,
    /* isProduction */ process.env.NODE_ENV === 'production',
    onPatchRoute,
  );
  return routes;

  // 声明式
  const routeConfigFile = join(paths.absSrcPath, '_routes.json');
  if (config.routes) {
    // 配置式
    routes = getRouteConfigFromConfig(config.routes, paths.pagesPath);
  } else if (existsSync(routeConfigFile)) {
    routes = getRouteConfigFromConfigFile(routeConfigFile);
  } else {
    // 约定式
    routes = getRouteConfigFromDir(paths);
  }

  patchRoutes(
    routes,
    config,
    /* isProduction */ process.env.NODE_ENV === 'production',
    onPatchRoute,
  );
  return routes;
};
