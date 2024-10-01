"use client";
import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import shortid from 'shortid';
import { SESSION_STORAGE_KEY, getOrgId, isElectron, isOnPublishedPage, isTechdocOwnDomain } from './components/common/utility';
import LoginV2 from './components/auth/loginV2';
import Logout from './components/auth/logout';
import MainV2 from './components/main/MainV2';
import Public from './components/publicEndpoint/publicEndpoint.jsx';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ERROR_403_PAGE, ERROR_404_PAGE } from './components/errorPages';
import ProtectedRouteV2 from './components/common/protectedRouteV2';
import AuthServiceV2 from './components/auth/authServiceV2';
import InviteTeam from './components/main/inviteTeam/inviteTeam';
import { installModal } from './components/modals/redux/modalsActions';
import { initConn, resetConn } from './services/webSocket/webSocketService.js';
import OauthPage from './components/OauthPage/OauthPage.jsx';
import TrashPage from './components/main/Trash/trashPage.jsx';
import OnBoarding from './components/onBoard/onBoarding.jsx';
import IndexWebsite from './components/indexWebsite/indexWebsite.jsx';
import Redirections from './components/collections/Redirections.jsx';
import RunAutomation from './components/collections/runAutomation/runAutomation.jsx';
import NavigationSetter from './history.js';
import EditRuns from './components/collections/showRuns/editRuns.jsx';
import { MdClose } from 'react-icons/md';
import IconButton from './components/common/iconButton.jsx';
import './index.scss';

const App = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const scriptId = "chatbot-main-script";
    const chatbot_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiI1OTgyIiwiY2hhdGJvdF9pZCI6IjY2NTQ3OWE4YmQ1MDQxYWU5M2ZjZDNjNSIsInVzZXJfaWQiOiIxMjQifQ.aI4h6OmkVvQP5dyiSNdtKpA4Z1TVNdlKjAe5D8XCrew";
    const scriptSrc = "https://chatbot-embed.viasocket.com/chatbot-prod.js";
    if (chatbot_token && !document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.setAttribute("embedToken", chatbot_token);
      script.id = scriptId;
      document.head.appendChild(script);
      script.src = scriptSrc;
    }

    const currentOrgId = getOrgId() ?? window.location.pathname.split('/')?.[2];
    if (currentOrgId && !isOnPublishedPage()) {
      initConn(currentOrgId);
    }
    sessionStorage.setItem(SESSION_STORAGE_KEY.UNIQUE_TAB_ID, shortid.generate());

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      dispatch(installModal(e));
    });

    return () => {
      resetConn(getOrgId());
    };
  }, []);

  useEffect(() => {
    const scriptId = "chatbot-main-script";
    const chatbot_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdfaWQiOiI1OTgyIiwiY2hhdGJvdF9pZCI6IjY2NTQ3OWE4YmQ1MDQxYWU5M2ZjZDNjNSIsInVzZXJfaWQiOiIxMjQifQ.aI4h6OmkVvQP5dyiSNdtKpA4Z1TVNdlKjAe5D8XCrew";
    const scriptSrc = "https://chatbot-embed.viasocket.com/chatbot-prod.js";
    if (chatbot_token && !document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.setAttribute("embedToken", chatbot_token);
      script.id = scriptId;
      document.head.appendChild(script);
      script.src = scriptSrc;
    }
  }, []);

  useEffect(() => {
    if (isElectron()) {
      const { ipcRenderer } = window.require('electron');
      ipcRenderer.on('token-transfer-channel', (event, data) => {
        navigate('/login', { search: `?sokt-auth-token=${data}` });
      });
    }
  }, [navigate]);

  const renderApp = () => {
    if (!isElectron() && !isTechdocOwnDomain()) {
      return (
        <Routes>
          <Route path='*' element={<Public />} />
        </Routes>
      );
    }
    return (
      <>
        <ToastContainer
          position='bottom-left'
          autoClose={1500}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme='dark'
          transition={Slide}
          toastClassName='custom-class'
          closeButton={<IconButton variant='sm'><MdClose size={18} /></IconButton>}
        />
        <NavigationSetter />
        <Routes>
          <Route exact path='/' element={<IndexWebsite />} />
          <Route exact path='/login' element={<LoginV2 />} />
          <Route path='/logout' element={<Logout />} />
          <Route path='/proxy/auth' element={<AuthServiceV2 />} />
          <Route path='orgs/:orgId/dashboard/collection/:collectionId/runner' element={<RunAutomation />} />
          <Route path='/orgs/:orgId/dashboard/collection/:collectionId/cron/:cronId/edit' element={<EditRuns />} />
          <Route path='/404_PAGE' element={<ERROR_404_PAGE />} />
          <Route path='/403_PAGE' element={<ERROR_403_PAGE />} />
          <Route path='/auth/redirect' element={<OauthPage />} />

          <Route element={<ProtectedRouteV2 />}>
            <Route path='/orgs/:orgId/dashboard/' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/endpoint/:endpointId' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/endpoint/:endpointId/edit' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/collection/:collectionId/settings' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/collection/:collectionId/feedback' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/collection/:collectionId/runs' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/collection/:collectionId/runs/:runId' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/page/:pageId' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/page/:pageId/edit' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/history/:historyId' element={<MainV2 />} />
            <Route path='/orgs/:orgId/dashboard/history/:historyId/edit' element={<MainV2 />} />
            <Route path='/orgs/:orgId/trash' element={<TrashPage />} />
            <Route path='/orgs/:orgId/dashboard/collection/:collectionId/redirections' element={<Redirections />} />
            <Route path='/onBoarding' element={<OnBoarding />} />
          </Route>

          <Route path='/orgs/:orgId/invite' element={<InviteTeam />} />

          <Route path='/dashboard/' element={<MainV2 />} />

          <Route path='/p/*' element={<Public />} />
        </Routes>
      </>
    );
  };

  return renderApp();
};

export default App;