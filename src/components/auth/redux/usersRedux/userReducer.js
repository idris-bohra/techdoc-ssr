export const ADD_USER_DATA = 'ADD_USER_DATA';
export const ADD_NEW_USER = 'ADD_NEW_USER';
export const SET_CURRENT_USER = 'SET_CURRENT_USER';
export const REMOVE_USER = 'REMOVE_USER';

const initialState = {
  usersList: [],
  currentUser: {}
};

const userReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_USER_DATA:
            return { ...state, usersList: action.data };
        case ADD_NEW_USER:
                return { ...state, usersList: [...state.usersList, ...action.data] };
        case SET_CURRENT_USER:
            return { ...state, currentUser: action.data };
        case REMOVE_USER:
            return {...state,
            usersList: state.usersList.filter(user => user.id !== action.payload)
            };    
        default:
            return state;
    }
};

export default userReducer;
