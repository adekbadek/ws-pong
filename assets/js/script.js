/* global io */
// io is defined globally by /socket.io/socket.io.js
// here we connect to self, but can connect to any href supporting WebSockets: var socket = io.connect('http://www.example.com')
var socket = io()

// The box
var box = document.getElementById('box')
// init dimensions and position
var side = 200
box.style.width = box.style.height = side + 'px'
box.style.top = '35%'
box.style.left = '40%'

var move = {
  x: function (change) {
    box.style.top = (parseInt(box.style.top) + change) + '%'
  },
  y: function (change) {
    box.style.left = (parseInt(box.style.left) + change) + '%'
  }
}

// listen to socket event
var moveVal = 1
socket.on('key-receive', function (data) {
  switch (data) {
    case 'up':
      move.x(-moveVal)
      break
    case 'down':
      move.x(moveVal)
      break
    case 'left':
      move.y(-moveVal)
      break
    case 'right':
      move.y(moveVal)
      break
  }
})

// emit socket event
document.addEventListener('keydown', (e) => {
  if (e.keyCode === 38) { socket.emit('key-send', 'up') }
  if (e.keyCode === 40) { socket.emit('key-send', 'down') }
  if (e.keyCode === 37) { socket.emit('key-send', 'left') }
  if (e.keyCode === 39) { socket.emit('key-send', 'right') }
})
