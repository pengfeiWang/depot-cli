;(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.globalJSConfig = factory();
  }
})(this, function() {
  // 全局配置
  return {
    URL: ''
  };
});