export const updatePlayersPosition = (playersPos, paddleSpeed, data) => {
  if (data === 'right-up') {
    if (playersPos.playerRight >= 0) {
      playersPos.playerRight -= paddleSpeed
      playersPos.playerRightSpeed = -paddleSpeed
    }
  } else if (data === 'right-down') {
    if (playersPos.playerRight + 80 <= (process ? process.env.CANVAS_HEIGHT : __CANVAS_HEIGHT__)) {
      playersPos.playerRight += paddleSpeed
      playersPos.playerRightSpeed = paddleSpeed
    }
  } else if (data === 'left-up') {
    if (playersPos.playerLeft >= 0) {
      playersPos.playerLeft -= paddleSpeed
      playersPos.playerLeftSpeed = -paddleSpeed
    }
  } else if (data === 'left-down') {
    if (playersPos.playerLeft + 80 <= (process ? process.env.CANVAS_HEIGHT : __CANVAS_HEIGHT__)) {
      playersPos.playerLeft += paddleSpeed
      playersPos.playerLeftSpeed = paddleSpeed
    }
  }
  return playersPos
}

// get score, add point for a player, return difference in scores as a new score
export const updateScore = (score, playerId) => {
  score[playerId] += 1
  if (score.pRight !== score.pLeft) {
    let sorted = Object.keys(score).sort(function (a, b) { return score[a] - score[b] })
    score[sorted[1]] = score[sorted[1]] - score[sorted[0]]
    score[sorted[0]] = 0
  } else {
    score.pRight = score.pLeft = 0
  }
  return score
}
