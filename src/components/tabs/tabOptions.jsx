import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { ReactComponent as MoreVerticalIcon } from '../../assets/icons/more-vertical.svg'
import "./tabs.scss"

const TabOptions = ({ handleCloseTabs }) => {

  const tabs = useSelector((state) => state.tabs)

  const handleCloseAllTabs = async () => {
    const tabIdsToClose = tabs.tabsOrder
    handleCloseTabs(tabIdsToClose)
  }

  const handleCloseAllButCurrent = () => {
    const { tabsOrder, activeTabId } = tabs
    const tabIdsToClose = tabsOrder.filter((tabId) => tabId !== activeTabId)
    handleCloseTabs(tabIdsToClose)
  }

  const options = [
    { title: 'Close all tabs', handleOnClick: handleCloseAllTabs, show: true },
    { title: 'Close all tabs but current', handleOnClick: handleCloseAllButCurrent, show: true }
  ]

  return (
    <Dropdown>
      <Dropdown.Toggle bsPrefix='dropdown' variant='default' id='dropdown-basic'>
        <MoreVerticalIcon />
      </Dropdown.Toggle>
      <Dropdown.Menu className='tab-options-drop-down p-1'>
        {options.map((option, index) =>
          option.show && (
            <Dropdown.Item disabled={option.disabled} key={index} onClick={option.handleOnClick}>
              {option.title}
            </Dropdown.Item>
          )
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default TabOptions