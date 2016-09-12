import * as utils from '../game/utils'

export default class AIPlayer {
  constructor (side, serverGame, playersPos, voters, callback) {
    this.serverGame = serverGame
    this.playersPos = playersPos
    this.callback = callback
    this.voters = voters
    this.side = side || (Math.random() > 0.5 ? 'left' : 'right')
    this.paddle = serverGame[this.side + 'Paddle']
    this.intervalTime = 1000
  }

  interval () {
    setTimeout(() => {
      let direction
      if (this.paddle.y + 40 < this.serverGame.ball.y) {
        direction = 'down'
      } else if (this.paddle.y + 40 > this.serverGame.ball.y) {
        direction = 'up'
      } else {
        direction = 'none'
      }
      this.playersPos = utils.updatePlayersPosition(this.playersPos, utils.getPaddleSpeed(this.voters), `${this.side}-${direction}`)
      this.serverGame.updatePaddlePositions(this.playersPos)

      this.callback()

      let haste = this.side === 'left' ? this.serverGame.ball.x_speed < 0 : this.serverGame.ball.x_speed > 0

      this.intervalTime = Math.floor(Math.random() * 1000 + 1500) / (this.serverGame.ball.y_speed === 0 ? 1 : Math.abs(this.serverGame.ball.y_speed)) / (haste ? 5 : 1)
      this.interval()
    }, this.intervalTime)
  }

  start () {
    this.voters[this.side] += 1
    this.interval()
  }
}
