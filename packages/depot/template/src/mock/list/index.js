const Mock = require('mockjs');
const msgArr = [
  '请求失败', '请求成功'
]
module.exports = {
  'POST /query-list': (req, res) => {
    const { body } = req;
    // const ret = {
    //   code: "number|1-100": 100,
    //   msg: '',
    //   data: []
    // }
    const { code } = Mock.mock({
      'code|1': 1,
    });
    const { list } = Mock.mock({
      "list": function () {
        let { arr } = Mock.mock({ "arr|1-10": [() => { return { title: Mock.mock('@cname') }}] });
        return arr;
      }
    });
    const responseJson = {
      data: {
        list
      },
      code,
      msg: msgArr[code]
    }
    res.json(responseJson);
  },
  'POST /add-row': (req, res) => {
    const { dataList } = req.body;
    dataList.push({
      title: Mock.mock('@cname') + '  --新增'
    });
    const responseJson = {
      data: {
        list: dataList
      },
      code: 1,
      msg: msgArr[1]
    }
    res.json(responseJson);
  },
  'POST /del-row': (req, res) => {
    const { dataList, type, item } = req.body;
    console.log(dataList, type, item);
    
    let list = [...dataList]
    if (item) {
      list = list.filter(it => it.title !== item.title);
    } else {
      if(type === 'top') {
        list.shift();
      } else {
        list.pop();
      }
    }

    const responseJson = {
      data: {
        list
      },
      code: 1,
      msg: msgArr[1]
    }
    res.json(responseJson);
  },
  'POST /edit-row': (req, res) => {
    const { dataList, item } = req.body;
    const responseJson = {
      data: {
        title: Mock.mock('@cname') + '  --修改'
      },
      code: 1,
      msg: msgArr[1]
    }
    res.json(responseJson);
  }

}