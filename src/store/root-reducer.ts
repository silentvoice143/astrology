// src/store/rootReducer.ts
import {combineReducers} from '@reduxjs/toolkit';
import authReducer from './reducer/auth';
import userReducer from './reducer/user';
import kundliReducer from './reducer/kundli';
import sessionReducer from './reducer/session';
import settingReducer from './reducer/settings';
import generalReducer from './reducer/general';
import horoscopeReducer from './reducer/horoscope';
const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  kundli: kundliReducer,
  session: sessionReducer,
  setting: settingReducer,
  general: generalReducer,
  horoscope: horoscopeReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
