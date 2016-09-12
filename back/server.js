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
let playersPos = {playerLeft: parseInt(process.env.PLAYER_INIT_Y), playerLeftSpeed: 0, playerRight: parseInt(process.env.PLAYER_INIT_Y), playerRightSpeed: 0}
let ballPos = {x: process.env.CANVAS_WIDTH / 2, y: process.env.CANVAS_HEIGHT / 2, x_speed: 5, y_speed: 0}
let score = {left: 0, right: 0}
let voters = {left: 0, right: 0}

const initialPaddleSpeed = 12
const getPaddleSpeed = () => {
  const allVoters = voters.left + voters.right
  return initialPaddleSpeed / (allVoters === 1 ? 1 : (allVoters / 2))
}

serverGame.ball.updateCallback = (ballPos) => {
  io.emit('ball-pos', {ballPos})
}
serverGame.ball.scoreCallback = (x) => {
  score = utils.updateScore(score, (x < 0 ? 'right' : 'left'))
  io.emit('score', {voters, score})
}

class AIPlayer {
  constructor (side) {
    this.side = side || (Math.random() > 0.5 ? 'left' : 'right')
    this.paddle = serverGame[this.side + 'Paddle']
    this.intervalTime = 1000
  }

  interval () {
    setTimeout(() => {
      let direction
      if (this.paddle.y + 40 < serverGame.ball.y) {
        direction = 'down'
      } else if (this.paddle.y + 40 > serverGame.ball.y) {
        direction = 'up'
      } else {
        direction = 'none'
      }
      playersPos = utils.updatePlayersPosition(playersPos, getPaddleSpeed(), `${this.side}-${direction}`)
      serverGame.updatePaddlePositions(playersPos)

      // console.log('move by AI player', this.side, serverGame.leftPaddle.y, serverGame.rightPaddle.y)
      io.emit('update-players-positions', playersPos)

      let haste = this.side === 'left' ? serverGame.ball.x_speed < 0 : serverGame.ball.x_speed > 0

      this.intervalTime = Math.floor(Math.random() * 1000 + 1500) / (serverGame.ball.y_speed === 0 ? 1 : Math.abs(serverGame.ball.y_speed)) / (haste ? 5 : 1)
      this.interval()
    }, this.intervalTime)
  }

  start () {
    voters[this.side] += 1
    this.interval()
  }
}

for (var i = 0; i < 3; i++) {
  const newAIPlayer = new AIPlayer(i % 2 > 0 ? 'left' : 'right')
  newAIPlayer.start()
}

// define events for any new connection
io.on('connection', function (socket) {
  // io.emit will emit event to everyone
  // socket.emit will emit event just to specific connection

  // handle voting on direction
  socket.on('key-send', function (data) {
    playersPos = utils.updatePlayersPosition(playersPos, getPaddleSpeed(), data)

    // update server game's paddles
    serverGame.updatePaddlePositions(playersPos)

    // update client's paddles
    io.emit('update-players-positions', playersPos)
  })

  // for this new connection, assign paddle (side)
  const thisConnectedIsLeft = nextConnectedIsLeft
  thisConnectedIsLeft ? voters.left += 1 : voters.right += 1
  socket.emit('init-game', {playersPos, ballPos, thisConnectedIsLeft, id: socket.id, voters, score})

  io.emit('connections', {clientsCount: io.engine.clientsCount, voters, score})

  socket.on('disconnect', function () {
    thisConnectedIsLeft ? voters.left -= 1 : voters.right -= 1
    io.emit('connections', {clientsCount: io.engine.clientsCount, voters, score})
  })

  nextConnectedIsLeft = !nextConnectedIsLeft
})

server.listen(_PORT_, function () {
  console.log(`Listening on port ${_PORT_}...`)
})
