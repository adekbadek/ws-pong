var webpack = require('webpack')
var path = require('path')

module.exports = {
  entry: './js/main.js',
  output: {
    filename: 'assets/js/bundle.js'
  },
  resolve: {
    extensions: ['', '.js']
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
}
