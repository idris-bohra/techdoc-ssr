import toggleResponseActionTypes from './toggleResponseActionTypes'

export const onResponseToggle = (type) => {
  return (dispatch) => {
    dispatch(onToggle(type))
  }
}
export const onToggle = (payload) => {
  return {
    type: toggleResponseActionTypes.ON_RESPONSE_TOGGLE,
    payload
  }
}
