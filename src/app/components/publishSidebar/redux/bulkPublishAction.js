import { toast } from 'react-toastify'
import bulkPublishApiService from '../bulkPublishApiService'
import bulkPublishActionTypes from './bulkPublishActionTypes'

export const bulkPublish = (rootParentId, pageIds) => {
  return (dispatch) => {
    bulkPublishApiService
      .bulkPublishSelectedData({ rootParentId, pageIds })
      .then((response) => {
        dispatch({ type: bulkPublishActionTypes.UPDATE_PAGES_STATE_ON_BULK_PUBLISH, data: response.data.pageIds })
        toast.success('Published Successfully')
      })
      .catch((error) => {
        console.error(error)
        toast.error('Could not Update')
      })
  }
}
