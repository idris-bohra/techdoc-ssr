import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import SavePromptModal from './savePromptModal'
import { setTabsOrder, updateDraft } from './redux/tabsActions.js'
import tabService from './tabService'
import { ReactComponent as HistoryIcon } from '../../assets/icons/historyIcon.svg'
import History from '../history/history.jsx'
import TabOptions from './tabOptions'
import { onToggle } from '../common/redux/toggleResponse/toggleResponseActions.js'
import IconButtons from '../common/iconButton'
import { Nav, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { IoIosChatboxes } from 'react-icons/io'
import { VscCloseAll } from "react-icons/vsc";
import { CiSettings } from 'react-icons/ci'
import { GrFormClose } from 'react-icons/gr'
import { IoDocumentTextOutline } from 'react-icons/io5'
import { LuHistory } from 'react-icons/lu'
import { GrGraphQl } from 'react-icons/gr'
import { TbSettingsAutomation } from 'react-icons/tb'
import { BsPlayBtn } from "react-icons/bs";
import { LuPlus } from "react-icons/lu";

import './tabs.scss'
import { openModal } from '../modals/redux/modalsActions.js'
import { DESKTOP_APP_DOWNLOAD } from '../modals/modalTypes.js'

const CustomTabs = (props) => {
  const dispatch = useDispatch()
  const navRef = useRef(null)
  const scrollRef = useRef({})
  const draggedItem = useRef(null)
  const interval = useRef(null)

  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [showSavePromptFor, setShowSavePromptFor] = useState([])
  const [leftScroll, setLeftScroll] = useState(0)
  const [showHistoryContainer, setShowHistoryContainer] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewId, setPreviewId] = useState(null)

  const { responseView, pages, tabState, tabsOrder, tabs, historySnapshots, collections, history, organizations, automation, activeModal } = useSelector((state) => {
    return {
      responseView: state.responseView,
      pages: state.pages,
      tabState: state.tabs.tabs,
      tabsOrder: state.tabs.tabsOrder,
      tabs: state.tabs,
      historySnapshots: state.history,
      collections: state.collections,
      history: state.history,
      automation: state.automation,
      organizations: state.organizations,
      activeModal: state.modals.activeModal,
    }
  })

  useEffect(() => {
    const newRef = scrollRef.current[tabs.activeTabId] || null
    newRef && newRef.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' })

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [tabs?.activeTabId, scrollRef.current])

  const handleKeyDown = (e) => {
    const activeTabId = tabs?.activeTabId
    const isMacOS = navigator.platform.toUpperCase().indexOf('MAC') >= 0
    const isWindows = navigator.platform.toUpperCase().indexOf('WIN') >= 0
    const isDesktopModalOpen = activeModal === DESKTOP_APP_DOWNLOAD

    if ((isMacOS && (e.metaKey || e.ctrlKey)) || (isWindows && e.altKey)) {
      switch (e.key) {
        case 't':
          e.preventDefault()
          handleOpenNextTab()
          break
        case 'w':
          e.preventDefault()
          handleCloseTabs([activeTabId])
          break
        case 'n':
          e.preventDefault()
          if(tabsOrder.length>=10){
            openModal(DESKTOP_APP_DOWNLOAD)
          }
          handleAddTab()
          break
        default:
          break
      }
    }
  }

  const openTabAtIndex = (index) => {
    const { tabsOrder } = tabs
    if (tabsOrder[index]) tabService.selectTab(tabsOrder[index], { navigate, params })
  }

  const handleOpenNextTab = () => {
    const { activeTabId, tabsOrder } = tabs
    const index = (tabsOrder.indexOf(activeTabId) + 1) % tabsOrder.length
    openTabAtIndex(index)
  }

  const closeSavePrompt = () => setShowSavePromptFor([])

  const onDragStart = (tId) => draggedItem.current = tId

  const handleOnDragOver = (e) => e.preventDefault()

  const onDrop = (e, droppedOnItem) => {
    e.preventDefault()
    let tabsOrder = tabs.tabsOrder;
    if (draggedItem.current === droppedOnItem || !draggedItem.current || !tabsOrder.includes(draggedItem.current)) {
      draggedItem.current = null
      return
    }
    tabsOrder = tabs.tabsOrder.filter((item) => item !== draggedItem.current)
    const index = tabs.tabsOrder.findIndex((tId) => tId === droppedOnItem)
    tabsOrder.splice(index, 0, draggedItem.current)
    dispatch(setTabsOrder(tabsOrder))
  }

  const handleNav = (dir) => {
    if (dir === 'left') {
      if (navRef.current) navRef.current.scrollLeft -= 200
    } else {
      if (navRef.current) navRef.current.scrollLeft += 200
    }
  }

  const handleMouseEnter = (dir) => {
    interval.current = setInterval(() => handleNav(dir), 500)
  }

  const handleMouseLeave = () => {
    if (interval.current) {
      clearInterval(interval.current)
      interval.current = null
    }
  }

  const scrollLength = () => {
    setLeftScroll(navRef.current?.scrollLeft)
  }

  const leftHideTabs = () => {
    return Number.parseInt(leftScroll / 200)
  }

  const rightHideTabs = () => {
    return Number.parseInt((navRef.current?.scrollWidth - navRef.current?.clientWidth - leftScroll) / 200)
  }

  const handleAddTab = () => {
    scrollLength()
    tabService.newTab()
  }

  const showScrollButton = () => {
    return navRef.current?.scrollWidth > navRef.current?.clientWidth + 10
  }

  const handleHistoryClick = () => {
    if (responseView === 'right' && showHistoryContainer === false) {
      dispatch(onToggle('bottom'))
    }
    setShowHistoryContainer(!showHistoryContainer)
  }

  const handleCloseTabs = (tabIds) => {
    const showSavePromptFor = []
    const tabsData = tabs.tabs

    for (let i = 0; i < tabIds.length; i++) {
      const tabData = tabsData[tabIds[i]]

      if (tabData?.isModified) {
        showSavePromptFor.push(tabIds[i])
      } else {
        // Check if there's only one tab left before removing
        if (Object.keys(tabsData).length > 1) {
          tabService.removeTab(tabIds[i], { navigate, params })
        }
      }
    }
    setShowSavePromptFor(showSavePromptFor)
  }

  const handleOnConfirm = (tabId) => {
    const show_save_prompt_for = showSavePromptFor.filter((tab) => tab != tabId)
    setShowSavePromptFor(show_save_prompt_for)
  }

  const showTooltips = (tooltipType) => {
    switch (tooltipType) {
      case "close-all":
        return (
          <Tooltip id='edited-by-tooltip'>
            <div className="font-12 text-secondary">
              Close All
            </div>
          </Tooltip>
        )
    }
  }

  const renderTabName = (tabId) => {
    const tab = tabState[tabId]
    if (!tab) return
    switch (tab.type) {
      case 'history':
        if (historySnapshots[tabId]) {
          if (tab.previewMode) {
            return (
              <div className='d-flex align-items-center '>
                <LuHistory size={16} />
                <span className='mr-2 fw-500 font-12' >{historySnapshots[tabId].endpoint.name}</span>
              </div>
            )
          } else {
            return (
              <>
                <div className='d-flex align-items-center '>
                  <LuHistory className='mr-1' size={16} />
                  <span className='mr-2 fw-500 font-12' >{historySnapshots[tabId].endpoint.name || historySnapshots[tabId].endpoint.BASE_URL + historySnapshots[tabId].endpoint.uri || 'Random Trigger'}</span>
                </div>
              </>
            )
          }
        } else {
          return <div className=''>{tab.state?.data?.name || 'Random Trigger'}</div>
        }

      case 'endpoint':
        if (pages[tabId]) {
          const endpoint = pages[tabId]
          if (tab.previewMode) {
            return (
              <div className='d-flex justify-content-center fw-500 font-12 align-items-center'>
                {endpoint.protocolType === 1 && (
                  <div className={`${tabState[tabId]?.draft?.data?.method}-TAB mr-2  request-type-bgcolor`}>
                    {tabState[tabId]?.draft?.data?.method || 'GET'}
                  </div>
                )}
                {endpoint.protocolType === 2 && <GrGraphQl className='mr-2 graphql-icon' size={14} />}
                <span>{pages[tabId]?.name}</span>
              </div>
            )
          } else {
            return (
              <div className='d-flex justify-content-center fw-500 font-12 align-items-center'>
                {endpoint.protocolType === 1 && (
                  <div className={`${tabState[tabId]?.draft?.data?.method}-TAB mr-2 request-type-bgcolor`}>
                    {tabState[tabId]?.draft?.data?.method}
                  </div>
                )}
                {endpoint.protocolType === 2 && <GrGraphQl className='mr-2 graphql-icon' size={14} />}
                <span>{pages[tabId]?.name}</span>
              </div>
            )
          }
        } else {
          const endpoint = tabState?.[tabId]
          return (
            <div className='d-flex fw-500 font-12 justify-content-end align-items-end'>
              {endpoint?.draft?.protocolType === 1 && (
                <div className={`${endpoint?.draft?.data?.method}-TAB mr-2 request-type-bgcolor`}>{endpoint?.draft?.data?.method}</div>
              )}
              {endpoint?.draft?.protocolType === 2 && <GrGraphQl className='mr-2 graphql-icon' size={14} />}
              {tab.state?.data?.name || 'Untitled'}
            </div>
          )
        }

      case 'page':
        if (pages[tabId]) {
          const page = pages[tabId]
          if (tab.previewMode) {
            return (
              <div className='d-flex fw-500 font-12 justify-content-end align-items-end'>
                <IoDocumentTextOutline size={14} className='mr-1 mb-1' />
                <span>
                  <>{page.name} </>
                </span>
              </div>
            )
          } else {
            return (
              <div className='d-flex fw-500 font-12 justify-content-end align-items-end'>
                <IoDocumentTextOutline size={14} className='mr-1' />
                <span>
                  <>{page.name} </>
                </span>
              </div>
            )
          }
        } else {
          return (
            <div className='d-flex fw-500 font-12 justify-content-end align-items-end'>
              <IoDocumentTextOutline size={14} className='mr-1 mb-1' />
              <span>{'Untiled'}</span>
            </div>
          )
        }
        break
      case 'collection': {
        const collectionName = collections[tabId]?.name || 'Collection'
        if (location?.pathname?.split('/')?.[6] === 'settings') {
          return (
            <>
              <span className='d-flex fw-500 font-12 align-items-center'>
                <CiSettings size={18} className='setting-icons mr-1' />
                <span>{collectionName}</span>
              </span>
            </>
          )
        } else if (location?.pathname?.split('/')?.[6] === 'runner') {
          return (
            <div className='d-flex fw-500 font-12 align-items-center'>
              <TbSettingsAutomation size={18} className='setting-icons mr-1' />
              <span>{collectionName}</span>
            </div>
          )
        } else {
          return (
            <div className='d-flex fw-500 font-12 align-items-center'>
              <CiSettings size={18} className='setting-icons mr-1' />
              <span>{collectionName}</span>
            </div>
          )
        }
      }
      case 'feedback': {
        return (
          <>
            <div className='d-flex fw-500 font-12 align-items-center'>
              <IoIosChatboxes className='mr-1' size={16} />
              <span>Feedback</span>
            </div>
          </>
        )
      }
      case 'manual-runs': {
        if (automation[tabId]) {
          return (
            <>
              <div className='d-flex fw-500 font-12 align-items-center'>
                <BsPlayBtn className='mr-1' size={16} />
                <span>Runs</span>
              </div>
            </>
          )
        }
      }
      default:
    }
  }
  // const renderHoverTab = (tabId) => {
  //   let x = 1
  //   const y = 1
  //   x -= navRef.current.scrollLeft
  //   const styles = {
  //     transform: `translate(${x}px, ${y}px)`
  //   }
  //   const tab = tabs.tabs[tabId]
  //   if (!tab) return
  //   if (tab.type === 'page') {
  //     if (pages[tabId]) {
  //       const page = pages[tabId]
  //       return (
  //         <div className='hover-div' style={styles}>
  //           {/* <div className='group-name'>{pages[pages?.[tabId]?.parentId]?.name}</div> */}
  //           <div className={`${page.groupId ? 'endpoint-name ml-4 arrow-top' : 'page-name'}`}>Page</div>
  //         </div>
  //       )
  //     }
  //   } else if (tab.type === 'endpoint') {
  //     if (pages[tabId]) {
  //       const endpoint = pages[tabId]
  //       return (
  //         <div className='hover-div' style={styles}>
  //           <div className='d-flex align-items-center'>
  //             {endpoint.protocolType === 1 && (
  //               <div className={`api-label ${tabState[tabId]?.draft?.data?.method} request-type-bgcolor ml-4 mt-1 arrow-top`}>
  //                 {tabState[tabId]?.draft?.data?.method}{' '}
  //               </div>
  //             )}
  //             {endpoint.protocolType === 2 && <GrGraphQl className='mr-2 graphql-icon' size={14} />}
  //             <div className='endpoint-name ml-1'>{pages[tabId].name}</div>
  //           </div>
  //         </div>
  //       )
  //     }
  //   } else if (tab.type === 'collection') {
  //     return (
  //       <>
  //         <div className='hover-div' style={styles}>
  //           <div className='page-name'>Setting</div>
  //         </div>
  //         <div className='hover-div' style={styles}>
  //           <div className='page-name'>Setting</div>
  //         </div>
  //       </>
  //     )
  //   } else if (tab.type === 'history') {
  //     return (
  //       <>
  //         <div className='hover-div' style={styles}>
  //           <div className='page-name'>history</div>
  //         </div>
  //         <div className='hover-div' style={styles}>
  //           <div className='page-name'>history</div>
  //         </div>
  //       </>
  //     )
  //   } else if (tab.type === 'feedback') {
  //     return (
  //       <>
  //         <div className='hover-div' style={styles}>
  //           <div className='page-name'>feedback</div>
  //         </div>
  //         <div className='hover-div' style={styles}>
  //           <div className='page-name'>feedback</div>
  //         </div>
  //       </>
  //     )
  //   }
  // }

  const handleHistoryButton = () => {
    if (organizations?.currentOrg?.meta?.type !== 0) {
      return (
        <button onClick={() => handleHistoryClick()} className='px-2' style={{ outline: 'none' }}>
          <HistoryIcon className='p-1' />{' '}
        </button>
      );
    }
  }


  const handleCloseAllTabs = () => {
    const { tabsOrder, activeTabId } = tabs
    const tabIdsToClose = tabsOrder.filter((tabId) => tabId !== activeTabId)
    handleCloseTabs(tabIdsToClose)
  }

  return (
    <>
      <div className='d-flex navs-container'>
        {/* {showScrollButton() ? (
          <div
            className={`scroll-button scroll-button--left d-flex ${leftHideTabs() ? '' : 'disabled'}`}
            onMouseEnter={() => handleMouseEnter('left')}
            onMouseLeave={() => handleMouseLeave()}
          >
            <span className='mr-1'>
              <i className='fa fa-angle-left' aria-hidden='true' />
            </span>
            <span>{leftHideTabs() ? `${leftHideTabs()}+` : null}</span>
          </div>
        ) : null} */}
        <Nav
          variant='pills'
          className='flex-row flex-nowrap item-wrp'
          onScroll={() => scrollLength()}
          ref={navRef}
          style={{ scrollBehavior: 'smooth' }}
        >
          <div>
            {showSavePromptFor.length > 0 && (
              <SavePromptModal
                handle_save_endpoint={props.handle_save_endpoint}
                handle_save_page={props.handle_save_page}
                show
                onHide={() => closeSavePrompt()}
                onConfirm={handleOnConfirm}
                tab_id={showSavePromptFor[0]}
              />
            )}
          </div>
          {tabsOrder.map((tabId) => (
            <div
              className=''
              key={tabId}
              ref={(newRef) => {
                scrollRef.current[tabId] = newRef
              }}
            >
              <Nav.Item
                key={tabId}
                draggable
                onDragOver={handleOnDragOver}
                onDragStart={() => onDragStart(tabId)}
                onDrop={(e) => onDrop(e, tabId)}
                className={tabs?.activeTabId === tabId ? 'active' : 'text-black-50'}
                onMouseEnter={() => {
                  setShowPreview(true)
                  setPreviewId(tabId)
                }}
                onMouseLeave={() => {
                  setShowPreview(false)
                  setPreviewId(null)
                }}
              >
                {tabState[tabId]?.isModified ? <i className='fas fa-circle modified-dot-icon' /> : ''}
                <Nav.Link className='p-0 d-flex align-items-center bg-white pr-2' eventKey={tabId}>
                  <button
                    className='btn truncate bg-white pr-0'
                    onClick={() => tabService.selectTab(tabId, { navigate, params })}
                    onDoubleClick={() => {
                      tabService.disablePreviewMode(tabId)
                    }}
                  >
                    <div className={`d-flex ${tabs?.activeTabId === tabId ? 'tab-name' : ''}`} >
                      {renderTabName(tabId)}
                    </div>
                  </button>
                  <button className='close ml-1 rounded' onClick={() => handleCloseTabs([tabId])}>
                    <i className='uil uil-multiply' />
                  </button>
                </Nav.Link>
              </Nav.Item>
            </div>
          ))}
        </Nav>
        {/* {showScrollButton() ? (
          <div
            className={`scroll-button scroll-button--right d-flex ${rightHideTabs() ? '' : 'disabled'}`}
            onMouseEnter={() => handleMouseEnter('right')}
            onMouseLeave={() => handleMouseLeave()}
          >
            <span className='mr-1'>{rightHideTabs() ? `+${rightHideTabs()}` : null}</span>
            <span>
              <i className='fa fa-angle-right' aria-hidden='true' />
            </span>
          </div>
        ) : null} */}
        <Nav.Item className='tab-buttons newTabs' id='add-new-tab-button'>
          <button className='btn' onClick={() => handleAddTab()}>
            <LuPlus />
          </button>
        </Nav.Item>
        <div className='d-flex'>
          <Nav.Item className='tab-buttons' id='options-tab-button'>
            {
              tabs?.tabsOrder?.length > 1 && (
                <OverlayTrigger placement='bottom' overlay={showTooltips("close-all")}  >
                  <button className='close-all' onClick={handleCloseAllTabs}  >  <VscCloseAll /></button>
                </OverlayTrigger>
              )
            }
          </Nav.Item>
          <Nav.Item className='' id='history-tab-button'>
            {handleHistoryButton()}
          </Nav.Item>
          {showHistoryContainer && (
            <div className='history-main-container bg-white'>
              <div className='heading'>
                History
                <div className='d-flex close-button' onClick={handleHistoryClick} aria-label='Close'>
                  <IconButtons>
                    <GrFormClose />
                  </IconButtons>
                </div>
              </div>
              <History />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CustomTabs
