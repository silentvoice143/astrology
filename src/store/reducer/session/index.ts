import {
  Astrologers,
  Message,
  OtherUserType,
  UserDetail,
} from './../../../utils/types';
// store/slices/sessionSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ChatSession, SessionState} from '../../../utils/types';
import {
  acceptSessionRequest,
  getChatHistory,
  getChatMessages,
  getQueueRequest,
  sendSessionRequest,
} from './action';

const initialState: SessionState = {
  session: null,
  user: null,
  otherUser: null,
  sessionEnded: true,
  messages: [],
  queueRequestCount: 0,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<ChatSession>) {
      state.session = action.payload;
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
    incrementQueueRequest: state => {
      state.queueRequestCount += 1;
    },
    clearQueueRequestCount: state => {
      state.queueRequestCount = 0;
    },
    setQueueCount: (state, action) => {
      state.queueRequestCount = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(sendSessionRequest.fulfilled, state => {});
    builder.addCase(getQueueRequest.fulfilled, state => {});
    builder.addCase(acceptSessionRequest.fulfilled, state => {});
    builder.addCase(getChatHistory.fulfilled, state => {});
    builder.addCase(getChatMessages.fulfilled, state => {});
  },
});

export const {
  setSession,
  clearSession,
  setChatUser,
  setOtherUser,
  addMessage,
  prependMessages,
  setMessage,
  setQueueCount,
  incrementQueueRequest,
  clearQueueRequestCount,
} = sessionSlice.actions;

export {
  sendSessionRequest,
  getQueueRequest,
  getChatHistory,
  acceptSessionRequest,
  getChatMessages,
};

export default sessionSlice.reducer;
