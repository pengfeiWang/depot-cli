export default {
  namespace: 'global',
  state: {
    text: 'hello'
  },
  effects: {
    *goPath({ payload }, { put }) { // eslint-disable-line
      // yield put();
      console.log('effects::', payload);
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
