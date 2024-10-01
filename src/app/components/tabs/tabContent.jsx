import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useQueryClient } from 'react-query';
import { Tab } from 'react-bootstrap';
import DisplayEndpoint from '../endpoints/displayEndpoint';
import { getCurrentUser } from '../auth/authServiceV2';
import { updateContent } from '../pages/redux/pagesActions';
import CollectionTabs from '../collections/collectionTabs';
import ManualRuns from '../collections/showRuns/manualRuns';
import Page from '../../pages/page/page';

const TabContent = ({ handle_save_endpoint, handle_save_page, save_endpoint_flag, save_page_flag, selected_tab_id }) => {
  const queryClient = useQueryClient();

  const { isTabsLoaded, tabData, history, pages, activeTabId } = useSelector((state) => ({
    isTabsLoaded: state?.tabs?.loaded,
    tabsOrder: state?.tabs?.tabsOrder,
    activeTabId: state?.tabs?.activeTabId,
    tabData: state?.tabs?.tabs,
    history: state?.history,
    pages: state?.pages
  }));

  const deleteFromReactQueryByKey = (id) => {
    queryClient.removeQueries(['pageContent', id]);
  };

  const renderContent = (tabId) => {
    const tab = tabData?.[tabId];
    if (save_page_flag && tabId === selected_tab_id) {
      handle_save_page(false)
      updateContent({
        pageData: { id: tabId, contents: tab.draft, state: pages?.[tabId]?.state, name: pages?.[tabId]?.name },
        id: tabId,
      });
      deleteFromReactQueryByKey(tabId);
    }
    switch (tab?.type) {
      case 'history':
        return (
          <DisplayEndpoint
            handle_save_endpoint={handle_save_endpoint}
            save_endpoint_flag={save_endpoint_flag}
            selected_tab_id={selected_tab_id}
            environment={{}}
            tab={tab}
            historySnapshotFlag
            historySnapshot={history[tab.id]}
          />
        );
      case 'endpoint':
        return <DisplayEndpoint
          handle_save_endpoint={handle_save_endpoint}
          save_endpoint_flag={save_endpoint_flag}
          selected_tab_id={selected_tab_id}
          environment={{}} tab={tab} />;
      case 'page':
        // if (window.location.pathname.includes('/edit')) return <EditPage
        //   handle_save_page={handle_save_page}
        //   save_page_flag={save_page_flag}
        //   tab={tab}
        // />;

        // else return <DisplayPage
        //   handle_save_page={handle_save_page}
        //   save_page_flag={save_page_flag}
        //   handle_save_endpoint={handle_save_endpoint}
        //   save_endpoint_flag={save_endpoint_flag}
        //   selected_tab_id={selected_tab_id}
        //   tab={tab} />;

        return <Page />

      case 'collection':
        const pathSection = window.location.pathname.split('/')[6];
        let activeTab = '';
        switch (pathSection) {
          case 'settings':
            activeTab = 'settings';
            break;
          case 'runs':
            activeTab = 'runs';
            break;
          case 'feedback':
            activeTab = 'feedback';
            break;
          default:
            activeTab = 'settings';
            break;
        }
        return (
          <CollectionTabs
            collectionId={tabId}
            activeTab={activeTab}
            onHide={() => { }}
          />
        );
        case 'manual-runs':
          return <ManualRuns/>
            
      default:
        break;
    }
  };


  const memoizedContent = useMemo(() => {
    if (!getCurrentUser() || !isTabsLoaded) {
      return (
        <DisplayEndpoint
          handle_save_endpoint={handle_save_endpoint}
          save_endpoint_flag={save_endpoint_flag}
          selected_tab_id={selected_tab_id}
          environment={{}}
          tab=''
        />
      );
    }

    return renderContent(activeTabId)
  }, [getCurrentUser(), isTabsLoaded, tabData, save_endpoint_flag, save_page_flag, selected_tab_id, activeTabId]);

  return (
    <Tab.Content>
      <Tab.Pane eventKey={activeTabId} active>
        {memoizedContent}
      </Tab.Pane>
    </Tab.Content>
  );
};

export default React.memo(TabContent)