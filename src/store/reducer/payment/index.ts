// store/slices/kundliSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getTransactionHistory, getWithdrawalRequest, postTopUp } from './action';

const initialState = {};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getTransactionHistory.fulfilled, state => { });
    builder.addCase(getWithdrawalRequest.fulfilled, state => { });
    builder.addCase(postTopUp.fulfilled, state => { });
  },
});

// export const {setKundliPerson, resetToDefaultUser, setDefaultUser} =
//   kundliSlice.actions;
export { getTransactionHistory, getWithdrawalRequest, postTopUp };
export default paymentSlice.reducer;
