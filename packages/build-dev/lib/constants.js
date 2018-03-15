"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PLACEHOLDER_HISTORY_MODIFIER = exports.PLACEHOLDER_ROUTER = exports.PLACEHOLDER_RENDER = exports.PLACEHOLDER_ROUTER_MODIFIER = exports.PLACEHOLDER_IMPORT = exports.GLOBAL_LESS = exports.COMMON_FILE_NAME = exports.PAGES_FILE_NAME = exports.MOCK_FILE_NAME = exports.CONFIG_FILES = exports.LIBRARY_NAME = exports.ROUTE_FILES = exports.ROUTES_CONFIG_FILE = void 0;
const libraryName = 'depot';
const ROUTES_CONFIG_FILE = ['src/_routes.json', '_routes.json'];
exports.ROUTES_CONFIG_FILE = ROUTES_CONFIG_FILE;
const ROUTE_FILES = ['page.js', 'page.ts', 'page.jsx', 'page.tsx'];
exports.ROUTE_FILES = ROUTE_FILES;
const LIBRARY_NAME = libraryName;
exports.LIBRARY_NAME = LIBRARY_NAME;
const CONFIG_FILES = [`.${libraryName}rc.js`];
exports.CONFIG_FILES = CONFIG_FILES;
const MOCK_FILE_NAME = [`.${libraryName}.mock.js`];
exports.MOCK_FILE_NAME = MOCK_FILE_NAME;
const PAGES_FILE_NAME = 'modules';
exports.PAGES_FILE_NAME = PAGES_FILE_NAME;
const COMMON_FILE_NAME = 'common';
exports.COMMON_FILE_NAME = COMMON_FILE_NAME;
const GLOBAL_LESS = './themes/app.less';
exports.GLOBAL_LESS = GLOBAL_LESS;
const PLACEHOLDER_IMPORT = '<%= IMPORT %>';
exports.PLACEHOLDER_IMPORT = PLACEHOLDER_IMPORT;
const PLACEHOLDER_ROUTER_MODIFIER = '<%= ROUTER_MODIFIER %>';
exports.PLACEHOLDER_ROUTER_MODIFIER = PLACEHOLDER_ROUTER_MODIFIER;
const PLACEHOLDER_RENDER = '<%= RENDER %>';
exports.PLACEHOLDER_RENDER = PLACEHOLDER_RENDER;
const PLACEHOLDER_ROUTER = '<%= ROUTER %>';
exports.PLACEHOLDER_ROUTER = PLACEHOLDER_ROUTER;
const PLACEHOLDER_HISTORY_MODIFIER = '<%= HISTORY_MODIFIER %>';
exports.PLACEHOLDER_HISTORY_MODIFIER = PLACEHOLDER_HISTORY_MODIFIER;