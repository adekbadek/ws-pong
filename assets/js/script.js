/* global io */
// io is defined globally by /socket.io/socket.io.js
// here we connect to self, but can connect to any href supporting WebSockets: var socket = io.connect('http://www.example.com')
var socket = io()

var clientsCountDiv = document.getElementById('clients-count')
var thereDiv = document.getElementById('there')

// init dimensions and position
var box = document.getElementById('box')
var side = 200
box.style.width = box.style.height = side + 'px'

var handleResponse = function (data) {
  box.style.top = data.pos.y + 'px'
  box.style.left = data.pos.x + 'px'
  if (data.foundWally) {
    box.style.borderColor = '#2000ff'
    thereDiv.style.display = 'inline'
  } else {
    box.style.borderColor = 'transparent'
    thereDiv.style.display = 'none'
  }
}

// listen to socket events
socket.on('initial-pos', function (data) {
  handleResponse(data)
  box.style.opacity = 1
})
socket.on('key-receive', function (data) {
  handleResponse(data)
})
socket.on('connections', function (data) {
  clientsCountDiv.innerHTML = data.clientsCount
})

// emit socket event
document.addEventListener('keydown', (e) => {
  if (e.keyCode === 38) { socket.emit('key-send', 'up') }
  if (e.keyCode === 40) { socket.emit('key-send', 'down') }
  if (e.keyCode === 37) { socket.emit('key-send', 'left') }
  if (e.keyCode === 39) { socket.emit('key-send', 'right') }
})
