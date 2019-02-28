export const templateModel = {
  namespace: '',
  state: {
    loading: true,
    data: {},
    cache: {}
  },

  effects: {
    *fetch({ payload, callback }, { call, put }) {  // eslint-disable-line
      yield put({
        type: 'changeLoading',
        payload: true
      });
      try {
        yield put({
          type: 'changeLoading',
          payload: false
        });
      } catch (err) {
        yield put({
          type: 'changeLoading',
          payload: false
        });
      }
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: { ...action.payload }
      };
    },
    saveAs(state, action) {
      return {
        ...state,
        ...action.payload
      };
    },
    changeLoading(state, action) {
      return {
        ...state,
        loading: action.payload
      };
    }
  },

  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
    }
  }
};
