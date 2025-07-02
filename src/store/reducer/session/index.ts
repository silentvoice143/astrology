import {Message} from './../../../utils/types';
// store/slices/sessionSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ChatSession, SessionState} from '../../../utils/types';
import {
  acceptSessionRequest,
  getQueueRequest,
  sendSessionRequest,
} from './action';

const initialState: SessionState = {
  session: null,
  isLoading: false,
  error: null,
  queueMessage: null,
  userId: '',
  otherUserId: '',
  sessionEnded: true,
  messages: [],
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<ChatSession>) {
      state.session = action.payload;
      state.queueMessage = null;
      state.error = null;
      state.sessionEnded = false;
    },
    setQueueMessage(state, action: PayloadAction<string>) {
      state.queueMessage = action.payload;
    },
    setChatUser(state, action) {
      state.userId = action.payload;
    },
    setOtherUser(state, action: PayloadAction<string>) {
      state.otherUserId = action.payload;
    },
    clearSession(state) {
      state.session = null;
      state.queueMessage = null;
      state.error = null;
      state.otherUserId = '';
      state.userId = '';
      state.sessionEnded = true;
      state.messages = [];
    },
    setSessionError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    setSessionLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    addMessage(state, action: PayloadAction<any>) {
      state.messages.push(action.payload);
    },
  },
  extraReducers: builder => {
    builder.addCase(sendSessionRequest.fulfilled, state => {});
    builder.addCase(getQueueRequest.fulfilled, state => {});
    builder.addCase(acceptSessionRequest.fulfilled, state => {});
  },
});

export const {
  setSession,
  setQueueMessage,
  clearSession,
  setSessionError,
  setSessionLoading,
  setChatUser,
  setOtherUser,
  addMessage,
} = sessionSlice.actions;

export {sendSessionRequest, getQueueRequest};

export default sessionSlice.reducer;
