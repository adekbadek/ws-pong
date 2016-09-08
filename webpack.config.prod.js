const webpack = require('webpack')
const devConfig = require('./webpack.config.dev.js')

devConfig.plugins = [
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  })
]

module.exports = devConfig
