import React from 'react';
import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import { LocaleProvider } from 'antd';
import dynamic from '<%= libraryName %>/dynamic';
<%= IMPORT %>

let Router = DefaultRouter;
<%= ROUTER_MODIFIER %>

export default function() {
  return (
    <LocaleProvider locale={zhCN}>
<%= ROUTER %>
    </LocaleProvider>
  );
}
