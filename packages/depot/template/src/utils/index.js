import isPlainObject from 'lodash/isPlainObject';
import cloneDeep from 'lodash/cloneDeep';
import uniqWith from 'lodash/uniqWith';
// import httpCodes from './http-codes';
// import { templateModel } from './modelTemplate';


/**
 * 合并并去重, 主要为数组内部为符合对象使用
 * @param {*} rawArr
 * @param {*} newArr
 * @param {*} key 去重 依据
 */
const unq = (rawArr = [], newArr = [], key) => {
  const cloneRaw = cloneDeep(rawArr);
  const mergeArr = cloneRaw.concat(newArr);
  const mergeNewArr = uniqWith(mergeArr, (o, n) => {
    return o[key] === n[key];
  });
  return mergeNewArr;
};

/**
 * 删除项, 主要为数组内部为复合对象使用
 * @param {*} rawArr 要操作的数据 [{a: 1}, {b: 2}]
 * @param {*} delArr 要删除的项 [1, 2, 3]
 * @param {*} key
 */
const deleteItem = (rawArr = [], delArr = [], key = 'id') => {
  const obj = {};
  // 数组传对象, 利用传进来的 key 作为对象的 key, 数组 item 作为值
  // rawArr = [{id: 1}, {id: 2}]
  // key = id
  // obj = { 1: rawArr[0], 2: rawArr[1] }
  rawArr.map((k) => {
    obj[k[key]] = k;
  });
  // delArr = [1 ,2]
  delArr.map((k) => {
    delete obj[k];
  });

  return Object.values(obj);
};


// 转驼峰
const toCamelCase = (str = '') => {
  return (`${str}`).replace(/-(\w)/g, (all, letter) => {
    return letter.toUpperCase();
  });
};
// 转横线
const toUnderScoreCase = (str = '') => {
  return (`${str}`).replace(/([A-Z])/g, '-$1').toLowerCase();
};
// 是否空对象
const isEmptyObj = (o) => {
  let s;
  for (s in o) {
    return false;
  }
  return true;
};

/**
 * 根据 search 配置 和 查询项 生成一串字符串, 用作数据缓存的 key
 * @param {} searchPage
 * @param {*} query
 */
const renderQueryCacheKeyName = (searchPage, query) => {
  const queryKeyCache = [];
  Object.keys(searchPage).map((k) => {
    if (Object.prototype.hasOwnProperty.call(query, k)) {
      queryKeyCache.push(`${k}_${query[k]}`);
    }
  });
  return queryKeyCache.join('_');
};

const uuid = () => {
  const S4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  const firstStr = () => {
    const max = 51;
    // const min = 0;
    const l = 4;
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz';
    const maxPos = chars.length;
    const arr = [];

    for (let i = 0; i < l; i++) {
      arr.push(chars.charAt([Math.ceil(Math.random() * (max - 0) + 0)], maxPos));
    }
    return arr.join('');
  };

  return (`${firstStr()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}`);
};

// model 查询通用函数
function* handleQuery({ /* payload, callback, call, */ put /* , select */ }, cb, callback) {
  yield put({
    type: 'app/changeLoading',
    payload: true
  });
  try {
    yield cb();
    yield put({
      type: 'app/changeLoading',
      payload: false
    });
  } catch (err) {
    yield put({
      type: 'app/changeLoading',
      payload: false
    });
    if (callback && err) callback(true, {});
  }
}
export {
  // httpCodes,
  isEmptyObj,
  isPlainObject,
  renderQueryCacheKeyName,
  uuid,
  toCamelCase,
  toUnderScoreCase,
  unq,
  deleteItem,
  handleQuery
};
