module.exports = {
  // url 访问路径
  routePath: '/list',
  // 导航菜单名称, 页面 title 也会用到
  title: '列表也2ss1',
  icon: 'ico',
  // 指向的组件, 对应路径为: modules/filename.js
  // 如果为空 系统则匹配index.js
  modulePath: '',
  children: [
    {
      // url 访问路径
      routePath: ':id',
      // 导航菜单名称, 页面 title 也会用到
      title: '列表也2sss',
      modulePath: 'id.js',
    },
  ],
};
