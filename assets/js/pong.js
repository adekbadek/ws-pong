/* global io */
// https://robots.thoughtbot.com/pong-clone-in-javascript

(function () {
  var animate = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) { window.setTimeout(callback, 1000 / 60) }

  var canvas = document.createElement('canvas')
  canvas.id = 'canvas'
  var height = 500
  var width = 800
  canvas.width = width
  canvas.height = height
  var context = canvas.getContext('2d')

  // Paddle. A player is a paddle.

  function Paddle (x, y, imgSrc) {
    this.x = x
    this.y = y
    this.width = 20
    this.height = 80
    this.x_speed = 0
    this.y_speed = 0
    this.imgSrc = imgSrc
  }

  Paddle.prototype.render = function () {
    var img = document.createElement('img')
    img.src = this.imgSrc
    context.fillStyle = context.createPattern(img, 'repeat')
    context.fillRect(this.x, this.y, this.width, this.height)
    context.strokeStyle = secColor
    context.lineWidth = 3
    context.strokeRect(this.x, this.y, this.width, this.height)
  }

  Paddle.prototype.move = function (y, speed) {
    this.y = y
    this.y_speed = speed
    if (this.y < 0) { // all the way to the top
      this.y = 0
      this.y_speed = 0
    } else if (this.y + this.height > height) { // all the way to the bottom
      this.y = height - this.height
      this.y_speed = 0
    }
  }

  // Ball

  function Ball (config) {
    this.speed = 3
    this.x = config.x
    this.y = config.y
    this.x_speed = config.x_speed
    this.y_speed = config.y_speed
    this.radius = 5
  }

  Ball.prototype.render = function () {
    context.beginPath()
    context.arc(this.x, this.y, this.radius, 2 * Math.PI, false)
    context.fillStyle = secColor
    context.fill()
  }

  Ball.prototype.forceUpdate = function (ballPos) {
    this.x = ballPos.x
    this.y = ballPos.y
    this.x_speed = ballPos.x_speed
    this.y_speed = ballPos.y_speed
  }

  Ball.prototype.update = function (paddleLeft, paddleRigth) {
    this.x += this.x_speed
    this.y += this.y_speed
    var ballTop = this.y - this.radius
    var ballBottom = this.y + this.radius
    var balLeft = this.x - this.radius
    var ballRight = this.x + this.radius

    if (this.y - this.radius < 0) { // hitting the top wall
      this.y = this.radius
      this.y_speed = -this.y_speed
    } else if (this.y + this.radius > height) { // hitting the bottom wall
      this.y = height - this.radius
      this.y_speed = -this.y_speed
    }

    if (this.x < 0 || this.x > width) { // a point was scored
      if (this.x < 0) {
        socket.emit('score', 'pRight')
      } else {
        socket.emit('score', 'pLeft')
      }
      this.x_speed = (this.x < 0 ? -this.speed : this.speed) * 0.6 // slomo
      this.y_speed = 0
      this.x = width / 2
      this.y = height / 2
    }

    if (this.x < width / 2) {
      // the ball is on the left
      if (balLeft < (paddleLeft.x + paddleLeft.width) && ballBottom < (paddleLeft.y + paddleLeft.height) + this.radius * 2 && ballTop > paddleLeft.y - this.radius * 2) {
        // hit the playerLeft's paddle
        this.x_speed = this.speed
        this.y_speed += (paddleLeft.y_speed / 2)
        this.x += this.x_speed
      }
    } else {
      // the ball is on the right
      if (ballBottom < (paddleRigth.y + paddleRigth.height) + this.radius * 2 && ballTop > paddleRigth.y - this.radius * 2 && ballRight > paddleRigth.x) {
        // hit the playerRight's paddle
        this.x_speed = -this.speed
        this.y_speed += (paddleRigth.y_speed / 2)
        this.x += this.x_speed
      }
    }
    // update ball pos info on backend to use for new connections and forced updates
    socket.emit('ball-pos', {
      x: this.x,
      y: this.y,
      x_speed: this.x_speed,
      y_speed: this.y_speed
    })
  }

  // Controls

  var introDiv = document.getElementById('intro')
  var introNum = document.getElementById('intro-num')
  var introNumOther = document.getElementById('intro-num-other')
  var introDir = document.getElementById('intro-dir')
  var closeBtn = document.getElementById('btn-close')

  window.addEventListener('keydown', function (e) {
    if (e.keyCode === 38) { socket.emit('key-send', isPlayerLeft ? 'left-up' : 'right-up') }
    if (e.keyCode === 40) { socket.emit('key-send', isPlayerLeft ? 'left-down' : 'right-down') }
  })

  var ball
  var playerLeft
  var playerRight
  var isPlayerLeft
  var score
  var voters

  // Socket
  var socket = io()

  // every second, server will update the position so all connections are on the same page
  socket.on('set-ball-pos', function (data) {
    ball.forceUpdate(data.ballPos)
  })

  socket.on('update-players-positions', function (data) {
    playerLeft.move(data.playerLeft, data.playerLeftSpeed)
    playerRight.move(data.playerRight, data.playerRightSpeed)
  })

  socket.on('score', function (data) {
    score = data.score
  })

  socket.on('connections', function (data) {
    voters = data.voters
    introNum.innerHTML = ' ' + (data.voters[isPlayerLeft ? 'pLeft' : 'pRight'] - 1)
    introNumOther.innerHTML = ' ' + data.voters[isPlayerLeft ? 'pRight' : 'pLeft']
  })

  var secColor = '#fff'
  var playerLeftImg = 'img/stripe.jpg'
  var playerRightImg = 'img/dots.jpg'

  socket.on('init-game', function (data) {
    // initial score and player identification
    isPlayerLeft = data.thisConnectedIsLeft
    score = data.score

    introDir.innerHTML = ' ' + (data.thisConnectedIsLeft ? 'left' : 'right')

    ball = new Ball(data.ballPos)
    playerLeft = new Paddle(
      20,
      data.playersPos.playerLeft,
      playerLeftImg
    )
    playerRight = new Paddle(
      width - 40,
      data.playersPos.playerRight,
      playerRightImg
    )

    document.body.style.backgroundImage = 'url("' + (isPlayerLeft ? playerLeftImg : playerRightImg) + '")'
    document.body.style.opacity = 1

    // frame of animation
    var step = function () {
      ball.update(playerLeft, playerRight)

      context.fillStyle = '#000'
      context.fillRect(0, 0, width, height)
      context.font = '16px sans-serif'
      context.fillStyle = secColor
      context.fillText('score', width / 2 - context.measureText('score').width / 2, 15)
      context.fillText('voters', width / 2 - context.measureText('voters').width / 2, height - 6)
      context.font = '20px sans-serif'
      // scores
      context.fillText(score.pLeft, width / 2 - context.measureText(score.pLeft).width - 4, 38)
      context.fillText('-', width / 2 - 2, 38)
      context.fillText(score.pRight, width / 2 + 6, 38)
      // voters
      context.fillText(voters.pLeft, width / 2 - context.measureText(voters.pLeft).width - 4, height - 23)
      context.fillText(':', width / 2 - 2, height - 23)
      context.fillText(voters.pRight, width / 2 + 6, height - 23)
      playerLeft.render()
      playerRight.render()
      ball.render()

      animate(step)
    }

    document.body.appendChild(canvas)
    animate(step)
  })

  closeBtn.onclick = function () {
    introDiv.remove()
  }

})()
