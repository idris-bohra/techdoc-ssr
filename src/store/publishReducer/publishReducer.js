import publishReducerActionTypes from './publishReducerActionTypes'

const initialState = {
  forPublish: [],
  forUnPublished: []
}

const publishReducer = (state = initialState, action) => {
  switch (action.type) {
    case publishReducerActionTypes.ADD_FOR_PUBLISHED:
      state.forPublish(action.payload.id)
      return { ...state }
    default:
      break
  }
}

export default publishReducer
