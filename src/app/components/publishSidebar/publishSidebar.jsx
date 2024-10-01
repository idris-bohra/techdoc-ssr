import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { FaSquare, FaCheckSquare, FaMinusSquare } from 'react-icons/fa'
import { MdArrowDropUp } from 'react-icons/md'
import { MdOutlineArrowDropDown } from 'react-icons/md'
import TreeView, { flattenTree } from 'react-accessible-treeview'
import { modifyCheckBoxDataToSend, modifyDataForBulkPublish } from '../common/utility'
import { bulkPublish } from './redux/bulkPublishAction'
import { toast } from 'react-toastify'
import './checkBoxTreeView.scss'
import './publishSidebar.scss'
import { Button } from 'react-bootstrap'
import { GrGraphQl } from 'react-icons/gr'
import { ReactComponent as Example } from '../../assets/icons/example.svg';

const saveAsSidebarStyle = {
  position: 'fixed',
  background: '#F8F8F8',
  zIndex: '1050 ',
  top: '0px',
  right: '0px',
  height: '100vh',
  width: '500px',
  boxShadow: '-25px 25px 43px rgba(0, 0, 0, 0.07)'
}
const darkBackgroundStyle = {
  position: 'fixed',
  background: 'rgba(0, 0, 0, 0.4)',
  opacity: 1,
  zIndex: '1040',
  top: '0px',
  right: '0px',
  height: '100vh',
  width: '100vw'
}

function PublishSidebar(props) {
  const params = useParams()

  const dispatch = useDispatch()

  const { pages, collections } = useSelector((state) => {
    return {
      pages: state.pages,
      collections: state.collections
    }
  })

  const [flattenData, setFlattenData] = useState([{ name: '', id: 0, children: [], parent: null }])
  const [allSelectedIds, setAllSelectedIds] = useState([])
  const [defaultExpandedIds, setDefaultExpandedIds] = useState([])

  useEffect(() => {
    getModifiedData()
  }, [params.collectionId])

  const getModifiedData = () => {
    const data1 = modifyDataForBulkPublish(collections, pages, params.collectionId)
    const data2 = flattenTree({ name: '', children: [{ ...data1 }] })
    setDefaultExpandedIds(getDefaultExpandedIds(data2))
    setFlattenData(data2)
  }

  const onSelect = (e) => {
    const setToArrayConvertedData = Array.from(e.treeState.selectedIds)
    setAllSelectedIds(setToArrayConvertedData)
  }

  const sendPublishRequest = () => {
    props.closePublishSidebar()
    if (allSelectedIds.length === 0) return toast.error('Please Select Something To Publish')
    const dataToPublish = new Set()
    let rootParentId = collections[params.collectionId]?.rootParentId || ''
    modifyCheckBoxDataToSend(flattenData, allSelectedIds, dataToPublish)
    dataToPublish.delete(1)
    const pageIds = Array.from(dataToPublish).map((id) => flattenData?.[id]?.metadata?.actualId)
    try {
      // await bulkPublishApiService.bulkPublishSelectedData({ rootParentId pageIds })
      dispatch(bulkPublish(rootParentId, pageIds))
      // props.closePublishSidebar()
    } catch (error) {
      console.error(error)
      toast.error('Cannot Publish at this moment')
    }
  }

  const handleOnClick = (e, handleSelect) => {
    e.stopPropagation()
    handleSelect(e)
  }

  const getDefaultExpandedIds = (data) => {
    return data.map((data) => data.id)
  }

  const ArrowIcon = ({ isOpen }) => {
    return !isOpen ? <MdOutlineArrowDropDown color='black' size={22} /> : <MdArrowDropUp color='black' size={22} />
  }

  const CheckBoxIcon = ({ variant, ...rest }) => {
    switch (variant) {
      case 'all':
        return <FaCheckSquare {...rest} />
      case 'none':
        return <FaSquare {...rest} />
      case 'some':
        return <FaMinusSquare {...rest} />
      default:
        return null
    }
  }

  function RenderFooter() {
    return (
      <div className='d-flex'>
        <Button variant='btn btn-outline' className='m-1 btn-sm font-12' onClick={sendPublishRequest}>
          Publish
        </Button>
        <Button variant='btn btn-outline' className='m-1 btn-sm font-12' onClick={() => props.closePublishSidebar()}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div onClick={() => props.closePublishSidebar()} style={darkBackgroundStyle}></div>
      <div style={saveAsSidebarStyle} className='publish-sidebar-container'>
        <div className='d-flex justify-content-between align-item-center'>
          <div className='publish-api-doc-heading'>Bulk Publish</div>
          <RenderFooter />
        </div>
        <div className='checkbox mt-3'>
          <TreeView
            data={flattenData || []}
            aria-label='Checkbox tree'
            multiSelect
            propagateSelect
            propagateSelectUpwards
            togglableSelect
            onSelect={onSelect}
            expandedIds={defaultExpandedIds}
            nodeRenderer={({
              element,
              isBranch,
              isExpanded,
              isSelected,
              isHalfSelected,
              getNodeProps,
              level,
              handleSelect,
              handleExpand
            }) => {
              const requestType = element.metadata?.actualId ? pages?.[element.metadata?.actualId]?.requestType : null
              return (
                <div
                  {...getNodeProps({ onClick: handleExpand })}
                  style={{ marginLeft: 20 * (level - 1), display: 'flex', justifyContent: 'start', alignItems: 'center' }}
                >
                  <CheckBoxIcon
                    className='checkbox-icon'
                    onClick={(e) => handleOnClick(e, handleSelect)}
                    variant={isHalfSelected ? 'some' : isSelected ? 'all' : 'none'}
                  />
                  <span className='name element-name'>
                    {element.name}
                    {pages?.[element.metadata?.actualId]?.type === 5 ? (
                      <Example className='ml-2'/>
                    ) : (
                      <>
                        {requestType && pages?.[element.metadata?.actualId]?.protocolType === 1 && (
                          <div className={`api-label lg-label ml-2 ${requestType}`}>
                            <div className='endpoint-request-div'>{requestType}</div>
                          </div>
                        )}
                        {pages?.[element.metadata?.actualId]?.protocolType === 2 && <GrGraphQl className='ml-2 graphql-icon' size={14} />}
                      </>
                    )}
                  </span>
                  {isBranch && <ArrowIcon isOpen={isExpanded} />}
                </div>
              )
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default React.memo(PublishSidebar)
