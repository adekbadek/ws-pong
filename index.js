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

// primordial initial pos / the state
let nextConnectedIsLeft = true
let playersPos = {playerLeft: 225, playerLeftSpeed: 0, playerRight: 225, playerRightSpeed: 0}
let ballPos = {x: 400, y: 250, x_speed: 3, y_speed: 0}
let score = {pLeft: 0, pRight: 0}

// define events for any new connection
io.on('connection', function (socket) {
  // io.emit will emit event to everyone
  // socket.emit will emit event just to specific connection

  // handle voting on direction
  socket.on('key-send', function (data) {
    if (data === 'right-up') {
      playersPos.playerRight -= 4
      playersPos.playerRightSpeed = -4
    } else if (data === 'right-down') {
      playersPos.playerRight += 4
      playersPos.playerRightSpeed = 4
    } else if (data === 'left-up') {
      playersPos.playerLeft -= 4
      playersPos.playerLeftSpeed = -4
    } else if (data === 'left-down') {
      playersPos.playerLeft += 4
      playersPos.playerLeftSpeed = 4
    }
    io.emit('update-players-positions', playersPos)
  })

  socket.on('ball-pos', function (data) {
    ballPos = data
  })

  socket.on('score', function (playerId) {
    score[playerId] += 1
    io.emit('score', {score})
  })

  // every second, broadcast official ballPos
  setInterval(() => {
    io.emit('set-ball-pos', {ballPos})
  }, 1000)

  socket.emit('init-game', {playersPos, ballPos, nextConnectedIsLeft, score})
  nextConnectedIsLeft = !nextConnectedIsLeft

  io.emit('connections', {clientsCount: io.engine.clientsCount})
  socket.on('disconnect', function () {
    io.emit('connections', {clientsCount: io.engine.clientsCount})
  })
})

server.listen(_PORT_, function () {
  console.log(`Listening on port ${_PORT_}...`)
})
