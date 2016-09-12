// Paddle. A player is a paddle.

export default class Paddle {
  constructor (x, y, canvas, imgSrc) {
    this.x = x
    this.y = y
    this.width = 20
    this.height = 80
    this.x_speed = 0
    this.y_speed = 0
    this.maxY = __CANVAS_HEIGHT__
    if (imgSrc) {
      var img = document.createElement('img')
      img.src = imgSrc
      this.img = img
    }
    if (canvas) {
      this.context = canvas.context
      this.strokeColor = canvas.strokeColor
    }
  }

  render () {
    this.context.fillStyle = this.context.createPattern(this.img, 'repeat')
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
    } else if (this.y + this.height > this.maxY) { // all the way to the bottom
      this.y = this.maxY - this.height
      this.y_speed = 0
    }
  }
}
