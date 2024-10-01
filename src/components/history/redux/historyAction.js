import historyActionTypes from './historyActionTypes'

export const fetchHistoryFromLocal = () => {
  return async (dispatch) => {
    try {
      const response = localStorage.getItem('history')
      const parsedResponse = JSON.parse(response)
      dispatch(onHistoryDataFetched(parsedResponse))
    } catch (error) {
      console.error(error)
    }
  }
}

export const addHistory = (historyData) => {
  return (dispatch) => {
    dispatch(onHistoryAdded(historyData))
    try {
      localStorage.setItem('history', JSON.stringify(historyData))
    } catch (error) {
      console.error(error)
    }
  }
}

export const onHistoryDataFetched = (data) => {
  return {
    type: historyActionTypes.FETCH_HISTORY_FROM_LOCAL,
    data
  }
}

export const onHistoryAdded = (data) => {
  return {
    type: historyActionTypes.ADD_HISTORY,
    data
  }
}
export const onHistoryRemoved = () => {
  return async (dispatch) => {
    dispatch({ type: historyActionTypes.REMOVE_HISTORY })
  }
}
