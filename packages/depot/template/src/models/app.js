import { login } from '../services/demo/';

export default {
  namespace: 'global',
  state: {
    text: 'hello'
  },
  effects: {
    *goPath({ payload }, { put }) { // eslint-disable-line
      // yield put();
      console.log('effects::', payload);
    },
    *loginSubmit({ payload }, { call }) {
      const response = yield call(login, {
        data: { ...payload }
      });
      console.log('请求返回的数据:', response);
    }
  },
  reducers: {
    setText() {
      return {
        text: 'setted'
      };
    }
  }
};
