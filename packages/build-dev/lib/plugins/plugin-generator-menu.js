'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.default = _default;

var _fs = require('fs');

var _path = require('path');

function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

// import globby from 'globby';
function _default(api) {
  const paths = api.service.paths;
  const absTmpDirPath = paths.absTmpDirPath;
  const menuContainerPath = (0, _path.join)(absTmpDirPath, 'menu.js');

  function getMenuJSContent(menuData) {
    if (!menuData) return [];
    const ret = [];
    menuData.forEach(it => {
      const cloneIt = _extends({}, it);

      delete cloneIt.component;
      ret.push(JSON.stringify(cloneIt));
    });
    return ret.join(',\r\n  ');
  }

  api.register('modifyRoutes', ({ memo }) => {
    const tpl = (0, _path.join)(__dirname, '../../template/menu.js');

    if (!(0, _fs.existsSync)(absTmpDirPath)) {
      return;
    }

    let tplContent = (0, _fs.readFileSync)(tpl, 'utf-8');
    tplContent = tplContent.replace(
      '<%= menuContent %>',
      getMenuJSContent(memo),
    );
    (0, _fs.writeFileSync)(menuContainerPath, tplContent, 'utf-8');
  });
}
