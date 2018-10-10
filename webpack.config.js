const webpack = require('webpack');
const minifier = require('minifier');
const data_init = require('./webpack.config.data-init.js');
const data = require('./webpack.config.data.js');
const init = require('./webpack.config.init.js');

module.exports = [
  data_init,
  data,
  init
];
