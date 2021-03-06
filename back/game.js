import Paddle from '../game/paddle'
import Ball from '../game/ball'
import {animate} from '../game/animation'

// here the game is started

export const leftPaddle = new Paddle(
  20,
  parseInt(process.env.PLAYER_INIT_Y)
)
export const rightPaddle = new Paddle(
  process.env.CANVAS_WIDTH - 40,
  parseInt(process.env.PLAYER_INIT_Y)
)

export const ball = new Ball(
  {x: process.env.CANVAS_WIDTH / 2, y: process.env.CANVAS_HEIGHT / 2, x_speed: 3, y_speed: 0},
  {width: process.env.CANVAS_WIDTH, height: process.env.CANVAS_HEIGHT} // canvas
)

export const updatePaddlePositions = (playersPos) => {
  leftPaddle.move(playersPos.playerLeft, playersPos.playerLeftSpeed)
  rightPaddle.move(playersPos.playerRight, playersPos.playerRightSpeed)
}

// this starts the frame loop
let step = () => {
  // every frame
  ball.update(leftPaddle, rightPaddle)

  animate(step)
}
animate(step)
