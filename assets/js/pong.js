// https://robots.thoughtbot.com/pong-clone-in-javascript

var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function (callback) { window.setTimeout(callback, 1000 / 60) }

window.onload = function () {
  document.body.appendChild(canvas);
  animate(step);
};

var step = function () {
  update();
  render();
  animate(step);
};

var canvas = document.createElement('canvas');
var width = 400;
var height = 400;
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
  if (this.y < 0) { // all the way to the top
    this.y = 0;
    this.y_speed = 0;
  } else if (this.y + this.height > height) { // all the way to the bottom
    this.y = height - this.height;
    this.y_speed = 0;
  }
}

// Player
// in just Paddle + updating

function Player (paddleX, leftKeyCode, rightKeyCode) {
  this.paddle = new Paddle(paddleX, height / 2 - 25, 10, 50);
  this.leftKeyCode = leftKeyCode
  this.rightKeyCode = rightKeyCode
}

Player.prototype.render = function () {
  this.paddle.render();
};

Player.prototype.update = function () {
  for (var key in keysDown) {
    var value = Number(key);
    if (value === this.leftKeyCode) { // left arrow
      this.paddle.move(0, -4);
    } else if (value === this.rightKeyCode) { // right arrow
      this.paddle.move(0, 4);
    } else {
      this.paddle.move(0, 0);
    }
  }
};

// Ball

function Ball (x, y, speed) {
  this.x = x;
  this.y = y;
  this.speed = speed
  this.x_speed = speed;
  this.y_speed = 0; // initial speed
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
  var ballTop = this.y - this.radius;
  var ballBottom = this.y + this.radius;
  var balLeft = this.x - this.radius;
  var ballRight = this.x + this.radius;

  if (this.y - this.radius < 0) { // hitting the top wall
    this.y = this.radius;
    this.y_speed = -this.y_speed;
  } else if (this.y + this.radius > height) { // hitting the bottom wall
    this.y = height - this.radius;
    this.y_speed = -this.y_speed;
  }

  if (this.x < 0 || this.x > height) { // a point was scored for player1
    this.x_speed = this.speed;
    this.y_speed = 0;
    this.x = width / 2;
    this.y = height / 2;
  }

  // TODO: points ^ for player2

  if (this.x < width / 2) {
    // the ball is on the left
    if (
      balLeft < (paddle1.x + paddle1.width) &&
      ballBottom < (paddle1.y + paddle1.height) + this.radius &&
      ballTop > paddle1.y - this.radius
    ) {
      // hit the player1's paddle
      this.x_speed = this.speed;
      this.y_speed += (paddle1.y_speed / 2);
      this.x += this.x_speed;
    }
  } else {
    // the ball is on the right
    if (
      ballBottom < (paddle2.y + paddle2.height) + this.radius &&
      ballTop > paddle2.y - this.radius &&
      ballRight > paddle2.x
    ) {
      // hit the player2's paddle
      this.x_speed = -this.speed;
      this.y_speed += (paddle2.y_speed / 2);
      this.x += this.x_speed;
    }
  }
};

// TODO: rename players 1, 2 to left, right

// init
var ball = new Ball(width / 2, height / 2, 3);
var player1 = new Player(20, 87, 83);
var player2 = new Player(width - 20, 38, 40);

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
