import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import RenderData from './renderData/renderData1'
import { addPage } from '../../pages/redux/pagesActions'
import './showCaseSaveAsModal.scss'

const ShowCaseSaveAsModal = (props) => {
  const dispatch = useDispatch()

  const { collections, currentOrg, pages, draftContent } = useSelector((state) => {
    return {
      collections: state.collections,
      currentOrg: state.organizations.currentOrg,
      pages: state.pages,
      draftContent: state.tabs.tabs[state.tabs.activeTabId]?.draft
    }
  })

  const [pathData, setPathData] = useState(['currentOrganisation'])

  const currentId = pathData?.[pathData?.length - 1];

  const getName = (id) => {
    const type = pages?.[id]?.type
    if (type === 0) {
      const parentId = pages?.[id]?.collectionId
      return collections?.[parentId]?.name
    } else {
      return pages?.[id]?.name
    }
  }

  const handleGoBack = (index) => {
    if (index >= 0 && index < pathData.length - 1) {
      const tempPathData = pathData.slice(0, index + 1)
      setPathData(tempPathData)
    } else {
      console.error('Invalid index provided.')
    }
  }

  const getPageType = (currentId) => {
    if (pages?.[currentId]?.type === 2) return 3;
    else if (pages?.[currentId].type === 0) return 1;
    return 3;
  }

  const handleSave = () => {
    const currentId = pathData[pathData.length - 1];
    let rootParentId = currentId;
    const data = { name: props.name, contents: draftContent }
    if (pages?.[currentId]?.type === 1) rootParentId = pages?.[currentId]?.child?.[0]
    const newPage = { ...data, pageType: getPageType(rootParentId) }
    dispatch(addPage(rootParentId, newPage, props.pageId))
    props.onHide();
  }

  return (
    <div className='main_container p-2'>
      <div className='d-flex justify-content-start align-items-center flex-wrap'>
        <span className='font-12'>Save to </span>
        {pathData.map((singleId, index) => {
          return (
            <div className='d-flex justify-content-start align-items-center' key={index}>
              {index !== 0 && <span className='ml-1'>/</span>}
              <div onClick={() => handleGoBack(index)} className='ml-1 tab-line'>
                {index === 0 ? currentOrg?.name : getName(singleId)}
              </div>
            </div>
          )
        })}
      </div>
      <div className='showcase_modal_container'>
        <RenderData data={pathData} setPathData={setPathData} />
        <div className='mt-5 d-flex align-items-center justify-content-end pb-2 pr-1'>
          <button onClick={handleSave} className='btn btn-primary btn-sm font-12 mr-2' disabled={currentId === 'currentOrganisation'} >
            Save
          </button>
          <button onClick={props.onHide} className='btn btn-secondary outline font-12 api-cancel-btn btn-sm'>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShowCaseSaveAsModal