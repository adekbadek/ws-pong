import { createStore } from 'redux'

const scoreReducer = (state, action) => {
  if (typeof state === 'undefined') {
    return 0
  }
  return action.data
}

export const stateStore = createStore(scoreReducer)
