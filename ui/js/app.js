import store from 'store.js';

const env = ENV;
const config = require(`./config/${env}`);
const logs = [];
const app = {
  env: env,
  config: config,
  store: store,
  logs: logs,
  log: function(message) {
    console.log(message);
    logs.push(message);
  }
}

global.app = app;
module.exports = app;