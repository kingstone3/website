const path = require('path');
const webpack = require('webpack');
const WebpackNotifierPlugin = require('webpack-notifier');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const WebpackDevServerOutput = require('webpack-dev-server-output');
const { VueLoaderPlugin } = require('vue-loader');
const HappyPack = require('happypack');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const PurgecssPlugin = require('purgecss-webpack-plugin');
const glob = require('glob');

const { JS_VENDORS_VERSION } = require('./common/config');


module.exports = {
  entry: {
    website_account: ['./website-account/pages/'],
    website_admin: ['./website-admin/pages/']
  },

  output: {
    path: path.resolve(__dirname, './dist/js/'),
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: '/dist/js/'
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        // exclude: /node_modules/,
        use: ['happypack/loader?id=babel']
      },

      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader',
            options: {
              loaders: {
                js: 'happypack/loader?id=babel'
              }
            }
          }
        ]
      },

      // 普通的 `.scss` 文件和 `*.vue` 文件中的
      // `<style lang="scss">` 块都应用它
      {
        test: /\.scss$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '/dist/css/',
              hmr: process.env.NODE_ENV !== 'production'
            }
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [autoprefixer('last 2 versions')]
            }
          },
          'sass-loader'
        ]
      },

      {
        test: /\.pug$/,
        oneOf: [
          // 这条规则应用到 Vue 组件内的 `<template lang="pug">`
          {
            resourceQuery: /^\?vue/,
            use: ['pug-plain-loader']
          },
          // 这条规则应用到 JavaScript 内的 pug 导入
          {
            use: ['raw-loader', 'pug-plain-loader']
          }
        ]
      },

      {
        test: /\.svg$/,
        use: ['svg-inline-loader']
      },

      {
        resourceQuery: /blockType=i18n/,
        type: 'javascript/auto',
        loader: '@kazupon/vue-i18n-loader'
      }
    ]
  },

  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: [path.resolve(__dirname, 'node_modules')],
    mainFields: ['jsnext:main', 'browser', 'main'],
    alias: {
      vue: 'vue/dist/vue.esm.js'
    }
  },

  optimization: {
    splitChunks: {
      chunks: 'initial',
      cacheGroups: {
        vendors: {
          name: 'website_vendors',
          chunks: 'initial',
          minChunks: 2
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true
      }),
      new OptimizeCSSAssetsPlugin()
    ]
  },

  plugins: [
    new CleanWebpackPlugin(),

    new VueLoaderPlugin(),

    new webpack.optimize.ModuleConcatenationPlugin(),

    new HappyPack({
      id: 'babel',
      loaders: ['babel-loader?cacheDirectory']
    }),

    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require(`${__dirname}/dll/common_vendors-${JS_VENDORS_VERSION}.manifest.json`)
    }),

    new MiniCssExtractPlugin({
      filename: process.env.NODE_ENV !== 'production' ? '../css/[name].css' : '../css/[name]-[hash].css',
      chunkFilename: process.env.NODE_ENV !== 'production' ? '../css/[name].css' : '../css/[name]-[hash].css'
    }),

    new PurgecssPlugin({
      paths: glob.sync(path.join(__dirname, './**/*.vue')),
      whitelistPatterns: [/--/, /__/]
    }),

    new HtmlWebpackPlugin({
      template: './website-admin/templates/index.template',
      filename: `${__dirname}/dist/website-admin/templates/pug/index.pug`,
      inject: false
    }),

    new HtmlWebpackPlugin({
      template: './website-account/templates/index.template',
      filename: `${__dirname}/dist/website-account/templates/pug/index.pug`,
      inject: false
    }),

    new webpack.HotModuleReplacementPlugin(),

    new WebpackDevServerOutput({
      path: `${__dirname}/dist/js`,
      isDel: true
    }),

    new WebpackNotifierPlugin({
      title: 'Webpack Finished',
      alwaysNotify: true
    }),

    /* eslint-disable */
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en|zh/)
    /* eslint-enable */
  ]
};
