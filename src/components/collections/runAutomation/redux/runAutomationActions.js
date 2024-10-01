import runAutomationTypes from './runAutomationTypes'
import generalApiService from '../../../../services/generalApiService'
import { toast } from 'react-toastify'

export const runAutomations = (details, collectionId) => {
  return (dispatch) => {
    generalApiService
      .runAutomation(details)
      .then((response) => {
        dispatch(onRunAutomationCompleted(response.data, collectionId))
      })
      .catch((error) => {
        dispatch(onRunAutomationFetchedError(error.response ? error.response.data : error))
      })
  }
}

export const generateDescription = (endpointIds) => {
  return (dispatch) => {
    generalApiService
      .generateDescription(endpointIds) 
      .then((response) => {
        toast.success("Description generated successfully")
        dispatch(onGenerateDescriptionCompleted(response.data));
      })
      .catch((error) => {
        toast.error("failed to generate description")
        dispatch(onGenerateDescriptionError(error.response ? error.response.data : error));
      });
  }
}

export const onRunAutomationCompleted = (data, collectionId) => {
  return {
    type: runAutomationTypes.ON_AUTOMATION_RUN,
    payload : data, 
    collectionId
  }
}

export const onRunAutomationFetchedError = (error) => {
  return {
    type: runAutomationTypes.ON_AUTOMATION_RUN_ERROR,
    error
  }
}

export const onGenerateDescriptionCompleted = (data) => {
  return {
    type: runAutomationTypes.ON_GENERATE_DESCRIPTION,
    payload: data,
  }
}

export const onGenerateDescriptionError = (error) => {
  return {
    type: runAutomationTypes.ON_GENERATE_DESCRIPTION_ERROR,
    error,
  }
}
