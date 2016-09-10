require('./../style')

import {updateState, stateStore} from './store'
import {playerLeftImg, playerRightImg} from '../../game/utils'

import Paddle from '../../game/paddle'
import Ball from '../../game/ball'
import Canvas from '../../game/canvas'
import {step, animate} from '../../game/animation'

// Controls

var introDiv = document.getElementById('intro')
var introNum = document.getElementById('intro-num')
var introNumOther = document.getElementById('intro-num-other')
var introDir = document.getElementById('intro-dir')
var closeBtn = document.getElementById('btn-close')

window.addEventListener('keydown', function (e) {
  if (e.keyCode === 38) { socket.emit('key-send', isPlayerLeftGlobal ? 'left-up' : 'right-up') }
  if (e.keyCode === 40) { socket.emit('key-send', isPlayerLeftGlobal ? 'left-down' : 'right-down') }
})

var ballGlobal
var playerLeftGlobal
var playerRightGlobal
var isPlayerLeftGlobal

// Socket
const io = require('socket.io-client')
var socket = io()

socket.on('ball-pos', function (data) {
  ballGlobal.forceUpdate(data.ballPos)
})

socket.on('update-players-positions', function (data) {
  playerLeftGlobal.move(data.playerLeft, data.playerLeftSpeed)
  playerRightGlobal.move(data.playerRight, data.playerRightSpeed)
})

socket.on('score', function (data) {
  updateState(data)
})

socket.on('connections', function (data) {
  updateState(data)
  introNum.innerHTML = ' ' + (data.voters[isPlayerLeftGlobal ? 'pLeft' : 'pRight'] - 1)
  introNumOther.innerHTML = ' ' + data.voters[isPlayerLeftGlobal ? 'pRight' : 'pLeft']
})

socket.on('init-game', function (data) {
  // initial score and player identification
  isPlayerLeftGlobal = data.thisConnectedIsLeft
  updateState(data)

  introDir.innerHTML = ' ' + (data.thisConnectedIsLeft ? 'left' : 'right')

  const canvas = new Canvas({'width': __CANVAS_WIDTH__, 'height': __CANVAS_HEIGHT__, strokeColor: '#fff'})

  ballGlobal = new Ball(
    data.ballPos,
    canvas
  )

  playerLeftGlobal = new Paddle(
    20,
    data.playersPos.playerLeft,
    canvas,
    playerLeftImg
  )
  playerRightGlobal = new Paddle(
    canvas.width - 40,
    data.playersPos.playerRight,
    canvas,
    playerRightImg
  )

  animate(() => {
    step(canvas, {playerLeftGlobal, playerRightGlobal, ballGlobal}, stateStore)
  })

  document.body.style.backgroundImage = 'url("' + (isPlayerLeftGlobal ? playerLeftImg : playerRightImg) + '")'
  document.body.style.opacity = 1
  document.body.appendChild(canvas.canvasEl)
})

closeBtn.onclick = function () {
  introDiv.remove()
}
