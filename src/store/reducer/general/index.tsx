// store/slices/kundliSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {getBanner, uploadImage} from './action';

const initialState = {};

const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(uploadImage.fulfilled, state => {});
    builder.addCase(getBanner.fulfilled, state => {});
  },
});

// export const {setKundliPerson, resetToDefaultUser, setDefaultUser} =
//   kundliSlice.actions;
export {uploadImage, getBanner};
export default generalSlice.reducer;
