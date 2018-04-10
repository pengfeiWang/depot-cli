import { readdirSync, /* readFileSync, */ statSync, existsSync } from 'fs';
import { join, /* extname, */ basename, relative } from 'path';
// import jsonfile from 'jsonfile';
// import assert from 'assert';
// import { unwatch, watch } from './getConfig/watch';
// import { PAGES_FILE_NAME } from './constants';
import winPath from './winPath';
export default function(paths, config = {}) {
  // let routes = [];
  const routes = getRoutesByPagesDir(paths, '', config);
  if (config.exportStatic) {
    routes.forEach(route => {
      if (route.path.indexOf(':') > -1) {
        throw new Error(
          `Variable path ${route.path} don\'t work with exportStatic`,
        );
      }
      if (
        typeof config.exportStatic === 'object' &&
        config.exportStatic.htmlSuffix
      ) {
        route.path = addHtmlSuffix(route.path);
      }
    });
  }
  return routes;
}

function addHtmlSuffix(path) {
  return path.slice(-1) === '/' ? path : `${path}.html`;
}

function replacePath(path) {
  return winPath(path.replace(/\/+/g, '/'));
}
function renderPath (modulePath) {
  if (modulePath === '') {
    return '';
  }

  if (modulePath === 'index' || /index\.jsx?$/.test(modulePath)) {
    return '/';
  }
  if (/^\.\/[\w]+/.test(modulePath) || /\/$/.test(modulePath) || /\./.test(modulePath)) {
    if (/\.jsx?$/.test(modulePath)) {
      return modulePath;
    }
    return `${modulePath}/`;
  } else {
    return `${modulePath}.js`;
  }
}
// 目录型
function getRoutesByPagesDir(paths, dirPath = '', config) {
  const { closeModules } = config;
  const { cwd, absPagesPath } = paths;
  let ret = []; // eslint-disable-line
  // 保存1级 routePath
  const routeJsonInfo = {
    cwd,
    routeJSON: {},
  }; // eslint-disable-line
  const path = join(absPagesPath, dirPath);

  if (existsSync(path)) {
    const files = readdirSync(path);
    files.forEach(file => {
      if (file.charAt(0) === '.') return;
      const moduleRoot = join(path, file);
      const stats = statSync(moduleRoot);
      if (stats.isDirectory()) {
        if (closeModules && closeModules.length && [...closeModules].includes(basename(moduleRoot))) return;
        const filePath = join(path, file, './config.js');
        if (existsSync(filePath)) {
          const stats = statSync(filePath);
          if (stats.isFile()) {
            try {
              delete require.cache[filePath];
              const config = require(filePath) || {}; // eslint-disable-line
              if (!config.routePath) {
                return [];
              }
              routeJsonInfo.routeJSON[config.routePath] = { ...config, moduleRoot };

              // const tmpObj = {
              //   config,
              //   cwd,
              //   moduleRoot,
              // };
              // ret = getChildRouteByPagesDir(tmpObj, ret, routeJSON);
            } catch (e) {
              console.error(e);
              console.log('');
              console.log('错误');
            }
          }
        }
      }
    });
  }

  return [...getChildRouteByPagesDir(routeJsonInfo)];
}

function getChildRouteByPagesDir(routeJsonInfo) {
  let ret = [];
  const {
    routeJSON,
    cwd,
  } = routeJsonInfo;
  const routeArr = Object.keys(routeJSON);
  routeArr.forEach((it) => { // 通过 key 取 值
    ret = ret.concat(getRouteJsonToArray(routeJSON[it], cwd));
  });
  return ret;
}
function deleteAttribute(props) {
  delete props.moduleLayout;
  delete props.routePath;
  delete props.modulePath;
  delete props.children;
  delete props.moduleRoot;
  return props;
}
function getRouteJsonToArray(routeItem, cwd) {
  const ret = [];
  const {
    routePath,
    children,
    modulePath,
    title,
    icon,
    moduleLayout,
    moduleRoot,
  } = routeItem;
  let componentPath = modulePath;
  const filePath = relative(cwd, moduleRoot);

  componentPath = `${filePath}/${renderPath(modulePath)}`;
  const currentRoot = routePath;

  function getChild (childrenItem, patentPath = '', isReturn) {
    if (!childrenItem.modulePath) return;
    const patentPathLast = patentPath ? `${patentPath}/` : '/';
    const childModPath = `${filePath}/${renderPath(childrenItem.modulePath)}`;

    if (childModPath === moduleRoot) return;
    const props = deleteAttribute({
      ...childrenItem
    });
    if (isReturn) {
      return {
        ...props,
        path: replacePath(`${currentRoot}/${patentPathLast}${childrenItem.routePath}`),
        exact: true,
        component: childModPath,
      };
    }
    ret.push({
      path: replacePath(`${currentRoot}/${patentPathLast}${childrenItem.routePath}`),
      exact: true,
      component: childModPath,
    });
  }
  const props = deleteAttribute({
    ...routeItem
  });

  if (routePath === '/' || routePath === '/index' || basename(moduleRoot) === 'index') {
    return [
      {
        ...props,
        path: replacePath(routePath),
        exact: true,
        component: componentPath,
      }
    ];
  }

  if (children && children.length) {
    if(moduleLayout) {
      ret.push({
        ...props,
        path: replacePath(routePath),
        exact: false,
        component: `${filePath}/${renderPath(moduleLayout.replace(/^.\//, ''))}`,
        routes: [
          ...children.map(it => {
            if (it.children && it.children.length) {
              return getChild(it, it.routePath, !0);
            } else {
              return getChild(it, '', !0);
            }
          })
        ]
      });
    } else {
      ret.push({
        ...props,
        path: replacePath(routePath),
        exact: true,
        component: componentPath,
      });
      children.forEach(it => {
        if (it.children && it.children.length) {
          getChild(it, it.routePath);
        } else {
          getChild(it);
        }
      });
    }
  } else {
    ret.push({
      ...props,
      path: replacePath(routePath),
      exact: true,
      component: componentPath,
    });
  }

  return ret;
}
