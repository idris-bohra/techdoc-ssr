import runAutomationTypes from './runAutomationTypes'
import shortid from 'shortid'
const initialState = []

function automationReducer(state = initialState, action) {
  switch (action.type) {
    case runAutomationTypes.ON_AUTOMATION_RUN:
      const uniqueId = shortid.generate(); 
      const newEntry = {
        date: new Date().toISOString(),
        executedScriptResponses: action.payload.executedScriptResponses,
        executionOrder: action.payload.executionOrder,
        responseTime: action.payload.responseTime,
        collectionId: action.collectionId
      };
    
      return {
        ...state,
       [uniqueId]:  newEntry
      };

    case runAutomationTypes.ON_AUTOMATION_RUN_ERROR:
      return state

      default:
        return state;

    }
  }
export default automationReducer
