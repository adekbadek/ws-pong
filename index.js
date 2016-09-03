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

// define events for any new connection
io.on('connection', function (socket) {
  // io.emit will emit event to everyone
  // socket.emit will emit event just to specific connection
  socket.on('key-send', function (data) {
    io.emit('key-receive', data)
  })

  // disconnect event
  socket.on('disconnect', function () {
    io.emit('news', { msg: 'Someone went home' })
  })
})

server.listen(_PORT_, function () {
  console.log(`Listening on port ${_PORT_}...`)
})
