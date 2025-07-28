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
  deleteSessionRequest,
  getCallHistory,
  getChatHistory,
  getChatMessages,
  getQueueRequest,
  sendCallRequest,
  sendSessionRequest,
  skipSessionRequest,
} from './action';

const initialState: SessionState = {
  activeSession: null,
  session: null,
  callSession: null,
  user: null,
  otherUser: null,
  sessionEnded: true,
  messages: [],
  queueRequestCount: 0,
  countRefresh: true,
  sessionRequest: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<ChatSession>) {
      state.session = action.payload;
    },
    setActiveSession(state, action: PayloadAction<ChatSession>) {
      state.activeSession = action.payload;
    },
    setCallSession(state, action: PayloadAction<CallSession>) {
      state.callSession = action.payload;
    },
    setRequest(state, action) {
      console.log(action.payload, '----paylaod coming');
      state.sessionRequest = action.payload;
    },

    clearActiveSession(state) {
      state.activeSession = null;
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
    incrementQueueRequest: state => {
      state.queueRequestCount += 1;
    },
    clearQueueRequestCount: state => {
      state.queueRequestCount = 0;
    },
    setQueueCount: (state, action) => {
      state.queueRequestCount = action.payload;
    },
    toggleCountRefresh: state => {
      state.countRefresh = !state.countRefresh;
    },
  },
  extraReducers: builder => {
    builder.addCase(sendSessionRequest.fulfilled, state => {});
    builder.addCase(sendCallRequest.fulfilled, state => {});
    builder.addCase(getQueueRequest.fulfilled, state => {});
    builder.addCase(acceptSessionRequest.fulfilled, state => {});
    builder.addCase(skipSessionRequest.fulfilled, state => {});
    builder.addCase(getChatHistory.fulfilled, state => {});
    builder.addCase(getCallHistory.fulfilled, state => {});
    builder.addCase(getChatMessages.fulfilled, state => {});
    builder.addCase(deleteSessionRequest.fulfilled, state => {});
    builder.addCase(acceptCallRequest.fulfilled, state => {});
  },
});

export const {
  setSession,
  clearSession,
  setRequest,
  clearActiveSession,
  setChatUser,
  setOtherUser,
  addMessage,
  prependMessages,
  setCallSession,
  clearCallSession,
  setMessage,
  setQueueCount,
  incrementQueueRequest,
  clearQueueRequestCount,
  toggleCountRefresh,
  setActiveSession,
} = sessionSlice.actions;

export {
  sendSessionRequest,
  skipSessionRequest,
  getQueueRequest,
  getChatHistory,
  getCallHistory,
  acceptSessionRequest,
  getChatMessages,
  sendCallRequest,
  acceptCallRequest,
  deleteSessionRequest,
};

export default sessionSlice.reducer;
