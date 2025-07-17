import {
  Astrologers,
  Message,
  OtherUserType,
  UserDetail,
} from './../../../utils/types';
// store/slices/sessionSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface SettingState {
  language: string;
}

const initialState: SettingState = {
  language: 'en',
};

const settingSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setLanguage(state, action) {
      state.language = action.payload;
    },
  },
  extraReducers: builder => {
    // builder.addCase(sendSessionRequest.fulfilled, state => {});
  },
});

export const {setLanguage} = settingSlice.actions;

export default settingSlice.reducer;
