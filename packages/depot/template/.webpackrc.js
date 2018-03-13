export default {
  externals: {
    react: 'window.React',
    'react-dom': 'window.ReactDOM'
  },
  browserslist: [
    "> 1%",
    "last 2 versions",
    "not ie <= 8"
  ],
  copy: [
    {
      from: 'src/assets/config/index.js',
      to: 'config/index.js'
    },
    {
      from: 'src/assets/react/',
      to: 'react/'
    }
  ]
}