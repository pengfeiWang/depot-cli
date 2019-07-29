module.exports = {
  // url 访问路径
  routePath: '/',
  // 模块布局, children 必须有值, 只支持模块一级配置,
  // moduleLayout: './layout/',
  // 导航菜单名称, 页面 title 也会用到
  title: '首页',
  // 指向组件路径, 对应路径为: modules/当前目录/filename.js
  // 如果为空 系统则匹配 modules/当前目录/index.js
  // 默认为空即可
  modulePath: '',
  // children 与 moduleLayout 想对应, 两者必须同时存在
  children: []
};
