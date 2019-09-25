import { readdirSync, statSync, existsSync, readFileSync } from 'fs';
import { join, extname, basename, relative } from 'path';
import { winPath, findJS } from 'depot-utils';
// import assert from 'assert';
// import getYamlConfig from './getYamlConfig';

const debug = require('debug')('depot-build-dev:getRouteConfigFromDir');
const JS_EXTNAMES = ['.js', '.jsx', '.ts', '.tsx'];

export default function getRouteConfigFromDir(paths, config) {
  const { cwd, absPagesPath, absSrcPath, dirPath = '' } = paths;
  const { closeModules } = config;
  const absPath = join(absPagesPath, dirPath);
  const files = readdirSync(absPath);

  const routes = files
    .filter(file => {
      if (
        file.charAt(0) === '.' ||
        file.charAt(0) === '_' ||
        /\.(test|spec)\.(j|t)sx?$/.test(file)
      )
        return false;
      return true;
    })
    .filter(file => {
      if (
        file.charAt(0) === '.' ||
        file.charAt(0) === '_' ||
        /\.(test|spec)\.(j|t)sx?$/.test(file)
      )
        return false;
      const absFile = join(absPath, file);
      const stats = statSync(absFile);
      if (stats.isDirectory()) {
        if (closeModules.includes(file)) return false;

        return true;
      }
      return false;
    })
    .reduce(transformConfigToRoutes.bind(null, paths, absPath), []);

  if (dirPath === '' && absSrcPath) {
    const globalLayoutFile =
      findJS(absSrcPath, 'layouts/index') || findJS(absSrcPath, 'layout/index');
    if (globalLayoutFile) {
      const wrappedRoutes = [];
      addRoute(
        wrappedRoutes,
        {
          path: '/',
          component: `./${relative(cwd, globalLayoutFile)}`,
          exact: false,
          routes,
        },
        {
          componentFile: globalLayoutFile,
        },
      );

      return wrappedRoutes;
    }
  }
  return routes;
}
function transformConfigToRoutes(paths, absPath, memo, file) {
  const { cwd, absPagesPath, absSrcPath, dirPath = '' } = paths;
  const absConfig = readConfig(absPath, file);

  if (absConfig) {
    addRoute(
      memo,
      toRoutes({
        ...paths,
        absPath,
        absConfig,
        dirPath: file,
      }),
    );
  }
  return memo;
}
function transform(cfg) {
  const { cwd, absPath, absConfig, absTmpDirPath, dirPath } = cfg;
  const {
    routePath = 'index.js',
    moduleLayout,
    modulePath,
    children = [],
  } = absConfig;

  delete absConfig.routePath;
  delete absConfig.moduleLayout;
  delete absConfig.modulePath;
  delete absConfig.children;
  delete absConfig.depModel;
  const route = {
    ...absConfig,
    path: normalizePath(routePath),
    component: modulePath,
    exact: true,
  };
  if (moduleLayout) {
    route.component = `./${winPath(relative(cwd, moduleLayout))}`;
    route.exact = false;
    route.routes = [
      {
        ...absConfig,
        path: normalizePath(routePath),
        component: modulePath,
        exact: true,
      },
    ];
  }
  if (children.length) {
    route.routes = (route.routes || []).concat(
      ...children.map(it => {
        it.routePath = normalizePath(
          `${normalizePath(routePath)}/${it.routePath}`,
        );
        return toRoutes({
          ...cfg,
          absConfig: it,
          dirPath: `${dirPath}`,
        });
      }),
    );
  }
  return route;
}
function toRoutes(cfg) {
  const { cwd, absTmpDirPath, absPath, absConfig, dirPath } = cfg;

  const { moduleLayout, modulePath } = absConfig;

  if (moduleLayout)
    absConfig.moduleLayout = join(absPath, dirPath, moduleLayout || '');
  /* modulePath 为 undefined 时可能会出错 */
  absConfig.modulePath = `./${winPath(
    relative(cwd, join(absPath, dirPath, modulePath || '')),
  )}`;

  return transform(cfg);
}

function readConfig(absPath, dir, fileName = 'config.js') {
  const absFilePath = join(absPath, dir, fileName);
  if (existsSync(absFilePath) && statSync(absFilePath).isFile()) {
    delete require.cache[absFilePath];
    return require(absFilePath); // eslint-disable-line
  }
  return '';
}

function normalizePath(path) {
  let newPath = `/${winPath(path)
    .split('/')
    .map(path => path.replace(/^\$/, ':').replace(/\$$/, '?'))
    .join('/')}`;

  // /index/index -> /
  if (newPath === '/index/index') {
    newPath = '/';
  }
  // /xxxx/index -> /xxxx/
  newPath = newPath.replace(/\/index$/, '/');

  // remove the last slash
  // e.g. /abc/ -> /abc
  if (newPath !== '/' && newPath.slice(-1) === '/') {
    newPath = newPath.slice(0, -1);
  }
  if (/^\/+/.test(newPath)) {
    newPath = newPath.replace(/^\/+/, '/');
  }
  return newPath;
}

function addRoute(memo, route /* , { componentFile } */) {
  // const code = readFileSync(componentFile, 'utf-8');
  // debug(`parse yaml from ${componentFile}`);
  // const config = getYamlConfig(code);
  // ['path', 'exact', 'component', 'routes'].forEach(key => {
  //   assert(!(key in config), `Unexpected key ${key} in file ${componentFile}`);
  // });

  memo.push({
    ...route,
    // ...config,
  });
}

function isValidJS(file) {
  return JS_EXTNAMES.includes(extname(file));
}
