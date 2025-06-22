// src/store/rootReducer.ts
import {combineReducers} from '@reduxjs/toolkit';
import authReducer from './reducer/auth';
import userReducer from './reducer/user';
import kundliReducer from './reducer/kundli';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  kundli: kundliReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
