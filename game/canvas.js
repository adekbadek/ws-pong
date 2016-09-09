export default class Canvas {
  constructor (config) {
    this.canvasEl = document.createElement('canvas')
    this.canvasEl.id = 'canvas'
    this.canvasEl.width = config.width
    this.canvasEl.height = config.height
    this.context = this.canvasEl.getContext('2d')
    //
    this.strokeColor = config.strokeColor
    this.width = config.width
    this.height = config.height
  }
}
