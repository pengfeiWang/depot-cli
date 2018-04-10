"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _fs = require("fs");

var _path = require("path");

var _winPath = _interopRequireDefault(require("./winPath"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _default(paths, config = {}) {
  // let routes = [];
  const routes = getRoutesByPagesDir(paths, '', config);

  if (config.exportStatic) {
    routes.forEach(route => {
      if (route.path.indexOf(':') > -1) {
        throw new Error(`Variable path ${route.path} don\'t work with exportStatic`);
      }

      if (typeof config.exportStatic === 'object' && config.exportStatic.htmlSuffix) {
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
  return (0, _winPath.default)(path.replace(/\/+/g, '/'));
}

function renderPath(modulePath) {
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
} // 目录型


function getRoutesByPagesDir(paths, dirPath = '', config) {
  const closeModules = config.closeModules;
  const cwd = paths.cwd,
        absPagesPath = paths.absPagesPath;
  let ret = []; // eslint-disable-line
  // 保存1级 routePath

  const routeJsonInfo = {
    cwd,
    routeJSON: {}
  }; // eslint-disable-line

  const path = (0, _path.join)(absPagesPath, dirPath);

  if ((0, _fs.existsSync)(path)) {
    const files = (0, _fs.readdirSync)(path);
    files.forEach(file => {
      if (file.charAt(0) === '.') return;
      const moduleRoot = (0, _path.join)(path, file);
      const stats = (0, _fs.statSync)(moduleRoot);

      if (stats.isDirectory()) {
        if (closeModules && closeModules.length && [...closeModules].includes((0, _path.basename)(moduleRoot))) return;
        const filePath = (0, _path.join)(path, file, './config.js');

        if ((0, _fs.existsSync)(filePath)) {
          const stats = (0, _fs.statSync)(filePath);

          if (stats.isFile()) {
            try {
              delete require.cache[filePath];
              const config = require(filePath) || {}; // eslint-disable-line

              if (!config.routePath) {
                return [];
              }

              routeJsonInfo.routeJSON[config.routePath] = _extends({}, config, {
                moduleRoot
              }); // const tmpObj = {
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
  const routeJSON = routeJsonInfo.routeJSON,
        cwd = routeJsonInfo.cwd;
  const routeArr = Object.keys(routeJSON);
  routeArr.forEach(it => {
    // 通过 key 取 值
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
  const routePath = routeItem.routePath,
        children = routeItem.children,
        modulePath = routeItem.modulePath,
        title = routeItem.title,
        icon = routeItem.icon,
        moduleLayout = routeItem.moduleLayout,
        moduleRoot = routeItem.moduleRoot;
  let componentPath = modulePath;
  const filePath = (0, _path.relative)(cwd, moduleRoot);
  componentPath = `${filePath}/${renderPath(modulePath)}`;
  const currentRoot = routePath;

  function getChild(childrenItem, patentPath = '', isReturn) {
    if (!childrenItem.modulePath) return;
    const patentPathLast = patentPath ? `${patentPath}/` : '/';
    const childModPath = `${filePath}/${renderPath(childrenItem.modulePath)}`;
    if (childModPath === moduleRoot) return;
    const props = deleteAttribute(_extends({}, childrenItem));

    if (isReturn) {
      return _extends({}, props, {
        path: replacePath(`${currentRoot}/${patentPathLast}${childrenItem.routePath}`),
        exact: true,
        component: childModPath
      });
    }

    ret.push({
      path: replacePath(`${currentRoot}/${patentPathLast}${childrenItem.routePath}`),
      exact: true,
      component: childModPath
    });
  }

  const props = deleteAttribute(_extends({}, routeItem));

  if (routePath === '/' || routePath === '/index' || (0, _path.basename)(moduleRoot) === 'index') {
    return [_extends({}, props, {
      path: replacePath(routePath),
      exact: true,
      component: componentPath
    })];
  }

  if (children && children.length) {
    if (moduleLayout) {
      ret.push(_extends({}, props, {
        path: replacePath(routePath),
        exact: false,
        component: `${filePath}/${renderPath(moduleLayout.replace(/^.\//, ''))}`,
        routes: [...children.map(it => {
          if (it.children && it.children.length) {
            return getChild(it, it.routePath, !0);
          } else {
            return getChild(it, '', !0);
          }
        })]
      }));
    } else {
      ret.push(_extends({}, props, {
        path: replacePath(routePath),
        exact: true,
        component: componentPath
      }));
      children.forEach(it => {
        if (it.children && it.children.length) {
          getChild(it, it.routePath);
        } else {
          getChild(it);
        }
      });
    }
  } else {
    ret.push(_extends({}, props, {
      path: replacePath(routePath),
      exact: true,
      component: componentPath
    }));
  }

  return ret;
}