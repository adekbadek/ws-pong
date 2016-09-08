export default class Ball {
  constructor (config, canvasConfig, updateCallback, scoreCallback) {
    this.speed = 2
    this.x = config.x
    this.y = config.y
    this.x_speed = config.x_speed
    this.y_speed = config.y_speed
    this.radius = 5
    this.canvasConfig = canvasConfig
    this.scoreCallback = scoreCallback
    this.updateCallback = updateCallback
  }

  render () {
    this.canvasConfig.context.beginPath()
    this.canvasConfig.context.arc(this.x, this.y, this.radius, 2 * Math.PI, false)
    this.canvasConfig.context.fillStyle = this.canvasConfig.strokeColor
    this.canvasConfig.context.fill()
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
    } else if (this.y + this.radius > this.canvasConfig.height) { // hitting the bottom wall
      this.y = this.canvasConfig.height - this.radius
      this.y_speed = -this.y_speed
    }

    if (this.x < 0 || this.x > this.canvasConfig.width) { // a point was scored
      this.scoreCallback(this.x)
      this.x_speed = (this.x < 0 ? -this.speed : this.speed) * 0.6 // slomo
      this.y_speed = 0
      this.x = this.canvasConfig.width / 2
      this.y = this.canvasConfig.height / 2
    }

    if (this.x < this.canvasConfig.width / 2) {
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
    this.updateCallback()
  }
}
