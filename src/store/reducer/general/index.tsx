// store/slices/kundliSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {getBanner, uploadImage, getTopBanner} from './action';

const initialState = {};

const generalSlice = createSlice({
  name: 'general',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(uploadImage.fulfilled, state => {});
    builder.addCase(getBanner.fulfilled, state => {});
    builder.addCase(getTopBanner.fulfilled, state => {});
  },
});

// export const {setKundliPerson, resetToDefaultUser, setDefaultUser} =
//   kundliSlice.actions;
export {uploadImage, getBanner, getTopBanner};
export default generalSlice.reducer;
