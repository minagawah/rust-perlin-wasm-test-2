const merge = require('webpack-merge');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  output: {
    publicPath: '/minagawah/rust-perlin-wasm-test-2/',
  },
  optimization: {
    minimize: true,
  },
  plugins: [
    new WasmPackPlugin({
      crateDirectory: './wasm-noise',
      forceMode: 'production',
    }),
    new LicenseWebpackPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
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
