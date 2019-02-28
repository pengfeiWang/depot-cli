module.exports = {
  // url 访问路径
  routePath: '/list',
  // 模块布局, children 必须有值, 只支持模块一级配置,
  // moduleLayout: './layout/',
  // 导航菜单名称, 页面 title 也会用到
  title: '列表页',
  icon: 'ico',
  // 指向的组件, 对应路径为: modules/filename.js
  // 如果为空 系统则匹配index.js
  modulePath: '',
  children: [
    {
      /*
        匹配规则, 子路由 modulePath 不能为 `空` `./` `/`;
        modulePath: 'query-code' = query-code.js
        modulePath: 'query-code.js' = query-code.js
        modulePath: 'query-code/' = query-code/
        modulePath: './query-code' = query-code/
      */
      // url 访问路径
      routePath: ':id',
      // 导航菜单名称, 页面 title 也会用到
      title: '列表-子页',
      modulePath: 'id.js',
    },
  ],
};
