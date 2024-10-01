import tokenDataActionTypes from './tokenDataActionTypes'

export const addToken = (payload) => {
  return {
    type: tokenDataActionTypes.ADD_TOKEN,
    payload
  }
}

export const deleteToken = (payload) => {
  return {
    type: tokenDataActionTypes.DELETE_TOKEN,
    payload
  }
}

export const updateToken = (payload) => {
  return {
    type: tokenDataActionTypes.UPDATE_TOKEN,
    payload
  }
}