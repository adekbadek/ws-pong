import Paddle from '../game/paddle'
import Ball from '../game/ball'
import {animate} from '../game/animation'

// here the game is started

const leftPaddle = new Paddle(
  20,
  process.env.PLAYER_INIT_Y
)
const rightPaddle = new Paddle(
  process.env.CANVAS_WIDTH - 20,
  process.env.PLAYER_INIT_Y
)

const ball = new Ball(
  {x: process.env.CANVAS_WIDTH / 2, y: process.env.CANVAS_HEIGHT / 2, x_speed: 3, y_speed: 0},
  {width: process.env.CANVAS_WIDTH, height: process.env.CANVAS_HEIGHT}, // canvas
  (ball) => {
    // TODO: emit ball pos update here
  }, // update callback
  (x) => {
    // socket.emit('score', (x < 0 ? 'pRight' : 'pLeft'))
  }
)

let step = () => {
  // every frame
  ball.update(leftPaddle, rightPaddle)

  animate(step)
}
animate(step)
