import path from 'path';
import eslintFormatter from 'react-dev-utils/eslintFormatter';
export default {
  mountElementId: 'root',
  // 关闭的 module
  closeModules: [
    // 关闭的模块
  ],
  // 指定 history 类型，可选 browser、hash
  history: 'browser', // hash || browser
  // 不打到包内的文件
  'externals': {
    'react': 'window.React',
    'react-dom': 'window.ReactDOM',
    'react-router-dom': 'window.ReactRouterDOM',
    dva: 'window.dva',
    moment: 'window.moment',
  },
  // 打包优化, 减小体积
  treeShaking: true,
  // 忽略 moment locale
  ignoreMomentLocale: true,
  // 路由路径
  // base: 'ass',
  // 额外插件 webpack
  extraBabelPlugins: [],
  chainWebpack(config, { webpack }) {
    const isDev = process.env.NODE_ENV === 'development';
    const isPro = process.env.NODE_ENV === 'production';
    const rulesLoad = function () {
      const eslintOptions = {
        formatter: eslintFormatter,
        ignore: false,
        eslintPath: require.resolve('eslint'),
        useEslintrc: true,
      };
      config.module
        .rule('eslint')
          .test(/\.(js|jsx)$/)
            .include
            .add(path.resolve(process.cwd(), 'src'))
            .end()
            .exclude
            .add(/node_modules/)
            .end()
            .enforce('pre')
            .use('eslint-loader')
              .loader(require.resolve('eslint-loader'))
              .options(eslintOptions);
    }

    if ((process.env.ESLINT && process.env.ESLINT !== 'none' && isDev) || isPro) {
      rulesLoad();
    }

  },
  alias: {
    utils: path.resolve(__dirname, './src/utils/'),
    services: path.resolve(__dirname, './src/services/'),
    components: path.resolve(__dirname, './src/components/'),
    assets: path.resolve(__dirname, './src/assets/'),
    layouts: path.resolve(__dirname, './src/layouts/'),
  },
  plugins: [
    ['depot-plugin-react', {
      // title: '测试',
      // 类型：Array(Object)
      // 放在 <head> 里，在 depot.js 之后，可使用 <%= PUBLIC_PATH %> 指向 publicPath
      // scripts: [],
      // 类型：Array(Object)
      // 放在 <head> 里，在 depot.js 之前，可使用 <%= PUBLIC_PATH %> 指向 publicPath
      headScripts: [
        {src: '<%= PUBLIC_PATH %>assets/config/index.js'},
        {src: '<%= PUBLIC_PATH %>assets/react/16.8.2/react.js'},
        {src: '<%= PUBLIC_PATH %>assets/react/16.8.2/react-dom.production.min.js'},
        {src: '<%= PUBLIC_PATH %>assets/react/react-router4/react-router-dom.min.js'},
        {src: '<%= PUBLIC_PATH %>assets/dva/2.4.1/dva.js'},
        {src: '<%= PUBLIC_PATH %>assets/moment/2.22.2/moment.js'},
      ],
      // metas: [],
      // links: [],
      // hd: false,
      fastClick: true
    }]
  ],
  theme: {
    'header-bg-color': '#7546c9',
    'custom-color': '#fff'
  },
  targets: {
    ie: 9,
  },
};
