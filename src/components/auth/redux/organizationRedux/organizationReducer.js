export const SET_ORG_LIST = 'SET_ORG_LIST';
export const SET_CURRENT_ORG = 'SET_CURRENT_ORG';
export const REMOVE_ORGANIZATION = 'REMOVE_ORGANIZATION';

const initialState = {
  orgList: [],
  currentOrg: {}
};

const organizationReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_CURRENT_ORG:
            return { ...state, currentOrg: action.payload };
        case SET_ORG_LIST:
            return { ...state, orgList: action.payload };
        case REMOVE_ORGANIZATION:
            const updatedOrgList = state.orgList.filter(org => org.id !== action.payload);
            const updatedCurrentOrg = state.currentOrg.id === action.payload ? {} : state.currentOrg;
            return {
                ...state,
                orgList: updatedOrgList,
                currentOrg: updatedCurrentOrg
            };
        default:
            return state; 
    }
};

export default organizationReducer;