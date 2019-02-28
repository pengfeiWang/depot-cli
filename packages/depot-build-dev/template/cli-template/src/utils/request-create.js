import axios from 'axios';
import extend from 'extend';
// import fetch from 'dva/fetch';

// function parseJSON(response) {
//   return response.json();
// }
// axios.config();
// let req = axios.create({
//   'timeout': 1000,
//   'withCredentials': false
// });
// function checkStatus(response) {
//   if (response.status >= 200 && response.status < 300) {
//     return response;
//   }

//   const error = new Error(response.statusText);
//   error.response = response;
//   throw error;
// }

const config = {
  method: 'post',
  timeout: 5000,
  'Content-Type': 'application/json',
  withCredentials: true
};

// const cancelTokenQueue = [];

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(options) {
  const ops = extend({}, config, options);
  return axios(ops).then((data) => {
    return data;
  }).catch((err) => {
    return err;
  });
}
