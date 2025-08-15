import {
  Astrologers,
  Message,
  OtherUserType,
  UserDetail,
} from './../../../utils/types';
// store/slices/sessionSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {passwordReset} from './action';

interface SettingState {
  language: string;
}

const initialState: SettingState = {
  language: 'bn',
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
    builder.addCase(passwordReset.fulfilled, state => {});
  },
});

export const {setLanguage} = settingSlice.actions;

export {passwordReset};

export default settingSlice.reducer;
