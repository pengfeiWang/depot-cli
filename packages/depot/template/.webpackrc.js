import path from 'path';

export default {
  externals: {
    react: 'window.React',
    'react-dom': 'window.ReactDOM'
  },
  browserslist: [
    "> 1%",
    "last 2 versions",
    "not ie <= 9"
  ],
  extraBabelPlugins: [
    ['import', { libraryName: 'antd', libraryDirectory: 'lib', style: true }, 'antd'],
    ['import', {
      libraryName: '@spd',
      libraryDirectory: 'components',
      style: (name) => {
        console.log(name)
        const splitName = name.split('_');
        return splitName.join('/');
      },
      camel2DashComponentName: true,
      camel2UnderlineComponentName: true
    }, '@spd'],
  ],
  alias: {
    utils: path.resolve(__dirname, './src/utils/'),
    services: path.resolve(__dirname, './src/services/'),
    components: path.resolve(__dirname, './src/components/'),
    assets: path.resolve(__dirname, './src/assets/'),
    layouts: path.resolve(__dirname, './src/layouts/'),
  },
  copy: [
    {
      from: 'src/assets/config/index.js',
      to: 'config/index.js'
    },
    {
      from: 'src/assets/react/',
      to: 'react/'
    },
    {
      from: 'src/assets/polyfills/',
      to: 'polyfills/'
    }
  ],
  "theme": {
    "header-bg-color": "#7546c9",
    "custom-color": "#ff0000"
  }
}