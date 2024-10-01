
import { CREATE_NEW_PUBLIC_ENVIRONMENT, DELETE_SELECTED_INDEX, DELETE_ENTIRE_PUBLIC_ENV, UPDATE_PUBLIC_ENV } from './publicEnvActionTypes';

const initialState = {};
const createNewPublicEnvReducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_NEW_PUBLIC_ENVIRONMENT:
      const { data } = action.payload;
      return {
        ...data
      };

      case UPDATE_PUBLIC_ENV:
        const { key, value } = action.payload; 
        return {
            ...state,
            [key]: {
              ...state[key], 
              currentValue: value 
          }
        };

    case DELETE_ENTIRE_PUBLIC_ENV: {
      const { collectionId } = action.payload;

      if (state[collectionId]) {
        const newState = { ...state };
        delete newState[collectionId];
        return newState;
      }
      return state;
    }


    case DELETE_SELECTED_INDEX: {
      const { collectionId, variable } = action.payload;

      if (state[collectionId] && state[collectionId][variable]) {
        const updatedCollection = { ...state[collectionId] };
        delete updatedCollection[variable];

        return {
          ...state,
          [collectionId]: updatedCollection
        };
      }
    }
    default:
      return state;
  }
};


export default createNewPublicEnvReducer; 
