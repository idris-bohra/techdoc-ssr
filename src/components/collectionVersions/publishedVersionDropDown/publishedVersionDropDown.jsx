import React, { useEffect, useState } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { useSelector } from 'react-redux'

export default function PublishedVersionDropDown(props) {
  const { pages } = useSelector((state) => {
    return {
      pages: state.pages
    }
  })

  const [show, setShow] = useState([])
  const [title, setTitle] = useState('')
  useEffect(() => {
    const { rootParentId, defaultVersionName, selectedVersionName } = props

    const data = showDropDown()
    setShow(data)

    const versionName = (name) => {
      return name?.length > 10 ? `${name.substring(0, 7)} ... ` : name
    }

    const versionToDisplay = pages?.[rootParentId]?.child?.length === 1 ? defaultVersionName : selectedVersionName

    setTitle(versionName(versionToDisplay))
  }, [props.rootParentId, props.defaultVersionName, props.selectedVersionName, pages])

  function checkIfVersionHasPublishedChild(versionId) {
    if (!pages?.[versionId]) return false

    for (let index = 0; index < pages[versionId].child?.length; index++) {
      if (pages?.[pages[versionId].child[index]] && pages?.[pages[versionId].child[index]]?.isPublished) {
        return true
      }
    }
    return false
  }

  function showDropDown() {
    if (pages?.[props?.rootParentId]?.child?.length === 0) return []
    return pages?.[props?.rootParentId]?.child.filter((versionId) => {
      const value = checkIfVersionHasPublishedChild(versionId)
      if (pages?.[versionId] && pages?.[versionId]?.isPublished && value) {
        return versionId
      } else if (pages?.[versionId]?.state === 1) {
        return versionId
      }
    })
  }

  if (show?.length <= 1 && pages[show[0]]?.isPublished) {
    return null
  }

  if (show?.length === 1 && pages[show[0]]?.isPublished) {
    return (
      <div className='version-dropdown' id={`dropdown-basic-button-${props?.rootParentId}`}>
        {title}
      </div>
    )
  }

  return (
    <DropdownButton
      key={props?.rootParentId}
      className='version-dropdown'
      id={`dropdown-basic-button-${props?.rootParentId}`}
      onClick={(e) => e.stopPropagation()}
      title={title}
    >
      {show.map((childId, index) => (
        <Dropdown.Item key={index} onClick={() => props.handleDropdownItemClick(childId, props?.rootParentId)}>
          {pages[childId]?.name}
        </Dropdown.Item>
      ))}
    </DropdownButton>
  )
}
