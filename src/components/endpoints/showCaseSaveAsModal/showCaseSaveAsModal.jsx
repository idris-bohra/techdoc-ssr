import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import RenderData from './renderData/renderData'
import './showCaseSaveAsModal.scss'

export default function ShowCaseSaveAsModal(props) {
  const { pages, collections, currentOrg } = useSelector((state) => {
    return {
      pages: state.pages,
      collections: state.collections,
      activeTabId: state.tabs.activeTabId,
      currentOrg: state.organizations.currentOrg,
    }
  })

  const [pathData, setPathData] = useState(['currentOrganisation'])

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
    let tempPathData = pathData
    if (index >= 0 && index < tempPathData.length - 1) {
      tempPathData.splice(index + 1)
      setPathData([...tempPathData])
    } else {
      console.error('Invalid index provided.')
    }
  }

  const getDisable = () => {
    if (pathData.length === 1) {
      return 'disable-save-btn'
    } else {
      const currentId = pathData[pathData.length - 1]
      if (pages?.[currentId]?.type === 1) return 'disable-save-btn'
      else return ''
    }
  }

  const handleSave = () => {
    const currentId = pathData[pathData.length - 1]
    props.save_endpoint(currentId, { endpointName: props?.name || '', endpointDescription: props?.description || '' }, 'isHistory')
    props.onHide()
  }

  return (
    <div className='main_container p-2'>
      <div className='d-flex justify-content-start align-items-center flex-wrap'>
        <span className='font-12'>Save to </span>
        {pathData.map((singleId, index) => {
          return (
            <div className='d-flex justify-content-start align-items-center'>
              {index !== 0 && <span className='ml-1 font-12'>/</span>}
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
          <button onClick={handleSave} className={`btn btn-primary btn-sm font-12 mr-2 ${getDisable()}`}>
            Save
          </button>
          <button onClick={() => {props.onHide()}} className='btn btn-secondary outline  api-cancel-btn btn-sm'>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
