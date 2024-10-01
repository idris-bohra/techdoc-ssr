import environmentsApiService from '../environmentsApiService'
import environmentsActionTypes from './environmentsActionTypes'
import { store } from '../../../store/store'
import { toast } from 'react-toastify'

export const fetchEnvironments = () => {
  return (dispatch) => {
    environmentsApiService
      .getEnvironments()
      .then((response) => {
        dispatch(OnEnvironmentsFetched(response.data))
        window.localStorage.setItem('environments', JSON.stringify(response.data))
      })
      .catch((error) => {
        dispatch(OnEnvironmentsFetchedError(error.response ? error.response.data : error))
        toast.error("Failed to fetch Environments!")
      })
  }
}

export const fetchEnvironmentsFromLocalStorage = () => {
  return (dispatch) => {
    let environments
    try {
      environments = JSON.parse(window.localStorage.getItem('cookies'))
      dispatch(OnEnvironmentsFetched(environments))
    } catch (err) {
      dispatch(OnEnvironmentsFetchedError(err))
    }
  }
}

export const addEnvironment = (newEnvironment, type) => {
  return (dispatch) => {
    dispatch(addEnvironmentRequest(newEnvironment, type))
    environmentsApiService
      .saveEnvironment(newEnvironment, type)
      .then((response) => {
        dispatch(OnEnvironmentAdded(response.data, newEnvironment))
        toast.success("Environment added successfully")
      })
      .catch((error) => {
        dispatch(OnEnvironmentAddedError(error.response ? error.response.data : error, newEnvironment))
      })
  }
}

export const importEnvironment = (newEnvironment,onClose) => {
  return (dispatch) => {
    environmentsApiService
      .importPostmanEnvironment(newEnvironment)
      .then((response) => {
        dispatch(OnEnvironmentImported(response.data))
        toast.success('Environment Imported Successfully')
        onClose()
      })
      .catch((error) => {
        toast.error(error.response.data)
      })
  }
}

export const updateEnvironment = (editedEnvironment) => {
  return (dispatch) => {
    const originalEnvironment = store.getState().environment.environments[editedEnvironment.id]
    dispatch(updateEnvironmentRequest(editedEnvironment))
    const id = editedEnvironment.id
    delete editedEnvironment.id
    environmentsApiService
      .updateEnvironment(id, editedEnvironment)
      .then((response) => {
        dispatch(OnEnvironmentUpdated(response.data))
        toast.success("Environment updated successfully")
      })
      .catch((error) => {
        dispatch(OnEnvironmentUpdatedError(error.response ? error.response.data : error, originalEnvironment))
      })
  }
}

export const deleteEnvironment = (environment) => {
  return (dispatch) => {
    dispatch(deleteEnvironmentRequest(environment.id))
    environmentsApiService
      .deleteEnvironment(environment.id)
      .then((response) => {
        if (response) { 
          dispatch(OnEnvironmentDeleted(environment.id))
          toast.success('Environment deleted successfully')
        } else {
          toast.error('Failed to delete environment')
        }
      })
      .catch((error) => {
        dispatch(OnEnvironmentDeletedError(error.response, environment))
      })
  }
}

export const setEnvironmentId = (currentEnvironmentId) => {
  return {
    type: environmentsActionTypes.SET_ENVIRONMENT_ID,
    currentEnvironmentId
  }
}

export const OnEnvironmentsFetched = (environments) => {
  return {
    type: environmentsActionTypes.ON_ENVIRONMENTS_FETCHED,
    environments
  }
}

export const OnEnvironmentsFetchedError = (error) => {
  return {
    type: environmentsActionTypes.ON_ENVIRONMENTS_FETCHED_ERROR,
    error
  }
}

export const addEnvironmentRequest = (newEnvironment) => {
  return {
    type: environmentsActionTypes.ADD_ENVIRONMENT_REQUEST,
    newEnvironment
  }
}

export const OnEnvironmentAdded = (response) => {
  return {
    type: environmentsActionTypes.ON_ENVIRONMENT_ADDED,
    response
  }
}

export const OnEnvironmentAddedError = (error, newEnvironment) => {
  return {
    type: environmentsActionTypes.ON_ENVIRONMENT_ADDED_ERROR,
    newEnvironment,
    error
  }
}

export const updateEnvironmentRequest = (editedEnvironment) => {
  return {
    type: environmentsActionTypes.UPDATE_ENVIRONMENT_REQUEST,
    editedEnvironment
  }
}

export const OnEnvironmentUpdated = (response) => {
  return {
    type: environmentsActionTypes.ON_ENVIRONMENT_UPDATED,
    response
  }
}

export const OnEnvironmentUpdatedError = (error, originalEnvironment) => {
  return {
    type: environmentsActionTypes.ON_ENVIRONMENT_UPDATED_ERROR,
    error,
    originalEnvironment
  }
}

export const deleteEnvironmentRequest = (environmentId) => {
  return {
    type: environmentsActionTypes.DELETE_ENVIRONMENT_REQUEST,
    environmentId
  }
}

export const OnEnvironmentDeleted = (environmentId) => {
  return {
    type: environmentsActionTypes.ON_ENVIRONMENT_DELETED, 
    environmentId
  }
}

export const OnEnvironmentDeletedError = (error, environment) => {
  return {
    type: environmentsActionTypes.ON_ENVIRONMENT_DELETED_ERROR,
    error,
    environment
  }
}

export const OnEnvironmentImported = (response) => {
  return {
    type: environmentsActionTypes.ON_ENVIRONMENT_IMPORTED,
    response
  }
}

