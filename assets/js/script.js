/* global io */
// io is defined globally by /socket.io/socket.io.js
// here we connect to self, but can connect to any href supporting WebSockets: var socket = io.connect('http://www.example.com')
var socket = io()

// The box
var box = document.getElementById('box')
// init dimensions and position
box.style.width = box.style.height = '50px'
box.style.top = (window.innerHeight / 2 - 25) + 'px'
box.style.left = (window.innerWidth / 2 - 25) + 'px'

var move = {
  x: function (change) {
    box.style.top = (parseInt(box.style.top) + change) + 'px'
  },
  y: function (change) {
    box.style.left = (parseInt(box.style.left) + change) + 'px'
  }
}

// listen to socket event
socket.on('key-receive', function (data) {
  switch (data) {
    case 'up':
      move.x(-10)
      break
    case 'down':
      move.x(10)
      break
    case 'left':
      move.y(-10)
      break
    case 'right':
      move.y(10)
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
