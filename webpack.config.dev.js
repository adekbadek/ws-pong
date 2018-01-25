const webpack = require('webpack')
const autoprefixer = require('autoprefixer')

module.exports = {
  entry: './front/js/main.js',
  output: {
    filename: 'public/bundle.js'
  },
  resolve: {
    extensions: ['', '.js', '.sass']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.sass$/,
        loaders: ['style', 'css', 'postcss-loader', 'sass']
      }
    ]
  },
  postcss: function () {
    return [autoprefixer]
  },
  plugins: [
    new webpack.DefinePlugin({
      __CANVAS_WIDTH__: process.env.CANVAS_WIDTH,
      __CANVAS_HEIGHT__: process.env.CANVAS_HEIGHT,
      __INIT_PADDLE_SPEED__: process.env.INIT_PADDLE_SPEED,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ]
}
