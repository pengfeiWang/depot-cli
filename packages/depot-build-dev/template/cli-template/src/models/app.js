import { templateModel } from 'utils/modelTemplate';
// import { handleQuery } from 'utils';
import { queryDemo } from 'services/demo/';

// model 查询通用函数
function* handleQuery({ /* payload, callback, call, */ put /* , select */ }, cb, callback) {
  yield put({
    type: 'changeLoading',
    payload: true
  });
  try {
    yield cb();
    yield put({
      type: 'changeLoading',
      payload: false
    });
  } catch (err) {
    yield put({
      type: 'changeLoading',
      payload: false
    });
    if (callback && err) callback(true, {});
  }
}
const currentModel = Object.assign({}, templateModel, {
  namespace: 'app',
  state: {
    text: ''
  },
  effects: {
    *fetch({ payload, callback }, { call, put, select }) {  // eslint-disable-line
      yield handleQuery({ put }, function* () {
        // 选择已有的数据
        const text = yield select(({ global }) => global);
        const response = yield call(queryDemo /* 定义的接口名称 为函数 */, {
          data: { ...payload, text }
        });
        const {
          data: {
            // code
          },
          code,
          msg
        } = response.data;
        // 保存数据
        yield put({
          type: 'saveAs',
          payload: {}
        });
        if (code === 1 && callback) callback(null, msg);
      }, callback);
    },
  }
});


export default currentModel;
