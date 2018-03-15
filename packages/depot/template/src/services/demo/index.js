import request from '../../utils/request';
const { URL } = window.globalJSConfig;
export async function login(obj = {}) {
  const json = Object.assign({
    url: `${URL}/loginSubmit`
  }, obj);
  return request(json);
}
export async function demoGoPath(obj = {}) {
  const json = Object.assign({
    url: `${URL}/loginSubmit`
  }, obj);
  return request(json);
}
