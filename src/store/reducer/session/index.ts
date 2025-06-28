// store/slices/sessionSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ChatSession, SessionState} from '../../../utils/types';
import {sendSessionRequest} from './action';

const initialState: SessionState = {
  session: null,
  isLoading: false,
  error: null,
  queueMessage: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession(state, action: PayloadAction<ChatSession>) {
      state.session = action.payload;
      state.queueMessage = null;
      state.error = null;
    },
    setQueueMessage(state, action: PayloadAction<string>) {
      state.queueMessage = action.payload;
    },
    clearSession(state) {
      state.session = null;
      state.queueMessage = null;
      state.error = null;
    },
    setSessionError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    setSessionLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(sendSessionRequest.fulfilled, state => {});
  },
});

export const {
  setSession,
  setQueueMessage,
  clearSession,
  setSessionError,
  setSessionLoading,
} = sessionSlice.actions;

export {sendSessionRequest};

export default sessionSlice.reducer;
