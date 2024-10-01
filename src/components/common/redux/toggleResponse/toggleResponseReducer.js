import toggleResponseActionTypes from './toggleResponseActionTypes'

const initialState = 'bottom'

function toggleResponseReducer(state = initialState, action) {
  const { type, payload } = action
  switch (type) {
    case toggleResponseActionTypes.ON_RESPONSE_TOGGLE:
      return payload
    default:
      return state
  }
}

export default toggleResponseReducer
