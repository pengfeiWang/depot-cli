import { templateModel } from 'utils/modelTemplate';
import { handleQuery } from 'utils';

// 接口服务
import { queryList, addRow, delRow, editRow } from 'services/list/';

const currentModel = Object.assign({}, templateModel, {
  namespace: 'listModel',
  state: {
    dataList: []
  },
  effects: {
    *fetch({ payload, callback }, { call, put, select }) {  // eslint-disable-line
      yield handleQuery({ put }, function* () {
        // 发送请求
        const response = yield call(queryList /* 定义的接口名称 为函数 */, {
          data: { ...payload } // payload 为请求的数据
        });
        const {
          data: {
            list
          },
          code,
          msg
        } = response.data;
        // 保存数据
        yield put({
          type: 'saveAs',
          payload: {
            dataList: list
          }
        });
        if (callback) callback(code, msg);
      }, callback);
    },
    *addRow({ /* payload, */ callback }, { call, put, select }) {
      yield handleQuery({ put }, function* () {
        // 选择已有的数据
        const dataList = yield select(({ listModel }) => listModel.dataList);
        const response = yield call(addRow /* 定义的接口名称 为函数 */, {
          data: { dataList }
        });
        const {
          data: {
            list
          },
          code,
          msg
        } = response.data;
        // 保存数据
        yield put({
          type: 'saveAs',
          payload: {
            dataList: list
          }
        });
        if (callback) callback(code, msg);
      }, callback);
    },
    *delRow({ payload, callback }, { call, put, select }) {
      yield handleQuery({ put }, function* () {
        // 选择已有的数据
        const dataList = yield select(({ listModel }) => listModel.dataList);
        const response = yield call(delRow /* 定义的接口名称 为函数 */, {
          data: { ...payload, dataList }
        });
        const {
          data: {
            list
          },
          code,
          msg
        } = response.data;
        // 保存数据
        yield put({
          type: 'saveAs',
          payload: {
            dataList: list
          }
        });
        if (callback) callback(code, msg);
      }, callback);
    },
    *editRow({ payload, callback }, { call, put, select }) {
      yield handleQuery({ put }, function* () {
        // 选择已有的数据
        const dataList = yield select(({ listModel }) => listModel.dataList);
        const response = yield call(editRow /* 定义的接口名称 为函数 */, {
          data: { ...payload, dataList }
        });
        const {
          data: {
            list
          },
          code,
          msg
        } = response.data;
        // 保存数据
        yield put({
          type: 'saveAs',
          payload: {
            dataList: list
          }
        });
        if (callback) callback(code, msg);
      }, callback);
    }
  }
});


export default currentModel;
