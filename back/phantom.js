var phantom = require('phantom')

var sitepage = null
var phInstance = null
phantom.create()
  .then(instance => {
    phInstance = instance
    return instance.createPage()
  })
  .then(page => {
    sitepage = page
    return sitepage.open('http://localhost:3000')
  })
  .then(status => {
    console.log(status)
    // return sitepage.property('content') // return site content
    return sitepage.evaluate(() => {
      var t = document.getElementById('intro').innerHTML
      return t
    })
  })
  .then(doc => {
    console.log(doc)
    sitepage.close()
    phInstance.exit()
  })
  .catch(error => {
    console.log(error)
    phInstance.exit()
  })

// import Canvas from './front/js/pong/canvas'
// const canvas = new Canvas({'width': 800, 'height': 500, strokeColor: '#fff'})
// console.log(canvas)
