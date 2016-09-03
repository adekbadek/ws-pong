// https://robots.thoughtbot.com/pong-clone-in-javascript

var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function (callback) { window.setTimeout(callback, 1000 / 60) }

var canvas = document.createElement('canvas');
var width = 400;
var height = 600;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

// Paddle

function Paddle (x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.x_speed = 0;
  this.y_speed = 0;
}

Paddle.prototype.render = function () {
  context.fillStyle = '#fff';
  context.fillRect(this.x, this.y, this.width, this.height);
};

Paddle.prototype.move = function (x, y) {
  this.x += x;
  this.y += y;
  this.x_speed = x;
  this.y_speed = y;
  if (this.x < 0) { // all the way to the left
    this.x = 0;
    this.x_speed = 0;
  } else if (this.x + this.width > width) { // all the way to the right
    this.x = width - this.width;
    this.x_speed = 0;
  }
}

// Players
// are just Paddles + updating

function Player1 () {
  this.paddle = new Paddle(175, 580, 50, 10);
}

function Player2 () {
  this.paddle = new Paddle(175, 10, 50, 10);
}

Player1.prototype.render = function () {
  this.paddle.render();
};

Player2.prototype.render = function () {
  this.paddle.render();
};

Player1.prototype.update = function () {
  for (var key in keysDown) {
    var value = Number(key);
    if (value === 37) { // left arrow
      this.paddle.move(-4, 0);
    } else if (value === 39) { // right arrow
      this.paddle.move(4, 0);
    } else {
      this.paddle.move(0, 0);
    }
  }
};

Player2.prototype.update = function () {
  for (var key in keysDown) {
    var value = Number(key);
    if (value === 65) { // 'W' key
      this.paddle.move(-4, 0);
    } else if (value === 68) { // 'D' key
      this.paddle.move(4, 0);
    } else {
      this.paddle.move(0, 0);
    }
  }
};

// Ball
function Ball (x, y) {
  this.x = x;
  this.y = y;
  this.x_speed = 0;
  this.y_speed = 3; // initial speed
  this.radius = 5;
}

Ball.prototype.render = function () {
  context.beginPath();
  context.arc(this.x, this.y, this.radius, 2 * Math.PI, false);
  context.fillStyle = '#fff';
  context.fill();
};

Ball.prototype.update = function (paddle1, paddle2) {
  this.x += this.x_speed;
  this.y += this.y_speed;
  var topX = this.x - 5;
  var topY = this.y - 5;
  var bottomX = this.x + 5;
  var bottomY = this.y + 5;

  if (this.x - 5 < 0) { // hitting the left wall
    this.x = 5;
    this.x_speed = -this.x_speed;
  } else if (this.x + 5 > width) { // hitting the right wall
    this.x = width - 5;
    this.x_speed = -this.x_speed;
  }

  if (this.y < 0 || this.y > height) { // a point was scored
    this.x_speed = 0;
    this.y_speed = 3;
    this.x = width / 2;
    this.y = height / 2;
  }

  if (topY > height / 2) {
    if (topY < (paddle1.y + paddle1.height) && bottomY > paddle1.y && topX < (paddle1.x + paddle1.width) && bottomX > paddle1.x) {
      // hit the player1's paddle
      this.y_speed = -3;
      this.x_speed += (paddle1.x_speed / 2);
      this.y += this.y_speed;
    }
  } else {
    if (topY < (paddle2.y + paddle2.height) && bottomY > paddle2.y && topX < (paddle2.x + paddle2.width) && bottomX > paddle2.x) {
      // hit the player2's paddle
      this.y_speed = 3;
      this.x_speed += (paddle2.x_speed / 2);
      this.y += this.y_speed;
    }
  }
};

// init

var player1 = new Player1();
var player2 = new Player2();
var ball = new Ball(width / 2, height / 2);

window.onload = function () {
  document.body.appendChild(canvas);
  animate(step);
};

var step = function () {
  update();
  render();
  animate(step);
};

var update = function () {
  player1.update();
  player2.update();
  ball.update(player1.paddle, player2.paddle);
};

var render = function () {
  context.fillStyle = '#000';
  context.fillRect(0, 0, width, height);
  player1.render();
  player2.render();
  ball.render();
};

// Controls

var keysDown = {};

window.addEventListener('keydown', function (event) {
  keysDown[event.keyCode] = true;
});

window.addEventListener('keyup', function (event) {
  delete keysDown[event.keyCode];
});
