import tabsActionTypes from './tabsActionTypes'
import bulkPublishActionTypes from '../../publishSidebar/redux/bulkPublishActionTypes'

const initialState = {
  tabs: {},
  loaded: false,
  activeTabId: null,
  tabsOrder: []
}

function tabsReducer(state = initialState, action) {
  let tabs = {}
  switch (action.type) {
    case tabsActionTypes.ADD_NEW_TAB:
      tabs = {
        ...state,
        tabs: { ...state.tabs, [action.newTab.id]: action.newTab },
        tabsOrder: [...state.tabsOrder, action.newTab.id]
      }

      return tabs

    case tabsActionTypes.OPEN_IN_NEW_TAB:
      tabs = {}
      tabs.loaded = state.loaded
      tabs.tabs = { ...state.tabs, [action.tab.id]: action.tab }
      tabs.tabsOrder = state.tabsOrder.includes(action.tab.id) ? [...state.tabsOrder] : [...state.tabsOrder, action.tab.id]
      return tabs

    case tabsActionTypes.CLOSE_TAB:
      tabs = {
        ...state
      }
      delete tabs.tabs[action.tabId]
      tabs.tabsOrder = tabs.tabsOrder.filter((t) => t !== action.tabId)
      return { ...tabs }

    case tabsActionTypes.UPDATE_TAB:
      tabs = {
        ...state
      }
      tabs.tabs[action.payload.tabId] = {
        ...tabs.tabs[action.payload.tabId],
        ...action.payload.data
      }
      return tabs

    case tabsActionTypes.UPDATE_TAB_DRAFT:
      tabs = { ...state }
      tabs.tabs[action.payload.tabId].draft = action?.payload?.draft
      return tabs

    case tabsActionTypes.SET_ACTIVE_TAB_ID:
      tabs = { ...state, activeTabId: action.tabId }
      return tabs

    case tabsActionTypes.FETCH_TABS_FROM_REDUX:
      tabs = {
        tabs: { ...state.tabs, ...action.tabsList },
        loaded: true,
        tabsOrder: [...state.tabsOrder],
        activeTabId: action.tabsMetadata.activeTabId ? action.tabsMetadata.activeTabId : state.activeTabId
      }
      action.tabsMetadata.tabsOrder.forEach((t) => {
        if (!tabs.tabsOrder.includes(t)) {
          tabs.tabsOrder.push(t)
        }
      })
      return tabs

    case tabsActionTypes.REPLACE_TAB: {
      tabs = {...state}
      delete tabs.tabs[action.oldTabId]
      tabs.tabs[action.newTab.id] = { ...action.newTab }
      const index = tabs.tabsOrder.findIndex((t) => t === action.oldTabId)
      tabs.tabsOrder[index] = action.newTab.id
      return tabs
    }

    case tabsActionTypes.CLOSE_ALL_TABS:
      return initialState

    case tabsActionTypes.SET_TABS_ORDER:
      tabs = { ...state, tabsOrder: action.tabsOrder }
      return tabs

    case tabsActionTypes.REPLACE_TAB_ID:
      const data = {
        id: action.payload.newTabId,
        type: 'endpoint',
        status: 'SAVED',
        previewMode: true,
        isModified: false,
        state: {}
      }
      const newTabs = state.tabs
      newTabs[action.payload?.newTabId] = data
      delete newTabs[action.payload.currentActiveTabId]
      const newOrder = state.tabsOrder.map((item) => {
        if (item === action.payload.currentActiveTabId) return action.payload.newTabId
        else return item
      })
      tabs = { ...state, tabsOrder: newOrder, activeTabId: action.payload.newTabId, tabs: newTabs }
      return tabs

    case tabsActionTypes.UPDATE_PRE_POST_SCRIPT:
      tabs = { ...state }
      tabs.tabs[action.payload.tabId].postScriptExecutedData = action.payload?.executedData?.postScriptExecution || ''
      tabs.tabs[action.payload.tabId].preScriptExecutedData = action.payload?.executedData?.preScriptExecution || ''
      return tabs

    case bulkPublishActionTypes.ON_BULK_PUBLISH_TABS:
      return { ...action.data }

    case tabsActionTypes.SET_INTROSPECTION_SCHEMA:
      tabs = { ...state }
      tabs.tabs[action.payload.tabId].introspectionSchemaData = action.payload?.schemaData || null
      return tabs

    case tabsActionTypes.SET_PAGE_TYPE: {
      const { tabId, pageType } = action.payload;
      return {
        ...state,
        tabs: {
          ...state.tabs,
          [tabId]: {
            ...state.tabs[tabId],
            state: {
              ...state.tabs[tabId].state,
              pageType,
            },
          },
        },
      };
    }

    case tabsActionTypes.FETCH_PAGE_CONTENT_SUCCESS:
      tabs = { ...state }
      tabs.tabs[action.payload.id] = {
        ...tabs.tabs[action.payload.id],
        draft: action.payload.data
      }
      return tabs

    case tabsActionTypes.UPDATE_DRAFT_CONTENT:
      tabs = { ...state }
      tabs.tabs[action.payload.id] = {
        ...tabs.tabs[action.payload.id],
        draft: action.payload.data
      }
      return tabs;

    case tabsActionTypes.UPDATE_NEW_TAB_NAME:
      tabs = { ...state }
      tabs.tabs[action.payload.id] = {
        ...tabs.tabs[action.payload.id],
        name: action.payload.name
      }
      return tabs

    case tabsActionTypes.DELETE_TAB_NAME:
      tabs = { ...state }
      delete tabs.tabs[action.payload.id].name
      return tabs

    case tabsActionTypes.SET_TAB_MODIFIED:
      tabs = { ...state }
      tabs.tabs[action.payload.id].isModified = action.payload.flag
      return tabs

    default:
      return state
  }
}

export default tabsReducer
