const globby = require('globby')
const mockPaths = globby.sync('./src/mock/**/*.js');
let proxy = {}
mockPaths.map(p => {
  Object.assign(proxy, require(p)); 
})
module.exports = proxy;