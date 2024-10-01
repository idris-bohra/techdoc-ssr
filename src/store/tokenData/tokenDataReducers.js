import tokenDataActionTypes from './tokenDataActionTypes'

const initialState = {
    tokenDetails: {},
    loading: false,
}

const tokenDataReducer = (state = initialState, action) => {
    switch (action.type) {
        case tokenDataActionTypes.ADD_TOKEN:
            state.tokenDetails = { ...state.tokenDetails, [action.payload.id]: action.payload }
            return { ...state }

        case tokenDataActionTypes.DELETE_TOKEN:
            delete state.tokenDetails[action.payload.tokenId];
            return { ...state }

        case tokenDataActionTypes.UPDATE_TOKEN:
            state.tokenDetails[action.payload.tokenId].refreshToken = action?.payload?.refreshToken || null;
            state.tokenDetails[action.payload.tokenId].expiryTime = action?.payload?.expiryTime || null;
            state.tokenDetails[action.payload.tokenId].accessToken = action?.payload?.accessToken || '';
            return { ...state }

        default:
            return state
    }
}

export default tokenDataReducer