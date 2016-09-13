let animate
if (typeof window !== 'undefined') {
  animate = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback) { window.setTimeout(callback, 1000 / 60) }
} else {
  animate = function (callback) { setTimeout(callback, 1000 / 60) }
}

export {animate}

// frame of animation for browser
export const step = function (canvas, gameElements, store) {
  let scores = store.getState().score
  let voters = store.getState().voters

  gameElements.ballGlobal.update(gameElements.playerLeftGlobal, gameElements.playerRightGlobal)

  canvas.context.fillStyle = '#00f'
  canvas.context.fillRect(0, 0, canvas.width, canvas.height)
  canvas.context.font = '16px sans-serif'
  canvas.context.fillStyle = canvas.strokeColor
  canvas.context.fillText('score', canvas.width / 2 - canvas.context.measureText('score').width / 2, 18)
  canvas.context.fillText('voters', canvas.width / 2 - canvas.context.measureText('voters').width / 2, canvas.height - 10)
  canvas.context.font = '20px sans-serif'
  // scores
  canvas.context.fillText(scores.left, canvas.width / 2 - canvas.context.measureText(scores.left).width - 4, 40)
  canvas.context.fillText('-', canvas.width / 2 - 2, 40)
  canvas.context.fillText(scores.right, canvas.width / 2 + 6, 40)
  // voters
  canvas.context.fillText(voters.left, canvas.width / 2 - canvas.context.measureText(voters.left).width - 4, canvas.height - 30)
  canvas.context.fillText(':', canvas.width / 2 - 2, canvas.height - 30)
  canvas.context.fillText(voters.right, canvas.width / 2 + 6, canvas.height - 30)
  gameElements.playerLeftGlobal.render()
  gameElements.playerRightGlobal.render()
  gameElements.ballGlobal.render()

  animate(() => { step(canvas, gameElements, store) })
}
