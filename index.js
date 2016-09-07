const path = require('path')
const http = require('http')

const express = require('express')
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server)

const _PORT_ = process.env.PORT || 3000
app.set('port', _PORT_)

app.set('views', './front')
app.set('view engine', 'pug')
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', function (req, res) {
  res.render('index')
})

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// primordial initial pos / the state
let nextConnectedIsLeft = true
let playersPos = {playerLeft: 212, playerLeftSpeed: 0, playerRight: 212, playerRightSpeed: 0}
let ballPos = {x: 400, y: 250, x_speed: 3, y_speed: 0}
let score = {pLeft: 0, pRight: 0}
let voters = {pLeft: 0, pRight: 0}

let initialPaddleSpeed = 6
let paddleSpeed = initialPaddleSpeed

let officialPositionBroadcaster
let isOfficialPositionBroadcasterBlurred
let candidates = []

const updatePaddleSpeed = () => {
  let newPaddleSpeed = 6 / (io.engine.clientsCount / 2)
  if (newPaddleSpeed !== paddleSpeed && newPaddleSpeed <= initialPaddleSpeed) {
    paddleSpeed = newPaddleSpeed
    console.log(`updated paddleSpeed to ${paddleSpeed}`)
  }
}

const chooseNewOfficialPositionBroadcaster = () => {
  if (candidates.length >= 1) {
    officialPositionBroadcaster = candidates[getRandomInt(0, candidates.length - 1)]
    console.log('get new OPB')
  }
}

// detect stalling
let lastBallPos
setInterval(() => {
  if (lastBallPos === ballPos) {
    chooseNewOfficialPositionBroadcaster()
  }
  lastBallPos = ballPos
}, 1000)

// define events for any new connection
io.on('connection', function (socket) {
  // io.emit will emit event to everyone
  // socket.emit will emit event just to specific connection

  updatePaddleSpeed()

  // handle voting on direction
  socket.on('key-send', function (data) {
    if (data === 'right-up') {
      playersPos.playerRight -= paddleSpeed
      playersPos.playerRightSpeed = -paddleSpeed
    } else if (data === 'right-down') {
      playersPos.playerRight += paddleSpeed
      playersPos.playerRightSpeed = paddleSpeed
    } else if (data === 'left-up') {
      playersPos.playerLeft -= paddleSpeed
      playersPos.playerLeftSpeed = -paddleSpeed
    } else if (data === 'left-down') {
      playersPos.playerLeft += paddleSpeed
      playersPos.playerLeftSpeed = paddleSpeed
    }
    io.emit('update-players-positions', playersPos)
  })

  socket.on('blur', function (data) {
    if (officialPositionBroadcaster === data.id) {
      // console.log('OPB blurred', candidates)
      if (candidates.length > 0) {
        officialPositionBroadcaster = candidates[0]
        // console.log(data.id, 'got candidates, reassigning to', officialPositionBroadcaster)
      } else {
        isOfficialPositionBroadcasterBlurred = true
      }
    } else {
      // remove from candidates
      candidates.splice(candidates.indexOf(data.id), 1)
      // console.log('blur', data.id, candidates.length, 'candidates left')
    }
  })

  // if focused, can again sameday become the officialPositionBroadcaster
  socket.on('focus', function (data) {
    if (officialPositionBroadcaster !== data.id) {
      if (isOfficialPositionBroadcasterBlurred) {
        officialPositionBroadcaster = data.id
        isOfficialPositionBroadcasterBlurred = false
      } else {
        candidates.push(data.id)
        // console.log('focus', data.id, candidates.length, 'candidates left')
      }
    }
  })

  socket.on('reload-ball-pos', function (data) {
    if (candidates.length > 0) {
      chooseNewOfficialPositionBroadcaster()
    }
  })

  socket.on('ball-pos', function (data) {
    if (data.id === officialPositionBroadcaster) {
      ballPos = data.ballPos
    }
  })

  socket.on('score', function (playerId) {
    score[playerId] += 1
    if (score.pRight !== score.pLeft) {
      let sorted = Object.keys(score).sort(function (a, b) { return score[a] - score[b] })
      score[sorted[1]] = score[sorted[1]] - score[sorted[0]]
      score[sorted[0]] = 0
    } else {
      score.pRight = score.pLeft = 0
    }
    io.emit('score', {score})
  })

  // every second, broadcast official ballPos
  setInterval(() => {
    io.emit('set-ball-pos', {ballPos, officialPositionBroadcaster})
  }, 1000)

  if (Object.keys(io.sockets.sockets).length === 1) {
    officialPositionBroadcaster = socket.id
    // console.log('new OPB', socket.id)
  } else if (isOfficialPositionBroadcasterBlurred) {
    officialPositionBroadcaster = socket.id
    isOfficialPositionBroadcasterBlurred = false
    // console.log('OPB blurred, new OPB', socket.id)
  } else {
    // can someday become officialPositionBroadcaster
    candidates.push(socket.id)
    // console.log('new candidate', socket.id, candidates)
  }

  const thisConnectedIsLeft = nextConnectedIsLeft
  socket.emit('init-game', {playersPos, ballPos, thisConnectedIsLeft, score, id: socket.id})

  thisConnectedIsLeft ? voters.pLeft += 1 : voters.pRight += 1

  io.emit('connections', {clientsCount: io.engine.clientsCount, voters})
  socket.on('disconnect', function () {
    if (officialPositionBroadcaster === socket.id) {
      // the OPB is dead, long live the OPB
      chooseNewOfficialPositionBroadcaster()
      // console.log('new OPB', officialPositionBroadcaster)
    }

    candidates.splice(candidates.indexOf(socket.id), 1)

    thisConnectedIsLeft ? voters.pLeft -= 1 : voters.pRight -= 1
    io.emit('connections', {clientsCount: io.engine.clientsCount, voters})

    updatePaddleSpeed()
  })

  nextConnectedIsLeft = !nextConnectedIsLeft
})

server.listen(_PORT_, function () {
  console.log(`Listening on port ${_PORT_}...`)
})
