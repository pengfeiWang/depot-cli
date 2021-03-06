import axios from 'axios';
import { notification } from 'antd';
import 'antd/es/notification/style';
const config = {
  method: 'post',
  timeout: 5000,
  headers: { 'content-type': 'application/json; charset=utf-8' },
  withCredentials: true
};

axios.interceptors.response.use((response) => {
  if (+(response.status) === 200) {
    return response;
  } else {
    const str = `: ${response.request.url}`;
    notification.error({
      message: `请求错误${process.env === 'development' ? str : ''}`,
      description: response.data.msg
    });
    return Promise.reject(response);
  }
}, (error) => {
  if ('stack' in error && 'message' in error) {
    const str = `: ${error.request.url}`;
    notification.error({
      message: `请求错误 ${error.status || (error.response && error.response.status)} ${process.env === 'development' ? str : ''}`,
      description: error.message
    });
  } else if (error.response) {
    notification.error({
      message: error.response.status,
      description: error.response.statusText
    });
  } else if (error.code) {
    notification.error({
      message: error.name,
      description: error.message
    });
  }
  return Promise.reject(error);
});

/*
 if (err && err.response) {
    switch (err.response.status) {
      case 400:
        err.message = '请求错误'
        break

      case 401:
        err.message = '未授权，请登录'
        break

      case 403:
        err.message = '拒绝访问'
        break

      case 404:
        err.message = `请求地址出错: ${err.response.config.url}`
        break

      case 408:
        err.message = '请求超时'
        break

      case 500:
        err.message = '服务器内部错误'
        break

      case 501:
        err.message = '服务未实现'
        break

      case 502:
        err.message = '网关错误'
        break

      case 503:
        err.message = '服务不可用'
        break

      case 504:
        err.message = '网关超时'
        break

      case 505:
        err.message = 'HTTP版本不受支持'
        break

      default:
    }
  }
*/
/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(options) {
  const ops = Object.assign({}, { ...config }, options);
  return axios(ops);
}
