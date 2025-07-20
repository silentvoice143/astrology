import {
  Astrologers,
  CallSession,
  Message,
  OtherUserType,
  UserDetail,
} from './../../../utils/types';
// store/slices/sessionSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ChatSession, SessionState} from '../../../utils/types';
import {
  acceptCallRequest,
  acceptSessionRequest,
  getChatHistory,
  getChatMessages,
  getQueueRequest,
  sendCallRequest,
  sendSessionRequest,
} from './action';

const initialState: SessionState = {
  session: null,
  callSession: null,
  user: null,
  otherUser: null,
  sessionEnded: true,
  messages: [],
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<ChatSession>) {
      state.session = action.payload;
    },

    setCallSession(state, action: PayloadAction<CallSession>) {
      state.callSession = action.payload;
    },

    setChatUser(state, action) {
      state.user = action.payload;
    },
    setOtherUser(state, action: PayloadAction<UserDetail | null>) {
      state.otherUser = action.payload;
    },
    clearSession(state) {
      state.session = null;
      state.messages = [];
    },

    setMessage(state, action) {
      state.messages = action.payload;
    },

    addMessage(state, action: PayloadAction<any>) {
      state.messages = [action.payload, ...state.messages];
    },
    prependMessages(state, action: PayloadAction<Message[]>) {
      state.messages = [...state.messages, ...action.payload]; // older messages at the start
    },
    clearCallSession(state) {
      state.callSession = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(sendSessionRequest.fulfilled, state => {});
    builder.addCase(sendCallRequest.fulfilled, state => {});
    builder.addCase(getQueueRequest.fulfilled, state => {});
    builder.addCase(acceptSessionRequest.fulfilled, state => {});
    builder.addCase(getChatHistory.fulfilled, state => {});
    builder.addCase(getChatMessages.fulfilled, state => {});
    builder.addCase(acceptCallRequest.fulfilled, state => {});
  },
});

export const {
  setSession,
  clearSession,
  setChatUser,
  setOtherUser,
  addMessage,
  prependMessages,
  setMessage, setCallSession ,clearCallSession
} = sessionSlice.actions;

export {
  sendSessionRequest,
  getQueueRequest,
  getChatHistory,
  acceptSessionRequest,
  getChatMessages,
  sendCallRequest,
  acceptCallRequest,
};

export default sessionSlice.reducer;
