// src/store/rootReducer.ts
import {combineReducers} from '@reduxjs/toolkit';
import authReducer from './reducer/auth';
import userReducer from './reducer/user';
import kundliReducer from './reducer/kundli';
import sessionReducer from './reducer/session';
import settingReducer from './reducer/settings';
import generalReducer from './reducer/general';
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  kundli: kundliReducer,
  session: sessionReducer,
  setting: settingReducer,
  general: generalReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
