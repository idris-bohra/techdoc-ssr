import { SET_ORG_LIST, SET_CURRENT_ORG, REMOVE_ORGANIZATION } from "./organizationReducer";

export const setOrganizationList = (orgList) => ({
    type: SET_ORG_LIST,
    payload: orgList,
});

export const setCurrentorganization = (currentOrg) => ({
    type: SET_CURRENT_ORG,
    payload: currentOrg
});

export function removeOrganizationById(orgId) {
    return {
      type: REMOVE_ORGANIZATION,
      payload: orgId,
    };
  }