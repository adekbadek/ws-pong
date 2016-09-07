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
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    })
  ]
}
