import Paddle from '../front/js/pong/paddle'
import Ball from '../front/js/pong/ball'
import {animate} from '../front/js/pong/animation'

// here the game is started

const p1 = new Paddle(
  null, // canvas
  20, // x pos
  process.env.PLAYER_INIT_Y
)
const p2 = new Paddle(
  null, // canvas
  process.env.CANVAS_WIDTH - 20, // x pos
  process.env.PLAYER_INIT_Y
)

const ball = new Ball(
  {x: process.env.CANVAS_WIDTH / 2, y: process.env.CANVAS_HEIGHT / 2, x_speed: 3, y_speed: 0},
  null, // canvas
  (ball) => {
    // TODO: emit ball pos update here
    console.log(ball.x)
  }, // update callback
  (x) => {
    // socket.emit('score', (x < 0 ? 'pRight' : 'pLeft'))
  }
)

let step = () => {
  // every frame

  ball.update(p1, p2)

  animate(step)
}
animate(step)
