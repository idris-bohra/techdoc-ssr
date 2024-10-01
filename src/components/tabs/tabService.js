import { store } from '../../store/store'
import {
  addNewTab,
  closeAllTabs,
  closeTab,
  replaceTabForUntitled,
  setActiveTabId,
  updateTab,
  updateTabDraft
} from '../tabs/redux/tabsActions'
import tabStatusTypes from './tabStatusTypes'
import { getCurrentUser } from '../auth/authServiceV2'
import { getOrgId } from '../common/utility'

function newTab() {
  store.dispatch(addNewTab())
}

function removeTab(tabId, props) {
  const { tabs, tabsOrder, activeTabId } = store.getState().tabs
  if (tabs[tabId]) {
    if (activeTabId === tabId) {
      const tabsCount = Object.keys(tabs).length
      if (tabsCount === 1) {
        newTab()
      } else {
        const index = tabsOrder.indexOf(tabId)
        if (index > 0) {
          selectTab(tabsOrder[index - 1], props)
        } else {
          selectTab(tabsOrder[index + 1], props)
        }
      }
    }
    store.dispatch(closeTab(tabId))
    if (localStorage.getItem(tabId)) {
      localStorage.removeItem(tabId)
    }
  }
}

function removeAllTabs(props) {
  store.dispatch(closeAllTabs())
  newTab(props)
}

function selectTab(tabId, props) {
  const { tabs } = store.getState().tabs;
  const tab = tabs[tabId];
  let navigatePath = `/orgs/${getOrgId()}/dashboard/endpoint/new`;

  if (tab?.type && tab?.id) {
    switch (tab?.type) {
      case 'NEW':
        navigatePath = `/orgs/${props.params.orgId}/dashboard/${tab?.type}/new`;
        break;
      case 'collection':
        const pageTypePath = {
          'SETTINGS': `/orgs/${props.params.orgId}/dashboard/collection/${tab?.id}/settings`,
          'RUNS': `/orgs/${props.params.orgId}/dashboard/collection/${tab?.id}/runs`,
          'FEEDBACK': `/orgs/${props.params.orgId}/dashboard/collection/${tab?.id}/feedback`
        };
        navigatePath = tab?.state?.pageType ? pageTypePath[tab?.state?.pageType] : navigatePath;
        break;
      case 'manual-runs':
        navigatePath = `/orgs/${props.params.orgId}/dashboard/collection/${tab?.state?.collectionId}/runs/${tab?.id}`;
        break;
      default:
        navigatePath = `/orgs/${props?.params?.orgId}/dashboard/${tab?.type}/${tab?.id}${tab?.isModified ? '/edit' : ''}`;
    }
  }
  props.navigate(navigatePath);
  store.dispatch(setActiveTabId(tabId));
}

function disablePreviewMode(tabId) {
  store.dispatch(updateTab(tabId, { previewMode: false }))
}

function markTabAsModified(tabId) {
  if (getCurrentUser()) {
    const tab = store.getState().tabs.tabs[tabId]
    if (!tab.isModified) {
      store.dispatch(updateTab(tabId, { previewMode: false, isModified: true }))
    }
  }
}

function unmarkTabAsModified(tabId) {
  if (getCurrentUser()) {
    const tab = store.getState().tabs.tabs[tabId]
    if (tab.isModified) {
      store.dispatch(updateTab(tabId, { previewMode: false, isModified: false }))
    }
  }
}

function markTabAsSaved(tabId) {
  store.dispatch(updateTab(tabId, { status: tabStatusTypes.SAVED, isModified: false }))
}

function markTabAsDeleted(tabId) {
  store.dispatch(updateTab(tabId, { status: tabStatusTypes.DELETED }))
}

function replaceTabWithNew(newTabId) {
  store.dispatch(replaceTabForUntitled(newTabId))
}

function updateDraftData(pageId, data) {
  store.dispatch(updateTabDraft(pageId, data))
}

export default {
  newTab,
  removeTab,
  removeAllTabs,
  selectTab,
  disablePreviewMode,
  markTabAsModified,
  unmarkTabAsModified,
  markTabAsSaved,
  markTabAsDeleted,
  replaceTabWithNew,
  updateDraftData
}
