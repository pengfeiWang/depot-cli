'use strict';

require('core-js/stable');

require('regenerator-runtime/runtime');

/* eslint-disable import/first */
global.requestAnimationFrame =
  global.requestAnimationFrame ||
  function requestAnimationFrame(callback) {
    setTimeout(callback, 0);
  };
