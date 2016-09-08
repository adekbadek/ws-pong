import {stateStore} from './store'

export const animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function (callback) { window.setTimeout(callback, 1000 / 60) }

// frame of animation
export const step = function (canvasConfig, gameElements) {
  const scores = stateStore.getState().score
  const voters = stateStore.getState().voters

  gameElements.ballGlobal.update(gameElements.playerLeftGlobal, gameElements.playerRightGlobal)

  canvasConfig.context.fillStyle = '#00f'
  canvasConfig.context.fillRect(0, 0, canvasConfig.width, canvasConfig.height)
  canvasConfig.context.font = '16px sans-serif'
  canvasConfig.context.fillStyle = canvasConfig.strokeColor
  canvasConfig.context.fillText('score', canvasConfig.width / 2 - canvasConfig.context.measureText('score').width / 2, 18)
  canvasConfig.context.fillText('voters', canvasConfig.width / 2 - canvasConfig.context.measureText('voters').width / 2, canvasConfig.height - 10)
  canvasConfig.context.font = '20px sans-serif'
  // scores
  canvasConfig.context.fillText(scores.pLeft, canvasConfig.width / 2 - canvasConfig.context.measureText(scores.pLeft).width - 4, 40)
  canvasConfig.context.fillText('-', canvasConfig.width / 2 - 2, 40)
  canvasConfig.context.fillText(scores.pRight, canvasConfig.width / 2 + 6, 40)
  // voters
  canvasConfig.context.fillText(voters.pLeft, canvasConfig.width / 2 - canvasConfig.context.measureText(voters.pLeft).width - 4, canvasConfig.height - 30)
  canvasConfig.context.fillText(':', canvasConfig.width / 2 - 2, canvasConfig.height - 30)
  canvasConfig.context.fillText(voters.pRight, canvasConfig.width / 2 + 6, canvasConfig.height - 30)
  gameElements.playerLeftGlobal.render()
  gameElements.playerRightGlobal.render()
  gameElements.ballGlobal.render()

  animate(() => { step(canvasConfig, gameElements, scores, voters) })
}
