const path = require('path')
const http = require('http')

const express = require('express')
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)

const _PORT_ = process.env.PORT || 3000
app.set('port', _PORT_)

app.set('views', './views')
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'assets')))

app.get('/', function (req, res) {
  res.render('index')
})

// primordial initial pos
const pos = {x: 400, y: 200}
var initMoveVal = 10

// define events for any new connection
io.on('connection', function (socket) {
  // io.emit will emit event to everyone
  // socket.emit will emit event just to specific connection
  socket.on('key-send', function (data) {
    var moveVal = initMoveVal / io.engine.clientsCount
    switch (data) {
      case 'up':
        pos.y -= moveVal
        break
      case 'down':
        pos.y += moveVal
        break
      case 'left':
        pos.x -= moveVal
        break
      case 'right':
        pos.x += moveVal
        break
    }
    io.emit('key-receive', {pos})
  })

  // emit initial pos (to one) and connections (to everyone) no. for new connection
  socket.emit('initial-pos', {pos})
  io.emit('connections', {clientsCount: io.engine.clientsCount})

  socket.on('disconnect', function () {
    io.emit('connections', {clientsCount: io.engine.clientsCount})
  })
})

server.listen(_PORT_, function () {
  console.log(`Listening on port ${_PORT_}...`)
})
