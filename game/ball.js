export default class Ball {
  constructor (ballPos, canvas, updateCallback, scoreCallback) {
    this.speed = 2
    this.x = ballPos.x
    this.y = ballPos.y
    this.x_speed = ballPos.x_speed
    this.y_speed = ballPos.y_speed
    this.radius = 5
    this.canvas = canvas
    this.updateCallback = updateCallback || null
    this.scoreCallback = scoreCallback || null
  }

  render () {
    this.canvas.context.beginPath()
    this.canvas.context.arc(this.x, this.y, this.radius, 2 * Math.PI, false)
    this.canvas.context.fillStyle = this.canvas.strokeColor
    this.canvas.context.fill()
  }

  forceUpdate (ballPos) {
    this.x = ballPos.x
    this.y = ballPos.y
    this.x_speed = ballPos.x_speed
    this.y_speed = ballPos.y_speed
  }

  update (paddleLeft, paddleRigth) {
    this.x += this.x_speed
    this.y += this.y_speed
    var ballTop = this.y - this.radius
    var ballBottom = this.y + this.radius
    var balLeft = this.x - this.radius
    var ballRight = this.x + this.radius

    if (this.y - this.radius < 0) { // hitting the top wall
      this.y = this.radius
      this.y_speed = -this.y_speed
    } else if (this.y + this.radius > this.canvas.height) { // hitting the bottom wall
      this.y = this.canvas.height - this.radius
      this.y_speed = -this.y_speed
    }

    if (this.x < 0 || this.x > this.canvas.width) { // a point was scored
      if (this.scoreCallback) { this.scoreCallback(this.x) }
      this.x_speed = (this.x < 0 ? -this.speed : this.speed) * 0.6 // slomo
      this.y_speed = 0
      this.x = this.canvas.width / 2
      this.y = this.canvas.height / 2
    }

    if (this.x < this.canvas.width / 2) {
      // the ball is on the left
      if (balLeft < (paddleLeft.x + paddleLeft.width) && ballBottom < (paddleLeft.y + paddleLeft.height) + this.radius * 2 && ballTop > paddleLeft.y - this.radius * 2) {
        // hit the playerLeft's paddle
        if (process) { console.log('hit left paddle') }
        this.x_speed = this.speed
        this.y_speed += (paddleLeft.y_speed / 2)
        this.x += this.x_speed
      }
    } else {
      // the ball is on the right
      if (ballBottom < (paddleRigth.y + paddleRigth.height) + this.radius * 2 && ballTop > paddleRigth.y - this.radius * 2 && ballRight > paddleRigth.x) {
        // hit the playerRight's paddle
        if (process) { console.log('hit right paddle') }
        this.x_speed = -this.speed
        this.y_speed += (paddleRigth.y_speed / 2)
        this.x += this.x_speed
      }
    }
    if (this.updateCallback) { this.updateCallback(this) }
  }
}
