#!/usr/bin/env node

const { fork } = require('child_process');
const { join } = require('path');

function runTools(...args) {
  console.log(['>> depot-tools', ...args].join(' '),'cwd >> ' , process.cwd());
  return fork(
    join(process.cwd(), './packages/depot-tools/src/build.js'),
    [...args].concat(process.argv.slice(2), ['-e=depot-history']),
    {
      stdio: 'inherit',
      cwd: process.cwd(),
    },
  );
}

const cp = runTools('build');
cp.on('error', err => {
  console.log(err);
});
cp.on('message', message => {
  console.log(message, '子进程事件通知');
  // if (message === 'BUILD_COMPLETE') {
    // runTools('rollup', '-g', 'dva:dva,antd:antd');
  // }
});
