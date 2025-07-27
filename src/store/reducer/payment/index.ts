// store/slices/kundliSlice.ts

import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {getTransactionHistory} from './action';

const initialState = {};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getTransactionHistory.fulfilled, state => {});
  },
});

// export const {setKundliPerson, resetToDefaultUser, setDefaultUser} =
//   kundliSlice.actions;
export {getTransactionHistory};
export default paymentSlice.reducer;
