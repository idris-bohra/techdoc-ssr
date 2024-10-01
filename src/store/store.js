import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import {thunk} from 'redux-thunk'
import collectionsReducer from '../components/collections/redux/collectionsReducer'
import environmentsReducer from '../components/environments/redux/environmentsReducer'
import tabsReducer from '../components/tabs/redux/tabsReducer'
import pagesReducer from '../components/pages/redux/pagesReducer'
import cookiesReducer from '../components/cookies/redux/cookiesReducer'
import modalsReducer from '../components/modals/redux/modalsReducer'
import historyReducer from '../components/history/redux/historyReducer'
import toggleResponseReducer from '../components/common/redux/toggleResponse/toggleResponseReducer'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import clientDataReducer from './clientData/clientDataReducer'
import tokenDataReducer from './tokenData/tokenDataReducers'
import userReducer from '../components/auth/redux/usersRedux/userReducer'
import organizationReducer from '../components/auth/redux/organizationRedux/organizationReducer'
import automationReducer from '../components/collections/runAutomation/redux/runAutomationReducer'
import createNewPublicEnvReducer from '../components/publishDocs/redux/publicEnvReducer'
import { create } from 'joi-browser'

const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const rootReducer = combineReducers({
  collections: collectionsReducer,
  pages: pagesReducer,
  environment: environmentsReducer,
  tabs: tabsReducer,
  history: historyReducer,
  cookies: cookiesReducer,
  modals: modalsReducer,
  responseView: toggleResponseReducer,
  clientData: clientDataReducer,
  tokenData: tokenDataReducer,
  users: userReducer,
  organizations : organizationReducer,
  automation : automationReducer,
  publicEnv : createNewPublicEnvReducer
})

const persistConfig = {
  key: 'root',
  storage
}

const persistedReducer = persistReducer(persistConfig, rootReducer)
const store = createStore(persistedReducer, storeEnhancers(applyMiddleware(thunk)))
const persistor = persistStore(store)

export { store, persistor }