const DELETE_COLLECTION = {
  title: 'Delete Collection',
  message: `Are you sure you wish to delete this collection? All your versions,
    groups, pages and endpoints present in this collection will be deleted.`
}

const REMOVE_COLLECTION = {
  title: 'Remove Collection',
  message: 'Are you sure you wish to remove this public collection?'
}

const DELETE_VERSION = {
  title: 'Delete Version',
  message: `Are you sure you want to delete this versions?
    All your groups, pages and endpoints present in this version will be deleted.`
}
const DELETE_PAGE = {
  title: 'Delete Page',
  message: 'Are you sure you wish to delete this page?'
}
const DELETE_ENDPOINT = {
  title: 'Delete Endpoint',
  message: 'Are you sure you wish to delete this Endpoint?'
}

const confirmationModalEnum = {
  DELETE_COLLECTION,
  DELETE_VERSION,
  DELETE_PAGE,
  DELETE_ENDPOINT,
  REMOVE_COLLECTION
}

export default confirmationModalEnum
