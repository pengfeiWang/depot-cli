export default {
  namespace: 'demo',
  state: {
    text: 'hello'
  },
  effects: {
    *demoGoPath({ payload }, { put }) { // eslint-disable-line
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
