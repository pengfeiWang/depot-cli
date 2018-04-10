import request from 'utils/request';


const { URL } = window.globalJSConfig;

export async function queryDemo(obj = {}) {
  const json = Object.assign({
    url: `${URL}/query-demo`
  }, obj);
  return request(json);
}
