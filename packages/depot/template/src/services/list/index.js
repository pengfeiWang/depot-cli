import request from 'utils/request';


const { URL } = window.globalJSConfig;

export async function queryList(obj = {}) {
  const json = Object.assign({
    url: `${URL}/query-list`
  }, obj);
  return request(json);
}
export async function addRow(obj = {}) {
  const json = Object.assign({
    url: `${URL}/add-row`
  }, obj);
  return request(json);
}
export async function delRow(obj = {}) {
  const json = Object.assign({
    url: `${URL}/del-row`
  }, obj);
  return request(json);
}
export async function editRow(obj = {}) {
  const json = Object.assign({
    url: `${URL}/edit-row`
  }, obj);
  return request(json);
}
