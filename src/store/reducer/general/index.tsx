// store/slices/kundliSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {uploadImage} from './action';

const initialState = {};

const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(uploadImage.fulfilled, state => {});
  },
});

// export const {setKundliPerson, resetToDefaultUser, setDefaultUser} =
//   kundliSlice.actions;
export {uploadImage};
export default generalSlice.reducer;
