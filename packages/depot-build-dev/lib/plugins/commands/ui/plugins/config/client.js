function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

import React from 'react';
import { connect } from 'dva';
import { Input, Form, Button, Select, Switch } from 'antd';
var FormItem = Form.Item;
var Option = Select.Option;

function toString(data) {
  if (typeof data === 'string') return data;else if (_typeof(data) === 'object') return JSON.stringify(data);else if (typeof data === 'boolean') return JSON.stringify(data);else throw new Error("unsupport data type: ".concat(_typeof(data)));
}

function ConfigItem(props) {
  return React.createElement(React.Fragment, null, React.createElement("li", null, props.name, props.name === 'plugins' ? React.createElement(PluginList, {
    data: props.data
  }) : React.createElement(ConfigPropertyItem, props)));
}

function ConfigPropertyItem(_ref) {
  var name = _ref.name,
      data = _ref.data;

  function blurHandler(e) {
    window.send('config', ['set', name, "".concat(e.target.value)]);
  }

  return React.createElement(Input, {
    size: "small",
    defaultValue: toString(data),
    onBlur: blurHandler
  });
}

function PluginList(props) {
  return React.createElement("ul", null, props.data.map(function (item, i) {
    return React.createElement(PluginItem, {
      key: i,
      data: item
    });
  }));
}

function PluginItem(props) {
  var _ref2 = Array.isArray(props.data) ? props.data : [props.data],
      _ref3 = _slicedToArray(_ref2, 2),
      name = _ref3[0],
      opts = _ref3[1];

  return React.createElement("li", null, name, opts ? React.createElement("input", {
    defaultValue: JSON.stringify(opts)
  }) : '');
}

var formItemLayout = {
  labelCol: {
    xs: {
      span: 24
    },
    sm: {
      span: 4
    }
  },
  wrapperCol: {
    xs: {
      span: 24
    },
    sm: {
      span: 16
    }
  }
};
var ConfigManager = connect(function (state) {
  return {
    config: state.config
  };
})(Form.create()(function (props) {
  var getFieldDecorator = props.form.getFieldDecorator;
  var config = props.config.data;

  function onChange(name, value) {
    window.send('config', ['set', name, "".concat(value.target ? value.target.value : value)]);
  }

  return React.createElement("div", null, React.createElement("h2", null, "Basic"), React.createElement(FormItem, _extends({}, formItemLayout, {
    label: "history",
    help: "\u9664\u975E\u77E5\u9053\u4E3A\u4EC0\u4E48\uFF0C\u5426\u5219\u4E0D\u8981\u914D\u7F6E\u4E3A memory"
  }), getFieldDecorator('history', {
    initialValue: config.history || 'browser'
  })(React.createElement(Select, {
    style: {
      width: 160
    },
    onChange: onChange.bind(null, 'history')
  }, React.createElement(Option, {
    value: "hash"
  }, "hash"), React.createElement(Option, {
    value: "browser"
  }, "browser"), React.createElement(Option, {
    value: "memory"
  }, "memory")))), React.createElement(FormItem, _extends({}, formItemLayout, {
    label: "publicPath",
    help: "\u6307\u5B9A webpack \u7684 publicPath \u914D\u7F6E\uFF0C\u90E8\u7F72\u9759\u6001\u6587\u4EF6\u5230\u975E\u6839\u76EE\u5F55\u65F6\u9700\u8981\u914D\u7F6E"
  }), getFieldDecorator('publicPath', {
    initialValue: config.publicPath || '/'
  })(React.createElement(Input, {
    style: {
      width: 160
    },
    onBlur: onChange.bind(null, 'publicPath')
  }))), React.createElement(FormItem, _extends({}, formItemLayout, {
    label: "base",
    help: "\u6307\u5B9A\u8DEF\u7531\u7684 base \u8DEF\u5F84\uFF0C\u90E8\u7F72\u5230\u975E\u6839\u76EE\u5F55\u65F6\u9700\u8981\u914D\u7F6E"
  }), getFieldDecorator('base', {
    initialValue: config.base || '/'
  })(React.createElement(Input, {
    style: {
      width: 160
    },
    onBlur: onChange.bind(null, 'base')
  }))), React.createElement(FormItem, _extends({}, formItemLayout, {
    label: "outputPath",
    help: "\u6307\u5B9A\u6784\u5EFA\u4EA7\u7269\u8F93\u51FA\u8DEF\u5F84"
  }), getFieldDecorator('outputPath', {
    initialValue: config.outputPath || './dist'
  })(React.createElement(Input, {
    style: {
      width: 160
    },
    onBlur: onChange.bind(null, 'outputPath')
  }))), React.createElement(FormItem, _extends({}, formItemLayout, {
    label: "runtimePublicPath",
    help: "\u542F\u7528\u8FD0\u884C\u65F6 publicPath\uFF0C\u5BF9 JavaScript \u6709\u6548"
  }), getFieldDecorator('runtimePublicPath', {
    valuePropName: 'checked',
    initialValue: config.runtimePublicPath
  })(React.createElement(Switch, {
    onChange: onChange.bind(null, 'runtimePublicPath')
  }))), React.createElement(FormItem, _extends({}, formItemLayout, {
    label: "hash",
    help: "\u6307\u5B9A\u8F93\u51FA\u6587\u4EF6\u662F\u5426\u5E26\u4E0A hash \u540E\u7F00"
  }), getFieldDecorator('hash', {
    valuePropName: 'checked',
    initialValue: config.hash
  })(React.createElement(Switch, {
    onChange: onChange.bind(null, 'hash')
  }))), React.createElement(FormItem, _extends({}, formItemLayout, {
    label: "mountElementId",
    help: "\u6307\u5B9A\u9875\u9762\u6839\u8282\u70B9\u5143\u7D20"
  }), getFieldDecorator('mountElementId', {
    initialValue: config.mountElementId || 'root'
  })(React.createElement(Input, {
    style: {
      width: 160
    },
    onBlur: onChange.bind(null, 'mountElementId')
  }))), React.createElement("h2", null, "Targets"), React.createElement("h2", null, "Plugins"), React.createElement("h2", null, "Webpack"), React.createElement("ul", null, Object.keys(props.config.data).map(function (key) {
    return React.createElement(ConfigItem, {
      key: key,
      name: key,
      data: props.config.data[key]
    });
  })));
}));
export default (function (api) {
  api.addPanel({
    title: 'Config Manager',
    path: '/config',
    component: ConfigManager,
    models: [require('./model').default]
  });
});