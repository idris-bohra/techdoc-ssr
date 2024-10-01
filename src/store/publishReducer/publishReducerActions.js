import publishReducerActionTypes from './publishReducerActionTypes'

export const addInPublishedDataActions = (payload) => {
  return {
    type: publishReducerActionTypes.ADD_FOR_PUBLISHED,
    payload
  }
}
