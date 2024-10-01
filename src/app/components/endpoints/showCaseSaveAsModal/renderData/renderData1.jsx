import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { FaRegFolderClosed } from "react-icons/fa6";
import { IoDocumentTextOutline } from 'react-icons/io5'

export default function RenderData(props) {
  const { pages, collections } = useSelector((state) => {
    return {
      pages: state.pages,
      collections: state.collections
    }
  })

  const [listData, setListData] = useState([])

  useEffect(() => {
    if (props.data.length === 1) {
      setListData(Object.keys(collections))
    } else {
      const currentId = props?.data[props?.data.length - 1]
      const currentPage = pages?.[currentId]
      if (currentPage?.type === 2) {
        setListData(currentPage.child?.filter((childId) => pages?.[childId]?.type !== 4))
      } else {
        setListData(currentPage?.child?.filter((childId) => pages?.[childId]?.type !== 4))
      }
    }
  }, [props?.data])

  const getType = (id) => {
    if (props?.data.length === 1) {
      return 'collection'
    } else {
      const type = pages?.[id]?.type
      switch (type) {
        case 1:
        case 3:
          return 'page'
        case 2:
          return 'version'
        default:
          break
      }
    }
  }

  const addIdInPathdata = (id, slug) => {
    if (slug === 'collection') {
      const invisiblePageId = collections?.[id]?.rootParentId
      props.setPathData((prev) => [...prev, invisiblePageId])
      setListData(pages?.[invisiblePageId]?.child)
    } else if (slug === 'version') {
      setListData(pages?.[id]?.child)
    } else {
      props.setPathData((prev) => [...prev, id])
      setListData(pages?.[id]?.child)
    }
  }

  return (
    <div>
      {listData?.map((singleId, index) => {
        const type = getType(singleId)
        if (type === 'collection') {
          return (
            <div onClick={() => addIdInPathdata(singleId, 'collection')} key={index} className='folder-box d-flex justify-content-start align-items-center p-1'>
              <FaRegFolderClosed className='text-grey' size='14px' />
              <div className='ml-1 font-12'>{collections?.[singleId]?.name}</div>
            </div>
          )
        } else if (type === 'page') {
          return (
            <div onClick={() => addIdInPathdata(singleId)} key={index} className='folder-box d-flex justify-content-start align-items-center p-1'>
              <IoDocumentTextOutline className='text-grey' size='14px' />
              <div className='ml-1 font-12'>{pages?.[singleId]?.name}</div>
            </div>
          )
        } else if (type === 'version') {
          return pages?.[singleId]?.child.map((childId, childIndex) => (
            <div onClick={() => addIdInPathdata(childId)} key={childIndex} className='folder-box d-flex justify-content-start align-items-center p-1'>
              <IoDocumentTextOutline className='text-grey' size='14px' />
              <div className='ml-1 font-12'>{pages?.[childId]?.name}</div>
            </div>
          ))
        } else return null
      })}
    </div>
  )
}
