// src/store/rootReducer.ts
import {combineReducers} from '@reduxjs/toolkit';
import authReducer from './reducer/auth';
import userReducer from './reducer/user';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
