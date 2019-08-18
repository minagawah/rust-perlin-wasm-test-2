const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: {
    app: './src/app.ts',
  },
  stats: {
    colors: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['vendor', 'app'],
      filename: 'index.html',
      template: './src/index.html'
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/assets',
        to: 'assets',
        ignore: ['.gitkeep'],
      },
    ]),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[id].[hash].css',
    }),
  ],
  optimization: {
    runtimeChunk: false,
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: path.resolve(__dirname, 'node_modules'),
          chunks: 'initial',
          name: 'vendor',
          enforce: true
        },
      }
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          // @todo
          // In case you want to dynamically import
          // a future module which does not yet exist,
          // an ugly workaround is to have `transpileOnly`
          // which basically tells TypeScript not to face
          // the issue at all...
          // --------------------------------------------
          // transpileOnly: true,
          // --------------------------------------------
          compilerOptions: {
            'sourceMap': true,
          },
        }
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader'
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: [
          'file-loader'
        ]
      },
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.wasm']
  },
};
