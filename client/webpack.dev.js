/**
 * Webpack production specific build configurations
 */
require('dotenv').config();
const { merge } = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    host: '0.0.0.0',
    contentBase: './dist',
    historyApiFallback: {
      rewrites: [
        { from: /^\/$/, to: '/index.html' },
        { from: /^\/admin/, to: '/admin/index.html' },
      ],
    },
    port: process.env.PORT ?? 8080,
    proxy: {
      '/api': process.env.API_URL ?? 'http://localhost:3000',
      '/login': process.env.API_URL ?? 'http://localhost:3000',
      '/.auth': process.env.API_URL ?? 'http://localhost:3000',
      '/logout': process.env.API_URL ?? 'http://localhost:3000',
    },
  },
});
