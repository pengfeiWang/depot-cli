```js
.
├── README.md
├── jsconfig.json
├── .eslintrc                                // 语法规范配置文件
├── .eslintignore                            // 忽略项
├── .gitignore                     
├── .webpackrc.js                            // webpack 自定义配置
├── .depotrc.js                              // 脚手架配置, 可配置关闭的模块
├── .depot.mock.js                           // 数据模拟接口导出文件
├── package.json
├── dist/                                    // 构建产物目录
└── src/ 
    ├── assets/                              // 资源文件
    │   ├── config/
    │   │   └── index.js                     // 全局配置文件, 不会编译到包里, 唯一一个文件
    │   ├── images/                          // 图片
    │   │   ├── KpnpchXsobRgLElEozzI.svg
    │   │   ├── RVRUAYdCGeYNBWoKiIwB.svg
    │   │   └── wZcnGqRDyhPOEYFcZDnb.svg
    │   └── react/                            // react 框架
    │       ├── 16.2/
    │       └── react-router4/
    ├── components/                           // 组件目录
    │   └── Patterns
    │       ├── Exception
    │       ├── GlobalFooter
    │       └── Menus
    ├── index.ejs                             // 首页模板
    ├── layouts/                              // 布局目录
    │   ├── BasicLayout
    │   ├── index.js
    │   └── index.less
    ├── mock/                                 // 数据模拟文件目录
    │   └── demo                              // 对应 modules/ 下子目录
    │       └── index.js
    ├── models/                               // 全局数据管理目录
    │   └── app.js
    ├── modules/                              // 模块目录
    │   ├── demo                              // 业务模块
    │   │   ├── layout/                       // 模块布局
    │   │   │   └── index.js
    │   │   ├── js/                           // 模块js
    │   │   │   └── index.js
    │   │   ├── css/                          // 模块css, 源文件 less
    │   │   │   └── index.less    
    │   │   ├── config.js                     // 模块配置
    │   │   ├── index.js                      // 模块入口
    │   │   └── models                        // 模块数据管理目录
    │   │       └── index.js                  // 数据
    │   ├── index
    │   │   ├── config.js
    │   │   ├── index.js
    │   │   ├── models
    │   │   └── query-code.js
    │   └── list
    │       ├── config.js
    │       ├── id.js
    │       └── index.js
    ├── services                              // 数据接口文件目录, 对应 modules/下子目录
    │   └── demo                              // 对应某个模块的数据接口目录
    │       └── index.js
    ├── themes                                // 全局主题
    │   └── app.less
    └── utils                                 // 工具
        ├── http-codes.js
        ├── index.js
        ├── modelTemplate.js
        ├── request-create.js
        └── request.js                        // 封装好的 request 模块
```


