import React, { useEffect, useState } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import { useSelector } from 'react-redux'

export default function VersionPublishDropdown(props) {
  const { pages } = useSelector((state) => {
    return { pages: state.pages }
  })

  const handleDropdownItemClick = (childId) => {
    var selected = pages[childId].name
    setSelectedVersion(...selected)
  }

  return (
    <DropdownButton
      className=''
      id='dropdown-basic-button'
      onClick={(event) => event.stopPropagation()}
      title={
        <span className='dropdown-title'>
          {pages?.[props.rootParentId]?.child?.length === 1 ? defaultVersion?.name : selectedVersion?.name}
        </span>
      }
    >
      {pages[props.rootParentId].child.map((childId, index) => (
        <Dropdown.Item key={index} onClick={(e) => handleDropdownItemClick(childId)}>
          <span className='dropdown-item-text'>{pages[childId]?.name}</span>
        </Dropdown.Item>
      ))}
    </DropdownButton>
  )
}
