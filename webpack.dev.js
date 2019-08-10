const webpack = require('webpack');
const merge = require('webpack-merge');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const autoprefixer = require('autoprefixer');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    historyApiFallback: true,
    hot: true,
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new WasmPackPlugin({
      crateDirectory: './wasm-noise',
      forceMode: 'development',
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                autoprefixer()
              ]
            }
          }
        ]
      },
    ]
  },
});
