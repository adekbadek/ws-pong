const path = require('path')
const http = require('http')

const express = require('express')
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)

import * as serverGame from './game'
import * as utils from '../game/utils'

const _PORT_ = process.env.PORT || 3000
app.set('port', _PORT_)

app.set('views', './front')
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function (req, res) {
  res.render('index')
})

// globals
let nextConnectedIsLeft = true
let playersPos = {playerLeft: process.env.PLAYER_INIT_Y, playerLeftSpeed: 0, playerRight: process.env.PLAYER_INIT_Y, playerRightSpeed: 0}
let ballPos = {x: process.env.CANVAS_WIDTH / 2, y: process.env.CANVAS_HEIGHT / 2, x_speed: 3, y_speed: 0}
let score = {pLeft: 0, pRight: 0}
let voters = {pLeft: 0, pRight: 0}

const initialPaddleSpeed = 12
const getPaddleSpeed = () => {
  return initialPaddleSpeed / (io.engine.clientsCount === 1 ? 1 : (io.engine.clientsCount / 2))
}

serverGame.ball.updateCallback = (ballPos) => {
  io.emit('ball-pos', {ballPos})
}
serverGame.ball.scoreCallback = (x) => {
  score = utils.updateScore(score, (x < 0 ? 'pRight' : 'pLeft'))
  io.emit('score', {voters, score})
}

// define events for any new connection
io.on('connection', function (socket) {
  // io.emit will emit event to everyone
  // socket.emit will emit event just to specific connection

  // handle voting on direction
  socket.on('key-send', function (data) {
    playersPos = utils.updatePlayersPosition(playersPos, getPaddleSpeed(), data)

    // update server game's paddles
    serverGame.rightPaddle.move(playersPos.playerRight, playersPos.playerRightSpeed)
    serverGame.leftPaddle.move(playersPos.playerLeft, playersPos.playerLeftSpeed)

    // update client's paddles
    io.emit('update-players-positions', playersPos)
  })

  // for this new connection, assign paddle (side)
  const thisConnectedIsLeft = nextConnectedIsLeft
  thisConnectedIsLeft ? voters.pLeft += 1 : voters.pRight += 1
  socket.emit('init-game', {playersPos, ballPos, thisConnectedIsLeft, id: socket.id, voters, score})

  io.emit('connections', {clientsCount: io.engine.clientsCount, voters, score})
  socket.on('disconnect', function () {
    thisConnectedIsLeft ? voters.pLeft -= 1 : voters.pRight -= 1
    io.emit('connections', {clientsCount: io.engine.clientsCount, voters, score})
  })

  nextConnectedIsLeft = !nextConnectedIsLeft
})

server.listen(_PORT_, function () {
  console.log(`Listening on port ${_PORT_}...`)
})
