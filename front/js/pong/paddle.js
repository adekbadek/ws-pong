// Paddle. A player is a paddle.

export default class Paddle {
  constructor (canvas, x, y, imgSrc) {
    this.x = x
    this.y = y
    this.width = 20
    this.height = 80
    this.x_speed = 0
    this.y_speed = 0
    this.imgSrc = imgSrc
    this.context = canvas.context
    this.canvasHeight = canvas.height
    this.strokeColor = canvas.strokeColor
  }

  render () {
    var img = document.createElement('img')
    img.src = this.imgSrc
    this.context.fillStyle = this.context.createPattern(img, 'repeat')
    this.context.fillRect(this.x, this.y, this.width, this.height)
    this.context.strokeStyle = this.strokeColor
    this.context.lineWidth = 2
    this.context.strokeRect(this.x, this.y, this.width, this.height)
  }

  move (y, speed) {
    this.y = y
    this.y_speed = speed
    if (this.y < 0) { // all the way to the top
      this.y = 0
      this.y_speed = 0
    } else if (this.y + this.height > this.canvasHeight) { // all the way to the bottom
      this.y = this.canvasHeight - this.height
      this.y_speed = 0
    }
  }
}
