import { existsSync, writeFileSync, readFileSync } from 'fs';
import { delay/* , format */ } from 'roadhog-api-doc';
// 是否禁用代理
const noProxy = process.env.NO_PROXY === 'true';
const proxy = {};
require('fs').readdirSync(require('path').join(__dirname, './src/mock/')).forEach(function(file) {
  if(existsSync(file)) {
    Object.assign(proxy, require('./src/mock/' + file));
  }
})

export default noProxy ? {} : delay(proxy, 1000);