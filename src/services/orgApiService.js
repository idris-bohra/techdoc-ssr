import http from './httpService'
import { redirectToDashboard } from '../components/common/utility'
import { getOrgList, getCurrentOrg, getDataFromProxyAndSetDataToLocalStorage } from '../components/auth/authServiceV2'
import { toast } from 'react-toastify'
import { store } from '../store/store'
import { removeOrganizationById, setCurrentorganization, setOrganizationList } from '../components/auth/redux/organizationRedux/organizationAction'
const apiBaseUrl = import.meta.env.VITE_API_URL
const proxyUrl = import.meta.env.VITE_PROXY_URL

export function getOrgUpdatedAt(orgId) {
  return http.get(`${apiBaseUrl}/orgs/${orgId}/lastSync`)
}

export async function fetchOrganizations() {
  try {
    const response = await http.get(`${proxyUrl}/getCompanies`);
    store.dispatch(setOrganizationList(response?.data?.data?.data))
  } catch (error) {
    console.error("Fetching organizations failed:", error);
  }
}

export async function leaveOrganization(orgId) {
  try {
    const response = await http.post(`${proxyUrl}/inviteAction/leave`, { company_id: orgId });
    if (orgId == getCurrentOrg()?.id) {
      const newOrg = getOrgList()?.[0]?.id;
      switchOrg(newOrg, true);
    }
    if (response.status === 200) {
      store.dispatch(removeOrganizationById(orgId));
      toast.success("Organization removed successfully!")
    }
  } catch (error) {
    console.error("Leaving organization failed:", error);
    toast.error("Error in leaving organization")
  }
}

export function updateOrgDataByOrgId(OrgId) {
  const data = getOrgList()
  let currentOrganisation;

  const targetIndex = data.findIndex((obj) => obj.id === OrgId)
  currentOrganisation = data[targetIndex]
  store.dispatch(setCurrentorganization(currentOrganisation))
}

export async function switchOrg(orgId, redirect) {
  try {
    await http.post(proxyUrl + '/switchCompany', { company_ref_id: orgId })
    updateOrgDataByOrgId(orgId)
    if (redirect) {
      redirectToDashboard(orgId)
    }

  } catch (error) {
    console.error('Error while calling switchCompany API:', error)
  }
}

async function createOrganizationAndRunCode() {
  toast.success('Organization Successfully Created')
}

export async function createOrg(name, type) {
  const data = { company: { name, meta: { type } } };
  const newOrg = await http.post(proxyUrl + '/createCompany', data);
  try {
    await getDataFromProxyAndSetDataToLocalStorage(null, false);
    updateOrgDataByOrgId(newOrg?.data?.data?.id);
    await createOrganizationAndRunCode();
    await switchOrg(newOrg?.data?.data?.id, true);
  } catch (e) {
    toast.error(e?.response?.data?.message ? e?.response?.data?.message : "Something went wrong");
  }
}


export async function updateOrg(name, type) {
  try {
    const data = { company: { name, meta: { type } } }
    const updateOrg = await http.post(proxyUrl + '/{featureId}/updateDetails', data)
    await getDataFromProxyAndSetDataToLocalStorage(null, false)
    updateOrgDataByOrgId(updateOrg?.data?.data?.id)
    await createOrganizationAndRunCode()
    await switchOrg(updateOrg?.data?.data?.id, true)
  } catch (e) {
    toast.error(e?.response?.data?.message ? e?.response?.data?.message : "Something went wrong")
  }
}

export async function inviteMembers(name, email) {
  try {
    const data = {
      user: {
        name: name,
        email: email
      }
    }
    const res = await http.post(proxyUrl + '/addUser', data)
    toast.success('User added successfully')
    return res
  } catch (e) {
    console.error(e)
    toast.error('Cannot proceed at the moment. Please try again later')
  }
}

function proxyGooglereferenceMapping() {
  const envMappings = {
    local: import.meta.env.VITE_PROXY_REFERENCE_ID_LOCAL,
    test: import.meta.env.VITE_PROXY_REFERENCE_ID_TEST,
    prod: import.meta.env.VITE_PROXY_REFERENCE_ID_PROD,
  };
  return envMappings[import.meta.env.VITE_ENV] || "";
}

export async function removeUser(userId) {
  try {
    const feature_id = proxyGooglereferenceMapping();
    const data = {
      feature_id: feature_id,
      company_id: getCurrentOrg()?.id
    }
    const headers = {
      authkey: 'ebc1437c957484fcc548ee8b22449305'
    };
    const res = await http.post(`https://routes.msg91.com/api/clientUsers/${userId}/remove`, data, { headers })
    return res
  } catch (e) {
    console.error(e)
    toast.error('Cannot proceed at the moment. Please try again later')
  }
}
